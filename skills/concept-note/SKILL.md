---
name: concept-note
description: >
  Create or revise a self-contained concept note from authorized sources: definition, concrete example, mechanism, alternatives and applicability. Use for 整理知识、概念页、explain this concept or repair a confusing technical note. Not for paper close reading, a field survey or a short source brief.
license: MIT
category: compose
domain: [knowledge, writing]
action: [create, revise, review]
uses: [source-brief, prose-audit]
artifacts:
  - "Concept note with definitions, worked example and applicability limits"
  - "Source map and dated verification boundaries"
  - "Requirements ledger and unresolved inputs"
---

# concept-note

[中文主稿](SKILL.zh.md). The Chinese guide is the authored source and this
entry is its synchronized English translation. Both carry the same workflow,
boundaries, requirements and budgets; the discovery filename grants no language
semantic priority. Sources and changes: [PROVENANCE.md](PROVENANCE.md).

## When to use

Use for a concept, method, metric, tool, dataset or standard that a reader needs
to understand or use. A supplied note may be revised directly; preparing a new
note may require authorized source gathering. Use `source-brief` for writing
from available material (a brief, long article or selective technical history),
`taskbook-interpret` for a paper's argument and
`literature-synthesis` for what multiple studies jointly support. This skill
writes a concept explanation; it does not infer the user's research direction
or edit a knowledge store's index without a request.

## Method

This scenario owns complete concept-note delivery; necessary source gathering,
organization, drafting and review do not automatically transfer ownership. Start
with [shared writing judgment](../source-brief/references/writing-foundations.en.md),
resolving situation and organization internally. Reusing this module does not
invoke a second writing scenario or require a planning document. Preserve a
definition-only, outline-only, audit-only or local-revision operation when requested.

1. Set the note's job: identify the object, the reader's current knowledge and
   the decision or task the explanation should support. Distinguish a concept
   from a product, an implementation and a historical version. Select the
   language, depth and destination from the request; preserve an existing note's
   useful structure and author wording when revising.
2. Build a source map before adding claims. Label each inspected source as
   primary text, official documentation, secondary explanation, abstract or
   metadata. Record the location and date/version for consequential claims.
   Source availability is different from inspected coverage. Check current
   behavior, prices or standards against current authoritative sources when
   those facts affect the note; report missing access rather than inventing it.
3. Begin with one ordinary-language definition and a concrete running example.
   Choose an example that exposes the reason for the concept, not just its
   formula. For a numeric concept, work through small values before formalizing;
   define every symbol next to the formula, including units and denominators.
   Explain what changes in the example when the inputs change. Mark invented
   numbers as teaching data. For a nonnumeric object, use a concrete event or
   task and show the mechanism in sequence.
4. Explain the mechanism and the boundary together. Separate what is measured,
   optimized, predicted and decided. A continuous objective need not improve a
   thresholded decision metric; a reported probability does not itself establish
   calibration. State the assumptions needed for the explanation and give one
   failure or counterexample that tests those assumptions. Do not attach an
   unrelated warning merely to fill a section.
5. When alternatives help readers judge applicability, compare them on one named axis. For a metric compare
   neighboring measures; for software compare available workflows; for a method
   compare assumptions and tradeoffs. Explain what people would do without this
   object and what cost or capability loss remains. Distinguish useful, necessary
   under stated conditions and optional. History, current development, upstream
   inputs and downstream uses belong only when they change understanding or use.
   If the request explicitly requires one of these dimensions, cover it or keep
   its missing source blocked rather than silently dropping it.
6. Audit the explanation with the running example: can a reader identify the
   object, follow the example, interpret the output and choose when to use it?
   Follow the source map for each consequential factual claim. Verify arithmetic,
   symbol definitions, scope and comparisons; a headings check cannot establish
   understanding. Use `prose-audit` only for a requested or necessary language
   revision, within this task's same review budget.

Maintain one requirements ledger for the accepted task and R1–R6 below. Record
`done`, `blocked` or `n/a` with an inspected artifact/location or a scope reason;
`n/a` cannot waive a requested outcome. A plan does not prove execution.

## Requirements

- [B] R1 The object and reader task are explicit — verify the definition names
  what the note explains and its intended use, without conflating nearby objects.
- [B] R2 The example makes the mechanism inspectable — verify intermediate
  steps, arithmetic or event sequence, symbols and teaching-data labels.
- [B] R3 Material factual claims are traceable — follow source-map locations;
  preserve evidence level, inspected coverage and relevant dates/versions.
- [B] R4 Assumptions and applicable alternatives are meaningful — test the stated
  boundary against the counterexample; when comparison is useful, use the declared axis.
- [B] R5 Requested dimensions and revisions are retained — compare the note
  with the accepted request; record absent required support as blocked.
- [A] R6 The note is useful without reopening every source — inspect local
  definitions, transitions and the application checklist from the reader's task.

## When to stop

Perform one content/evidence review and at most one focused repair followed by
rechecking affected claims. When the note and source map exist and applicable
blocking requirements pass, deliver. If source gathering is needed, use one
bounded batch for the unresolved claims; a new request may authorize further
work. At budget exhaustion, report completed parts, unfinished requirements and
the smallest missing source or decision. Keep unresolved required items blocked.

## Output contract

Deliver the requested note or complete revision, the source map with checked
locations and dates, and the requirements ledger. Include the requested depth
of example and limitations. A conversation-only explanation need not create
files; a requested saved note must name its actual path. Separate teaching
content from source-reported facts and leave unverified current facts open.
