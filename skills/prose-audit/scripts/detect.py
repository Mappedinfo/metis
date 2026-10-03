#!/usr/bin/env python3
"""Read-only, dependency-free candidate collection for contextual prose review.

Frozen acceptance scope: finite bilingual vocabulary and explicit forms; configurable
positive frequency counts; bounded surface syntax; protected source/literal regions;
exact original source locations; descriptive lengths; no authorship inference.
The Markdown protection is a conservative heuristic, not a Markdown parser.
"""

from __future__ import annotations

import argparse
from bisect import bisect_right
from collections import Counter
import json
from pathlib import Path
import re
import statistics
import sys
import unicodedata


RULES_PATH = Path(__file__).with_name("rules.json")
MAX_INPUT_BYTES = 2_000_000
MAX_CONFIG_BYTES = 16_384
HAN = r"[\u3400-\u4dbf\u4e00-\u9fff\U00020000-\U0002fa1f]"
UNITS = re.compile(HAN + r"|[a-z]+(?:['’][a-z]+)*")
NEWLINE = r"(?:\r\n|\r(?!\n)|(?<!\r)\n)"


def read_json(path: Path, limit: int) -> dict:
    def unique_object(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError(f"duplicate JSON key: {key}")
            result[key] = value
        return result

    raw = read_limited(path, limit)
    result = json.loads(raw.decode("utf-8-sig"), object_pairs_hook=unique_object)
    if not isinstance(result, dict):
        raise ValueError("JSON must contain an object")
    return result


def read_limited(path: Path, limit: int) -> bytes:
    if not path.is_file():
        raise ValueError(f"not a regular file: {path}")
    with path.open("rb") as stream:
        raw = stream.read(limit + 1)
    if len(raw) > limit:
        raise ValueError(f"file exceeds {limit} bytes: {path}")
    return raw


def load_rules() -> dict:
    return read_json(RULES_PATH, MAX_INPUT_BYTES)


def validate_thresholds(defaults: dict, overrides: dict | None = None) -> dict:
    if overrides is None:
        overrides = {}
    if not isinstance(overrides, dict):
        raise ValueError("threshold config must be an object")
    unknown = set(overrides) - set(defaults)
    if unknown:
        raise ValueError("unknown threshold key(s): " + ", ".join(sorted(unknown)))
    result = {**defaults, **overrides}
    for key, value in result.items():
        if type(value) is not int or value < 1:
            raise ValueError(f"{key} must be a positive integer (not a boolean)")
    return result


def inline_code_spans(text: str):
    """Pair equal-length backtick runs once, including unmatched opening runs.

    An index of the next equal run avoids retrying every suffix of a long
    unmatched delimiter, as a variable-length regex backreference would do.
    """
    runs = [match.span() for match in re.finditer(r"`+", text)]
    next_same = {}
    closing = {}
    for index in range(len(runs) - 1, -1, -1):
        start, end = runs[index]
        length = end - start
        closing[index] = next_same.get(length)
        next_same[length] = index
    index = 0
    while index < len(runs):
        end_index = closing[index]
        if end_index is None:
            index += 1
        else:
            yield runs[index][0], runs[end_index][1]
            index = end_index + 1


def quotation_spans(text: str, opening: str, closing: str, single_line=False,
                    word_boundary=False):
    """Collect paired quotes in one pass; unmatched openings stay visible."""
    start = None

    def word_character(char):
        return char.isalnum() or char == "_"

    for index, char in enumerate(text):
        if char == "\x00" or (single_line and char == "\n"):
            start = None
            continue
        if start is not None and char == closing:
            valid_end = (not word_boundary or
                         (index > start + 1 and
                          (index + 1 == len(text) or not word_character(text[index + 1]))))
            if valid_end:
                yield start, index + 1
                start = None
                continue
            # A disallowed closer cannot be skipped by the original quote rule.
            # It may itself be the next opening delimiter.
            start = None
        if start is None and char == opening:
            if not word_boundary or index == 0 or not word_character(text[index - 1]):
                start = index


def protected_mask(text: str, include_quotes: bool = False) -> list[bool]:
    """Protect literal/source regions without changing text or its offsets."""
    mask = [False] * len(text)

    def cover(start, end):
        mask[start:end] = [True] * (end - start)

    def visible():
        return "".join("\x00" if mask[i] and c not in "\r\n" else c
                       for i, c in enumerate(text))

    lines = list(re.finditer(r"[^\r\n]*(?:\r\n|\r|\n|$)", text))
    yaml_end = 0
    if lines and lines[0].group().lstrip("\ufeff").strip() == "---":
        yaml_end = len(text)
        for line in lines[1:]:
            if line.group().strip() in {"---", "..."}:
                yaml_end = line.end()
                break
        cover(0, yaml_end)

    fence = None
    quote_block = False
    for line in lines:
        if line.start() < yaml_end:
            continue
        body = line.group().rstrip("\r\n")
        opening = re.match(r" {0,3}(`{3,}|~{3,})", body)
        if fence:
            cover(line.start(), line.end())
            if re.fullmatch(r" {0,3}" + re.escape(fence[0]) +
                            "{" + str(fence[1]) + r",}[ \t]*", body):
                fence = None
            continue
        if opening:
            token = opening.group(1)
            fence = (token[0], len(token))
            cover(line.start(), line.end())
            continue
        if body.startswith("    ") or body.startswith("\t"):
            cover(line.start(), line.end())
        if not include_quotes:
            if re.match(r" {0,3}>", body):
                quote_block = True
            elif not body.strip():
                quote_block = False
            if quote_block:
                cover(line.start(), line.end())

    # Closed and unfinished comments both remain protected.
    for match in re.finditer(r"<!--[\s\S]*?(?:-->|$)", visible()):
        cover(*match.span())
    for start, end in inline_code_spans(visible()):
        cover(start, end)
    for pattern in (
        r"(?<!\\)\$\$[\s\S]*?(?<!\\)\$\$",
        r"\\\[[\s\S]*?\\\]", r"\\\([\s\S]*?\\\)",
        r"(?<![\\$])\$(?!\$)[^$\n\x00]+(?<!\\)\$(?!\$)",
    ):
        for match in re.finditer(pattern, visible()):
            cover(*match.span())

    # Keep the readable label of [label](destination); hide the whole destination,
    # including a title. A small balanced scan handles parentheses inside a URL.
    view = visible()
    for match in re.finditer(r"\]\(", view):
        start = match.end()
        depth = 1
        cursor = start
        while cursor < min(len(view), start + 4096) and depth and view[cursor] not in "\n\r\x00":
            if view[cursor] == "\\":
                cursor += 2
                continue
            if view[cursor] == "(":
                depth += 1
            elif view[cursor] == ")":
                depth -= 1
            cursor += 1
        cover(start, cursor - 1 if depth == 0 else cursor)
    for pattern in (
        r"(?m)^ {0,3}\[[^]\n]+\]:[^\n\r]*",
        r"(?:https?://|www\.)[^\s<>\x00]+",
        r"<[^>\n\x00]+>",
    ):
        for match in re.finditer(pattern, visible(), re.IGNORECASE):
            cover(*match.span())
    if not include_quotes:
        for opening, closing, single_line, word_boundary in (
            ('"', '"', True, False), ("'", "'", True, True),
            ("“", "”", False, False), ("‘", "’", False, False),
            ("「", "」", False, False), ("『", "』", False, False),
            ("«", "»", False, False),
        ):
            for start, end in quotation_spans(visible(), opening, closing, single_line, word_boundary):
                cover(start, end)
    return mask


def normalized_source(text: str, mask: list[bool], folds: dict):
    """NFKC/case-fold clusters and retain a map back to original code points.

    A cluster keeps combining marks with their starter, including marks produced
    by compatibility decomposition; Hangul Jamo sequences also compose together.
    Expansions such as ligatures map every output character to the input cluster.
    """
    result, mapping = [], []
    clusters = []
    start = 0
    for i, char in enumerate(text):
        decomposition = unicodedata.normalize("NFKD", char)
        combining = decomposition and unicodedata.combining(decomposition[0])
        hangul = (i > start and 0x1100 <= ord(decomposition[0]) <= 0x11FF
                  and unicodedata.normalize("NFC", text[start:i + 1]) !=
                  unicodedata.normalize("NFC", text[start:i]) +
                  unicodedata.normalize("NFC", char))
        if i > start and not combining and not unicodedata.category(char).startswith("M") and not hangul:
            clusters.append((start, i))
            start = i
    if text:
        clusters.append((start, len(text)))
    for start, end in clusters:
        normalized = unicodedata.normalize("NFKC", text[start:end]).casefold()
        blocked = any(mask[start:end])
        for char in normalized:
            char = folds.get(char, char)
            if char == "’":
                char = "'"
            result.append("\x00" if blocked and char not in "\r\n" else char)
            mapping.append((start, end))
    return "".join(result), mapping


def latin_word_character(char: str) -> bool:
    return (char == "_" or char.isdigit() or
            "LATIN" in unicodedata.name(char, "") or
            unicodedata.category(char).startswith("M"))


def term_matches(text: str, forms: list[str], folds: dict):
    matches = []
    for form in forms:
        normalized, _ = normalized_source(form, [False] * len(form), folds)
        # re.escape(' ') is '\\ '; multiword entries may span a wrapped line.
        pattern = re.escape(normalized).replace(r"\ ", r"[ \t\r\n]+")
        for match in re.finditer(pattern, text):
            start, end = match.span()
            if normalized[0].isascii() and normalized[0].isalpha() and start and latin_word_character(text[start - 1]):
                continue
            if normalized[-1].isascii() and normalized[-1].isalpha() and end < len(text) and latin_word_character(text[end]):
                continue
            matches.append((start, end))
    return sorted(set(matches))


def length_units(text: str) -> int:
    return len(UNITS.findall(text))


def paragraph_spans(text: str):
    start = 0
    for match in re.finditer(NEWLINE + r"[ \t\x00]*" + NEWLINE, text):
        if length_units(text[start:match.start()]):
            yield start, match.start()
        start = match.end()
    if length_units(text[start:]):
        yield start, len(text)


def sentence_spans(text: str, start: int, end: int):
    for match in re.finditer(r"[^.!?。！？\r\n]+(?:[.!?。！？]+|(?=[\r\n]|$))", text[start:end]):
        if length_units(match.group()):
            yield start + match.start(), start + match.end()


def scan(text: str, config: dict | None = None, include_quotes: bool = False) -> dict:
    if "\x00" in text:
        raise ValueError("input contains a NUL character; provide a UTF-8 prose file")
    if len(text.encode("utf-8")) > MAX_INPUT_BYTES:
        raise ValueError(f"input exceeds {MAX_INPUT_BYTES} UTF-8 bytes")
    rules = load_rules()
    thresholds = validate_thresholds(rules["thresholds"], config)
    mask = protected_mask(text, include_quotes)
    normalized, mapping = normalized_source(text, mask, rules["traditional_fold"])
    paragraphs = list(paragraph_spans(normalized))
    paragraph_starts = [p[0] for p in paragraphs]
    line_starts = [0] + [m.end() for m in re.finditer(r"\r\n|\r|\n", text)]

    def location(start, end):
        original_start, original_end = mapping[start][0], mapping[end - 1][1]
        line = bisect_right(line_starts, original_start)
        end_line = bisect_right(line_starts, original_end)
        return {"start": original_start, "end": original_end,
                "text": text[original_start:original_end],
                "line": line, "column": original_start - line_starts[line - 1] + 1,
                "end_line": end_line,
                "end_column": original_end - line_starts[end_line - 1] + 1}

    candidates = []
    occurrences = []
    for index, rule in enumerate(rules["vocabulary"]):
        for start, end in term_matches(normalized, rule["forms"], rules["traditional_fold"]):
            occurrences.append((start, end, index))
    # Longest phrase wins before counting. Ties use the stable vocabulary order.
    # This prevents one 'holistic approach' occurrence counting as two terms.
    used = bytearray(len(normalized))
    selected = []
    for start, end, index in sorted(occurrences, key=lambda x: (-(x[1] - x[0]), x[0], x[2])):
        if not any(used[start:end]):
            used[start:end] = b"\x01" * (end - start)
            selected.append((start, end, index))
    by_rule = {}
    for start, end, index in sorted(selected):
        by_rule.setdefault(index, []).append((start, end))
    for index, spans in by_rule.items():
        rule = rules["vocabulary"][index]
        tier = rule["tier"]
        paragraph_counts = Counter(max(0, bisect_right(paragraph_starts, s) - 1) for s, _ in spans)
        document_count = len(spans)
        paragraph_max = max(paragraph_counts.values(), default=0)
        eligible = document_count >= thresholds[f"tier{tier}_document"]
        if tier == 2:
            eligible |= paragraph_max >= thresholds["tier2_paragraph"]
        if eligible:
            candidates.append({"kind": "vocabulary", "rule_id": rule["id"],
                               "tier": tier, "message": rule["note"],
                               "counts": {"document": document_count, "paragraph_max": paragraph_max},
                               "locations": [location(s, e) for s, e in spans]})

    for kind, rule_key in (("syntax", "syntax"), ("formatting", "formatting")):
        for rule in rules[rule_key]:
            spans = [m.span() for m in re.finditer(rule["pattern"], normalized)]
            if spans:
                candidates.append({"kind": kind, "rule_id": rule["id"],
                                   "message": rule["note"],
                                   "locations": [location(s, e) for s, e in spans]})

    sentences = []
    repetitions = {}
    for p_start, p_end in paragraphs:
        paragraph_sentences = list(sentence_spans(normalized, p_start, p_end))
        sentences.extend(paragraph_sentences)
        previous = {}
        for s_start, s_end in paragraph_sentences:
            current = {}
            for rule in rules["adjacent_repetition"]:
                spans = [(s_start + a, s_start + b) for a, b in
                         term_matches(normalized[s_start:s_end], rule["forms"], rules["traditional_fold"])]
                if spans:
                    current[rule["id"]] = spans
                    if rule["id"] in previous:
                        before = previous[rule["id"]][-1]
                        after = spans[0]
                        # Do not join prose across an omitted literal/source region.
                        if "\x00" not in normalized[before[1]:after[0]]:
                            repetitions.setdefault(rule["id"], set()).update((before, after))
            previous = current
    for rule_id, spans in repetitions.items():
        candidates.append({"kind": "syntax", "rule_id": "adjacent_repetition:" + rule_id,
                           "message": "Repeated emphasis in adjacent sentences: check whether each occurrence adds a necessary distinction.",
                           "locations": [location(s, e) for s, e in sorted(spans)]})

    sentence_lengths = [length_units(normalized[s:e]) for s, e in sentences]
    paragraph_lengths = [length_units(normalized[s:e]) for s, e in paragraphs]
    stats = {"unit": "Han characters plus English tokens (approximate)",
             "sentence_lengths": sentence_lengths, "paragraph_lengths": paragraph_lengths,
             "sentence_count": len(sentences), "paragraph_count": len(paragraphs),
             "protected_characters": sum(mask)}
    for label, lengths in (("sentence", sentence_lengths), ("paragraph", paragraph_lengths)):
        stats[label + "_length_mean"] = round(statistics.mean(lengths), 3) if lengths else None
        stats[label + "_length_stddev"] = round(statistics.pstdev(lengths), 3) if lengths else None
    candidates.sort(key=lambda c: (c["locations"][0]["start"], c["kind"], c["rule_id"]))
    return {
        "schema_version": 1,
        "review_status": "candidate_scan_only",
        "context_review_required": True,
        "input_status": "scanned" if paragraph_lengths else "insufficient_text",
        "thresholds": thresholds,
        "candidates": candidates,
        "statistics": stats,
        "limitations": [
            "Candidate collection is not a completed prose review, an authorship detector, or an error verdict. Zero candidates is not proof of quality.",
            "Counts apply to each rules.json vocabulary family, including its listed aliases and explicit inflections. Overlapping vocabulary uses the longest phrase once before thresholds.",
            "NFKC, case folding, curly-apostrophe folding, and a small curated traditional-character table are used; this is not comprehensive script conversion or lemmatization.",
            "Locations use zero-based original Unicode code-point offsets with exclusive ends and one-based lines/columns; BOM counts as a character and CRLF as one line break.",
            "Markdown, literal and quote protection is heuristic; unclosed YAML/fences/comments are conservatively protected. --include-quotes restores quotation spans and blockquotes only.",
            "Lengths count unprotected Han characters and English tokens. Punctuation and line breaks approximate sentences; abbreviations, other languages and complex Markdown can distort statistics. No length threshold is used.",
            "Surface patterns cannot establish semantic loops, false ranges, relevance, evidence quality, warranted emphasis, or whether a technical term is appropriate. Read the full text in context.",
        ],
    }


def render_text(result: dict) -> str:
    lines = ["review_status: candidate_scan_only", "context_review_required: true",
             "input_status: " + result["input_status"]]
    for candidate in result["candidates"]:
        lines.append(f"\n[{candidate['kind']}] {candidate['rule_id']}: {candidate['message']}")
        for item in candidate["locations"]:
            lines.append(f"  {item['line']}:{item['column']} [{item['start']}:{item['end']}] {item['text']!r}")
    if not result["candidates"]:
        lines.append("No candidates collected. Contextual review is still required.")
    lines.append("\nDescriptive statistics: " + json.dumps(result["statistics"], ensure_ascii=False))
    lines.extend("- " + note for note in result["limitations"])
    return "\n".join(lines)


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="UTF-8 plain-text or Markdown file (at most 2,000,000 bytes)")
    parser.add_argument("--json", action="store_true", help="emit machine-readable candidate JSON")
    parser.add_argument("--config", type=Path, help="JSON object of positive frequency threshold overrides")
    parser.add_argument("--include-quotes", action="store_true", help="also scan quotation spans and source blockquotes")
    args = parser.parse_args(argv)
    try:
        config = read_json(args.config, MAX_CONFIG_BYTES) if args.config else None
        # Decode bytes directly: text-mode newline translation would corrupt offsets.
        source = read_limited(args.input, MAX_INPUT_BYTES).decode("utf-8")
        result = scan(source, config, args.include_quotes)
    except (OSError, ValueError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    print(json.dumps(result, ensure_ascii=False, indent=2) if args.json else render_text(result))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
