#!/usr/bin/env python3
"""CSV 描述诊断：显式数值列、完整配对分母，不生成推断性显著性。"""
from __future__ import annotations
import argparse
import csv
import hashlib
import itertools
import json
import math
import statistics
from pathlib import Path


def describe(source, numeric, unit, identifier=()):
    source = Path(source)
    with source.open(newline='', encoding='utf-8-sig') as handle:
        reader = csv.DictReader(handle)
        if not reader.fieldnames or len(set(reader.fieldnames)) != len(reader.fieldnames):
            raise ValueError('unique CSV headers required')
        if not numeric or len(set(numeric)) != len(numeric) or not set(numeric) <= set(reader.fieldnames):
            raise ValueError('declare distinct existing numeric columns')
        if not unit.strip() or set(identifier) & set(numeric) or not set(identifier) <= set(reader.fieldnames):
            raise ValueError('unit required; identifiers cannot be numeric measures')
        rows = list(reader)
    values = {name: [] for name in numeric}
    for index, row in enumerate(rows, 1):
        if None in row or any(v is None for v in row.values()): raise ValueError('malformed CSV record')
        for name in numeric:
            cell = row[name]
            if cell == '': value = None
            else:
                try: value = float(cell)
                except ValueError as exc: raise ValueError(f'record {index}, {name}: not prepared numeric data') from exc
                if not math.isfinite(value): raise ValueError(f'record {index}, {name}: nonfinite value')
            values[name].append(value)
    summary = {}
    for name, column in values.items():
        observed = [x for x in column if x is not None]
        n = len(observed)
        q1, q3 = (statistics.quantiles(observed, n=4, method='inclusive')[i] for i in (0, 2)) if n > 1 else ((observed[0], observed[0]) if n else (None, None))
        flagged = [i+1 for i, x in enumerate(column) if x is not None and q1 is not None and (x < q1-1.5*(q3-q1) or x > q3+1.5*(q3-q1))]
        summary[name] = {'n': n, 'missing': len(rows)-n, 'min': min(observed) if n else None,
                         'max': max(observed) if n else None, 'mean': statistics.mean(observed) if n else None,
                         'median': statistics.median(observed) if n else None,
                         'sample_sd': statistics.stdev(observed) if n > 1 else None,
                         'q1': q1, 'q3': q3, 'constant': len(set(observed)) == 1 if n else None,
                         'tukey_flagged_records': flagged}
    associations = []
    for left, right in itertools.combinations(numeric, 2):
        pairs = [(x,y) for x,y in zip(values[left], values[right]) if x is not None and y is not None]
        n = len(pairs); reason = None
        if n < 2: r = None; reason = 'fewer than two complete pairs'
        else:
            x,y = zip(*pairs)
            if len(set(x)) == 1 or len(set(y)) == 1: r = None; reason = 'constant column within complete pairs'
            else: r = statistics.correlation(x,y)
        associations.append({'left': left, 'right': right, 'complete_pairs': n, 'pearson_r': r, 'undefined_reason': reason})
    unique_ids = len({tuple(row[k] for k in identifier) for row in rows}) if identifier else None
    return {'schema_version': 1, 'unit': unit, 'records': len(rows),
            'input_sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'columns': summary,
            'associations': associations, 'identifier_columns': list(identifier), 'unique_identifiers': unique_ids,
            'limits': ['Descriptive diagnostics only; sampling, temporal dependence and confounding need separate assessment.',
                       'Pairwise-complete correlations may use different observations; outlier flags do not authorize removal.']}


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--input', required=True, type=Path); p.add_argument('--numeric', required=True, nargs='+')
    p.add_argument('--identifier', nargs='*', default=[]); p.add_argument('--unit', required=True)
    p.add_argument('--output-directory', required=True, type=Path); a=p.parse_args()
    try:
        result=describe(a.input,a.numeric,a.unit,a.identifier)
        if a.output_directory.exists(): raise ValueError('output directory exists; choose a new directory')
        a.output_directory.mkdir(parents=True)
        (a.output_directory/'diagnostics.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
        text=f"# 探索诊断\n\n单位：{a.unit}；记录数：{result['records']}。\n\n"
        for name,s in result['columns'].items(): text+=f"- {name}: 有效 n={s['n']}，缺失 {s['missing']}，均值 {s['mean']}，中位数 {s['median']}。\n"
        text+='\n相关关系的完整配对数与无法计算的原因见 diagnostics.json。异常标记保留，未自动删除。结果属于描述分析，未作因果或总体推断。\n'
        (a.output_directory/'report.md').write_text(text)
        print(json.dumps({'records':result['records'],'measures':len(result['columns'])})); return 0
    except (OSError,ValueError,TypeError) as exc: p.exit(2,str(exc)+'\n')


if __name__=='__main__': raise SystemExit(main())
