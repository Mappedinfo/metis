---
name: research-task-spec
description: >
  Creates and maintains a research task agreement that resolves consequential
  ambiguity and links scope, priorities, changes, tasks and acceptance evidence.
  Use for "clarify this assignment", "make these requirements verifiable",
  "track research priorities and quality", or a mid-task change. Covers geography,
  urban science, GeoAI, computer science and related research. Clear single-step
  work proceeds directly without a new planning layer.
license: MIT
category: meta
domain: [research-design, workflow-meta]
action: [orchestrate, record, review]
uses: []
artifacts:
  - "Task agreement or updated project section linking sourced requirements, tasks and acceptance methods"
  - "Change and acceptance record with evidence, unresolved conditions and a requirements ledger"
---

[中文译本](SKILL.zh.md). The companions share the method, R1–R7, check budgets
and delivery requirements; `SKILL.md` is the sole discovery entry.

# Research Task Specification

Turn an informal assignment into an agreement an executor and an evaluator
can both use. The architectural brief analogy supplies requirement expression,
feedback and outcome checking, addressing different interpretations, missed
priorities and late acceptance surprises.

## When to use / not use

Use to establish or resume a research task agreement, handle a scope change,
or assess work against its accepted agreement. Clear single-step work proceeds
directly. `research-taskbook` can own initial decomposition of an unclear idea;
`project-plan` owns maintenance of an already defined plan. This skill owns the
agreement and acceptance; the research question and relevant capabilities own
the domain methods.

## Method

### Select this turn's work

- **Initial alignment:** build an agreement from the supplied, authorized
  material, then advance work the user has authorized.
- **Execution or continuation:** read the existing project task entry and
  update changed requirements, progress and evidence.
- **Acceptance:** check artifacts against the accepted agreement and report
  itemized results and actual gaps.

Reuse the relevant sections of a taskbook, plan or handoff. When durable tracking
is needed and no suitable entry exists, create one `TASK.md` using the
[adaptable template](references/task-template.md). A short task can align in the
reply without a file. Keep requirements, progress, changes and acceptance in
one entry; link detailed logs and results rather than creating parallel ledgers.

Deliver a taskbook when that is the request. When execution is requested,
continue authorized work. An agreement itself grants no experiment, resource
or external-action permission.

### Recover the assignment and resolve ambiguity

Identify the goal, object, artifacts, coverage, priorities, time and resource
constraints, and who or what determines acceptance. Preserve accepted counts,
scope and current revisions. Label source facts, user requirements, AI proposals
and provisional assumptions separately.

For a consequential difference in meaning, record **original wording → plausible
interpretations → execution or acceptance consequences**. Check referents,
spatial and temporal scope, deliverable form, quality, conflicting priorities
and resource boundaries. Vague-word matching alone is insufficient.

- Resolve from authorized sources when possible, with a source locator.
- State and proceed with routine, reversible choices that preserve the goal.
- Ask the necessary bundled questions when a gap changes a scientific
  conclusion, required coverage, acceptance, cost ceiling or authorization.
  Hold only dependent work and continue independent authorized work. Silence
  leaves the item unresolved.

Use a concise restatement or representative artifact to check understanding.
For example, unpack “reliable analysis” into data definitions, comparison
conditions and evidence. Proceed when material is sufficient. A sample aligns
understanding; it does not replace the full accepted coverage.

### Express verifiable clauses

Give requirements stable IDs `R1…`, with sources and acceptance state. Each
states **action and object, deliverable, constraints and acceptance method**.
Distinguish required outcomes, preferences and optional proposals. Do not
promote a proposal into a requirement during acceptance.

Acceptance may use a number, functional case, checklist, reference example or
human review with explicit judgment dimensions. Numbers retain units,
denominators, baselines and the basis for tolerances. Unpack “better”,
“reasonable” or “innovative”; do not fill their thresholds arbitrarily.

Exploration can succeed by completing coverage, reporting supporting and
opposing evidence and explaining what remains unanswered. Assess **completed
research work** separately from **supported hypotheses**; a negative result can
satisfy the former. Record unsettled thresholds as proposed or unresolved;
an authorized pilot may estimate them. Do not lower standards after seeing
results.

Create `C1…` claim records only when scientific claims are involved: scope,
comparison or competing explanation, supporting evidence, a result that would
weaken or refute the claim, and current status. The accepted scope determines
the count. Pending claims remain pending. Qualitative and theoretical work can
use counterexamples, argument premises or derivation checks as appropriate.

### Track priorities and execution

Link each required outcome to tasks `T1…`, recording inputs, outputs,
dependencies, acceptance and executor. Elaborate steps according to real
dependencies. Prioritize unknowns that could invalidate subsequent work while
retaining the rest of the accepted scope. Exploratory branches state their
purpose and ending condition.

Update states from evidence: `plan` is pending; `doing` is active; `done` has
passed its acceptance; `blocked` lacks a named condition; `drop` has a justified
cancellation. State the smallest unblock condition. Dropping a required outcome
requires a corresponding user revision. Pending verification, deferral and
partial artifacts do not mean completion.

Append concise records only for consequential decisions, experiments, failed
paths, pivots or requirement changes: time, change, basis, proposer, acceptance
state, affected `R/T/C` and next action. Use current and project-authorized
material, not automatic historical-chat or repository-wide scans. Routine AI
choices within authorization can be recorded without individual approval.

When scope, data, protocol or standards change, retain a locator for the old
version, update affected tasks and checks, mark invalidated evidence for
reverification and preserve still-valid results. Status edits and deleted
clauses cannot manufacture completion.

### Collect proportionate quality evidence

Check **requirement → task → artifact → acceptance result** coverage. Locate
evidence in files and relevant tables, figures, fields, tests or run records.
Important results identify input versions, calculations, relevant environment
and actual check scope. Use hashes when file identity matters; existence and
matching hashes prove only their respective facts.

Separate artifact completeness and usability, adequacy of the method and
comparison, and support for scientific claims. Running code, consistent
recomputation and statistical significance cannot individually establish the
latter two. Arrange reruns around randomness, cost and numerical tolerances;
do not require byte-identical results from every method.

Choose checks from the data and question. Read only matching sections of the
[four fictional domain demonstrations](references/domain-demos.md). Spatial
checks, permutation tests, negative controls, significance thresholds and a
particular model are conditional. Missing evidence blocks its dependent
completion or conclusion claim, while independent authorized work can proceed.

### Accept and hand off

Report each required outcome as **pass / fail / unverified**, with evidence and
scope. Explain genuinely inapplicable checks without using them to waive a
required outcome. Assistant verification is distinct from acceptance by the
user or an external reviewer.

Claim task completion only when every required outcome passes. Also state
unsupported hypotheses and conclusion boundaries. Otherwise identify completed
work, dependent gaps and the smallest next action. Update the same entry and
deliver; ambiguity handling adds no indefinite review or mandatory approval
rounds.

## Requirements

- [B] R1 Preserve accepted scope, counts and sources; distinguish requirements,
  facts, proposals and assumptions — Verification: compare the current request
  and prior agreement item by item.
- [B] R2 Resolve consequential ambiguity on a stated basis; block only dependent
  work for critical gaps — Verification: record adopted interpretations, open
  questions, affected tasks and unblock conditions.
- [B] R3 Trace required outcomes to tasks, artifacts and acceptance methods;
  thresholds have a basis or remain unresolved — Verification: check coverage;
  planning-only work checks the plan itself.
- [B] R4 Preserve still-valid requirements and old-version locators during
  change; state edits cannot create completion — Verification: changes identify
  affected and retained items and evidence needing reverification.
- [B] R5 Bound acceptance to evidence; distinguish completed research work,
  supported hypotheses and external acceptance — Verification: itemized results
  carry evidence or gap reasons; unsupported hypotheses remain unsupported.
- [B] R6 Account for accepted task requirements and applicable skill requirements
  as `done`, `blocked` or `n/a`, with evidence or a reason — Verification: the
  same entry or existing ledger covers required items; `n/a` waives no required
  user outcome.
- [A] R7 Keep useful priorities, dependencies and consequential events in an
  existing entry — Verification: short tasks do not acquire unnecessary files
  and no duplicate state ledgers are created.

## When to stop

- Deliver the agreement, change or acceptance artifact for this turn's mode
  once applicable [B] requirements have passing evidence. A taskbook-only
  request checks the taskbook and leaves downstream research unperformed;
  execution requests retain the full accepted scope.
- Per invocation, perform one agreement check and one acceptance pass, with at
  most one targeted correction and recheck of affected items for observed
  defects. Honor a user's existing check budget instead. This bounds agreement
  review, not the scale of authorized research or its domain run budget.
- On missing critical inputs, permission or exhausted budget, deliver completed
  items, unfinished items and the smallest unblock condition. Required gaps
  remain `blocked`. Continue independent authorized work and do not reopen
  completed phases.

## Output contract

1. One task agreement or updated existing project section: goal and scope,
   sourced requirements, ambiguity disposition, dependencies and priorities.
   Short tasks may deliver this in the reply.
2. This turn's change and acceptance record: itemized results, actual evidence
   and scope, rechecks, claim states and external acceptance state, in the same
   entry.
3. A ledger for accepted task requirements and applicable R1–R7: `done` /
   `blocked` / `n/a`, evidence or reason, stop condition and the smallest next
   step for unfinished work. These fields require no separate file.

## Provenance

Rewritten for metis from an owner-authorized task-brief workflow, using the
architectural brief analogy for requirements, feedback and outcome checking.
Domain examples are fictional. Unverified external assertions and architectural
technical values are not adopted as industry standards. Personal creation and
extraction records remain with the caller, outside the public skill.
