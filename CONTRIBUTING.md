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
only when a skill demonstrably fits none of these. The controlled category,
domain and action values are defined in [skill-contract.json](skill-contract.json).

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
`uses: [profiles/<name>]`. Each artifact keeps the profile appropriate to
its audience and export requirements; shared palette and font roles keep
related artifacts consistent.

## Authoring a skill

1. Copy the template below into `skills/<skill-name>/SKILL.md`.
2. Write the full craft — detail is the point. A skill that only says
   "write well" is not a skill.
3. Keep it generic: no personal identity, private paths, private tools.
   Closed-source tools may be mentioned but the core workflow must not
   depend on one.
4. Name the artifact. The required `artifacts` frontmatter lists concrete,
   verifiable deliverables, such as a downloaded PDF, a figure, a deck, a
   runnable package or a planning note with acceptance criteria. Explain
   the relevant output and how to check it in the description or Output
   contract (admission criterion 6).
5. Bound every loop. Each retry, review or repair cycle names its cap, and
   `## When to stop` says what happens when the budget is exhausted: report
   the completed items and the smallest unblock condition. Unbounded phrasing
   ("until satisfied", "改到满意") is rejected by `skills:check`.

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
uses: []                  # profiles/<name> or another skill's name
artifacts:
  - "Revised document with a record of substantive changes"
---

# Skill Name

## What it does

One paragraph: the capability, the input, the output.

## When to use / not use

Boundary against neighboring skills.

## Method

The actual craft: steps, decision gates, checklists, failure modes.
This section is why the skill exists — keep the detail.

## Requirements

- [B] R1 Blocking requirement that must hold for done — 验证: how the agent checks it.
- [A] R2 Advisory requirement that improves quality — 验证: how the agent checks it.

## When to stop

- The declared artifact exists and every [B] requirement above is evidenced.
- A named budget (rounds, retries, queue size) is exhausted: report the
  completed items and the smallest unblock condition.
- Unbounded language ("until satisfied", "改到满意") fails skills:check.

## Output contract

What the agent must produce, and how the user can verify it.
```

## The organizing loop (human writes, AI keeps the system honest)

From the repository root, run the collection check:

```bash
npm run skills:check

# Audit the collection and export the paper-domain view
npm run skills:check -- --domain paper
```

The repository adapter uses the published `metis-atlas@0.1.0` scanner and
adds the metis contract checks. It writes `.atlas/skills.json`,
`.atlas/graph.json` and `.atlas/audit.json`. The check validates controlled
vocabulary against `skill-contract.json`, nonempty `artifacts` declarations,
and `uses:` targets, including profile nodes and dependency edges. A domain
filter limits the exported view; the audit still checks the whole collection.

The native `npx metis-atlas scan` command in version 0.1.0 does not perform
these metis-specific declaration or profile dependency checks. Use the
repository entry above for contribution validation.

After a successful check, review category balance, overlapping descriptions,
and the actual skill outputs. Validation proves that declarations and
references follow the contract; it does not judge artifact quality or prove
that a workflow has succeeded.

Profile dependencies use logical IDs such as `profiles/journal`. Consumers
read the corresponding YAML file from the current project root's `profiles/`
directory, not relative to their installed skill directory. See
[profiles/README.md](profiles/README.md) for installation and the style contract.

`.atlas/` is gitignored; the report is a working instrument, not a deliverable.
