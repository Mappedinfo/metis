# skill-atlas

[skill-atlas](https://www.npmjs.com/package/metis-atlas) is metis's companion
tool for *seeing* a skill collection.

```bash
npx metis-atlas
```

It scans any collection of skills and builds a graph of how they reference,
route and depend on each other — useful once your skill count grows past what
fits in your head.

## Why it exists

Skills are meant to be [scoped and non-overlapping](/skills#admission-criteria).
In practice, collections drift: descriptions collide, routing overlaps, and two
skills quietly become one. skill-atlas reads the same frontmatter tag axes
(`domain`, `action`) that metis skills carry and surfaces that overlap before
it becomes duplication.

## With metis

The pairing is deliberate:

- **metis** defines what a good, shareable skill *is*.
- **skill-atlas** shows what your skill collection *actually looks like*.

See the [metis-atlas npm page](https://www.npmjs.com/package/metis-atlas) for
installation, usage and output formats.

## Check the metis contract

The published Atlas 0.1.0 CLI discovers skill files and infers references from
their bodies. It does not resolve `uses`, scan profile YAML or enforce metis
admission rules. This repository adds those checks around its graph library:

```bash
npm ci
npm run skills:check
# Select the paper scenario for the generated graph:
npm run skills:check -- --domain paper
```

The adapter writes `.atlas/skills.json`, `.atlas/graph.json` and
`.atlas/audit.json`. Explicit `uses` declarations create dependency edges to
skills and profiles; graph nodes retain category, domain and action tags.
The audit checks the controlled vocabulary, required `artifacts` declarations,
valid YAML and dependency targets. Invalid declarations exit nonzero. A domain
filter selects the graph view; it does not hide errors in other skills.

Passing the audit establishes that declarations are present and references
resolve. Reviewers must still judge whether the promised output is useful and
whether a task actually produced it. `npm run check` also runs the regression
tests and builds the documentation; the Pages workflow requires these checks.
