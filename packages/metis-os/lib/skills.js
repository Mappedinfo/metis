// metis-os skills: link the bundled metis skills into an agent skill
// directory (default ~/.agents/skills). Symlink-only management: real
// directories are never replaced or removed, even with --force.

import { createHash } from 'node:crypto';
import {
  lstatSync,
  readFileSync,
  readdirSync,
  mkdirSync,
  symlinkSync,
  realpathSync,
  unlinkSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const bundled = fileURLToPath(new URL('../skills/', import.meta.url));
const NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function entry(path) {
  try { return lstatSync(path); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

/** Recursive sha256 over sorted relative paths and file contents. */
export function hashTree(root) {
  const hash = createHash('sha256');
  const walk = (dir, prefix) => {
    for (const name of readdirSync(dir).sort()) {
      const path = join(dir, name);
      const stat = entry(path);
      const rel = prefix ? prefix + '/' + name : name;
      if (stat.isSymbolicLink()) throw new Error(`Skill trees must not contain symlinks: ${rel}`);
      if (stat.isDirectory()) { walk(path, rel); continue; }
      if (!stat.isFile()) throw new Error(`Unsupported entry in skill tree: ${rel}`);
      hash.update(rel + '\0');
      hash.update(readFileSync(path));
      hash.update('\0');
    }
  };
  walk(root, '');
  return hash.digest('hex');
}

/** Bundled skills from the generated package copy; never inferred. */
export function bundledSkills() {
  let manifest;
  try { manifest = JSON.parse(readFileSync(join(bundled, 'manifest.json'), 'utf8')); }
  catch { throw new Error('Skill bundle is missing. In a source checkout, run npm run skills:bundle first.'); }
  if (manifest.schema_version !== 1 || !Array.isArray(manifest.skills) || !manifest.skills.length) {
    throw new Error('Invalid skill bundle manifest');
  }
  const names = new Set();
  return manifest.skills.map(({ name, sha256 }) => {
    if (!NAME.test(name ?? '') || names.has(name)) throw new Error('Invalid or duplicate skill in bundle manifest');
    names.add(name);
    const source = join(bundled, name);
    if (!entry(join(source, 'SKILL.md'))?.isFile()) throw new Error(`Bundled skill is missing SKILL.md: ${name}`);
    if (hashTree(source) !== sha256) throw new Error(`Corrupt bundled skill: ${name}`);
    return { name, source };
  });
}

export function defaultSkillDir() {
  return join(homedir(), '.agents', 'skills');
}

function expandHome(path) {
  if (path === '~') return homedir();
  if (path.startsWith('~' + sep) || path.startsWith('~/')) return resolve(homedir(), path.slice(2));
  return path;
}

/** Per-skill link state. state: linked | missing | foreign-link | blocked. */
export function skillsStatus({ dir = defaultSkillDir() } = {}) {
  const target = resolve(expandHome(dir));
  return bundledSkills().map(({ name, source }) => {
    const link = join(target, name);
    const current = entry(link);
    let state = 'missing';
    if (current?.isSymbolicLink()) {
      let dest = null;
      try { dest = realpathSync(link); } catch { /* dangling */ }
      state = dest === realpathSync(source) ? 'linked' : 'foreign-link';
    } else if (current) {
      state = 'blocked';
    }
    return { name, source, link, state };
  });
}

function select(rows, only) {
  if (!only?.length) return rows;
  const known = new Set(rows.map((row) => row.name));
  for (const name of only) {
    if (!known.has(name)) throw new Error(`Unknown bundled skill "${name}". Available: ${[...known].join(', ')}`);
  }
  return rows.filter((row) => only.includes(row.name));
}

export function installSkills({ dir = defaultSkillDir(), force = false, only } = {}) {
  const target = resolve(expandHome(dir));
  const targetEntry = entry(target);
  if (targetEntry && (!targetEntry.isDirectory() || targetEntry.isSymbolicLink())) {
    throw new Error(`${target} must be a real directory; refusing to use a symlink or file as the skill directory`);
  }
  const rows = select(skillsStatus({ dir: target }), only);
  // Preflight the full set before linking anything.
  const blocked = rows.filter((row) => row.state === 'blocked');
  if (blocked.length) {
    throw new Error(`Refusing to replace real paths, even with --force: ${blocked.map((row) => row.link).join(', ')}`);
  }
  const foreign = rows.filter((row) => row.state === 'foreign-link');
  if (foreign.length && !force) {
    throw new Error(`Existing symlinks point elsewhere: ${foreign.map((row) => row.link).join(', ')}. Use skills install --force to retarget them.`);
  }
  mkdirSync(target, { recursive: true });
  let linked = 0;
  for (const row of rows) {
    if (row.state === 'linked') continue;
    if (row.state === 'foreign-link') unlinkSync(row.link);
    symlinkSync(realpathSync(row.source), row.link, process.platform === 'win32' ? 'junction' : 'dir');
    linked++;
  }
  return { directory: target, linked, unchanged: rows.length - linked };
}

export function uninstallSkills({ dir = defaultSkillDir(), only } = {}) {
  const target = resolve(expandHome(dir));
  const rows = select(skillsStatus({ dir: target }), only);
  // Remove exactly the symlinks we manage; foreign links and real paths stay.
  const removed = [];
  for (const row of rows) {
    if (row.state !== 'linked') continue;
    unlinkSync(row.link);
    removed.push(row.name);
  }
  const kept = rows.filter((row) => row.state === 'foreign-link' || row.state === 'blocked').map((row) => row.name);
  return { directory: target, removed, kept };
}

function parseSkillArgs(args, usage) {
  const flags = { force: false, dir: undefined, only: [] };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--force') flags.force = true;
    else if (arg === '--dir') {
      flags.dir = args[++i];
      if (!flags.dir || flags.dir.startsWith('-')) throw new Error('--dir requires a path argument');
    } else if (arg.startsWith('--dir=')) {
      flags.dir = arg.slice('--dir='.length) || undefined;
      if (!flags.dir) throw new Error('--dir requires a path argument');
    } else if (arg === '--skill') {
      const name = args[++i];
      if (!name || name.startsWith('-')) throw new Error('--skill requires a skill name');
      flags.only.push(name);
    } else if (arg.startsWith('--skill=')) {
      const name = arg.slice('--skill='.length);
      if (!name) throw new Error('--skill requires a skill name');
      flags.only.push(name);
    } else {
      throw new Error(usage);
    }
  }
  return flags;
}

export function cmdSkills(args) {
  const sub = args[0];
  const rest = args.slice(1);
  if (sub === 'install' || sub === 'uninstall') {
    const flags = parseSkillArgs(rest, `Usage: metis-os skills ${sub} [--dir <path>]${sub === 'install' ? ' [--force]' : ''} [--skill <name> ...]`);
    if (sub === 'install') {
      const result = installSkills({ dir: flags.dir ?? defaultSkillDir(), force: flags.force, only: flags.only });
      console.log(`Skills linked at ${result.directory} (${result.linked} linked, ${result.unchanged} unchanged).`);
    } else {
      const result = uninstallSkills({ dir: flags.dir ?? defaultSkillDir(), only: flags.only });
      const note = result.kept.length ? `; kept unmanaged entries: ${result.kept.join(', ')}` : '';
      console.log(`Skills unlinked from ${result.directory} (${result.removed.length} removed${note}).`);
    }
    return;
  }
  if ((sub === 'list' || sub === 'status') ) {
    const flags = parseSkillArgs(rest, 'Usage: metis-os skills list [--dir <path>]');
    const rows = select(skillsStatus({ dir: flags.dir ?? defaultSkillDir() }), flags.only);
    for (const row of rows) console.log(`${row.name}\t${row.state}\t${row.link}`);
    return;
  }
  throw new Error('Usage: metis-os skills install [--force] [--dir <path>] [--skill <name> ...] | metis-os skills uninstall [--dir <path>] [--skill <name> ...] | metis-os skills list [--dir <path>]');
}
