"""Behavioral evidence for descriptive chart families and input-loss boundaries."""

from copy import deepcopy
import json
from pathlib import Path
import sys
import unittest

from matplotlib import colors, pyplot as plt
import yaml

SKILL_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SKILL_ROOT / "scripts"))
from render_chart import draw_chart


class RenderChartTests(unittest.TestCase):
    def setUp(self):
        self.profile = yaml.safe_load((SKILL_ROOT.parents[1] / "profiles/journal.yaml").read_text())
        self.profile["typography"]["body"] = "DejaVu Sans"
        self.profile["typography"]["heading"] = "DejaVu Sans"
        # Explicit fixture profile, independent of changes to published recommendations.
        self.profile["chart_style"] = {
            "categorical": [self.profile["palette"]["primary"], self.profile["palette"]["secondary"]],
            "markers": ["o", "s"], "line_styles": ["-", "--"], "hatches": ["", "//"],
            "sequential": "viridis", "diverging": "BrBG",
        }
        self.addCleanup(plt.close, "all")

    def render(self, chart, data, **extra):
        types = {"x": "categorical", "y": "numeric"}
        if chart in {"line", "scatter", "histogram"}:
            types["x"] = "numeric"
        if chart == "heatmap":
            types.update(y="categorical", value="numeric")
        spec = {"chart": chart, "x": "x", "title": "Literal $x$ chart", "types": types,
                "units": {"x": "seconds", "y": "points", "value": "points"}}
        if chart != "histogram":
            spec["y"] = "y"
        if chart == "heatmap":
            spec["value"] = "value"
        if "group" in data[0]:
            spec["group"] = "group"; spec["types"]["group"] = "categorical"
        spec.update(extra)
        records = [{key: str(value) for key, value in row.items()} for row in data]
        fig, details = draw_chart(list(records[0]), records, spec, self.profile)
        json.dumps(details, allow_nan=False)
        return fig, details

    def test_bar_signed_values_and_dot_coordinates_preserve_order(self):
        data = [{"x": "B", "y": 3}, {"x": "A", "y": -2}, {"x": "C", "y": 0}]
        fig, result = self.render("bar", data)
        self.assertEqual([p.get_x() for p in fig.axes[0].patches], [0, 0, 0])
        self.assertEqual([p.get_width() for p in fig.axes[0].patches], [3, -2, 0])
        self.assertEqual([t.get_text() for t in fig.axes[0].get_yticklabels()], ["B", "A", "C"])
        self.assertEqual(result["transformations"], [])
        fig, result = self.render("dot", data)
        self.assertEqual(fig.axes[0].collections[0].get_offsets().tolist(), [[3, 0], [-2, 1], [0, 2]])
        self.assertEqual(result["plotted_rows"], 3)

    def test_line_sort_is_explicit_and_repeated_coordinates_fail(self):
        fig, result = self.render("line", [{"x": 3, "y": 30}, {"x": 1, "y": 10}, {"x": 2, "y": 20}])
        self.assertEqual(fig.axes[0].lines[0].get_xdata().tolist(), [1, 2, 3])
        self.assertEqual(result["transformations"][0]["source_records"], [3, 4, 2])
        self.assertEqual([r["csv_record"] for r in result["mapping"]["rows"]], [2, 3, 4])
        with self.assertRaisesRegex(ValueError, "Duplicate chart coordinates"):
            self.render("line", [{"x": 1, "y": 2}, {"x": 1, "y": 3}])

    def test_temporal_lines_accept_only_iso_dates(self):
        types = {"x": "temporal", "y": "numeric"}
        fig, result = self.render("line", [{"x": "2026-01-03", "y": 2}, {"x": "2026-01-01", "y": 1}], types=types, units={"x": "date", "y": "points"})
        self.assertLess(result["series"][0]["points"][0][0], result["series"][0]["points"][1][0])
        self.assertTrue(any("2026-" in text.get_text() for text in fig.axes[0].get_xticklabels()))
        with self.assertRaisesRegex(ValueError, "ISO dates"):
            self.render("line", [{"x": "01/02/2026", "y": 2}], types=types)

    def test_scatter_preserves_repeated_measurements(self):
        fig, result = self.render("scatter", [{"x": 1, "y": 2}, {"x": 1, "y": 2}, {"x": 2, "y": -1}])
        self.assertEqual(fig.axes[0].collections[0].get_offsets().tolist(), [[1, 2], [1, 2], [2, -1]])
        self.assertEqual(result["plotted_rows"], 3)

    def test_histogram_discloses_shared_bins_and_accounts_for_edges(self):
        _, result = self.render("histogram", [{"x": 0, "group": "A"}, {"x": 1, "group": "A"}, {"x": 2, "group": "B"}, {"x": 4, "group": "B"}], bins=2)
        self.assertEqual(result["series"][0]["bin_edges"], [0, 2, 4])
        self.assertEqual(result["series"][0]["bin_counts"], [2, 0])
        self.assertEqual(result["series"][1]["bin_counts"], [0, 2])
        self.assertEqual(sum(sum(s["bin_counts"]) for s in result["series"]), 4)
        self.assertTrue(result["encoding"]["shared_histogram_bins"])

    def test_box_has_all_raw_observations_and_reproducible_summary(self):
        fig, result = self.render("box", [{"x": "A", "y": value} for value in [1, 2, 3, 4, 20]])
        summary = result["series"][0]["boxes"][0]
        self.assertEqual([summary[k] for k in ("q1", "med", "q3", "whislo", "whishi")], [2, 3, 4, 1, 4])
        self.assertEqual(summary["fliers"], [20])
        self.assertEqual(fig.axes[0].collections[0].get_offsets()[:, 1].tolist(), [1, 2, 3, 4, 20])
        fig2, _ = self.render("box", [{"x": "A", "y": value} for value in [1, 2, 3, 4, 20]])
        self.assertEqual(fig.axes[0].collections[0].get_offsets().tolist(), fig2.axes[0].collections[0].get_offsets().tolist())

    def test_heatmap_complete_grid_colorbar_and_explicit_divergence(self):
        data = [{"x": "A", "y": "R", "value": -2}, {"x": "B", "y": "R", "value": 0}, {"x": "A", "y": "S", "value": 1}, {"x": "B", "y": "S", "value": 4}]
        fig, result = self.render("heatmap", data, center=0)
        self.assertEqual(fig.axes[0].images[0].get_array().tolist(), [[-2, 0], [1, 4]])
        self.assertEqual(result["series"][0]["annotated_cells"], 4)
        self.assertEqual(len(fig.axes), 2)
        self.assertEqual(fig.axes[1].get_ylabel(), "value (points)")
        self.assertEqual(fig.axes[0].images[0].norm.vcenter, 0)
        with self.assertRaisesRegex(ValueError, "complete grid"):
            self.render("heatmap", data[:-1])
        with self.assertRaisesRegex(ValueError, "straddle"):
            self.render("heatmap", data, center=10)
        with self.assertRaisesRegex(ValueError, "Duplicate"):
            self.render("heatmap", data + data[:1])

    def test_facet_layout_shared_limits_and_source_order(self):
        data = [{"x": "A", "y": 1, "group": "Second"}, {"x": "B", "y": 100, "group": "First"}]
        fig, result = self.render("bar", data, layout={"mode": "facet", "width": "double", "columns": 2})
        self.assertEqual([t.get_text() for ax in fig.axes for t in ax.texts if t.get_gid() == "metis-panel-caption"], ["(a) Second", "(b) First"])
        self.assertTrue(all(not ax.get_title(loc="left") for ax in fig.axes))
        self.assertEqual(fig.axes[0].get_xlim(), fig.axes[1].get_xlim())
        self.assertEqual(result["width_mm"], self.profile["figure"]["max_width_mm"])
        self.assertEqual(result["layout"]["panels"], 2)
        self.assertEqual(result["plotted_rows"], 2)
        with self.assertRaisesRegex(ValueError, "narrower than 50"):
            self.render("bar", data, layout={"mode": "facet", "width": "single", "columns": 2})

    def test_redundant_encodings_and_solid_bar_direct_labels(self):
        data = [{"x": "A", "y": 1, "group": "North"}, {"x": "A", "y": 2, "group": "South"}]
        fig, result = self.render("bar", data)
        self.assertEqual([p.get_hatch() for p in fig.axes[0].patches], ["", "//"])
        self.profile["chart_style"]["hatches"] = [""]
        fig, result = self.render("bar", data)
        self.assertEqual([t.get_text() for t in fig.axes[0].texts], ["North", "South"])
        self.assertEqual(result["encoding"]["redundant"], "Direct group labels")

    def test_profile_controls_colors_fonts_and_colormap_lists(self):
        self.profile["chart_style"]["categorical"] = ["#575757"]
        fig, _ = self.render("scatter", [{"x": 1, "y": 2}])
        self.assertEqual(fig.axes[0].collections[0].get_facecolors()[0].tolist(), list(colors.to_rgba("#575757")))
        self.profile["chart_style"]["sequential"] = ["#FFFFFF", "#111111"]
        fig, _ = self.render("heatmap", [{"x": "A", "y": "B", "value": 1}, {"x": "A", "y": "C", "value": 2}])
        self.assertEqual(colors.to_hex(fig.axes[0].images[0].cmap(0.0)), "#ffffff")

    def test_no_missing_invalid_or_precision_lost_numeric_values(self):
        for value in ("", "NaN", "inf", "1e999", "1e-999", "9007199254740993", "0.100000000000000001"):
            with self.subTest(value=value), self.assertRaises(ValueError):
                self.render("scatter", [{"x": 1, "y": value}])
        with self.assertRaisesRegex(ValueError, "explicit type"):
            self.render("scatter", [{"x": 1, "y": 2}], types={"x": "categorical", "y": "numeric"})
        with self.assertRaisesRegex(ValueError, "Unit"):
            self.render("scatter", [{"x": 1, "y": 2}], units={})
        with self.assertRaisesRegex(ValueError, "Duplicate"):
            self.render("bar", [{"x": "A", "y": 1}, {"x": " A ", "y": 2}])

    def test_scope_and_layout_limits_are_actionable(self):
        for bins in (0, -1, 101, 1.5, True):
            with self.subTest(bins=bins), self.assertRaisesRegex(ValueError, "bins"):
                self.render("histogram", [{"x": 1}], bins=bins)
        with self.assertRaisesRegex(ValueError, "20 categories"):
            self.render("bar", [{"x": f"C{i}", "y": i} for i in range(21)])
        with self.assertRaisesRegex(ValueError, "group column"):
            self.render("scatter", [{"x": 1, "y": 2}], layout={"mode": "facet"})
        with self.assertRaisesRegex(ValueError, "6 facets"):
            self.render("scatter", [{"x": i, "y": i, "group": str(i)} for i in range(7)])

    def test_literal_math_text_and_no_source_mutation(self):
        data = [{"x": "$literal$", "y": "0.10"}]
        original = deepcopy(data)
        fig, result = self.render("bar", data)
        self.assertEqual(data, original)
        self.assertFalse(fig._supxlabel.get_parse_math())
        self.assertEqual(result["mapping"]["rows"][0]["values"]["y"], "0.10")
        self.assertIn("Not performed", result["visual_review"])

    def test_input_columns_can_use_receipt_metadata_names(self):
        spec = {"chart": "scatter", "x": "original", "y": "csv_record", "title": "Column names",
                "types": {"original": "numeric", "csv_record": "numeric"}, "units": {"original": "m", "csv_record": "s"}}
        _, details = draw_chart(["original", "csv_record"], [{"original": "1", "csv_record": "2"}], spec, self.profile)
        self.assertEqual(details["series"][0]["points"], [[1, 2]])
        self.assertEqual(details["mapping"]["rows"][0]["csv_record"], 2)

    def test_spec_mistakes_do_not_silently_change_semantics(self):
        data = [{"x": 1, "y": 2}]
        for extra in ({"center": 0}, {"bins": 5}, {"gruop": "x"}, {"layout": {"widht": "double"}}):
            with self.subTest(extra=extra), self.assertRaises(ValueError):
                self.render("scatter", data, **extra)
        with self.assertRaisesRegex(ValueError, "JSON object"):
            draw_chart(["x"], [{"x": "1"}], [], self.profile)
        # An unused column must not demand fonts that the actual figure does not use.
        fig, _ = self.render("scatter", [{"x": 1, "y": 2, "未选中的列": "不绘制"}])
        self.assertEqual(len(fig.axes[0].collections[0].get_offsets()), 1)

    def test_heatmap_label_limits_fail_without_leaking_figures(self):
        data = [{"x": f"C{i}", "y": "Row", "value": i} for i in range(9)]
        with self.assertRaisesRegex(ValueError, "double width"):
            self.render("heatmap", data)
        crowded = [{"x": f"C{i}", "y": "Row", "value": "0.1234567890123456"} for i in range(20)]
        before = set(plt.get_fignums())
        with self.assertRaisesRegex(ValueError, "cell labels exceed"):
            self.render("heatmap", crowded, layout={"width": "double"})
        self.assertEqual(set(plt.get_fignums()), before)

    def test_malformed_json_field_types_are_controlled_validation_errors(self):
        data = [{"x": 1, "y": 2}]
        malformed = [
            ({"chart": []}, "supported chart"),
            ({"x": []}, "columns using strings"),
            ({"types": {"x": [], "y": "numeric"}}, "explicit type"),
            ({"layout": {"mode": []}}, "layout.mode"),
            ({"layout": {"width": {}}}, "layout.mode"),
        ]
        for extra, message in malformed:
            with self.subTest(extra=extra), self.assertRaisesRegex(ValueError, message):
                spec = {"chart": "scatter", "x": "x", "y": "y", "title": "Validation",
                        "types": {"x": "numeric", "y": "numeric"}, "units": {"x": "s", "y": "m"}, **extra}
                draw_chart(["x", "y"], [{"x": "1", "y": "2"}], spec, self.profile)

    def test_every_chart_family_places_title_and_caption_below_axes(self):
        inputs = {
            "bar": [{"x": "A", "y": 1}], "dot": [{"x": "A", "y": 1}],
            "line": [{"x": 1, "y": 2}, {"x": 2, "y": 3}],
            "scatter": [{"x": 1, "y": 2}], "histogram": [{"x": 1}, {"x": 2}],
            "box": [{"x": "A", "y": 1}, {"x": "A", "y": 2}],
            "heatmap": [{"x": "A", "y": "B", "value": 1}],
        }
        for chart, data in inputs.items():
            with self.subTest(chart=chart):
                fig, details = self.render(chart, data, caption="Prepared observations.\nNo inferential claim.")
                renderer = fig.canvas.get_renderer()
                footer = fig._supxlabel.get_window_extent(renderer)
                ax = fig.axes[0]
                self.assertLess(footer.y1, ax.xaxis.label.get_window_extent(renderer).y0)
                self.assertLess(footer.y1, ax.bbox.y0)
                self.assertGreaterEqual(footer.y0, 0)
                self.assertLessEqual(footer.x1, fig.bbox.x1)
                self.assertGreaterEqual(footer.x0, 0)
                self.assertTrue(all(not ax.get_title(loc=loc) for loc in ("left", "center", "right")))
                self.assertIsNone(fig._suptitle)
                self.assertEqual(details["text_placement"]["figure"]["position"], "below")
                self.assertIn("Prepared observations.", fig._supxlabel.get_text())
                self.assertAlmostEqual(details["height_mm"], fig.get_figheight() * 25.4)

    def test_facet_captions_have_separate_measured_space_below_each_panel(self):
        data = [{"x": point, "y": point * (index + 1), "group": name}
                for index, name in enumerate(("First long group label with several descriptive words", "Second", "Third", "Fourth"))
                for point in (1, 2, 3)]
        fig, details = self.render("line", data, caption="Shared scales across all four groups.", layout={"mode": "facet", "width": "double", "columns": 2})
        renderer = fig.canvas.get_renderer()
        footer = fig._supxlabel.get_window_extent(renderer)
        panels = []
        for ax in fig.axes:
            caption = next(text for text in ax.texts if text.get_gid() == "metis-panel-caption")
            bounds = caption.get_window_extent(renderer)
            panels.append(bounds)
            self.assertLess(bounds.y1, ax.xaxis.label.get_window_extent(renderer).y0)
            self.assertLess(bounds.y1, ax.bbox.y0)
            self.assertGreater(bounds.y0, footer.y1)
            for other in fig.axes:
                self.assertFalse(bounds.overlaps(other.bbox))
        for i, box in enumerate(panels):
            for other in panels[i + 1:]:
                self.assertFalse(box.overlaps(other))
        self.assertEqual(len(details["text_placement"]["panel_titles"]), 4)
        self.assertTrue(all(item["position"] == "below" for item in details["text_placement"]["panel_titles"]))

    def test_caption_requires_covered_glyphs_and_below_only_profile_positions(self):
        with self.assertRaisesRegex(ValueError, "font stack"):
            self.render("scatter", [{"x": 1, "y": 2}], caption="Missing glyph \U0010ffff")
        for caption in ("", None, [], "tab\there"):
            with self.subTest(caption=caption), self.assertRaisesRegex(ValueError, "Caption"):
                self.render("scatter", [{"x": 1, "y": 2}], caption=caption)
        for setting in ("title_position", "caption_position", "panel_title_position"):
            with self.subTest(setting=setting):
                self.profile["figure"][setting] = "above"
                with self.assertRaisesRegex(ValueError, "must be below"):
                    self.render("scatter", [{"x": 1, "y": 2}])
                del self.profile["figure"][setting]


if __name__ == "__main__":
    unittest.main()
