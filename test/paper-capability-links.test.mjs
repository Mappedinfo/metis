import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const meta = (path) => YAML.parse(read(path).split('---')[1]);

test('paper deck dependency resolves to an actual deck profile, independent of installation location', () => {
  const skill = meta('skills/taskbook-slides/SKILL.md');
  assert.ok(skill.uses.includes('profiles/deck'));
  const deck = YAML.parse(read('profiles/deck.yaml'));
  assert.equal(deck.name, 'deck');
  assert.equal(deck.deck.aspect, '16:9');
  assert.ok(deck.typography.base_size_pt >= 18);
});

test('each paper preset resolves its maintained execution guide in both languages', () => {
  const targets = {
    interpret: 'taskbook-interpret', authors: 'taskbook-authors',
    paper2ppt: 'taskbook-slides', reproduce: 'taskbook-reproduce',
  };
  for (const [preset, target] of Object.entries(targets)) {
    for (const suffix of ['md', 'zh.md']) {
      const relative = `skills/research-taskbook/references/presets/${preset}.${suffix}`;
      const source = read(relative);
      const local = [...source.matchAll(/\]\((\.\.\/[^)]+)\)/g)]
        .map((match) => resolve(dirname(resolve(root, relative)), match[1]));
      assert.equal(local.length, 1, relative);
      assert.equal(local[0], resolve(root, `skills/${target}/SKILL.${suffix}`));
      assert.ok(existsSync(local[0]));
      assert.ok(source.includes(`/skills/${target}/SKILL.md`), 'portable fallback is explicit');
    }
  }
});

test('ScanSci routes use the verified queue API instead of the absent tool identity', () => {
  for (const suffix of ['md', 'zh.md']) {
    const source = read(`skills/scansci-pdf/SKILL.${suffix}`);
    assert.ok(!source.includes('scansci_pdf_verify_identifiers'));
    assert.ok(source.includes('scansci_pdf_prepare_queue(action="verify")'));
  }
});

test('conditional genre guidance is shipped with the short-writing skill in both languages', () => {
  for (const suffix of ['md', 'zh.md']) {
    const path = `skills/source-brief/SKILL.${suffix}`;
    const source = read(path);
    const match = [...source.matchAll(/\]\((references\/genre-fit[^)]+)\)/g)];
    assert.equal(match.length, 1);
    const target = resolve(dirname(resolve(root, path)), match[0][1]);
    assert.ok(existsSync(target));
    assert.ok(readFileSync(target, 'utf8').includes('MIT'));
  }
});
