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
uses: [scansci-pdf, profiles/deck]
artifacts:
  - "汇报.pptx — 10–15 Chinese group-meeting slides with speaker notes on every slide"
---

[中文译本](SKILL.zh.md)

# Paper → PPT (taskbook family)

Turn the attached paper PDF or the PDF at the specified path into a Chinese
presentation, `汇报.pptx`.

Check the available local PDF reader and page renderer first. Use OCR only
when the text layer is absent or defective and an OCR tool is available;
verify numbers, equations and figure/table labels against the original pages.
Record unreadable pages and actual reading coverage. `scansci-pdf` retrieves
papers by identifiers; its optional download-time Markdown is not a local-PDF
reader, OCR service or guarantee of figure extraction. Use it only when
retrieval is needed. Missing reading tools leave affected requirements blocked.

## When to use

- The user provides a paper PDF and asks to make a PPT, turn it into slides,
  prepare a presentation, or present it at a group meeting.

Do not use for custom English slides (this skill uses a fixed Chinese
group-meeting style) or close-reading notes (use `taskbook-interpret`).

## Method

1. **Read the entire paper PDF** and identify its research question, methods,
   key results with their original figures/tables, and limitations.
2. Read `<project-root>/profiles/deck.yaml`, resolving the project root from
   its instructions rather than the installed skill location. Apply its palette,
   typography, aspect and layout defaults; record an explicit user override.
   Install a missing profile through the [profile guide](https://github.com/mappedinfo/metis/blob/main/profiles/README.md)
   within authorized scope, preserving existing styles. If it cannot be resolved,
   keep the style requirement blocked. Deck headings follow slide layout; the
   profile's `figure` fields govern figures embedded in slides.
   **Generate `汇报.pptx`**: 10–15 slides in Chinese with speaker notes on
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

Maintain one ledger for the accepted task and the requirements below:
`ID | requirement | done/blocked/n/a | evidence or reason`. `n/a` needs a
scope-based reason and cannot waive a requested outcome. A file or an honest
partial-coverage label does not establish completion of the accepted scope.

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

- [B] R5 The project deck profile or explicit override is applied — Verification:
  compare final slide typography, palette, aspect and figure placement with the
  recorded profile/override; merely naming it is not application evidence.

## When to stop

Use one scoped reading/creation pass, at most one targeted repair round and
one final check of affected outputs. Deliver when every applicable blocking
requirement has passing evidence in the ledger. Do not reopen passed checks.
If input, tools or a required verification are unavailable, or the budget is
exhausted, deliver a useful partial result only with completed and blocked
items, the stop condition and the smallest unblock condition. Partial delivery
is not full acceptance; mark unsupported content unavailable rather than
inventing it. Continue independent work within the accepted scope.

## Output contract

Include the requirements ledger and actual coverage/check status in the
existing notes or delivery summary, with remaining work and unblock conditions.
Do not add a separate tracking system.

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
