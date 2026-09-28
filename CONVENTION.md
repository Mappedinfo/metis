# The USER.md Convention

**Version 0.1 · maintained by the metis project · status: public draft**

Agent instructions have a standard: `AGENTS.md` tells an agent *what to do* in a
project. Skills tell an agent *how to do* specific tasks. But nowhere in that stack
is a standard place to say *who the work is for*.

`USER.md` is that place. It is a short, human-authored Markdown file describing the
person the agent serves — their identity, goals, preferences and boundaries.
Everything else in the agent stack exists to serve it.

## The three layers

```
USER.md      — who you are        (personal, private, owned by you)
AGENTS.md    — the service contract (per project, committed, generic)
skills/      — what agents can do  (shared, public, reusable)
```

- **USER.md is the served object.** It is a *description of a person*, not a list of
  commands. It answers: who is this, what are they trying to do, how do they like
  work done, and what must never happen.
- **AGENTS.md is the service contract.** It holds project rules, safety boundaries
  and routing. It SHOULD declare that it serves the adjacent `USER.md`.
- **Skills are generic capability.** They must stay free of any one person's
  identity or preferences, so they can be shared publicly.

The point of the convention is the decoupling: **personal preference lives in one
file you own; generic knowledge lives in files everyone can share.**

## The file

- **Name**: `USER.md` (uppercase, like `AGENTS.md`).
- **Location**: project root, next to `AGENTS.md`. A user-global default MAY live
  at `~/USER.md`; a project-local `USER.md` overrides the global one, and nested
  directories MAY carry their own `USER.md` for sub-contexts, mirroring
  `AGENTS.md` nesting.
- **Format**: plain Markdown. Any valid Markdown is a valid `USER.md`.
  The sections below are recommended, not required. Write less, not more.

### Recommended sections

| Section | Question it answers | Example |
|---|---|---|
| `## Identity` | Who am I? | Name, role, field, working languages |
| `## Goals` | What am I trying to do? | Current projects, long-term aims |
| `## Preferences` | How do I like work done? | Reply language, depth vs speed, tools, style |
| `## Boundaries` | What must never happen? | Never publish X, never send messages, data red lines |

Keep it stable: `USER.md` is *who you are*, not *what is happening this week*.
Fast-changing state belongs in project docs, not here.

## How agents should treat it

Agents and tools that adopt this convention SHOULD:

1. Load `USER.md` next to the active `AGENTS.md` (and `~/USER.md` as fallback)
   at session start.
2. Treat it as the description of the served person — the reference point for taste,
   style, language and priorities.
3. On conflict between generic guidance (skills, defaults) and `USER.md`
   preferences, prefer `USER.md` — **within the safety and authorization limits
   of `AGENTS.md`**, which always win.
4. Never transmit `USER.md` content to third-party services without explicit
   authorization, and never copy it into public artifacts.

An `AGENTS.md` adopting the convention declares service with one line:

```markdown
This project serves the person described in [USER.md](USER.md); their stated
preferences take precedence over generic defaults, within the safety and
authorization rules below.
```

(`npx metis-os init` writes this line and a `USER.md` starter for you.)

## Privacy by design

`USER.md` is deliberately personal, and the convention is designed so it can stay
private:

- Add `USER.md` to `.gitignore` in public repositories. The convention works
  with a purely local file.
- One person, one file: keep a single canonical `USER.md` in a private location
  (for example a personal notes vault) and symlink it into each project root —
  `ln -s ~/notes/USER.md USER.md`. The ignore rule covers the symlink, edits to
  the canonical file are live in every project at once, and nothing personal
  ever enters a public git history.
- Public artifacts — skills, templates, AGENTS.md for open-source projects — must
  be authored to function *without* any particular `USER.md`, treating it as an
  optional overlay.
- Nothing in a public skill should ever assume, embed or leak a user's identity.

## What this convention is not

- Not a schema. No frontmatter, no required fields, no validation. It is a social
  contract in one Markdown file.
- Not a memory system. Agents may keep their own memories; `USER.md` is authored
  and owned by the human, full stop.
- Not project state. Plans, progress and task state belong in project files.

---

*Part of [metis](https://github.com/mappedinfo/metis) — skills serve the user.*
