---
name: research-diagram
description: >
  Create, revise or inspect an editable research method, mechanism or pipeline diagram with explicit input/output and evidence-bearing arrows. Use for 研究流程图、方法框架图、mechanism diagram or technical roadmap. Delivers Mermaid plus SVG by default; draw.io on request. Not for numerical charts or decorative infographics.
license: MIT
category: visualize
domain: [figure, research-design]
action: [create, revise, review]
uses: [profiles/journal, profiles/deck]
artifacts:
  - "Editable diagram source and requested rendered SVG/PDF or draw.io"
  - "Node/edge meaning map with source and uncertainty boundaries"
  - "Recorded visual inspection and requirements ledger"
---

# research-diagram

[中文主稿](SKILL.zh.md). The Chinese guide is the authored source and this
entry is its synchronized English translation. Both carry the same workflow,
boundaries, requirements and budgets; the discovery filename grants no language
semantic priority. Sources and changes: [PROVENANCE.md](PROVENANCE.md).

## When to use

Use for method flow, mechanism, conceptual framework or project roadmap whose
arrows and stages carry meaning. Use `scientific-plot` or `table-chart` for
numerical graphs. A manuscript's scientific claim must already have supplied
support; drawing an arrow does not establish causality. Default production is
Mermaid source plus SVG. A request for advice or inspection may end with a
specific design/audit; a production request must produce actual editable source
and a rendered artifact, not just instructions to draw it.

## Method

1. Identify role, reader and target surface: sequential procedure, mechanism,
   conceptual relation or milestones. Extract the main message and supplied
   evidence. Separate operations, materials, measurements, hypotheses and
   accepted findings. For a mechanism, label an inferred relation as inferred;
   for a roadmap, distinguish proposed work from completed phases. Reuse supplied
   terminology and requested figure count.
2. Build a node/edge meaning map before layout. Each essential node names its
   object or operation and, when applicable, input, output and validation.
   Each edge has a type: order, data transfer, dependency, feedback, association
   or supported causal relation. Identify its evidence or logical basis. Do not
   turn nearby boxes into a causal chain. Unknown quantities stay unknown;
   use teaching placeholders only when a demonstration is requested.
3. Choose a reading path around the reader's task. Collapse implementation
   detail into meaningful stages only when dependencies survive. Branches,
   feedback and human correction need distinct paths and labels. Show one
   concrete input/output specimen when supplied and useful, rather than
   uninformative boxes named “data/model/result.” Keep notation definitions and
   detailed arguments in the caption or text instead of shrinking every label.
4. Read the selected project `profiles/<name>.yaml`: journal for manuscript
   figures, deck for slide figures, or an existing project variant. Profile
   palette, typography, size and caption placement are defaults overridden by
   accepted user/venue rules. They do not decide the research method. Save the
   chosen profile and overrides; absent profiles are a setup requirement, not
   permission to borrow personal styles or branded assets.
5. Produce source and render it. For Mermaid, save a `.mmd`, configure labels
   and the selected profile, and use an available Mermaid renderer to export
   SVG; see [production.zh.md](references/production.zh.md) or its English
   translation [production.md](references/production.md). For requested
   draw.io, create native text, shapes and connectors and verify that edits
   persist on reopening. Embedded illustrations are optional support; keep
   scientific labels and relationships editable. Image generation is optional,
   and access to a generator is not a prerequisite for an honest method diagram.
6. Inspect the actual export at intended use size. Follow every arrow against
   the meaning map; check reading order, label legibility, clipping, overlap,
   glyphs, legend and distinctions that rely on color. Check the appropriate
   caption location from the profile. Reopen the editable source and change a
   representative label or connector in a test copy when editability is a
   requested outcome. SVG is inspectable vector output; do not equate it with
   preservation of source-level diagram semantics.

Maintain one requirements ledger for the accepted task and R1–R6 below. Record
`done`, `blocked` or `n/a` with an inspected artifact/location or a scope reason;
`n/a` cannot waive a requested outcome. A plan does not prove execution.

## Requirements

- [B] R1 Role and scientific boundary are explicit — compare nodes/claims with
  supplied material; proposed and inferred relations remain labeled.
- [B] R2 Relationships carry correct meanings — trace each essential edge
  against its type, evidence and dependency in the node/edge map.
- [B] R3 Profile and labels match the surface — inspect the actual selected
  profile, overrides, glyphs, legend and caption placement.
- [B] R4 Requested production exists — open editable source and actual render;
  advice-only is n/a, but a production request cannot waive a missing render.
- [B] R5 Actual export is visually inspected — view at use size and record
  legibility, crossings, clipping, symbol and edge-meaning checks.
- [A] R6 A representative edit persists — perform on a test copy when native
  editing is requested; otherwise record why source editability suffices.

## When to stop

Perform one logic/layout pass, one export/visual inspection and at most one
focused repair with affected-output reinspection. A renderer startup failure
has one configuration retry. Deliver when requested production/advice and
applicable blocking checks pass. If rendering or required edit verification
remains unavailable, deliver available source as partial, keep the missing
requirement blocked and name the minimum renderer, font or access needed.

## Output contract

Deliver requested diagram source and actual exports, the compact node/edge
meaning map, selected profile/overrides, renderer/environment and visual check,
and requirements ledger. Use SVG alongside Mermaid by default; preserve the
requested draw.io or other supported format. Do not replace a requested editable
diagram with a single flattened full-canvas picture. Attribution and changes
are in [PROVENANCE.md](PROVENANCE.md).
