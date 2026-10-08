"""Append captions declared in Mermaid comments to an actual rendered SVG.

This does not render Mermaid or establish visual quality. The original SVG is
preserved; output must be a different path. Uses Python's standard library.
"""
import argparse
from pathlib import Path
import re
import xml.etree.ElementTree as ET

SVG = "http://www.w3.org/2000/svg"
ET.register_namespace("", SVG)

def append_caption(source, rendered, output, font_size=16, font_family="sans-serif", ink="#1A1A1A", width_mm=None):
    source, rendered, output = map(Path, (source, rendered, output))
    if output.resolve() in {source.resolve(), rendered.resolve()}:
        raise ValueError("Output must preserve both source and rendered input")
    lines = [match.group(1).strip() for line in source.read_text(encoding="utf-8").splitlines()
             if (match := re.match(r"^\s*%%\s*caption:\s*(.+)$", line))]
    if not lines:
        raise ValueError("Source needs at least one '%% caption:' comment")
    if font_size <= 0:
        raise ValueError("Font size must be positive")
    tree = ET.parse(rendered)
    root = tree.getroot()
    if root.tag != f"{{{SVG}}}svg":
        raise ValueError("Rendered input is not SVG")
    bounds = root.get("viewBox", "").replace(",", " ").split()
    if len(bounds) != 4:
        raise ValueError("Rendered SVG needs four viewBox values")
    x, y, width, height = map(float, bounds)
    if width <= 0 or height <= 0:
        raise ValueError("SVG dimensions must be positive")
    margin, line_height = font_size, font_size * 1.4
    new_height = height + margin * 2 + line_height * len(lines)
    root.set("viewBox", f"{x:g} {y:g} {width:g} {new_height:g}")
    # Mermaid sets max-width; retain width and update only explicitly numeric height.
    if root.get("height") and re.fullmatch(r"[0-9.]+", root.get("height")):
        root.set("height", f"{new_height:g}")
    if width_mm is not None:
        if width_mm <= 0:
            raise ValueError("Physical width must be positive")
        root.set("width", f"{width_mm:g}mm")
        root.set("height", f"{new_height / width * width_mm:g}mm")
        style = root.get("style", "")
        style = re.sub(r"max-width\s*:[^;]+;?", "", style)
        root.set("style", style + f";max-width:{width_mm:g}mm;")
    caption = ET.SubElement(root, f"{{{SVG}}}g", {"data-metis-caption": "below",
        "font-family": font_family, "font-size": str(font_size), "fill": ink})
    for i, line in enumerate(lines):
        text = ET.SubElement(caption, f"{{{SVG}}}text", {"x": f"{x+width/2:g}",
            "y": f"{y+height+margin+line_height*(i+1):g}", "text-anchor": "middle"})
        text.text = line
    tree.write(output, encoding="utf-8", xml_declaration=True)
    return len(lines)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source")
    parser.add_argument("rendered")
    parser.add_argument("output")
    parser.add_argument("--font-size", type=float, default=16)
    parser.add_argument("--font-family", default="sans-serif")
    parser.add_argument("--ink", default="#1A1A1A")
    parser.add_argument("--width-mm", type=float)
    args = parser.parse_args()
    try:
        count = append_caption(args.source, args.rendered, args.output, args.font_size,
                               args.font_family, args.ink, args.width_mm)
    except (OSError, ValueError, ET.ParseError) as exc:
        parser.exit(2, f"Caption export failed: {exc}\n")
    print(f"Appended {count} caption lines; inspect final SVG at use size.")

if __name__ == "__main__":
    main()
