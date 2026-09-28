# Contributing — writing metis skills

metis skills are **hand-written for the public system**. We do not port,
sanitize or adapt skills from private collections or vendor repositories —
every skill here is original work, written against the admission criteria in
[skills/README.md](skills/README.md). This keeps the collection clean of
provenance and licensing doubt by construction. Everything is MIT licensed
(see [LICENSE](LICENSE)).

## The seven categories

Every skill belongs to exactly one category. Categories are **capability
domains**, not artifact types or scenarios: a paper is not a category but a
*scenario* served by a combination of `compose` + `visualize` + `present`
skills tagged `domain: paper`. The category set is closed: propose a new one
only when a skill demonstrably fits none of these.

| Category | Scope |
|---|---|
| `acquire` | Fetching and retrieving literature, data and knowledge from public sources |
| `analyze` | Questions, methods, evidence, data analysis, experiment design and audit |
| `compose` | Writing: drafting, revision, expression, knowledge notes |
| `visualize` | Scientific figures, mechanism diagrams, flowcharts |
| `present` | Slides, talks, pages, videos, distribution |
| `build` | Local artifact builds, experiment platforms, tooling, releases |
| `meta` | Orchestration, quality, review and feedback across skills |

Shared style — palette, typography, export defaults — never lives inside a
skill. It lives once in [profiles/](profiles/) and skills reference it with
`uses: [profiles/<name>]`, so figures, decks and papers stay consistent by
construction.

## Authoring a skill

1. Copy the template below into `skills/<skill-name>/SKILL.md`.
2. Write the full craft — detail is the point. A skill that only says
   "write well" is not a skill.
3. Keep it generic: no personal identity, private paths, private tools.
   Closed-source tools may be mentioned but the core workflow must not
   depend on one.
4. Name the artifact. The description or the Output contract must state the
   concrete deliverable the skill produces — a downloaded PDF, a figure, a
   deck, a runnable package. A skill without a verifiable output does not
   earn a branch in the taxonomy (admission criterion 6).

```markdown
---
name: skill-name
description: >
  When to use this skill, trigger-first, third person. Name the artifact
  and the situation. Include two or three concrete trigger phrases a user
  would actually say.
license: MIT
category: compose         # one of: acquire analyze compose visualize
                          # present build meta
domain: [writing]         # 1-2 of the domain axis (see skills/README.md)
action: [create, revise]  # 1-3 of: create revise transform review advise
                          # orchestrate test retrieve analyze record
uses: []                  # profiles/<name> or other skills this skill
                          # depends on; atlas graphs these edges
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
