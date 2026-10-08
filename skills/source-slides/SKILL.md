---
name: source-slides
description: >
  Create presentations from supplied reports, several sources, progress evidence
  or teaching material, with audience-specific structure, speaker notes and
  inspected exports. Use for a multi-source talk, progress deck or custom slide
  presentation. Default to editable PPTX; preserve a requested Beamer source.
  Not literature acquisition, unsupported synthesis or the fixed single-paper
  Chinese group-meeting preset owned by taskbook-slides.
license: MIT
category: present
domain: [slides, writing]
action: [create, transform, revise]
uses: [profiles/deck]
artifacts:
  - "Editable PPTX, or requested Beamer source and compiled PDF, with speaker notes"
  - "Source-to-slide map, actual slide render checks and requirements ledger"
---

[中文主稿](SKILL.zh.md). Both versions maintain the same evidence, format
and acceptance requirements; language and slide count follow the request.

## What it does

Turn adequate supplied evidence into a presentation the audience can follow,
inspect or use for a decision. Deliver a real deck rather than only an outline.

## When to use / not use

Use for several sources, progress, teaching or a custom audience/format.
For the fixed one-paper Chinese 10–15-slide group-meeting request use
`taskbook-slides`. If the supplied sources still need substantive cross-paper
assessment, `literature-synthesis` owns that prerequisite. The presentation
stage does not broaden retrieval or invent conclusions to fill slides.

## Method

1. Resolve audience, purpose, duration or requested count, language, source
   coverage and format. Follow exact count requests; otherwise choose the
   smallest deck that carries the required argument and evidence. Preserve
   an existing template, slide dimensions, preamble and source configuration.
2. Map consequential claims, numbers and visuals to source locations. Separate
   observed progress, interpretation, proposed action and uncertainty. A useful
   factual explanation need not be forced into a recommendation or novelty claim.
3. Plan each slide's question, message, evidence and speaking role. Sequence
   context before unfamiliar mechanisms and evidence before conclusions;
   retain necessary definitions and examples. Use a comparison table only when
   shared attributes matter; do not turn every explanation into a table.
4. Read `<project-root>/profiles/deck.yaml` and apply its palette, font roles,
   dimensions, minimum type and export rules. A figure retains its own profile
   when embedded. Preserve declared local variants instead of overwriting them.
   Keep visible labels and source footers readable at presentation size.
5. Build an editable PPTX with an available authoring tool, or requested Beamer
   source and PDF. Keep text, tables and diagrams editable where feasible;
   preserve source data and image attribution. Write notes for every slide:
   intended explanation, transitions and source/uncertainty cues, rather than
   repeating the slide text. Read [backend and export guidance](references/backends.md)
   for format-specific production and final-file checks.
6. Render the actual delivered file and inspect every slide at full size.
   Check clipping, overlaps, wrapping, connectors, contrast and figure/table
   fidelity. Check notes separately. After a local repair recheck affected
   slides; master/font/layout changes require rechecking the whole deck.
7. Compare full content with accepted sources, request and source-to-slide map.
   Close the requirements ledger. If rendering is unavailable, deliver usable
   source with visual acceptance explicitly blocked; never call it verified.

## Requirements

- [B] R1 Deck matches audience, language, format and requested count/content — Verification: inspect the actual file and full slide sequence against the request.
- [B] R2 Claims, numbers and sourced assets are traceable — Verification: compare each consequential slide with the supplied source location.
- [B] R3 Shared profile is actually applied — Verification: inspect dimensions, colors and type roles in the final deck, preserving requested templates/variants.
- [B] R4 Every slide has usable notes and final-file visual inspection — Verification: read notes and inspect each rendered delivery slide; source properties alone are insufficient.
- [B] R5 Delivery and ledger are complete — Verification: editable source and requested exports exist, with all requirements evidenced or explicitly blocked.

## When to stop

One source/planning/production pass, at most one scoped repair pass and one
final content/visual check. Stop when the requested deck and applicable
requirements pass. At budget exhaustion report completed files, unfinished
checks and the smallest missing source, rendering capability or decision.
Slides generated successfully are not automatically accepted slides.

## Output contract

PPTX by default; Beamer `.tex` and compiled PDF when requested. Include notes,
source/slide mapping, regeneration assets and requirements ledger. Report real
render coverage and any material unresolved evidence. Examples are fictional;
see [cases](examples/cases.md) and [provenance](PROVENANCE.md).
