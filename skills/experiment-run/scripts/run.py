#!/usr/bin/env python3
"""运行显式本地协议，记录退出、超时与必需产物；不判定科学结论。"""
from __future__ import annotations
import argparse
import datetime as dt
import hashlib
import json
import os
import platform
import re
import shutil
import signal
import subprocess
import sys
from pathlib import Path


def digest(path): return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def now(): return dt.datetime.now(dt.timezone.utc).isoformat()


def contained(root, name):
    if not isinstance(name,str) or not name or Path(name).is_absolute(): raise ValueError('artifact paths must be relative')
    path=(root/name).resolve()
    if not path.is_relative_to(root.resolve()) or path == root.resolve(): raise ValueError('artifact path escapes its root')
    return path


def run(spec_path, project, output):
    spec_path,project,output=Path(spec_path),Path(project).resolve(),Path(output).resolve()
    spec=json.loads(spec_path.read_text())
    allowed={'schema_version','run_id','objective','kind','argv','timeout_seconds','seed','inputs','required_outputs','environment'}
    if set(spec)-allowed or spec.get('schema_version') != 1: raise ValueError('unsupported protocol fields/version')
    run_id=spec.get('run_id','')
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',run_id): raise ValueError('run_id must be a lowercase slug')
    if not spec.get('objective') or spec.get('kind') not in {'smoke','evaluation','reproduction'}: raise ValueError('objective and kind required')
    argv=spec.get('argv'); required=spec.get('required_outputs'); timeout=spec.get('timeout_seconds')
    if not isinstance(argv,list) or not argv or not all(isinstance(x,str) and x for x in argv): raise ValueError('argv must be a nonempty string array; no shell')
    if not isinstance(timeout,(int,float)) or isinstance(timeout,bool) or not 0<timeout<=86400: raise ValueError('timeout_seconds must be positive and at most one day')
    if not isinstance(required,list) or not required or not all(isinstance(x,str) for x in required) or len(set(required))!=len(required): raise ValueError('declare distinct required_outputs')
    run_dir=output/run_id
    if run_dir.exists(): raise ValueError('run directory exists; preserve it and choose a new run_id')
    for name in required: contained(run_dir,name)
    if set(required)&{'manifest.json','protocol.json','stdout.log','stderr.log'}: raise ValueError('required output collides with runner records')
    inputs=[]
    for name in spec.get('inputs',[]):
        source=contained(project,name)
        if not source.is_file(): raise ValueError('missing declared input: '+name)
        inputs.append({'path':name,'sha256':digest(source)})
    custom_env=spec.get('environment',{})
    if not isinstance(custom_env,dict) or not all(isinstance(k,str) and isinstance(v,str) for k,v in custom_env.items()): raise ValueError('environment must be a string map')
    if any(re.search(r'KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL',k,re.I) for k in custom_env): raise ValueError('keep credentials outside saved protocols')
    reserved={'PATH','HOME','CODEX_HOME','METIS_RUN_DIR'}
    if set(custom_env)&reserved: raise ValueError('environment cannot replace runner/runtime roots')
    if 'seed' in spec and (not isinstance(spec['seed'],int) or isinstance(spec['seed'],bool)): raise ValueError('seed must be an integer')
    environment={k:v for k,v in os.environ.items() if k in {'PATH','LANG','LC_ALL','TMPDIR','SYSTEMROOT'}}
    environment.update(custom_env)
    if 'seed' in spec: environment['PYTHONHASHSEED']=str(spec['seed'])
    environment['METIS_RUN_DIR']=str(run_dir)
    actual_argv=[x.replace('{project_root}',str(project)).replace('{run_dir}',str(run_dir)) for x in argv]
    if any(re.search(r'\{(?:project_root|run_dir)\}',x) for x in actual_argv): raise ValueError('unresolved runner placeholder')
    run_dir.mkdir(parents=True)
    (run_dir/'protocol.json').write_text(json.dumps(spec,ensure_ascii=False,indent=2)+'\n')
    manifest={'schema_version':1,'run_id':run_id,'objective':spec['objective'],'kind':spec['kind'],
              'status':'running','started_at':now(),'ended_at':None,'argv':argv,'timeout_seconds':timeout,
              'exit_code':None,'seed':spec.get('seed'),'inputs':inputs,'required_outputs':required,'artifacts':[],
              'protocol_sha256':digest(run_dir/'protocol.json'),
              'environment':{'launcher_python':platform.python_version(),'platform':platform.platform(),
                             'command_executable':shutil.which(actual_argv[0],path=environment.get('PATH')),
                             'declared_nonsecret_variables':custom_env},'limitations':[]}
    manifest_path=run_dir/'manifest.json'
    def save(): manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    save()
    with (run_dir/'stdout.log').open('wb') as stdout,(run_dir/'stderr.log').open('wb') as stderr:
        try:
            process=subprocess.Popen(actual_argv,cwd=run_dir,env=environment,stdout=stdout,stderr=stderr,start_new_session=os.name=='posix')
            try:
                process.wait(timeout=timeout)
                manifest['exit_code']=process.returncode
                manifest['status']='succeeded' if process.returncode==0 else 'failed'
            except subprocess.TimeoutExpired:
                if os.name=='posix': os.killpg(process.pid,signal.SIGKILL)
                else: process.kill()
                process.wait();manifest['exit_code']=process.returncode;manifest['status']='timed_out'
        except OSError as exc:
            manifest['status']='failed';manifest['launch_error']=str(exc)
    manifest['ended_at']=now();missing=[]
    for name in required:
        try: path=contained(run_dir,name)
        except ValueError: missing.append(name);continue
        if not path.is_file() or path.stat().st_size==0: missing.append(name)
        else: manifest['artifacts'].append({'path':name,'sha256':digest(path),'bytes':path.stat().st_size})
    manifest['missing_outputs']=missing
    if missing and manifest['status']=='succeeded':manifest['status']='incomplete'
    for name in ('stdout.log','stderr.log'):
        path=run_dir/name;manifest['artifacts'].append({'path':name,'sha256':digest(path),'bytes':path.stat().st_size})
    if manifest['kind']=='smoke':manifest['limitations'].append('A smoke run checks the entry and artifacts, not a scientific result.')
    manifest['limitations'].append('Launcher metadata is not a complete dependency environment; inspect actual runtime and lockfiles separately.')
    save();return manifest


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--spec',required=True,type=Path);p.add_argument('--project-root',required=True,type=Path)
    p.add_argument('--output-directory',required=True,type=Path);a=p.parse_args()
    try:
        result=run(a.spec,a.project_root,a.output_directory)
        print(json.dumps({'run_id':result['run_id'],'status':result['status'],'missing_outputs':result['missing_outputs']}))
        return 0 if result['status']=='succeeded' else 1
    except (OSError,ValueError,KeyError,TypeError) as exc:p.exit(2,str(exc)+'\n')


if __name__=='__main__':raise SystemExit(main())
