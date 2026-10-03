# Unattended review and delivery

Use when preparing a self-contained review prompt for a future run or
examining an existing automated review. The same SOP can work in any
compatible runtime; no scheduler, command-line tool, or online host is
assumed. A prompt draft is an artifact, not an installed or executed job.

## Prepare a self-contained prompt

Include the resolved scope, window/timezone, baseline, permitted evidence,
output destination, write/action boundaries, pass budget, and acceptance
check. Include the essential steps directly when the target runtime may
not have this skill. Leave unresolved placeholders visibly unresolved;
do not call a prompt ready to run if they affect access or correctness.

```text
Review scope: <named task/project and allowed evidence roots>
Review window and timezone: <resolved interval and timezone or known limits>
Baseline: <accepted objective/checkpoint, or state that it is missing>
Research anchor, only for research: <accepted question/scope or explicit uncertainty>
Output target and language: <conversation or authorized existing target; language>
Permission: <read-only, plus any specifically authorized target/action>
Evidence budget: <bounded passes and source shortlist>

1. Inspect the permitted evidence and compare it with the baseline. Separate
   observations, interpretations, accepted or proposed decisions, and actions.
   Distinguish actual results from planned, launched, or unverified work.
2. Explain the consequential change or blockage and summarize its evidence,
   consequence, and uncertainty. Use a research-alignment or learning lens
   only when this task asks for it or its accepted contract establishes it.
3. Perform at most the specifically authorized bounded advancement and verify
   its effect. Otherwise describe the exact next action without performing it.
4. Produce the next plan with truthful states, acceptance checks, dependencies,
   and a realistic work-in-progress limit. Preserve required outcome coverage.
5. Write only to the authorized target, if any. Reconcile an existing checkpoint
   for this review interval rather than creating duplicate state.
6. Report the inspected sources, actual changes, verification, requirements
   ledger, stop condition, gaps, and smallest unblock condition.
```

Preparing this prompt does not authorize creating, updating, starting,
disabling, or deleting a scheduled job. Use the target environment's
supported scheduling interface only when that action is requested and
authorized. A cadence in personal settings does not substitute for that
authorization. Never add a second scheduler or self-triggering review loop
as a side effect of a review.

## Verify the delivery chain one layer at a time

| Layer | Evidence needed when the layer is promised |
|---|---|
| Configuration | The intended job or rule actually saved in the target scheduler |
| Trigger | A recorded event for the relevant interval, not just a future rule |
| Runtime | The correct task and environment actually started |
| Work | The requested review and authorized action actually performed |
| Artifact | The intended output exists and its substantive content was inspected |
| Persistence | Final run status and any authorized state update read back |
| Delivery | The promised session, link, notification, or UI destination contains the result |

Mark uninspected layers as unverified and report the exact known failing
layer. A clean exit does not prove the artifact; a missing delivery link
does not prove the underlying work never ran. Inspect relevant manifests,
logs, artifacts, and destination state within the permitted roots rather
than guessing a runtime-specific cause.

## Bound unattended recovery

Preserve overlap protections, the declared pass/retry limits, and real
failure status. Reconcile repeated runs by review identity and interval;
do not append a new checkpoint or advance learning counters just because
the wrapper ran twice. Before retrying an operation with uncertain effects,
inspect whether it already changed the target.

When credentials, source access, a host, an adapter, or a write target is
unavailable, report the affected layer and partial result. Do not infer
permission to bypass access controls, migrate storage, invent successful
delivery, or change scheduling. A ready prompt can be delivered even when
the future runtime is not configured, with that distinction explicit.
