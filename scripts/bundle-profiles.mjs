// Build release assets from the repository's canonical profiles. Never hand-edit
// packages/metis-os/profiles: npm pack regenerates it before creating a tarball.
import { readdirSync, readFileSync, mkdirSync, writeFileSync, rmSync, lstatSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = join(root, 'profiles');
const dest = join(root, 'packages/metis-os/profiles');
const files = readdirSync(source).filter((name) => name.endsWith('.yaml')).sort();
if (!files.length) throw new Error('No canonical profiles found');
const entries = files.map((file) => {
  if (!/^[a-z][a-z0-9-]*\.yaml$/.test(file) || !lstatSync(join(source, file)).isFile()) {
    throw new Error(`Profile must be a named regular YAML file: ${file}`);
  }
  const data = readFileSync(join(source, file));
  return { name: file.slice(0, -5), file, data, sha256: createHash('sha256').update(data).digest('hex') };
});
const manifest = JSON.stringify({ schema_version: 1, profiles: entries.map(({ name, file, sha256 }) => ({ name, file, sha256 })) }, null, 2) + '\n';

if (process.argv.includes('--check')) {
  for (const { file, data } of entries) {
    if (!readFileSync(join(dest, file)).equals(data)) throw new Error(`Stale profile bundle: ${file}`);
  }
  if (readFileSync(join(dest, 'manifest.json'), 'utf8') !== manifest ||
      readdirSync(dest).sort().join('\n') !== [...files, 'manifest.json'].sort().join('\n')) {
    throw new Error('Stale profile manifest; run npm run profiles:bundle');
  }
  console.log('Profile bundle matches canonical sources.');
} else {
  // This directory contains only generated package assets; the canonical source
  // is never removed. Reject a replaced destination instead of following it.
  try {
    if (lstatSync(dest).isSymbolicLink()) throw new Error('Profile bundle destination must not be a symlink');
    rmSync(dest, { recursive: true });
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  mkdirSync(dest, { recursive: true });
  for (const { file, data } of entries) writeFileSync(join(dest, file), data);
  writeFileSync(join(dest, 'manifest.json'), manifest);
  console.log(`Bundled ${entries.length} canonical profiles into ${resolve(dest)}.`);
}
