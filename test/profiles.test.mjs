import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, symlinkSync, rmSync, readdirSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { installProfiles, profilePath } from '../packages/metis-os/lib/profiles.js';

const root = fileURLToPath(new URL('../', import.meta.url));
function fixture(t) {
  const cwd = mkdtempSync(join(tmpdir(), 'metis-profile-test-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  return cwd;
}
function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', env: { ...process.env, DISABLE_TELEMETRY: '1', DO_NOT_TRACK: '1' } });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  return result.stdout;
}

test('install delivers canonical YAML and repeats without changing local variants', (t) => {
  const cwd = fixture(t);
  assert.equal(installProfiles({ cwd }).installed, 2);
  for (const name of ['journal', 'deck']) {
    assert.deepEqual(readFileSync(profilePath(name, cwd)), readFileSync(join(root, 'profiles', `${name}.yaml`)));
  }
  assert.equal(installProfiles({ cwd }).installed, 0);
  writeFileSync(join(cwd, 'profiles/custom.yaml'), 'name: custom\n');
  installProfiles({ cwd });
  assert.equal(readFileSync(join(cwd, 'profiles/custom.yaml'), 'utf8'), 'name: custom\n');
});

test('conflict preflight preserves every file and --force replaces only bundled names', (t) => {
  const cwd = fixture(t);
  mkdirSync(join(cwd, 'profiles'));
  writeFileSync(join(cwd, 'profiles/journal.yaml'), 'local journal');
  assert.throws(() => installProfiles({ cwd }), /differs/);
  assert.equal(existsSync(join(cwd, 'profiles/deck.yaml')), false);
  assert.equal(readFileSync(join(cwd, 'profiles/journal.yaml'), 'utf8'), 'local journal');
  assert.equal(installProfiles({ cwd, force: true }).installed, 2);
});

test('install never follows profile directory or file symlinks, even with --force', (t) => {
  const cwd = fixture(t);
  const outside = fixture(t);
  symlinkSync(outside, join(cwd, 'profiles'), 'dir');
  assert.throws(() => installProfiles({ cwd, force: true }), /real directory/);
  assert.deepEqual(readdirSync(outside), []);
  rmSync(join(cwd, 'profiles'));
  mkdirSync(join(cwd, 'profiles'));
  const sentinel = join(outside, 'private.yaml');
  writeFileSync(sentinel, 'private sentinel');
  symlinkSync(sentinel, join(cwd, 'profiles/journal.yaml'));
  assert.throws(() => installProfiles({ cwd, force: true }), /regular file/);
  assert.equal(readFileSync(sentinel, 'utf8'), 'private sentinel');
  assert.equal(existsSync(join(cwd, 'profiles/deck.yaml')), false);
});

test('profile resolver rejects traversal and gives a recovery step for missing profiles', (t) => {
  const cwd = fixture(t);
  assert.throws(() => profilePath('../private', cwd), /profile name/);
  assert.throws(() => profilePath('journal', cwd), /profiles install/);
});

test('a temporary-file collision preserves the existing file', (t) => {
  const cwd = fixture(t);
  mkdirSync(join(cwd, 'profiles'));
  const temp = join(cwd, 'profiles', `deck.yaml.metis-${process.pid}.tmp`);
  writeFileSync(temp, 'existing recovery file');
  assert.throws(() => installProfiles({ cwd }), { code: 'EEXIST' });
  assert.equal(readFileSync(temp, 'utf8'), 'existing recovery file');
  assert.equal(existsSync(join(cwd, 'profiles/deck.yaml')), false);
});

test('npm tarball installs and resolves profiles in a clean consumer project', (t) => {
  const temp = fixture(t);
  run('npm', ['pack', '--workspace', 'metis-os', '--pack-destination', temp, '--json'], root);
  const tarball = readdirSync(temp).find((name) => name.endsWith('.tgz'));
  assert.ok(tarball);
  const consumer = join(temp, 'consumer');
  mkdirSync(consumer);
  run('npm', ['install', '--prefix', consumer, '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', join(temp, tarball)], temp);
  const cli = join(consumer, 'node_modules/metis-os/bin/metis-os.js');
  run(process.execPath, [cli, 'profiles', 'install'], consumer);
  for (const name of ['journal', 'deck']) {
    const installedPath = run(process.execPath, [cli, 'profiles', 'path', name], consumer).trim();
    assert.equal(installedPath, join(realpathSync(consumer), 'profiles', `${name}.yaml`));
    assert.deepEqual(readFileSync(installedPath), readFileSync(join(root, 'profiles', `${name}.yaml`)));
  }
  assert.equal(existsSync(join(consumer, 'USER.md')), false, 'Installing profiles must not scaffold personal state');
});
