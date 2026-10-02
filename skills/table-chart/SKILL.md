---
name: table-chart
description: >
  Turn a prepared CSV into one horizontal bar chart, preserving one unique
  category and one numeric value per row. Use for a small, direct comparison
  with known units; data cleaning, aggregation and statistical inference are
  outside this skill.
license: MIT
category: visualize
domain: [figure, data-analysis]
action: [create, transform]
uses: [profiles/journal]
artifacts:
  - "One bar chart exported in the selected profile's formats"
  - "Rerunnable plotting script and the exact profile used"
  - "JSON input mapping and provenance receipt; requirements ledger with visual evidence"
---

# table-chart

## When to use

Use when the user supplies a prepared UTF-8 CSV, identifies a category column
and a numeric column, and wants one direct comparison. Confirm the value's
unit and a factual title from the input or task context. Each category must
occur once; the accepted scope is 1–20 rows, kept in source order.

Do not use for raw-data cleaning, aggregation, inferred units, percentages
calculated from counts, inferential tests, uncertainty estimates, multi-panel
figures, or a chart whose requested form is not a horizontal bar chart. Name
the missing preparation or capability instead of silently changing the task.

## Method

1. Record the selected columns, unit, title and output directory. Preserve the
   input file. Missing values, duplicate categories, non-finite numbers and
   more than 20 rows are blockers; do not drop or repair rows automatically.
   Values that underflow or change decimal value during floating-point
   conversion also block rendering; seek an agreed precision or another tool
   instead of silently rounding. Labels retain the original numeric text.
2. Read the project's `profiles/journal.yaml`. `uses: [profiles/journal]` is
   a logical project dependency, not a path inside this installed skill.
   Install the shared profile with `metis-os profiles install` when available
   and authorized, or follow the collection's profile installation guide.
   Resolve profile conflicts before rendering. Styles come from the profile;
   a change in style belongs in a named profile variant.
3. Run the bundled [plotter](scripts/bar_chart.py) with explicit paths. It
   requires Python 3.10+, Matplotlib and PyYAML; `uv` can supply dependencies:

   ```sh
   uv run --with 'matplotlib>=3.7,<4' --with 'PyYAML>=6,<7' python \
     /path/to/table-chart/scripts/bar_chart.py \
     --input /path/to/prepared.csv --category category --value value \
     --unit points --title 'Example comparison' \
     --profile /path/to/project/profiles/journal.yaml \
     --output /path/to/new-chart-output
   ```

   The output directory must not already exist. The script uses the profile's
   palette, font stack, type sizes, width, line width, resolution and export
   formats. Height is derived from the row count and type size. It preserves
   negative and zero values, includes the zero baseline, and does not sort,
   normalize or aggregate. The included [sample CSV](examples/example.csv)
   is entirely fictional and only demonstrates the interface.
4. Inspect the exported figure at its intended size, not just the code or
   receipt. Check category order, values, units, baseline, legibility,
   truncation, overlap and glyphs. The script requires installed fonts named
   by the profile that cover the actual text. For Chinese, use a named profile
   with an installed CJK family, such as Noto Sans CJK SC; missing coverage
   fails with an explicit message rather than exporting broken characters.
5. Complete `requirements.md` with status and evidence for each blocking
   requirement and any additional accepted user requirements. The generated
   receipt states that visual review was not performed by the script. Record
   the actual visual review in the ledger; do not reinterpret a successful
   render as visual acceptance. Allow at most two targeted repair rounds,
   writing each attempt to a new directory and reviewing the final export.

## Requirements

- [B] R1 Prepared input and scope are preserved — verification: receipt names
  the input SHA-256, selected columns, unit, source rows and row count; no row
  is omitted, imputed, combined or reordered.
- [B] R2 The plot represents the supplied values — verification: receipt's
  category/value mapping matches the CSV, and each horizontal bar starts at
  zero with the original signed width; no inferred statistic is introduced.
- [B] R3 Shared style is applied — verification: receipt identifies the exact
  profile SHA-256, resolved fonts, dimensions, resolution and exported files;
  the selected profile's formats exist.
- [B] R4 The final figure has been visually checked — verification: the ledger
  names the viewed export and records readability, clipping, glyphs, baseline
  and value checks; unavailable inspection leaves this item blocked.
- [B] R5 The artifact can be reproduced — verification: the output contains
  `bar_chart.py`, `profile.yaml`, `receipt.json` and `requirements.md`; the
  receipt records software versions and a rerun command using a fresh output
  directory, with the unchanged original CSV retained at its recorded path.

## When to stop

Stop after delivering the figure and evidence with all applicable blocking
items done. No chart means the task is incomplete. Do not add more charts or
interpret the comparison as a causal or statistically significant finding.

Stop when required input, fonts, profile or rendering capability is missing,
or the two repair rounds are exhausted. Report completed items, blocked items
and the smallest missing input or layout decision; never claim full acceptance
while a blocking requirement is unresolved. A request exceeding 20 rows needs
an explicit scope or layout choice before a different workflow is used.

## Output contract

Deliver one output directory containing the figure in the profile's formats,
the exact plotting script and profile, a machine-readable input/provenance
receipt, and a completed requirements ledger. Link the rendered figure and
state the actual visual-check result and any unresolved requirement.

The receipt includes source and profile hashes, selected columns, supplied
units, row mapping, an explicit no-transformation declaration, geometry and
export settings, resolved fonts, tool versions and the rerun command. Keep
source paths and receipts with the user's artifacts; publishing them is a
separate action from creating a chart.

## Provenance

Original generic implementation for metis, licensed MIT under the repository
license. No private skill text, research data or personal style assets were
copied. Shared colors and typography are read from the separately maintained
profile; this skill does not own a second style definition.
