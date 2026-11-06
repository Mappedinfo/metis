---
name: exploratory-analysis
description: >
  Explore available data through observation units, missingness, distributions,
  subgroup patterns and descriptive associations. Use for "inspect this data",
  "do EDA" or diagnosing anomalies before testing a hypothesis. Deliver a
  sourced diagnostic report and reproducible summaries; not causal inference,
  automatic preprocessing or confirmation of a hypothesis found in the data.
license: MIT
category: analyze
domain: [data-analysis]
action: [analyze, review]
uses: []
artifacts:
  - "Exploratory report with distributions, denominators, anomalies and limits"
  - "Reproducible summaries and optional requested figures"
---

[中文主稿](SKILL.zh.md). The English discovery entry and Chinese original
share requirements; the core works without private services or a fixed backend.

## What it does

Identify what supplied data can support before choosing a formal
analysis. Keep exploratory discoveries separate from pre-specified hypotheses.

## When to use / not use

Use for descriptive inspection, missingness, anomalies or subgroup structure.
Inspect raw structure and coverage without changing records; if column meanings
or transformations are unresolved, use `data-preparation` for the dependent steps.
For only a chart from a prepared table use the plotting capability directly.
Experimental inference, measurement validation and causal design need their
own declared assumptions and analysis, rather than an automatic EDA score.

## First inspection for research data

When research work receives or uses a dataset that has no applicable analysis,
inspect every authorized dataset before dependent formal analysis or evaluation;
reuse existing results only after matching source/version, units, fields, filters
and scope. Preserve split restrictions and do not inspect held-out labels in ways
that violate the evaluation protocol. Create a project Markdown data report with
actual figures and reproducible calculations, using the project location and
existing tools. Cover numeric/category distributions and frequencies; missing,
invalid, suppressed, structural absence and observed zero separately; coverage
with explicit denominators; temporal extent, frequency, resolution and gaps;
and spatial extent, unit, resolution, CRS and coverage maps when applicable.
Use histograms, time plots and maps as appropriate; record not applicable, unknown
or blocked with a reason. Check exported figures and keep originals unchanged.
Full-data summaries may be streamed or chunked; sampled graphics identify their
coverage. Existing reports can be reused without rerunning unchanged analyses.
This requirement applies to research-data inspection, not mere downloading or
reading a paper that does not use its dataset.

## Method

1. Establish observation and sampling units, source, time window, units, keys,
   weights and the purpose of inspection. Identify panels, clusters, repeated
   measures and selection rules; a large row count need not be independent n.
2. Audit missingness by variable and relevant groups, missing-value mechanisms
   as hypotheses, range/unit inconsistencies, constant measures and duplicate
   identities. Diagnose outliers against measurement context; retain originals.
3. Summarize distributions using counts and appropriate quantiles, center and
   spread. Show group denominators and empty groups. Respect censored, ordinal,
   categorical and zero-inflated variables rather than forcing normal summaries.
4. Inspect time/order patterns and subgroup composition before pooled
   associations. Record complete-pair n for each association. Consider scale,
   nonlinear structure, Simpson-type reversals and dependence. A correlation
   cannot establish direction or a causal mechanism.
5. Write a small set of source-linked observations, alternative explanations,
   data-quality decisions and next tests. Label hypotheses generated after
   inspection; a follow-up needs fresh validation or declared exploratory status.
6. Check numbers against records and keep a requirements ledger. Requested
   figures use `table-chart` or `scientific-plot` with the project's profile;
   inspect actual exports, preserving source data and transformation history.

The optional Python 3.10+ standard-library helper:

```bash
uv run --offline --no-project python <skill>/scripts/describe.py --input prepared.csv --numeric score cost --identifier site --unit 'site-day observation' --output-directory diagnosis
```

It treats only blank cells as missing, requires prepared finite numbers,
reports inclusive quartiles and Tukey 1.5-IQR flags without removing records,
and computes descriptive Pearson correlations with complete-pair n. It does
not implement weights, panels, categorical analysis or inferential intervals.
Use suitable public tools for these needs; explain the chosen definitions.
See [cases](examples/cases.md) and [provenance](PROVENANCE.md).

## Requirements

- [B] R1 Unit, source, sampling/dependence and column roles are explicit — Verification: report distinguishes measures, identifiers and repeated observations.
- [B] R2 Summaries carry denominators and reproducible definitions — Verification: inspect counts, missingness, complete pairs and actual records.
- [B] R3 Exploration, quality flags and scientific claims are separate — Verification: no silent deletion or causal/significance conclusion from descriptive associations.
- [B] R4 Requested artifacts and ledger are complete — Verification: view figures when requested and account for every accepted outcome with evidence.

## When to stop

One bounded inspection, at most one targeted follow-up/repair and one final
check. Stop after the report addresses the stated inspection. Unknown units
or unprepared values block their dependent summaries; deliver independent
findings and the missing decision. Budget exhaustion reports remaining work.

## Output contract

Diagnostic report, machine-readable summaries or reproducible calculations,
requested figures, evidence locations, limitations and requirements ledger.
EDA does not complete a subsequent hypothesis test or scientific experiment.
