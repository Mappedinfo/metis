// 独立虚构数据行为检查：实际 CLI、原件保护与失败边界，不声明科学成功。
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const root = resolve(import.meta.dirname ?? new URL('.', import.meta.url).pathname, '..');
const helpers = Object.fromEntries(['data-preparation/prepare', 'exploratory-analysis/describe', 'experiment-run/run', 'run-review/review'].map(value => {
  const [skill, script] = value.split('/'); return [script, join(root, 'skills', skill, 'scripts', script + '.py')];
}));
const pythonCall = args => spawnSync('uv', ['run', '--offline', '--no-project', 'python', ...args], { cwd: root, encoding: 'utf8', timeout: 15000 });
const python = pythonCall(['-c', 'import sys;print(sys.executable)']).stdout.trim();
const receiptRoot = process.env.METIS_NUMERIC_RECEIPTS ? resolve(process.env.METIS_NUMERIC_RECEIPTS) : null;
if (receiptRoot) mkdirSync(receiptRoot, { recursive: true });
const sha = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const json = path => JSON.parse(readFileSync(path, 'utf8'));
const treeHashes = dir => Object.fromEntries(readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? Object.entries(treeHashes(join(dir, entry.name))).map(([key, hash]) => [entry.name + '/' + key, hash]) : [[entry.name, sha(join(dir, entry.name))]]));
const tempCase = (name, body) => test(name, () => {
  const folder = mkdtempSync(join(receiptRoot ?? tmpdir(), 'metis-numeric-behavior-'));
  try { body(folder); } finally { if (!receiptRoot) rmSync(folder, { recursive: true, force: true }); }
});
let callIndex = 0;
function call(script, args) {
  const argv = [helpers[script], ...args]; const output = pythonCall(argv);
  if (receiptRoot) writeFileSync(join(receiptRoot, `actual-cli-${++callIndex}.json`), JSON.stringify({ launcher: ['uv', 'run', '--offline', '--no-project', 'python'], argv, exit_code: output.status, stdout: output.stdout, stderr: output.stderr }, null, 2) + '\n');
  assert.equal(output.error, undefined, output.error?.message); return output;
}
function protocol(folder, name, code, extra = {}) {
  const project = join(folder, 'project'); mkdirSync(project, { recursive: true });
  writeFileSync(join(project, 'input.txt'), 'fictional input only\n');
  const spec = { schema_version: 1, run_id: name, objective: '验证虚构入口及失败边界', kind: 'smoke', argv: [python, '-c', code], timeout_seconds: 3, seed: 7, inputs: ['input.txt'], required_outputs: ['result.txt'], ...extra };
  const path = join(folder, name + '.json'); writeFileSync(path, JSON.stringify(spec));
  const output = join(folder, 'runs');
  const command = call('run', ['--spec', path, '--project-root', project, '--output-directory', output]);
  return { command, runDir: join(output, name), spec, project };
}
function audit(runDir, destination) { return call('review', [runDir, '--output-directory', destination]); }
const writesResult = "from pathlib import Path;Path('result.txt').write_text('fictional result, no scientific claim\\n');print('executed')";

tempCase('显式填值、删除及精确去重保留来源映射', folder => {
  const source = join(folder, 'input.csv'); writeFileSync(source, 'id,score,gate\na,10,ok\nb,,ok\nc,8,\na,10,ok\n'); const before = sha(source);
  const spec = { schema_version: 1, unit: 'fictional record', columns: { id: { type: 'string' }, score: { type: 'number', rename: 'amount', missing: 'fill', fill: 0 }, gate: { type: 'string', missing: 'drop_row' } }, keys: ['id'], duplicates: 'drop_exact' };
  const specFile = join(folder, 'spec.json'); writeFileSync(specFile, JSON.stringify(spec)); const destination = join(folder, 'prepared');
  const result = call('prepare', ['--input', source, '--spec', specFile, '--output-directory', destination]); assert.equal(result.status, 0, result.stderr);
  const receipt = json(join(destination, 'audit.json')); assert.equal(receipt.input_records, 4); assert.equal(receipt.output_records, 2); assert.equal(receipt.removed_records, 2);
  assert.deepEqual(receipt.record_mapping, [{ output_record: 1, input_record: 1 }, { output_record: 2, input_record: 2 }]);
  assert.ok(receipt.changes.some(change => change.record === 2 && change.action === 'fill' && Number(change.value) === 0));
  assert.ok(receipt.changes.some(change => change.record === 3 && change.action === 'drop_row_missing')); assert.ok(receipt.changes.some(change => change.record === 4 && change.action === 'drop_exact_duplicate'));
  assert.equal(receipt.input_sha256, before); assert.equal(receipt.output_sha256, sha(join(destination, 'prepared.csv'))); assert.equal(sha(source), before);
  assert.match(readFileSync(join(destination, 'prepared.csv'), 'utf8'), /id,amount,gate/);
});
for (const [name, data] of [['重复键与不同数据拒绝静默保留', 'id,x\na,1\na,2\n'], ['非数值拒绝静默转换', 'id,x\na,bad\n'], ['非有限数值拒绝', 'id,x\na,Infinity\n']]) tempCase(name, folder => {
  const source = join(folder, 'input.csv'); writeFileSync(source, data); const before = sha(source);
  const spec = join(folder, 'spec.json'); writeFileSync(spec, JSON.stringify({ schema_version: 1, unit: 'fictional record', columns: { id: { type: 'string' }, x: { type: 'number' } }, keys: ['id'], duplicates: 'drop_exact' }));
  const output = join(folder, 'prepared'); const result = call('prepare', ['--input', source, '--spec', spec, '--output-directory', output]); assert.notEqual(result.status, 0); assert.equal(existsSync(output), false); assert.equal(sha(source), before);
});
tempCase('EDA 分母按有效列和完整配对，常数无相关，异常不删', folder => {
  const source = join(folder, 'input.csv'); writeFileSync(source, 'id,x,y,k\na,1,10,7\nb,2,,7\nc,,30,7\nd,3,20,7\ne,100,100,7\nf,4,,7\n'); const before = sha(source); const output = join(folder, 'eda');
  const result = call('describe', ['--input', source, '--numeric', 'x', 'y', 'k', '--identifier', 'id', '--unit', 'fictional record', '--output-directory', output]); assert.equal(result.status, 0, result.stderr);
  const d = json(join(output, 'diagnostics.json')); assert.equal(d.records, 6); assert.equal(d.columns.x.n, 5); assert.equal(d.columns.x.missing, 1); assert.equal(d.columns.y.n, 4);
  const xy = d.associations.find(a => a.left === 'x' && a.right === 'y'); assert.equal(xy.complete_pairs, 3);
  const constant = d.associations.find(a => a.right === 'k'); assert.equal(constant.pearson_r, null); assert.match(constant.undefined_reason, /constant/);
  assert.equal(d.columns.k.constant, true); assert.ok(d.columns.x.tukey_flagged_records.includes(5)); assert.equal(sha(source), before);
});
tempCase('EDA 不接收未准备的数值资料', folder => {
  const source = join(folder, 'input.csv'); writeFileSync(source, 'x\ntext\n'); const result = call('describe', ['--input', source, '--numeric', 'x', '--unit', 'fictional record', '--output-directory', join(folder, 'eda')]); assert.notEqual(result.status, 0); assert.equal(existsSync(join(folder, 'eda')), false);
});
tempCase('退出零且必需产物齐全只证明执行与完整性', folder => {
  const { command, runDir } = protocol(folder, 'success', writesResult); assert.equal(command.status, 0, command.stderr); const m = json(join(runDir, 'manifest.json')); assert.equal(m.status, 'succeeded'); assert.equal(m.exit_code, 0);
  const original = treeHashes(runDir); const output = join(folder, 'review'); const check = audit(runDir, output); assert.equal(check.status, 0, check.stderr); const r = json(join(output, 'review.json')); assert.equal(r.verdict, 'accept_with_limits'); assert.equal(r.scientific_status, 'unverified'); assert.deepEqual(treeHashes(runDir), original);
});
tempCase('非零退出有产物仍为执行失败', folder => {
  const { command, runDir } = protocol(folder, 'failed', writesResult + ';raise SystemExit(9)'); assert.equal(command.status, 1); const m = json(join(runDir, 'manifest.json')); assert.equal(m.status, 'failed'); assert.equal(m.exit_code, 9); assert.ok(m.artifacts.some(a => a.path === 'result.txt'));
  const output = join(folder, 'review'); audit(runDir, output); const r = json(join(output, 'review.json')); assert.notEqual(r.verdict, 'accept_with_limits'); assert.equal(r.scientific_status, 'unverified');
});
tempCase('退出零缺产物不能标成功', folder => {
  const { command, runDir } = protocol(folder, 'missing', "print('only a process receipt')"); assert.equal(command.status, 1); const m = json(join(runDir, 'manifest.json')); assert.equal(m.status, 'incomplete'); assert.deepEqual(m.missing_outputs, ['result.txt']);
  const output = join(folder, 'review'); assert.notEqual(audit(runDir, output).status, 0); assert.notEqual(json(join(output, 'review.json')).verdict, 'accept_with_limits');
});
tempCase('超时终止运行进程及其子进程', folder => {
  const code = "import subprocess,sys,time;from pathlib import Path;p=subprocess.Popen([sys.executable,'-c',\"import time;from pathlib import Path;Path('child-started.txt').write_text('started');time.sleep(20)\"]);Path('child.pid').write_text(str(p.pid));time.sleep(20)";
  const { command, runDir } = protocol(folder, 'timeout', code, { timeout_seconds: 1, required_outputs: ['child-started.txt'] }); assert.equal(command.status, 1); const m = json(join(runDir, 'manifest.json')); assert.equal(m.status, 'timed_out');
  const pid = readFileSync(join(runDir, 'child.pid'), 'utf8').trim(); const probe = spawnSync('ps', ['-o', 'stat=', '-p', pid], { encoding: 'utf8' }); assert.ok(probe.status !== 0 || probe.stdout.trim() === '' || probe.stdout.trim().startsWith('Z'), 'timeout descendant still executing: ' + probe.stdout);
});
tempCase('篡改产物哈希必须拒绝，审查不改原件', folder => {
  const { runDir } = protocol(folder, 'tamper', writesResult); writeFileSync(join(runDir, 'result.txt'), 'tampered'); const original = treeHashes(runDir); const output = join(folder, 'review'); assert.equal(audit(runDir, output).status, 1); const r = json(join(output, 'review.json')); assert.equal(r.verdict, 'required_fix'); assert.ok(r.findings.some(f => /hash\/size differs/.test(f))); assert.deepEqual(treeHashes(runDir), original);
});
tempCase('畸形 manifest 不是可接受运行', folder => {
  const runDir = join(folder, 'bad'); mkdirSync(runDir); writeFileSync(join(runDir, 'manifest.json'), '{'); const original = treeHashes(runDir); const output = join(folder, 'review'); assert.equal(audit(runDir, output).status, 1); assert.equal(json(join(output, 'review.json')).verdict, 'required_fix'); assert.deepEqual(treeHashes(runDir), original);
});
tempCase('自洽哈希不能掩盖空 run_id 和畸形环境', folder => {
  const { runDir } = protocol(folder, 'schema', writesResult); const file = join(runDir, 'manifest.json'); const m = json(file); m.run_id = ''; m.environment = 'invalid environment'; m.started_at = null; writeFileSync(file, JSON.stringify(m));
  const original = treeHashes(runDir); const output = join(folder, 'review'); assert.notEqual(audit(runDir, output).status, 0); assert.equal(json(join(output, 'review.json')).verdict, 'required_fix'); assert.deepEqual(treeHashes(runDir), original);
});
tempCase('审查输出必须位于原件根目录之外', folder => {
  const { runDir } = protocol(folder, 'outside', writesResult); const original = treeHashes(runDir); const output = join(runDir, 'nested-review'); const check = audit(runDir, output); assert.notEqual(check.status, 0); assert.equal(existsSync(output), false); assert.deepEqual(treeHashes(runDir), original);
});
