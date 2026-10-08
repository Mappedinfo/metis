---
name: data-preparation
description: >
  Prepare tabular data for analysis from explicit observation units, column
  meanings and transformation rules. Use for "clean this CSV", missing-value
  decisions, type conversion or a traceable analysis table. Deliver prepared
  data, a transformation specification and a row/source audit. Not for drawing
  an already prepared table, exploratory interpretation or causal inference.
license: MIT
category: analyze
domain: [data-analysis]
action: [transform, review]
uses: []
artifacts:
  - "Prepared data with an explicit column and observation-unit contract"
  - "Transformation specification, source hashes and record-level audit"
---

[中文主稿](SKILL.zh.md). This is the sole discovery entry; the Chinese
original and this English companion maintain the same workflow requirements.

## What it does

Make an analysis-ready table without changing the scientific unit or hiding
how records were removed, joined or transformed. Preserve the original input.

## When to use / not use

Use before analysis when types, missingness, keys or join rules are unresolved.
For an already prepared CSV figure use `table-chart`; for descriptive diagnosis
use `exploratory-analysis`. Do not choose imputation or exclusion solely because
it improves a model score. A preparation request does not authorize new data
acquisition, uploading data or rewriting the source file.

## Method

1. State the observation unit, population/time coverage, key, units and intended
   downstream use. Numeric IDs remain identifiers. Repeated observations are
   identified by the correct composite key; do not call them duplicates by ID alone.
2. Inventory supplied files and count records, missing tokens, malformed values,
   duplicate keys and incompatible units. Distinguish a blank, zero, unavailable
   measurement and structural absence. Report unresolved meanings before a
   dependent transformation; continue independent inspections.
3. Write explicit rules for types, missing values, exclusions, duplicate handling,
   joins, time zones, units and derived columns. Preserve raw columns or a source
   mapping. Joins name their cardinality and unmatched records; many-to-many
   expansion needs an intended unit and cannot silently multiply the sample.
4. Apply the rules to a new output. Learned imputers, encoders and scaling fit
   only on the permitted training partition; retain splits and fitting scope.
   Reversible presentation changes do not justify refitting preprocessing.
5. Reconcile input/output counts, key uniqueness, missingness, ranges, join
   expansion and units. Record removals and filled values by source record with
   the applicable rule. Check any aggregate against its contributing records.
6. Deliver prepared data, a data dictionary, the rules, changes and source hashes.
   Maintain a requirements ledger; preserve pending semantic decisions.

Read [CSV helper contract](references/csv-helper.md) when its limited type,
missing-value and duplicate operations match the request. The standard-library
helper is optional; other formats or joins use available public tools and the
same audit requirements. [Fictional cases](examples/cases.md) cover both boundaries.

## Requirements

- [B] R1 Unit, keys, column semantics and transformation rules are explicit — Verification: inspect the data dictionary and rules; unresolved rules have not been applied.
- [B] R2 Originals are preserved and every removal/fill/join is traceable — Verification: input hashes unchanged, count reconciliation and source-record mapping pass.
- [B] R3 The prepared table meets the accepted types, units, keys and split rules — Verification: inspect actual values and audit the fitting partition where relevant.
- [B] R4 Delivery includes a requirements ledger and unfinished decisions — Verification: each accepted outcome is done, blocked or n/a with evidence or a scope reason.

## When to stop

Use one inventory/application pass, at most one repair pass and one final check.
Stop after the table and audit satisfy applicable requirements. If meanings or
join rules remain unknown, deliver the usable diagnostics and identify the
smallest missing decision; required downstream transformations remain blocked.
Budget exhaustion reports completed and unfinished items, not a clean table.

## Output contract

New prepared table; dictionary and transformation specification; source hashes,
input/output counts, record audit and verification ledger. State residual
missingness and representativeness limits. Preparation is not evidence of a
scientific result. See [provenance](PROVENANCE.md).
