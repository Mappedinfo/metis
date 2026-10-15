# Technique notes: placement, matching, verification

Why the workflow is shaped the way it is, and the failure modes already paid
for. Read when an apply fails or before modifying the script.

## Temp copy, then atomic replace

Annotating the only copy in place risks destroying the source on a mid-write
failure or a bad plan. Always `--src <project.pdf> --out /tmp/….pdf`, verify
the copy, then `cp` over the project file. The script itself copies first and
never writes to `--src`.

## Text matching across lines and hyphens

`page.get_text("words")` returns one token per word plus line/block ids.
Anchors must survive three real-world shapes:

1. A line break inside the needle → words are joined with single spaces in
   reading order (block, line, word), so a needle spanning two lines matches.
2. A word hyphenated at line end (`conclu-` + `sion`) → the raw token ends in
   `-`; the joiner suppresses the space so `conclusion` matches.
3. A **standalone** soft-hyphen token (`com` + `\xad` + `bining`, as produced
   by some publishers) → empty normalized tokens set a join flag for the next
   word instead of contributing a space.

Both sides of the comparison are normalized the same way: NFKC (ligatures),
strip U+2010/2011/00AD/2012/2013 and ASCII hyphen, curly apostrophes to ASCII,
whitespace collapsed, lowercased. Write needles by copying from extracted text,
not from what the page looks like.

Duplicate needles: the first occurrence is used and reported. Disambiguate by
adding neighboring words from the intended paragraph.

## Sticky icons live in margins

A note icon is ~24 pt wide. Placing it relative to a highlight's start
(`x0 - offset`) lands on body text whenever the anchor starts mid-line — the
icon then covers a word two lines below. The script therefore pins icons to
fixed margins: left column → x = 34 pt, right column → x = page width − 89 pt,
y = anchor top − 2 pt (clamped into the page). Figure/table stickies pin to
the region box's top-right corner + 12 pt, which assumes whitespace right of
the region (true for full-width figures); for a column-width figure the
corner may face the neighboring column's text — prefer omitting `bbox` and
letting the margin rule place the icon, or check the rendered page. The
column test is `x0 > page_width/2`.

## PDF coordinates and colors

PyMuPDF page coordinates have the **top-left origin**, y grows downward, in
points (72/inch). `get_image_info()` bboxes and `get_text("words")` rects use
the same space, so plan bboxes taken from those calls plug in directly.
Highlight and sticky colors are RGB tuples in 0–1; the kind palette in the
script is tuned to stay readable over both columns without obscuring text.

## CJK notes without font embedding

Sticky-note (`/Text`) and highlight annotations store their text as PDF text
strings; the viewer renders the popup with its own fonts, so Chinese, Japanese
and Korean notes need no embedded font. Drawn-on-page alternatives (freetext
annotations) would require a CJK appearance font and break in at least one
common viewer — avoid them for notes; use more sticky entries instead.

## Verification protocol

After saving, the script re-opens the output (never trusts the in-memory doc)
and counts annotation objects and per-kind subjects. The agent must still:

1. Read the report: `placed == total_entries`, spot-check note strings for
   mojibake, note ambiguous needles.
2. Render every annotated page (`page.get_pixmap(dpi≈100)`) and inspect it:
   highlight on the intended sentence, icons in margins, no overlap with body
   text, figure stickies next to the right figure. Full pass, not samples —
   icon placement bugs are page-local.
3. Only then replace the project file.

## Known limits

- Image-only/scanned PDFs have no word layer → every needle misses. Detect
  early (`len(page.get_text("words")) == 0` on a few pages) and stop with the
  unblock condition (born-digital file or OCR authorization).
- Encrypted PDFs fail to open for annotation; report rather than strip
  encryption.
- Right-margin width varies by page size; the `page_width − 89` constant
  assumes a text block ending ≈65–70 pt from the right edge (typical journal
  layout). For unusual layouts, check one rendered page and adjust the
  constant in `sticky_point`.
