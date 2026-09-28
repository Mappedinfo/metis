import fs from 'node:fs';
import path from 'node:path';
import { parseDocument } from 'yaml';
import { buildSkillRecords } from 'metis-atlas/lib/scan.js';
import { buildGraph } from 'metis-atlas/lib/relate.js';
import { analyzeGraph } from 'metis-atlas/lib/analyze.js';

// This file is the controlled vocabulary's only machine-readable source.
export const contract = JSON.parse(fs.readFileSync(new URL('../../skill-contract.json', import.meta.url), 'utf8'));

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const USE = /^(?:profiles\/)?[a-z0-9]+(?:-[a-z0-9]+)*$/;
const mapping = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonempty = (value) => typeof value === 'string' && value.trim().length > 0;
const inside = (root, candidate) => candidate === root || candidate.startsWith(root + path.sep);

/** Audit declarations and build an Atlas graph; never infer artifact quality. */
export function checkSkills({ root, domain } = {}) {
  const absoluteRoot = path.resolve(root || process.cwd());
  const diagnostics = [];
  const add = (code, file, message, field, severity = 'error') => diagnostics.push({
    severity, code, file: path.relative(absoluteRoot, file).split(path.sep).join('/') || '.',
    ...(field ? { field } : {}), message,
  });
  const warn = (code, file, message) => add(code, file, message, undefined, 'warning');
  const found = [];
  const profiles = [];
  let canonicalRoot;
  try {
    canonicalRoot = fs.realpathSync(absoluteRoot);
    if (!fs.statSync(canonicalRoot).isDirectory()) throw new Error('Root must be a directory.');
  } catch (error) {
    add('ROOT_UNREADABLE', absoluteRoot, error.message);
  }

  if (domain && !contract.domains.includes(domain)) {
    add('INVALID_DOMAIN_FILTER', absoluteRoot, `Unknown domain filter: ${domain}`, 'domain');
  }

  // Reject all discovered symlinks before reading them. The Atlas scan module's
  // record builder also ignores symlink entries when collecting file statistics.
  // Do not follow a link just to decide whether its destination is safe.
  function rejectLink(file) {
    let target;
    try { target = path.resolve(path.dirname(file), fs.readlinkSync(file)); } catch { /* unreadable link */ }
    const outside = target && !inside(absoluteRoot, target);
    add(outside ? 'SYMLINK_OUTSIDE_ROOT' : 'SYMLINK_UNSUPPORTED', file,
      'Symbolic links in scanned skills/profiles are not followed; use regular files within the collection.');
  }

  function readTree(directory, visit, required, recurse = true) {
    let stat;
    try { stat = fs.lstatSync(directory); } catch (error) {
      if (required || error.code !== 'ENOENT') add('DIRECTORY_UNREADABLE', directory, error.message);
      return;
    }
    if (stat.isSymbolicLink()) { rejectLink(directory); return; }
    if (!stat.isDirectory()) { add('NOT_A_DIRECTORY', directory, 'Expected a directory.'); return; }
    let entries;
    try { entries = fs.readdirSync(directory, { withFileTypes: true }); } catch (error) {
      add('DIRECTORY_UNREADABLE', directory, error.message);
      return;
    }
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const full = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) { rejectLink(full); continue; }
      if (entry.isDirectory()) {
        if (recurse && !entry.name.startsWith('.') && !entry.name.startsWith('_') && entry.name !== 'node_modules') {
          readTree(full, visit, true);
        }
      } else if (entry.isFile()) visit(full);
    }
  }

  function read(file) {
    try { return fs.readFileSync(file, 'utf8'); } catch (error) {
      add('FILE_UNREADABLE', file, error.message);
      return null;
    }
  }

  function parseYaml(text, file) {
    try {
      const parsed = parseDocument(text, { uniqueKeys: true });
      if (parsed.errors.length) throw new Error(parsed.errors.map((error) => error.message).join('; '));
      const value = parsed.toJS({ maxAliasCount: 100 });
      if (!mapping(value)) throw new Error('Expected a YAML mapping.');
      // YAML aliases may otherwise create cyclic metadata that prevents every
      // JSON output, including the failure audit, from being written.
      JSON.stringify(value);
      return value;
    } catch (error) {
      add('INVALID_YAML', file, error.message);
      return null;
    }
  }

  function validateList(value, field, vocabulary, file) {
    const limit = contract.limits[field];
    if (!Array.isArray(value) || value.length < limit.min || value.length > limit.max) {
      add('INVALID_TAG_COUNT', file, `${field} must contain ${limit.min}–${limit.max} values.`, field);
      return;
    }
    if (value.some((tag) => typeof tag !== 'string' || !vocabulary.includes(tag))) {
      add('UNKNOWN_TAG', file, `${field} contains a value outside skill-contract.json.`, field);
    }
    if (new Set(value).size !== value.length) add('DUPLICATE_TAG', file, `${field} must not repeat values.`, field);
  }

  if (canonicalRoot) {
    readTree(path.join(absoluteRoot, 'skills'), (file) => {
      if (path.basename(file) !== 'SKILL.md') return;
      const content = read(file);
      if (content === null) return;
      const match = content.replace(/^\uFEFF/, '').match(/^---\s*\r?\n([\s\S]*?)\r?\n---[^\S\r\n]*(?:\r?\n|$)([\s\S]*)$/);
      if (!match) { add('MISSING_FRONTMATTER', file, 'SKILL.md must start with a YAML frontmatter block.'); return; }
      const frontmatter = parseYaml(match[1], file);
      if (!frontmatter) return;
      const skillDir = path.dirname(file);
      const dirName = path.basename(skillDir);
      const validName = typeof frontmatter.name === 'string' && SLUG.test(frontmatter.name);
      if (!validName) add('INVALID_SKILL_NAME', file, 'name must be a lowercase hyphenated slug.', 'name');
      if (!nonempty(frontmatter.description)) add('DESCRIPTION_REQUIRED', file, 'A nonempty description is required.', 'description');
      if (!contract.categories.includes(frontmatter.category)) {
        add('UNKNOWN_CATEGORY', file, 'category must be one of the seven values in skill-contract.json.', 'category');
      }
      validateList(frontmatter.domain, 'domain', contract.domains, file);
      validateList(frontmatter.action, 'action', contract.actions, file);
      if (!Array.isArray(frontmatter.artifacts) || !frontmatter.artifacts.length || !frontmatter.artifacts.every(nonempty)) {
        add('ARTIFACTS_REQUIRED', file, 'artifacts must be a nonempty list of nonempty output declarations; semantic quality is reviewed separately.', 'artifacts');
      }
      if (frontmatter.uses !== undefined && (!Array.isArray(frontmatter.uses) || !frontmatter.uses.every(nonempty))) {
        add('INVALID_USES', file, 'uses must be a list of skill names or profiles/<name>.', 'uses');
      }
      const body = match[2] || '';
      const headingTexts = [...body.matchAll(/^#{2,3}[ \t]+(.+?)[ \t]*$/gm)].map((heading) => heading[1].toLowerCase());
      for (const required of contract.required_sections || []) {
        if (!headingTexts.some((heading) => heading.includes(required.toLowerCase()))) {
          add('SECTION_MISSING', file, `Missing a required section whose heading contains "${required}".`);
        }
      }
      const forbidden = (contract.boundedness?.forbidden_patterns || []).map((pattern) => new RegExp(pattern, 'i'));
      // body starts after '---' + the YAML lines + '---', so file line = offset + body index + 1.
      const bodyLineOffset = match[1].split('\n').length + 2;
      body.split('\n').forEach((line, index) => {
        if (forbidden.some((pattern) => pattern.test(line))) {
          add('UNBOUNDED_LANGUAGE', file, `Line ${bodyLineOffset + index + 1}: bound every loop with a round cap, convergence test or budget: ${line.trim().slice(0, 80)}`);
        }
      });
      const requirementsHeading = body.match(/^#{2,3}[ \t]+.*requirements.*$/im);
      if (requirementsHeading) {
        const sectionStart = requirementsHeading.index + requirementsHeading[0].length;
        const rest = body.slice(sectionStart);
        const sectionEnd = rest.search(/^#{1,3}[ \t]/m);
        const section = sectionEnd === -1 ? rest : rest.slice(0, sectionEnd);
        const sectionFirstLine = bodyLineOffset + body.slice(0, sectionStart).split('\n').length;
        section.split('\n').forEach((line, index) => {
          if (/^\s*(?:[-*]|\d+\.)\s+/.test(line) && !/^\s*(?:[-*]|\d+\.)\s+\[(?:B|A)\]/.test(line)) {
            warn('LEDGER_ITEM_UNLABELED', file, `Line ${sectionFirstLine + index}: Requirements items must start with [B] (blocking) or [A] (advisory) and name a 验证/verification clause.`);
          }
        });
      }
      if (validName) {
        found.push({ label: 'skills', root: absoluteRoot, skillFile: file, skillDir,
          dirName, name: frontmatter.name, frontmatter, body: match[2] });
      }
    }, true);

    readTree(path.join(absoluteRoot, 'profiles'), (file) => {
      if (path.extname(file) !== '.yaml') return;
      const content = read(file);
      if (content === null) return;
      const data = parseYaml(content, file);
      if (!data) return;
      const name = path.basename(file, '.yaml');
      if (!SLUG.test(name) || data.name !== name) {
        add('INVALID_PROFILE_NAME', file, 'A profile name must match its filename and be a lowercase hyphenated slug.', 'name');
        return;
      }
      profiles.push({ id: `profiles:${name}`, name, file, data });
    }, false, false);
  }

  if (!found.length) add('NO_SKILLS', path.join(absoluteRoot, 'skills'), 'No parseable named SKILL.md files found.');
  const namedSkills = new Map();
  for (const skill of found) {
    if (namedSkills.has(skill.name)) add('DUPLICATE_SKILL_NAME', skill.skillFile, `Duplicate skill name: ${skill.name}`, 'name');
    else namedSkills.set(skill.name, skill);
  }
  const namedProfiles = new Map(profiles.map((profile) => [profile.name, profile]));
  const explicit = [];
  for (const skill of found) {
    if (!Array.isArray(skill.frontmatter.uses)) continue;
    for (const reference of skill.frontmatter.uses) {
      if (typeof reference !== 'string' || !USE.test(reference)) {
        add('INVALID_USE_REFERENCE', skill.skillFile, 'Each uses target must be a skill name or profiles/<name>; paths and traversal are forbidden.', 'uses');
        continue;
      }
      const isProfile = reference.startsWith('profiles/');
      const name = isProfile ? reference.slice('profiles/'.length) : reference;
      const target = isProfile ? namedProfiles.get(name) : namedSkills.get(name);
      if (!target) {
        add('UNKNOWN_USE_TARGET', skill.skillFile, `uses target does not exist or is invalid: ${reference}`, 'uses');
      } else if (!isProfile && name === skill.name) {
        add('SELF_DEPENDENCY', skill.skillFile, 'A skill cannot depend on itself.', 'uses');
      } else {
        explicit.push({ source: `skills:${skill.name}`, target: isProfile ? target.id : `skills:${name}`,
          type: 'depends_on', weight: 1, label: 'declares dependency', evidence: ['uses'] });
      }
    }
  }

  // Reuse the published Atlas scanner's record builder with strictly parsed
  // frontmatter, then its graph and metrics implementations. The public CLI's
  // permissive mini-YAML parser is deliberately not used for this contract.
  const { skills, nameToId } = buildSkillRecords(found);
  let graph = buildGraph(skills, nameToId);
  // Atlas consumes inferred skill names above. Extend the exported records only
  // afterwards, so profile references cannot be mistaken for skill-name aliases.
  for (const record of skills) {
    record.inferred_dependencies = [...record.dependencies];
    record.declared_dependencies = [...new Set(explicit
      .filter((edge) => edge.source === record.id)
      .map((edge) => edge.target.startsWith('profiles:')
        ? `profiles/${edge.target.slice('profiles:'.length)}`
        : edge.target.slice('skills:'.length)))];
    record.dependencies = [...new Set([...record.inferred_dependencies, ...record.declared_dependencies])].sort();
  }
  const records = new Map(skills.map((skill) => [skill.id, skill]));
  for (const node of graph.nodes) {
    const record = records.get(node.id);
    if (!record) { node.kind = 'resource'; continue; }
    Object.assign(node, { kind: 'skill', category: record.frontmatter.category,
      domain: record.frontmatter.domain, action: record.frontmatter.action,
      artifacts: record.frontmatter.artifacts, uses: record.frontmatter.uses || [] });
  }
  for (const profile of profiles) graph.nodes.push({
    id: profile.id, name: profile.name, display_name: profile.name, kind: 'profile',
    source: 'profiles', description: profile.data.description || '', version: profile.data.version,
    path: `profiles/${profile.name}.yaml`, profile: profile.data, size: 15, series: '', triggers: [],
  });
  const links = new Map(graph.links.map((edge) => {
    edge.evidence = [edge.type === 'depends_on' || edge.type === 'routes_to' ? 'body-mention' : 'atlas-heuristic'];
    return [`${edge.source}|${edge.target}|${edge.type}`, edge];
  }));
  for (const edge of explicit) {
    const key = `${edge.source}|${edge.target}|${edge.type}`;
    const previous = links.get(key);
    if (previous) Object.assign(previous, { evidence: [...new Set([...previous.evidence, 'uses'])], label: edge.label });
    else links.set(key, edge);
  }
  graph.links = [...links.values()];
  let outputSkills = skills;
  if (domain) {
    outputSkills = skills.filter((skill) => Array.isArray(skill.frontmatter.domain) && skill.frontmatter.domain.includes(domain));
    const keep = new Set(outputSkills.map((skill) => skill.id));
    for (const edge of graph.links) {
      if (keep.has(edge.source) && edge.target.startsWith('profiles:')) keep.add(edge.target);
    }
    graph.nodes = graph.nodes.filter((node) => keep.has(node.id));
    graph.links = graph.links.filter((edge) => keep.has(edge.source) && keep.has(edge.target));
  }
  graph.stats = { ...graph.stats, total_skills: outputSkills.length,
    total_profiles: graph.nodes.filter((node) => node.kind === 'profile').length,
    total_edges: graph.links.length, sources: [...new Set(graph.nodes.map((node) => node.source))],
    series: [...new Set(graph.nodes.map((node) => node.series).filter(Boolean))],
    domain_filter: domain || null };
  analyzeGraph(graph);
  const errors = diagnostics.filter((diagnostic) => diagnostic.severity !== 'warning');
  const audit = {
    contract_version: contract.version, atlas_version: '0.1.0', root: absoluteRoot,
    ok: errors.length === 0, scope: 'entire collection (before any domain filter)',
    artifact_check: 'Nonempty artifacts declarations only; output existence, verifiability and quality require task-specific review.',
    counts: { skills: namedSkills.size, profiles: profiles.length, errors: errors.length, warnings: diagnostics.length - errors.length }, diagnostics,
  };
  return { skills: outputSkills, graph, audit };
}

export function writeResults(out, result) {
  fs.mkdirSync(out, { recursive: true });
  for (const name of ['skills', 'graph', 'audit']) {
    fs.writeFileSync(path.join(out, `${name}.json`), JSON.stringify(result[name], null, 2) + '\n');
  }
}
