---
name: taskbook-slides
description: >
  Turn one paper PDF into Chinese slides for a group meeting: 10–15 slides,
  speaker notes on every slide, and the sequence title, research question,
  methods, key results, limitations, summary and discussion questions. Use
  when a user provides a paper PDF and asks to make a PPT, turn it into
  slides, prepare a presentation, or present it at a group meeting. Keep
  all content faithful to the paper; never invent results. Not for custom
  English slides or close-reading notes (use taskbook-interpret).
license: MIT
category: present
domain: [slides, paper]
action: [transform, create]
uses: [scansci-pdf]
artifacts:
  - "汇报.pptx — 10–15 Chinese group-meeting slides with speaker notes on every slide"
---

[中文译本](SKILL.zh.md)

# Paper → PPT (taskbook family)

Turn the attached paper PDF or the PDF at the specified path into a Chinese
presentation, `汇报.pptx`. For a large PDF or scanned document, first use
`scansci-pdf` to extract the text and figure/table locations.

## When to use

- The user provides a paper PDF and asks to make a PPT, turn it into slides,
  prepare a presentation, or present it at a group meeting.

Do not use for custom English slides (this skill uses a fixed Chinese
group-meeting style) or close-reading notes (use `taskbook-interpret`).

## Method

1. **Read the entire paper PDF** and identify its research question, methods,
   key results with their original figures/tables, and limitations.
2. **Generate `汇报.pptx`**: 10–15 slides in Chinese with speaker notes on
   every slide. Prefer generation tools such as the `pptx` skill or
   `python-pptx`.
3. **Structure**: title → research question and motivation → methods (explain
   the core design on one slide) → key results (develop them slide by slide,
   tied to the original figures/tables) → limitations (the authors' stated
   limitations plus questions you identify) → summary and discussion
   questions (3 questions to ask the authors/audience).
4. **Notes**: write speaking prompts for every slide in a conversational
   tone, rather than translating the paper.
5. **Inspect the final file after export**: render every slide of the actual
   `汇报.pptx` delivery as images or a PDF, and inspect the final appearance
   slide by slide. Inspecting only source code, text-box properties, or
   generation logs is insufficient. Check titles, body text, figures,
   tables, footers, and sources for clipping, occlusion, or unintended
   overlap. Assess text, legends, and original figures/tables for readability
   at group-meeting projection size, and verify figures/tables and numbers
   against the original paper pages. After fixes, export again and recheck
   affected slides. After changing global settings such as the master,
   fonts, or layout, recheck every slide. Check notes separately; rendered
   slides do not replace a notes check.
6. In the final summary, give the `汇报.pptx` path, slide count, and status
   of the slide-by-slide visual inspection. If the current environment
   cannot render or view the final file, explicitly state that visual
   acceptance remains incomplete and explain why. The file may be
   delivered, but do not claim its layout is verified or has passed
   acceptance.

## Requirements

- [B] R1 Include 10–15 slides, each with speaker notes — Verification: open
  the PPTX and check that the slide count is within range and notes are
  present on every slide.
- [B] R2 Every number and conclusion has a source in the paper —
  Verification: key-result slides identify the corresponding original
  figure/table/section.
- [B] R3 Include all six parts and 3 discussion questions — Verification:
  title, question, methods, results, limitations, and discussion are all
  present.
- [B] R4 Before delivery, render and visually inspect every slide of the
  final PPTX for clipping, occlusion, readability, and figure/table fidelity
  to the paper; recheck after fixes — Verification: the summary states the
  slide-by-slide visual inspection status. If rendering is unavailable,
  explicitly mark the visuals as unverified and do not claim layout
  acceptance.

## When to stop

- Stop after delivering `汇报.pptx` with a summary of its path and slide
  count.
- Do not add discussion conclusions or evaluations absent from the paper.
  State when a style customization request exceeds the preset's scope.

## Output contract

1. One `汇报.pptx` file with 10–15 slides, each containing speaker notes.
2. Prefer reusing the paper's original figures/tables with source attribution;
   any redraw must preserve the data.
3. Never invent results, numbers, or conclusions absent from the paper.
   Describe contributions faithfully without exaggeration.
4. Write outputs only in the current working directory.

Taskbook family: this skill is the independently triggerable version of the
`paper2ppt` preset in [research-taskbook](https://github.com/mappedinfo/metis),
originating in the skill maintainers' own MIT-licensed project
[GIStudio/research-taskbook](https://github.com/GIStudio/research-taskbook).
