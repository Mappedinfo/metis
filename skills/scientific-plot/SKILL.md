---
name: scientific-plot
description: >
  Create, revise or audit scientific plots from arrays, computational outputs
  or a specified teaching demonstration, including 科研绘图、算法演示图 and
  自定义多面板图. Produces reproducible figures with shared project profiles,
  captions and visual checks. Use table-chart for prepared CSV charts covered
  by its renderer; research inference and editable mechanism diagrams need
  their own capabilities.
license: MIT
category: visualize
domain: [figure, data-analysis]
action: [create, revise, review]
uses: [profiles/journal, profiles/journal-grayscale, profiles/journal-npg]
artifacts:
  - "Figure design or audit with explicit data, computation and claim boundaries"
  - "Scientific figure exports with a recorded visual inspection"
  - "Source data, calculation and plotting entry, environment and requirements ledger"
---

# scientific-plot

[中文主稿](SKILL.zh.md)。This entry and the Chinese guide are a translation
pair with shared requirements; the discovery filename gives neither language
semantic priority.

## When to use

Use for numerical arrays, cached model outputs, learning curves, diagnostic
plots, custom panels or an explicitly requested algorithm demonstration.
Advice and audit may use supplied figures without generating data.

For a prepared CSV and a chart supported by `table-chart`, use that bounded
renderer directly. A project name or plotting library alone does not decide
the skill. This skill owns numerical figure production; it does not own a
research experiment, statistical inference, literature discovery, map pipeline
or editable mechanism diagram. Reuse an accepted analysis rather than running
it again just to redraw a figure.

## Method

1. Establish the reader's question, supplied inputs, intended use and requested
   outputs. Select advice, audit, production or revision from the request.
   Distinguish observed data, existing computed results and generated teaching
   data. If a real result is missing, report the missing input; only a request
   for a demonstration authorizes generating demonstration data. Keep the
   scope and number of figures the user requested.
2. Choose an encoding and panel arrangement for that question. Preserve units,
   denominators, sample identity and meaningful comparisons. A projection is
   not evidence of causal effects or reliable clusters; a fixed seed makes
   a run reproducible, not stable. Captions state what was computed and the
   limits of the comparison, including labels used in model fitting.
3. Read the project's chosen `profiles/<name>.yaml`. `journal`,
   `journal-grayscale` and `journal-npg` are alternatives, not three mandatory
   outputs. Read palette, typography, dimensions and export defaults from the
   selected profile. Honor an explicit user or venue override and record it.
   Install a missing profile using the [profile installation guide](https://github.com/mappedinfo/metis/blob/main/profiles/README.md)
   within authorized scope; preserve existing variations. Do not substitute
   a personal style or copy its private assets because a profile is missing.
4. Reuse the project's plotting entry and selected backend. An existing Python
   or R pipeline settles the backend; otherwise choose a suitable available
   backend unless that choice materially changes the requested deliverable.
   Separate calculation from rendering, cache calculated values and record
   inputs, parameters, seeds and dependency versions. Lightweight calculations
   for a requested teaching example belong in its reproducible source; a new
   research experiment remains a separate phase.
   Read [production and verification](references/production.md) for production
   or revision, especially multi-panel layout and delegation.
5. Follow the profile's below-plot convention: the figure title and caption
   sit below the complete figure; each panel title/caption sits below its own
   panel. Axis labels remain attached to their axes. Do not implement captions
   with `suptitle` or `set_title`. An explicit user or venue rule may override
   placement. Reserve space, finalize axes geometry and measure text extents;
   moving only the outer caption does not fix top-mounted panel captions.
6. Export the requested formats at the intended size, inspect the actual files
   and record label readability, overlap, clipping, units, scales, panel
   correspondence and group identification. Check a grayscale view when color
   carries meaning. For editable vector text, reopen an SVG/PDF and inspect
   text objects; the extension alone proves nothing. Re-render only affected
   outputs after a repair, then update the same requirements ledger.

Maintain a ledger for the accepted task and R1–R7 below, using
`done`, `blocked` or `n/a` with evidence or a scope-based reason. A planning
request checks the plan and identifies plotting as unperformed. A supplied
figure audit does not require rewriting its plotting pipeline.

## Requirements

`[B]` means required for completion; `[A]` means advisory. R1–R7 are stable
check identifiers, not a prescribed section structure for the user's figure.

- [B] R1 Input and claim boundaries — Verification: each panel identifies its source and transformations; demonstration data are identified and missing empirical results remain missing.
- [B] R2 Encoding answers the question — Verification: check units, denominators, comparable scales, label use during fitting and the requested comparison against inputs.
- [B] R3 Project style is applied — Verification: record the actual profile and overrides; inspect exports for the selected style and placement of every figure/panel caption.
- [B] R4 Computation is reproducible — Verification: retain inputs or an authorized public loader, calculation parameters, environment and a runnable rendering entry; a redraw uses cached results rather than rerunning expensive analysis.
- [B] R5 Final files are inspected — Verification: view the requested exports at intended size; record clipping, glyphs, legibility, group identification and any required editable-text check.
- [B] R6 Delegated requirements survive — Verification: when delegation is used, each worker receives the selected skill entry, profile, inputs, permitted computations, output contract and relevant checks; the coordinator inspects the integrated result. Otherwise record n/a.
- [A] R7 Useful alternative — Verification: consider a different encoding or layout when it exposes a real tradeoff; omit it when the selected design is already settled.

## When to stop

- Advice or audit ends with the requested recommendations/findings and ledger;
  production ends with requested exports, reproducible inputs and passing
  evidence for every applicable blocking requirement.
- Use one complete visual inspection, at most one scoped repair round and one
  affected-output reinspection per accepted version. At budget exhaustion,
  report completed work, unfinished requirements and the smallest unblock
  condition; keep unresolved required items blocked. A new user revision is
  a new accepted version, not an excuse to discard compatible requirements.

## Output contract

Deliver the requested advice, audit or figures, with the applicable source
data, computation/rendering entry, profile/override record, environment and
requirements ledger. Report the actual visual checks and any unresolved work.
File creation, a caption-position assertion and a skill installation each
prove their own check; none establishes scientific validity or automatic
selection in a fresh host session.
