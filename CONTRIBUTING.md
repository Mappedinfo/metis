# Contributing — writing metis skills

metis skills are **hand-written for the public system**. We do not port,
sanitize or adapt skills from private collections or vendor repositories —
every skill here is original work, written against the admission criteria in
[skills/README.md](skills/README.md). This keeps the collection clean of
provenance and licensing doubt by construction. Everything is MIT licensed
(see [LICENSE](LICENSE)).

## The six categories

Every skill belongs to exactly one category. The category set is closed:
propose a new one only when a skill demonstrably fits none of these.

| Category | Scope |
|---|---|
| `write` | General writing, revision, expression, knowledge notes |
| `research` | Questions, methods, evidence, experiment design and audit |
| `paper` | Academic writing, citation, peer review and response |
| `present` | Slides, talks, academic presentation |
| `figure` | Scientific figures, mechanism diagrams, flowcharts |
| `build` | Local artifact builds, experiment platforms, tooling |

## Authoring a skill

1. Copy the template below into `skills/<skill-name>/SKILL.md`.
2. Write the full craft — detail is the point. A skill that only says
   "write well" is not a skill.
3. Keep it generic: no personal identity, private paths, private tools.
   Closed-source tools may be mentioned but the core workflow must not
   depend on one.

```markdown
---
name: skill-name
description: >
  When to use this skill, trigger-first, third person. Name the artifact
  and the situation. Include two or three concrete trigger phrases a user
  would actually say.
license: MIT
category: write           # one of: write research paper present figure build
action: [create, revise]  # 1-3 of: create revise transform review advise
                          # orchestrate test retrieve analyze record
---

# Skill Name

## What it does

One paragraph: the capability, the input, the output.

## When to use / not use

Boundary against neighboring skills.

## Method

The actual craft: steps, decision gates, checklists, failure modes.
This section is why the skill exists — keep the detail.

## Output contract

What the agent must produce, and how the user can verify it.
```

## The organizing loop (human writes, AI keeps the system honest)

The taxonomy is maintained with the companion tool
[metis-atlas](https://www.npmjs.com/package/metis-atlas):

```bash
# from the repo root — scans every SKILL.md into a graph + report
npx metis-atlas scan skills/ --out .atlas
```

After adding or editing skills, run the scan and check:

- **Category balance** — `category` frontmatter distribution across
  `.atlas/skills.json`. No category should sprawl; split at ~25 skills.
- **Redundancy pairs** — `.atlas/graph.json` → `redundancy_pairs`.
  Two skills describing the same capability is a merge candidate.
- **Description collisions** — triggers that fire on the same phrases.

`.atlas/` is gitignored; the report is a working instrument, not a deliverable.
