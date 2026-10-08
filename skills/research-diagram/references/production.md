# Executable production and artifact inspection

Read for production. Reuse an available project backend. The commands below
assume a local Mermaid CLI; they do not authorize automatic installation or a
remote rendering service. If no renderer exists, prepare a versioned dependency
within authorized setup scope, or deliver source with rendering blocked.

## Mermaid to SVG

1. Save UTF-8 `.mmd` with stable node IDs and short labels. Verify fonts for
   scientific notation; label edges by transfer/feedback meaning. Handle quotes,
   brackets and HTML characters using Mermaid's syntax.
2. Map the chosen project profile's fonts, colors and background to Mermaid
   `themeVariables` in a separate JSON config. Retain profile/overrides. Put
   external captions outside flow nodes when the profile requires that layout.
3. Local CLI example:

```sh
mmdc -i method.mmd -o method.svg -c mermaid-config.json -b transparent
```

An existing Chrome may be selected with `-p puppeteer-config.json` containing
`{"executablePath":"<verified local Chrome path>"}`. Keep machine paths in the
run record, not this shared skill. Record renderer/version; exit success proves
export execution, not visual quality.
For a below-diagram caption, declare one or more `%% caption: text` comments
in `.mmd`, then invoke the standard-library helper from this skill's directory:

```sh
python scripts/add_caption.py method.mmd raw.svg method.svg --font-size 16 --width-mm 183
```

It preserves the original render and only expands the canvas/adds text.
`--width-mm` sets final physical width from the profile/accepted requirement
while retaining the aspect ratio. Pass
font size, family and ink from the profile or accepted preview override. Wrap
long captions using multiple source comments. The helper does not measure text
width; inspect the final file and repair observed clipping/overlap.

4. Parse the SVG and verify a nonempty viewBox, requested labels and usable
   fonts. Render it in an available viewer/browser and inspect at final size:
   glyphs, overlaps, connections and reading path. Retain SVG when producing a
   PNG preview; the preview is not editable source.
5. Trace relations against the node/edge map. Check branch conditions and
   feedback destinations, and distinguish causality, association, transfer and
   dependency. Label counts alone do not establish correct relationships.

## draw.io

Deliver `.drawio` when requested. Use native `mxCell` vertices for text/shapes
and edges with source/target for connections. Do not bake semantic relationships
into images. Optional illustrations need usable sources and licensing evidence.

Open saved source in an available draw.io application or compatible backend and
export the requested files. For native-edit acceptance, change one label and
connector endpoint in a test copy, save and reopen, and check text, endpoints
and grouping. XML proves object/reference presence; it cannot replace actual
application editing or visual inspection. Keep a required application-edit check
blocked when unavailable; a single SVG/PNG is not a draw.io deliverable.

## Delegation and records

Give the work unit the skill entry, profile, source materials, allowed inference
or teaching data, figure count, source/export formats and checks. The coordinator
inspects the combined diagram and edge meanings, not only a completion message.
Keep renderer/configuration/version/source and visual observations in working
records; put only reader-relevant explanation in the caption.

If another SVG backend is used, its export must be driven by the same node/edge source. A separate script with hard-coded relations does not establish agreement with the Mermaid source. Keep actual rendering or visual checks blocked when absent; structural counts are not visual inspection.
