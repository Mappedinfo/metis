---
name: source-brief
description: >
  Drafts or revises source-grounded nonfiction from available material: a
  brief, explanation, tutorial, long article or selective technical history,
  with traceable key claims. Fits sources to the audience and requested genre.
  Does not independently retrieve sources, invent personal experience, compose fiction,
  choose a research direction, or write
  a full academic paper.
license: MIT
category: compose
domain: [writing, knowledge]
action: [create, revise]
uses: [prose-audit]
artifacts:
  - "brief.md or requested article — complete nonfiction or revision in the requested language and format"
  - "Source map, gaps and acceptance checks in source-map.md or existing working records"
---

# Source-grounded writing

[中文译本](SKILL.zh.md)

Turns supplied notes, excerpts or an existing draft into nonfiction a named
audience can use. It selects and explains the relevant material; it does
not establish facts beyond those sources. It needs no private service or
special writing tool.

## When to use / not use

Use when the materials are available and the requested deliverable is a
progress update, explanation, tutorial, summary, source-grounded history or
revision. The name `source-brief` and existing brief usage remain compatible;
requested length and genre can also call for a long article. Follow the user's language,
audience, purpose, length and format. Infer routine choices from context;
ask only when an unresolved choice would materially change the content.

Use `concept-note` for a systematic concept explanation; this scenario turns
available material into an article. If retrieval, original analysis or a full
paper is needed first, identify that dependency. An authorized retrieval
capability may supply material; this scenario does not thereby own independent
research or original analysis. An article can still cover the supported part when
useful, with missing evidence stated explicitly. Do not treat supplied text
as permission to browse, publish or send the brief.

## Method

This scenario owns the accepted writing task through complete delivery. Start
with [shared writing judgment](references/writing-foundations.en.md), handling
situation, evidence and organization internally rather than handing the same
draft between step owners. Read the [genre-fit guide](references/genre-fit.md)
when choosing form. An outline, diagnosis or local revision stays within that scope.

1. **Set the article's job.** Identify what this audience needs to understand
   or decide, and retain accepted constraints in existing working records.
   Read the relevant supplied materials. Give each source a stable label
   and a usable location: filename plus heading, page, paragraph or line.
2. **Select the evidence.** Distinguish reported observations, an author's
   opinion, proposed work and missing information. Preserve numbers, units,
   denominators, dates and uncertainty when they affect interpretation.
   Keep failed, blocked and unperformed work distinct. When sources conflict,
   describe the disagreement or use a user-designated authority; a newer
   date alone does not resolve a factual conflict.
3. **Write one draft.** Use the narrative resolved through the shared module
   to produce the complete requested article. Preserve purposeful source voice;
   record substantive changes in working material, outside reader-facing prose.
4. **Audit evidence and fit once.** Map each key verifiable claim to its
   source location in `source-map.md` or existing working records. A citation on every sentence is not
   required; the reader must be able to locate the evidence for material
   claims. Attribute opinions, label proposed actions, and remove or qualify
   unsupported claims. Check the requested language, audience, length and
   format. For a stated length limit, record the counting convention and
   measured result in the ledger.
5. **Repair only identified defects.** Use at most one repair round,
   followed by a check of the affected claims and constraints. Update the
   ledger with the observed result rather than declaring success from file
   existence. Do not keep polishing after the blocking checks pass.

When input is incomplete, write only the supported portion and list the
missing material in the source map. If a required outcome depends on that
material, label the brief partial and keep that requirement blocked. Do not
fill gaps with plausible names, numbers, comparisons or research conclusions.

Content, evidence and expression share one integrated review. Reuse `prose-audit`
when language treatment is needed, within the same review and revision budget.
The scenario owner checks the final full text; a language review cannot supply
missing substantive evidence.

## Requirements

- [B] R1 The article fits the accepted purpose, audience, language, length and
  format — verify: compare the delivered text with those recorded constraints.
- [B] R2 Key verifiable claims have available, authorized-source support, with material
  numbers, dates and uncertainty preserved — verify: follow each source-map
  location and compare it with the corresponding claim in the article.
- [B] R3 Opinions, proposals, conflicts and missing evidence retain their
  status — verify: inspect each such item used in the brief; unsupported
  required content is marked blocked rather than invented.
- [B] R4 Every accepted task requirement and R1–R5 has a status and evidence
  or a reason — verify: read the acceptance ledger; `done` requires a passed
  check, and `n/a` applies only outside the accepted scope.
- [A] R5 Revisions disclose substantive changes — verify: the source map
  lists changed claims, omissions or emphasis; mark `n/a` for a new brief.

## When to stop

- Deliver after the requested article and source working records exist and all applicable blocking
  requirements have passed. State the stop condition in the ledger.
- After the initial draft and audit, spend no more than one repair round.
  If required checks still fail, deliver the usable partial result and report
  completed items, unfinished items and the smallest missing input or
  capability. Budget exhaustion does not make blocked requirements done.
- If no usable source material is available, stop with the missing-input
  record; do not manufacture a brief or claim completion.

## Output contract

1. `brief.md`, or the user's requested filename and format. Keep drafting
   notes and the acceptance process out of the reader-facing text; retain
   limitations needed to interpret the actual subject.
2. A compact claim/source-location map, material gaps or conflicts, and
   substantive revision changes in `source-map.md` or existing working records.
   Chat-only or result-only delivery does not require extra user documents for
   internal judgment.
3. An acceptance ledger in the same working record: requirement ID, `done` / `blocked`
   / `n/a`, and evidence or reason. Include the stop condition and remaining
   work. This can be one small table; no separate tracking system is needed.

For a practice run, use [the example request](examples/request.md) and
[its source notes](examples/source-notes.md). Both describe fictional data.
