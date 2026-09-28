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
  dpi: 300
  format: [pdf, png]
deck:                         # optional: defaults for slide artifacts
  aspect: "16:9"
```

Roles inside `palette` and `typography` are the stable interface; concrete
values may evolve within a profile version. Consumers read roles
(`palette.primary`), never positions.

## Current profiles

| Profile | Serves |
|---|---|
| `journal.yaml` | Submission-grade figures: print-safe, colorblind-safe, serif-free |
| `deck.yaml` | Presentation slides: same family as `journal`, larger scale, 16:9 |
