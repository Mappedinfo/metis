import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, symlinkSync, existsSync, unlinkSync, copyFileSync, cpSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { installWorkflow, uninstallWorkflow } from '../lib/workflows.js';

const repo = fileURLToPath(new URL('../../../', import.meta.url));
const cli = resolve(repo, 'packages/metis-os/bin/metis-os.js');
const fixture = () => mkdtempSync(join(tmpdir(), "metis writing 'project-"));
const json = path => JSON.parse(readFileSync(path, 'utf8'));
const put = (root, path, value) => { mkdirSync(resolve(root, path, '..'), { recursive: true }); writeFileSync(join(root, path), JSON.stringify(value)); };
const run = (root, args) => spawnSync(process.execPath, [cli, ...args], { cwd: root, encoding: 'utf8' });

test('missing review or foundations guides prevent installation before project configuration is written', async (t) => {
  const sandbox = fixture();
  t.after(() => rmSync(sandbox, { recursive: true, force: true }));
  const root = join(sandbox, 'project'), bundle = join(sandbox, 'bundle');
  for (const dir of [root, join(bundle, 'lib'), join(bundle, 'bin'), join(bundle, 'workflows/writing-review'), join(bundle, 'skills/prose-audit'), join(bundle, 'skills/source-brief/references')]) mkdirSync(dir, { recursive: true });
  writeFileSync(join(bundle, 'package.json'), '{"type":"module"}');
  for (const name of ['workflows.js', 'workflow-core.js']) copyFileSync(resolve(repo, 'packages/metis-os/lib', name), join(bundle, 'lib', name));
  writeFileSync(join(bundle, 'bin/metis-hook.js'), '// fixture hook');
  for (const name of ['workflow.json', 'workflow.md']) copyFileSync(resolve(repo, 'packages/metis-os/workflows/writing-review', name), join(bundle, 'workflows/writing-review', name));
  copyFileSync(resolve(repo, 'packages/metis-os/skills/prose-audit/SKILL.md'), join(bundle, 'skills/prose-audit/SKILL.md'));
  const isolated = await import(pathToFileURL(join(bundle, 'lib/workflows.js')).href);
  assert.throws(() => isolated.installWorkflow({ project: root, runtime: 'codex' }), /Missing runtime asset:.*SKILL\.zh\.md/);
  assert.equal(existsSync(join(root, '.metis')), false);
  assert.equal(existsSync(join(root, '.codex')), false);
  copyFileSync(resolve(repo, 'packages/metis-os/skills/prose-audit/SKILL.zh.md'), join(bundle, 'skills/prose-audit/SKILL.zh.md'));
  assert.throws(() => isolated.installWorkflow({ project: root, runtime: 'codex' }), /Missing runtime asset:.*writing-foundations\.md/);
  assert.equal(existsSync(join(root, '.metis')), false);
  copyFileSync(resolve(repo, 'packages/metis-os/skills/source-brief/references/writing-foundations.md'), join(bundle, 'skills/source-brief/references/writing-foundations.md'));
  assert.throws(() => isolated.installWorkflow({ project: root, runtime: 'codex' }), /Missing runtime asset:.*writing-foundations\.en\.md/);
  assert.equal(existsSync(join(root, '.codex')), false);
  copyFileSync(resolve(repo, 'packages/metis-os/skills/source-brief/references/writing-foundations.en.md'), join(bundle, 'skills/source-brief/references/writing-foundations.en.md'));
  assert.ok(isolated.installWorkflow({ project: root, runtime: 'codex' }).changed_files > 0);
});

test('a relocated package injects its own complete foundations and records exact source hashes', async (t) => {
  const sandbox = fixture();
  t.after(() => rmSync(sandbox, { recursive: true, force: true }));
  const root = join(sandbox, 'project'), bundle = join(sandbox, 'installed package');
  mkdirSync(root, { recursive: true });
  mkdirSync(bundle, { recursive: true });
  writeFileSync(join(bundle, 'package.json'), '{"type":"module"}');
  for (const name of ['lib', 'bin', 'workflows', 'skills/prose-audit', 'skills/source-brief']) {
    cpSync(resolve(repo, 'packages/metis-os', name), join(bundle, name), { recursive: true });
  }
  const isolated = await import(pathToFileURL(join(bundle, 'lib/workflows.js')).href);
  isolated.installWorkflow({ project: root, runtime: 'codex', activation: 'explicit' });
  const command = json(join(root, '.codex/hooks.json')).hooks.UserPromptSubmit.at(-1).hooks[0].command;
  const payload = { session_id: 'relocated', turn_id: 't1', cwd: root, hook_event_name: 'UserPromptSubmit', prompt: '[metis:writing-review]\n请把这些材料整理成解释长文。' };
  const executed = spawnSync('/bin/sh', ['-c', command], { cwd: tmpdir(), input: JSON.stringify(payload), encoding: 'utf8' });
  assert.equal(executed.status, 0, executed.stderr);
  const injected = JSON.parse(executed.stdout).hookSpecificOutput.additionalContext;
  const core = await import(pathToFileURL(join(bundle, 'lib/workflow-core.js')).href);
  const state = await core.getRun({ root, sessionId: payload.session_id });
  for (const [file, key] of [['writing-foundations.md', 'foundations_sha256'], ['writing-foundations.en.md', 'foundations_en_sha256']]) {
    const path = join(bundle, 'skills/source-brief/references', file);
    const bytes = readFileSync(path);
    assert.ok(injected.includes(bytes.toString('utf8')));
    assert.ok(injected.includes(path));
    assert.equal(state.sources[key], createHash('sha256').update(bytes).digest('hex'));
  }
  assert.equal(state.revision_count, 0);
  assert.equal(state.continuation_count, 0);
});

test('workflow install preserves unrelated Codex hooks and is idempotent', () => {
  const root = fixture();
  const foreign = { matcher: 'other', hooks: [{ type: 'command', command: 'echo other' }] };
  put(root, '.codex/hooks.json', { description: 'mine', hooks: { UserPromptSubmit: [foreign], OtherEvent: [foreign] } });
  const first = installWorkflow({ project: root, runtime: 'codex' });
  assert.ok(first.changed_files > 0);
  const hooks = json(join(root, '.codex/hooks.json'));
  assert.equal(hooks.description, 'mine');
  assert.deepEqual(hooks.hooks.UserPromptSubmit[0], foreign);
  assert.deepEqual(hooks.hooks.OtherEvent, [foreign]);
  assert.equal(hooks.hooks.UserPromptSubmit.at(-1).hooks[0].additionalContextLimit, 0);
  assert.equal(Object.hasOwn(hooks.hooks.Stop[0].hooks[0], 'additionalContextLimit'), false);
  assert.equal(installWorkflow({ project: root, runtime: 'codex' }).changed_files, 0);
  assert.match(readFileSync(join(root, '.metis/.gitignore'), 'utf8'), /\/state\//);
});

test('reinstall upgrades a legacy Stop hook without changing prompt or foreign hooks', () => {
  const root = fixture();
  const foreign = { hooks: [{ type: 'command', command: 'echo keep' }] };
  put(root, '.codex/hooks.json', { hooks: { Stop: [foreign] } });
  installWorkflow({ project: root, runtime: 'codex' });
  const hookPath = join(root, '.codex/hooks.json');
  const recordPath = join(root, '.metis/adapters/codex/installation.json');
  const hooks = json(hookPath), record = json(recordPath);
  const promptBefore = structuredClone(hooks.hooks.UserPromptSubmit);
  // Reproduce the prior release's exact managed group and installation record.
  hooks.hooks.Stop.at(-1).hooks[0].additionalContextLimit = 0;
  record.groups.Stop.hooks[0].additionalContextLimit = 0;
  writeFileSync(hookPath, JSON.stringify(hooks));
  writeFileSync(recordPath, JSON.stringify(record));
  installWorkflow({ project: root, runtime: 'codex' });
  const upgraded = json(hookPath);
  assert.deepEqual(upgraded.hooks.UserPromptSubmit, promptBefore);
  assert.deepEqual(upgraded.hooks.Stop[0], foreign);
  assert.equal(Object.hasOwn(upgraded.hooks.Stop.at(-1).hooks[0], 'additionalContextLimit'), false);
  assert.deepEqual(json(recordPath).groups.Stop, upgraded.hooks.Stop.at(-1));
  assert.equal(installWorkflow({ project: root, runtime: 'codex' }).changed_files, 0);
  uninstallWorkflow({ project: root, runtime: 'codex' });
  assert.deepEqual(json(hookPath).hooks.Stop, [foreign]);
});

test('generated command executes from paths containing spaces and quotes', () => {
  const root = fixture();
  installWorkflow({ project: root, runtime: 'codex' });
  const command = json(join(root, '.codex/hooks.json')).hooks.UserPromptSubmit.at(-1).hooks[0].command;
  const payload = { session_id: 's1', turn_id: 't1', cwd: root, hook_event_name: 'UserPromptSubmit', prompt: 'Please draft a short email about the supplied results.' };
  const result = spawnSync('/bin/sh', ['-c', command], { cwd: tmpdir(), input: JSON.stringify(payload), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.match(output.hookSpecificOutput.additionalContext, /Prose audit/);
  assert.match(output.hookSpecificOutput.additionalContext, /workflows capture/);
});

test('DSH export is usable hook JSON and an explicit patch, preserving Codex setup', () => {
  const root = fixture();
  installWorkflow({ project: root, runtime: 'codex' });
  const codexBefore = readFileSync(join(root, '.codex/hooks.json'), 'utf8');
  installWorkflow({ project: root, runtime: 'dsh' });
  const path = join(root, '.metis/adapters/dsh/hooks.json');
  assert.equal(json(path).hooks.Stop.length, 1);
  assert.match(readFileSync(join(root, '.metis/adapters/dsh/cordis.patch.yml'), 'utf8'), /@deepseek-ai\/dsh-hooks-codex/);
  assert.equal(readFileSync(join(root, '.codex/hooks.json'), 'utf8'), codexBefore);
  assert.equal(installWorkflow({ project: root, runtime: 'dsh' }).changed_files, 0);
});

test('uninstall removes only owned hooks and retains evidence and other runtime', () => {
  const root = fixture();
  const foreign = { hooks: [{ type: 'command', command: 'echo keep' }] };
  put(root, '.codex/hooks.json', { hooks: { Stop: [foreign] } });
  installWorkflow({ project: root, runtime: 'codex' }); installWorkflow({ project: root, runtime: 'dsh' });
  put(root, '.metis/state/keep.json', { evidence: true });
  uninstallWorkflow({ project: root, runtime: 'codex' });
  assert.deepEqual(json(join(root, '.codex/hooks.json')).hooks.Stop, [foreign]);
  assert.equal(json(join(root, '.metis/workflows.json')).enabled, true);
  uninstallWorkflow({ project: root, runtime: 'dsh' });
  assert.equal(json(join(root, '.metis/workflows.json')).enabled, false);
  assert.deepEqual(json(join(root, '.metis/state/keep.json')), { evidence: true });
  assert.equal(uninstallWorkflow({ project: root, runtime: 'codex' }).removed, false);
});

test('local activation customization survives reinstall; explicit override is deliberate', () => {
  const root = fixture(); installWorkflow({ project: root, runtime: 'codex' });
  const path = join(root, '.metis/workflows.json'), config = json(path);
  config.activation.include = ['write report']; config.activation.exclude = ['tutorial'];
  writeFileSync(path, JSON.stringify(config));
  installWorkflow({ project: root, runtime: 'codex' });
  assert.deepEqual(json(path).activation.include, ['write report']);
  installWorkflow({ project: root, runtime: 'codex', activation: 'explicit' });
  assert.equal(json(path).activation.mode, 'explicit');
  assert.deepEqual(json(path).activation.exclude, ['tutorial']);
});

test('DSH uninstall permits reinstall and preserves locally edited patches', () => {
  const root = fixture();
  installWorkflow({ project: root, runtime: 'dsh' });
  const patch = join(root, '.metis/adapters/dsh/cordis.patch.yml');
  uninstallWorkflow({ project: root, runtime: 'dsh' });
  assert.equal(existsSync(patch), false);
  installWorkflow({ project: root, runtime: 'dsh' });
  assert.equal(json(join(root, '.metis/workflows.json')).enabled, true);
  const edited = readFileSync(patch, 'utf8') + '# local configuration\n';
  writeFileSync(patch, edited);
  uninstallWorkflow({ project: root, runtime: 'dsh' });
  assert.equal(readFileSync(patch, 'utf8'), edited);
  assert.throws(() => installWorkflow({ project: root, runtime: 'dsh' }), /DSH patch was changed/);
  assert.equal(json(join(root, '.metis/workflows.json')).enabled, false);
});

test('DSH uninstall preflights the patch before removing hooks or disabling configuration', () => {
  for (const variant of ['symlink', 'directory', 'oversized']) {
    const root = fixture();
    installWorkflow({ project: root, runtime: 'dsh' });
    const paths = ['.metis/adapters/dsh/hooks.json', '.metis/adapters/dsh/installation.json', '.metis/workflows.json'];
    const before = paths.map(path => readFileSync(join(root, path), 'utf8'));
    const patch = join(root, '.metis/adapters/dsh/cordis.patch.yml');
    unlinkSync(patch);
    if (variant === 'symlink') symlinkSync(join(root, paths[0]), patch);
    if (variant === 'directory') mkdirSync(patch);
    if (variant === 'oversized') writeFileSync(patch, 'x'.repeat(1_000_001));
    assert.throws(() => uninstallWorkflow({ project: root, runtime: 'dsh' }), /symlink|bounded regular file/);
    assert.deepEqual(paths.map(path => readFileSync(join(root, path), 'utf8')), before);
  }
});

test('edited owned hook is not silently replaced or removed', () => {
  const root = fixture(); installWorkflow({ project: root, runtime: 'codex' });
  const path = join(root, '.codex/hooks.json'), hooks = json(path);
  hooks.hooks.Stop[0].hooks[0].command = 'echo local variant';
  writeFileSync(path, JSON.stringify(hooks));
  const before = readFileSync(path, 'utf8');
  assert.throws(() => installWorkflow({ project: root, runtime: 'codex' }), /changed or removed/);
  assert.throws(() => uninstallWorkflow({ project: root, runtime: 'codex' }), /changed or removed/);
  assert.equal(readFileSync(path, 'utf8'), before);
});

test('invalid or conflicting runtime restrictions fail installation without changing configuration', () => {
  for (const runtime of ['codex', 'typo']) {
    const root = fixture();
    installWorkflow({ project: root, runtime: 'codex' });
    const path = join(root, '.metis/workflows.json'), config = json(path);
    config.runtime = runtime;
    writeFileSync(path, JSON.stringify(config));
    const before = readFileSync(path, 'utf8');
    assert.throws(() => installWorkflow({ project: root, runtime: 'dsh' }), /restricted|Invalid configured runtime/);
    assert.equal(readFileSync(path, 'utf8'), before);
    assert.equal(existsSync(join(root, '.metis/adapters/dsh')), false);
  }
});

test('symlink targets and malformed hooks fail before creating opt-in files', () => {
  for (const variant of ['directory', 'file', 'malformed']) {
    const root = fixture(), outside = fixture();
    if (variant === 'directory') symlinkSync(outside, join(root, '.codex'));
    if (variant === 'file') { mkdirSync(join(root, '.codex')); writeFileSync(join(outside, 'hooks.json'), '{}'); symlinkSync(join(outside, 'hooks.json'), join(root, '.codex/hooks.json')); }
    if (variant === 'malformed') put(root, '.codex/hooks.json', { hooks: { Stop: 'invalid' } });
    assert.throws(() => installWorkflow({ project: root, runtime: 'codex' }), /symlink|Invalid/);
    assert.equal(existsSync(join(root, '.metis')), false);
  }
});

test('CLI rejects ambiguous commands and supports explicit project installation', () => {
  const root = fixture();
  for (const args of [['workflows'], ['workflows','install','unknown','--runtime','codex'], ['workflows','install','writing-review','--runtime','invalid'], ['workflows','status'], ['workflows','verify','--session','s','--bogus','x']]) assert.notEqual(run(root,args).status, 0);
  const result = run(tmpdir(), ['workflows','install','writing-review','--runtime','codex','--project',root,'--activation','explicit']);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(json(join(root, '.metis/workflows.json')).activation.mode, 'explicit');
});
