# Getting Started

metis is an open agent-skill ecosystem built on one small idea, the
[USER.md convention](/convention):

```
USER.md      — who you are          (personal, private, yours)
AGENTS.md    — the service contract  (per project, generic)
skills/      — what agents can do    (shared, public)
```

## Quick start

In any project where you work with an AI agent:

```bash
# 1. Scaffold USER.md and declare the service contract in AGENTS.md
npx metis-os init

# 2. Install the public metis skills into your agents
#    (Claude Code, Codex, Cursor, …)
npx skills add mappedinfo/metis
```

`metis-os init` is idempotent: it never overwrites an existing `USER.md`
(without `--force`) and never duplicates the managed service clause in
`AGENTS.md`. See the [CLI reference](/cli) for details.

## Concepts

### USER.md — the served object

A short, human-authored Markdown file describing the person the agent serves:
identity, goals, preferences and boundaries. It is *a description of a person*,
not a list of commands. Keep it private — add it to `.gitignore` in public
repositories. A user-global default may live at `~/USER.md`; a project-local
`USER.md` overrides it.

### AGENTS.md — the service contract

Your existing project instructions. The convention adds one declaration:

```markdown
This project serves the person described in [USER.md](USER.md); their stated
preferences take precedence over generic defaults, within the safety and
authorization rules below.
```

`npx metis-os init` writes this line inside a managed block for you.

### skills/ — generic capability

Skills encode reusable craft. They must stay free of any one person's identity
or preferences so they can be shared publicly. Personal overlays belong in
`USER.md`, never in a skill. See the [skills catalog](/skills) for the
admission criteria.

## The point

**Personal preference lives in one file you own; generic knowledge lives in
files everyone can share.** That decoupling is the whole convention — read
[the convention](/convention) for the full statement.
