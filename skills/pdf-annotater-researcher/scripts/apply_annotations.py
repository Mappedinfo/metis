#!/usr/bin/env python3
"""Apply a close-reading annotation plan to a PDF copy and verify the result.

Usage:
    uv run --with pymupdf python apply_annotations.py \
        --src paper.pdf --out annotated.pdf --plan plan.json [--author NAME] [--report report.json]

The plan is a JSON object:
    {
      "author": "optional, overrides --author",
      "labels": {"para": "段落精读", ...},        # optional per-kind label prefix
      "toc": [[level, title, page_1based], ...],  # optional bookmarks
      "entries": [
        {"page": 3, "kind": "para", "needle": "exact words to highlight",
         "note": "the popup note text"},
        {"page": 4, "kind": "figure", "needle": "Figure 1. caption words",
         "note": "...", "bbox": [x0, y0, x1, y1]}   # optional sticky anchor box
      ]
    }

Every entry becomes one highlight (if `needle` is found) plus one sticky note.
Anchors are matched character-level over normalized page words, so needles may
span line breaks; soft hyphens and end-of-line hyphens are normalized away.
Exit code 0 when every entry was placed, 2 when some needles missed.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
import unicodedata

import pymupdf

HYPH_CHARS = "\u00ad\u2010\u2011\u2012\u2013-"

KIND_COLOR = {
    "cover": (0.98, 0.80, 0.20), "abstract": (0.98, 0.80, 0.20),
    "section": (0.72, 0.55, 0.92), "para": (1.00, 0.92, 0.45),
    "key": (0.55, 0.88, 0.55), "figure": (0.50, 0.76, 1.00),
    "table": (0.50, 0.76, 1.00), "equation": (1.00, 0.68, 0.35),
    "link": (1.00, 0.45, 0.45), "refs": (0.50, 0.76, 1.00),
}
KIND_ICON = {
    "cover": "Star", "abstract": "Comment", "section": "Help", "para": "Note",
    "key": "Key", "figure": "Comment", "table": "Comment",
    "equation": "NewParagraph", "link": "Insert", "refs": "Star",
}
DEFAULT_LABELS = {
    "cover": "Reading guide", "abstract": "Abstract", "section": "Section guide",
    "para": "Paragraph", "key": "Key sentence", "figure": "Figure",
    "table": "Table", "equation": "Equation", "link": "Connection",
    "refs": "References",
}


def norm(s: str) -> str:
    s = unicodedata.normalize("NFKC", s).translate(dict.fromkeys(map(ord, HYPH_CHARS), None))
    s = s.replace("\u2019", "'").replace("\u2018", "'")
    return re.sub(r"\s+", " ", s).lower()


def find_words(page, needle: str):
    """Return (line_rects, occurrences) for a needle, or None.

    Words are joined with single spaces, except that a word ending in a hyphen
    or a standalone soft-hyphen token joins the next word directly, so needles
    match across line breaks and hyphenation.
    """
    words = page.get_text("words")
    if not words:
        return None
    words = sorted(words, key=lambda w: (w[5], w[6], w[7]))
    spans, buf, cur, join = [], [], 0, False
    for w in words:
        raw, token = w[4], norm(w[4])
        if token == "":
            join = True
            continue
        if buf and not join:
            buf.append(" ")
            cur += 1
        spans.append((cur, cur + len(token), w))
        buf.append(token)
        cur += len(token)
        join = raw.endswith(tuple(HYPH_CHARS))
    hay = "".join(buf)
    n = norm(needle)
    i = hay.find(n)
    if i < 0:
        return None
    end = i + len(n)
    hit = [w for (a, b, w) in spans if a < end and b > i]
    if not hit:
        return None
    lines: dict = {}
    for w in hit:
        lines.setdefault((w[5], w[6]), []).append(w)
    rects = []
    for ws in lines.values():
        r = pymupdf.Rect(ws[0][:4])
        for w in ws[1:]:
            r |= pymupdf.Rect(w[:4])
        rects.append(r)
    return rects, hay.count(n)


def sticky_point(anchor_rect, page_width: float, bbox):
    """Sticky icons always sit in the page margin, never on body text."""
    if bbox and len(bbox) == 4:
        return pymupdf.Point(min(bbox[2] + 12, page_width - 20), bbox[1] + 2)
    if anchor_rect is not None:
        if anchor_rect.x0 > page_width / 2:
            return pymupdf.Point(page_width - 89, max(50, min(770, anchor_rect.y0 - 2)))
        return pymupdf.Point(34, max(50, min(770, anchor_rect.y0 - 2)))
    if bbox:
        return pymupdf.Point(*bbox)
    return pymupdf.Point(60, 300)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--src", required=True, help="source PDF (read-only)")
    ap.add_argument("--out", required=True, help="annotated output PDF")
    ap.add_argument("--plan", required=True, help="annotation plan JSON")
    ap.add_argument("--author", default="Close reading", help="annotation author name")
    ap.add_argument("--report", help="optional path for the JSON coverage report")
    args = ap.parse_args()

    plan = json.load(open(args.plan, encoding="utf-8"))
    entries = plan.get("entries", [])
    labels = {**DEFAULT_LABELS, **plan.get("labels", {})}
    author = plan.get("author") or args.author

    shutil.copyfile(args.src, args.out)
    doc = pymupdf.open(args.out)
    if plan.get("toc"):
        doc.set_toc(plan["toc"])

    placed, misses, ambiguous = 0, [], []
    for e in entries:
        page = doc[e["page"] - 1]
        kind = e.get("kind", "para")
        color, icon = KIND_COLOR.get(kind, KIND_COLOR["para"]), KIND_ICON.get(kind, "Note")
        label = labels.get(kind, kind)
        note_text = e.get("note", "")
        stripped = re.sub(r"^\s*[【\[][^】\]]*[】\]]\s*", "", note_text)
        note = f"[{label}] {stripped}"
        rects = None
        if e.get("needle"):
            res = find_words(page, e["needle"])
            if res is None:
                misses.append({"page": e["page"], "kind": kind, "needle": e["needle"]})
                continue
            rects, occurrences = res
            if occurrences > 1:
                ambiguous.append({"page": e["page"], "needle": e["needle"], "count": occurrences})
            hl = page.add_highlight_annot(quads=rects)
            hl.set_colors(stroke=color)
            hl.set_info(title=author, subject=label, content=note)
            hl.update()
        anchor = rects[0] if rects else None
        sticky = page.add_text_annot(
            sticky_point(anchor, page.rect.width, e.get("bbox")), note, icon=icon)
        sticky.set_colors(stroke=color)
        sticky.set_info(title=author, subject=label)
        sticky.update()
        placed += 1

    tmp_out = args.out + ".annotating.pdf"
    doc.save(tmp_out, incremental=False, garbage=3, deflate=True)
    doc.close()
    shutil.move(tmp_out, args.out)

    # Verify by re-reading the saved file.
    doc = pymupdf.open(args.out)
    counts: dict = {}
    annots = 0
    for pno in range(doc.page_count):
        for a in doc[pno].annots() or []:
            annots += 1
            counts[a.info.get("subject") or "?"] = counts.get(a.info.get("subject") or "?", 0) + 1
    report = {
        "placed": placed,
        "total_entries": len(entries),
        "annots_in_file": annots,
        "counts_by_kind": counts,
        "toc_entries": len(doc.get_toc()),
        "misses": misses,
        "ambiguous_needles_first_used": ambiguous,
    }
    doc.close()
    if args.report:
        with open(args.report, "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if placed == len(entries) else 2


if __name__ == "__main__":
    sys.exit(main())
