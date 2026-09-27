<div align="center">

# metis

**Skills serve the user.**

An open agent-skill ecosystem built on the
[USER.md convention](CONVENTION.md): your identity and preferences live in one file
you own, agent instructions exist to serve it, and skills stay generic so anyone
can share them.

</div>

```
USER.md      — who you are          (personal, private, yours)
AGENTS.md    — the service contract  (per project, generic)
skills/      — what agents can do    (shared, public)
```

## Quick start

```bash
# Scaffold your USER.md and declare the service contract in AGENTS.md
npx metis-os init

# Install metis skills into your agents (Claude Code, Codex, Cursor, …)
npx skills add mappedinfo/metis
```

## What's here

| Path | What |
|---|---|
| [CONVENTION.md](CONVENTION.md) | The USER.md convention — the core idea, stable and small |
| [skills/](skills/) | Public, generic agent skills (admission criteria inside) |
| [packages/metis-os](packages/metis-os/) | `npx metis-os` — scaffolds USER.md + the AGENTS.md service clause |
| [docs/](docs/) | The website: <https://mappedinfo.github.io/metis/> |

## Companion tool

[skill-atlas](https://github.com/mappedinfo/skill-atlas) (`npx skill-atlas`) scans
any collection of skills and builds a graph of how they reference, route and depend
on each other — useful once your skill count grows past what fits in your head.

## Why "metis"?

Metis (Μῆτις) is the Greek personification of practical wisdom and craft — the
mother of Athena. Skills are exactly that: codified practical intelligence. And in
this ecosystem they exist to serve one person: you.

## License

MIT — see [LICENSE](LICENSE).
