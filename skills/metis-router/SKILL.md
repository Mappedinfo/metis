---
name: metis-router
description: >
  Routes work through metis: keeps one scenario owner for a writing delivery,
  chooses phase owners for distinct artifacts, and uses at most two supports
  per phase. Wires shared
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
uses: [research-task-spec, source-brief, concept-note]
artifacts:
  - "Routing note naming phase owners, supports, profiles, outputs and capability gaps"
  - "Completion note or, when needed, requirements ledger recording status and unresolved work"
---

[中文译本](SKILL.zh.md)

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

### 0. Keep the research task agreement explicit

For research work with consequential ambiguity, changing scope, or ongoing
acceptance tracking, use [research-task-spec](../research-task-spec/SKILL.md)
as the core agreement capability. Reuse an accepted agreement and update only
affected items; do not reopen settled choices or require a new approval round.
Its requirement → task → evidence mapping stays with the project across phases.
Use it as the phase primary when the agreement itself is the requested artifact,
or as a support only when the current specialist genuinely needs it.

`research-taskbook` remains an initial idea-to-taskbook option; `project-plan`
maintains a defined execution plan. A clear one-step task proceeds directly.
The agreement changes neither authorization nor the substantive research method.

### 1. Choose the delivery owner, then identify unresolved work

For one writing deliverable, choose a scenario owner that stays responsible:
`source-brief` for nonfiction from available material (a brief, long article or
selective technical history), `concept-note` for a concept note, or another
writing scenario with a complete delivery contract. The owner reuses
[shared writing judgment](../source-brief/references/writing-foundations.en.md)
and applicable review methods internally. Situation, organization, drafting and
review are not four scenarios taking turns owning the same article. An outline,
diagnosis or audit-only request selects that operation without adding full drafting.

For genuinely different artifacts, independent analyses or experiments, continue
using the resource lifecycle to identify prerequisites and phase owners:

```
acquire → analyze → compose / visualize / present → build
```

The **earliest required stage that is not yet done**, outside one writing
scenario, determines the current phase primary. Authorized source gathering for
one article keeps its prerequisites and evidence; reading a supporting method
does not transfer final article responsibility. Check completion evidence: having ten PDFs proves
acquisition, not analysis. "Make slides from these ten papers" starts at
`analyze` if their claims still need to be read and assessed; it can start at
`present` when an adequate source-grounded synthesis is already available.
"Study X and present it" starts at `acquire` when sources are still missing.

### 2. One primary, at most two supports — per phase

- Exactly **one primary** skill owns the current phase's artifact.
- At most **two supports** supply what the primary genuinely lacks (e.g. an
  `analyze` primary supported by an `acquire` retrieval and a
  `visualize` plot). A third support is a smell: split the phase.
- Re-classify at genuine cross-artifact phase boundaries. A support in phase one
  may become the primary in phase two; internal steps of one writing scenario
  keep their owner.

Shared situation, organization and prose-review modules are internal guidance,
not extra scenarios or support slots. Independent retrieval, specialist analysis,
experiments and figure production still count as capabilities; do not relabel
independent work as a module to evade the limit.

For numerical figures, select by the input and requested work: `table-chart`
owns prepared CSV charts within its renderer; `scientific-plot` owns arrays,
computed outputs, teaching demonstrations and custom panels. Unresolved
research inference stays in an analysis phase. A personal style needs an
applicable user/project requirement; Matplotlib or a project name alone does
not select it. A single plotting task can load its matching skill directly.

Select the next owner from the actual input: `data-preparation` resolves table units and transformations; `exploratory-analysis` diagnoses prepared data; `experiment-run` executes an explicit protocol; `run-review` audits its recorded artifacts. `taskbook-reproduce` prepares a reproduction rather than claiming a completed run. `taskbook-interpret` owns one paper, while `literature-synthesis` compares a fixed set. Adequate multi-source material goes to `source-slides`; a single-paper Chinese group-meeting deck goes to `taskbook-slides`. Method and mechanism diagrams go to `research-diagram`. Preserve effective user-named capabilities; if unavailable, identify the missing name instead of silently substituting another.

When delegating, carry the chosen skill entry, project profile, input/analysis
boundary, complete output requirements and relevant checks into the worker's
task. The worker reads the required guide before execution; the coordinator
inspects integrated exports. Naming a skill or receiving a successful worker
process does not establish guide loading or final artifact quality.

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

Choose checks by the concrete failure this change could cause. For ordinary reversible text/code edits, reuse Git and a relevant build or focused existing test; do not default to new snapshots, extra backups, hashes, fixtures, evidence bundles, full dry-runs/regression suites or acceptance matrices. Do not repeat passing checks when their inputs and relevant implementation have not changed, expand to untouched domains, or recursively prove the checks themselves. Deliver when the request and relevant checks are satisfied. Preserve explicitly required CI and report conflicts instead of silently skipping it. Irreversible deletion, unique-data migration, permissions/security and publication retain the authorization and protections relevant to those risks; research retains train/test separation, truthful metrics, appropriate controls and leakage prevention.

For frontend work, use installed tools to run the relevant build, type/syntax checks and necessary existing lightweight tests, then deliver. Leave interface inspection to the user; add browser/computer-use walkthroughs, click lists, screenshots or visual regression only when the user explicitly requests interaction or visual acceptance. Preserve existing features and tests, fix actual failures, and do not hide errors, add a large lint system or install unrelated heavy dependencies such as Torch just for checks. Briefly report the checks performed and mark interface acceptance as unperformed when it was not requested; passing code checks does not verify interaction, visuals or a live data path. An unrequested UI check does not block code delivery. Keep scientific, data-integrity, figure, slide and deployment requirements within their own scope.

For consequential multi-part, changing or cross-phase work, reuse the existing task entry or the bundled [requirements ledger](templates/requirements-ledger.md) for
the accepted task requirements and each active skill's Requirements items.
For a short clear task, a concise completion note is enough; do not create a separate ledger or fill in inapplicable workflow rows. Where a ledger is useful, keep stable IDs and update it during work; at close-out, each item has `done`, `blocked` or
`n/a` plus evidence or a reason. `done` requires the stated verification to
pass. `n/a` needs a scope-based reason and cannot waive a required user
outcome. In a planning-only request, assess the plan's requirements and
identify downstream execution as unperformed, not completed.

### 5. Parallel audit, scoped repair (map–freeze–reduce)

For requested audits with multiple independent dimensions over a corpus, manuscript or codebase, use the method below. A routine local repair proceeds directly with focused checks and does not require a map/freeze/re-review round:

1. **Map**: enumerate the independent check dimensions; run one bounded,
   read-only audit per dimension, in parallel when the agent runtime
   supports it. Each audit has its own round budget and returns findings
   only — no fixes.
2. **Freeze**: merge the findings into one deduplicated issue ledger. Each
   item carries a severity and a declared write scope. The frozen ledger is
   the only source of truth for the repair round.
3. **Reduce**: repair in parallel only tasks whose write scopes are
   disjoint; queue overlapping ones. Each repair task verifies only its own
   ledger items. Run at most one bounded re-review only when a concrete finding needs it, then stop:
   residual issues are reported, not chased.

The frozen ledger, not conversation momentum, decides what gets repaired.
Link its findings to the requirements ledger; the finding list does not
replace evidence that the accepted task requirements were met.

### 6. Independent production, before allocation

For heterogeneous batches or several independently verifiable outputs, read the
shared [parallel-production guide](references/parallel-production.md) before
allocating workers. Assess representative inputs, freeze the shared contract,
then define units, exclusive writes, observed resource limits, isolated failures
and stage-based incremental reruns. Retain the accepted scope and final coverage
checks. With no authorized spare agent capacity, keep the same units serial.

This conditional guide also serves a single-capability producer; reading it does
not require invoking this router or re-planning an accepted task. `project-plan`
references the same rules rather than maintaining another production policy.

When results must stay browsable during production, also apply the guide's
continuous-production contract, including for one long job. Establish a stable
reading path and incremental unit publication before waiting for full coverage;
keep ongoing producer edits outside the serving path. The original final scope
and acceptance remain required.

## Requirements

- [B] R1 One writing delivery has a continuing scenario owner; a cross-artifact
  phase primary follows its earliest unresolved work — Verification: the routing
  note names the owner, delivery boundary, outstanding prerequisites and evidence.
- [B] R2 At most two supports per agent and phase — Verification: the supports list
  has at most two entries, each with its gap.
- [B] R3 Profiles are kept per artifact and never merge audiences — Verification:
  each artifact names its own profile or explicitly none.
- [B] R4 Every phase is anchored to a declared artifact — Verification: the plan
  lists the expected artifacts in production order.
- [A] R5 Requested multi-dimensional audit-and-repair work follows map–freeze–reduce — Verification: the frozen
  issue ledger is named in the output.
- [B] R6 Stop rules and budget exhaustion are honored — Verification: the close-out
  states which stop condition fired and lists completed items, unfinished
  items and the smallest unblock condition when a budget is exhausted.
- [B] R7 Every accepted task and applicable skill requirement is accounted
  for — Verification: a concise result note or, when useful, the existing ledger
  accounts for the accepted requirements and relevant checks; unresolved required
  outcomes remain explicit. Do not add a ledger solely to satisfy this item.

- [B] R8 Applicable batch production has a checked allocation boundary —
  Verification: the unit table names independent outputs, shared contract,
  actual write/resource evidence, failure isolation and rerun scope before
  workers are allocated; final integration accounts for every accepted unit.
  Single or tightly coupled work records why a production split is inapplicable.

- [B] R9 Concurrent result review remains available — Verification: when the
  task requires it, execution checks continued access and incremental updates
  under the guide's failure/compatibility scenarios, using the frontend acceptance
  mode above for UI work. A planning-only
  note names those checks as unperformed; a task without concurrent browsing
  records a scope-based n/a rather than adding a workbench.

- [B] R10 Research task agreements stay traceable when applicable — Verification:
  consequential ambiguity, changes and acceptance use the existing agreement or
  research-task-spec; its requirements map to tasks and evidence across phases.
  Clear single-step work records scope-based n/a without adding planning.

## When to stop

- The routing note is delivered for a planning-only task; for an execution
  task, the final artifact exists and matches its skill's output contract.
  In either case, all applicable blocking requirements have passing
  evidence in the completion note or applicable existing ledger; do not add checks after that point without a concrete new failure risk.
- A required capability has no skill in the collection: report the gap by
  category and domain tag (a contribution candidate, not an improvisation
  license) and stop.
- A named budget (rounds, retries, queue size) is exhausted: report the
  completed items, unfinished items and the smallest unblock condition;
  leave unresolved required items blocked and do not claim full completion.
  Do not reopen completed phases.
- The user narrows scope, or evidence is genuinely ambiguous: ask a human
  with a bounded question rather than re-routing indefinitely.

## Output contract

A routing note the user can check in one reading:

1. **Primary** skill and its complete scenario delivery or cross-artifact phase;
   internal steps do not create new owners.
2. **Supports** (≤2) and the specific gap each fills.
3. **Profiles** per artifact, with shared roles and any named variants stated.
4. **Artifacts** expected per phase, in order.
5. **Gaps**: capabilities no skill covers, tagged by category + domain.
6. For multi-dimensional audits using map–freeze–reduce, the frozen issue ledger is a named
   deliverable, carried through to the close-out.
7. A concise completion note with actual checks and remaining gaps. Use an existing **requirements ledger** or the bundled template only when the task needs multi-part or cross-phase tracking; do not create one for routine work or enumerate inapplicable rows. Budget exhaustion names the actual remaining work and unblock condition.

8. For applicable batch production, the shared contract and unit table from the
   parallel-production guide, with allocation checks and unresolved units.
   Concurrent review also names the stable reading path, update mechanism and
   actual availability checks, keeping planned checks distinct from execution.

9. For applicable research work, the task-agreement entry and links to its
   requirement, change and acceptance records.

For an execution request, carry out the plan and verify each phase's named
artifact. For a planning request, the routing note and any applicable existing requirements
ledger are the final deliverables; downstream execution remains unperformed.
