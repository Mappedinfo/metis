"""Validated descriptive chart rendering; styles are supplied by a profile.

MIT License. Copyright (c) 2026 Shiqi Wang and metis contributors.
See the accompanying bar_chart.py for the complete license text.
"""

from __future__ import annotations

from datetime import date
from decimal import Decimal, InvalidOperation
import math
import warnings

import matplotlib
matplotlib.use("Agg")
from matplotlib import cbook, colors, dates, markers as mpl_markers, pyplot as plt
import numpy as np

from bar_chart import resolve_font


_ORIGINAL, _RECORD = object(), object()

CHARTS = {"bar", "dot", "line", "scatter", "histogram", "box", "heatmap"}


def _text(value, description):
    if not isinstance(value, str) or not value.strip() or any(c in value for c in "\n\r\t"):
        raise ValueError(f"{description} must be nonempty, single-line text.")
    return value


def _number(value, description):
    try:
        exact, number = Decimal(value), float(value)
    except (ValueError, TypeError, InvalidOperation) as exc:
        raise ValueError(f"{description} must be a finite number.") from exc
    if not exact.is_finite() or not math.isfinite(number):
        raise ValueError(f"{description} must be a finite number.")
    if exact != 0 and number == 0:
        raise ValueError(f"{description}: nonzero value underflows in floating-point plotting.")
    if Decimal(str(number)) != exact:
        raise ValueError(f"{description}: floating-point precision cannot preserve this value.")
    return number


def _unique(values):
    return list(dict.fromkeys(values))


def _prepare(header, records, spec):
    if not isinstance(spec, dict):
        raise ValueError("Chart specification must be a JSON object.")
    allowed = {"chart", "x", "y", "value", "group", "types", "units", "title", "layout", "bins", "center"}
    unknown = set(spec) - allowed
    if unknown:
        raise ValueError(f"Unknown chart specification fields: {', '.join(sorted(unknown))}.")
    chart = spec.get("chart")
    if not isinstance(chart, str) or chart not in CHARTS:
        raise ValueError(f"Choose a supported chart: {', '.join(sorted(CHARTS))}.")
    if any(field in spec for field in ("center", "value")) and chart != "heatmap":
        raise ValueError("center and value apply only to a heatmap.")
    if "bins" in spec and chart != "histogram":
        raise ValueError("bins applies only to a histogram.")
    if chart == "histogram" and "y" in spec:
        raise ValueError("A histogram counts x observations; do not select a y column.")
    _text(spec.get("title"), "Title")
    if not records or len(records) > 10000:
        raise ValueError("Supply 1–10000 prepared rows; choose an explicit scope for larger tables.")
    if not header or len(header) != len(set(header)) or any(not isinstance(c, str) or not c.strip() for c in header):
        raise ValueError("CSV requires nonempty, unique column names.")
    columns = [spec.get("x")]
    if chart != "histogram":
        columns.append(spec.get("y"))
    if chart == "heatmap":
        columns.append(spec.get("value"))
    group = spec.get("group")
    if group is not None:
        if chart == "heatmap":
            raise ValueError("Heatmaps do not support group; supply one explicit complete grid.")
        columns.append(group)
    if any(not isinstance(c, str) for c in columns):
        raise ValueError("Chart column roles must name columns using strings.")
    if len(columns) != len(set(columns)) or any(c not in header for c in columns):
        raise ValueError("Select distinct, existing columns for every chart role.")
    types, units = spec.get("types", {}), spec.get("units", {})
    if not isinstance(types, dict) or not isinstance(units, dict):
        raise ValueError("types and units must be mappings.")
    expected = {
        "bar": [{"categorical"}, {"numeric"}], "dot": [{"categorical"}, {"numeric"}],
        "line": [{"numeric", "temporal"}, {"numeric"}],
        "scatter": [{"numeric"}, {"numeric"}], "histogram": [{"numeric"}],
        "box": [{"categorical"}, {"numeric"}],
        "heatmap": [{"categorical"}, {"categorical"}, {"numeric"}],
    }[chart] + ([{"categorical"}] if group else [])
    for column, allowed in zip(columns, expected):
        if not isinstance(types.get(column), str) or types[column] not in allowed:
            raise ValueError(f"Column {column!r} requires explicit type {' or '.join(sorted(allowed))}.")
        if types[column] in {"numeric", "temporal"}:
            _text(units.get(column), f"Unit for {column!r}")
    layout = spec.get("layout", {})
    if not isinstance(layout, dict):
        raise ValueError("layout must be a mapping.")
    if set(layout) - {"mode", "width", "columns"}:
        raise ValueError("layout supports only mode, width and columns.")
    mode, width, ncols = layout.get("mode", "single"), layout.get("width", "single"), layout.get("columns", 2)
    if not isinstance(mode, str) or not isinstance(width, str) or mode not in {"single", "facet"} or width not in {"single", "double"}:
        raise ValueError("layout.mode must be single/facet and layout.width single/double.")
    if isinstance(ncols, bool) or ncols not in (1, 2, 3):
        raise ValueError("layout.columns must be 1, 2 or 3.")
    if mode == "facet" and not group:
        raise ValueError("A facet layout requires a group column.")
    prepared = []
    for index, record in enumerate(records, 2):
        if not isinstance(record, dict) or set(record) != set(header):
            raise ValueError(f"CSV record {index}: field names do not match the header.")
        row = {_RECORD: index, _ORIGINAL: dict(record)}
        for column in columns:
            raw = _text(record[column], f"CSV record {index}, {column}")
            if types[column] == "numeric":
                row[column] = _number(raw, f"CSV record {index}, {column}")
            elif types[column] == "temporal":
                try:
                    day = date.fromisoformat(raw.strip())
                    if day.isoformat() != raw.strip():
                        raise ValueError("Noncanonical date")
                    row[column] = float(dates.date2num(day))
                except ValueError as exc:
                    raise ValueError(f"CSV record {index}: use ISO dates YYYY-MM-DD in {column!r}.") from exc
            else:
                row[column] = raw.strip()
        prepared.append(row)
    groups = _unique(row[group] for row in prepared) if group else [None]
    if len(groups) > 6:
        raise ValueError("Use at most 6 facets or overlaid groups; choose an explicit scope.")
    for column in columns:
        if types[column] == "categorical" and column != group and len(_unique(row[column] for row in prepared)) > 20:
            raise ValueError(f"More than 20 categories in {column!r}: select an explicit scope or another layout.")
        if types[column] in {"numeric", "temporal"}:
            values = [row[column] for row in prepared]
            if not math.isfinite(max(values) - min(values)):
                raise ValueError(f"Column {column!r} spans a nonfinite plotting range; rescale explicitly.")
    if chart in {"bar", "dot", "line", "heatmap"}:
        keys = [(row[spec["x"]], row[spec["y"]]) if chart == "heatmap"
                else (row[group] if group else None, row[spec["x"]]) for row in prepared]
        if len(keys) != len(set(keys)):
            raise ValueError("Duplicate chart coordinates: aggregate explicitly upstream or choose a distribution/scatter chart.")
    if chart == "heatmap":
        if len(prepared) != len(_unique(r[spec["x"]] for r in prepared)) * len(_unique(r[spec["y"]] for r in prepared)):
            raise ValueError("Heatmap requires a complete grid; no missing cell is filled automatically.")
        if width == "single" and max(len(_unique(r[spec[c]] for r in prepared)) for c in ("x", "y")) > 8:
            raise ValueError("Heatmaps above 8 categories on either axis require double width; inspect labels at final size.")
        if "center" in spec:
            center = _number(str(spec["center"]), "Heatmap center")
            values = [r[spec["value"]] for r in prepared]
            if not min(values) < center < max(values):
                raise ValueError("Diverging heatmap data must straddle the explicit center.")
    bins = spec.get("bins", 10)
    if chart == "histogram" and (isinstance(bins, bool) or not isinstance(bins, int) or not 1 <= bins <= 100):
        raise ValueError("Histogram bins must be an integer from 1 to 100.")
    return prepared, groups, {"mode": mode, "width": width, "columns": ncols}


def _style(profile, chart, group_count, facet):
    config, palette = profile.get("chart_style", {}), profile["palette"]
    if not isinstance(config, dict):
        raise ValueError("Profile chart_style must be a mapping.")
    defaults = [palette[key] for key in ("primary", "secondary", "accent", "warn", "neutral", "muted") if key in palette]
    categorical = config.get("categorical", defaults)
    markers = config.get("markers", ["o", "s", "^", "D", "v", "P", "X", "<"])
    styles = config.get("line_styles", ["-", "--", ":", "-."])
    hatches = config.get("hatches", ["", "//", "\\\\", "xx", "..", "++", "oo", "**"])
    if not isinstance(categorical, list) or not categorical or any(not colors.is_color_like(c) for c in categorical):
        raise ValueError("Profile chart_style.categorical must be a nonempty color list.")
    for key, values in (("markers", markers), ("line_styles", styles), ("hatches", hatches)):
        if not isinstance(values, list) or not values or any(not isinstance(v, str) for v in values):
            raise ValueError(f"Profile chart_style.{key} must be a nonempty string list.")
    if len(set(markers)) != len(markers) or any(m not in mpl_markers.MarkerStyle.markers or m in {"", " ", "None", "none"} for m in markers):
        raise ValueError("Profile chart_style.markers must contain distinct visible Matplotlib markers.")
    if len(set(styles)) != len(styles) or any(s not in {"-", "--", ":", "-."} for s in styles):
        raise ValueError("Profile chart_style.line_styles must contain distinct line patterns.")
    if len(set(hatches)) != len(hatches) or any(any(c not in '/\\|-+xoO.*' for c in h) for h in hatches):
        raise ValueError("Profile chart_style.hatches must contain distinct valid hatch patterns.")
    needed = 1 if facet else group_count
    channel = hatches if chart in {"bar", "box"} else styles if chart == "histogram" else markers
    if needed > len(categorical) or (needed > len(channel) and chart != "bar"):
        raise ValueError("Too many overlaid groups for this profile's colors and redundant encodings; use facets.")
    for key in ("sequential", "diverging"):
        value = config.get(key)
        if value is not None:
            if isinstance(value, list):
                if len(value) < 2 or any(not colors.is_color_like(c) for c in value):
                    raise ValueError(f"Profile chart_style.{key} must be a colormap name or at least two colors.")
            elif not isinstance(value, str) or value not in matplotlib.colormaps:
                raise ValueError(f"Profile chart_style.{key} must name an available Matplotlib colormap.")
    return {"categorical": categorical, "markers": markers, "line_styles": styles, "hatches": hatches, **{k: config.get(k) for k in ("sequential", "diverging")}}


def draw_chart(header: list[str], records: list[dict[str, str]], spec: dict, profile: dict):
    """Draw every selected row or a disclosed descriptive summary; never review it."""
    rows, groups, layout = _prepare(header, records, spec)
    chart, x, y, group = spec["chart"], spec["x"], spec.get("y"), spec.get("group")
    palette, typeface, figure = profile["palette"], profile["typography"], profile["figure"]
    facet = layout["mode"] == "facet"
    style = _style(profile, chart, len(groups), facet)
    axis_label = lambda column: f"{column} ({spec['units'][column]})" if spec["types"][column] in {"numeric", "temporal"} else column
    selected = {c for c in (x, y, group, spec.get("value")) if c is not None}
    body_text = "0123456789.-e+() Count" + "".join(sorted(selected)) + "".join(str(v) for c, v in spec.get("units", {}).items() if c in selected)
    body_text += "".join(str(value) for row in rows for key, value in row[_ORIGINAL].items() if key in selected)
    body_font = resolve_font(typeface["body"], body_text, "body")
    heading_font = resolve_font(typeface["heading"], spec["title"] + "".join(g or "" for g in groups), "heading")
    category_order = _unique(row[x] for row in rows) if spec["types"][x] == "categorical" else []
    panes = len(groups) if facet else 1
    ncols = min(layout["columns"], panes) if facet else 1
    nrows = math.ceil(panes / ncols)
    width_mm = figure["column_width_mm"] if layout["width"] == "single" else figure["max_width_mm"]
    if width_mm / ncols < 50:
        raise ValueError("Panels would be narrower than 50 mm; use double width or fewer columns.")
    panel_width = width_mm / 25.4 / ncols
    row_height = max(2.0, panel_width * .72)
    if chart in {"bar", "dot"}:
        row_height = max(row_height, (len(category_order) * (1 if facet else min(len(groups), 3)) + 5) * typeface["base_size_pt"] / 72)
    if chart == "heatmap":
        row_height = max(row_height, (len(_unique(row[y] for row in rows)) + 5) * typeface["base_size_pt"] / 72)
    details = {"mapping": {"x": x, "y": y, "group": group, "value": spec.get("value"), "types": spec["types"], "units": spec["units"], "row_count": len(rows), "rows": [{"csv_record": r[_RECORD], "values": r[_ORIGINAL]} for r in rows]},
               "transformations": [], "series": [], "layout": {**layout, "panels": panes, "columns": ncols, "rows": nrows, "shared_scales": True},
               "fonts": {"body": str(body_font.get_file()), "heading": str(heading_font.get_file())},
               "width_mm": width_mm, "height_mm": row_height * nrows * 25.4,
               "visual_review": "Not performed by the renderer; inspect final exports."}
    settings = {"text.parse_math": False, "axes.unicode_minus": False, "font.size": typeface["base_size_pt"], "axes.linewidth": figure["line_width_pt"], "pdf.fonttype": 42, "ps.fonttype": 42, "svg.fonttype": "none"}
    fig = None
    try:
        with matplotlib.rc_context(settings), warnings.catch_warnings():
            warnings.simplefilter("error", RuntimeWarning)
            warnings.filterwarnings("error", message="Glyph .* missing from font")
            warnings.filterwarnings("error", message="constrained_layout not applied.*")
            fig, grid = plt.subplots(nrows, ncols, figsize=(width_mm / 25.4, row_height * nrows), dpi=figure["dpi"], squeeze=False, sharex=facet, sharey=facet, layout="constrained")
            axes = list(grid.flat)
            fig.set_facecolor(palette["paper"])
            for unused in axes[panes:]:
                unused.remove()
            axes = axes[:panes]
            if facet:
                fig.suptitle(spec["title"], fontproperties=heading_font, fontsize=typeface["title_size_pt"], color=palette["ink"])
            edges = None
            if chart == "histogram":
                edges = np.histogram_bin_edges([r[x] for r in rows], bins=spec.get("bins", 10))
                if not np.isfinite(edges).all() or not np.all(np.diff(edges) > 0):
                    raise ValueError("Histogram range cannot form distinct finite bins; rescale explicitly.")
            for group_index, group_value in enumerate(groups):
                ax = axes[group_index] if facet else axes[0]
                subset = [r for r in rows if not group or r[group] == group_value]
                style_index = 0 if facet else group_index
                color = style["categorical"][style_index]
                marker, linestyle, hatch = style["markers"][style_index % len(style["markers"])], style["line_styles"][style_index % len(style["line_styles"])], style["hatches"][style_index % len(style["hatches"])]
                label = str(group_value) if group else None
                series = {"group": group_value, "source_records": [r[_RECORD] for r in subset], "count": len(subset)}
                if chart in {"bar", "dot"}:
                    offset = 0 if facet else (group_index - (len(groups) - 1) / 2) * .8 / len(groups)
                    positions = [category_order.index(r[x]) + offset for r in subset]
                    values = [r[y] for r in subset]
                    if chart == "bar":
                        bars = ax.barh(positions, values, height=.75 / (1 if facet else len(groups)), color=color, edgecolor=palette["ink"], linewidth=figure["line_width_pt"] / 2, hatch=hatch, label=label)
                        if any(bar.get_x() != 0 or bar.get_width() != value for bar, value in zip(bars, values)):
                            raise ValueError("Rendered bar geometry differs from its supplied value.")
                        series["geometry"] = {"baseline": 0, "widths": values}
                        if not facet and group and len(style["hatches"]) < len(groups):
                            ax.bar_label(bars, labels=[str(group_value)] * len(bars), padding=3, fontproperties=body_font, fontsize=typeface["label_size_pt"], color=palette["ink"])
                            ax.margins(x=.25)
                    else:
                        ax.scatter(values, positions, color=color, edgecolors=palette["ink"], linewidths=.5, marker=marker, label=label, s=24)
                    ax.set_yticks(range(len(category_order)), category_order)
                    ax.set_ylim(len(category_order) - .5, -.5)
                    ax.axvline(0, color=palette["muted"], linewidth=figure["line_width_pt"])
                    ax.set_xlabel(axis_label(y)); ax.set_ylabel(axis_label(x))
                    series["plotted_values"] = values
                elif chart in {"line", "scatter"}:
                    if chart == "line":
                        subset = sorted(subset, key=lambda r: r[x])
                        details["transformations"].append({"operation": "sort_for_line", "column": x, "group": group_value, "source_records": [r[_RECORD] for r in subset]})
                        ax.plot([r[x] for r in subset], [r[y] for r in subset], color=color, marker=marker, markeredgecolor=palette["ink"], markeredgewidth=.5, linestyle=linestyle, linewidth=figure["line_width_pt"], markersize=4, label=label)
                        if spec["types"][x] == "temporal":
                            locator = dates.AutoDateLocator(minticks=3, maxticks=6)
                            ax.xaxis.set_major_locator(locator)
                            ax.xaxis.set_major_formatter(dates.DateFormatter("%Y-%m-%d"))
                            ax.tick_params(axis="x", labelrotation=30)
                    else:
                        ax.scatter([r[x] for r in subset], [r[y] for r in subset], color=color, edgecolors=palette["ink"], linewidths=.5, marker=marker, s=24, label=label)
                    ax.set_xlabel(axis_label(x)); ax.set_ylabel(axis_label(y))
                    series["points"] = [[r[x], r[y]] for r in subset]
                elif chart == "histogram":
                    counts, _ = np.histogram([r[x] for r in subset], bins=edges)
                    if int(sum(counts)) != len(subset):
                        raise ValueError("Histogram bins failed to account for every selected row.")
                    ax.stairs(counts, edges, color=color, linestyle=linestyle, linewidth=figure["line_width_pt"] * 1.5, label=label)
                    ax.set_xlabel(axis_label(x)); ax.set_ylabel("Count")
                    ax.set_ylim(bottom=0)
                    series.update({"bin_edges": edges.tolist(), "bin_counts": counts.tolist(), "bin_policy": "Left-closed, right-open; final bin includes its right edge."})
                    details["transformations"].append({"operation": "histogram_counts", "group": group_value, "bins": len(counts), "counts": counts.tolist(), "edges": edges.tolist()})
                elif chart == "box":
                    series["boxes"] = []
                    for category in category_order:
                        members = [r for r in subset if r[x] == category]
                        if not members:
                            continue
                        values = [r[y] for r in members]
                        position = category_order.index(category) + (0 if facet else (group_index - (len(groups) - 1) / 2) * .8 / len(groups))
                        box_width = .65 / (1 if facet else len(groups))
                        stats = cbook.boxplot_stats(values, whis=1.5, autorange=False)[0]
                        artists = ax.bxp([stats], positions=[position], widths=box_width, patch_artist=True, showfliers=False, manage_ticks=False,
                                         boxprops={"facecolor": color, "edgecolor": palette["ink"], "hatch": hatch, "linewidth": figure["line_width_pt"]},
                                         medianprops={"color": palette["ink"]}, whiskerprops={"color": palette["ink"]}, capprops={"color": palette["ink"]})
                        if label and not series["boxes"]:
                            artists["boxes"][0].set_label(label)
                        # Fixed symmetric offsets expose coincident observations without random jitter.
                        offsets = np.linspace(-box_width * .22, box_width * .22, len(values)) if len(values) > 1 else [0]
                        ax.scatter([position + offset for offset in offsets], values, facecolors=palette["paper"], edgecolors=palette["ink"], marker=marker, s=10, linewidths=.5, zorder=3)
                        summary = {key: float(stats[key]) for key in ("q1", "med", "q3", "whislo", "whishi")}
                        summary.update({"category": category, "count": len(values), "fliers": stats["fliers"].tolist(), "source_records": [r[_RECORD] for r in members], "raw_values": values})
                        series["boxes"].append(summary)
                    ax.set_xticks(range(len(category_order)), category_order)
                    ax.set_xlabel(axis_label(x)); ax.set_ylabel(axis_label(y))
                    details["transformations"].append({"operation": "box_summary", "group": group_value, "quartiles": "NumPy percentile linear interpolation", "whiskers": "Most extreme observations within 1.5 IQR from Q1/Q3; all raw observations displayed.", "boxes": series["boxes"]})
                else:
                    y_order = _unique(row[y] for row in rows)
                    value = spec["value"]
                    lookup = {(r[x], r[y]): r[value] for r in rows}
                    matrix = np.array([[lookup[(xv, yv)] for xv in category_order] for yv in y_order])
                    diverging = "center" in spec
                    cmap_definition = style["diverging" if diverging else "sequential"]
                    if cmap_definition is None:
                        raise ValueError("Heatmaps require the selected profile's sequential/diverging colormap.")
                    cmap = colors.LinearSegmentedColormap.from_list("profile", cmap_definition) if isinstance(cmap_definition, list) else matplotlib.colormaps[cmap_definition]
                    norm = colors.TwoSlopeNorm(vcenter=float(spec["center"]), vmin=float(matrix.min()), vmax=float(matrix.max())) if diverging else colors.Normalize(vmin=float(matrix.min()), vmax=float(matrix.max()))
                    image = ax.imshow(matrix, cmap=cmap, norm=norm, aspect="auto", interpolation="nearest")
                    ax.set_xticks(range(len(category_order)), category_order); ax.set_yticks(range(len(y_order)), y_order)
                    ax.set_xlabel(axis_label(x)); ax.set_ylabel(axis_label(y))
                    colorbar = fig.colorbar(image, ax=ax, shrink=.85)
                    colorbar.set_label(axis_label(value))
                    if diverging:
                        ticks = [float(tick) for tick in colorbar.get_ticks() if matrix.min() <= tick <= matrix.max()]
                        colorbar.set_ticks(sorted(set(ticks + [float(spec["center"])])))
                    # Direct cell values remain interpretable without hue discrimination.
                    for yi, yv in enumerate(y_order):
                        for xi, xv in enumerate(category_order):
                            face = colors.to_rgb(cmap(norm(lookup[(xv, yv)])))
                            luminance = sum(weight * (channel / 12.92 if channel <= .04045 else ((channel + .055) / 1.055) ** 2.4) for channel, weight in zip(face, (.2126, .7152, .0722)))
                            text_color = palette["paper"] if luminance < .3 else palette["ink"]
                            ax.text(xi, yi, next(r[_ORIGINAL][value].strip() for r in rows if r[x] == xv and r[y] == yv), ha="center", va="center", color=text_color, fontproperties=body_font, fontsize=typeface["label_size_pt"])
                    series.update({"x_order": category_order, "y_order": y_order, "matrix": matrix.tolist(), "center": spec.get("center"), "annotated_cells": len(rows)})
                details["series"].append(series)
                ax.set_title(str(group_value) if facet else spec["title"], loc="left", fontproperties=heading_font, fontsize=typeface["title_size_pt"], color=palette["ink"])
            if group and not facet:
                legend = axes[0].legend(title=group, loc="upper left", bbox_to_anchor=(1.01, 1), borderaxespad=0, prop=body_font, frameon=False)
                legend.get_title().set_fontproperties(body_font)
                for text in legend.get_texts() + [legend.get_title()]:
                    text.set_fontsize(typeface["label_size_pt"]); text.set_color(palette["ink"])
            for ax in fig.axes:
                ax.set_facecolor(palette["paper"])
                ax.tick_params(axis="both", colors=palette["ink"], width=figure["line_width_pt"])
                for text in ax.get_xticklabels() + ax.get_yticklabels() + [ax.xaxis.label, ax.yaxis.label, ax.xaxis.get_offset_text(), ax.yaxis.get_offset_text()]:
                    text.set_fontproperties(body_font); text.set_fontsize(typeface["label_size_pt"]); text.set_color(palette["ink"])
                for key, spine in ax.spines.items():
                    spine.set_color(palette["ink"]); spine.set_visible(key not in {"top", "right"})
            fig.canvas.draw()
            if chart == "heatmap":
                ax, renderer = axes[0], fig.canvas.get_renderer()
                for text in ax.texts:
                    xi, yi = text.get_position()
                    left, bottom = ax.transData.transform((xi - .47, yi + .47))
                    right, top = ax.transData.transform((xi + .47, yi - .47))
                    bounds = text.get_window_extent(renderer)
                    if bounds.x0 < left or bounds.x1 > right or bounds.y0 < bottom or bounds.y1 > top:
                        raise ValueError("Heatmap cell labels exceed their cells; choose wider output, fewer categories, or an explicitly rounded input.")
            details["axes"] = [{"xlim": list(ax.get_xlim()), "ylim": list(ax.get_ylim()), "lines": len(ax.lines), "collections": len(ax.collections), "patches": len(ax.patches)} for ax in axes]
            details["plotted_rows"] = sum(s["count"] for s in details["series"])
            details["encoding"] = {"color_source": "profile.chart_style.categorical or profile.palette", "redundant": "Separate labeled panels" if facet else "Direct group labels" if chart == "bar" and len(style["hatches"]) < len(groups) else "Hatches" if chart in {"bar", "box"} else "Line patterns" if chart == "histogram" else "Annotated cells and colorbar" if chart == "heatmap" else "Markers", "shared_histogram_bins": chart == "histogram"}
        return fig, details
    except (UserWarning, RuntimeWarning) as exc:
        if fig is not None:
            plt.close(fig)
        raise ValueError(f"Rendering failed: {exc}") from exc
    except Exception:
        if fig is not None:
            plt.close(fig)
        raise
