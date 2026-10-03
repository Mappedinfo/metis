import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { chmodSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { tmpdir } from 'node:os';
import {
  startRun, getRun, captureDraft, recordReview, captureRevision, recordVerification,
  inspectRun, requestContinuation, resumeContinuation, cancelRun,
} from '../lib/workflow-core.js';

const execFileAsync = promisify(execFile);
const coreUrl = new URL('../lib/workflow-core.js', import.meta.url).href;
const hash = (value) => createHash('sha256').update(value).digest('hex');

function fixture(t) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'metis-workflow-core-')));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const options = { root, sessionId: 'private/session/identifier', promptKey: 'write a project note' };
  const write = (file, content) => {
    const path = join(root, file);
    writeFileSync(path, typeof content === 'string' || Buffer.isBuffer(content) ? content : JSON.stringify(content, null, 2) + '\n');
    return path;
  };
  return { root, options, write };
}

function reviewFor(state, findings = []) {
  return { schema_version: 1, run_id: state.run_id, draft_sha256: state.draft_sha256, coverage: 'full', findings, summary: 'Read the full draft; facts and necessary terminology are retained.' };
}

function finding(decision = 'revise') {
  return { id: 'f1', location: 'paragraph 1', quote: 'Very important result.', decision, reason: 'Describe the observed result without an unsupported importance claim.' };
}

function verificationFor(state) {
  return {
    schema_version: 1, run_id: state.run_id, artifact_sha256: state.final_sha256,
    review_sha256: state.review_sha256,
    checks: { full_text: true, facts_preserved: true, quotes_preserved: true, scope_preserved: true },
    notes: 'Read the final text against the captured draft and original evidence; preserved all stated numbers and scope.',
  };
}

async function drafted(f, text = 'Very important result. The internal trial completed 36 of 40 tasks.\r\n') {
  await startRun(f.options);
  f.write('draft.md', text);
  return captureDraft({ ...f.options, artifact: 'draft.md' });
}

async function reviewed(f, findings = []) {
  const state = await drafted(f);
  f.write('review.json', reviewFor(state, findings));
  return recordReview({ ...f.options, file: 'review.json' });
}

async function ready(f) {
  const state = await reviewed(f);
  f.write('verify.json', verificationFor(state));
  return recordVerification({ ...f.options, file: 'verify.json' });
}

test('no-change review binds original bytes, attested checks and private receipts', async (t) => {
  const f = fixture(t);
  const state = await ready(f);
  assert.equal(state.status, 'ready');
  assert.equal(state.revision_count, 0);
  assert.equal(state.final_sha256, hash(readFileSync(join(f.root, 'draft.md'))));
  assert.equal(state.session_id, hash(f.options.sessionId));
  assert.equal(state.state_dir.includes(f.options.sessionId), false);
  assert.deepEqual(readFileSync(join(state.state_dir, 'draft.txt')), readFileSync(join(f.root, 'draft.md')));
  assert.equal(lstatSync(state.state_dir).mode & 0o777, 0o700);
  for (const file of ['draft.txt', 'review.json', 'verification.json', 'state.json']) {
    assert.equal(lstatSync(join(state.state_dir, file)).mode & 0o777, 0o600);
  }
  const inspected = await inspectRun(f.options);
  assert.equal(inspected.ready, true);
  assert.match(inspected.reason, /attestations/);
  assert.equal((await requestContinuation(f.options)).continue, false);
  assert.equal((await getRun(f.options)).continuation_count, 0);
});

test('review requiring revision permits exactly one changed artifact and preserves the draft', async (t) => {
  const f = fixture(t);
  const state = await reviewed(f, [finding()]);
  assert.equal(state.review_requires_revision, true);
  assert.equal((await inspectRun(f.options)).ready, false);
  f.write('verify.json', verificationFor(state));
  await assert.rejects(recordVerification({ ...f.options, file: 'verify.json' }), /still require work/);
  await assert.rejects(captureRevision(f.options), /must change/);
  f.write('draft.md', 'The internal trial completed 36 of 40 tasks.\n');
  const revision = await captureRevision(f.options);
  assert.equal(revision.status, 'revised');
  assert.equal(revision.revision_count, 1);
  assert.notEqual(revision.final_sha256, revision.draft_sha256);
  assert.match(readFileSync(join(revision.state_dir, 'draft.txt'), 'utf8'), /Very important/);
  await assert.rejects(captureRevision(f.options), /Only one revision/);
  f.write('verify.json', verificationFor(revision));
  assert.equal((await recordVerification({ ...f.options, file: 'verify.json' })).status, 'ready');
  assert.equal((await inspectRun(f.options)).ready, true);
});

test('no-change review rejects an unsolicited revision', async (t) => {
  const f = fixture(t);
  await reviewed(f);
  f.write('draft.md', 'Unrequested rewrite.');
  await assert.rejects(captureRevision(f.options), /only for review findings/);
  assert.equal((await inspectRun(f.options)).ready, false);
});

test('chat-only artifact uses only the current run private buffer', async (t) => {
  const f = fixture(t);
  const state = await startRun(f.options);
  const artifact = join(state.state_dir, 'artifact.md');
  writeFileSync(artifact, 'A short email draft.');
  chmodSync(artifact, 0o644);
  const capture = await captureDraft({ ...f.options, artifact });
  assert.equal(capture.artifact, relative(f.root, artifact));
  assert.equal(lstatSync(artifact).mode & 0o777, 0o600);
  writeFileSync(join(state.state_dir, 'other.md'), 'Not the designated buffer.');
  const second = { ...f.options, sessionId: 'another session' };
  await startRun(second);
  await assert.rejects(captureDraft({ ...second, artifact }), /outside workflow/);
  await assert.rejects(captureDraft({ ...second, artifact: join(state.state_dir, 'other.md') }), /outside workflow/);
});

test('duplicate events and capture are idempotent; an explicit new turn preserves run history', async (t) => {
  const f = fixture(t);
  const a = await drafted(f);
  assert.equal((await startRun(f.options)).run_id, a.run_id);
  assert.deepEqual(await captureDraft({ ...f.options, artifact: 'draft.md' }), a);
  const next = await startRun({ ...f.options, turnId: 'new trusted user turn' });
  assert.notEqual(next.run_id, a.run_id);
  assert.equal(next.status, 'drafting');
  assert.equal(JSON.parse(readFileSync(join(a.state_dir, 'state.json'), 'utf8')).status, 'drafted');
  assert.equal((await startRun({ ...f.options, turnId: 'new trusted user turn' })).run_id, next.run_id);
});

test('completed same events stay completed, but a new user request can start a run', async (t) => {
  const f = fixture(t);
  const a = await ready(f);
  assert.equal((await startRun(f.options)).run_id, a.run_id);
  const b = await startRun({ ...f.options, promptKey: 'a different user request' });
  assert.notEqual(b.run_id, a.run_id);
  assert.equal(b.status, 'drafting');
});

test('ready and cancelled runs do not re-arm for changed internal prompts in the same explicit turn', async (t) => {
  const f = fixture(t);
  f.options.turnId = 'one trusted user turn';
  const a = await ready(f);
  const repeated = await startRun({ ...f.options, promptKey: 'a late internal prompt mentioning another writing step' });
  assert.equal(repeated.run_id, a.run_id);
  assert.equal(repeated.status, 'ready');
  await cancelRun({ ...f.options, reason: 'No more work in this turn.' });
  assert.equal((await startRun({ ...f.options, promptKey: 'changed again' })).status, 'cancelled');
  const fresh = await startRun({ ...f.options, turnId: 'next trusted user turn', promptKey: 'changed again' });
  assert.notEqual(fresh.run_id, a.run_id);
  assert.equal(fresh.status, 'drafting');
});

test('untrusted no-turn prompt changes cannot reset pending or exhausted budgets', async (t) => {
  const f = fixture(t);
  const a = await startRun({ ...f.options, runtime: 'dsh' });
  assert.equal((await requestContinuation(f.options)).continue, true);
  const still = await startRun({ ...f.options, runtime: 'dsh', promptKey: 'a tool result or internal continuation' });
  assert.equal(still.run_id, a.run_id);
  assert.equal(still.continuation_count, 1);
  const blocked = await requestContinuation(f.options);
  assert.equal(blocked.state.status, 'blocked');
  assert.match(blocked.reason, /Capture the complete draft/);
  assert.deepEqual(await requestContinuation(f.options), blocked, 'repeated stop must not grow the reason or mutate state');
  const unchanged = await startRun({ ...f.options, runtime: 'dsh', promptKey: 'another internal prompt' });
  assert.equal(unchanged.run_id, a.run_id);
  assert.equal(unchanged.status, 'blocked');
});

test('one hook-generated continuation turn stays on the original run and cannot reset budgets', async (t) => {
  const f = fixture(t);
  const original = await startRun({ ...f.options, turnId: 'original-user-turn' });
  const args = { ...f.options, runId: original.run_id, turnId: 'hook-generated-turn' };
  await assert.rejects(resumeContinuation(args), /No pending continuation/);
  await requestContinuation(f.options);
  await assert.rejects(resumeContinuation({ ...args, runId: 'another run' }), /No pending continuation/);
  const associated = await resumeContinuation(args);
  assert.equal(associated.turn_id, 'original-user-turn');
  assert.equal(associated.continuation_turn_id, 'hook-generated-turn');
  assert.equal(associated.continuation_count, 1);
  assert.deepEqual(await resumeContinuation(args), associated);
  await assert.rejects(resumeContinuation({ ...args, turnId: 'second generated turn' }), /already associated/);
  const repeated = await startRun({ ...f.options, turnId: 'hook-generated-turn', promptKey: 'a new internal message within the continuation' });
  assert.equal(repeated.run_id, original.run_id);
  assert.equal(repeated.continuation_count, 1);
  assert.equal((await requestContinuation(f.options)).continue, false);
  const fresh = await startRun({ ...f.options, turnId: 'genuinely-new-user-turn' });
  assert.notEqual(fresh.run_id, original.run_id);
  assert.equal(fresh.continuation_count, 0);
});

test('sessions are isolated and a lookup without a run leaves the project unchanged', async (t) => {
  const f = fixture(t);
  assert.equal(await getRun(f.options), null);
  assert.equal((await inspectRun(f.options)).ready, false);
  assert.deepEqual(readdirSync(f.root), []);
  const a = await startRun(f.options);
  const b = await startRun({ ...f.options, sessionId: 'another' });
  assert.notEqual(a.session_id, b.session_id);
  assert.notEqual(a.state_dir, b.state_dir);
  await requestContinuation(f.options);
  assert.equal((await getRun({ ...f.options, sessionId: 'another' })).continuation_count, 0);
});

test('a cancelled run never forces another continuation', async (t) => {
  const f = fixture(t);
  await startRun(f.options);
  const state = await cancelRun({ ...f.options, reason: 'User changed the requested deliverable.' });
  assert.equal(state.status, 'cancelled');
  assert.equal((await requestContinuation(f.options)).continue, false);
  assert.equal((await inspectRun(f.options)).ready, false);
  assert.equal((await startRun(f.options)).status, 'cancelled');
  assert.equal((await startRun({ ...f.options, promptKey: 'new task after cancellation' })).status, 'drafting');
});

test('source manifests survive replay unchanged and reject malformed hashes', async (t) => {
  const f = fixture(t);
  const sources = { skill_name: 'prose-audit', skill_sha256: hash('skill'), workflow_sha256: hash('workflow') };
  const initial = await startRun({ ...f.options, sources });
  const replay = await startRun({ ...f.options, sources: { ...sources, skill_sha256: hash('changed') } });
  assert.equal(replay.run_id, initial.run_id);
  assert.deepEqual(replay.sources, sources);
  await assert.rejects(startRun({ ...f.options, sources: { skill_sha256: 'not a digest' } }), /Invalid workflow source hash/);
});

test('review rejects stale identity, fabricated quotes, duplicates, empty reasons and extra fields', async (t) => {
  const f = fixture(t);
  const state = await drafted(f);
  const cases = [
    { ...reviewFor(state), run_id: 'another-run' },
    { ...reviewFor(state), draft_sha256: hash('different draft') },
    { ...reviewFor(state), coverage: 'selected paragraphs' },
    reviewFor(state, [{ ...finding(), quote: 'A sentence that was never in this draft.' }]),
    reviewFor(state, [finding(), finding('keep')]),
    reviewFor(state, [{ ...finding(), reason: ' ' }]),
    reviewFor(state, [{ ...finding(), location: '' }]),
    reviewFor(state, [{ ...finding(), decision: 'probably AI' }]),
    { ...reviewFor(state), authorship_score: 0.9 },
  ];
  for (const data of cases) {
    f.write('review.json', data);
    await assert.rejects(recordReview({ ...f.options, file: 'review.json' }));
    assert.equal((await getRun(f.options)).status, 'drafted');
  }
});

test('duplicate JSON keys including escaped aliases are rejected', async (t) => {
  const f = fixture(t);
  const state = await drafted(f);
  const text = JSON.stringify(reviewFor(state));
  f.write('review.json', text.replace('"coverage":"full"', '"coverage":"partial","cover\\u0061ge":"full"'));
  await assert.rejects(recordReview({ ...f.options, file: 'review.json' }), /Duplicate JSON key/);
});

test('current draft must still match when a review is submitted', async (t) => {
  const f = fixture(t);
  const state = await drafted(f);
  f.write('review.json', reviewFor(state));
  f.write('draft.md', 'An edit not covered by that review.');
  await assert.rejects(recordReview({ ...f.options, file: 'review.json' }), /Artifact changed/);
  assert.equal((await getRun(f.options)).status, 'drafted');
});

test('unresolved findings block completion and preserve an actionable reason', async (t) => {
  const f = fixture(t);
  const state = await reviewed(f, [finding('unresolved')]);
  assert.equal(state.status, 'blocked');
  assert.equal((await inspectRun(f.options)).ready, false);
  f.write('verify.json', verificationFor(state));
  await assert.rejects(recordVerification({ ...f.options, file: 'verify.json' }), /Verification requires/);
  await assert.rejects(captureRevision(f.options), /Only one revision/);
});

test('verification rejects forged identities, stale hashes and false or omitted checks', async (t) => {
  const f = fixture(t);
  const state = await reviewed(f);
  const valid = verificationFor(state);
  const cases = [
    { ...valid, run_id: 'another-run' },
    { ...valid, artifact_sha256: hash('other final text') },
    { ...valid, review_sha256: hash('other review') },
    { ...valid, checks: { ...valid.checks, facts_preserved: false } },
    { ...valid, checks: { ...valid.checks, facts_preserved: 'true' } },
    { ...valid, checks: { full_text: true } },
    { ...valid, notes: '' },
    { ...valid, confidence: 1 },
  ];
  for (const data of cases) {
    f.write('verify.json', data);
    await assert.rejects(recordVerification({ ...f.options, file: 'verify.json' }));
    assert.equal((await getRun(f.options)).status, 'reviewed');
  }
});

test('editing an artifact after ready invalidates completion and cannot be recaptured', async (t) => {
  const f = fixture(t);
  const state = await ready(f);
  f.write('draft.md', 'Text changed after final verification.');
  const inspection = await inspectRun(f.options);
  assert.equal(inspection.ready, false);
  assert.match(inspection.reason, /Artifact changed/);
  await assert.rejects(captureDraft({ ...f.options, artifact: 'draft.md' }), /only available before review/);
  f.write('verify.json', { ...verificationFor(state), artifact_sha256: hash('Text changed after final verification.') });
  await assert.rejects(recordVerification({ ...f.options, file: 'verify.json' }), /Artifact changed/);
});

test('edits to captured draft, review and verification invalidate ready receipts', async (t) => {
  for (const file of ['draft.txt', 'review.json', 'verification.json']) {
    const f = fixture(t);
    const state = await ready(f);
    const path = join(state.state_dir, file);
    writeFileSync(path, readFileSync(path, 'utf8') + '\n');
    const inspection = await inspectRun(f.options);
    assert.equal(inspection.ready, false, file);
    assert.match(inspection.reason, /changed/, file);
  }
});

test('editing a revision snapshot invalidates the final artifact receipt', async (t) => {
  const f = fixture(t);
  const reviewedState = await reviewed(f, [finding()]);
  f.write('draft.md', 'The internal trial completed 36 of 40 tasks.');
  const revision = await captureRevision(f.options);
  f.write('verify.json', verificationFor(revision));
  await recordVerification({ ...f.options, file: 'verify.json' });
  writeFileSync(join(reviewedState.state_dir, 'revision.txt'), 'A different revision.');
  assert.match((await inspectRun(f.options)).reason, /revision snapshot changed/);
});

test('artifacts reject escapes, configuration directories, unsupported formats and empty content', async (t) => {
  const f = fixture(t);
  await startRun(f.options);
  for (const dir of ['.git', '.codex', 'config']) mkdirSync(join(f.root, dir));
  for (const file of ['.git/message.md', '.codex/prompt.md', 'config/template.md', 'draft.json', 'empty.md']) f.write(file, file === 'empty.md' ? ' \n ' : 'Text');
  for (const artifact of ['../outside.md', '.git/message.md', '.codex/prompt.md', 'config/template.md', 'draft.json', 'empty.md']) {
    await assert.rejects(captureDraft({ ...f.options, artifact }));
  }
  assert.equal((await getRun(f.options)).status, 'drafting');
});

test('artifact and state symlinks are refused without reading their targets', async (t) => {
  const f = fixture(t);
  await startRun(f.options);
  f.write('actual.md', 'Actual text.');
  symlinkSync(join(f.root, 'actual.md'), join(f.root, 'alias.md'));
  await assert.rejects(captureDraft({ ...f.options, artifact: 'alias.md' }), /Symlinks/);
  mkdirSync(join(f.root, 'actual-dir'));
  f.write('actual-dir/draft.md', 'Actual text.');
  symlinkSync(join(f.root, 'actual-dir'), join(f.root, 'linked-dir'));
  await assert.rejects(captureDraft({ ...f.options, artifact: 'linked-dir/draft.md' }), /Symlinks/);
  const state = await getRun(f.options);
  const stateFile = join(state.state_dir, 'state.json');
  const text = readFileSync(stateFile);
  f.write('replacement-state.json', text);
  rmSync(stateFile);
  symlinkSync(join(f.root, 'replacement-state.json'), stateFile);
  await assert.rejects(getRun(f.options), /Symlinks/);
});

test('pre-existing .metis symlink prevents any state write', async (t) => {
  const f = fixture(t);
  const outside = realpathSync(mkdtempSync(join(tmpdir(), 'metis-outside-')));
  t.after(() => rmSync(outside, { recursive: true, force: true }));
  symlinkSync(outside, join(f.root, '.metis'));
  await assert.rejects(startRun(f.options), /real directories/);
  assert.deepEqual(readdirSync(outside), []);
});

test('receipt paths cannot escape or follow symlinks', async (t) => {
  const f = fixture(t);
  const state = await drafted(f);
  f.write('review.json', reviewFor(state));
  symlinkSync(join(f.root, 'review.json'), join(f.root, 'review-link.json'));
  await assert.rejects(recordReview({ ...f.options, file: 'review-link.json' }), /Symlinks/);
  await assert.rejects(recordReview({ ...f.options, file: '../review.json' }), /inside the project/);
});

test('bounded plain UTF-8 input rejects binary, NUL and oversized artifacts', async (t) => {
  const f = fixture(t);
  await startRun(f.options);
  for (const [file, bytes] of [
    ['invalid.md', Buffer.from([0xc3, 0x28])],
    ['nul.md', Buffer.from('a\0b')],
    ['large.md', Buffer.alloc(2_000_001, 65)],
  ]) {
    f.write(file, bytes);
    await assert.rejects(captureDraft({ ...f.options, artifact: file }));
  }
  assert.equal((await getRun(f.options)).status, 'drafting');
});

test('oversized receipts are rejected before parsing', async (t) => {
  const f = fixture(t);
  await drafted(f);
  f.write('review.json', Buffer.alloc(2_000_001, 32));
  await assert.rejects(recordReview({ ...f.options, file: 'review.json' }), /exceeds 2000000/);
});

test('independent concurrent processes cannot spend continuation twice', async (t) => {
  const f = fixture(t);
  await startRun(f.options);
  const script = `import { requestContinuation } from ${JSON.stringify(coreUrl)}; const result = await requestContinuation(${JSON.stringify(f.options)}); process.stdout.write(JSON.stringify(result));`;
  const results = await Promise.all(Array.from({ length: 6 }, () => execFileAsync(process.execPath, ['--input-type=module', '--eval', script], { timeout: 10_000 })));
  const values = results.map(({ stdout }) => JSON.parse(stdout));
  assert.equal(values.filter((value) => value.continue).length, 1);
  const final = await getRun(f.options);
  assert.equal(final.continuation_count, 1);
  assert.equal(final.status, 'blocked');
  assert.match(final.blocked_reason, /Capture the complete draft/);
  assert.equal((final.blocked_reason.match(/Continuation budget exhausted/g) ?? []).length, 1);
});
