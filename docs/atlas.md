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