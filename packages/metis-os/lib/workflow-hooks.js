// Command-hook protocol adapter. The workflow core owns evidence and budgets;
// this layer only selects an opted-in task and translates hook messages.
import { createHash } from 'node:crypto';
import { readFileSync, realpathSync, statSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';
import { cancelRun, getRun, inspectRun, requestContinuation, resumeContinuation, startRun } from './workflow-core.js';

export const MAX_HOOK_BYTES = 1_048_576;
const MAX_CONFIG_BYTES = 65_536;
const MAX_PROMPT_MATCH_CHARS = 32_768;
const START = '[metis:writing-review]';
const SKIP = '[metis:skip-writing-review]';
const CONTINUE = '[metis-writing-review:continue:';
const bundleRoot = fileURLToPath(new URL('../workflows/writing-review/', import.meta.url));
const skillPath = fileURLToPath(new URL('../skills/prose-audit/SKILL.md', import.meta.url));
const cliPath = fileURLToPath(new URL('../bin/metis-os.js', import.meta.url));

const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const digest = (value) => createHash('sha256').update(value).digest('hex');
const quote = (value) => "'" + value.replace(/'/g, "'\\''") + "'";

function readJson(path, maximum) {
  if (!statSync(path).isFile() || statSync(path).size > maximum) {
    throw new Error(`Expected a regular JSON file of at most ${maximum} bytes: ${path}`);
  }
  const parsed = JSON.parse(readFileSync(path, 'utf8'));
  if (!object(parsed)) throw new Error(`Expected a JSON object: ${path}`);
  return parsed;
}

function within(root, path) {
  const rel = relative(root, path);
  return rel === '' || (!isAbsolute(rel) && rel !== '..' && !rel.startsWith('..' + sep));
}

function patterns(value, field) {
  if (!Array.isArray(value) || value.length > 32 || value.some((item) => typeof item !== 'string' || item.length > 512 || item.length === 0)) {
    throw new Error(`${field} must contain at most 32 nonempty regular expressions of at most 512 characters`);
  }
  for (const pattern of value) new RegExp(pattern, 'iu');
  return value;
}

function activeFor(prompt, activation) {
  if (!object(activation) || !['auto', 'explicit'].includes(activation.mode)) {
    throw new Error('Workflow activation.mode must be auto or explicit');
  }
  const firstLine = prompt.split(/\r?\n/, 1)[0].trimEnd();
  if (firstLine === START) return true;
  if (activation.mode === 'explicit') return false;
  const include = patterns(activation.include, 'activation.include');
  const exclude = patterns(activation.exclude, 'activation.exclude');
  // A local configuration may contain an expensive regular expression. Bound
  // its execution as well as the amount of prompt text exposed to matching.
  return new Script('!exclude.some(p => new RegExp(p, "iu").test(text)) && include.some(p => new RegExp(p, "iu").test(text))')
    .runInNewContext({ include, exclude, text: prompt.slice(0, MAX_PROMPT_MATCH_CHARS) }, { timeout: 100 });
}

function contextFor(state, root, sessionId, workflow, { skill, instructions, sources }) {
  const command = `${quote(process.execPath)} ${quote(cliPath)} workflows`;
  const identity = `--project ${quote(root)} --session ${quote(sessionId)}`;
  return [
    `Metis writing-review workflow ${workflow.version}; run_id: ${state.run_id}.`,
    'This is a configured writing workflow for the current request. Preserve the user\'s scope and requested output format. These hook instructions do not authorize publication or external messages.',
    instructions,
    `Workflow definition SHA-256: ${sources.workflow_sha256}\nWorkflow instructions SHA-256: ${sources.instructions_sha256}`,
    `Authoritative English skill: ${skillPath}\nSHA-256: ${digest(skill)}\n\n${skill}`,
    `Record evidence for the actual local text artifact. For a chat-only deliverable, save its exact text in the private working buffer ${quote(resolve(state.state_dir, 'artifact.md'))}; return that verified prose in chat. Do not treat this working record as an extra user-facing deliverable. A hook cannot enforce byte equality of streamed chat text.`,
    'Use these commands in order; substitute your actual evidence file paths as separate quoted arguments:',
    `${command} capture ${identity} --artifact '<draft path>'`,
    `${command} review ${identity} --file '<review JSON path>'`,
    `${command} revise ${identity}  # only after the single authorized revision to the same artifact, if needed`,
    `${command} verify ${identity} --file '<verification JSON path>'`,
    `${command} status ${identity}`,
    `${command} cancel ${identity} --reason '<honest cancellation or activation-error reason>'  # cancellation is not successful verification`,
    'The capture result provides run_id and draft_sha256. Review JSON must be {"schema_version":1,"run_id":"<current run>","draft_sha256":"<captured hash>","coverage":"full","findings":[{"id":"F1","location":"<location>","quote":"<exact nonempty draft excerpt>","decision":"keep|revise|unresolved","reason":"<contextual reason>"}],"summary":"<actual review summary>"}. Use an empty findings array if full reading finds no issue; do not invent a finding.',
    'After reading the final artifact, verification JSON must be {"schema_version":1,"run_id":"<current run>","artifact_sha256":"<current artifact hash>","review_sha256":"<recorded review hash>","checks":{"full_text":true,"facts_preserved":true,"quotes_preserved":true,"scope_preserved":true},"notes":"<what was actually checked>"}. Record only checks you performed. Status supplies the relevant hashes. A stale receipt cannot verify changed prose.',
    `At most ${workflow.max_revisions} revision and ${workflow.max_continuations} hook continuation. Do not claim reviewed/verified completion when evidence is missing or a check fails. The Stop hook checks records at the turn boundary; it cannot suppress already streamed text.`,
  ].join('\n\n');
}

/** Return one event-specific JSON response; never execute a model or modify prose. */
export async function handleHook({ payload, runtime, root }) {
  if (!['codex', 'dsh'].includes(runtime)) throw new Error('runtime must be codex or dsh');
  if (typeof root !== 'string' || !isAbsolute(root)) throw new Error('project must be an absolute path');
  if (!object(payload)) throw new Error('Hook input must be a JSON object');
  if (typeof payload.hook_event_name !== 'string' || !payload.hook_event_name) throw new Error('Hook input requires hook_event_name');
  if (!['UserPromptSubmit', 'Stop'].includes(payload.hook_event_name)) return {};
  if (typeof payload.session_id !== 'string' || !payload.session_id.trim() || payload.session_id.length > 512) {
    throw new Error('Hook input requires a nonempty session_id of at most 512 characters');
  }
  if (typeof payload.cwd !== 'string' || !isAbsolute(payload.cwd)) throw new Error('Hook input requires an absolute cwd');
  root = realpathSync(root);
  if (!within(root, realpathSync(payload.cwd))) return {};
  // Hooks installed at a project root must not silently create parallel review
  // runs for identifiable child-agent payloads.
  if (payload.agent_id || payload.parent_session_id || payload.is_subagent === true) return {};
  let config;
  try { config = readJson(resolve(root, '.metis/workflows.json'), MAX_CONFIG_BYTES); }
  catch (error) { if (error.code === 'ENOENT') return {}; throw error; }
  if (config.enabled === false) return {};
  if (config.schema_version !== 1 || config.enabled !== true || config.workflow !== 'writing-review') {
    throw new Error('Invalid opted-in workflow configuration');
  }
  if (config.runtime !== undefined && !['codex', 'dsh'].includes(config.runtime)) throw new Error('Invalid configured runtime');
  if (config.runtime !== undefined && config.runtime !== runtime) return {};
  const workflow = readJson(resolve(bundleRoot, 'workflow.json'), MAX_CONFIG_BYTES);
  if (workflow.id !== 'writing-review' || workflow.skill !== 'prose-audit' || workflow.max_revisions !== 1 || workflow.max_continuations !== 1) {
    throw new Error('Unsupported writing-review workflow bundle');
  }
  const sessionId = payload.session_id;
  if (payload.hook_event_name === 'UserPromptSubmit') {
    if (typeof payload.prompt !== 'string') throw new Error('UserPromptSubmit requires a string prompt');
    const firstLine = payload.prompt.split(/\r?\n/, 1)[0].trimEnd();
    const previous = await getRun({ root, sessionId });
    if (firstLine === SKIP) {
      if (previous) await cancelRun({ root, sessionId, reason: 'Explicit skip-writing-review marker' });
      return {};
    }
    if (previous && firstLine === `${CONTINUE}${previous.run_id}]`) {
      if (typeof payload.turn_id === 'string' && payload.turn_id && previous.continuation_count === 1) {
        await resumeContinuation({ root, sessionId, runId: previous.run_id, turnId: payload.turn_id });
      }
      return {};
    }
    if (!activeFor(payload.prompt, config.activation ?? workflow.activation)) return {};
    const turnId = typeof payload.turn_id === 'string' && payload.turn_id ? payload.turn_id : null;
    const skill = readFileSync(skillPath, 'utf8');
    const instructions = readFileSync(resolve(bundleRoot, 'workflow.md'), 'utf8');
    const sources = {
      skill_name: workflow.skill, skill_sha256: digest(skill),
      workflow_sha256: digest(readFileSync(resolve(bundleRoot, 'workflow.json'))),
      instructions_sha256: digest(instructions),
    };
    const state = await startRun({ root, sessionId, promptKey: digest(payload.prompt), turnId, runtime, sources });
    if (previous?.run_id === state.run_id) return {};
    return { hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: contextFor(state, root, sessionId, workflow, { skill, instructions, sources }) } };
  }
  const inspection = await inspectRun({ root, sessionId });
  if (!inspection.state || inspection.ready || inspection.state.status === 'cancelled') return {};
  if (typeof payload.turn_id === 'string' && inspection.state.turn_id !== null
      && payload.turn_id !== inspection.state.turn_id && payload.turn_id !== inspection.state.continuation_turn_id) return {};
  const result = await requestContinuation({ root, sessionId });
  if (result.continue) {
    return {
      decision: 'block',
      reason: `${CONTINUE}${result.state.run_id}]\nThe configured writing review is incomplete: ${result.reason}. Continue the current run; do not start another workflow. Read the captured draft with prose-audit, record the review, make at most the remaining single revision, and verify the current artifact. Inspect status with ${quote(process.execPath)} ${quote(cliPath)} workflows status --project ${quote(root)} --session ${quote(sessionId)}. If blocked, report the missing check honestly. This is the only hook continuation.`,
    };
  }
  return { systemMessage: `Metis writing-review remains incomplete: ${result.reason}. The continuation budget is exhausted; no further continuation was requested. Inspect workflow status and report the unresolved check; do not claim verified completion.` };
}
