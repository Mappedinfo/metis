// Build release assets from the repository's canonical skills. Never hand-edit
// packages/metis-os/skills: npm pack regenerates it before creating a tarball.
import { readdirSync, readFileSync, mkdirSync, writeFileSync, rmSync, lstatSync, cpSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';
import { hashTree } from '../packages/metis-os/lib/skills.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = join(root, 'skills');
const dest = join(root, 'packages/metis-os/skills');
const NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const skills = readdirSync(source).filter((name) => {
  const stat = lstatSync(join(source, name));
  return stat.isDirectory() && !stat.isSymbolicLink();
}).sort();
if (!skills.length) throw new Error('No canonical skills found');
const entries = skills.map((name) => {
  const dir = join(source, name);
  if (!NAME.test(name)) throw new Error(`Skill directory name must be lower-kebab-case: ${name}`);
  if (!lstatSync(join(dir, 'SKILL.md')).isFile()) throw new Error(`Skill is missing SKILL.md: ${name}`);
  return { name, dir, sha256: hashTree(dir) };
});
const manifest = JSON.stringify({ schema_version: 1, skills: entries.map(({ name, sha256 }) => ({ name, sha256 })) }, null, 2) + '\n';

function treeFiles(dir, prefix = '') {
  return readdirSync(dir).sort().flatMap((name) => {
    const path = join(dir, name);
    const stat = lstatSync(path);
    const rel = prefix ? prefix + '/' + name : name;
    if (stat.isSymbolicLink()) throw new Error(`Skill trees must not contain symlinks: ${rel}`);
    return stat.isDirectory() ? treeFiles(path, rel) : [rel];
  });
}

if (process.argv.includes('--check')) {
  const destEntries = readdirSync(dest).filter((name) => name !== 'manifest.json').sort();
  if (destEntries.join('\n') !== skills.join('\n')) throw new Error('Stale skill bundle; run npm run skills:bundle');
  for (const { name, dir } of entries) {
    const from = treeFiles(dir);
    const to = treeFiles(join(dest, name));
    if (from.join('\n') !== to.join('\n')) throw new Error(`Stale skill bundle files: ${name}`);
    for (const rel of from) {
      if (!readFileSync(join(dir, rel)).equals(readFileSync(join(dest, name, rel)))) {
        throw new Error(`Stale skill bundle: ${name}/${rel}`);
      }
    }
  }
  if (readFileSync(join(dest, 'manifest.json'), 'utf8') !== manifest) {
    throw new Error('Stale skill manifest; run npm run skills:bundle');
  }
  console.log('Skill bundle matches canonical sources.');
} else {
  // This directory contains only generated package assets; the canonical source
  // is never removed. Reject a replaced destination instead of following it.
  try {
    if (lstatSync(dest).isSymbolicLink()) throw new Error('Skill bundle destination must not be a symlink');
    rmSync(dest, { recursive: true });
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  mkdirSync(dest, { recursive: true });
  for (const { name, dir } of entries) cpSync(dir, join(dest, name), { recursive: true });
  writeFileSync(join(dest, 'manifest.json'), manifest);
  console.log(`Bundled ${entries.length} canonical skills into ${resolve(dest)}.`);
}
