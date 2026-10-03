# Skills Catalog

The `skills/` directory holds public, generic agent skills. Each skill is a
directory with a `SKILL.md` (frontmatter: `name`, `description`) following
the [agentskills.io](https://agentskills.io) format.

All nine current skills use `SKILL.md` for the authoritative English
workflow and `SKILL.zh.md` for an editable Chinese translation. Either file
may be edited first; synchronize workflow changes across the pair, and follow
English when they conflict. Output language still follows the user and the
skill's declared scope. See the
[language workflow](https://github.com/mappedinfo/metis/blob/main/CONTRIBUTING.md#skill-languages)
and [migration status](https://github.com/mappedinfo/metis/blob/main/HANDOFF.md).

Install them into your agents (Claude Code, Codex, Cursor, …) with:

```bash
npx skills add mappedinfo/metis
```

Visual skills also need the shared profiles installed into the project they
work in. Skill installation does not copy the repository's sibling
`profiles/` directory. See the
[profile installation instructions](https://github.com/mappedinfo/metis/blob/main/profiles/README.md)
for the `metis-os profiles install` command and source-checkout entry.

## Admission criteria

A skill belongs in metis only if **all** of the following hold:

1. **Generic.** It encodes reusable craft, not one person's identity,
   preferences, private projects or private data. Personal overlays belong in
   `USER.md`, never in a skill.
2. **Self-contained.** It works without access to any private repository, vault
   or service. External dependencies must be public and named.
3. **Honest.** Instructions must not ask the agent to invent evidence,
   fabricate citations, or misrepresent capability.
4. **Scoped.** One capability per skill. If a description needs "and also…"
   twice, it is two skills.
5. **Writable description.** The frontmatter `description` says when to use the
   skill and when *not* to, in the third person, without marketing language.
6. **Artifact-anchored.** The required `artifacts` frontmatter names concrete,
   verifiable deliverables — a downloaded PDF, a figure, a deck, a runnable
   package or a planning note with acceptance criteria. The description or
   Output contract explains the output and how to check it.

Every skill also belongs to exactly one of seven capability categories —
`acquire` · `analyze` · `compose` · `visualize` · `present` · `build` ·
`meta`. Categories are capability domains, not scenarios: a paper or a deck
is a *combination* of skills. Shared style (palette, typography) lives once
in
[`profiles/`](https://github.com/mappedinfo/metis/tree/main/profiles) and is
referenced with `uses:`. Each output keeps the profile for its audience and
format; a journal figure and a presentation deck can share palette and font
roles while retaining different type sizes and export defaults. Profile IDs
resolve in the current project root's `profiles/` directory.

Skills also carry two controlled tag axes in frontmatter — `domain`
(1–2 values, e.g. `writing`, `figure`, `data-analysis`) and `action`
(1–3 values, e.g. `create`, `review`, `transform`). The controlled vocabulary
lives in
[skill-contract.json](https://github.com/mappedinfo/metis/blob/main/skill-contract.json).
The authoritative admission criteria live in
[skills/README.md](https://github.com/mappedinfo/metis/blob/main/skills/README.md).

## Validation

Contributors run `npm run skills:check` from the repository root. The
repository adapter builds on the published `metis-atlas@0.1.0` scanner and
writes `.atlas/skills.json`, `.atlas/graph.json` and `.atlas/audit.json`.
It checks controlled vocabulary, nonempty `artifacts` declarations, and
`uses:` references to skills and profiles. It does not judge output quality
or establish that a task was completed.

`npm run skills:check -- --domain paper` exports a domain view after auditing
the full collection. Native `npx metis-atlas scan` in version 0.1.0 does not
provide these metis contract and profile dependency checks.

## Catalog

For concrete inputs, deliverables and verification boundaries, see
[基础能力 / Minimal skills](minimal-skills.md).

| Skill | Category | Domain | Description |
|---|---|---|---|
| `scansci-pdf` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/scansci-pdf/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/scansci-pdf/SKILL.zh.md) | acquire | literature | Academic paper acquisition via the scansci-pdf MCP server (17 tools): search, verify, cite, download (Apache-2.0, vendored with provenance) |
| `taskbook-authors` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/taskbook-authors/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/taskbook-authors/SKILL.zh.md) | acquire | literature, research-design | 学术圈探索：论文作者档案（机构/方向/代表作附来源）+ works.bib，来源纪律宁缺毋假 |
| `taskbook-interpret` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/taskbook-interpret/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/taskbook-interpret/SKILL.zh.md) | analyze | paper, literature | 单篇论文结构化精读：八节精读笔记 + 参考文献三类整理（AI 补充逐条标待核实） |
| `source-brief` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/source-brief/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/source-brief/SKILL.zh.md) | compose | writing, knowledge | Given sources → a short brief or revised draft, with a claim-to-source map and evidence-preserving wording |
| `table-chart` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/table-chart/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/table-chart/SKILL.zh.md) | visualize | figure, data-analysis | Prepared CSV → chart/layout/palette alternatives and reproducible bar, dot, line, scatter, histogram, box or heatmap exports |
| `taskbook-slides` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/taskbook-slides/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/taskbook-slides/SKILL.zh.md) | present | slides, paper | 论文转中文组会汇报 PPT（10–15 页带演讲者备注，内容忠于原文） |
| `taskbook-reproduce` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/taskbook-reproduce/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/taskbook-reproduce/SKILL.zh.md) | build | experiment, paper | 复现准备：逐图表计划 + 数据可得性方案（缺失零编造）+ 可运行 src/ 脚手架 |
| `research-taskbook` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/research-taskbook/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/research-taskbook/SKILL.zh.md) | meta | research-design, workflow-meta | 把模糊研究问题翻译成任务书：澄清追问 → 形态判定 → 三要素原子任务 → 红线；含 4 份预设 |
| `metis-router` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/metis-router/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/metis-router/SKILL.zh.md) | meta | workflow-meta | Composes skills for multi-stage tasks: one primary + ≤2 supports per phase, profiles for shared style, artifacts per phase |

Every skill is a bounded SOP: a `## When to stop` section names the
budget and termination criteria, `## Requirements` lists [B]/[A]-labeled
verifiable items, and unbounded-loop phrasing fails `skills:check`. See
[CONTRIBUTING.md](https://github.com/mappedinfo/metis/blob/main/CONTRIBUTING.md)
for the template.

The router bundles a reusable
[requirements ledger](https://github.com/mappedinfo/metis/blob/main/skills/metis-router/templates/requirements-ledger.md).
At close-out, each accepted task and skill requirement has `done`, `blocked`
or `n/a` plus evidence or a reason. `n/a` applies only outside the accepted
scope; it cannot waive a required user outcome. Planning-only work checks
the plan and identifies downstream execution as unperformed. Budget
exhaustion reports completed items, unfinished items and the smallest
unblock condition; it does not establish task completion. The declaration
lint does not verify execution ledgers or their evidence.

## Contributing

Open a PR with **one skill per PR**. Expect review on admission criteria 1–6
above. See
[skills/README.md](https://github.com/mappedinfo/metis/blob/main/skills/README.md)
for the tag vocabulary and format details.
