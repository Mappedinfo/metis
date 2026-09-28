import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, mkdirSync, writeFileSync, renameSync, unlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const bundled = fileURLToPath(new URL('../profiles/', import.meta.url));

function entry(path) {
  try { return lstatSync(path); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

function bundledProfiles() {
  let manifest;
  try { manifest = JSON.parse(readFileSync(join(bundled, 'manifest.json'), 'utf8')); }
  catch { throw new Error('Profile bundle is missing. In a source checkout, run npm run profiles:bundle first.'); }
  if (manifest.schema_version !== 1 || !Array.isArray(manifest.profiles) || !manifest.profiles.length) {
    throw new Error('Invalid profile bundle manifest');
  }
  const names = new Set();
  return manifest.profiles.map(({ name, file, sha256 }) => {
    if (!/^[a-z][a-z0-9-]*$/.test(name) || file !== `${name}.yaml` || names.has(name)) {
      throw new Error('Invalid or duplicate profile in bundle manifest');
    }
    names.add(name);
    const data = readFileSync(join(bundled, file));
    if (createHash('sha256').update(data).digest('hex') !== sha256) throw new Error(`Corrupt bundled profile: ${name}`);
    return { name, file, data };
  });
}

export function installProfiles({ cwd = process.cwd(), force = false } = {}) {
  const profiles = bundledProfiles();
  const dir = resolve(cwd, 'profiles');
  const dirEntry = entry(dir);
  if (dirEntry && (!dirEntry.isDirectory() || dirEntry.isSymbolicLink())) {
    throw new Error('profiles must be a real directory; symlink destinations are not replaced, even with --force');
  }
  // Preflight the full set before writing anything. A changed local variant is
  // preserved unless replacement is explicitly requested.
  const pending = [];
  for (const profile of profiles) {
    const path = join(dir, profile.file);
    const current = entry(path);
    if (current && (!current.isFile() || current.isSymbolicLink())) {
      throw new Error(`${path} must be a regular file; refusing to replace a symlink or directory`);
    }
    if (current && readFileSync(path).equals(profile.data)) continue;
    if (current && !force) throw new Error(`${path} differs from the bundled profile. Keep it as a named variant, or use profiles install --force to replace it.`);
    pending.push({ ...profile, path });
  }
  mkdirSync(dir, { recursive: true });
  for (const { path, data } of pending) {
    const temp = `${path}.metis-${process.pid}.tmp`;
    let created = false;
    try {
      writeFileSync(temp, data, { flag: 'wx' });
      created = true;
      renameSync(temp, path);
    } finally {
      // An exclusive-create failure means this entry belongs to someone else.
      if (created) {
        try { unlinkSync(temp); } catch (error) { if (error.code !== 'ENOENT') throw error; }
      }
    }
  }
  return { directory: dir, installed: pending.length, unchanged: profiles.length - pending.length };
}

export function profilePath(name, cwd = process.cwd()) {
  if (!/^[a-z][a-z0-9-]*$/.test(name ?? '')) throw new Error('Use a profile name such as journal or deck');
  const path = resolve(cwd, 'profiles', `${name}.yaml`);
  const current = entry(path);
  if (!current?.isFile()) throw new Error(`Profile not found at ${path}; run metis-os profiles install from the project root`);
  return path;
}

export function cmdProfiles(args) {
  if (args[0] === 'install' && args.slice(1).every((arg) => arg === '--force')) {
    const result = installProfiles({ force: args.includes('--force') });
    console.log(`Profiles ready at ${result.directory} (${result.installed} installed, ${result.unchanged} unchanged).`);
    return;
  }
  if (args[0] === 'path' && args.length === 2) {
    console.log(profilePath(args[1]));
    return;
  }
  throw new Error('Usage: metis-os profiles install [--force] | metis-os profiles path <name>');
}
