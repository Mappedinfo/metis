---
name: metis-router
description: >
  Routes a multi-stage task through the metis skill collection: picks one
  primary skill and at most two supporting skills per phase, wires shared
  style profiles through uses: references, and names verifiable outputs.
  Use when a request spans several capability domains (e.g.
  "find papers, make a figure, build slides"), when skills overlap and the
  right one is unclear, or when a deliverable must stay stylistically
  consistent across skills. Do not use for single-capability tasks — load
  the one matching skill directly instead.
license: MIT
category: meta
domain: [workflow-meta]
action: [orchestrate, advise]
uses: []
artifacts:
  - "Routing note naming phase owners, supports, profiles, outputs and capability gaps"
---

# metis-router

## What it does

Composes metis skills into one coherent job. Input: a task that crosses
capability domains. Output: a bounded execution plan — which skill leads,
which at-most-two skills support, which shared profiles apply, and what
artifact proves the task is done.

When the user asks for a plan or routing advice, deliver that note and stop.
Execute phases when the request includes doing the work, within the user's
authorized scope.

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

The skill owning the **earliest required stage that is not yet done** is the
primary. Check the available evidence for completion: having ten PDFs proves
acquisition, not analysis. "Make slides from these ten papers" starts at
`analyze` if their claims still need to be read and assessed; it can start at
`present` when an adequate source-grounded synthesis is already available.
"Study X and present it" starts at `acquire` when sources are still missing.

### 2. One primary, at most two supports — per phase

- Exactly **one primary** skill owns the current phase's artifact.
- At most **two supports** supply what the primary genuinely lacks (e.g. an
  `analyze` primary supported by an `acquire` retrieval and a
  `visualize` plot). A third support is a smell: split the phase.
- Re-classify at each phase boundary. A support in phase one may become the
  primary in phase two.

### 3. Wire style through profiles, not through skills

For each visual output, check its skill's `uses:` frontmatter and read
`profiles/<name>.yaml` from the current project root. These identifiers are
logical dependencies, not paths relative to the installed `SKILL.md`.
The project needs the profiles installed separately from the skills; the
`metis-os profiles install` command supplies them. See the public
[profile installation guide](https://github.com/mappedinfo/metis/blob/main/profiles/README.md)
for source-checkout and published CLI usage.

Keep the full profile that fits each artifact and audience: a submission
figure retains `profiles/journal`, while its presentation deck retains
`profiles/deck`. Coordinate shared palette and font roles across them;
preserve each profile's type sizes, dimensions, resolution and export
formats. Record any needed style variant as a named profile rather than
replacing all profiles with the one used by the last deliverable.

Install missing profiles within the task's authorized scope, preserving
existing project styles. If installation is unavailable or conflicts with
existing files, report the affected identifier and the unblock condition
before producing the dependent visual. If no existing profile fits,
identify the gap and propose a named profile within the task's scope.
Do not invent a palette inside a skill.

### 4. Anchor every phase to an artifact

Each phase ends with a verifiable artifact named in the skill's `artifacts`
frontmatter and output contract: downloaded PDFs, a table, a figure file, a
deck, a package, or a planning note with decisions and acceptance criteria.
Check the artifact against the requested outcome. A plan completes a
planning request; it does not establish that planned execution has happened.

### 5. Stop rules

Stop when the requested routing note is delivered for a planning-only task.
For an execution task, stop when: the final artifact exists and matches its
skill's output contract; a required capability has no skill in the collection (report the
gap by category and domain tag — that is a contribution candidate, not an
improvisation license); or the user narrows scope.

## Output contract

A routing note the user can check in one reading:

1. **Primary** skill and the phase it owns.
2. **Supports** (≤2) and the specific gap each fills.
3. **Profiles** per artifact, with shared roles and any named variants stated.
4. **Artifacts** expected per phase, in order.
5. **Gaps**: capabilities no skill covers, tagged by category + domain.

For an execution request, carry out the plan and verify each phase's named
artifact. For a planning request, the routing note is the final deliverable.
