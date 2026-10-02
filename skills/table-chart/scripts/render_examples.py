#!/usr/bin/env python3
"""Render a bounded fictional acceptance set for the seven chart forms.

MIT License — Copyright (c) 2026 Shiqi Wang and metis contributors.
See the full license in the accompanying bar_chart.py.
"""
import argparse
import json
from pathlib import Path

from chart import plan, render, write_json


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--profiles", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=False)
    category = args.output / "categories.csv"
    category.write_text("category,value\nSample A,12\nSample B,7\nSample C,0\nSample D,-3\n")
    observations = args.output / "observations.csv"
    observations.write_text("date,series,x,value\n" + "".join(
        f"2026-01-0{day},{group},{day + index / 10},{day * scale + offset}\n"
        for index, (group, scale, offset) in enumerate((("Alpha", 2, 1), ("Beta", 3, -1), ("Gamma", 1, 3), ("Delta", 2, -2)))
        for day in (3, 1, 4, 2)))
    matrix = args.output / "matrix.csv"
    matrix.write_text("method,dataset,value\nA,X,-2\nB,X,0\nC,X,3\nA,Y,1\nB,Y,4\nC,Y,-1\n")
    write_json(args.output / "plan.json", plan(observations))
    jobs = []
    for chart in ("bar", "dot"):
        jobs.append((chart, category, "journal", {"chart": chart, "x": "category", "y": "value",
            "types": {"category": "categorical", "value": "numeric"}, "units": {"value": "points"}}))
    for chart in ("line", "scatter", "histogram", "box"):
        x = {"line": "date", "scatter": "x", "histogram": "value", "box": "series"}[chart]
        spec = {"chart": chart, "x": x, "types": {x: "temporal" if chart == "line" else "categorical" if chart == "box" else "numeric", "value": "numeric"},
                "units": {"value": "points"}}
        if chart != "histogram":
            spec["y"] = "value"
        else:
            spec["bins"] = 6
        if chart in ("line", "scatter"):
            spec.update({"group": "series", "layout": {"mode": "facet" if chart == "line" else "single", "width": "double", "columns": 2}})
            spec["types"]["series"] = "categorical"
            spec["units"][x] = "date" if chart == "line" else "units"
        jobs.append((chart, observations, "journal", spec))
    heatmap = {"chart": "heatmap", "x": "method", "y": "dataset", "value": "value", "center": 0,
               "types": {"method": "categorical", "dataset": "categorical", "value": "numeric"},
               "units": {"value": "difference points"}, "layout": {"width": "double"}}
    jobs.append(("heatmap", matrix, "journal", heatmap))
    jobs.append(("heatmap-gray", matrix, "journal-grayscale", dict(heatmap)))
    scatter = next(spec for name, _, _, spec in jobs if name == "scatter")
    jobs.append(("scatter-npg", observations, "journal-npg", dict(scatter)))
    results = []
    for name, data, profile, spec in jobs:
        spec = {**spec, "title": f"Fictional example: {name}"}
        spec_path = args.output / f"{name}.json"
        write_json(spec_path, spec)
        receipt = render(data, spec_path, args.profiles / f"{profile}.yaml", args.output / name)
        results.append({"example": name, "profile": profile, "rows": receipt["input"]["row_count"], "receipt": f"{name}/receipt.json"})
    write_json(args.output / "examples.json", {"fictional": True, "examples": results,
                                               "visual_review": "Pending: inspect all color and grayscale exports."})
    print(json.dumps({"output": str(args.output), "examples": len(results)}))


if __name__ == "__main__":
    main()
