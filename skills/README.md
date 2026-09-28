# metis skills

Public, generic agent skills. Each skill is a directory with a `SKILL.md`
(frontmatter: `name`, `description`) following the
[agentskills.io](https://agentskills.io) format.

## The six categories

Every skill carries a `category` frontmatter field with exactly one of:
`write` (writing & expression) · `research` (methods & evidence) ·
`paper` (academic writing & peer review) · `present` (slides & talks) ·
`figure` (scientific figures) · `build` (local builds & tooling).

Skills are original, hand-written contributions — never ports from private
or vendor collections. See [../CONTRIBUTING.md](../CONTRIBUTING.md) for the
authoring template and the metis-atlas organizing loop.

**Narrow exception — vendored upstream skills.** A skill whose value lives in a
public open-source backend (e.g. an MCP server) may be vendored instead of
rewritten, but only when **all** hold: the upstream license is permissive and
OSI-approved (MIT / Apache-2.0 / BSD); the upstream LICENSE file ships inside
the skill directory; the frontmatter carries `source` and `source_license`;
a `## Provenance` section states every modification (Apache-2.0 §4); and the
skill still meets admission criteria 1–5. Vendored skills are the exception,
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

## Tags

Skills carry two controlled tag axes in frontmatter:

- `domain` — 1–2 of: literature, research-design, experiment, data-analysis,
  writing, review-qa, figure, slides, office-doc, web-dev, knowledge, project-ops,
  media, workflow-meta (first is primary)
- `action` — 1–3 of: create, transform, revise, review, analyze, retrieve,
  orchestrate, record, advise, test (ordered)

Tags let [metis-atlas](https://www.npmjs.com/package/metis-atlas) graph the
collection and surface overlap before it becomes duplication.

## Contributing

Open a PR with one skill per PR. Expect review on admission criteria 1–5 above.