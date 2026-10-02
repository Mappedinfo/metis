#!/usr/bin/env python3
"""Render a prepared CSV without altering its rows or values.

MIT License
Copyright (c) 2026 Shiqi Wang and metis contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""

from __future__ import annotations

import argparse
import csv
from decimal import Decimal, InvalidOperation
import hashlib
import io
import json
import math
from pathlib import Path
import platform
import shlex
import sys
import warnings

import matplotlib

matplotlib.use("Agg")
from matplotlib import colors, font_manager, ft2font, pyplot as plt
import yaml


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def load_table(path: Path, category: str, value: str) -> tuple[bytes, list[dict]]:
    raw = path.read_bytes()
    reader = csv.reader(io.StringIO(raw.decode("utf-8-sig")), strict=True)
    header = next(reader, [])
    if not header or len(set(header)) != len(header) or any(not x.strip() for x in header):
        raise ValueError("CSV requires nonempty, unique column names.")
    if category == value or category not in header or value not in header:
        raise ValueError("Select two different, existing category and value columns.")
    category_index, value_index = header.index(category), header.index(value)
    rows, seen = [], set()
    for record, fields in enumerate(reader, start=2):
        if len(fields) != len(header):
            raise ValueError(f"CSV record {record}: field count does not match the header.")
        label, number = fields[category_index], fields[value_index]
        if not label.strip() or label.strip() in seen:
            raise ValueError(f"CSV record {record}: category is blank or duplicated.")
        if any(character in label for character in "\r\n\t"):
            raise ValueError(f"CSV record {record}: category must fit on one text line.")
        try:
            exact = Decimal(number)
            numeric = float(number)
        except (ValueError, InvalidOperation) as exc:
            raise ValueError(f"CSV record {record}: value must be a finite number.") from exc
        if not exact.is_finite() or not math.isfinite(numeric):
            raise ValueError(f"CSV record {record}: value must be a finite number.")
        if exact != 0 and numeric == 0:
            raise ValueError(f"CSV record {record}: nonzero value underflows to zero in floating-point plotting.")
        if Decimal(str(numeric)) != exact:
            raise ValueError(f"CSV record {record}: floating-point precision cannot preserve this value; choose an agreed precision or another tool.")
        seen.add(label.strip())
        rows.append({"csv_record": record, "category": label, "value": numeric,
                     "original_value": number})
        if len(rows) > 20:
            raise ValueError("More than 20 rows: choose an explicit scope or another layout.")
    if not rows:
        raise ValueError("CSV requires at least one data row.")
    return raw, rows


def load_profile(path: Path) -> tuple[bytes, dict]:
    raw = path.read_bytes()
    profile = yaml.safe_load(raw)
    if not isinstance(profile, dict):
        raise ValueError("Profile must be a YAML mapping.")
    for section in ("palette", "typography", "figure"):
        if not isinstance(profile.get(section), dict):
            raise ValueError(f"Profile requires a {section} mapping.")
    for role in ("primary", "ink", "paper", "muted"):
        if not colors.is_color_like(profile["palette"].get(role)):
            raise ValueError(f"Profile palette.{role} must be a valid color.")
    for role in ("body", "heading"):
        if not isinstance(profile["typography"].get(role), str) or not profile["typography"][role].strip():
            raise ValueError(f"Profile typography.{role} must name a font stack.")
    numeric_keys = {"typography": ("base_size_pt", "label_size_pt", "title_size_pt"),
                    "figure": ("dpi", "column_width_mm", "max_width_mm", "line_width_pt")}
    for section, keys in numeric_keys.items():
        for key in keys:
            number = profile[section].get(key)
            if isinstance(number, bool) or not isinstance(number, (int, float)) or not math.isfinite(number) or number <= 0:
                raise ValueError(f"Profile {section}.{key} must be a positive finite number.")
    figure = profile["figure"]
    for field in ("title_position", "caption_position", "panel_title_position"):
        if figure.get(field, "below") != "below":
            raise ValueError(f"Profile figure.{field} must be below under the shared figure convention.")
    if figure["column_width_mm"] > figure["max_width_mm"]:
        raise ValueError("Profile column width exceeds its maximum width.")
    formats = figure.get("format")
    if not isinstance(formats, list) or not formats or any(x not in ("pdf", "png", "svg") for x in formats) or len(formats) != len(set(formats)):
        raise ValueError("Profile figure.format must list unique formats from pdf, png, svg.")
    return raw, profile


def resolve_font(stack: str, text: str, role: str) -> font_manager.FontProperties:
    required = {ord(character) for character in text if not character.isspace()}
    families = [name.strip().strip("\"'") for name in stack.split(",")]
    for family in families:
        try:
            path = font_manager.findfont(font_manager.FontProperties(family=[family]), fallback_to_default=False)
            if required.issubset(ft2font.FT2Font(path).get_charmap()):
                return font_manager.FontProperties(fname=path)
        except (ValueError, RuntimeError, OSError):
            continue
    raise ValueError(
        f"Profile {role} font stack cannot cover the supplied text. Install an appropriate "
        "font named in the profile, or use a named profile variant including a CJK font "
        "for Chinese (for example Noto Sans CJK SC). No font was substituted automatically."
    )


def add_figure_footer(fig, title: str, caption: str | None, profile: dict, heading_font):
    """Reserve a bottom title/caption block; wrap using the actual font metrics."""
    for field in ("title_position", "caption_position", "panel_title_position"):
        if profile["figure"].get(field, "below") != "below":
            raise ValueError(f"Profile figure.{field} must be below under the shared figure convention.")
    font = heading_font.copy()
    size = profile["typography"]["title_size_pt"]
    font.set_size(size)
    renderer = fig.canvas.get_renderer()
    available = fig.get_figwidth() * fig.dpi * .92
    lines = []
    content = title + ("\n" + caption if caption else "")
    for paragraph in content.split("\n"):
        current = ""
        for character in paragraph:
            trial = current + character
            if current and renderer.get_text_width_height_descent(trial, font, ismath=False)[0] > available:
                split = current.rfind(" ")
                if split > 0:
                    lines.append(current[:split])
                    current = current[split + 1:] + character
                else:
                    lines.append(current)
                    current = character
            else:
                current = trial
        lines.append(current.rstrip())
    rendered = "\n".join(lines)
    fig.set_figheight(fig.get_figheight() + len(lines) * size / 72 * 1.3 + .12)
    footer = fig.supxlabel(rendered, fontproperties=font, fontsize=size,
                           color=profile["palette"]["ink"], ha="center")
    footer.set_gid("metis-figure-title-caption")
    return {"position": "below", "title": title, "caption": caption, "rendered_text": rendered}


def make_figure(rows: list[dict], profile: dict, value: str, unit: str, title: str, caption: str | None = None):
    palette, typography, style = profile["palette"], profile["typography"], profile["figure"]
    xlabel = f"{value} ({unit})"
    body_font = resolve_font(typography["body"], xlabel + "0123456789.-e+" + "".join(row["category"] + row["original_value"] for row in rows), "body")
    title_font = resolve_font(typography["heading"], title + (caption or ""), "heading")
    width = style["column_width_mm"] / 25.4
    height = max(width * 0.65, (len(rows) + 5) * typography["base_size_pt"] / 72)
    settings = {"text.parse_math": False, "axes.unicode_minus": False,
                "font.size": typography["base_size_pt"], "axes.linewidth": style["line_width_pt"]}
    with matplotlib.rc_context(settings):
        fig, ax = plt.subplots(figsize=(width, height), dpi=style["dpi"], layout="constrained")
        fig.set_facecolor(palette["paper"])
        ax.set_facecolor(palette["paper"])
        bars = ax.barh(range(len(rows)), [row["value"] for row in rows], color=palette["primary"])
        ax.set_yticks(range(len(rows)), [row["category"] for row in rows])
        ax.invert_yaxis()
        ax.set_xlabel(xlabel, fontproperties=body_font, fontsize=typography["label_size_pt"], color=palette["ink"])
        add_figure_footer(fig, title, caption, profile, title_font)
        ax.axvline(0, color=palette["muted"], linewidth=style["line_width_pt"])
        ax.margins(x=0.2)
        ax.bar_label(bars, labels=[row["original_value"].strip() for row in rows], padding=3,
                     fontproperties=body_font, fontsize=typography["label_size_pt"], color=palette["ink"])
        ax.tick_params(axis="both", colors=palette["ink"], width=style["line_width_pt"])
        for tick in ax.get_xticklabels() + ax.get_yticklabels():
            tick.set_fontproperties(body_font)
            tick.set_fontsize(typography["label_size_pt"])
        ax.xaxis.get_offset_text().set_fontproperties(body_font)
        ax.xaxis.get_offset_text().set_fontsize(typography["label_size_pt"])
        for name, spine in ax.spines.items():
            spine.set_color(palette["ink"])
            spine.set_visible(name == "bottom")
        for row, bar in zip(rows, bars):
            if bar.get_x() != 0 or bar.get_width() != row["value"]:
                raise ValueError("Rendered bar geometry differs from the supplied values.")
        with warnings.catch_warnings():
            warnings.filterwarnings("error", message="Glyph .* missing from font")
            warnings.filterwarnings("error", message="constrained_layout not applied.*")
            try:
                fig.canvas.draw()
            except UserWarning as exc:
                plt.close(fig)
                raise ValueError(f"Rendering failed: {exc}") from exc
    fonts = {"body": str(body_font.get_file()), "heading": str(title_font.get_file())}
    return fig, ax, fonts


def generate(input_path: Path, category: str, value: str, unit: str,
             title: str, profile_path: Path, output: Path, caption: str | None = None) -> dict:
    if output.exists() or output.is_symlink():
        raise ValueError(f"Output already exists; choose a new directory: {output}")
    if not unit.strip() or not title.strip() or any(char in unit + title for char in "\r\n\t"):
        raise ValueError("Supply a nonempty single-line unit and title; use 'dimensionless' when appropriate.")
    if caption is not None and (not isinstance(caption, str) or not caption.strip() or any(char in caption for char in "\r\t")):
        raise ValueError("Caption must be nonempty text; line breaks are supported.")
    input_bytes, rows = load_table(input_path, category, value)
    profile_bytes, profile = load_profile(profile_path)
    fig, ax, fonts = make_figure(rows, profile, value, unit, title, caption)
    try:
        output.mkdir(parents=True, exist_ok=False)
        exports = []
        for extension in profile["figure"]["format"]:
            target = output / f"chart.{extension}"
            with matplotlib.rc_context({"pdf.fonttype": 42, "svg.fonttype": "none"}), target.open("xb") as stream:
                fig.savefig(stream, format=extension, dpi=profile["figure"]["dpi"])
            exports.append({"file": target.name, "sha256": sha256(target.read_bytes())})
        script_bytes = Path(__file__).read_bytes()
        with (output / "bar_chart.py").open("xb") as stream:
            stream.write(script_bytes)
        with (output / "profile.yaml").open("xb") as stream:
            stream.write(profile_bytes)
        command = ["uv", "run", "--with", f"matplotlib=={matplotlib.__version__}", "--with", f"PyYAML=={yaml.__version__}",
                   "python", str((output / "bar_chart.py").resolve()), "--input", str(input_path.resolve()),
                   "--category", category, "--value", value, "--unit", unit, "--title", title,
                   "--profile", str((output / "profile.yaml").resolve()), "--output", "NEW_OUTPUT_DIRECTORY"]
        if caption is not None:
            command += ["--caption", caption]
        receipt = {
            "schema_version": 1, "input": {"path": str(input_path.resolve()), "sha256": sha256(input_bytes)},
            "profile": {"path": str(profile_path.resolve()), "sha256": sha256(profile_bytes), "name": profile.get("name")},
            "mapping": {"category_column": category, "value_column": value, "unit": unit,
                        "row_count": len(rows), "rows": rows},
            "transformations": [], "data_policy": "No rows dropped, imputed, aggregated, sorted or normalized; finite decimals round-trip through float text without changing their decimal value, and original numeric labels are retained.",
            "geometry_check": "passed: each bar starts at zero with its supplied signed value",
            "render": {"title": title, "caption": caption, "title_position": "below", "caption_position": "below", "width_mm": profile["figure"]["column_width_mm"],
                       "height_mm": float(fig.get_figheight() * 25.4), "dpi": profile["figure"]["dpi"],
                       "formats": profile["figure"]["format"], "fonts": fonts},
            "exports": exports, "script_sha256": sha256(script_bytes),
            "software": {"python": platform.python_version(), "matplotlib": matplotlib.__version__, "PyYAML": yaml.__version__},
            "rerun_command": shlex.join(command),
            "visual_review": "Not performed by the script; record actual inspection in requirements.md."
        }
        with (output / "receipt.json").open("x", encoding="utf-8") as stream:
            json.dump(receipt, stream, ensure_ascii=False, indent=2, allow_nan=False)
            stream.write("\n")
        ledger = """# Chart requirements

Add any further accepted user requirements. `done` requires evidence;
`blocked` names the missing check. Do not mark visual review from rendering alone.

| ID | Status | Evidence / unblock condition |
| --- | --- | --- |
| R1 Prepared input preserved | done | receipt.json: input hash and complete row mapping |
| R2 Original values and order | done | receipt.json: row mapping and geometry check |
| R3 Profile applied | done | receipt.json: profile hash, resolved fonts, export settings and hashes |
| R4 Final visual inspection | blocked | View the final export; record labels, glyphs, clipping, values, zero baseline, and title/caption below the plot |
| R5 Reproducible artifact | done | bar_chart.py, profile.yaml and receipt.json rerun_command; original CSV must remain available |

Repair rounds used: 0 / 2.
Stop condition: visual inspection still required; no full acceptance claimed.
"""
        with (output / "requirements.md").open("x", encoding="utf-8") as stream:
            stream.write(ledger)
        return receipt
    finally:
        plt.close(fig)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    for flag in ("input", "category", "value", "unit", "title", "profile", "output"):
        parser.add_argument(f"--{flag}", required=True, type=Path if flag in ("input", "profile", "output") else str)
    parser.add_argument("--caption", help="Optional figure caption placed below the plot with its title.")
    args = parser.parse_args()
    try:
        receipt = generate(args.input, args.category, args.value, args.unit, args.title, args.profile, args.output, args.caption)
    except (OSError, ValueError, csv.Error, yaml.YAMLError) as exc:
        parser.exit(2, f"Chart not completed: {exc}\n")
    print(f"Rendered {receipt['mapping']['row_count']} rows to {args.output}. Visual inspection is still required.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
