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

## Method

1. State the scientific question, target, comparison, smallest decisive run,
   limits and stop/kill conditions. For reproduction distinguish strict
   published protocol, corrected implementation and extension as separate runs.
2. Map the code and data actually involved: sample unit, splits, preprocessing,
   metric definitions, dependencies and compute requirements. Check leakage,
   identity overlap, tuning on the test set and comparison capacity. Preserve
   official inputs and record changes instead of silently repairing the baseline.
3. Freeze a protocol with commands, inputs, seeds, expected outputs, wall-time/
   resource cap and numerical acceptance where supplied. Do not invent a paper
   number or a tolerance. If essential data/access is missing, deliver the
   runnable preparation and mark the execution/claim blocked.
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
