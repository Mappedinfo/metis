---
name: metis-router
description: >
  Routes a multi-stage task through the metis skill collection: picks one
  primary skill and at most two supporting skills per phase, wires shared
  style profiles through uses: references, and stops when the artifact is
  delivered. Use when a request spans several capability domains (e.g.
  "find papers, make a figure, build slides"), when skills overlap and the
  right one is unclear, or when a deliverable must stay stylistically
  consistent across skills. Do not use for single-capability tasks — load
  the one matching skill directly instead.
license: MIT
category: meta
domain: [workflow-meta]
action: [orchestrate, advise]
uses: []
---

# metis-router

## What it does

Composes metis skills into one coherent job. Input: a task that crosses
capability domains. Output: a bounded execution plan — which skill leads,
which at-most-two skills support, which shared profiles apply, and what
artifact proves the task is done.

## When to use / not use

Use when the request names several stages or artifact types ("collect
sources on X, analyze the data, then make a deck"), when two skills claim
the same trigger and a choice must be justified, or when visual outputs from
different skills must look like one product.

Do **not** use when one skill obviously covers the request — routing a
single-capability task adds a layer without adding judgment. Do not use to
re-plan a task whose plan was already accepted.

## Method

### 1. Classify by the earliest unresolved stage

Map the request onto the resource lifecycle:

```
acquire → analyze → compose / visualize / present → build
```

The skill owning the **earliest stage that is not yet done** is the primary.
Everything downstream is support, not co-lead. "Make slides from these ten
papers" starts at `present` (papers already acquired); "study X and present
it" starts at `acquire`.

### 2. One primary, at most two supports — per phase

- Exactly **one primary** skill owns the current phase's artifact.
- At most **two supports** supply what the primary genuinely lacks (e.g. an
  `analyze` primary supported by an `acquire` retrieval and a
  `visualize` plot). A third support is a smell: split the phase.
- Re-classify at each phase boundary. A support in phase one may become the
  primary in phase two.

### 3. Wire style through profiles, not through skills

When more than one skill produces visual output in one job:

- Check each skill's `uses:` frontmatter for a shared `profiles/<name>`.
- If the skills reference different profiles, unify on the one matching the
  final audience (`profiles/journal` for submission figures,
  `profiles/deck` for projection) and state the substitution.
- If no profile applies, produce unstyled-but-consistent output and flag
  "profile gap" in the close-out — do not invent a palette inside a skill.

### 4. Anchor every phase to an artifact

Each phase ends with a verifiable artifact: downloaded PDFs, a table, a
figure file, a deck, a package. If a phase produces only prose plans, the
phase is not done — or the task is smaller than it looked.

### 5. Stop rules

Stop routing when: the final artifact exists and matches its skill's output
contract; a required capability has no skill in the collection (report the
gap by category and domain tag — that is a contribution candidate, not an
improvisation license); or the user narrows scope.

## Output contract

A routing note the user can check in one reading:

1. **Primary** skill and the phase it owns.
2. **Supports** (≤2) and the specific gap each fills.
3. **Profiles** in force, with any substitution stated.
4. **Artifacts** expected per phase, in order.
5. **Gaps**: capabilities no skill covers, tagged by category + domain.

Then execute the plan, handing each phase its named artifact.
