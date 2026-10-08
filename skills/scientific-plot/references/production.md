# Production and verification

[中文主稿](production.zh.md)

## Capture the computation boundary

Retain the original input and a machine-readable computed-data cache before
plotting. Record row/sample correspondence, transformations, parameters,
random seeds and versions. Changing a caption or palette reads that cache;
it does not refit a model. If the accepted request changes the computation,
save the new result and identify its parameters.

For a teaching example, identify the generator and label the data as generated.
State how supervision, stochastic initialization or hyperparameters affect
the comparison. A demonstration supports an explanation under its recorded
conditions, not general superiority. Do not search seeds or select panels to
manufacture the expected conclusion.

## Below-panel captions

Reserve a footer band for each panel row and one for the complete figure.
Finalize subplot geometry before positioning captions. For Matplotlib, draw
the canvas, obtain each axis's tight bounding box (including ticks and axis
labels), convert it to figure coordinates and place its caption below that
box. Measure the caption itself; if it overlaps the next row or figure footer,
allocate more space and remeasure after the layout changes. Avoid running an
automatic layout step afterward that moves axes without moving captions.
Use the equivalent measured layout with the selected backend.

Check every panel, including cells in the bottom row and plots with rotated
ticks. A structural check can verify caption boxes lie below their axes and
inside the export. View the exports as well: geometry does not establish
glyph coverage, comprehension, grayscale identification or correct values.
Explicit user/venue placement overrides take precedence and enter the record.

## Carry the contract into delegated work

Delegate only when allowed and useful. Supply the worker with:

- the accepted question, inputs and computation boundary;
- the exact readable skill entry and selected project profile path;
- requested count, dimensions, formats and caption placement/overrides;
- output locations, reproducible source/cache and required evidence;
- allowed writes and the inspection/repair budget.

The worker reads the selected guide before plotting. Merely naming a skill
in a message does not prove its body was read. The coordinator retains any
available read evidence and inspects the combined exports, caption positions
and data correspondence. A worker's successful process is not integrated QA.

## Representative standalone task

Generate a seeded, explicitly fictional three-dimensional curved sample;
show its first two coordinates and a two-component PCA projection side by
side. Use a project `journal` profile and below-panel descriptions. Cache the
input, PCA coordinates and parameters; produce the profile's formats. Explain
the two encodings under this input without claiming one universally recovers
structure. Redraw from the cache after changing only a caption.

Acceptance: input/sample correspondence is retained; figure and panel text
is below its plotted object and inside the export; files are visually checked;
the redraw leaves the computed-data hash unchanged. This is a skill-use
fixture, not a research experiment or a fresh-session discovery test.
