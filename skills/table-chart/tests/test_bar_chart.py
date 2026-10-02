"""Behavioral checks for the small CSV-to-chart contract."""

import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

from matplotlib import colors, pyplot as plt
import yaml

SKILL_ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("bar_chart", SKILL_ROOT / "scripts/bar_chart.py")
chart = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(chart)


class BarChartTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix="metis-table-chart-test-")
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.input = self.root / "input.csv"
        self.input.write_text("category,value\nBeta,7.5\nAlpha,-2\nZero,0\n", encoding="utf-8")
        self.profile = yaml.safe_load((SKILL_ROOT.parents[1] / "profiles/journal.yaml").read_text())
        self.profile["typography"]["body"] = "DejaVu Sans"
        self.profile["typography"]["heading"] = "DejaVu Sans"
        self.profile_path = self.root / "test-profile.yaml"
        self.save_profile()

    def save_profile(self):
        self.profile_path.write_text(yaml.safe_dump(self.profile), encoding="utf-8")

    def render(self, output=None):
        return chart.generate(self.input, "category", "value", "points", "Fictional values",
                              self.profile_path, output or self.root / "output")

    def test_signed_geometry_and_source_order(self):
        _, rows = chart.load_table(self.input, "category", "value")
        figure, axes, _ = chart.make_figure(rows, self.profile, "value", "points", "Test")
        self.addCleanup(plt.close, figure)
        self.assertEqual([bar.get_width() for bar in axes.patches], [7.5, -2, 0])
        self.assertEqual([bar.get_x() for bar in axes.patches], [0, 0, 0])
        self.assertEqual([bar.get_y() + bar.get_height() / 2 for bar in axes.patches], [0, 1, 2])
        self.assertEqual([text.get_text() for text in axes.get_yticklabels()], ["Beta", "Alpha", "Zero"])
        self.assertTrue(axes.yaxis_inverted())
        self.assertLess(axes.get_xlim()[0], 0)
        self.assertGreater(axes.get_xlim()[1], 0)

    def test_invalid_data_are_rejected_without_output(self):
        cases = {
            "missing": "category,value\nA,\n",
            "blank category": "category,value\n ,3\n",
            "duplicate": "category,value\nA,1\nA,2\n",
            "whitespace duplicate": "category,value\nA,1\n A ,2\n",
            "not numeric": "category,value\nA,ten\n",
            "nan": "category,value\nA,NaN\n",
            "infinity": "category,value\nA,inf\n",
            "overflow": "category,value\nA,1e999\n",
            "missing field": "category,value\nA\n",
            "extra field": "category,value\nA,1,2\n",
            "duplicate header": "category,value,value\nA,1,2\n",
            "empty": "category,value\n",
            "multiline category": 'category,value\n"A\nB",1\n',
            "too many": "category,value\n" + "\n".join(f"C{i},{i}" for i in range(21)),
        }
        for reason, source in cases.items():
            with self.subTest(reason=reason):
                self.input.write_text(source, encoding="utf-8")
                with self.assertRaises(ValueError):
                    self.render()
                self.assertFalse((self.root / "output").exists())

    def test_selected_columns_must_be_different_and_exist(self):
        for category, value in (("category", "category"), ("missing", "value")):
            with self.subTest(category=category, value=value), self.assertRaises(ValueError):
                chart.load_table(self.input, category, value)

    def test_numeric_precision_loss_is_rejected_before_export(self):
        for number, reason in (("1e-999", "underflows"), ("-1e-999", "underflows"),
                               ("9007199254740993", "precision"),
                               ("0.123456789012345678901", "precision")):
            with self.subTest(number=number):
                self.input.write_text(f"category,value\nA,{number}\n", encoding="utf-8")
                with self.assertRaisesRegex(ValueError, reason):
                    self.render()
                self.assertFalse((self.root / "output").exists())

    def test_common_decimals_and_full_numeric_labels_are_preserved(self):
        self.input.write_text("category,value\nA,0.1\nB,1e-3\nC,0.1234567890123456\n", encoding="utf-8")
        _, rows = chart.load_table(self.input, "category", "value")
        self.assertEqual([row["value"] for row in rows], [0.1, 0.001, 0.1234567890123456])
        figure, axes, _ = chart.make_figure(rows, self.profile, "value", "points", "Test")
        self.addCleanup(plt.close, figure)
        self.assertEqual([label.get_text() for label in axes.texts], ["0.1", "1e-3", "0.1234567890123456"])

    def test_profile_controls_actual_plot_and_exports(self):
        self.profile["palette"]["primary"] = "#CC5500"
        self.profile["typography"]["label_size_pt"] = 11
        self.profile["figure"]["column_width_mm"] = 120
        self.profile["figure"]["dpi"] = 96
        self.profile["figure"]["format"] = ["svg", "png"]
        self.save_profile()
        _, rows = chart.load_table(self.input, "category", "value")
        figure, axes, _ = chart.make_figure(rows, self.profile, "value", "points", "Test")
        self.addCleanup(plt.close, figure)
        self.assertAlmostEqual(figure.get_figwidth() * 25.4, 120)
        self.assertEqual(figure.dpi, 96)
        self.assertEqual(axes.patches[0].get_facecolor(), colors.to_rgba("#CC5500"))
        self.assertEqual(axes.xaxis.label.get_fontsize(), 11)
        receipt = self.render()
        self.assertEqual({item["file"] for item in receipt["exports"]}, {"chart.svg", "chart.png"})
        self.assertFalse((self.root / "output/chart.pdf").exists())

    def test_receipt_and_reproduction_keep_exact_inputs(self):
        before = self.input.read_bytes()
        receipt = self.render()
        output = self.root / "output"
        self.assertEqual(self.input.read_bytes(), before)
        self.assertEqual(receipt["input"]["sha256"], hashlib.sha256(before).hexdigest())
        self.assertEqual(receipt["mapping"]["rows"][1]["value"], -2)
        self.assertEqual(receipt["mapping"]["row_count"], 3)
        self.assertEqual(receipt["mapping"]["unit"], "points")
        self.assertEqual(receipt["transformations"], [])
        self.assertEqual((output / "profile.yaml").read_bytes(), self.profile_path.read_bytes())
        self.assertEqual((output / "bar_chart.py").read_bytes(), (SKILL_ROOT / "scripts/bar_chart.py").read_bytes())
        self.assertEqual(json.loads((output / "receipt.json").read_text()), receipt)
        for export in receipt["exports"]:
            contents = (output / export["file"]).read_bytes()
            self.assertGreater(len(contents), 100)
            self.assertEqual(export["sha256"], hashlib.sha256(contents).hexdigest())
        self.assertIn("Not performed", receipt["visual_review"])
        self.assertIn("R4 Final visual inspection | blocked", (output / "requirements.md").read_text())

    def test_existing_output_is_never_overwritten(self):
        output = self.root / "output"
        output.mkdir()
        sentinel = output / "chart.png"
        sentinel.write_bytes(b"retain original")
        with self.assertRaisesRegex(ValueError, "already exists"):
            self.render(output)
        self.assertEqual(sentinel.read_bytes(), b"retain original")
        link = self.root / "dangling-output"
        link.symlink_to(self.root / "missing-target")
        with self.assertRaisesRegex(ValueError, "already exists"):
            self.render(link)
        self.assertTrue(link.is_symlink())

    def test_missing_glyph_is_a_clear_failure(self):
        with self.assertRaisesRegex(ValueError, "font stack cannot cover"):
            chart.resolve_font("DejaVu Sans", "\U0010ffff", "body")

    def test_invalid_profile_fails_before_export(self):
        self.profile["figure"]["format"] = ["../other"]
        self.save_profile()
        with self.assertRaisesRegex(ValueError, "unique formats"):
            self.render()
        self.assertFalse((self.root / "output").exists())


if __name__ == "__main__":
    unittest.main()
