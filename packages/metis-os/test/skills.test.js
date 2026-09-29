// Skill bundle + symlink management. The bundle directory is generated from
// canonical skills/ (npm run skills:bundle; pretest does this automatically).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { lstatSync, mkdtempSync, mkdirSync, readlinkSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const cli = fileURLToPath(new URL('../bin/metis-os.js', import.meta.url));
const bundledRoot = realpathSync(fileURLToPath(new URL('../skills/', import.meta.url)));

function fixture() {
  const dir = join(mkdtempSync(join(tmpdir(), 'metis-os-')), 'agent-skills');
  return dir;
}

function run(args) {
  return spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
}

function succeeds(result) {
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

function rejects(result, message) {
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, message);
}

test('skills install links every bundled skill into the target directory', () => {
  const dir = fixture();
  const result = run(['skills', 'install', '--dir', dir]);
  succeeds(result);
  assert.match(result.stdout, /2 linked, 0 unchanged/);
  for (const name of ['metis-router', 'scansci-pdf']) {
    const link = join(dir, name);
    assert.ok(lstatSync(link).isSymbolicLink(), `${name} must be a symlink`);
    assert.equal(realpathSync(link), join(bundledRoot, name));
    assert.ok(lstatSync(join(link, 'SKILL.md')).isFile(), 'SKILL.md reachable through the link');
  }
});

test('skills install is idempotent and leaves foreign entries untouched', () => {
  const dir = fixture();
  mkdirSync(dir, { recursive: true });
  symlinkSync('/nonexistent-somewhere', join(dir, 'other-tool'));
  mkdirSync(join(dir, 'personal-notes'));
  run(['skills', 'install', '--dir', dir]);
  const rerun = run(['skills', 'install', '--dir', dir]);
  succeeds(rerun);
  assert.match(rerun.stdout, /0 linked, 2 unchanged/);
  assert.ok(lstatSync(join(dir, 'other-tool')).isSymbolicLink());
  assert.ok(lstatSync(join(dir, 'personal-notes')).isDirectory());
});

test('a real directory in the way blocks the whole install, even with --force', () => {
  const dir = fixture();
  mkdirSync(join(dir, 'metis-router'), { recursive: true });
  writeFileSync(join(dir, 'metis-router', 'keep.txt'), 'mine');
  const result = run(['skills', 'install', '--dir', dir, '--force']);
  rejects(result, /Refusing to replace real paths/);
  assert.equal(lstatSync(join(dir, 'metis-router', 'keep.txt')).isFile(), true);
  assert.equal(lstatSync(join(dir, 'scansci-pdf'), { throwIfNoEntry: false }), undefined, 'no partial install');
});

test('a foreign symlink needs --force, then gets retargeted', () => {
  const dir = fixture();
  mkdirSync(dir, { recursive: true });
  const elsewhere = mkdtempSync(join(tmpdir(), 'metis-os-elsewhere-'));
  symlinkSync(elsewhere, join(dir, 'scansci-pdf'));
  const first = run(['skills', 'install', '--dir', dir]);
  rejects(first, /point elsewhere/);
  assert.equal(realpathSync(join(dir, 'scansci-pdf')), realpathSync(elsewhere));
  const forced = run(['skills', 'install', '--dir', dir, '--force']);
  succeeds(forced);
  assert.equal(realpathSync(join(dir, 'scansci-pdf')), join(bundledRoot, 'scansci-pdf'));
});

test('skills uninstall removes only our links, never foreign entries', () => {
  const dir = fixture();
  mkdirSync(dir, { recursive: true });
  symlinkSync('/nonexistent-somewhere', join(dir, 'other-tool'));
  run(['skills', 'install', '--dir', dir]);
  const result = run(['skills', 'uninstall', '--dir', dir]);
  succeeds(result);
  assert.match(result.stdout, /2 removed/);
  for (const name of ['metis-router', 'scansci-pdf']) {
    assert.equal(lstatSync(join(dir, name), { throwIfNoEntry: false }), undefined);
  }
  assert.ok(lstatSync(join(dir, 'other-tool')).isSymbolicLink(), 'foreign link kept');
});

test('--skill narrows install and uninstall to the named skills', () => {
  const dir = fixture();
  const install = run(['skills', 'install', '--dir', dir, '--skill', 'metis-router']);
  succeeds(install);
  assert.ok(lstatSync(join(dir, 'metis-router')).isSymbolicLink());
  assert.equal(lstatSync(join(dir, 'scansci-pdf'), { throwIfNoEntry: false }), undefined);
  const unknown = run(['skills', 'install', '--dir', dir, '--skill', 'nope']);
  rejects(unknown, /Unknown bundled skill/);
  const uninstall = run(['skills', 'uninstall', '--dir', dir, '--skill', 'metis-router']);
  succeeds(uninstall);
  assert.equal(lstatSync(join(dir, 'metis-router'), { throwIfNoEntry: false }), undefined);
});

test('skills list reports link state for every bundled skill', () => {
  const dir = fixture();
  const before = run(['skills', 'list', '--dir', dir]);
  succeeds(before);
  assert.match(before.stdout, /metis-router\tmissing/);
  assert.match(before.stdout, /scansci-pdf\tmissing/);
  run(['skills', 'install', '--dir', dir, '--skill', 'metis-router']);
  const after = run(['skills', 'list', '--dir', dir]);
  succeeds(after);
  assert.match(after.stdout, /metis-router\tlinked/);
  assert.match(after.stdout, /scansci-pdf\tmissing/);
});

test('a symlink used as the skill directory itself is refused', () => {
  const dir = fixture();
  const real = mkdtempSync(join(tmpdir(), 'metis-os-real-'));
  symlinkSync(real, dir);
  const result = run(['skills', 'install', '--dir', dir]);
  rejects(result, /must be a real directory/);
});
