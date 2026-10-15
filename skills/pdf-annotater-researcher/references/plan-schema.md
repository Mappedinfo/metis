# Annotation plan schema and note-writing craft

The plan is a JSON file consumed by `scripts/apply_annotations.py`. Build it
after reading the paper (step 2) and verifying the figures (step 3) — the plan
is where reading comprehension becomes placement data.

```json
{
  "author": "Close reading",
  "labels": {"para": "段落精读", "key": "关键句", "figure": "图解读",
             "table": "表解读", "equation": "公式解读", "section": "章节导读",
             "cover": "总导读", "link": "与我的项目关联", "refs": "文献线索"},
  "toc": [[1, "1. Introduction 引言", 2], [2, "1.1 Background", 2]],
  "entries": [
    {"page": 2, "kind": "para",
     "needle": "As urbanization progresses and smart city initiatives",
     "note": "本段提出……"},
    {"page": 4, "kind": "figure",
     "needle": "Figure 1. The study area and building footprint",
     "note": "图1：左……右……",
     "bbox": [71, 534, 524, 770]},
    {"page": 1, "kind": "cover", "needle": null,
     "note": "全文一句话……", "bbox": [300, 620]}
  ]
}
```

## Fields

- `page` — physical PDF page, 1-based. Printed journal page numbers are offset
  by cover pages; never trust them for placement.
- `kind` — one of `cover`, `abstract`, `section`, `para`, `key`, `figure`,
  `table`, `equation`, `link`, `refs`. Kind decides color, sticky icon and the
  default `[Label]` prefix; `labels` in the plan overrides prefixes (use the
  reader's language).
- `needle` — exact words to highlight, copied from the extracted text. May span
  line breaks; hyphenation (`over­look`, `com\xad bining`) is normalized. Keep
  needles short enough to be unique on the page — a sentence fragment of 5–10
  words from a single paragraph is usually safe. `null` for sticky-only
  entries (cover guides, references).
- `note` — the popup text. A leading `【…】` or `[…]` bracket group is stripped
  and replaced by the kind label, so write the note body only.
- `bbox` — optional. A 4-element `[x0, y0, x1, y1]` (PDF points, top-left
  origin) pins the sticky icon next to a figure or table region; a 2-element
  point places a sticky-only note (cover). Get boxes from
  `page.get_image_info()`; table regions come from the caption needle plus the
  rendered view.

## Note craft per kind

| Kind | Anchor | Note must contain |
| --- | --- | --- |
| `cover` | none | One-sentence summary of the whole paper, the core contribution, and a suggested reading order with page numbers. |
| `abstract` | first abstract sentence | The paper's move in three beats: gap, method, headline numbers. |
| `section` | section heading | What job this section does in the argument and how it connects to the previous one. |
| `para` | paragraph's opening words | 2–3 sentences: what it says, why the paper needs it, what evidence or logic carries it. |
| `key` | the load-bearing words | Quote or translate the claim precisely; add the number or definition verbatim; one line on why it is load-bearing. |
| `figure` | caption words | What is plotted, how to read it (axes/panels/colors/matrix orientation), which claim it supports. From the rendered image, never from the caption alone. |
| `table` | caption words | What the rows/columns are, the comparison to look at, the winner/loser and the numbers. |
| `equation` | the "where x denotes …" sentence | Transcribe the formula in linear notation, name every symbol, say what it is for and what setting produced it. |
| `link` | the passage relevant to the reader's project | What the paper does and the concrete borrowable idea or warning for the reader's own project. Only when the reader stated a project. |
| `refs` | the references heading | 3–7 entries worth following up, with one-line reasons. |

## Density and honesty

- Cover every body paragraph; add `key` notes to the sentences a skimming
  reader would misread if skipped. When in doubt between two `key` notes in one
  paragraph, keep the one that carries a number, definition or negation
  ("however", "unlike prior work").
- When the paper is internally inconsistent (e.g. two sections state different
  feature counts) or honestly reports a weak class, say so in the note. The
  annotation layer is a reading guide, not a press release.
- Cross-page paragraphs: anchor the entry at the paragraph's first words; the
  note may cover content that continues on the next page.
