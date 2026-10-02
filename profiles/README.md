# profiles/ — shared style profiles

A **profile** is the single source of truth for a family of visual style:
palette, typography and export defaults. Skills describe *mechanism* (how to
draw, how to lay out); profiles describe *style* (which colors, which fonts,
which defaults). The two never mix.

## The contract

1. **Reference, never duplicate.** A skill that produces figures, decks or
   pages declares `uses: [profiles/<name>]` in frontmatter and reads the
   values from `<project-root>/profiles/<name>.yaml` at run time. `uses` is
   an identifier, not a path relative to the installed skill. A skill must never hardcode a
   palette or font stack that a profile already owns.
2. **One change, one file.** Switching a palette or font means editing one
   canonical profile. `npm run skills:check` combines Atlas graph analysis
   with metis dependency checks, so `.atlas/graph.json` shows declared
   consumers before you commit the change. Atlas 0.1.0 alone does not read `uses`.
3. **Variation is a new profile, not a forked skill.** A journal style and a
   deck style differ as `journal.yaml` vs `deck.yaml`; the skills that
   consume them stay identical.
4. **Profiles are generic.** No personal identity, institution branding or
   private assets. Named variants (e.g. a venue style) are welcome as
   separate files.

## Install and resolve

The skill installer copies individual skill folders. Shared profile installation
is in the **0.3.0 source version, not yet published to npm**. Prepare the bundle
in the metis checkout, then invoke that CLI from the target project:

```bash
# In the metis checkout
npm ci
npm run profiles:bundle

# In your target project; substitute the checkout path
cd /path/to/your-project
node /path/to/metis/packages/metis-os/bin/metis-os.js profiles install
node /path/to/metis/packages/metis-os/bin/metis-os.js profiles path journal
```

The last command prints the local absolute path that a consumer should read.
If a required profile is missing, report the missing name and the install step;
do not silently substitute another artifact's profile. After 0.3.0 is published,
`npx metis-os@^0.3.0` can replace the absolute source CLI invocation.
See [release state](../HANDOFF.md).

Root `profiles/` is the only editable source. `npm pack` copies these YAML files
into the CLI package as generated release assets. Installing creates a local
snapshot; source edits reach consumers after bundling, release and reinstallation.
No live synchronization is implied. Matching files are left alone, differing
files require `profiles install --force`, and symlink destinations are refused.
Keep local variations under new profile names so upgrades preserve them.

For mixed outputs, select a profile per artifact: a journal figure can retain
print dimensions and PDF export while its deck uses presentation type sizes.
Coordinate color and font roles across profiles; do not replace all export and
layout defaults with those of the last artifact in the job.

## Schema

```yaml
name: journal                 # matches the file name
version: 0.1.0
description: >
  One sentence: which artifact family this style serves.
palette:                      # named hex colors; roles, not decorations
  primary: "#0072B2"
  ...
typography:                   # font stacks and base sizes per artifact role
  body: "..."
  ...
figure:                       # optional: export defaults for figure artifacts
  title_position: below
  caption_position: below
  panel_title_position: below
  dpi: 300
  format: [pdf, png]
chart_style:                  # optional: chart consumers require this block
  categorical: ["#0072B2", "#E69F00"]  # ordered series cycle
  sequential: cividis         # registered Matplotlib colormap name
  diverging: BrBG             # centered continuous scale
  markers: [o, s]
  line_styles: ["-", "--"]
  hatches: ["", "//"]
deck:                         # optional: defaults for slide artifacts
  aspect: "16:9"
```

Roles inside `palette` and `typography` are the stable interface; concrete
values may evolve within a profile version. Consumers read named roles such as
`palette.primary`. The separate `chart_style.categorical` list is an explicit
ordered series cycle: keep its assignment stable across panels. Do not silently
cycle colors when there are more series than entries; split the display or
select a suitable named profile. Markers, line styles and hatches are available
as redundant encodings, selected by chart mechanism and output requirements.
Continuous quantities use the sequential or diverging colormap rather than
interpolating through categorical colors. A centered scale needs a meaningful
reference value in the chart specification; negative numbers alone do not
establish what comparison matters.

All collection profiles place figure titles and captions below the plot and
subplot titles below their respective panels. Consumers reserve space beneath
axis labels so the title, caption and panel labels do not overlap the chart
or each other. This is the metis project convention requested by its user,
not a universal journal rule. The fields live under `figure`, including in
`deck.yaml`; they govern figures used in slides, not slide headings.

## Current profiles

| Profile | Recommended use | Important boundary |
|---|---|---|
| `journal.yaml` | Default scientific figures; eight Okabe–Ito categorical colors, `cividis` sequential and `BrBG` centered scales | Combine colors with labels, shapes or positions; yellow needs a dark outline at small sizes |
| `journal-grayscale.yaml` | Monochrome output; four gray levels plus shapes and line styles; `gray_r` for continuous values | For centered heatmaps the monotonic gray ramp preserves sign direction; keep signed cell labels and show the reference value on the colorbar |
| `journal-npg.yaml` | A requested Nature Reviews Cancer-inspired look using ggsci's ten-color NPG series | A style option, not an official Nature palette or an accessibility guarantee; metric ramps remain `cividis` / `BrBG` |
| `deck.yaml` | Presentation slides: the original `journal` color roles, larger type, 16:9 | A slide profile; it does not supply chart dimensions or the `chart_style` block |

## Choosing color and checking the result

For categorical comparisons, prefer the default `journal` profile and a small
number of series. Line and scatter plots should distinguish groups by both
color and marker shape; lines can also differ in dash pattern. Direct labels
and separate panels remain useful when colors collapse in print. This follows
[Okabe and Ito's Color Universal Design guidance](https://jfly.uni-koeln.de/color/).

For ordered magnitudes, use `cividis`; its design specifically considers
red–green color vision deficiencies. For deviations around a stated reference,
use a centered scale such as `BrBG`. Opposite sides of a diverging palette can
have similar gray levels, so signs must remain recoverable from labels or a
different display. The grayscale profile uses a monotonic ramp even for
centered scales to avoid that ambiguity. See the
[cividis paper](https://doi.org/10.1371/journal.pone.0199239) and
[Matplotlib's colormap guidance](https://matplotlib.org/stable/users/explain/colors/colormaps.html).

The NPG colors are the ten values published by Nan Xiao's
[ggsci `pal_npg("nrc")`](https://nanx.me/ggsci/reference/pal_npg.html), credited in
the profile. They are inspired by plots in *Nature Reviews Cancer*. Choosing
them does not establish compliance with any journal. Nature's own
[figure specifications](https://research-figure-guide.nature.com/figures/preparing-figures-our-specifications/)
require accessible colors and readable, editable text, and discourage fill
patterns. For such submissions, use marker shapes, labels and panels instead
of hatching, and check the target journal's current dimensions and text sizes.
The `journal-npg` profile therefore supplies an empty hatch style.

Inspect exports at their final size in both color and grayscale: check group
identity, thin lines, overlapping marks, pale fills, labels and colorbar meaning.
Color-vision simulations can reveal problems but do not certify accessibility
for every reader. A successful export or palette name is not a passed visual
review. Profile colors and font choices stay in YAML; the skill records the
actual profile, encodings and visual checks used for each artifact.
