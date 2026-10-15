---
name: pdf-annotater-researcher
description: >
  Close-read a research paper PDF and annotate the file itself in the reader's
  language: native PDF highlights, popup notes and bookmarks covering every
  paragraph, load-bearing sentence, figure, table and equation, so the reader
  can understand the paper by opening the annotations alone. Use when the user
  gives a paper PDF and asks for 精读标注 or 阅读批注 on the PDF, "annotate this
  paper so I can understand it paragraph by paragraph", "add reading notes to
  this PDF", or asks to file a downloaded paper into a project's references
  folder with Chinese (or any-language) reading annotations — even when they
  only say "帮我把这篇论文加到参考文献里并做好标注". Delivers the annotated PDF
  plus a coverage report; never a separate summary document instead of
  annotations.
license: MIT
category: analyze
domain: [literature, paper]
action: [create, analyze]
uses: []
artifacts:
  - "Annotated PDF: native highlight + popup-note objects for every body paragraph, key sentence, figure, table and equation, plus navigation bookmarks, written onto a verified copy of the original file"
  - "Coverage report: per-kind annotation counts, unmatched anchors, and the verification steps performed"
---

# pdf-annotater-researcher

## What it does

Takes one born-digital research paper PDF and a target reading language, reads
the paper end to end, and writes close-reading annotations **into the PDF as
native annotation objects** — highlighted anchors plus margin sticky notes,
organized by kind (paragraph, key sentence, figure, table, equation, section
guide, and links to the reader's own project) — so a reader who opens the
annotated file gets a guided reading of every paragraph, sentence that carries
weight, and every figure and table, without needing any companion document.
It also emits a coverage report so completion is auditable.

## When to use / not use

Use for: annotating an existing PDF in place; filing a paper into a project's
reference collection with reading notes attached to the file itself; making a
dense paper navigable for later self-study.

Hand off instead:

- Answering questions about a paper or producing interpretation notes **without
  touching the file** → a paper-interpretation or literature-QA capability.
- Acquiring the PDF from a DOI/arXiv/title → a paper-acquisition capability.
- Judging whether a manuscript is ready to submit → a manuscript-review
  capability.
- Fixing language or wording of a text the user is writing → a prose-editing
  capability.
- Scanned or image-only PDFs (no text layer): detection and OCR are out of
  scope. Detect, then report the blocker; see `## When to stop`.

## Method

### 1. File the PDF, keep the original intact

Move the PDF to the user's requested project location (ask only if the target
is genuinely ambiguous; a `references/` or literature folder is the usual
home). Keep the original filename. All annotation work happens on a temporary
copy; the verified result then replaces the project file. Never annotate the
only copy in place — a failed write would destroy the source.

### 2. Read the whole paper before writing any note

Extract the full text (`pdftotext` or `page.get_text("words")`) and read it
page by page. Two-column layouts are stored column-by-column in extraction
order; page boundaries in extracted text do not always match visual pages, so
re-derive paragraph boundaries from a rendered view when a paragraph straddles
columns or pages. Note the printed page number offset (cover pages shift it by
one) — every annotation references the physical PDF page.

### 3. Verify figures and tables visually

Render each page that contains figures or tables (`page.get_pixmap(dpi≈110)`)
and actually look at the images before describing them. Captions lie by
omission: a confusion matrix caption does not tell you the class order, a
framework diagram caption does not tell you how to walk its panels. The note
must say what the artifact shows, how to read it (axes, panels, colors, matrix
orientation), and which claim in the paper it supports.

### 4. Build an annotation plan before touching the PDF

Write the plan as a JSON file (`entries` list; schema and note-writing rules
in [references/plan-schema.md](references/plan-schema.md)). Each entry names a
physical page, a kind, an exact anchor text (`needle`) to highlight, and the
note text. Plan every body paragraph plus the load-bearing sentences inside
them — definitions, equations, headline numbers, core claims — every figure
and table, one guide note per section, an overall reading-guide note on the
first page, and (when the reader has a stated project) a handful of notes
connecting the paper to that project. Cover the paper; do not decorate it.
Density reference: a 19-page two-column article typically yields 100–150
entries, of which roughly half are paragraph notes.

Write notes in the reader's declared language; keep terminology, symbols and
cited numbers in the original form. Two to three sentences per note: what this
unit says, why the paper needs it, what evidence it rests on. Where the paper
is internally inconsistent or honest about a weakness, the note should say so.

### 5. Apply on a copy with the bundled script

```
uv run --with pymupdf python <skill-dir>/scripts/apply_annotations.py \
  --src <project.pdf> --out /tmp/annotated.pdf --plan plan.json \
  --author "Close reading" --report /tmp/coverage.json
```

The script adds one highlight + one sticky note per entry, adds optional
bookmarks, writes annotations as UTF-16 text strings (Chinese and other CJK
notes render correctly in Preview, Acrobat and WPS without font embedding),
and re-reads the saved file to count what actually landed. It exits non-zero
if any needle missed. Sticky icons are pinned to the page margins (left column
→ left margin, right column → right margin) so they never cover body text;
anchor matching is character-level over normalized words, so needles may span
line breaks and hyphenation. Technique details and failure modes:
[references/technique.md](references/technique.md).

### 6. Verify twice, then replace

Programmatic: read the report — counts per kind against the plan, zero mojibake
in note text, total annotation objects = highlights + stickies.
Visual: render every annotated page and look at it. Check that highlights sit
on the intended sentences, icons sit in margins, and nothing overlaps body
text. Fix anchor misses (needle wording, wrong page) and re-apply; at most two
repair passes. Only after both checks pass, replace the project file with the
verified copy and delete the temporary artifacts.

### 7. Register the paper (optional, on request)

If the target project keeps a bibliography file and the user asked to file the
paper "into the references", add a citation entry following the project's
existing entry format, then run the project's own consistency check if it has
one. Do not cite the paper in the manuscript body unless asked.

## Requirements

- [B] R1 Annotations are native PDF annotation objects (highlights, text
  stickies, bookmarks) on the requested file; the paper's own text, layout and
  pagination are unmodified — Verification: re-open the saved file, count
  annotation objects, compare page count and extracted text against the source.
- [B] R2 Every body paragraph has a note, every figure and table has a note,
  written from verified visual content — Verification: coverage report counts
  per kind against the paragraph/figure inventory from step 2–3.
- [B] R3 The delivered file passed both the programmatic and the visual
  verification pass — Verification: coverage report fields plus rendered-page
  inspection; state plainly which pages were checked.
- [B] R4 Notes are in the reader's declared language and each note is
  self-contained (understandable without re-reading the paper) — Verification:
  read back a sample of note strings from the saved file.
- [A] R5 Anchors are unique on their page (first occurrence used when not) and
  ambiguities are reported — Verification: report's ambiguous-needle list.
- [A] R6 Navigation bookmarks cover the section structure — Verification:
  bookmark count in the report.

## When to stop

- Done when: the annotated file is at the requested location, R1–R4 hold with
  evidence, and the coverage report is delivered.
- Budgets: at most two anchor-repair passes after the first apply, and one
  full visual pass per applied revision. If needles still miss after the
  second pass, or the PDF has no extractable text layer (scanned), stop:
  deliver whatever passed verification, list the unmatched anchors or the
  missing text layer as the blocker, and name the smallest unblock condition
  (e.g. "provide a born-digital PDF or authorize OCR"). Stopping does not mark
  blocked items done.

## Output contract

1. The annotated PDF at the user's requested path (or the original location if
   the request was "annotate this file").
2. A coverage report (stdout or `--report` JSON): per-kind counts, unmatched
   anchors, ambiguous first-use list, verification summary.
3. A short close-out that maps each Requirement above to done/blocked/n-a with
   evidence, and names any unfinished work (pages not visually checked, needles
   given up after the budget).
