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
workflows/   — when steps run        (shared rules, runtime adapters)
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
| [workflows/](workflows/) | Bounded writing workflow with Codex and DSH hook adapters |
| [packages/metis-os](packages/metis-os/) | `npx metis-os` — scaffolds USER.md + the AGENTS.md service clause |
| [docs/](docs/) | The website: <https://mappedinfo.github.io/metis/> |

Start with [基础能力 / Minimal skills](docs/minimal-skills.md) for a concrete
input, deliverable and acceptance check in each category. Category coverage
does not establish that every workflow has passed an end-to-end task.

Each skill has one discovery entry (`SKILL.md`) and a Chinese companion
(`SKILL.zh.md`); the [catalog](docs/skills.md#catalog) links both.
`prose-audit` has separately authored English and Chinese processing guides
with shared review requirements. Other skills retain their declared
language conventions. See the
[language maintenance policy](CONTRIBUTING.md#skill-languages).

For prepared tables, [table-chart](skills/table-chart/SKILL.md) recommends and
renders seven chart forms with single-panel or faceted layouts and shared
color, grayscale and NPG-inspired profiles.

For retrospectives, [review-advance](skills/review-advance/SKILL.md) turns
existing objectives and evidence into a review, an authorized next action
and a verifiable plan. Personal defaults and learning stores belong to the
caller; the public workflow also works without them.

For an existing draft, [prose-audit](skills/prose-audit/SKILL.md) reviews
Chinese and English jargon, repetitive phrasing and unsupported emphasis,
using the writing conventions of each language. It offers
contextual findings or a minimal revision, with an optional local candidate
scanner. Its findings assess expression, not who wrote the text.

The optional [writing workflow](workflows/README.md) connects this review to
writing requests: inject the skill → draft → review → at most one revision →
verify → deliver. Project opt-in hooks and private, content-bound records handle
activation and missed checks. Skills remain usable on their own. See
[the integration guide](docs/workflows.md) for setup and runtime limitations.

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
