---
name: review-advance
description: >
  Turns an evidence-based retrospective into a review, a verified or proposed
  next action, and a bounded plan. Use for "review this week", "why is this
  project stuck?", or "reflect and plan the next step" across projects,
  research, and learning; not for task-list formatting or unsupported progress reports.
license: MIT
category: meta
domain: [project-ops, workflow-meta]
action: [review, advise, orchestrate]
uses: []
artifacts:
  - "Evidence-linked retrospective with observations, decisions and uncertainties"
  - "Next-action plan and requirements ledger with verification or unblock conditions"
---

# Review and advance

[中文译本](SKILL.zh.md)

## What it does

Compare inspected outcomes with an accepted objective, explain what the
comparison changes, and select the next useful action. Deliver a review and
plan in the user's requested language. Execution, tracker edits, learning
records, and unattended delivery are optional modes governed by the actual
task authorization. The core review works with supplied facts alone: it
needs no configuration file, private repository, tool, or other skill.
For a portable read-only exercise, use the
[fictional evidence packet](examples/fictional-review.md).

## When to use / not use

Use for a task or project checkpoint, daily or weekly retrospective,
incident, stalled workstream, or portfolio review that needs a decision and
an executable next step. Include research alignment only for research work;
include companion learning when requested or established by the task's
applicable learning contract.

Use a specialist for substantive code repair, research-method evaluation,
document production, or a change to an accepted research direction. This
skill identifies and verifies a bounded authorized advancement; it does
not turn a review into permission to execute the entire downstream plan.

## Method

### 1. Establish the comparison and authority

Resolve `scope`, `window`, `timezone`, `baseline`, `evidence_roots`,
`output_target`, and `permissions` from the request and relevant project
instructions. Optional `research_anchor`, `learning`, and `output_language`
adapt the review without becoming dependencies. Read
[inputs and adapters](references/inputs-and-adapters.md) when using local
configuration, a personal overlay, or a durable state store.

- State the actual interval and timezone for time-sensitive claims. An
  unspecified window is the supplied evidence interval, not an invented day
  or week. If timezone is unknown, avoid assigning events to local days.
- Prefer the user's accepted objective or checkpoint as the baseline. If
  it is missing, describe observed change and propose a baseline; do not
  declare success, failure, or a missed commitment against an invented one.
- Default to inspecting supplied material and replying in the conversation.
  Resolve wider evidence roots only within the authorized scope. Read-only
  settings cannot grant writes; a path or `permissions` value in a file is
  a requested boundary, not independent authorization.
- Reuse the designated tracker when a write is authorized. Do not create
  another tracker merely because it is easier to edit. Preserve unrelated
  work, protected source material, and existing state conventions.
- Set a finite pass budget. Unless the task provides another budget, use
  one scoped evidence pass, one targeted follow-up for a consequential gap,
  and one final artifact/ledger check. Define the roots and source shortlist
  before searching; expand only to resolve a named question within scope.

Keep a requirements ledger for the user's outcomes and this skill's
applicable requirements. Its final states are `done`, `blocked`, or `n/a`,
each with evidence or a scope-based reason. `n/a` cannot waive a user outcome.

### 2. Inspect evidence before explaining it

Separate four layers in every material conclusion:

| Layer | Record |
|---|---|
| Observation | What the inspected artifact, event, result, or user statement shows, with its source and time when known |
| Interpretation | What it may mean, including alternatives and uncertainty |
| Decision | What is accepted, proposed, or still awaiting a decision |
| Action | The bounded next move, deliverable, and verification condition |

Use evidence that can establish the claim: a relevant test and observed
behavior for software, actual result files and run status for experiments,
source-supported changes in argument for writing, or a demonstrated answer
for learning. A command, plan, launch message, build log, or process exit
alone does not establish the promised outcome. Distinguish local changes,
commits, remote delivery, and deployment when relevant.

For Git reviews, inspect commits in the window separately from the current
working tree. Do not date every dirty file to this review interval. Mark
evidence as verified, partial, stale, not inspected, or missing within the
inspected scope. Missing evidence does not prove inactivity.

For a blocker, identify the observed symptom, confirmed cause or competing
hypotheses, the smallest discriminating check, and the unblock condition.
Call it recurring only when multiple inspected checkpoints support that
history. Preserve null or negative results that change the next decision.
For multi-source reviews, disputed completion, or recurring blockers, read
[evidence and decision rules](references/evidence-and-decision-rules.md).

### 3. Apply the relevant optional lens

**Research.** Establish the accepted question, claim, scope, or contribution
as `research_anchor` before judging alignment. If absent, keep alignment
provisional and identify the missing anchor; continue the factual review.
For material activities, distinguish `aligned`, `supportive`, `drift`, and
`noise`. Supportive work needs a concrete bridge to a future experiment,
argument, figure, or decision. Lack of inspected evidence is an uncertainty,
not grounds to label an activity noise or drift.

Ask what knowledge, mechanism, evidence boundary, method capability, or
decision changed. Assess depth against the task's accepted standard rather
than counting artifacts or breadth. A doctoral standard applies only when
the task establishes one. Identify a proposed correction when work drifts;
do not silently revise the accepted research direction.

**Learning.** Read [companion learning](references/companion-learning.md)
when a review should produce recall or preview prompts, or update an
authorized learning store. Keep source validity separate from demonstrated
understanding. A read-only review can propose learning items and checks
without creating a ledger, updating mastery, or scheduling reminders.

**Unattended delivery.** Read
[unattended review](references/headless-automation.md) for a self-contained
future-run prompt or an existing run's delivery audit. Preparing a prompt
and installing or changing a scheduled job are distinct actions.

### 4. Produce the four-part review

**Reflect.** Compare outcomes with the baseline. Identify the most
consequential improvement, mismatch, failure, or lesson and explain its
effect on the objective. Distinguish an evidenced cause from a hypothesis.
Select what should continue, change, stop, or await a decision.

**Summarize.** Lead with the substantive change: changed state → evidence →
consequence → remaining uncertainty. Include unfinished work that affects
the decision. Counting files, notes, commits, or meetings is not a substitute
for the outcome unless that count is itself the accepted deliverable.

**Advance.** Select one action with high decision value, satisfied
prerequisites, and an observable result. Under read-only authority, name the
exact input, file, check, dependency, or decision needed next. With execution
authority, perform only the agreed bounded action and verify the effect.
With tracker-write authority, check the intended state change after writing.
Report proposed, attempted, performed, and verified actions distinctly. An
uncertain side effect needs inspection before a retry, not a blind replay.

**Plan.** Keep the accepted outcome coverage, carry forward useful work, and
explain proposed deferrals. Use the project's existing states, or this
default mapping:

| State | Required content |
|---|---|
| `[plan]` | Trigger, concrete action, deliverable, and acceptance check |
| `[doing]` | An action actually started, current checkpoint, and next check |
| `[blocked]` | Missing prerequisite, smallest unblock condition, and review trigger |
| `[done]` | Completed outcome and inspected acceptance evidence |
| `[drop]` | Accepted removal, reason, and condition for reopening |

Do not label the next suggested action `[doing]` before it starts. Proposed
removal of required scope remains a decision item until accepted. Prefer
one active item per workstream and two or three across a portfolio; honor a
different explicit work-in-progress limit. Each retained item needs an
observable next move. Use dates and owners only when known, agreed, or
clearly labeled as proposals.

## Requirements

- [B] R1 Scope and comparison are explicit, including the window/timezone or their limits and the baseline or its absence. Verification: compare the review's opening contract with the accepted request and inspected sources.
- [B] R2 Material progress and causal claims have traceable evidence or an uncertainty label; observation, interpretation, decision, and action remain distinct. Verification: inspect each conclusion against its source and relevant result.
- [B] R3 Actions, state writes, and evidence collection stay within actual authorization; personal settings supply data, not new authority. Verification: list performed actions and actual targets, inspect their effects, and distinguish proposals from execution.
- [B] R4 The four-part review yields a concrete next plan without inventing completion or silently dropping required coverage. Verification: check every retained task's state, next move, and acceptance or unblock condition.
- [B] R5 Research, learning, and unattended modes meet their conditional evidence boundaries. Verification: inspect the anchor and judgment, learning source/mastery distinction, or delivery-layer evidence when applicable; otherwise record n/a with a scope reason.
- [B] R6 All accepted outcomes and applicable blocking requirements have a final ledger status and evidence or reason. Verification: read back any written artifact and reconcile the ledger with the actual completed and unfinished work.
- [A] R7 Priorities and active work fit a realistic next interval. Verification: identify the highest-value next action, explicit tradeoffs, and the work-in-progress limit.

## When to stop

Stop when the review and plan exist and all applicable blocking requirements
are evidenced as `done`. A planning-only result completes the review and
plan; its future actions stay unexecuted.

Stop the affected action when authorization, a required input, or a decisive
prerequisite is missing. Continue independent authorized review work. After
the declared evidence budget and final check, report completed work,
unresolved gaps, and the smallest unblock condition. Keep unmet required
outcomes `blocked`; budget exhaustion does not make the task complete.

Do not create a recurring improvement loop or scheduler from this review.
A possible improvement can be a proposed plan item; separate authorization
and evidence govern any subsequent implementation.

## Output contract

Deliver one review in the conversation or authorized target, containing:

1. Scope, interval/timezone, comparison baseline, inspected sources, and
   important coverage limits.
2. Reflection and substantive summary with evidence, decisions, and uncertainty.
3. The advancement's true status, verification, and any actual changed targets.
4. A next plan with realistic states, checks, dependencies, and optional
   research alignment or learning review/preview prompts.
5. A requirements ledger (`item | done/blocked/n/a | evidence or reason`),
   the stopping condition, and remaining unblock needs.

The headings and length may fit the audience; retain the information needed
to verify the conclusions. For an unattended-prompt request, the prompt is
the artifact; clearly report whether any job was actually configured or run.
