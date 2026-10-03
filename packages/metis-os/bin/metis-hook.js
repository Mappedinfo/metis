#!/usr/bin/env node
// JSON-only stdout is required by command-hook protocols. Diagnostics use stderr.
import { TextDecoder } from 'node:util';
import { handleHook, MAX_HOOK_BYTES } from '../lib/workflow-hooks.js';

try {
  const args = process.argv.slice(2);
  const options = {};
  for (let i = 0; i < args.length; i++) {
    const name = args[i];
    if (!['--runtime', '--project'].includes(name) || options[name] !== undefined || !args[i + 1] || args[i + 1].startsWith('--')) {
      throw new Error('Usage: metis-hook --runtime codex|dsh --project <absolute path>');
    }
    options[name] = args[++i];
  }
  if (!options['--runtime'] || !options['--project']) throw new Error('Both --runtime and --project are required');
  const chunks = [];
  let bytes = 0;
  for await (const chunk of process.stdin) {
    bytes += chunk.length;
    if (bytes > MAX_HOOK_BYTES) throw new Error(`Hook input exceeds ${MAX_HOOK_BYTES} bytes`);
    chunks.push(chunk);
  }
  const input = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks));
  const payload = JSON.parse(input);
  const output = await handleHook({ payload, runtime: options['--runtime'], root: options['--project'] });
  process.stdout.write(JSON.stringify(output) + '\n');
} catch (error) {
  process.stderr.write(`metis-hook: ${error.message}\n`);
  process.exitCode = 1;
}
