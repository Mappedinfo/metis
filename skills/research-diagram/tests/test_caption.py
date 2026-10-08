import importlib.util
from pathlib import Path
import tempfile
import unittest
import xml.etree.ElementTree as ET

module_path = Path(__file__).resolve().parents[1] / "scripts" / "add_caption.py"
spec = importlib.util.spec_from_file_location("caption", module_path)
caption = importlib.util.module_from_spec(spec)
spec.loader.exec_module(caption)

class CaptionExportTest(unittest.TestCase):
    def test_preserves_source_and_places_editable_caption_below_render(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source, rendered, output = [root/name for name in ("input.mmd", "raw.svg", "final.svg")]
            source.write_text("flowchart LR\n a --> b\n%% caption: A < B & C\n")
            rendered.write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"><text x="1" y="10">Input</text></svg>')
            original_source, original_svg = source.read_bytes(), rendered.read_bytes()
            self.assertEqual(caption.append_caption(source, rendered, output, width_mm=183), 1)
            result=ET.parse(output).getroot()
            self.assertEqual(source.read_bytes(), original_source)
            self.assertEqual(rendered.read_bytes(), original_svg)
            group=result.find('.//{http://www.w3.org/2000/svg}g')
            text=group.find('{http://www.w3.org/2000/svg}text')
            self.assertEqual(text.text, "A < B & C")
            self.assertGreater(float(text.get("y")), 100)
            self.assertGreater(float(result.get("viewBox").split()[3]), float(text.get("y")))
            self.assertEqual(result.get("width"), "183mm")
            self.assertIsNotNone(result.find('{http://www.w3.org/2000/svg}text'))

    def test_refuses_to_overwrite_original_svg(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            source, rendered = root/"source.mmd", root/"raw.svg"
            source.write_text("%% caption: example\n")
            rendered.write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"/>')
            original=rendered.read_bytes()
            with self.assertRaises(ValueError):
                caption.append_caption(source, rendered, rendered)
            self.assertEqual(rendered.read_bytes(),original)

    def test_missing_caption_cannot_be_reported_as_exported(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            source, rendered, output=[root/name for name in ("input.mmd", "raw.svg", "final.svg")]
            source.write_text("flowchart LR\n a --> b\n")
            rendered.write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"/>')
            with self.assertRaises(ValueError):
                caption.append_caption(source, rendered, output)
            self.assertFalse(output.exists())

if __name__ == "__main__":
    unittest.main()
