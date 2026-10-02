#!/usr/bin/env python3
"""Plan and render explicit, reproducible charts from prepared CSV data.

MIT License — Copyright (c) 2026 Shiqi Wang and metis contributors.
See the full license in the accompanying bar_chart.py.
"""
from __future__ import annotations

import argparse
import copy
import csv
from datetime import date
from decimal import Decimal, InvalidOperation
import io
import itertools
import json
import math
from pathlib import Path
import platform
import re
import shlex
import sys

import matplotlib
from matplotlib import colors, pyplot as plt
import numpy as np
import yaml

from bar_chart import load_profile, sha256

TYPES = {"categorical", "numeric", "temporal"}
MAX_ROWS = 10000
MAX_CANDIDATES = 24


def read_csv(path: Path):
    raw = path.read_bytes()
    reader = csv.reader(io.StringIO(raw.decode("utf-8-sig")), strict=True)
    header = next(reader, [])
    if not header or any(not key.strip() for key in header) or len(set(header)) != len(header):
        raise ValueError("CSV requires unique, nonempty column names.")
    if len(header) > 60:
        raise ValueError("Select at most 60 columns before planning; no columns were dropped.")
    records = []
    for number, fields in enumerate(reader, 2):
        if len(fields) != len(header):
            raise ValueError(f"CSV record {number}: field count differs from header.")
        records.append(dict(zip(header, fields)))
        if len(records) > MAX_ROWS:
            raise ValueError(f"More than {MAX_ROWS} rows: select an explicit scope; no sampling was performed.")
    if not records:
        raise ValueError("CSV requires at least one data row.")
    return raw, header, records


def is_number(text):
    try:
        number = Decimal(text)
        value = float(text)
        return number.is_finite() and math.isfinite(value) and Decimal(str(value)) == number
    except (ValueError, InvalidOperation):
        return False


def is_date(text):
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", text):
        return False
    try:
        date.fromisoformat(text)
        return True
    except ValueError:
        return False


def plan(path: Path, types=None):
    raw, header, records = read_csv(path)
    types = {} if types is None else types
    if not isinstance(types, dict) or any(key not in header or not isinstance(value, str) or value not in TYPES for key, value in types.items()):
        raise ValueError("--types must map existing column names to categorical, numeric or temporal.")
    assessment = {}
    for key in header:
        values = [row[key].strip() for row in records]
        present = [value for value in values if value]
        issues = []
        numeric = bool(present) and all(is_number(value) for value in present)
        temporal = bool(present) and all(is_date(value) for value in present)
        identifier = bool(re.search(r"(^|[_\s])(id|code|zip|postcode)($|[_\s])", key.lower()))
        guessed = "categorical" if identifier else "temporal" if temporal else "numeric" if numeric else "categorical"
        chosen = types.get(key, guessed)
        if len(present) != len(values):
            issues.append("Missing values: resolve explicitly before rendering this column.")
        if chosen == "numeric" and not numeric:
            issues.append("Not all values are finite, decimal-preserving plotting numbers.")
        if chosen == "temporal" and not temporal:
            issues.append("Temporal values must use valid YYYY-MM-DD dates.")
        if chosen == "categorical" and any(any(c in value for c in "\n\r\t") for value in values):
            issues.append("Category labels must be single-line text.")
        notes = []
        if key not in types:
            notes.append("Inferred from representation; confirm field meaning before choosing a chart.")
        if identifier:
            notes.append("Identifier-like column name: treated as categorical unless explicitly overridden.")
        if numeric and all(re.fullmatch(r"\d{4}", value) for value in present):
            notes.append("Four-digit numbers may be years or codes; no time semantics assumed.")
        assessment[key] = {"type": chosen, "declared": key in types, "unique": len(set(present)),
                           "missing": len(values) - len(present), "issues": issues, "notes": notes}
    usable = {kind: [key for key, info in assessment.items() if info["type"] == kind and not info["issues"]] for kind in TYPES}
    cats = [key for key in usable["categorical"] if assessment[key]["unique"] <= 20]
    nums, times = usable["numeric"], usable["temporal"]
    candidates = []

    def add(chart, x, y=None, group=None, value=None, reason="", score=0):
        selected = [key for key in (x, y, group, value) if key]
        groups = assessment[group]["unique"] if group else 1
        facet = bool(group and groups > 3)
        wide = facet or chart == "heatmap" or any(max(len(row[key]) for row in records) > 18 for key in selected if key in cats)
        spec = {"chart": chart, "x": x, "types": {key: assessment[key]["type"] for key in selected},
                "units": {key: None for key in selected if assessment[key]["type"] != "categorical"},
                "title": None, "layout": {"mode": "facet" if facet else "single", "width": "double" if wide else "single", "columns": 2 if facet else 1}}
        for name, field in (("y", y), ("group", group), ("value", value)):
            if field:
                spec[name] = field
        if chart == "histogram":
            spec["bins"] = 10
        candidates.append({"priority": score, "spec": spec, "reason": reason,
                           "layout_reason": "Separate series with shared scales." if facet else "Use wider output for long labels or a matrix." if wide else "One compact panel; inspect labels at final size.",
                           "profile_options": ["journal", "journal-grayscale", "journal-npg"],
                           "required_decisions": ["Confirm the comparison question and semantic types.", "Fill title and all units; select a profile.", "Inspect exported color and grayscale versions."]})

    def group_for(x, y):
        for group in cats:
            if group in (x, y) or not 2 <= assessment[group]["unique"] <= 6:
                continue
            pairs = [(row[x].strip(), row[group].strip()) for row in records]
            if len(set(pairs)) == len(pairs):
                return group
        return None

    for x in times:
        for y in nums:
            unique = assessment[x]["unique"] == len(records)
            group = None if unique else group_for(x, y)
            if unique or group:
                add("line", x, y, group, reason="Compare change over dates; points are sorted within each series and the order is recorded.", score=100)
    for x in cats:
        for y in nums:
            unique = assessment[x]["unique"] == len(records)
            group = None if unique else group_for(x, y)
            complete = group and len(records) == assessment[x]["unique"] * assessment[group]["unique"]
            if unique or complete:
                add("bar", x, y, group if complete else None, reason="Compare category magnitudes with a zero baseline; original category order is retained.", score=90)
                add("dot", x, y, group if complete else None, reason="Compare positions with less ink; report the visible axis range.", score=85)
            elif assessment[x]["unique"] < len(records):
                add("box", x, y, reason="Compare observed distributions; show observations with descriptive quartiles, not inferential uncertainty.", score=80)
    for x, y in itertools.combinations(nums, 2):
        group = next((key for key in cats if 2 <= assessment[key]["unique"] <= 6), None)
        add("scatter", x, y, group, reason="Inspect a numeric relationship; direction and causality are not inferred.", score=75)
        coordinates = [(row[group].strip() if group else None, Decimal(row[x])) for row in records]
        if len(set(coordinates)) == len(coordinates):
            add("line", x, y, group, reason="Alternative only if x is a meaningful ordered progression with unique x per series; otherwise use scatter.", score=20)
    for x in nums:
        add("histogram", x, reason="Inspect the distribution of a measured variable; explicit bins/counts are recorded. Do not use for IDs.", score=60)
    for x, y in itertools.combinations(cats, 2):
        pairs = [(row[x].strip(), row[y].strip()) for row in records]
        if len(set(pairs)) == len(pairs) == assessment[x]["unique"] * assessment[y]["unique"]:
            for value in nums:
                add("heatmap", x, y, value=value, reason="Compare a complete category matrix with a sequential color scale; use a diverging scale only with an explicitly meaningful center.", score=95)
    candidates.sort(key=lambda item: -item["priority"])
    for item in candidates:
        item.pop("priority")
    return {"schema_version": 1, "input": {"path": str(path.resolve()), "sha256": sha256(raw), "row_count": len(records)},
            "columns": assessment, "candidates": candidates[:MAX_CANDIDATES], "candidate_count": len(candidates),
            "candidate_limit": MAX_CANDIDATES, "status": "planning only; no figure rendered",
            "selection_policy": "Ranked structural options, not a decision about scientific intent. Templates require explicit title/units. No rows dropped or values changed.",
            "palette_guidance": {"journal": "Okabe-Ito categorical colors plus markers/line styles; sequential or diverging scales for values.",
                                 "journal-grayscale": "Gray fills with redundant shape/line encodings; inspect print-size separability.",
                                 "journal-npg": "ggsci Nature Reviews Cancer-inspired colors; not an official Nature palette or an accessibility guarantee."}}


def write_json(path, value):
    with path.open("x", encoding="utf-8") as stream:
        json.dump(value, stream, ensure_ascii=False, indent=2, allow_nan=False)
        stream.write("\n")


def grayscale_profile(profile):
    """Render the actual palette's relative luminance, preserving alpha.

    Linearize sRGB, compute relative luminance, then encode that luminance
    as neutral sRGB. This is a print-check aid, not a printer ICC proof.
    """
    def gray(color):
        red, green, blue, alpha = colors.to_rgba(color)
        linear = [channel / 12.92 if channel <= 0.04045 else ((channel + 0.055) / 1.055) ** 2.4 for channel in (red, green, blue)]
        luminance = sum(weight * channel for weight, channel in zip((0.2126, 0.7152, 0.0722), linear))
        encoded = 12.92 * luminance if luminance <= 0.0031308 else 1.055 * luminance ** (1 / 2.4) - 0.055
        return colors.to_hex((encoded, encoded, encoded, alpha), keep_alpha=True)

    result = copy.deepcopy(profile)
    result["palette"] = {role: gray(value) for role, value in profile["palette"].items()}
    style = result.get("chart_style", {})
    if "categorical" in style:
        style["categorical"] = [gray(color) for color in style["categorical"]]
    for field in ("sequential", "diverging"):
        if field in style:
            cmap = matplotlib.colormaps[style[field]] if isinstance(style[field], str) else colors.LinearSegmentedColormap.from_list("selected", style[field])
            style[field] = [gray(cmap(index / 255)) for index in range(256)]
    return result


def render(input_path: Path, spec_path: Path, profile_path: Path, output: Path):
    from render_chart import draw_chart
    if output.exists() or output.is_symlink():
        raise ValueError("Output already exists; choose a new directory.")
    raw, header, records = read_csv(input_path)
    spec_bytes = spec_path.read_bytes()
    spec = json.loads(spec_bytes)
    profile_bytes, profile = load_profile(profile_path)
    fig, details = draw_chart(header, records, spec, profile)
    gray = None
    try:
        gray, _ = draw_chart(header, records, spec, grayscale_profile(profile))
        output.mkdir(parents=True, exist_ok=False)
        exports = []
        for extension in profile["figure"]["format"]:
            target = output / f"chart.{extension}"
            with matplotlib.rc_context({"pdf.fonttype": 42, "ps.fonttype": 42, "svg.fonttype": "none"}), target.open("xb") as stream:
                fig.savefig(stream, format=extension, dpi=profile["figure"]["dpi"])
            exports.append({"file": target.name, "sha256": sha256(target.read_bytes())})
        gray_path = output / "chart-grayscale.png"
        with gray_path.open("xb") as stream:
            gray.savefig(stream, format="png", dpi=profile["figure"]["dpi"])
        exports.append({"file": gray_path.name, "sha256": sha256(gray_path.read_bytes())})
        snapshots = {"input.csv": raw, "spec.json": spec_bytes, "profile.yaml": profile_bytes}
        for name in ("chart.py", "bar_chart.py", "render_chart.py"):
            snapshots[name] = Path(__file__).with_name(name).read_bytes()
        for name, content in snapshots.items():
            with (output / name).open("xb") as stream:
                stream.write(content)
        command = ["uv", "run", "--with", f"matplotlib=={matplotlib.__version__}", "--with", f"PyYAML=={yaml.__version__}", "--with", f"numpy=={np.__version__}", "python", "-B", "chart.py", "render", "--input", "input.csv", "--spec", "spec.json", "--profile", "profile.yaml", "--output", "NEW_OUTPUT_DIRECTORY"]
        receipt = {"schema_version": 2, "input": {"path": str(input_path.resolve()), "sha256": sha256(raw), "row_count": len(records)},
                   "profile": {"name": profile.get("name"), "path": str(profile_path.resolve()), "sha256": sha256(profile_bytes)},
                   "spec": spec, "render": details, "exports": exports,
                   "snapshots": {name: sha256(content) for name, content in snapshots.items()},
                   "software": {"python": platform.python_version(), "matplotlib": matplotlib.__version__, "PyYAML": yaml.__version__, "numpy": np.__version__},
                   "font_sha256": {role: sha256(Path(path).read_bytes()) for role, path in details["fonts"].items()},
                   "rerun_working_directory": ". (the directory containing this receipt)", "rerun_command": shlex.join(command),
                   "visual_review": "Not performed by the script. Inspect final exports and chart-grayscale.png; record findings in requirements.md.",
                   "accessibility": "Grayscale preview converts the selected colors; it is not a color-vision-deficiency simulation or certification."}
        write_json(output / "receipt.json", receipt)
        with (output / "requirements.md").open("x", encoding="utf-8") as stream:
            stream.write("""# Chart requirements

| ID | Status | Evidence / unblock condition |
| --- | --- | --- |
| R1 Selection fits data and question | blocked | Confirm chosen chart answers the question, declared column types/units and any heatmap center |
| R2 Values and transformations | done | input.csv, spec.json and receipt.json: full source and recorded transformations |
| R3 Shared style and layout | done | profile.yaml and receipt.json: applied settings and font paths |
| R4 Final visual review | blocked | Inspect actual exports at final size: labels, overlap, scales, values, glyphs, color/grayscale distinction, and figure/panel titles and captions below their plots |
| R5 Reproducibility | done | All scripts/data/spec/profile snapshotted and hashed; run receipt command from this folder |
| R6 Palette limitations | blocked | Explain the selected categorical/sequential/diverging scale and any NPG provenance; record why inapplicable when appropriate |

Add task-specific requirements. Rendering alone does not establish visual acceptance.
Repair rounds used: 0 / 2. Stop when required checks pass; otherwise report the
remaining check and smallest unblock condition after the repair budget.
""")
        return receipt
    finally:
        plt.close(fig)
        if gray is not None:
            plt.close(gray)


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    commands = parser.add_subparsers(dest="command", required=True)
    planner = commands.add_parser("plan", help="Assess columns and propose chart/layout alternatives.")
    planner.add_argument("--input", type=Path, required=True)
    planner.add_argument("--output", type=Path, required=True)
    planner.add_argument("--types", default="{}", help="JSON map of known column semantics.")
    renderer = commands.add_parser("render", help="Render an explicitly selected JSON chart specification.")
    for flag in ("input", "spec", "profile", "output"):
        renderer.add_argument(f"--{flag}", type=Path, required=True)
    args = parser.parse_args()
    try:
        if args.command == "plan":
            result = plan(args.input, json.loads(args.types))
            write_json(args.output, result)
            print(f"Wrote {len(result['candidates'])} chart alternatives to {args.output}; templates require semantic decisions.")
        else:
            result = render(args.input, args.spec, args.profile, args.output)
            print(f"Rendered {result['input']['row_count']} source rows to {args.output}; semantic and visual review remain required.")
    except (OSError, ValueError, csv.Error, yaml.YAMLError) as exc:
        parser.exit(2, f"Chart not completed: {exc}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
