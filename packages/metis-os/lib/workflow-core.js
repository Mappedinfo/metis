// Local, bounded workflow receipts. Hashes establish artifact/receipt identity;
// the checks in a verification receipt remain model attestations, not proof of
// factual accuracy or successful semantic review. This module never runs a model.

import { createHash, randomUUID } from 'node:crypto';
import {
  chmodSync, closeSync, constants, existsSync, fstatSync, fsyncSync, lstatSync,
  mkdirSync, openSync, readSync, realpathSync, renameSync, unlinkSync, writeFileSync,
} from 'node:fs';
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const MAX_BYTES = 2_000_000;
const HASH = /^[a-f0-9]{64}$/;
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const STATUSES = new Set(['drafting', 'drafted', 'reviewed', 'revised', 'ready', 'blocked', 'cancelled']);
const PROTECTED = new Set(['.metis', '.git', '.hg', '.svn', '.codex', '.agents', '.claude', '.dsh', '.cursor', '.config', '.vscode', '.idea', 'node_modules', 'config']);

function fail(message, code = 'WORKFLOW_INVALID') {
  const error = new Error(message);
  error.code = code;
  throw error;
}

function hash(bytes) { return createHash('sha256').update(bytes).digest('hex'); }
function entry(path) {
  try { return lstatSync(path); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
function string(value, label, max = MAX_BYTES) {
  if (typeof value !== 'string' || !value.trim() || Buffer.byteLength(value) > max || value.includes('\0')) {
    fail(`${label} must be a nonempty bounded string`);
  }
  return value;
}
function exactKeys(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
      || Object.keys(value).length !== keys.length || keys.some((key) => !Object.hasOwn(value, key))) {
    fail(`${label} has invalid or missing fields`);
  }
}

function projectRoot(root) {
  string(root, 'root', 32_768);
  const resolved = resolve(root);
  const stat = entry(resolved);
  if (!stat?.isDirectory() || stat.isSymbolicLink()) fail('root must be an existing real directory');
  // Canonicalize OS aliases such as macOS /var -> /private/var once. All paths
  // beneath this root are then checked component by component without symlinks.
  return realpathSync(resolved);
}

function contained(root, path) {
  const rel = relative(root, path);
  if (!rel || rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) fail('Path must stay inside the project');
  return rel;
}

function safePath(root, path, { directory = false, missing = false } = {}) {
  const rel = contained(root, path);
  let current = root;
  const parts = rel.split(sep);
  for (let i = 0; i < parts.length; i++) {
    current = join(current, parts[i]);
    const stat = entry(current);
    if (!stat && missing) return path;
    if (!stat) fail(`Missing path: ${rel}`);
    if (stat.isSymbolicLink()) fail(`Symlinks are not allowed: ${rel}`);
    if (i < parts.length - 1 || directory) {
      if (!stat.isDirectory()) fail(`Expected a real directory: ${rel}`);
    } else if (!stat.isFile()) fail(`Expected a regular file: ${rel}`);
  }
  return path;
}

function privateDirectory(root, path, create) {
  const rel = contained(root, path);
  let current = root;
  for (const part of rel.split(sep)) {
    current = join(current, part);
    let stat = entry(current);
    if (!stat) {
      if (!create) return false;
      try { mkdirSync(current, { mode: 0o700 }); }
      catch (error) { if (error.code !== 'EEXIST') throw error; }
      stat = entry(current);
    }
    if (!stat?.isDirectory() || stat.isSymbolicLink()) fail(`Workflow state requires real directories: ${rel}`);
    if (create) chmodSync(current, 0o700);
  }
  return true;
}

function readBounded(root, path) {
  safePath(root, path);
  const fd = openSync(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
  try {
    const stat = fstatSync(fd);
    if (!stat.isFile() || stat.size > MAX_BYTES) fail(`File exceeds ${MAX_BYTES} bytes or is not regular: ${basename(path)}`);
    const buffer = Buffer.alloc(MAX_BYTES + 1);
    let length = 0;
    while (length < buffer.length) {
      const count = readSync(fd, buffer, length, buffer.length - length, null);
      if (!count) break;
      length += count;
    }
    if (length > MAX_BYTES) fail(`File exceeds ${MAX_BYTES} bytes: ${basename(path)}`);
    const bytes = buffer.subarray(0, length);
    let text;
    try { text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes); }
    catch { fail(`File must contain valid UTF-8: ${basename(path)}`); }
    if (text.includes('\0')) fail(`File must be plain text without NUL bytes: ${basename(path)}`);
    return { bytes, text, sha256: hash(bytes) };
  } finally { closeSync(fd); }
}

function json(root, path) {
  const content = readBounded(root, path);
  let data;
  try { data = JSON.parse(content.text); }
  catch { fail(`Invalid JSON: ${basename(path)}`); }
  // JSON.parse silently accepts duplicate keys. Receipt identities must not
  // depend on which parser or reviewer reads an ambiguous object first.
  const stack = [];
  for (const match of content.text.matchAll(/"(?:\\[\s\S]|[^"\\])*"|[{}\[\]:,]/g)) {
    const token = match[0];
    if (token === '{') stack.push({ object: true, expectsKey: true, keys: new Set() });
    else if (token === '[') stack.push({ object: false });
    else if (token === '}' || token === ']') stack.pop();
    else if (token === ',' && stack.at(-1)?.object) stack.at(-1).expectsKey = true;
    else if (token.startsWith('"') && stack.at(-1)?.object && stack.at(-1).expectsKey) {
      const frame = stack.at(-1);
      const key = JSON.parse(token);
      if (frame.keys.has(key)) fail(`Duplicate JSON key: ${key}`);
      frame.keys.add(key);
      frame.expectsKey = false;
    }
  }
  return { ...content, data };
}

function atomicWrite(root, path, bytes) {
  safePath(root, dirname(path), { directory: true });
  const previous = entry(path);
  if (previous && (!previous.isFile() || previous.isSymbolicLink() || previous.nlink !== 1)) fail('Refusing unsafe state file');
  const temporary = join(dirname(path), `.${basename(path)}.${randomUUID()}.tmp`);
  const fd = openSync(temporary, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | (constants.O_NOFOLLOW ?? 0), 0o600);
  try { writeFileSync(fd, bytes); fsyncSync(fd); }
  finally { closeSync(fd); }
  try { renameSync(temporary, path); }
  finally { if (existsSync(temporary)) unlinkSync(temporary); }
}

function immutableWrite(root, path, bytes) {
  if (entry(path)) {
    if (readBounded(root, path).sha256 !== hash(bytes)) fail('An immutable workflow snapshot already exists with different content');
    return;
  }
  atomicWrite(root, path, bytes);
}

function context({ root, sessionId }, create = false) {
  const canonical = projectRoot(root);
  const session = hash(string(sessionId, 'sessionId', 32_768));
  const dir = join(canonical, '.metis', 'state', 'writing-review', session);
  return { root: canonical, session, dir, exists: privateDirectory(canonical, dir, create) };
}

async function locked(options, create, fn) {
  const ctx = context(options, create);
  if (!ctx.exists) return fn(ctx, null);
  const path = join(ctx.dir, '.lock');
  const token = randomUUID();
  let acquired = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    safePath(ctx.root, ctx.dir, { directory: true });
    try {
      const fd = openSync(path, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | (constants.O_NOFOLLOW ?? 0), 0o600);
      try { writeFileSync(fd, JSON.stringify({ token, pid: process.pid })); }
      finally { closeSync(fd); }
      acquired = true;
      break;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      const stat = entry(path);
      // The owner may release between our failed open and lstat; retry then.
      if (stat && (!stat.isFile() || stat.isSymbolicLink())) fail('Unsafe workflow lock');
      await delay(10);
    }
  }
  if (!acquired) fail('Workflow state is busy; retry after the current operation. A crashed writer may require removing its stale .lock file.', 'WORKFLOW_LOCKED');
  try { return fn(ctx, loadState(ctx)); }
  finally {
    // Never unlink another writer's lock after unexpected external replacement.
    if (json(ctx.root, path).data.token === token) unlinkSync(path);
  }
}

function runDirectory(ctx, runId) {
  if (!UUID.test(runId ?? '')) fail('Invalid workflow run identity');
  return join(ctx.dir, 'runs', runId);
}

function loadState(ctx) {
  const path = join(ctx.dir, 'current.json');
  if (!entry(path)) return null;
  const pointer = json(ctx.root, path).data;
  exactKeys(pointer, ['schema_version', 'run_id'], 'Current run pointer');
  if (pointer.schema_version !== 1) fail('Unsupported workflow state schema');
  const dir = runDirectory(ctx, pointer.run_id);
  const state = json(ctx.root, join(dir, 'state.json')).data;
  if (state.schema_version !== 1 || state.run_id !== pointer.run_id || state.session_id !== ctx.session
      || !STATUSES.has(state.status) || ![0, 1].includes(state.revision_count) || ![0, 1].includes(state.continuation_count)
      || typeof state.review_requires_revision !== 'boolean' || state.state_dir !== dir) fail('Invalid workflow state');
  string(state.prompt_key, 'Stored prompt_key', 32_768);
  if (state.turn_id !== null) string(state.turn_id, 'Stored turn_id', 32_768);
  if (state.continuation_turn_id !== null) string(state.continuation_turn_id, 'Stored continuation_turn_id', 32_768);
  for (const key of ['draft_sha256', 'final_sha256', 'review_sha256', 'verification_sha256']) {
    if (state[key] !== null && !HASH.test(state[key] ?? '')) fail(`Invalid workflow state ${key}`);
  }
  if (state.artifact !== null && typeof state.artifact !== 'string') fail('Invalid workflow artifact path');
  return state;
}

function saveState(ctx, state) {
  state.updated_at = new Date().toISOString();
  atomicWrite(ctx.root, join(runDirectory(ctx, state.run_id), 'state.json'), JSON.stringify(state, null, 2) + '\n');
  return state;
}

function requireState(state) {
  if (!state) fail('No writing-review run for this session; start one first', 'WORKFLOW_MISSING');
}

function artifactFile(ctx, artifact, state) {
  string(artifact, 'artifact', 32_768);
  const path = resolve(ctx.root, artifact);
  const rel = contained(ctx.root, path);
  const privateBuffer = state && path === join(runDirectory(ctx, state.run_id), 'artifact.md');
  if (!['.md', '.txt'].includes(extname(rel).toLowerCase()) || (!privateBuffer && rel.split(sep).some((part) => PROTECTED.has(part.toLowerCase())))) {
    fail('Artifact must be a .md or .txt file outside workflow, configuration and Git directories');
  }
  const source = readBounded(ctx.root, path);
  if (!source.text.trim()) fail('Artifact must contain nonempty prose');
  if (privateBuffer) chmodSync(path, 0o600);
  return { ...source, artifact: rel.split(sep).join('/') };
}

function receiptFile(ctx, file) {
  string(file, 'receipt file', 32_768);
  return json(ctx.root, resolve(ctx.root, file));
}

function draftSnapshot(ctx, state) {
  const source = readBounded(ctx.root, join(runDirectory(ctx, state.run_id), 'draft.txt'));
  if (source.sha256 !== state.draft_sha256) fail('Captured draft snapshot changed');
  return source;
}

function validateReview(data, state, source) {
  exactKeys(data, ['schema_version', 'run_id', 'draft_sha256', 'coverage', 'findings', 'summary'], 'Review');
  if (data.schema_version !== 1 || data.run_id !== state.run_id || data.draft_sha256 !== state.draft_sha256 || data.coverage !== 'full') {
    fail('Review must cover the full captured draft of this run');
  }
  string(data.summary, 'Review summary');
  if (!Array.isArray(data.findings) || data.findings.length > 1000) fail('Review findings must be an array of at most 1000 items');
  const ids = new Set();
  for (const finding of data.findings) {
    exactKeys(finding, ['id', 'location', 'quote', 'decision', 'reason'], 'Finding');
    string(finding.id, 'Finding id', 128);
    if (ids.has(finding.id)) fail('Finding ids must be unique');
    ids.add(finding.id);
    string(finding.location, 'Finding location', 1024);
    string(finding.reason, 'Finding reason');
    string(finding.quote, 'Finding quote');
    if (!source.text.includes(finding.quote)) fail('Finding quote does not occur in the original draft');
    if (!['keep', 'revise', 'unresolved'].includes(finding.decision)) fail('Unknown finding decision');
  }
  return data;
}

function storedReview(ctx, state) {
  const source = draftSnapshot(ctx, state);
  const review = json(ctx.root, join(runDirectory(ctx, state.run_id), 'review.json'));
  if (review.sha256 !== state.review_sha256) fail('Stored review receipt changed');
  validateReview(review.data, state, source);
  if (review.data.findings.some((item) => item.decision === 'revise') !== state.review_requires_revision) fail('Review revision requirement differs from stored state');
  return review;
}

function validateVerification(data, state, artifactSha) {
  exactKeys(data, ['schema_version', 'run_id', 'artifact_sha256', 'review_sha256', 'checks', 'notes'], 'Verification');
  if (data.schema_version !== 1 || data.run_id !== state.run_id || data.artifact_sha256 !== artifactSha || data.review_sha256 !== state.review_sha256) {
    fail('Verification must identify the current artifact and recorded review for this run');
  }
  exactKeys(data.checks, ['full_text', 'facts_preserved', 'quotes_preserved', 'scope_preserved'], 'Verification checks');
  if (Object.values(data.checks).some((value) => value !== true)) fail('All required verification checks must be true');
  string(data.notes, 'Verification notes');
}

function currentSource(ctx, state) {
  const source = artifactFile(ctx, state.artifact, state);
  draftSnapshot(ctx, state);
  if (state.revision_count === 1) {
    const revision = readBounded(ctx.root, join(runDirectory(ctx, state.run_id), 'revision.txt'));
    if (revision.sha256 !== state.final_sha256) fail('Captured revision snapshot changed');
  }
  const expected = state.revision_count ? state.final_sha256 : state.draft_sha256;
  if (source.sha256 !== expected) fail('Artifact changed after its latest capture; the saved receipts do not cover it');
  return source;
}

function inspect(ctx, state) {
  if (!state) return { state: null, ready: false, reason: 'No writing-review run for this session' };
  if (state.status === 'cancelled') return { state, ready: false, reason: state.cancel_reason ?? 'Run cancelled' };
  if (state.status === 'blocked') return { state, ready: false, reason: state.blocked_reason ?? 'Run blocked; report remaining work' };
  try {
    if (state.status === 'drafting') return { state, ready: false, reason: 'Capture the complete draft artifact' };
    currentSource(ctx, state);
    if (state.status === 'drafted') return { state, ready: false, reason: 'Record a full-context prose-audit review' };
    const review = storedReview(ctx, state).data;
    if (review.findings.some((item) => item.decision === 'unresolved')) return { state, ready: false, reason: 'Review has unresolved findings; report them without claiming completion' };
    if (state.review_requires_revision && state.revision_count === 0) return { state, ready: false, reason: 'Revise once and capture the changed artifact' };
    if (state.status !== 'ready') return { state, ready: false, reason: 'Verify the complete final artifact and record the preservation checks' };
    const verification = json(ctx.root, join(runDirectory(ctx, state.run_id), 'verification.json'));
    if (verification.sha256 !== state.verification_sha256) fail('Stored verification receipt changed');
    validateVerification(verification.data, state, state.final_sha256);
    return { state, ready: true, reason: 'Artifact and review/verification receipts match; semantic checks are model attestations' };
  } catch (error) {
    return { state, ready: false, reason: error.message };
  }
}

/** New trusted turns can start new runs. A no-turn internal prompt cannot reset
 * an incomplete run's budgets. Identical completed hook events stay idempotent. */
export async function startRun({ root, sessionId, promptKey, turnId = null, runtime = 'codex', sources = {} }) {
  string(promptKey, 'promptKey', 32_768);
  if (turnId !== null) string(turnId, 'turnId', 32_768);
  if (!['codex', 'dsh', 'manual'].includes(runtime)) fail('Unsupported workflow runtime');
  if (!sources || typeof sources !== 'object' || Array.isArray(sources) || Object.keys(sources).length > 12) fail('Invalid workflow source manifest');
  for (const [key, value] of Object.entries(sources)) {
    if (!/^[a-z][a-z0-9_]{0,63}$/.test(key)) fail('Invalid workflow source manifest key');
    string(value, 'Source manifest value', 32_768);
    if (key.endsWith('_sha256') && !HASH.test(value)) fail('Invalid workflow source hash');
  }
  return locked({ root, sessionId }, true, (ctx, previous) => {
    const sameTurn = previous?.turn_id === turnId || (turnId !== null && previous?.continuation_turn_id === turnId);
    if (previous && (((turnId !== null && sameTurn) || (sameTurn && previous.prompt_key === promptKey))
        || (!['ready', 'cancelled'].includes(previous.status) && (turnId === null || sameTurn)))) return previous;
    const runId = randomUUID();
    const stateDir = runDirectory(ctx, runId);
    privateDirectory(ctx.root, stateDir, true);
    const state = {
      schema_version: 1, run_id: runId, session_id: ctx.session, prompt_key: promptKey,
      turn_id: turnId, continuation_turn_id: null, runtime, status: 'drafting', artifact: null,
      draft_sha256: null, final_sha256: null, review_sha256: null, verification_sha256: null,
      revision_count: 0, continuation_count: 0, review_requires_revision: false,
      state_dir: stateDir, sources: { ...sources }, created_at: new Date().toISOString(),
    };
    saveState(ctx, state);
    atomicWrite(ctx.root, join(ctx.dir, 'current.json'), JSON.stringify({ schema_version: 1, run_id: runId }) + '\n');
    return state;
  });
}

export async function getRun(options) {
  return locked(options, false, (_ctx, state) => state);
}

export async function captureDraft({ root, sessionId, artifact }) {
  return locked({ root, sessionId }, false, (ctx, state) => {
    requireState(state);
    const source = artifactFile(ctx, artifact, state);
    if (state.artifact === source.artifact && state.draft_sha256 === source.sha256 && state.status === 'drafted') {
      draftSnapshot(ctx, state);
      return state;
    }
    if (state.status !== 'drafting') fail('Draft capture is only available before review; start a new user turn for another artifact');
    immutableWrite(ctx.root, join(runDirectory(ctx, state.run_id), 'draft.txt'), source.bytes);
    return saveState(ctx, { ...state, status: 'drafted', artifact: source.artifact, draft_sha256: source.sha256, final_sha256: source.sha256 });
  });
}

export async function recordReview({ root, sessionId, file }) {
  return locked({ root, sessionId }, false, (ctx, state) => {
    requireState(state);
    if (state.status !== 'drafted') fail('Review can only be recorded for the captured draft');
    const source = currentSource(ctx, state);
    const review = receiptFile(ctx, file);
    validateReview(review.data, state, source);
    const unresolved = review.data.findings.some((item) => item.decision === 'unresolved');
    const revise = review.data.findings.some((item) => item.decision === 'revise');
    immutableWrite(ctx.root, join(runDirectory(ctx, state.run_id), 'review.json'), review.bytes);
    return saveState(ctx, { ...state, review_sha256: review.sha256, review_requires_revision: revise,
      status: unresolved ? 'blocked' : 'reviewed', ...(unresolved ? { blocked_reason: 'Review has unresolved findings' } : {}) });
  });
}

export async function captureRevision({ root, sessionId }) {
  return locked({ root, sessionId }, false, (ctx, state) => {
    requireState(state);
    if (state.status !== 'reviewed' || !state.review_requires_revision || state.revision_count !== 0) fail('Only one revision is allowed, and only for review findings marked revise');
    const review = storedReview(ctx, state).data;
    if (review.findings.some((item) => item.decision === 'unresolved')) fail('Unresolved findings prevent revision completion');
    const source = artifactFile(ctx, state.artifact, state);
    if (source.sha256 === state.draft_sha256) fail('A required revision must change the captured artifact');
    immutableWrite(ctx.root, join(runDirectory(ctx, state.run_id), 'revision.txt'), source.bytes);
    return saveState(ctx, { ...state, status: 'revised', revision_count: 1, final_sha256: source.sha256 });
  });
}

export async function recordVerification({ root, sessionId, file }) {
  return locked({ root, sessionId }, false, (ctx, state) => {
    requireState(state);
    if (!['reviewed', 'revised', 'ready'].includes(state.status)) fail('Verification requires a completed review and any required revision');
    const review = storedReview(ctx, state).data;
    if (review.findings.some((item) => item.decision === 'unresolved') || (state.review_requires_revision && state.revision_count !== 1)) fail('Review findings still require work');
    const source = currentSource(ctx, state);
    const receipt = receiptFile(ctx, file);
    validateVerification(receipt.data, state, source.sha256);
    immutableWrite(ctx.root, join(runDirectory(ctx, state.run_id), 'verification.json'), receipt.bytes);
    return saveState(ctx, { ...state, status: 'ready', final_sha256: source.sha256, verification_sha256: receipt.sha256 });
  });
}

export async function inspectRun(options) {
  return locked(options, false, inspect);
}

export async function requestContinuation(options) {
  return locked(options, false, (ctx, state) => {
    const result = inspect(ctx, state);
    if (!state || result.ready || state.status === 'cancelled') return { continue: false, state, reason: result.reason };
    if (state.continuation_count >= 1) {
      if (state.status === 'blocked') return { continue: false, state, reason: result.reason };
      const blocked = saveState(ctx, { ...state, status: 'blocked', blocked_reason: `Continuation budget exhausted. Remaining work: ${result.reason}` });
      return { continue: false, state: blocked, reason: blocked.blocked_reason };
    }
    const updated = saveState(ctx, { ...state, continuation_count: 1 });
    return { continue: true, state: updated, reason: result.reason };
  });
}

/** Associate the runtime's single hook-generated user turn with this run.
 * Adapters call this only after recognizing their exact continuation marker.
 * It never creates a run, replenishes a budget or permits a second association. */
export async function resumeContinuation({ root, sessionId, runId, turnId }) {
  string(turnId, 'Continuation turnId', 32_768);
  return locked({ root, sessionId }, false, (ctx, state) => {
    requireState(state);
    if (state.run_id !== runId || state.continuation_count !== 1 || ['ready', 'cancelled'].includes(state.status)) fail('No pending continuation matches this run');
    if (state.continuation_turn_id === turnId) return state;
    if (state.continuation_turn_id !== null) fail('The single continuation turn is already associated with this run');
    return saveState(ctx, { ...state, continuation_turn_id: turnId });
  });
}

export async function cancelRun({ root, sessionId, reason }) {
  string(reason, 'Cancellation reason', 16_384);
  return locked({ root, sessionId }, false, (ctx, state) => {
    requireState(state);
    if (state.status === 'cancelled' && state.cancel_reason === reason) return state;
    return saveState(ctx, { ...state, status: 'cancelled', cancel_reason: reason });
  });
}
