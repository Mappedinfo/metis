import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { checkSkills, contract } from '../scripts/lib/skill-contract.mjs';

const cli = fileURLToPath(new URL('../scripts/check-skills.mjs', import.meta.url));

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'metis-contract-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

function write(root, relative, content) {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return file;
}

const compliantBody = `## When to use

Use it when the caller needs the declared artifact.

## Requirements

- [B] R1 Deliver the declared artifact — 验证: the artifact file exists in the task workspace.

## When to stop

- Stop when the artifact is delivered, or report what remains when the round budget is exhausted.

## Output contract

The declared artifact, saved under the task workspace.
`;

function skill(root, name, extra = '', body = compliantBody) {
  return write(root, `skills/${name}/SKILL.md`, `---
name: ${name}
description: >
  Produces a useful result: a reviewable artifact.
category: visualize
domain: [paper, figure]
action: [create]
artifacts: ["A figure saved as SVG, with a preview"]
${extra}---
# ${name}
${body}
`);
}

function profile(root) {
  write(root, 'profiles/journal.yaml', 'name: journal\nversion: 0.1.0\ndescription: Shared figure style.\npalette:\n  primary: "#0072B2"\n');
}

const codes = (result) => result.audit.diagnostics.map((item) => item.code);

test('frontmatter-only uses create profile and skill dependency edges with metrics', (t) => {
  const root = fixture(t);
  skill(root, 'renderer', 'uses: [profiles/journal, helper]\n');
  skill(root, 'helper');
  profile(root);
  const result = checkSkills({ root });
  assert.equal(result.audit.ok, true);
  assert.equal(result.skills.find((item) => item.name === 'renderer').description,
    'Produces a useful result: a reviewable artifact.');
  const renderer = result.skills.find((item) => item.name === 'renderer');
  assert.deepEqual(renderer.dependencies, ['helper', 'profiles/journal']);
  assert.deepEqual(renderer.inferred_dependencies, []);
  assert.deepEqual(renderer.declared_dependencies, ['profiles/journal', 'helper']);
  const nodes = new Map(result.graph.nodes.map((item) => [item.id, item]));
  assert.equal(nodes.get('profiles:journal').kind, 'profile');
  assert.equal(nodes.get('profiles:journal').in_degree, 1);
  assert.equal(nodes.get('profiles:journal').dependents_closure, 1);
  assert.equal(nodes.get('skills:renderer').category, 'visualize');
  assert.deepEqual(nodes.get('skills:renderer').domain, ['paper', 'figure']);
  assert.deepEqual(nodes.get('skills:renderer').action, ['create']);
  for (const target of ['profiles:journal', 'skills:helper']) {
    const edge = result.graph.links.find((item) => item.source === 'skills:renderer' && item.target === target && item.type === 'depends_on');
    assert.deepEqual(edge.evidence, ['uses']);
  }
});

test('body mentions remain distinguishable and do not duplicate declared edges', (t) => {
  const root = fixture(t);
  skill(root, 'caller', 'uses: [helper]\n', 'Run helper.');
  skill(root, 'helper');
  const result = checkSkills({ root });
  const edges = result.graph.links.filter((item) => item.source === 'skills:caller' && item.target === 'skills:helper' && item.type === 'depends_on');
  assert.equal(edges.length, 1);
  assert.deepEqual(edges[0].evidence, ['body-mention', 'uses']);
});

test('domain filter keeps matching skills and their profiles, but audits the complete collection', (t) => {
  const root = fixture(t);
  skill(root, 'renderer', 'uses: [profiles/journal]\n');
  const other = skill(root, 'other');
  fs.writeFileSync(other, fs.readFileSync(other, 'utf8').replace('domain: [paper, figure]', 'domain: [writing]'));
  profile(root);
  const result = checkSkills({ root, domain: 'paper' });
  assert.equal(result.audit.ok, true);
  assert.deepEqual(result.skills.map((item) => item.name), ['renderer']);
  assert.deepEqual(result.graph.nodes.map((item) => item.id).sort(), ['profiles:journal', 'skills:renderer']);
  assert.deepEqual(result.graph.redundancy_pairs, []);
  assert.equal(result.audit.counts.skills, 2);
  fs.writeFileSync(other, fs.readFileSync(other, 'utf8').replace('category: visualize', 'category: unknown'));
  assert.ok(codes(checkSkills({ root, domain: 'paper' })).includes('UNKNOWN_CATEGORY'));
});

test('missing artifacts fail even when prose promises a deliverable', (t) => {
  const root = fixture(t);
  const file = skill(root, 'writer');
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/^artifacts:.*\n/m, ''));
  const result = checkSkills({ root });
  assert.ok(codes(result).includes('ARTIFACTS_REQUIRED'));
  assert.equal(result.audit.ok, false);
});

test('artifact declarations must be a nonempty string array', (t) => {
  const root = fixture(t);
  const file = skill(root, 'writer');
  const original = fs.readFileSync(file, 'utf8');
  for (const value of ['[]', '[""]', '["   "]', '[null]', 'output.pdf']) {
    fs.writeFileSync(file, original.replace(/^artifacts:.*$/m, `artifacts: ${value}`));
    assert.ok(codes(checkSkills({ root })).includes('ARTIFACTS_REQUIRED'), value);
  }
});

test('invalid vocabularies, list bounds and duplicates are diagnosed', (t) => {
  const root = fixture(t);
  const file = skill(root, 'writer');
  const original = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(file, original.replace('category: visualize', 'category: research').replace('domain: [paper, figure]', 'domain: [paper, unknown]').replace('action: [create]', 'action: [create, create, revise, advise]'));
  assert.deepEqual(new Set(codes(checkSkills({ root }))), new Set(['UNKNOWN_CATEGORY', 'UNKNOWN_TAG', 'INVALID_TAG_COUNT']));
  fs.writeFileSync(file, original.replace('domain: [paper, figure]', 'domain: [paper, paper]'));
  assert.ok(codes(checkSkills({ root })).includes('DUPLICATE_TAG'));
  assert.ok(codes(checkSkills({ root, domain: 'unknown' })).includes('INVALID_DOMAIN_FILTER'));
});

test('uses rejects absent targets, traversal, absolute paths and invalid shapes', (t) => {
  const root = fixture(t);
  const file = skill(root, 'renderer', 'uses: [profiles/missing, missing, ../outside, /tmp/private, profiles/journal.yaml]\n');
  const result = checkSkills({ root });
  assert.equal(result.audit.ok, false);
  assert.equal(codes(result).filter((code) => code === 'UNKNOWN_USE_TARGET').length, 2);
  assert.equal(codes(result).filter((code) => code === 'INVALID_USE_REFERENCE').length, 3);
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/^uses:.*$/m, 'uses: profiles/journal'));
  assert.ok(codes(checkSkills({ root })).includes('INVALID_USES'));
});

test('strict YAML rejects malformed and duplicate mapping keys in skills and profiles', (t) => {
  const root = fixture(t);
  const file = skill(root, 'renderer', 'uses: [unterminated\n');
  profile(root);
  write(root, 'profiles/journal.yaml', 'name: journal\nname: duplicate\n');
  assert.equal(codes(checkSkills({ root })).filter((code) => code === 'INVALID_YAML').length, 2);
  fs.writeFileSync(file, '---\nname: renderer\nname: duplicate\n---\nBody');
  assert.equal(codes(checkSkills({ root })).filter((code) => code === 'INVALID_YAML').length, 2);
});

test('empty collections and duplicate skill names fail explicitly', (t) => {
  const root = fixture(t);
  fs.mkdirSync(path.join(root, 'skills'));
  assert.ok(codes(checkSkills({ root })).includes('NO_SKILLS'));
  const file = skill(root, 'renderer');
  write(root, 'skills/second/SKILL.md', fs.readFileSync(file, 'utf8'));
  assert.ok(codes(checkSkills({ root })).includes('DUPLICATE_SKILL_NAME'));
});

test('cyclic YAML aliases produce a diagnostic instead of breaking audit output', (t) => {
  const root = fixture(t);
  skill(root, 'renderer', 'extra: &loop [*loop]\n');
  const output = path.join(root, 'output');
  const result = spawnSync(process.execPath, [cli, '--root', root, '--out', output], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  const audit = JSON.parse(fs.readFileSync(path.join(output, 'audit.json'), 'utf8'));
  assert.ok(audit.diagnostics.some((item) => item.code === 'INVALID_YAML'));
});

test('outside symlinks are diagnosed without reading their contents', (t) => {
  const root = fixture(t);
  const outside = fixture(t);
  skill(root, 'renderer', 'uses: [profiles/journal]\n');
  const outsideSkill = write(outside, 'SKILL.md', 'PRIVATE SENTINEL MUST NEVER BE READ');
  fs.mkdirSync(path.join(root, 'skills', 'linked'));
  fs.symlinkSync(outsideSkill, path.join(root, 'skills', 'linked', 'SKILL.md'));
  profile(outside);
  fs.symlinkSync(path.join(outside, 'profiles'), path.join(root, 'profiles'));
  const result = checkSkills({ root });
  assert.equal(codes(result).filter((code) => code === 'SYMLINK_OUTSIDE_ROOT').length, 2);
  assert.ok(codes(result).includes('UNKNOWN_USE_TARGET'));
  assert.equal(result.skills.length, 1);
  assert.equal(JSON.stringify(result).includes('PRIVATE SENTINEL'), false);
});

test('CLI writes audit.json and exits nonzero for a contract failure', (t) => {
  const root = fixture(t);
  const output = path.join(root, 'output');
  const file = skill(root, 'renderer');
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/^artifacts:.*\n/m, ''));
  const result = spawnSync(process.execPath, [cli, '--root', root, '--out', output], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  const audit = JSON.parse(fs.readFileSync(path.join(output, 'audit.json'), 'utf8'));
  assert.equal(audit.ok, false);
  assert.ok(audit.diagnostics.some((item) => item.code === 'ARTIFACTS_REQUIRED'));
  assert.ok(fs.existsSync(path.join(output, 'graph.json')));
});

test('CLI supports a valid domain projection and writes profile dependencies', (t) => {
  const root = fixture(t);
  skill(root, 'renderer', 'uses: [profiles/journal]\n');
  profile(root);
  const output = path.join(root, 'output');
  const result = spawnSync(process.execPath, [cli, '--root', root, '--out', output, '--domain', 'paper'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const graph = JSON.parse(fs.readFileSync(path.join(output, 'graph.json'), 'utf8'));
  assert.equal(graph.stats.domain_filter, 'paper');
  assert.equal(graph.links[0].target, 'profiles:journal');
  assert.equal(contract.categories.length, 7);
});

test('required sections are diagnosed per missing heading', (t) => {
  const root = fixture(t);
  const file = skill(root, 'writer');
  const original = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(file, original.replace('## When to stop\n\n- Stop when the artifact is delivered, or report what remains when the round budget is exhausted.\n\n', ''));
  const result = checkSkills({ root });
  assert.equal(result.audit.ok, false);
  const missing = result.audit.diagnostics.filter((item) => item.code === 'SECTION_MISSING');
  assert.equal(missing.length, 1);
  assert.ok(missing[0].message.includes('When to stop'));
});

test('the contribution template passes when copied into a skill', (t) => {
  const root = fixture(t);
  const guide = fs.readFileSync(new URL('../CONTRIBUTING.md', import.meta.url), 'utf8');
  const template = guide.match(/^```markdown\r?\n([\s\S]*?)^```[ \t]*$/m)?.[1];
  assert.ok(template, 'the documented copyable SKILL.md template must exist');
  write(root, 'skills/my-skill/SKILL.md', template);
  const result = checkSkills({ root });
  assert.equal(result.audit.ok, true, JSON.stringify(result.audit.diagnostics));
  assert.equal(result.audit.counts.warnings, 0);
});

test('code examples cannot supply required headings', (t) => {
  const root = fixture(t);
  const headings = contract.required_sections.map((section) => `## ${section}`).join('\n\n');
  const examples = [
    `\`\`\`markdown\n${headings}\n\`\`\``,
    `   ~~~~markdown\n${headings}\n   ~~~~`,
    `\`\`\`\`markdown\n\`\`\`\n${headings}\n\`\`\`\``,
    headings.split('\n').map((line) => `    ${line}`).join('\n'),
    headings.split('\n').map((line) => `\t${line}`).join('\n'),
  ];
  for (const example of examples) {
    skill(root, 'writer', '', `\n${example}\n`);
    const result = checkSkills({ root });
    assert.equal(result.audit.ok, false, example);
    assert.equal(result.audit.diagnostics.filter((item) => item.code === 'SECTION_MISSING').length,
      contract.required_sections.length, example);
  }
});

test('real H3 sections retain case-insensitive substring matching', (t) => {
  const root = fixture(t);
  skill(root, 'writer', '', compliantBody.replace(/^## (.+)$/gm, (_, title) => `### Skill ${title.toUpperCase()} details ###`));
  const result = checkSkills({ root });
  assert.equal(result.audit.ok, true, JSON.stringify(result.audit.diagnostics));
  assert.equal(result.audit.counts.warnings, 0);
});

test('Requirements checks child sections and nested lists through the next peer or parent heading', (t) => {
  const root = fixture(t);
  for (const depth of [2, 3]) {
    const heading = '#'.repeat(depth);
    const child = '#'.repeat(depth + 1);
    const requirements = `${heading} Requirements

- [B] R1 A labeled item — verification: inspect the result.
  - Nested item without a label.

${child} Blocking checks

1. Unlabeled child requirement.

\`\`\`markdown
${heading} A fake section boundary
- A list example without a label.
\`\`\`

+ Another unlabeled child requirement after the example.

    - [A] A labeled nested item — verification: inspect it.

${heading} Notes

- A list outside Requirements.

`;
    const body = compliantBody.replace(/## Requirements\n[\s\S]*?(?=## When to stop)/, requirements);
    const file = skill(root, 'writer', '', body);
    const original = fs.readFileSync(file, 'utf8');
    fs.writeFileSync(file, original.replaceAll('\n', '\r\n'));
    const result = checkSkills({ root });
    assert.equal(result.audit.ok, true);
    const hits = result.audit.diagnostics.filter((item) => item.code === 'LEDGER_ITEM_UNLABELED');
    const expectedLines = original.split('\n').flatMap((line, index) =>
      /Nested item without|Unlabeled child requirement|Another unlabeled child requirement/.test(line) ? [index + 1] : []);
    assert.deepEqual(hits.map((item) => Number(item.message.match(/^Line (\d+):/)[1])), expectedLines);
    assert.equal(result.audit.counts.warnings, 3);
    assert.ok(hits.every((item) => item.severity === 'warning'));
  }
  const output = path.join(root, 'output');
  const result = spawnSync(process.execPath, [cli, '--root', root, '--out', output], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /3 warnings/);
});

test('unbounded language fails with a file line number', (t) => {
  const root = fixture(t);
  skill(root, 'polisher', '', compliantBody.replace('- Stop when the artifact is delivered, or report what remains when the round budget is exhausted.', '- Keep going: repeat until the prose reads well.'));
  const result = checkSkills({ root });
  assert.equal(result.audit.ok, false);
  const hit = result.audit.diagnostics.find((item) => item.code === 'UNBOUNDED_LANGUAGE');
  assert.ok(hit, 'expected UNBOUNDED_LANGUAGE');
  assert.ok(/Line \d+/.test(hit.message), hit.message);
});

test('unbounded language still scans raw body examples with exact CRLF file lines', (t) => {
  const root = fixture(t);
  const file = skill(root, 'writer', '', compliantBody + '\n```text\nrepeat until ready\n```\n');
  const original = fs.readFileSync(file, 'utf8').replace('---\nname:', '---\n\nname:');
  fs.writeFileSync(file, original.replaceAll('\n', '\r\n'));
  const result = checkSkills({ root });
  const hits = result.audit.diagnostics.filter((item) => item.code === 'UNBOUNDED_LANGUAGE');
  assert.equal(result.audit.ok, false);
  assert.equal(hits.length, 1);
  const expectedLine = original.split('\n').findIndex((line) => line === 'repeat until ready') + 1;
  assert.ok(hits[0].message.startsWith(`Line ${expectedLine}:`), hits[0].message);
});

test('unlabeled Requirements items warn without failing the audit', (t) => {
  const root = fixture(t);
  const file = skill(root, 'writer');
  const original = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(file, original.replace('- [B] R1 Deliver the declared artifact', '- Deliver the declared artifact'));
  const result = checkSkills({ root });
  assert.equal(result.audit.ok, true);
  assert.equal(result.audit.counts.errors, 0);
  assert.equal(result.audit.counts.warnings, 1);
  const hit = result.audit.diagnostics.find((item) => item.code === 'LEDGER_ITEM_UNLABELED');
  assert.equal(hit.severity, 'warning');
});
