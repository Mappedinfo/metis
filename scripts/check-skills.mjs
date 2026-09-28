#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkSkills, writeResults } from './lib/skill-contract.mjs';

const help = `Usage: npm run skills:check -- [--root <collection>] [--out <directory>] [--domain <tag>]

Audits the whole collection against skill-contract.json and writes skills.json,
graph.json and audit.json. --domain filters output skills/graph after auditing;
referenced profile nodes remain visible. Artifact declarations are checked for
presence and structure only. The default root is this repository; output defaults
to <root>/.atlas. Exit status is nonzero when audit diagnostics contain errors;
warnings (for example unlabeled Requirements items) are reported but do not fail.
`;

function main(argv) {
  const options = { root: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..') };
  for (let index = 0; index < argv.length; index++) {
    const option = argv[index];
    if (option === '--help' || option === '-h') { process.stdout.write(help); return; }
    if (!['--root', '--out', '--domain'].includes(option)) throw new Error(`Unknown argument: ${option}`);
    if (!argv[index + 1] || argv[index + 1].startsWith('--')) throw new Error(`${option} requires a value.`);
    options[option.slice(2)] = argv[++index];
  }
  options.root = path.resolve(options.root);
  const out = path.resolve(options.out || path.join(options.root, '.atlas'));
  const result = checkSkills(options);
  writeResults(out, result);
  console.log(`${result.audit.ok ? 'PASS' : 'FAIL'}: ${result.audit.counts.skills} skills, ${result.audit.counts.profiles} profiles, ${result.audit.counts.errors} errors, ${result.audit.counts.warnings ?? 0} warnings.`);
  console.log(`Wrote skills.json, graph.json and audit.json to ${out}`);
  for (const item of result.audit.diagnostics) console.error(`[${item.severity || 'error'}] ${item.file}: ${item.code}: ${item.message}`);
  if (!result.audit.ok) process.exitCode = 1;
}

try { main(process.argv.slice(2)); } catch (error) {
  console.error(`skills:check: ${error.message}`);
  process.exitCode = 1;
}
