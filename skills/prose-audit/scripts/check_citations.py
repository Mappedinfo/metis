#!/usr/bin/env python3
"""Read-only, finite LaTeX citation checks; no macro expansion or semantic verdict.

Default: report multi-source attribution candidates as warnings. A project's
explicit --separate-attribution policy makes those candidates errors unless a
local shared-claim reason is recorded. --methods enables per-occurrence identity
checks from a project-owned JSON registry; no identities ship with this helper.
"""
from __future__ import annotations

import argparse
import bisect
import json
from pathlib import Path
import re
import sys

MAX_BYTES = 2_000_000
API_VERSION = 1
COMMAND = re.compile(r"\\([A-Za-z]+)\*?")
CITATIONS = {"cite", "citep", "citet", "textcite", "parencite", "autocite", "footcite", "supercite"}
FORMATTING = {"emph", "textbf", "textit", "textsf", "textrm", "textnormal"}
HEADINGS = {"part", "chapter", "section", "subsection", "subsubsection", "paragraph", "subparagraph", "title", "caption"}
HIDDEN = {"url", "nolinkurl", "path", "texttt", "detokenize", "label", "ref", "pageref",
          "eqref", "autoref", "nameref", "input", "include", "includegraphics",
          "bibliography", "addbibresource", "hypersetup"}
MARKER = re.compile(r"^[ \t]*%[ \t]*citation-check:[ \t]*shared-claim[ \t]+keys=([^;\n]+);[ \t]*reason=(\S[^\n]*)$", re.M)


def read_text(path: Path) -> str:
    # Do not follow symlinks or special files, truncate inputs, or read unbounded files.
    if path.is_symlink() or not path.is_file():
        raise ValueError(f"Expected a regular non-symlink file: {path}")
    with path.open("rb") as stream:
        raw = stream.read(MAX_BYTES + 1)
    if len(raw) > MAX_BYTES or b"\0" in raw:
        raise ValueError(f"Expected UTF-8 text without NUL, at most {MAX_BYTES} bytes: {path}")
    return raw.decode("utf-8")


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"Duplicate JSON key: {key}")
        result[key] = value
    return result


def registry(data: dict | None) -> tuple[dict[str, set[str]], set[str]]:
    if data is None:
        return {}, set()
    if not isinstance(data, dict) or data.get("version") != 1 or isinstance(data.get("version"), bool):
        raise ValueError("Method registry requires version: 1")
    records = data.get("methods")
    if not isinstance(records, list) or len(records) > 1000:
        raise ValueError("methods must be an array of at most 1000 records")

    def strings(value, label):
        if (not isinstance(value, list) or len(value) > 1000
                or any(not isinstance(s, str) or not s.strip() or len(s) > 256 for s in value)):
            raise ValueError(f"{label} must be an array of bounded nonempty strings")
        return value

    names = {}
    for record in records:
        if not isinstance(record, dict):
            raise ValueError("Each method must be an object")
        aliases = strings(record.get("names"), "names")
        keys = strings(record.get("citekeys"), "citekeys")
        if not aliases or not keys or any(re.search(r"[\s{},\\]", key) for key in keys):
            raise ValueError("Each method needs names and literal citation keys")
        for alias in aliases:
            names.setdefault(alias, set()).update(keys)
    unresolved = data.get("ambiguous_unmapped", [])
    # Existing project registries may map names to their unresolved reason.
    if isinstance(unresolved, dict):
        strings(list(unresolved.values()), "ambiguous_unmapped reasons")
        unresolved = list(unresolved)
    ambiguous = set(strings(unresolved, "ambiguous_unmapped"))
    if ambiguous & names.keys():
        raise ValueError("A name cannot be both mapped and ambiguous_unmapped")
    return names, ambiguous


def group(text: str, pos: int, opener="{") -> tuple[int, int] | None:
    """Content span for a balanced literal TeX group, not a TeX interpreter."""
    if pos >= len(text) or text[pos] != opener:
        return None
    closer = "}" if opener == "{" else "]"
    depth, i = 1, pos + 1
    while i < len(text):
        if text[i] == "\\":
            i += 2
            continue
        if text[i] == opener:
            depth += 1
        elif text[i] == closer:
            depth -= 1
            if depth == 0:
                return pos + 1, i
        i += 1
    return None


def arguments(text, pos, count=1):
    required, optional = [], []
    while len(required) < count:
        while pos < len(text) and text[pos].isspace():
            pos += 1
        option = pos < len(text) and text[pos] == "["
        span = group(text, pos, "[" if option else "{")
        if span is None:
            break
        (optional if option else required).append(span)
        pos = span[1] + 1
    return required, optional


def views(text):
    """Offset-preserving source and visible-text views, plus citation/style spans."""
    source = list(text)

    def hide(chars, start, end):
        for i in range(start, end):
            if chars[i] != "\n":
                chars[i] = " "

    for match in re.finditer(r"\\begin\{(verbatim\*?|lstlisting|minted)\}.*?\\end\{\1\}|\\verb\*?([^A-Za-z\s]).*?\2", text, re.S):
        hide(source, *match.span())
    comments = set()
    for match in re.finditer("%", text):
        if source[match.start()] == " ":
            continue
        backslashes, pos = 0, match.start() - 1
        while pos >= 0 and text[pos] == "\\":
            backslashes += 1
            pos -= 1
        if backslashes % 2 == 0:
            comments.add(match.start())
            end = text.find("\n", match.start())
            hide(source, match.start(), len(text) if end < 0 else end)
    clean = "".join(source)
    visible, citations, styles, titles = list(clean), [], [], []
    # Commands inside hidden literal arguments are not recursively interpreted.
    opaque = []
    for match in COMMAND.finditer(clean):
        if any(a <= match.start() < b for a, b in opaque):
            continue
        cmd = match[1]
        args, opts = arguments(clean, match.end(), 2 if cmd in {"href", "hypertarget", "texorpdfstring", "pdfbookmark"} else 1)
        if cmd in HEADINGS:
            titles.extend(args + opts)
        if cmd in CITATIONS | {"nocite"} and args:
            start, end = match.start(), args[0][1] + 1
            hide(visible, start, end)
            opaque.append((start, end))
            if cmd != "nocite":
                keys = [k.strip() for k in clean[slice(*args[0])].split(",") if k.strip()]
                citations.append((start, end, keys))
        elif cmd in HIDDEN and args:
            hide(visible, *args[0])
            opaque.append(args[0])
        elif cmd in {"href", "hypertarget"} and args:
            hide(visible, *args[0])
            opaque.append(args[0])
        elif cmd == "texorpdfstring" and len(args) == 2:
            hide(visible, *args[1])
            opaque.append(args[1])
        elif cmd == "pdfbookmark":
            for span in args + opts:
                hide(visible, *span)
            opaque.extend(args + opts)
        elif cmd == "hyperref":
            for span in opts:
                hide(visible, *span)
        elif cmd in FORMATTING and args:
            styles.append(args[0])
        # A command's name is an identifier; its display arguments stay visible.
        hide(visible, *match.span())
    for match in re.finditer(r"https?://[^\s{}]+|[A-Za-z0-9_./-]+\.(?:tex|py|csv|json|pdf|bib|ya?ml|xlsx|md)\b", clean):
        hide(visible, *match.span())
    return clean, "".join(visible), citations, styles, comments, titles


def source_view(text: str) -> str:
    """Source with comments/verbatim blanked at their original offsets (API v1)."""
    return views(text)[0]


def scan(text: str, filename="<text>", *, methods=None, separate_attribution=False):
    names, ambiguous = registry(methods)
    clean, visible, cites, styles, comments, titles = views(text)
    findings, exceptions, used = [], [], set()
    line_starts = [0] + [m.end() for m in re.finditer("\n", text)]

    def emit(start, end, rule, severity, keys=(), method=None):
        line = bisect.bisect_right(line_starts, start)
        findings.append(dict(file=filename, line=line, column=start - line_starts[line - 1] + 1,
                             start=start, end=end, text=text[start:end], rule=rule,
                             severity=severity, keys=sorted(keys), method=method,
                             context=("visible-title" if any(a <= start < b for a, b in titles) else "body") if method else None))

    markers = [m for m in MARKER.finditer(text) if text.index("%", m.start(), m.end()) in comments]
    groups = []
    for cite in cites:
        if groups and re.fullmatch(r"[\s~,，;；]*", clean[groups[-1][-1][1]:cite[0]]):
            groups[-1].append(cite)
        else:
            groups.append([cite])
    for batch in groups:
        keys = set(k for _, _, ks in batch for k in ks)
        if len(keys) < 2:
            continue
        start, end = batch[0][0], batch[-1][1]
        matched = False
        for i, marker in enumerate(markers):
            gap = text[marker.end():start]
            if (i not in used and marker.end() < start and gap.count("\n") == 1
                    and set(k.strip() for k in marker[1].split(",")) == keys
                    and not any(marker.end() < c[0] < start for c in cites)):
                used.add(i)
                exceptions.append(dict(file=filename, keys=sorted(keys), reason=marker[2].strip(),
                                       status="documented_not_semantically_verified"))
                matched = True
                break
        if not matched:
            emit(start, end, "citation-group", "error" if separate_attribution else "warning", keys)
    for i, marker in enumerate(markers):
        if i not in used:
            emit(*marker.span(), "unused-shared-claim", "warning")

    if names or ambiguous:
        pattern = re.compile(r"(?<![A-Za-z0-9_])(?:" + "|".join(re.escape(n) for n in sorted(names.keys() | ambiguous, key=lambda n: (-len(n), n))) + r")(?![A-Za-z_])")
        by_start = {start: (end, keys) for start, end, keys in cites}
        for match in pattern.finditer(visible):
            name, start, end = match.group(), match.start(), match.end()
            if name in ambiguous:
                emit(start, end, "ambiguous-method", "warning", method=name)
                continue
            if re.match(r"[-+][A-Za-z]|[0-9]", visible[end:]):
                emit(start, end, "unregistered-variant-or-number", "warning", names[name], name)
                continue
            pos = end
            while True:
                spacing = re.match(r"(?:\s|~|\\protect\b\s*|\\[,;! ])*", clean[pos:])
                pos += spacing.end()
                if any(a <= start and b == pos for a, b in styles):
                    pos += 1
                else:
                    break
            immediate = by_start.get(pos)
            if immediate is None:
                emit(start, end, "missing-method-citation", "error", names[name], name)
            elif not (set(immediate[1]) & names[name]):
                emit(start, end, "method-key-mismatch", "error", names[name], name)
    return dict(findings=findings, exceptions=exceptions)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="+", type=Path, help="Explicit .tex files or directories (no recursive symlink traversal)")
    parser.add_argument("--methods", type=Path, help="Project-owned version:1 registry; enables per-occurrence identity policy")
    parser.add_argument("--separate-attribution", action="store_true", help="Explicit project policy: unreviewed citation groups are errors")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args(argv)
    try:
        data = json.loads(read_text(args.methods), object_pairs_hook=unique_object) if args.methods else None
        registry(data)
        files = set()
        for path in args.paths:
            if path.is_symlink() or not path.exists():
                raise ValueError(f"Missing or symlink input: {path}")
            for file in (path.rglob("*.tex") if path.is_dir() else [path]):
                if file.suffix != ".tex" or file.is_symlink():
                    raise ValueError(f"Expected a non-symlink .tex input: {file}")
                files.add(file)
        if not files or len(files) > 1000:
            raise ValueError("Provide between 1 and 1000 .tex files")
        results = [scan(read_text(p), str(p), methods=data, separate_attribution=args.separate_attribution) for p in sorted(files)]
    except (OSError, UnicodeError, ValueError) as error:
        print(str(error), file=sys.stderr)
        return 2
    findings = [f for r in results for f in r["findings"]]
    report = dict(schema_version=1, files_checked=len(files), findings=findings,
                  errors=sum(f["severity"] == "error" for f in findings),
                  warnings=sum(f["severity"] == "warning" for f in findings),
                  exceptions=[e for r in results for e in r["exceptions"]],
                  methods_checked=data is not None, separate_attribution=args.separate_attribution,
                  scope="finite_latex_structure_and_explicit_identities_only", context_review_required=True)
    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        for f in findings:
            print(f'{f["file"]}:{f["line"]}:{f["column"]}: {f["severity"]} {f["rule"]} {f["text"]}')
        print(f'{len(files)} files; {report["errors"]} errors; {report["warnings"]} warnings; contextual review required')
    return int(report["errors"] > 0)


if __name__ == "__main__":
    raise SystemExit(main())
