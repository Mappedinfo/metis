# Skills Catalog

The `skills/` directory holds public, generic agent skills. Each skill is a
directory with a `SKILL.md` (frontmatter: `name`, `description`) following
the [agentskills.io](https://agentskills.io) format.

Install them into your agents (Claude Code, Codex, Cursor, …) with:

```bash
npx skills add mappedinfo/metis
```

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

Skills also carry two controlled tag axes in frontmatter — `domain`
(1–2 values, e.g. `writing`, `figure`, `data-analysis`) and `action`
(1–3 values, e.g. `create`, `review`, `transform`) — so that
[skill-atlas](/atlas) can graph the collection and surface overlap before it
becomes duplication. The authoritative criteria live in
[skills/README.md](https://github.com/mappedinfo/metis/blob/main/skills/README.md).

## Catalog

| Skill | Domain | Action | Description |
|---|---|---|---|
| — | — | — | The first skills are being migrated into this catalog. Check back soon — or [contribute](#contributing). |

## Contributing

Open a PR with **one skill per PR**. Expect review on admission criteria 1–5
above. See
[skills/README.md](https://github.com/mappedinfo/metis/blob/main/skills/README.md)
for the tag vocabulary and format details.
