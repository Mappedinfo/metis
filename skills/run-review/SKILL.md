---
name: run-review
description: >
  Review experiment artifacts, logs, metrics and reproducibility records against
  a declared protocol. Use for "audit this run", checking a reproduction or
  validating reported experiment outcomes. Deliver an evidence-linked integrity
  and scientific review; not execution, silent repair of original records or an
  automatic score claiming scientific correctness.
license: MIT
category: analyze
domain: [experiment, review-qa]
action: [review, record]
uses: []
artifacts:
  - "Read-only run-integrity report with failures and reproducibility limits"
  - "Claim-level scientific assessment against the protocol and evidence"
---

[中文主稿](SKILL.zh.md). Both versions share verdict semantics and scope.

## What it does

Determine what a run actually establishes. Separate integrity, reproducibility,
metric validity and scientific interpretation; never upgrade a missing artifact
because a report sounds plausible.

## When to use / not use

Use after execution or for a supplied report/artifact set. Missing manifests
permit a bounded report review with explicit evidence limits; they do not
justify inventing provenance. For running work use `experiment-run`; for paper
argument review use `manuscript-review`. Review leaves original records unchanged.

## Method

1. Identify the accepted question, protocol, claimed outcome and supplied
   evidence roots. Distinguish smoke, evaluation and reproduction.
2. Inspect terminal status, actual exit code, commands, inputs, environment,
   required outputs, logs, dates and artifact hashes. Compare records rather
   than trusting a top-level success label. Record missing evidence precisely.
3. Check metric definitions, units, sample/split denominators, aggregation,
   baselines, seeds, uncertainty, leakage, tuning scope and deviations. Recompute
   decisive numbers when inputs permit; avoid a costly rerun solely for auditing.
4. Match each scientific claim to an inspected artifact or source. Compare with
   a verified published target where relevant, distinguish real counterevidence
   from absent evidence, and preserve limitations and unexplained discrepancies.
5. Deliver separate execution/integrity and scientific judgments. Use
   `required_fix` for inconsistent or missing essential records, `rerun` for an
   otherwise traceable failed execution, `accept_with_limits` for usable evidence
   with substantive limits, and `accept` only when applicable claim checks pass.
   A serious integrity failure cannot be waived by model judgment.
6. Write the review beside or outside originals, reconcile the requirements
   ledger and name the smallest repair or additional evidence needed.

## Host adapters

This skill owns the common integrity and claim-level review. When project or
host instructions identify an adapter for the supplied manifest or standalone
report, load and use that adapter for its supported fields and existing output
format, then apply the method above to the same evidence. Keep the adapter's
integrity verdict distinct from scientific judgment; do not run both integrity
checkers by default or reinterpret one manifest schema as another. This public
skill remains usable without any personal adapter.

For the local v1 manifest from `experiment-run`, use:

```bash
uv run --offline --no-project python <skill>/scripts/review.py runs/example --output-directory reviews/example
```

The helper checks file integrity and keeps `scientific_status=unverified`;
its successful process means a review was produced, not that the claim passed.
Other schemas use explicit adapters; no private Harness is required. Inspect
the fields' actual meaning before treating a legacy status as equivalent.

## Requirements

- [B] R1 Original artifacts remain unchanged — Verification: compare original hashes before/after review.
- [B] R2 Integrity and scientific checks have distinct evidence/status — Verification: trace every claimed result to its protocol, metrics and inspected sources.
- [B] R3 Missing or contradictory evidence is not upgraded — Verification: output failures, limitations and verdict are consistent.
- [B] R4 Complete requested review and ledger — Verification: every required claim/check has done, blocked or n/a with evidence or a scope reason.

## When to stop

One evidence inspection, at most one targeted clarification/repair of the review
and one final reconciliation. Preserve unresolved scientific claims. If inputs
or resources are missing, deliver a bounded verdict and the smallest unblock
condition. A review can finish while reporting a failed run; an unverifiable
claim cannot be marked verified. Report remaining work at budget exhaustion.

## Output contract

Review report with evidence locations, execution/integrity status, claim-level
scientific assessment, limits, repair priority and requirements ledger.
Automatic integrity output alone is a partial scientific review.
See [cases](examples/cases.md) and [provenance](PROVENANCE.md).
