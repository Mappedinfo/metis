#!/usr/bin/env python3
"""按显式列合同转换 CSV；所有删除、填值和重复处理进入审计。"""
from __future__ import annotations
import argparse
import csv
import hashlib
import io
import json
import math
import tempfile
from datetime import date
from pathlib import Path


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def prepare(source, spec, destination):
    source, destination = Path(source), Path(destination)
    allowed = {'schema_version', 'unit', 'columns', 'keys', 'duplicates'}
    if set(spec) - allowed or spec.get('schema_version') != 1 or not spec.get('unit'):
        raise ValueError('spec requires schema_version=1, a unit and documented fields')
    columns = spec.get('columns')
    if not isinstance(columns, dict) or not columns:
        raise ValueError('columns must be a nonempty ordered object')
    keys = spec.get('keys', [])
    duplicate_policy = spec.get('duplicates', 'error')
    if duplicate_policy not in {'error', 'preserve', 'drop_exact'}:
        raise ValueError('duplicates must be error, preserve or drop_exact')
    output_columns = []
    for name, rule in columns.items():
        if set(rule) - {'type', 'rename', 'trim', 'missing_values', 'missing', 'fill'}:
            raise ValueError('unsupported column option: '+name)
        if rule.get('type') not in {'string', 'number', 'integer', 'date'}:
            raise ValueError('unsupported type: '+name)
        if rule.get('missing', 'preserve') not in {'preserve', 'drop_row', 'fill'}:
            raise ValueError('unsupported missing action: '+name)
        if rule.get('missing') == 'fill' and 'fill' not in rule:
            raise ValueError('fill requires an explicit value: '+name)
        output_columns.append(rule.get('rename', name))
    if len(set(output_columns)) != len(output_columns) or any(k not in output_columns for k in keys):
        raise ValueError('output names must be unique; keys use output names')
    if destination.exists():
        raise ValueError('output directory already exists; choose a new directory')

    def convert(value, rule):
        if rule.get('trim', False): value = value.strip()
        if value in rule.get('missing_values', ['']): return None
        kind = rule['type']
        if kind == 'string': return value
        if kind == 'date': return date.fromisoformat(value).isoformat()
        number = float(value)
        if not math.isfinite(number): raise ValueError('nonfinite number')
        if kind == 'integer':
            if not number.is_integer(): raise ValueError('not an integer')
            return str(int(number))
        return str(number)

    with source.open(newline='', encoding='utf-8-sig') as handle:
        reader = csv.DictReader(handle)
        if not reader.fieldnames or len(set(reader.fieldnames)) != len(reader.fieldnames):
            raise ValueError('CSV requires unique headers')
        if set(columns) != set(reader.fieldnames):
            raise ValueError('spec must account for every input column')
        rows = list(reader)
    prepared, mapping, changes, seen, key_seen = [], [], [], set(), set()
    for record_id, row in enumerate(rows, 1):
        if None in row or any(v is None for v in row.values()):
            raise ValueError(f'CSV record {record_id}: field count differs from headers')
        converted, dropped = {}, False
        for name, rule in columns.items():
            try:
                value = convert(row[name], rule)
                if value is None:
                    action = rule.get('missing', 'preserve')
                    if action == 'drop_row':
                        dropped = True
                        changes.append({'record': record_id, 'column': name, 'action': 'drop_row_missing'})
                    elif action == 'fill':
                        value = convert(str(rule['fill']), {**rule, 'missing_values': []})
                        changes.append({'record': record_id, 'column': name, 'action': 'fill', 'value': value})
                    else: value = ''
                converted[rule.get('rename', name)] = value
                if value is not None and value != row[name] and rule.get('missing') != 'fill':
                    changes.append({'record': record_id, 'column': name, 'action': 'convert', 'before': row[name], 'after': value})
            except (ValueError, TypeError, OverflowError) as exc:
                raise ValueError(f'record {record_id}, column {name}: {exc}') from exc
        if dropped: continue
        values = tuple(converted[c] for c in output_columns)
        if values in seen and duplicate_policy == 'drop_exact':
            changes.append({'record': record_id, 'action': 'drop_exact_duplicate'}); continue
        identity = tuple(converted[k] for k in keys)
        if keys and (any(v == '' for v in identity) or identity in key_seen) and duplicate_policy != 'preserve':
            raise ValueError(f'record {record_id}: missing or duplicate key; needs an explicit policy')
        if values in seen and not keys and duplicate_policy == 'error':
            raise ValueError(f'record {record_id}: duplicate record; needs an explicit policy')
        seen.add(values); key_seen.add(identity); prepared.append(converted)
        mapping.append({'output_record': len(prepared), 'input_record': record_id})
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=destination.parent) as temp:
        folder = Path(temp)
        output = folder/'prepared.csv'
        with output.open('w', newline='', encoding='utf-8') as handle:
            writer = csv.DictWriter(handle, fieldnames=output_columns)
            writer.writeheader(); writer.writerows(prepared)
        audit = {'schema_version': 1, 'unit': spec['unit'], 'input_sha256': digest(source),
                 'output_sha256': digest(output), 'input_records': len(rows), 'output_records': len(prepared),
                 'removed_records': len(rows)-len(prepared), 'changes': changes, 'record_mapping': mapping,
                 'record_location': '1-based CSV data record, excluding header; not physical file line'}
        (folder/'audit.json').write_text(json.dumps(audit, ensure_ascii=False, indent=2)+'\n')
        (folder/'spec.json').write_text(json.dumps(spec, ensure_ascii=False, indent=2)+'\n')
        (folder/'report.md').write_text(f"# 数据准备\n\n观测单位：{spec['unit']}。输入 {len(rows)} 条，输出 {len(prepared)} 条，移除 {len(rows)-len(prepared)} 条。\n\n列规则、逐记录变化与来源映射见 spec.json 和 audit.json。原始输入保持不变。\n")
        Path(temp).rename(destination)
    return audit


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--input', required=True, type=Path)
    p.add_argument('--spec', required=True, type=Path)
    p.add_argument('--output-directory', required=True, type=Path)
    a = p.parse_args()
    try:
        result = prepare(a.input, json.loads(a.spec.read_text()), a.output_directory)
        print(json.dumps({k: result[k] for k in ('input_records', 'output_records', 'removed_records', 'output_sha256')}))
        return 0
    except (OSError, ValueError, KeyError, TypeError) as exc:
        p.exit(2, str(exc)+'\n')


if __name__ == '__main__': raise SystemExit(main())
