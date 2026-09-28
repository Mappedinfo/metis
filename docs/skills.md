# Skills Catalog

The `skills/` directory holds public, generic agent skills. Each skill is a
directory with a `SKILL.md` (frontmatter: `name`, `description`) following
the [agentskills.io](https://agentskills.io) format.

Install them into your agents (Claude Code, Codex, Cursor, …) with:

```bash
npx skills add mappedinfo/metis
```

Visual skills also need the shared profiles installed into the project they
work in. Skill installation does not copy the repository's sibling
`profiles/` directory. See the
[profile installation instructions](https://github.com/mappedinfo/metis/blob/main/profiles/README.md)
for the `metis-os profiles install` command and source-checkout entry.

## Admission criteria

A skill belongs in metis only if **all** of the following hold:

1. **Generic.** It encodes reusable craft, not one person's identity,
   preferences, private projects or private data. Personal overlays belong in
   `USER.md`, never in a skill.
2. **Self-contained.** It works without access to any private repository, vault
   or service. External dependencies must be public and named.
3. **Honest.** Instructions must not ask the agent to invent evidence,
   fabricate citations, or misrepresent capability.
4. **Scoped.** One capability per skill. If a description needs "and also…"
   twice, it is two skills.
5. **Writable description.** The frontmatter `description` says when to use the
   skill and when *not* to, in the third person, without marketing language.
6. **Artifact-anchored.** The required `artifacts` frontmatter names concrete,
   verifiable deliverables — a downloaded PDF, a figure, a deck, a runnable
   package or a planning note with acceptance criteria. The description or
   Output contract explains the output and how to check it.

Every skill also belongs to exactly one of seven capability categories —
`acquire` · `analyze` · `compose` · `visualize` · `present` · `build` ·
`meta`. Categories are capability domains, not scenarios: a paper or a deck
is a *combination* of skills. Shared style (palette, typography) lives once
in
[`profiles/`](https://github.com/mappedinfo/metis/tree/main/profiles) and is
referenced with `uses:`. Each output keeps the profile for its audience and
format; a journal figure and a presentation deck can share palette and font
roles while retaining different type sizes and export defaults. Profile IDs
resolve in the current project root's `profiles/` directory.

Skills also carry two controlled tag axes in frontmatter — `domain`
(1–2 values, e.g. `writing`, `figure`, `data-analysis`) and `action`
(1–3 values, e.g. `create`, `review`, `transform`). The controlled vocabulary
lives in
[skill-contract.json](https://github.com/mappedinfo/metis/blob/main/skill-contract.json).
The authoritative admission criteria live in
[skills/README.md](https://github.com/mappedinfo/metis/blob/main/skills/README.md).

## Validation

Contributors run `npm run skills:check` from the repository root. The
repository adapter builds on the published `metis-atlas@0.1.0` scanner and
writes `.atlas/skills.json`, `.atlas/graph.json` and `.atlas/audit.json`.
It checks controlled vocabulary, nonempty `artifacts` declarations, and
`uses:` references to skills and profiles. It does not judge output quality
or establish that a task was completed.

`npm run skills:check -- --domain paper` exports a domain view after auditing
the full collection. Native `npx metis-atlas scan` in version 0.1.0 does not
provide these metis contract and profile dependency checks.

## Catalog

| Skill | Category | Domain | Description |
|---|---|---|---|
| `scansci-pdf` | acquire | literature | Academic paper acquisition via the scansci-pdf MCP server (17 tools): search, verify, cite, download (Apache-2.0, vendored with provenance) |
| `metis-router` | meta | workflow-meta | Composes skills for multi-stage tasks: one primary + ≤2 supports per phase, profiles for shared style, artifacts per phase |

Every skill is a bounded SOP: a `## When to stop` section names the
budget and termination criteria, `## Requirements` lists [B]/[A]-labeled
verifiable items, and unbounded-loop phrasing fails `skills:check`. See
[CONTRIBUTING.md](https://github.com/mappedinfo/metis/blob/main/CONTRIBUTING.md)
for the template.

## Contributing

Open a PR with **one skill per PR**. Expect review on admission criteria 1–6
above. See
[skills/README.md](https://github.com/mappedinfo/metis/blob/main/skills/README.md)
for the tag vocabulary and format details.
