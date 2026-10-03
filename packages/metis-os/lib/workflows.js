// Project opt-in and CLI for the independent workflow layer. No global config edits.
import { lstatSync, readFileSync, realpathSync, mkdirSync, writeFileSync, renameSync, unlinkSync } from 'node:fs';
import { dirname, join, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import * as core from './workflow-core.js';

const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const hookEntry = join(packageRoot, 'bin/metis-hook.js');
const ID = 'writing-review';
const EVENTS = ['UserPromptSubmit', 'Stop'];
const LIMIT = 1_000_000;
export const shellQuote = value => "'" + value.replaceAll("'", "'\"'\"'") + "'";
const stat = path => lstatSync(path, { throwIfNoEntry: false });
const text = data => JSON.stringify(data, null, 2) + '\n';

function checkedPath(root, path) {
  const target = resolve(root, path);
  const rel = relative(root, target);
  if (!rel || rel === '..' || rel.startsWith('..' + sep) || resolve(root, rel) !== target) throw new Error('Expected a path inside the project');
  let cursor = root;
  for (const part of rel.split(sep)) {
    cursor = join(cursor, part);
    const info = stat(cursor);
    if (info?.isSymbolicLink()) throw new Error(`Refusing symlink: ${cursor}`);
    if (info && cursor !== target && !info.isDirectory()) throw new Error(`Not a directory: ${cursor}`);
  }
  return target;
}
function readOptional(root, rel) {
  const path = checkedPath(root, rel), info = stat(path);
  if (!info) return null;
  if (!info.isFile() || info.size > LIMIT) throw new Error(`Expected a bounded regular file: ${path}`);
  return readFileSync(path, 'utf8');
}
function readJSON(root, rel, fallback = null) {
  const raw = readOptional(root, rel);
  if (raw === null) return fallback;
  const data = JSON.parse(raw);
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error(`Expected JSON object: ${rel}`);
  return data;
}
function writePlan(root, changes) {
  // Preflight every destination before changing any file. Preserve foreign content.
  for (const [rel] of changes) readOptional(root, rel);
  let changed = 0;
  for (const [rel, data] of changes) {
    const path = checkedPath(root, rel);
    if (readOptional(root, rel) === data) continue;
    mkdirSync(dirname(path), { recursive: true });
    const temp = `${path}.metis-${process.pid}-${createHash('sha256').update(rel).digest('hex').slice(0, 8)}.tmp`;
    let created = false;
    try {
      writeFileSync(temp, data, { flag: 'wx', mode: 0o600 }); created = true;
      renameSync(temp, path); changed++;
    } finally {
      if (created && stat(temp)) unlinkSync(temp);
    }
  }
  return changed;
}
function ignored(root, rel, lines) {
  const raw = readOptional(root, rel) ?? '';
  const existing = new Set(raw.split(/\r?\n/));
  const additions = lines.filter(line => !existing.has(line));
  return additions.length ? raw + (raw && !raw.endsWith('\n') ? '\n' : '') + additions.join('\n') + '\n' : raw;
}
function configValid(config) {
  if (config.schema_version !== 1 || config.workflow !== ID || typeof config.enabled !== 'boolean' || !['auto', 'explicit'].includes(config.activation?.mode)) throw new Error('Unsupported .metis/workflows.json');
  if (config.runtime !== undefined && !['codex', 'dsh'].includes(config.runtime)) throw new Error('Invalid configured runtime');
  for (const field of ['include', 'exclude']) {
    if (!Array.isArray(config.activation[field]) || config.activation[field].length > 32 || config.activation[field].some(v => typeof v !== 'string' || !v || v.length > 512)) throw new Error(`Invalid activation.${field}`);
    for (const expr of config.activation[field]) new RegExp(expr, 'iu');
  }
}
function hookConfigValid(config) {
  if (config.hooks === undefined) config.hooks = {};
  if (!config.hooks || typeof config.hooks !== 'object' || Array.isArray(config.hooks)) throw new Error('Invalid hooks configuration');
  for (const event of EVENTS) if (config.hooks[event] !== undefined && !Array.isArray(config.hooks[event])) throw new Error(`Invalid hooks.${event}`);
}
function removeOwned(config, previous) {
  hookConfigValid(config);
  if (!previous) return;
  for (const event of EVENTS) {
    const groups = config.hooks[event] ?? [];
    const owned = previous.groups?.[event];
    if (!owned) throw new Error('Invalid metis installation record');
    const index = groups.findIndex(group => JSON.stringify(group) === JSON.stringify(owned));
    if (index < 0) throw new Error(`The installed ${event} hook was changed or removed; reconcile it before reinstalling/uninstalling`);
    groups.splice(index, 1);
    if (!groups.length) delete config.hooks[event];
  }
}
export function installWorkflow({ project = process.cwd(), runtime, activation } = {}) {
  if (!['codex', 'dsh'].includes(runtime)) throw new Error('--runtime must be codex or dsh');
  if (activation !== undefined && !['auto', 'explicit'].includes(activation)) throw new Error('--activation must be auto or explicit');
  const root = realpathSync(project);
  if (!stat(root)?.isDirectory()) throw new Error('Project must be a directory');
  const definition = JSON.parse(readFileSync(join(packageRoot, 'workflows', ID, 'workflow.json'), 'utf8'));
  if (definition.id !== ID || definition.max_revisions !== 1 || definition.max_continuations !== 1) throw new Error('Unsupported workflow bundle');
  // Verify required runtime assets before writing any opt-in configuration.
  for (const file of [hookEntry, join(packageRoot, 'workflows', ID, 'workflow.md'), join(packageRoot, 'skills', definition.skill, 'SKILL.md')]) if (!stat(file)?.isFile()) throw new Error(`Missing runtime asset: ${file}; build the source bundles first`);
  const recordPath = `.metis/adapters/${runtime}/installation.json`;
  const previous = readJSON(root, recordPath);
  const target = runtime === 'codex' ? '.codex/hooks.json' : '.metis/adapters/dsh/hooks.json';
  if (previous && (previous.schema_version !== 1 || previous.runtime !== runtime || previous.target !== target)) throw new Error('Invalid metis installation record');
  const config = readJSON(root, '.metis/workflows.json', { schema_version: 1, enabled: true, workflow: ID, activation: definition.activation });
  configValid(config);
  if (config.runtime !== undefined && config.runtime !== runtime) throw new Error(`Workflow is restricted to ${config.runtime}; reconcile .metis/workflows.json before installing ${runtime}`);
  config.enabled = true;
  if (activation !== undefined) config.activation.mode = activation;
  const hooks = readJSON(root, target, { hooks: {} });
  removeOwned(hooks, previous);
  const command = [process.execPath, hookEntry, '--runtime', runtime, '--project', root].map(shellQuote).join(' ');
  const groups = {};
  for (const event of EVENTS) {
    const handler = { type: 'command', command, timeout: 10, statusMessage: 'Checking the metis writing workflow' };
    if (runtime === 'codex') handler.additionalContextLimit = 0;
    groups[event] = { hooks: [handler] };
    (hooks.hooks[event] ??= []).push(groups[event]);
  }
  const record = { schema_version: 1, runtime, workflow: ID, target, groups };
  const changes = [
    ['.metis/workflows.json', text(config)],
    ['.metis/.gitignore', ignored(root, '.metis/.gitignore', ['/state/', '/adapters/'])],
    [target, text(hooks)], [recordPath, text(record)],
  ];
  if (runtime === 'codex') changes.push(['.codex/.gitignore', ignored(root, '.codex/.gitignore', ['/hooks.json'])]);
  else {
    const patch = `# Load this patch in the intended DSH composition; installation does not restart DSH.\n- insert:\n    - id: metis-writing-review\n      name: '@deepseek-ai/dsh-hooks-codex'\n      config:\n        configPath: ${JSON.stringify(join(root, target))}\n        defaultTimeoutMs: 10000\n`;
    const patchPath = '.metis/adapters/dsh/cordis.patch.yml';
    const existing = readOptional(root, patchPath);
    if (existing !== null && previous?.patch_sha256 !== createHash('sha256').update(existing).digest('hex')) throw new Error('DSH patch was changed; preserve/reconcile it before reinstalling');
    record.patch_sha256 = createHash('sha256').update(patch).digest('hex');
    changes.find(([rel]) => rel === recordPath)[1] = text(record);
    changes.push([patchPath, patch]);
  }
  const changed = writePlan(root, changes);
  return { workflow: ID, runtime, project: root, changed_files: changed, hooks: join(root, target), activation_verified: false, next: runtime === 'codex' ? 'Review and trust the generated hooks using /hooks in Codex, then verify a new writing request.' : 'Load the generated cordis.patch.yml in the intended DSH composition, then verify a new writing request.' };
}
export function uninstallWorkflow({ project = process.cwd(), runtime } = {}) {
  if (!['codex', 'dsh'].includes(runtime)) throw new Error('--runtime must be codex or dsh');
  const root = realpathSync(project), recordPath = `.metis/adapters/${runtime}/installation.json`;
  const previous = readJSON(root, recordPath);
  if (!previous) return { runtime, removed: false };
  const target = runtime === 'codex' ? '.codex/hooks.json' : '.metis/adapters/dsh/hooks.json';
  if (previous.target !== target || previous.runtime !== runtime || previous.schema_version !== 1) throw new Error('Invalid metis installation record');
  const hooks = readJSON(root, target);
  if (!hooks) throw new Error('Installed hook file is missing');
  removeOwned(hooks, previous);
  const changes = [[target, text(hooks)]];
  const other = runtime === 'codex' ? 'dsh' : 'codex';
  if (!readJSON(root, `.metis/adapters/${other}/installation.json`)) {
    const config = readJSON(root, '.metis/workflows.json');
    if (config) { configValid(config); config.enabled = false; changes.push(['.metis/workflows.json', text(config)]); }
  }
  let removablePatch = null;
  if (runtime === 'dsh') {
    const patchPath = '.metis/adapters/dsh/cordis.patch.yml';
    const patch = readOptional(root, patchPath);
    if (patch !== null && previous.patch_sha256 === createHash('sha256').update(patch).digest('hex')) removablePatch = checkedPath(root, patchPath);
  }
  writePlan(root, changes);
  if (removablePatch) unlinkSync(removablePatch);
  unlinkSync(checkedPath(root, recordPath));
  return { runtime, removed: true, state_preserved: true, note: 'Review history and any edited patch are preserved; remove the DSH mount separately if it was enabled.' };
}

const USAGE = 'metis-os workflows install writing-review --runtime codex|dsh [--project PATH] [--activation auto|explicit]\nmetis-os workflows uninstall --runtime codex|dsh [--project PATH]\nmetis-os workflows status|capture|review|revise|verify|cancel --session ID [--project PATH] [--artifact PATH|--file JSON|--reason TEXT]';
export async function cmdWorkflows(args) {
  const [command, ...rest] = args;
  const opts = {};
  if (command === 'install' && rest.shift() !== ID) throw new Error(USAGE);
  const allowed = command === 'install' ? ['runtime', 'project', 'activation'] : command === 'uninstall' ? ['runtime', 'project'] : ['session', 'project', ...(command === 'capture' ? ['artifact'] : ['review', 'verify'].includes(command) ? ['file'] : command === 'cancel' ? ['reason'] : [])];
  for (let i = 0; i < rest.length; i += 2) {
    const key = rest[i].slice(2), value = rest[i + 1];
    if (!rest[i].startsWith('--') || !allowed.includes(key) || key in opts || value === undefined || value.startsWith('--')) throw new Error(USAGE);
    opts[key] = value;
  }
  let result;
  if (command === 'install') result = installWorkflow(opts);
  else if (command === 'uninstall') result = uninstallWorkflow(opts);
  else {
    if (!opts.session) throw new Error(USAGE);
    const input = { root: realpathSync(opts.project ?? process.cwd()), sessionId: opts.session };
    if (command === 'status') result = await core.inspectRun(input);
    else if (command === 'capture' && opts.artifact) result = await core.captureDraft({ ...input, artifact: opts.artifact });
    else if (command === 'review' && opts.file) result = await core.recordReview({ ...input, file: opts.file });
    else if (command === 'revise') result = await core.captureRevision(input);
    else if (command === 'verify' && opts.file) result = await core.recordVerification({ ...input, file: opts.file });
    else if (command === 'cancel' && opts.reason) result = await core.cancelRun({ ...input, reason: opts.reason });
    else throw new Error(USAGE);
  }
  console.log(text(result).trimEnd());
  return result;
}
