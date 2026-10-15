# Skills Catalog

The `skills/` directory holds public, generic agent skills. Each skill is a
directory with a `SKILL.md` (frontmatter: `name`, `description`) following
the [agentskills.io](https://agentskills.io) format.

Each skill uses `SKILL.md` as its sole discovery entry and declares the role
of `SKILL.zh.md`. `prose-audit` has separately authored English and Chinese
processing guides under one shared review framework; other skills retain
their current language conventions. Shared requirements stay synchronized,
while language-specific methods and examples may differ. The reviewed
prose determines the processing method; output language follows the user
and the skill's declared scope. See the
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

当前源码包含 24 项公共技能。安装链接、宿主发现、指南读取和产物验收分别核对；
实施范围与验证证据见[体系升级台账](skill-system-upgrade.md)。

For concrete inputs, deliverables and verification boundaries, see
[基础能力 / Minimal skills](minimal-skills.md).

| Skill | Category | Domain | Description |
|---|---|---|---|
| `scansci-pdf` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/scansci-pdf/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/scansci-pdf/SKILL.zh.md) | acquire | literature | Academic paper acquisition via the scansci-pdf MCP server（以实际工具发现为准）: search, verify, cite, download (Apache-2.0, vendored with provenance) |
| `taskbook-authors` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/taskbook-authors/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/taskbook-authors/SKILL.zh.md) | acquire | literature, research-design | 学术圈探索：论文作者档案（机构/方向/代表作附来源）+ works.bib，来源纪律宁缺毋假 |
| `taskbook-interpret` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/taskbook-interpret/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/taskbook-interpret/SKILL.zh.md) | analyze | paper, literature | 单篇全文精读、局部问题或批注；贡献类型与证据对应，全文模式保留完整阅读验收 |
| `pdf-annotater-researcher` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/pdf-annotater-researcher/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/pdf-annotater-researcher/SKILL.zh.md) | analyze | paper, literature | 论文 PDF 原位精读标注：逐段/关键句/图表/公式的原生高亮＋页边弹注＋书签写入 PDF 本身；先读后注、图表看图后描述，副本应用＋双验收＋覆盖率报告 |
| `source-brief` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/source-brief/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/source-brief/SKILL.zh.md) | compose | writing, knowledge | Given sources → a short brief or revised draft, with a claim-to-source map and evidence-preserving wording |
| `table-chart` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/table-chart/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/table-chart/SKILL.zh.md) | visualize | figure, data-analysis | Prepared CSV → chart/layout/palette alternatives and reproducible bar, dot, line, scatter, histogram, box or heatmap exports |
| `scientific-plot` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/scientific-plot/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/scientific-plot/SKILL.zh.md) | visualize | figure, data-analysis | 数组、计算结果、教学演示与自定义面板 → 可复现图件、项目 profile 与视觉验收 |
| `taskbook-slides` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/taskbook-slides/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/taskbook-slides/SKILL.zh.md) | present | slides, paper | 论文转中文组会汇报 PPT（10–15 页带演讲者备注，内容忠于原文） |
| `taskbook-reproduce` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/taskbook-reproduce/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/taskbook-reproduce/SKILL.zh.md) | build | experiment, paper | 复现准备：逐图表计划 + 数据可得性方案（缺失零编造）+ 可运行 src/ 脚手架 |
| `research-taskbook` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/research-taskbook/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/research-taskbook/SKILL.zh.md) | meta | research-design, workflow-meta | 把模糊研究问题翻译成任务书：澄清追问 → 形态判定 → 三要素原子任务 → 红线；含 4 份预设 |
| `metis-router` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/metis-router/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/metis-router/SKILL.zh.md) | meta | workflow-meta | Composes skills for multi-stage tasks: one primary + ≤2 supports per phase, profiles for shared style, artifacts per phase |
| `review-advance` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/review-advance/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/review-advance/SKILL.zh.md) | meta | project-ops, workflow-meta | Evidence-based retrospective → substantive summary, one authorized next action and a verifiable plan; optional research and learning review |
| `prose-audit` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/prose-audit/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/prose-audit/SKILL.zh.md) | compose | writing, review-qa | Contextual Chinese/English wording review and minimal revision, with a local candidate scanner; no AI-authorship verdict |

| `concept-note` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/concept-note/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/concept-note/SKILL.zh.md) | compose | knowledge, writing | 问题驱动的概念／方法笔记、来源定位与理解边界 |
| `literature-synthesis` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/literature-synthesis/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/literature-synthesis/SKILL.zh.md) | analyze | literature, paper | 已确定文献集合的证据矩阵、综合结论、冲突与空白 |
| `research-question` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/research-question/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/research-question/SKILL.zh.md) | analyze | research-design, paper | 研究问题、竞争解释、可检验试验与否决条件 |
| `research-diagram` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/research-diagram/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/research-diagram/SKILL.zh.md) | visualize | figure, research-design | 方法／机制语义；默认 Mermaid＋SVG，按请求提供 draw.io |
| `data-preparation` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/data-preparation/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/data-preparation/SKILL.zh.md) | analyze | data-analysis | 观测单位、显式转换规则、准备后数据与逐记录变更审计 |
| `exploratory-analysis` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/exploratory-analysis/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/exploratory-analysis/SKILL.zh.md) | analyze | data-analysis | 描述诊断、异常与分析限制；探索结果保留证据边界 |
| `experiment-run` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/experiment-run/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/experiment-run/SKILL.zh.md) | build | experiment, research-design | 执行明确协议并保存配置、输入、环境、日志、指标及产物 |
| `run-review` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/run-review/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/run-review/SKILL.zh.md) | analyze | experiment, review-qa | 只读核验运行；分别报告执行完整性与科学证据 |
| `source-slides` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/source-slides/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/source-slides/SKILL.zh.md) | present | slides, writing | 多来源、进展或教学演示；默认 PPTX，按请求 Beamer，含备注及逐页验收 |
| `research-story` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/research-story/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/research-story/SKILL.zh.md) | compose | paper, writing | 将已有结果组织为证据支持的贡献论证 |
| `manuscript-review` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/manuscript-review/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/manuscript-review/SKILL.zh.md) | analyze | paper, review-qa | 审查主张、方法、证据、图表与限制；语言修订交 prose-audit |
| `project-plan` · [EN](https://github.com/mappedinfo/metis/blob/main/skills/project-plan/SKILL.md) / [中文](https://github.com/mappedinfo/metis/blob/main/skills/project-plan/SKILL.zh.md) | meta | project-ops, workflow-meta | 维护已有计划中的任务、依赖、状态和验收 |

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
