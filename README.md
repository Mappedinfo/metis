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

# Already have a canonical USER.md? Link it instead of writing a new one
npx metis-os init --link ~/notes/USER.md

# Install metis skills into your agents (Claude Code, Codex, Cursor, …)
npx skills add mappedinfo/metis

```

Shared profile installation and the symlink safety fix are in the **0.3.0 source
version, not yet published to npm**. To use them now:

```bash
# In this metis checkout
npm ci
npm run profiles:bundle

# In the project that will consume the styles; substitute the checkout path
cd /path/to/your-project
node /path/to/metis/packages/metis-os/bin/metis-os.js profiles install
```

Use the same absolute CLI path for `init` to use the corrected source version.
Release readiness and the currently published version are tracked in the
[project handoff](HANDOFF.md); maintainers should read it before continuing work.

## What's here

| Path | What |
|---|---|
| [CONVENTION.md](CONVENTION.md) | The USER.md convention — the core idea, stable and small |
| [skills/](skills/) | Public, generic agent skills (admission criteria inside) |
| [profiles/](profiles/) | Canonical shared style profiles, bundled by metis-os |
| [packages/metis-os](packages/metis-os/) | `npx metis-os` — scaffolds USER.md + the AGENTS.md service clause |
| [docs/](docs/) | The website: <https://mappedinfo.github.io/metis/> |

## Companion tool

[metis-atlas](https://www.npmjs.com/package/metis-atlas) (`npx metis-atlas`) scans
any collection of skills and builds a graph of how they reference, route and depend
on each other — useful once your skill count grows past what fits in your head.
Run `npm run skills:check` in this repository for explicit `uses:` dependencies,
profile nodes, controlled tags and required artifact declarations. This adapter
adds the metis contract checks that the pinned Atlas 0.1.0 CLI does not provide.

## Why "metis"?

Metis (Μῆτις) is the Greek personification of practical wisdom and craft — the
mother of Athena. Skills are exactly that: codified practical intelligence. And in
this ecosystem they exist to serve one person: you.

## License

MIT — see [LICENSE](LICENSE).
