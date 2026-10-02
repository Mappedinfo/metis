# Choosing a chart, layout and profile

Use this guide to turn a reader's question and prepared columns into a
renderable specification. A file's parseable types narrow the options; the
meaning of its variables decides which options are appropriate.

## Data and comparison

| Data and question | First candidate | Useful alternative and layout |
|---|---|---|
| Category + one value: compare magnitudes | `bar` with a zero baseline | `dot` for a compact position comparison. Keep source order unless another order is explicitly prepared. Horizontal labels suit long category names. |
| Category + value: compare several series | Grouped `bar` or `dot` | Facet by series if labels or marks become crowded; use shared scales so panel sizes do not imply different magnitudes. |
| Ordered numeric or temporal x + value: show change along the sequence | `line` | For numeric x, use `scatter` if connecting observations would imply an unsupported continuous process. The current scatter renderer requires numeric axes. Use markers and line patterns as well as color for several series. |
| Two numeric variables: show their relationship | `scatter` | Facet a group column when series overlap. A visible association is not a fitted model or a causal estimate. |
| One numeric variable: show its distribution | `histogram` | Choose and report bin count; compare groups with the same bin boundaries or aligned facets. Bins alter appearance and do not reveal a unique distribution shape. |
| Category + repeated numeric observations: compare distributions | `box` | A histogram faceted by category shows shape more directly. Keep outliers and report the box/whisker convention and group sample sizes; boxes are not confidence intervals. |
| Two categories + one value for every pair: compare a matrix | `heatmap` | Use ordered rows/columns and a labeled colorbar; a sequential scale shows magnitude, while a diverging scale needs a meaningful supplied center. Duplicate or absent cells require preparation. |

Numeric IDs, postal codes, treatment codes and years are common ambiguous
cases. Override the planner's assessment with `--types`; do not draw a trend
through unrelated numeric identifiers. Repeated categories may represent
replicates suitable for a box plot, rather than bars requiring a hidden mean.
Temporal columns currently accept ISO dates (`YYYY-MM-DD`). A numeric year
can be the numeric x of a line when its ordered meaning is established;
declaring it `temporal` does not convert it into a full date.

The renderer supports up to 10,000 source rows, 20 categories per categorical
axis and six series or facet panels. These are implementation limits, not
claims that every allowed figure is readable. It does not sample points,
merge categories, impute missing values or create summary estimates for bars.
Profiles may support fewer simultaneous series if distinct encodings run out;
use facets instead. Select at most 60 input columns before planning.

## Layout decisions

Start with one panel for one comparison. A single-column width suits a short
category list or one series. Use double-column width for a matrix, many long
labels, or side-by-side facets; dimensions and type sizes come from the
selected profile. Widen or split a plot before shrinking text.

Overlay a small number of distinguishable series when reading differences at
the same x matters. Prefer faceting when overlap hides observations or a
legend burdens the reader. For two panels, two columns often works; for
three to six panels compare two- and three-column layouts at their final
size. Keep like axes and color limits comparable and panel order stable.
Unused grid slots stay empty, not additional data panels.
Panels must remain at least 50 mm wide. A heatmap with more than eight
categories on either axis requires double-column width; cell labels must
fit inside their cells without silently rounding values.

The current `facet` mode splits the `group` column into panels of the same
chart type. It does not assemble unrelated charts into a paper's composite
figure. Supply a separate specification for each distinct comparison.

## Palette choice

Choose a palette by the meaning of the color channel, then the output medium.
Use categorical colors for labels without order, sequential colors for an
ordered quantity, and a diverging scale only around an explicitly meaningful
center. The profile is the source of actual colors and styles.

| Profile | When to choose it | What to inspect |
|---|---|---|
| `journal` | Default journal-style categorical comparison using an Okabe–Ito-based family | Pair series colors with shapes, line patterns, hatches or facets. Similar gray levels can still coincide after printing. |
| `journal-grayscale` | Monochrome or print-first delivery | Check tonal contrast and non-color encodings at final size; adjacent gray fills alone may be insufficient. |
| `journal-npg` | A requested ggsci NPG-inspired categorical appearance | This is not Nature's official palette or a universal accessibility claim. Retain redundant encodings and inspect the grayscale preview. |

The generated `chart-grayscale.png` exposes distinctions that depend entirely
on hue. It is a review aid, not a color-vision-deficiency simulation or an
accessibility certification. Check mark overlap, contrast, legend matching
and grayscale readability in the actual figure. Profile provenance and
palette definitions are maintained in the collection's
[profiles guide](https://github.com/mappedinfo/metis/blob/main/profiles/README.md).

## Specification

Create a JSON object with these fields; examples below use fictional data.

| Field | Value |
|---|---|
| `chart` | `bar`, `dot`, `line`, `scatter`, `histogram`, `box` or `heatmap` |
| `x` | Column name; category for bar/dot/box, numeric or temporal for line, numeric for scatter/histogram, category for heatmap |
| `y` | Column name; numeric except for heatmap's category axis; omitted for histogram |
| `value` | Numeric value column for heatmap only |
| `group` | Optional categorical series/facet column; heatmaps use one complete matrix without a group column |
| `types` | Selected column names mapped to `categorical`, `numeric` or `temporal` |
| `units` | Numeric/temporal selected columns mapped to explicit units; use `date` for dates or an explicit dimensionless unit |
| `title` | Factual nonempty title supplied by the task |
| `layout` | `{ "mode": "single" or "facet", "width": "single" or "double", "columns": 1, 2 or 3 }` |
| `bins` | Histogram bin count, an integer from 1 to 100; default 10 |
| `center` | Optional numeric center for a diverging heatmap |

The plan includes incomplete specification templates. Fill their null title
and units from task context before rendering. The renderer validates these
decisions again; a candidate is not a ready figure.

The [observations CSV](../examples/observations.csv) can be used with the
[line specification](../examples/line.spec.json). It also supports a scatter
plot of `temperature` versus `score` grouped by `series`, a histogram of
`score`, or a box plot with `x: series` and `y: score`. In those specifications,
use units `degrees C` and `points` and choose a corresponding factual title.
Line points are ordered by their selected x within each series; the receipt
records that ordering. Histograms record bin edges/counts and box plots record
their descriptive statistics.

The [matrix CSV](../examples/matrix.csv) and
[heatmap specification](../examples/heatmap.spec.json) demonstrate an explicit
zero center for fictional signed differences. Omit `center` for an ordinary
magnitude map. The [original CSV](../examples/example.csv) remains suitable
for `bar_chart.py`'s category/value interface.

For a faceted line example, change the line specification's layout to:

```json
{ "mode": "facet", "width": "double", "columns": 3 }
```

Review the final panels before adopting that layout. The same spec can use
any compatible journal profile without copying its palette into the spec.

## Maintainer examples

To reproduce the bounded fictional acceptance set, use a new output directory:

```sh
uv run --with 'matplotlib>=3.7,<4' --with 'PyYAML>=6,<7' python -B \
  /path/to/table-chart/scripts/render_examples.py \
  --profiles /path/to/project/profiles --output /path/to/new-examples
```

This generates nine examples covering all seven forms, including a faceted
line plot, an NPG-inspired scatter plot and a grayscale-profile heatmap.
The index and per-chart receipts describe what ran; visual review remains
pending until the actual exports and previews are inspected. These fictional
examples exercise the interface and do not establish performance on all data.
