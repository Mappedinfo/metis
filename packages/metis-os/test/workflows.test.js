import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, symlinkSync, existsSync, unlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { installWorkflow, uninstallWorkflow } from '../lib/workflows.js';

const repo = fileURLToPath(new URL('../../../', import.meta.url));
const cli = resolve(repo, 'packages/metis-os/bin/metis-os.js');
const fixture = () => mkdtempSync(join(tmpdir(), "metis writing 'project-"));
const json = path => JSON.parse(readFileSync(path, 'utf8'));
const put = (root, path, value) => { mkdirSync(resolve(root, path, '..'), { recursive: true }); writeFileSync(join(root, path), JSON.stringify(value)); };
const run = (root, args) => spawnSync(process.execPath, [cli, ...args], { cwd: root, encoding: 'utf8' });

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
