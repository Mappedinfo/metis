// Canonical workflow definitions remain outside skills; release copies are generated.
import { cpSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { hashTree } from '../packages/metis-os/lib/skills.js';
const root = fileURLToPath(new URL('../', import.meta.url));
const source = join(root, 'workflows');
const dest = join(root, 'packages/metis-os/workflows');
const names = readdirSync(source).filter(name => lstatSync(join(source, name)).isDirectory()).sort();
if (!names.length) throw new Error('No workflow definitions');
function files(dir, prefix = '') {
  return readdirSync(dir).sort().flatMap(name => {
    const path = join(dir, name), stat = lstatSync(path), rel = prefix ? `${prefix}/${name}` : name;
    if (stat.isSymbolicLink()) throw new Error(`Workflow symlink refused: ${rel}`);
    return stat.isDirectory() ? files(path, rel) : [rel];
  });
}
const entries = names.map(name => {
  if (!/^[a-z][a-z0-9-]*$/.test(name)) throw new Error('Invalid workflow name');
  const dir = join(source, name);
  files(dir);
  const def = JSON.parse(readFileSync(join(dir, 'workflow.json'), 'utf8'));
  if (def.id !== name || def.schema_version !== 1 || def.max_revisions !== 1 || def.max_continuations !== 1) throw new Error(`Invalid workflow: ${name}`);
  for (const file of ['workflow.md', 'workflow.zh.md']) if (!lstatSync(join(dir, file)).isFile()) throw new Error(`Missing ${name}/${file}`);
  return { name, sha256: hashTree(dir) };
});
const manifest = JSON.stringify({ schema_version: 1, workflows: entries }, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (lstatSync(dest).isSymbolicLink()) throw new Error('Workflow bundle must not be a symlink');
  if (readdirSync(dest).filter(name => name !== 'manifest.json').sort().join('\n') !== names.join('\n')) throw new Error('Stale workflow bundle');
  for (const { name, sha256 } of entries) if (hashTree(join(dest, name)) !== sha256) throw new Error(`Stale workflow bundle: ${name}`);
  if (readFileSync(join(dest, 'manifest.json'), 'utf8') !== manifest) throw new Error('Stale workflow manifest');
  console.log('Workflow bundle matches canonical sources.');
} else {
  const stat = lstatSync(dest, { throwIfNoEntry: false });
  if (stat?.isSymbolicLink() || (stat && !stat.isDirectory())) throw new Error('Workflow bundle must be a real directory');
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  for (const name of names) cpSync(join(source, name), join(dest, name), { recursive: true });
  writeFileSync(join(dest, 'manifest.json'), manifest);
  console.log(`Bundled ${names.length} canonical workflows.`);
}
