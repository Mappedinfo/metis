#!/usr/bin/env python3
"""只读核验通用本地运行契约，审查结果写到原件之外。"""
from __future__ import annotations
import argparse
import hashlib
import json
import re
import datetime as dt
from pathlib import Path


def digest(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def review(directory):
    root=Path(directory).resolve();manifest_path=root/'manifest.json'
    findings=[];limits=[]
    try:
        m=json.loads(manifest_path.read_text())
        if not isinstance(m,dict) or m.get('schema_version')!=1:raise ValueError('unsupported run manifest')
    except (OSError,ValueError) as exc:
        return {'schema_version':1,'verdict':'required_fix','execution_status':'unknown','scientific_status':'unverified','findings':[str(exc)],'limitations':[]}
    required_fields={'run_id','objective','kind','status','argv','inputs','required_outputs','artifacts','protocol_sha256','started_at','ended_at','exit_code','environment'}
    if required_fields-set(m):findings.append('Missing manifest fields: '+', '.join(sorted(required_fields-set(m))))
    if not isinstance(m.get('run_id'),str) or not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',m.get('run_id','')):findings.append('Malformed run_id')
    if not isinstance(m.get('environment'),dict):findings.append('Malformed environment record')
    if m.get('kind') not in {'smoke','evaluation','reproduction'}:findings.append('Unknown run kind')
    if m.get('status') not in {'running','succeeded','failed','timed_out','incomplete','cancelled'}:findings.append('Unknown execution status')
    if not isinstance(m.get('argv'),list) or not m.get('argv'):findings.append('Missing execution command')
    elif not all(isinstance(x,str) and x for x in m['argv']):findings.append('Malformed execution command')
    if not isinstance(m.get('objective'),str) or not m.get('objective'):findings.append('Missing objective')
    inputs=m.get('inputs',[])
    if not isinstance(inputs,list):findings.append('Input provenance malformed')
    else:
        for item in inputs:
            if not isinstance(item,dict) or not isinstance(item.get('path'),str) or not re.fullmatch('[a-f0-9]{64}',str(item.get('sha256',''))):findings.append('Malformed input provenance')
    for key in ('started_at','ended_at'):
        value=m.get(key)
        if value is None:
            if key=='started_at' or m.get('status')!='running':findings.append('Missing timestamp: '+key)
        else:
            try:
                if not isinstance(value,str) or dt.datetime.fromisoformat(value).tzinfo is None:raise ValueError()
            except (ValueError,TypeError):findings.append('Malformed timestamp: '+key)
    protocol=root/'protocol.json'
    if not protocol.is_file() or protocol.is_symlink() or digest(protocol)!=m.get('protocol_sha256'):findings.append('Protocol file missing or hash differs')
    artifacts=m.get('artifacts',[])
    if not isinstance(artifacts,list):findings.append('Artifact list malformed');artifacts=[]
    indexed={}
    for record in artifacts:
        if not isinstance(record,dict) or not isinstance(record.get('path'),str):findings.append('Malformed artifact record');continue
        name=record['path'];path=(root/name).resolve()
        if Path(name).is_absolute() or path==root or not path.is_relative_to(root):findings.append('Artifact escapes run directory: '+name);continue
        if name in indexed:findings.append('Duplicate artifact record: '+name)
        indexed[name]=record
        if not path.is_file():findings.append('Missing artifact: '+name)
        elif digest(path)!=record.get('sha256') or path.stat().st_size!=record.get('bytes'):findings.append('Artifact hash/size differs: '+name)
    required=m.get('required_outputs',[])
    if not isinstance(required,list) or not required:findings.append('No required outputs declared');required=[]
    for name in required:
        if not isinstance(name,str):findings.append('Malformed required output');continue
        if name not in indexed or not isinstance(indexed[name].get('bytes'),int) or indexed[name]['bytes']<=0:findings.append('Required nonempty output missing: '+name)
    for log in ('stdout.log','stderr.log'):
        if log not in indexed:findings.append('Log provenance missing: '+log)
    status=m.get('status','unknown')
    if status=='succeeded' and (m.get('exit_code')!=0 or not m.get('ended_at')):findings.append('Successful status contradicts exit code or end time')
    if m.get('missing_outputs') and status=='succeeded':findings.append('Successful status contradicts missing outputs')
    if m.get('kind')=='smoke':limits.append('Smoke execution does not verify a scientific result.')
    limits.extend(m.get('limitations',[]) if isinstance(m.get('limitations'),list) else [])
    limits.append('This check verifies local files, not metric meaning, causal claims, external citations or agreement with a paper.')
    verdict='required_fix' if findings else ('rerun' if status in {'failed','timed_out','cancelled','running','incomplete'} else 'accept_with_limits')
    return {'schema_version':1,'run_id':m.get('run_id'),'manifest_sha256':digest(manifest_path),
            'verdict':verdict,'execution_status':status,'scientific_status':'unverified',
            'findings':findings,'limitations':list(dict.fromkeys(limits)),
            'next_check':'Inspect metric definitions, denominators, baselines, uncertainty and the claimed outcome against the protocol and source evidence.'}


def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('run_directory',type=Path)
    p.add_argument('--output-directory',type=Path,required=True);a=p.parse_args()
    try:
        result=review(a.run_directory)
        if a.output_directory.exists():raise ValueError('review output exists; preserve it and use a new directory')
        if a.output_directory.resolve().is_relative_to(a.run_directory.resolve()):raise ValueError('write review outside original run root')
        a.output_directory.mkdir(parents=True)
        (a.output_directory/'review.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
        (a.output_directory/'review.md').write_text('# 运行审查\n\n执行状态：'+result['execution_status']+'；完整性结论：'+result['verdict']+'；科学结果：尚未验证。\n\n'+ '\n'.join('- '+x for x in result['findings']+result['limitations'])+'\n')
        print(json.dumps({'verdict':result['verdict'],'execution_status':result['execution_status']}))
        return 0 if result['verdict'] in {'accept','accept_with_limits'} else 1
    except (OSError,ValueError,TypeError) as exc:p.exit(2,str(exc)+'\n')


if __name__=='__main__':raise SystemExit(main())
