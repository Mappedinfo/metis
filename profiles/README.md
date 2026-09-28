# profiles/ — shared style profiles

A **profile** is the single source of truth for a family of visual style:
palette, typography and export defaults. Skills describe *mechanism* (how to
draw, how to lay out); profiles describe *style* (which colors, which fonts,
which defaults). The two never mix.

## The contract

1. **Reference, never duplicate.** A skill that produces figures, decks or
   pages declares `uses: [profiles/<name>]` in frontmatter and reads the
   values from the profile at run time. A skill must never hardcode a
   palette or font stack that a profile already owns.
2. **One change, one file.** Switching a palette or font means editing one
   profile. metis-atlas graphs `uses:` edges, so `graph.json` shows every
   skill affected before you commit the change.
3. **Variation is a new profile, not a forked skill.** A journal style and a
   deck style differ as `journal.yaml` vs `deck.yaml`; the skills that
   consume them stay identical.
4. **Profiles are generic.** No personal identity, institution branding or
   private assets. Named variants (e.g. a venue style) are welcome as
   separate files.

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
