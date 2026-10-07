import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleHook, MAX_HOOK_BYTES } from '../lib/workflow-hooks.js';
import { captureDraft, getRun, recordReview, recordVerification } from '../lib/workflow-core.js';

const cli = fileURLToPath(new URL('../bin/metis-hook.js', import.meta.url));
const skill = readFileSync(new URL('../skills/prose-audit/SKILL.md', import.meta.url), 'utf8');

function fixture(t, changes = {}, configured = true) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "metis hook ' project-")));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  if (configured) {
    mkdirSync(join(root, '.metis'));
    writeFileSync(join(root, '.metis/workflows.json'), JSON.stringify({
      schema_version: 1, enabled: true, workflow: 'writing-review',
      activation: { mode: 'auto', include: ['write.{0,30}email', '润色.{0,20}文稿'], exclude: ['^explain'] },
      ...changes,
    }));
  }
  const payload = { hook_event_name: 'UserPromptSubmit', cwd: root, session_id: 'session-one', turn_id: 'turn-1', prompt: 'Write an email about the meeting.' };
  return { root, payload, runtime: 'codex' };
}

async function stop(context, extra = {}) {
  return handleHook({ ...context, payload: { ...context.payload, hook_event_name: 'Stop', stop_hook_active: false, ...extra } });
}

test('unconfigured, disabled, and nonwriting requests do not create a workflow', async (t) => {
  const nonwriting = fixture(t);
  nonwriting.payload.prompt = 'Explain how the hook works.';
  for (const context of [fixture(t, {}, false), fixture(t, { enabled: false }), nonwriting]) {
    assert.deepEqual(await handleHook(context), {});
    assert.equal(await getRun({ root: context.root, sessionId: context.payload.session_id }), null);
  }
});

test('writing entry injects full authoritative skill and concrete commands once', async (t) => {
  const context = fixture(t);
  const result = await handleHook(context);
  assert.equal(result.hookSpecificOutput.hookEventName, 'UserPromptSubmit');
  assert.ok(result.hookSpecificOutput.additionalContext.includes(skill));
  assert.match(result.hookSpecificOutput.additionalContext, /workflows capture/);
  assert.match(result.hookSpecificOutput.additionalContext, /detect\.py'.*draft\.txt'.*--genre/s);
  assert.match(result.hookSpecificOutput.additionalContext, /general\|academic\|explain/);
  assert.match(result.hookSpecificOutput.additionalContext, /rules\.json/);
  assert.match(result.hookSpecificOutput.additionalContext, /If Python is unavailable/);
  assert.match(result.hookSpecificOutput.additionalContext, /receipts do not prove scanner execution/);
  assert.match(result.hookSpecificOutput.additionalContext, /Workflow definition SHA-256: [a-f0-9]{64}/);
  assert.match(result.hookSpecificOutput.additionalContext, /artifact\.md/);
  assert.ok(result.hookSpecificOutput.additionalContext.includes("'\\''"), 'apostrophe-bearing project path is shell quoted');
  const first = await getRun({ root: context.root, sessionId: context.payload.session_id });
  assert.match(first.sources.skill_sha256, /^[a-f0-9]{64}$/);
  assert.deepEqual(await handleHook(context), {});
  assert.equal((await getRun({ root: context.root, sessionId: context.payload.session_id })).run_id, first.run_id);
});

test('matching review evidence allows Stop; changed artifact invalidates that receipt', async (t) => {
  const context = fixture(t);
  await handleHook(context);
  const options = { root: context.root, sessionId: context.payload.session_id };
  const initial = await getRun(options);
  const artifact = join(initial.state_dir, 'artifact.md');
  writeFileSync(artifact, 'The meeting begins at 10:00.\n');
  const captured = await captureDraft({ ...options, artifact });
  const reviewFile = join(initial.state_dir, 'review-input.json');
  writeFileSync(reviewFile, JSON.stringify({
    schema_version: 1, run_id: captured.run_id, draft_sha256: captured.draft_sha256,
    coverage: 'full', findings: [], summary: 'The full single-sentence notice is specific and accurate against supplied facts.',
  }));
  const reviewed = await recordReview({ ...options, file: reviewFile });
  const verificationFile = join(initial.state_dir, 'verification-input.json');
  writeFileSync(verificationFile, JSON.stringify({
    schema_version: 1, run_id: reviewed.run_id, artifact_sha256: reviewed.final_sha256,
    review_sha256: reviewed.review_sha256,
    checks: { full_text: true, facts_preserved: true, quotes_preserved: true, scope_preserved: true },
    notes: 'The entire notice is unchanged; the supplied time and scope are preserved.',
  }));
  await recordVerification({ ...options, file: verificationFile });
  assert.deepEqual(await stop(context), {});
  writeFileSync(artifact, 'The meeting begins at 11:00.\n');
  const stale = await stop(context);
  assert.equal(stale.decision, 'block');
  assert.match(stale.reason, /changed|capture/);
  assert.equal((await stop(context)).decision, undefined);
});

test('opt-in scope rejects sibling projects, child-agent events, and runtime mismatch', async (t) => {
  const context = fixture(t);
  const other = fixture(t);
  assert.deepEqual(await handleHook({ ...context, payload: { ...context.payload, cwd: other.root } }), {});
  assert.deepEqual(await handleHook({ ...context, payload: { ...context.payload, parent_session_id: 'parent' } }), {});
  const restricted = fixture(t, { runtime: 'dsh' });
  assert.deepEqual(await handleHook(restricted), {});
});

test('explicit start and skip markers require an unquoted standalone first line', async (t) => {
  const context = fixture(t, { activation: { mode: 'explicit' } });
  context.payload.prompt = 'The following token is an example: [metis:writing-review]';
  assert.deepEqual(await handleHook(context), {});
  context.payload.prompt = '> [metis:writing-review]\nA quoted instruction.';
  assert.deepEqual(await handleHook(context), {});
  context.payload.prompt = '    [metis:writing-review]\nAn indented code example.';
  assert.deepEqual(await handleHook(context), {});
  context.payload.prompt = '[metis:writing-review]\nPrepare a short answer.';
  assert.ok((await handleHook(context)).hookSpecificOutput);
  context.payload.prompt = 'Quoted marker:\n[metis:skip-writing-review]';
  assert.deepEqual(await handleHook(context), {});
  assert.notEqual((await getRun({ root: context.root, sessionId: context.payload.session_id })).status, 'cancelled');
  context.payload.prompt = '    [metis:skip-writing-review]\nAn indented code example.';
  assert.deepEqual(await handleHook(context), {});
  assert.notEqual((await getRun({ root: context.root, sessionId: context.payload.session_id })).status, 'cancelled');
  context.payload.prompt = '[metis:skip-writing-review]\nDo this without review.';
  assert.deepEqual(await handleHook(context), {});
  assert.equal((await getRun({ root: context.root, sessionId: context.payload.session_id })).status, 'cancelled');
  assert.deepEqual(await stop(context), {});
});

test('DSH self-continuation and internal prompt reentry cannot re-arm the budget', async (t) => {
  const context = fixture(t);
  context.runtime = 'dsh';
  delete context.payload.turn_id;
  await handleHook(context);
  const first = await getRun({ root: context.root, sessionId: context.payload.session_id });
  const recovery = await stop(context);
  assert.equal(recovery.decision, 'block');
  assert.ok(recovery.reason.startsWith(`[metis-writing-review:continue:${first.run_id}]\n`));
  assert.deepEqual(await handleHook({ ...context, payload: { ...context.payload, prompt: recovery.reason } }), {});
  assert.deepEqual(await handleHook({ ...context, payload: { ...context.payload, prompt: 'Write the email again as instructed by another hook.' } }), {});
  for (let i = 0; i < 4; i++) {
    const output = await stop(context);
    assert.equal(output.decision, undefined);
    assert.match(output.systemMessage, /incomplete/);
  }
  const last = await getRun({ root: context.root, sessionId: context.payload.session_id });
  assert.equal(last.run_id, first.run_id);
  assert.equal(last.continuation_count, 1);
});

test('Codex continuation on a new turn stays on the same run and reaches the budget limit', async (t) => {
  const context = fixture(t);
  await handleHook(context);
  const first = await getRun({ root: context.root, sessionId: context.payload.session_id });
  const recovery = await stop(context);
  context.payload.turn_id = 'continuation-turn';
  assert.deepEqual(await handleHook({ ...context, payload: { ...context.payload, prompt: recovery.reason } }), {});
  assert.deepEqual(await handleHook({ ...context, payload: { ...context.payload, prompt: 'Write the email according to the pending review.' } }), {});
  const exhausted = await stop(context);
  assert.equal(exhausted.decision, undefined);
  assert.match(exhausted.systemMessage, /incomplete/);
  const last = await getRun({ root: context.root, sessionId: context.payload.session_id });
  assert.equal(last.run_id, first.run_id);
  assert.equal(last.continuation_count, 1);
  assert.equal(last.status, 'blocked');
});

test('distinct trusted Codex turns get new runs; sessions keep independent budgets', async (t) => {
  const context = fixture(t);
  await handleHook(context);
  const first = await getRun({ root: context.root, sessionId: context.payload.session_id });
  await stop(context);
  context.payload.turn_id = 'turn-2';
  assert.ok((await handleHook(context)).hookSpecificOutput);
  assert.notEqual((await getRun({ root: context.root, sessionId: context.payload.session_id })).run_id, first.run_id);
  const second = { ...context, payload: { ...context.payload, session_id: 'session-two' } };
  assert.ok((await handleHook(second)).hookSpecificOutput);
  assert.equal((await stop(context)).decision, 'block');
  assert.equal((await stop(second)).decision, 'block');
});

test('an unrelated later turn cannot force continuation of an older writing request', async (t) => {
  for (const runtime of ['codex', 'dsh']) {
    const context = { ...fixture(t), runtime };
    await handleHook(context);
    assert.deepEqual(await handleHook({ ...context, payload: { ...context.payload, turn_id: 'turn-2', prompt: 'What is two plus two?' } }), {});
    assert.deepEqual(await stop(context, { turn_id: 'turn-2' }), {});
    assert.equal((await getRun({ root: context.root, sessionId: context.payload.session_id })).continuation_count, 0);
  }
});

test('invalid activation, regular expression, and malformed event fields are explicit failures', async (t) => {
  const badPattern = fixture(t, { activation: { mode: 'auto', include: ['['], exclude: [] } });
  await assert.rejects(handleHook(badPattern), /regular expression/i);
  const badMode = fixture(t, { activation: { mode: 'maybe' } });
  await assert.rejects(handleHook(badMode), /activation.mode/);
  const context = fixture(t);
  await assert.rejects(handleHook({ ...context, payload: { ...context.payload, session_id: '' } }), /session_id/);
  await assert.rejects(handleHook({ ...context, payload: { ...context.payload, prompt: null } }), /string prompt/);
  assert.deepEqual(await handleHook({ ...context, payload: { hook_event_name: 'PreToolUse' } }), {});
});

test('expensive configured regex fails within its execution budget', async (t) => {
  const context = fixture(t, { activation: { mode: 'auto', include: ['(a+)+$'], exclude: [] } });
  context.payload.prompt = 'a'.repeat(10_000) + '!';
  await assert.rejects(handleHook(context), /timed out/);
});

test('hook CLI emits protocol JSON only and rejects malformed or oversized input without blocking', (t) => {
  const context = fixture(t);
  const args = [cli, '--runtime', 'codex', '--project', context.root];
  for (const input of ['{broken', JSON.stringify({}), ' '.repeat(MAX_HOOK_BYTES + 1), Buffer.from([0xff])]) {
    const result = spawnSync(process.execPath, args, { input, encoding: 'utf8', timeout: 5000 });
    assert.equal(result.status, 1, result.stderr);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /^metis-hook:/);
  }
  const result = spawnSync(process.execPath, args, { input: JSON.stringify(context.payload), encoding: 'utf8', timeout: 5000 });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, '');
  assert.equal(JSON.parse(result.stdout).hookSpecificOutput.hookEventName, 'UserPromptSubmit');
});
