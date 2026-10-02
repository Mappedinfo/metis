"""Public planning, export and rerun behavior (fictional data only)."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

import yaml

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))
from chart import plan, read_csv, render
from bar_chart import sha256


class ChartWorkflowTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.input = self.root / "data.csv"

    def tearDown(self):
        self.temp.cleanup()

    def table(self, text):
        self.input.write_text(text, encoding="utf-8")
        return self.input

    def test_identifier_numbers_and_explicit_semantics(self):
        self.table("site_id,year,value\n101,2024,8\n102,2025,9\n")
        result = plan(self.input)
        self.assertEqual(result["columns"]["site_id"]["type"], "categorical")
        self.assertEqual(result["columns"]["year"]["type"], "numeric")
        self.assertTrue(any("years" in note for note in result["columns"]["year"]["notes"]))
        declared = plan(self.input, {"year": "categorical"})
        self.assertTrue(declared["columns"]["year"]["declared"])
        self.assertEqual(declared["columns"]["year"]["type"], "categorical")

    def test_alternatives_cover_the_observed_data_structure(self):
        cases = [("label,value\nA,4\nB,-2\n", {"bar", "dot", "histogram"}),
                 ("date,value\n2026-01-02,4\n2026-01-01,2\n", {"line", "histogram"}),
                 ("x,y\n1,4\n2,7\n3,5\n", {"scatter", "histogram"}),
                 ("group,value\nA,4\nA,2\nB,8\nB,6\n", {"box", "histogram"}),
                 ("a,b,value\nA,X,1\nA,Y,2\nB,X,3\nB,Y,4\n", {"heatmap"})]
        for text, expected in cases:
            with self.subTest(text=text):
                result = plan(self.table(text))
                self.assertTrue(expected <= {c["spec"]["chart"] for c in result["candidates"]})
                for candidate in result["candidates"]:
                    self.assertIsNone(candidate["spec"]["title"])
                    self.assertTrue(all(unit is None for unit in candidate["spec"]["units"].values()))

    def test_missing_data_blocks_affected_candidates_without_dropping_rows(self):
        self.table("label,value\nA,1\nB,\n")
        result = plan(self.input)
        self.assertEqual(result["input"]["row_count"], 2)
        self.assertEqual(result["columns"]["value"]["missing"], 1)
        self.assertTrue(result["columns"]["value"]["issues"])
        self.assertEqual(result["candidates"], [])

    def test_series_layout_is_faceted_when_more_than_three_groups(self):
        text = "date,group,value\n" + "".join(f"2026-01-0{day},{group},{day}\n" for group in "ABCD" for day in (1, 2))
        result = plan(self.table(text))
        line = next(c["spec"] for c in result["candidates"] if c["spec"]["chart"] == "line")
        self.assertEqual(line["group"], "group")
        self.assertEqual(line["layout"], {"mode": "facet", "width": "double", "columns": 2})

    def test_invalid_input_and_declarations(self):
        for text in ("a,a\n1,2\n", "a,b\n1\n", "a,b\n"):
            with self.assertRaises(ValueError):
                read_csv(self.table(text))
        self.table("a,b\nA,2\n")
        for declared in ({"missing": "numeric"}, {"a": "unknown"}, {"a": []}, ["a"], []):
            with self.assertRaises(ValueError):
                plan(self.input, declared)

    def test_equal_numeric_coordinates_do_not_propose_an_unrenderable_line(self):
        result = plan(self.table("x,y\n1,2\n1.0,3\n2,4\n"))
        choices = [c["spec"]["chart"] for c in result["candidates"]]
        self.assertIn("scatter", choices)
        self.assertNotIn("line", choices)

    def test_render_receipt_and_portable_rerun(self):
        self.table("label,value\nA,4\nB,-2\n")
        spec = {"chart": "dot", "x": "label", "y": "value", "types": {"label": "categorical", "value": "numeric"},
                "units": {"value": "points"}, "title": "Fictional comparison"}
        spec_path = self.root / "spec.json"
        spec_path.write_text(json.dumps(spec))
        profile = yaml.safe_load((SCRIPTS.parents[2] / "profiles/journal.yaml").read_text())
        profile["typography"]["body"] = profile["typography"]["heading"] = "DejaVu Sans"
        profile_path = self.root / "style.yaml"
        profile_path.write_text(yaml.safe_dump(profile))
        output = self.root / "result"
        receipt = render(self.input, spec_path, profile_path, output)
        self.assertEqual(receipt["input"]["sha256"], sha256(self.input.read_bytes()))
        for name, digest in receipt["snapshots"].items():
            self.assertEqual(sha256((output / name).read_bytes()), digest)
        for export in receipt["exports"]:
            self.assertEqual(sha256((output / export["file"]).read_bytes()), export["sha256"])
        self.assertTrue((output / "chart-grayscale.png").is_file())
        self.assertIn("blocked", (output / "requirements.md").read_text())
        # Proves the copied scripts/data/profile are sufficient after originals disappear.
        self.input.unlink()
        spec_path.unlink()
        profile_path.unlink()
        proc = subprocess.run([sys.executable, "-B", "chart.py", "render", "--input", "input.csv", "--spec", "spec.json",
                               "--profile", "profile.yaml", "--output", "rerun"], cwd=output, capture_output=True, text=True)
        self.assertEqual(proc.returncode, 0, proc.stderr)
        again = json.loads((output / "rerun/receipt.json").read_text())
        self.assertEqual(again["input"]["sha256"], receipt["input"]["sha256"])
        self.assertEqual(again["render"], receipt["render"])
        with self.assertRaises(ValueError):
            render(output / "input.csv", output / "spec.json", output / "profile.yaml", output)


if __name__ == "__main__":
    unittest.main()
