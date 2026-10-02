---
name: table-chart
description: >
  Recommend and render charts from a prepared CSV using the data's semantic
  types and the comparison the reader needs. Provides chart and layout
  alternatives, shared accessible or NPG-inspired style profiles, and
  reproducible exports. Data cleaning and statistical inference are outside
  this skill.
license: MIT
category: visualize
domain: [figure, data-analysis]
action: [create, transform, advise]
uses: [profiles/journal, profiles/journal-grayscale, profiles/journal-npg]
artifacts:
  - "Chart-selection plan with assumptions, alternatives, layout and style choices"
  - "Selected chart in the profile's formats and a grayscale inspection preview"
  - "Input, specification, profile and plotting scripts; provenance receipt and requirements ledger"
---

# table-chart

## When to use

Use for a prepared UTF-8 CSV when the user wants help choosing a chart or
wants a chart rendered. Supported forms are horizontal bar, dot, line,
scatter, histogram, box and heatmap, with grouped or faceted layouts where
the form supports them. Choose from the reader's question and column
meaning: numeric-looking IDs are categories, and numeric years may be time.
The planner's suggestions are candidates, not a determination of meaning.

Use the [chart and layout guide](references/chart-guide.md) when selecting a
form, writing its specification or choosing a palette. Raw-data cleaning,
imputation, inferred units, statistical tests, fitted models, maps and
uncertainty estimation require a separate preparation or analysis task.
Histograms and box plots provide descriptive summaries with recorded
parameters; they do not establish significance or causal effects.

## Method

1. Establish the comparison, selected columns, semantic types, units and
   factual title from the request and data documentation. Preserve the input.
   If selection is unresolved, run the planner and compare its alternatives:

   ```sh
   uv run --with 'matplotlib>=3.7,<4' --with 'PyYAML>=6,<7' python \
     /path/to/table-chart/scripts/chart.py plan \
     --input /path/to/prepared.csv --output /path/to/new-plan.json \
     --types '{"sample_id":"categorical","date":"temporal"}'
   ```

   Omit `--types` only when requesting an initial assessment. Explain why the
   selected form fits the question, its useful alternative, and the proposed
   single-panel or faceted layout. Fill the selected specification's title
   and required units; do not infer either from the column's spelling alone.
   If only a plan was requested, deliver the plan and state rendering is
   unperformed.
2. Read the chosen project's shared profile: `journal` for Okabe–Ito-based
   categorical colors, `journal-grayscale` for monochrome, or `journal-npg`
   for the ggsci NPG-inspired family. The latter is not an official Nature
   style or a guarantee of colorblind or grayscale accessibility. Check
   redundant markers, line styles, hatches or facets along with colors.
   `uses` targets resolve under `<project-root>/profiles/`; install missing
   profiles through metis-os's [profile installation guide](https://github.com/mappedinfo/metis/blob/main/profiles/README.md).
   Palette values, fonts and export defaults belong in profiles; local
   variations receive a new profile name.
3. Render the agreed specification with explicit paths:

   ```sh
   uv run --with 'matplotlib>=3.7,<4' --with 'PyYAML>=6,<7' python \
     /path/to/table-chart/scripts/chart.py render \
     --input /path/to/prepared.csv --spec /path/to/chart.spec.json \
     --profile /path/to/project/profiles/journal.yaml \
     --output /path/to/new-chart-output
   ```

   Python 3.10+, Matplotlib and PyYAML are required. Output paths must be new.
   The renderer refuses missing or invalid selected values, non-finite or
   unrepresentable numbers, more than 10,000 rows, more than 20 categories
   per categorical axis, more than six groups/panels, and duplicate heatmap
   cells. Heatmaps require a complete grid. Report preparation blockers;
   never silently drop rows, average repeated observations or fill gaps.
   Line ordering and histogram/box summaries are recorded transformations.
   The existing [bar plotter](scripts/bar_chart.py) remains available for
   its original category/value interface.
4. Inspect the final exports at the intended size and the grayscale preview.
   Check mappings, units, ordering, scales, legends, panel alignment, glyphs,
   clipping and whether groups remain distinguishable without hue. A preview
   alone does not establish accessibility under every visual condition.
   Unsupported glyphs require an installed font in a named profile variant;
   Chinese text needs a matching CJK font. Review the actual final PDF or
   raster export, not only its code or a successful rendering receipt.
5. Complete the generated requirements ledger with evidence for the accepted
   scope. The renderer leaves visual review pending. Allow at most two
   targeted repair rounds, each in a new output directory, then report any
   unresolved requirement and the smallest unblock condition.

## Requirements

- [B] R1 Selection fits the data and question — verification: plan or
  specification identifies semantic types, units, chosen form, layout and
  the assumptions behind the choice; ambiguous meaning is resolved before
  rendering.
- [B] R2 Values and transformations are traceable — verification: source hash,
  selected columns, row mappings and recorded ordering/binning/box statistics
  explain the plotted data; no hidden dropping, imputation or aggregation.
- [B] R3 Shared style and layout are applied — verification: exact profile,
  dimensions, palette/encoding choice, resolved fonts and export settings
  appear in the receipt and match the specification.
- [B] R4 The final figure is visually checked — verification: the ledger
  identifies the viewed export and grayscale preview and records mapping,
  readability, group discrimination, glyph and clipping checks. For an
  explicitly planning-only task this is `n/a`, with rendering unperformed.
- [B] R5 Execution is reproducible — verification: rendering delivers input,
  specification, profile and executable script snapshots, recorded software
  versions and a rerun command. A planning-only deliverable records its input,
  candidates and unresolved information; it does not claim execution.
- [A] R6 Palette limitations are explained — verification: recommendations
  distinguish categorical, sequential and diverging use and identify the
  NPG-inspired palette's provenance when it is selected.

## When to stop

Stop when the requested plan or rendered chart and its applicable evidence
are delivered. A rendered-chart request remains incomplete without an
inspected figure. Do not add unrelated plots or expand a descriptive chart
into an analysis claim.

Stop at a missing semantic decision, input/profile/font blocker, unsupported
form or exhausted repair budget. Report completed and blocked items. If the
data exceed the renderer's readability limits, propose an explicit selection
or another workflow; do not truncate categories or observations automatically.

## Output contract

For planning, deliver the column assessment and ranked chart candidates with
layout/style choices, assumptions, alternatives and fields still needed.
For rendering, deliver the chart in the profile's formats, grayscale preview,
`input.csv`, `spec.json`, `profile.yaml`, plotting scripts, `receipt.json`
and completed `requirements.md`. Link the final figure and report the actual
visual-check result and any remaining limitation.

The receipt binds input/profile/script hashes, mappings and transformations
to dimensions, fonts, exports, software versions and the rerun command.
Keep source snapshots and receipts with the user's artifacts; publication
is a separate action from chart creation.

## Provenance

Original generic implementation for metis, licensed MIT under the repository
license. Examples are fictional. Shared palettes and typography live in
profiles with their source references; no private skill text, research data
or personal style assets were copied.
