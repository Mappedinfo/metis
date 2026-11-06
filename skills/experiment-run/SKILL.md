---
name: experiment-run
description: >
  Execute a specified research experiment or reproduction with declared inputs,
  protocol, resource budget and acceptance criteria. Use for "run this experiment"
  or "reproduce this result" once its execution conditions are clear. Deliver
  actual run artifacts and an evidence-bounded outcome; not a preparation-only
  taskbook, open-ended experiment search or automatic remote provisioning.
license: MIT
category: build
domain: [experiment, research-design]
action: [test, record]
uses: []
artifacts:
  - "Experiment protocol and immutable run evidence: inputs, configuration, logs and outputs"
  - "Outcome compared with the declared target, including unmet conditions"
---

[中文主稿](SKILL.zh.md). The Chinese original and this English entry share
the execution, provenance and stopping requirements.

## What it does

Carry a clear experiment through execution and compare its real evidence with
the agreed outcome. A runnable scaffold, transport success or smoke run is not
an experimental finding.

## When to use / not use

Use when the user requests execution and the needed protocol is available.
Use `taskbook-reproduce` for preparation only. Decide unresolved questions with
`research-question` first. A local protocol does not authorize credentials,
new cloud workers, paid services or additional private research access.

## Reproduction and adaptation

Distinguish exact reproduction, method adaptation and new ablation. Exact
data, versions and hyperparameters constrain an exact-reproduction claim;
they are not prerequisites for authorized adaptation. Do not silently replace
an exact-reproduction goal with an adaptation.

First check existing assets, upstream runs, paper references and public
sources within scope. Report what was searched and not found; a failed lookup
does not establish nonexistence. Category cleanup, tokenization, supported
translation and parent-category fallback are acceptable adaptations. Fix the
rules before evaluation; record actual-count-weighted coverage, OOV and
differences in the existing protocol/report. Do not require 100% matching or
a universal percentage, and do not choose mappings by evaluation scores.

Preserve real data, semantics, vector provenance, column/count alignment,
train/test separation and time alignment for time-sensitive features.
For frequent ambiguous categories, loss of key meaning, cross-time proxies
or other approximations that change the question, show concrete examples,
affected counts and consequences for human judgment. Reuse settled decisions;
do not seek approval for each ordinary term or invent unapproved major
substitutions. Continue independent authorized work. Name adaptations honestly
and reuse existing records/checks without a new traceability system.

## Cross-phase tasks and reporting

At routing, identify only the phases and outputs actually requested. Read the
selected skill entry before each phase (including `run-review` for an artifact
audit), and expose pending, blocked, and completed work in the host task list
when available; otherwise reuse the project task record. Carry the protocol,
inputs and versions, deviations, run status, artifacts, missing evidence and
acceptance criteria into each handoff. The receiver checks these inputs; a
missing required item remains open. A skill mention is not proof it was read.

For a requested complete experiment report, read and apply any applicable
project or host reporting contract. Cover question and objective, data, methods,
results, analysis, discussion and reproducibility; cite evidence or explicitly
mark missing information and its consequences. Check report completeness,
performance against the prespecified criterion and claim support separately.
A launch or completed run does not itself complete a report. For a short update,
link the underlying record rather than silently expanding the requested scope.
This portable skill does not require a particular personal skill or scheduler.

## Method

1. State the scientific question, target, comparison, smallest decisive run,
   limits and stop/kill conditions. Record exact reproduction, method
   adaptation and new ablation separately, including implementation corrections.
2. Map the code and data actually involved: sample unit, splits, preprocessing,
   metric definitions, dependencies and compute requirements. Check leakage,
   identity overlap, tuning on the test set and comparison capacity. Preserve
   official inputs and record changes instead of silently repairing the baseline.
3. Freeze a protocol with commands, inputs, seeds, expected outputs, wall-time/
   resource cap and numerical acceptance where supplied. Do not invent a paper
   number or a tolerance. Missing essential data/access blocks the affected
   execution or claim under the accepted mode; continue independent authorized
   work. Missing original assets alone does not block a viable agreed adaptation.
4. Run a cheap entry check when needed, label it smoke, then the authorized
   evaluation. Save actual commands, code/data hashes, resolved versions or
   lockfiles, seeds, raw outputs and stdout/stderr. Seed declaration is not proof
   that every library was seeded or that the result is stable across seeds.
5. Verify required artifacts and numeric meaning. Compare target and observed
   result with denominators, uncertainty, protocol deviations and failure cases.
   Use `run-review` for the artifact audit; it cannot replace scientific judgment.
6. Close the requirements ledger against the original question. New evidence
   may motivate another experiment but cannot silently replace the accepted goal.

For a bounded local run read [local protocol](references/local-protocol.md).
The standard-library helper executes argv without a shell and records failure,
timeout and absent outputs. Remote/GPU backends use the same evidence contract
only when available and authorized; the core has no private LAN dependency.

## Requirements

- [B] R1 Protocol, budget and outcome criteria are explicit before execution — Verification: compare saved protocol with the accepted question and command.
- [B] R2 Actual run and inputs are traceable — Verification: inspect commands, source/input hashes, runtime/lockfiles, seeds and raw logs.
- [B] R3 Required artifacts and claimed numerical results are verified separately — Verification: exit success alone cannot satisfy missing outputs or scientific acceptance.
- [B] R4 Original protocol and deviations are preserved — Verification: compare baseline and extension records; no hidden tuning or goal substitution.
- [B] R5 All accepted outcomes have ledger evidence — Verification: preparation, smoke, execution and scientific verification retain separate statuses.

## When to stop

Default one authorized evaluation, one entry smoke if needed, at most one
targeted repair/rerun and one final review, all within the declared time and
resource cap. Preserve failed runs. Stop at acceptance or budget exhaustion;
report completed work, unfinished requirements and the smallest unblock
condition. Never launch additional searches merely to obtain a positive result.

## Output contract

Saved protocol and run manifest, original logs and metrics, regeneration entry,
target/observed comparison, deviations, evidence limits and requirements ledger.
State whether the delivered result is preparation, smoke, evaluation or an
actually checked reproduction. See [cases](examples/cases.md) and [provenance](PROVENANCE.md).
