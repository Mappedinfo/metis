# metis skills

Public, generic agent skills. Each skill is a directory with a `SKILL.md`
(frontmatter: `name`, `description`) following the
[agentskills.io](https://agentskills.io) format.

## The seven categories

Every skill carries a `category` frontmatter field with exactly one of the
values in [../skill-contract.json](../skill-contract.json):
`acquire` (retrieving literature, data, knowledge) · `analyze` (methods,
evidence, experiments, audit) · `compose` (writing & expression) ·
`visualize` (scientific figures) · `present` (slides, talks, distribution) ·
`build` (builds, tooling, releases) · `meta` (orchestration & quality).

Categories are capability domains, not scenarios: "a paper" or "a thesis" is
a *combination* of skills sharing a `domain` tag. Shared style (palette,
typography, export defaults) lives once in [../profiles/](../profiles/) and
is referenced with `uses:`, never duplicated inside skills.

Skills are original, hand-written contributions — never ports from private
or vendor collections. See [../CONTRIBUTING.md](../CONTRIBUTING.md) for the
authoring template and the metis-atlas organizing loop.

**Narrow exception — vendored upstream skills.** A skill whose value lives in a
public open-source backend (e.g. an MCP server) may be vendored instead of
rewritten, but only when **all** hold: the upstream license is permissive and
OSI-approved (MIT / Apache-2.0 / BSD); the upstream LICENSE file ships inside
the skill directory; the frontmatter carries `source` and `source_license`;
a `## Provenance` section states every modification (Apache-2.0 §4); and the
skill still meets admission criteria 1–6. Vendored skills are the exception,
not the model — new capabilities are written from scratch.
Current vendored skills: `scansci-pdf` (Apache-2.0, Rimagination/scansci-pdf).

## Admission criteria

A skill belongs here only if all of the following hold:

1. **Generic.** It encodes reusable craft, not one person's identity, preferences,
   private projects or private data. Personal overlays belong in `USER.md`, never
   in a skill.
2. **Self-contained.** It works without access to any private repository, vault or
   service. External dependencies must be public and named.
3. **Honest.** Instructions must not ask the agent to invent evidence, fabricate
   citations, or misrepresent capability.
4. **Scoped.** One capability per skill. If a description needs "and also…" twice,
   it is two skills.
5. **Writable description.** The frontmatter `description` says when to use the
   skill and when *not* to, in the third person, without marketing language.
6. **Artifact-anchored.** A required nonempty `artifacts` frontmatter array
   names concrete, verifiable deliverables: a downloaded PDF, a figure, a
   deck, a runnable package, or a planning note with acceptance criteria.
   The description or Output contract explains the relevant output and how
   to check it.

## Tags

Skills carry two controlled tag axes in frontmatter. Their source of truth
is [../skill-contract.json](../skill-contract.json):

- `domain` — 1–2 of: literature, paper, research-design, experiment,
  data-analysis, writing, review-qa, figure, slides, office-doc, web-dev,
  knowledge, project-ops, media, workflow-meta (first is primary)
- `action` — 1–3 of: create, transform, revise, review, analyze, retrieve,
  orchestrate, record, advise, test (ordered)

Tags let the repository's collection check export domain views and help
reviewers identify overlapping capabilities.

## Dependencies

A skill that needs a shared style profile or another skill declares it in
frontmatter, e.g. `uses: [profiles/journal, metis-router]`. The repository's
`npm run skills:check` adapter validates these targets and records them as
dependency edges in `.atlas/graph.json`.

`profiles/journal` identifies `<current-project-root>/profiles/journal.yaml`;
it is not a path relative to `SKILL.md`. Installing a skill does not install
the repository's sibling `profiles/` directory. Install the profiles into
the target project using `metis-os profiles install`; see
[../profiles/README.md](../profiles/README.md) for the source and published
CLI instructions. Each artifact retains its own export and sizing defaults
when profiles share a palette or font family.

## Validation

Run `npm run skills:check` from the repository root after editing a skill,
profile or controlled vocabulary. It writes `.atlas/skills.json`,
`.atlas/graph.json` and `.atlas/audit.json`. To export a domain view, use
`npm run skills:check -- --domain paper`; the audit still covers the full
collection.

This adapter builds on the published `metis-atlas@0.1.0` scanner. Native
`npx metis-atlas scan` does not check the metis `artifacts` declarations or
resolve profile dependencies. The repository check validates declarations,
references and controlled vocabulary; assessing a skill's actual output
still requires task-specific review.

## Contributing

Open a PR with one skill per PR. Expect review on admission criteria 1–6 above.
