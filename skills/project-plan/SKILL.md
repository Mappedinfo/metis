---
name: project-plan
description: >
  Create or maintain an executable project plan with dependencies, next actions, evidence and unblock conditions. Use for 整理待办、里程碑、ROADMAP cleanup or update an accepted plan. Not for reflective weekly review, choosing a research topic or silently executing downstream tasks.
license: MIT
category: meta
domain: [project-ops, workflow-meta]
action: [create, revise, review]
uses: [metis-router]
artifacts:
  - "Updated project plan with explicit states and dependencies"
  - "Evidence/change record for retained, completed or dropped items"
  - "Requirements ledger and unblock conditions"
---

# project-plan

[中文主稿](SKILL.zh.md). The Chinese guide is the authored source and this
entry is its synchronized English translation. Both carry the same workflow,
boundaries, requirements and budgets; the discovery filename grants no language
semantic priority. Sources and changes: [PROVENANCE.md](PROVENANCE.md).

## When to use

Use to create a plan from a clear goal or make an existing accepted plan
executable. Use `review-advance` when progress causes, lessons and a new direction
need reflection; `research-question` when the research question itself is
unsettled; `research-taskbook` for AI task decomposition requiring its detailed
input/output contracts. Plan maintenance may use verified review conclusions;
it does not authorize implementing every listed task, deleting history or
changing accepted research decisions.

## Method

1. Identify the goal and authoritative state surface from the request/project.
   Inspect its accepted milestones, constraints, protected regions and evidence
   links. Reuse the existing plan or issue convention; do not create competing
   trackers or rewrite README into a universal format. Follow an explicit
   request to draft only without changing persistent project state.
2. Reconcile every original requirement with actual evidence. Separate proposed,
   started, blocked, completed and dropped work. A launch message or existing
   file is not completion evidence; find the accepted check. Preserve quantities,
   scope and compatible corrections. If the current record conflicts with a
   verified source, explain the conflict and proposed correction rather than
   silently treating the latest text as authority.
3. Make active work executable. Each next action needs a concrete verb, input,
   expected deliverable/check and dependency; use owner/date only when known.
   A blocked item names the external dependency and minimum unblock condition.
   A completed item names its verified result; a dropped item retains its reason
   and reopening condition when useful. Use existing state names, or
   `[plan]`, `[doing]`, `[blocked]`, `[done]`, `[drop]` when no convention exists.
4. Order by unresolved dependencies, not by visual neatness. Separate prerequisite
   work from independent tasks, identify the critical next decision and size
   concurrent work to actual capacity. Do not invent deadlines or enforce one
   universal work-in-progress count. Planned steps depending on unknown results
   remain conditional; detail the immediate inspectable step and leave later
   choices as conditional milestones rather than fabricate a full execution path.
   For heterogeneous batches or independent production outputs, use the shared
   [parallel-production guide](../metis-router/references/parallel-production.md)
   to define the contract, unit boundaries, capacity evidence and recovery in
   the plan. This conditional reference does not invoke the router, allocate
   agents or authorize execution; keep production rules in that guide.
5. Compact without losing accepted work. Merge duplicates while retaining their
   source IDs; move reusable procedures into an existing reference if authorized.
   Keep evidence links for done/dropped work, and preserve protected notes and
   original sources. A short plan should let the reader identify current state,
   next action and unblock conditions. Shortening cannot delete required coverage.
6. Check the edited state surface against the starting requirements and actual
   evidence. Trace dependency links, verify that “done” has its accepted check,
   and ensure proposed work remains unexecuted. If execution is separately
   authorized, link its actual outcome without guessing from an earlier plan.
   Report the material state changes; routine formatting needs no new decision.

Maintain one requirements ledger for the accepted task and R1–R6. Record
`done`, `blocked` or `n/a` with checked evidence or a scope reason. Plans and
recommendations do not establish that downstream actions occurred.

## Requirements

- [B] R1 The accepted goal and requirements survive — reconcile original items,
  quantities and compatible corrections with the final plan.
- [B] R2 States match actual evidence — check completed outputs and keep starts,
  blocked work, plans and dropped items distinct.
- [B] R3 Active items have next actions and dependencies — inspect deliverable,
  check and minimum unblock condition; unknown owners/dates stay unknown.
- [B] R4 The authoritative surface and protected content are preserved — inspect
  changes for competing trackers, lost evidence and unrelated edits.
- [B] R5 Maintenance does not imply execution or new permission — compare actual
  actions and reported outcomes with accepted scope.
- [A] R6 The next decision is easy to find — inspect task order and current
  capacity; keep later conditional milestones from obscuring the next step.

## When to stop

Use one state/evidence reconciliation pass and at most one focused repair with
an affected-item recheck. Deliver when the requested plan/diff and applicable
blocking checks pass. At the cap, report maintained items, unresolved states and
the minimum evidence or decision needed. Unknown completion remains blocked;
writing a plan is not completing its future tasks.

## Output contract

Deliver the requested plan or update at its existing authoritative destination,
a concise material change/evidence record and requirements ledger. For draft-only
requests, deliver the draft without tracker edits. Preserve source identifiers,
dependencies and unblock conditions; distinguish committed/saved/planned/executed
state only when those actions actually occurred.
