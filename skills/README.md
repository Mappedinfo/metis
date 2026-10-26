# metis skills

Public, generic agent skills. Each skill is a directory with a `SKILL.md`
(frontmatter: `name`, `description`) following the
[agentskills.io](https://agentskills.io) format.

For the smallest useful input, deliverable and acceptance check in each
category, read [基础能力 / Minimal skills](../docs/minimal-skills.md).

`SKILL.md` is each skill's sole discovery entry; the companion role is
declared per skill. `prose-audit` uses separately authored English and Chinese
processing guides with shared requirements, rather than a translation pair.
Other skills retain their current language conventions. Edits may begin in
either language; changes to the shared review framework must be reconciled
across its guides. Follow the
[language workflow](../CONTRIBUTING.md#skill-languages) and check the
[handoff](../HANDOFF.md) for migration and validation status. The
[catalog](../docs/skills.md#catalog) links both languages for every skill.

For prepared-table visualization, [table-chart](table-chart/SKILL.md) chooses
among comparison, trend, relationship, distribution and matrix charts. Its
[chart guide](table-chart/references/chart-guide.md) explains the corresponding
layouts and shared colorblind-oriented, grayscale and NPG-inspired profiles.

数组、计算结果、教学演示和自定义面板使用
[`scientific-plot`](scientific-plot/SKILL.md)。它负责图形制作、计算与渲染分离、
逐面板标注和实际导出验收；研究推断仍由分析阶段负责，个人风格由调用方明确提供。

## 核心任务约定

[`research-task-spec`](research-task-spec/SKILL.md) /
[中文](research-task-spec/SKILL.zh.md) 将科研任务的歧义、范围、重点、变更与验收
维护为同一份可追溯约定。它按需接入 router 的执行阶段；初次想法拆解继续由
`research-taskbook` 负责，已明确计划的维护继续由 `project-plan` 负责。

## 通用能力地图

- [`concept-note`](concept-note/SKILL.md)：问题驱动的概念／方法笔记、来源定位与理解边界。
- [`literature-synthesis`](literature-synthesis/SKILL.md)：已确定文献集合的证据矩阵、综合结论、冲突与空白。
- [`research-question`](research-question/SKILL.md)：研究问题、竞争解释、可检验试验与否决条件。
- [`research-diagram`](research-diagram/SKILL.md)：方法／机制语义；默认 Mermaid＋SVG，按请求提供 draw.io。
- [`data-preparation`](data-preparation/SKILL.md)：观测单位、显式转换规则、准备后数据与逐记录变更审计。
- [`exploratory-analysis`](exploratory-analysis/SKILL.md)：描述诊断、异常与分析限制；探索结果保留证据边界。
- [`experiment-run`](experiment-run/SKILL.md)：执行明确协议并保存配置、输入、环境、日志、指标及产物。
- [`run-review`](run-review/SKILL.md)：只读核验运行；分别报告执行完整性与科学证据。
- [`source-slides`](source-slides/SKILL.md)：多来源、进展或教学演示；默认 PPTX，按请求 Beamer，含备注及逐页验收。
- [`research-story`](research-story/SKILL.md)：将已有结果组织为证据支持的贡献论证。
- [`manuscript-review`](manuscript-review/SKILL.md)：审查主张、方法、证据、图表与限制；语言修订交 prose-audit。
- [`pdf-annotater-researcher`](pdf-annotater-researcher/SKILL.md)：论文 PDF 原位精读标注；逐段/关键句/图表/公式的原生高亮与页边弹注＋书签，副本应用、双验收、覆盖率报告。
- [`project-plan`](project-plan/SKILL.md)：维护已有计划中的任务、依赖、状态和验收。
- [`mv-producer`](mv-producer/SKILL.md)：主题/成品歌曲 → MV。Stage A：Style + 标签歌词 + 62 小节 + Suno API 生成/词级歌词/分轨；Stage B：词级对齐 + 确定性 seek(t) 渲染 + 编码抽帧验收。4:3/16:9 是出产画幅不是风格。

完整入口、来源与验证边界见[技能目录](../docs/skills.md)和[升级台账](../docs/skill-system-upgrade.md)。

## The seven categories

Every skill carries a `category` frontmatter field with exactly one of the
values in [../skill-contract.json](../skill-contract.json):
`acquire` (retrieving literature, data, knowledge) · `analyze` (methods,
evidence, experiments, audit) · `compose` (writing & expression) ·
`visualize` (scientific figures) · `present` (slides, talks, distribution) ·
`build` (builds, tooling, releases) · `meta` (orchestration & quality).

Categories describe capability domains, not the owner of every internal step.
A writing scenario owns one coherent delivery and reuses situation, organization
and review modules; genuinely separate artifacts, such as a paper and its slides,
can combine skills sharing a `domain` tag. Shared style (palette,
typography, export defaults) lives once in [../profiles/](../profiles/) and
is referenced with `uses:`, never duplicated inside skills.

Skills are hand-written public contributions. Explicitly owner-authorized
workflow extraction requires a self-contained public rewrite, a private-data
review and a fictional standalone example; personal defaults, live state and
private tool integrations stay outside the public skill. Do not mirror a
private collection. See [../CONTRIBUTING.md](../CONTRIBUTING.md) for the
authoring template and the metis-atlas organizing loop.

**Narrow exception — vendored upstream skills.** A skill whose value lives in a
public open-source backend (e.g. an MCP server) may be vendored instead of
rewritten, but only when **all** hold: the upstream license is permissive and
OSI-approved (MIT / Apache-2.0 / BSD); the upstream LICENSE file ships inside
the skill directory; the frontmatter carries `source` and `source_license`;
a `## Provenance` section states every modification (Apache-2.0 §4); and the
skill still meets admission criteria 1–6. Vendored skills are the exception,
not the model — new capabilities are written from scratch.
Current vendored skills: `scansci-pdf` (Apache-2.0, Rimagination/scansci-pdf).

## Admission criteria

A skill belongs here only if all of the following hold:

1. **Generic.** It encodes reusable craft, not one person's identity, preferences,
   private projects or private data. Personal overlays belong in `USER.md`, never
   in a skill.
2. **Self-contained.** It works without access to any private repository, vault or
   service. External dependencies must be public and named.
3. **Honest.** Instructions must not ask the agent to invent evidence, fabricate
   citations, or misrepresent capability.
4. **Scoped.** One coherent capability or scenario delivery per skill. Internal
   preparation, organization and checks do not require separate discovery entries.
   Unrelated triggers or independently accepted artifacts need distinct owners.
5. **Writable description.** The frontmatter `description` says when to use the
   skill and when *not* to, in the third person, without marketing language.
6. **Artifact-anchored.** A required nonempty `artifacts` frontmatter array
   names concrete, verifiable deliverables: a downloaded PDF, a figure, a
   deck, a runnable package, or a planning note with acceptance criteria.
   The description or Output contract explains the relevant output and how
   to check it. The required `## When to stop` section names the budget and
   termination criteria, so a run is never open-ended; `## Requirements`
   lists [B] blocking and [A] advisory items with their verification. At
   close-out, an execution ledger records each accepted task and skill
   requirement as `done`, `blocked` or `n/a`, with evidence or a reason.
   `n/a` cannot waive a required user outcome. Budget exhaustion reports
   completed items, unfinished items and the smallest unblock condition.

The reusable [requirements ledger](metis-router/templates/requirements-ledger.md)
ships with `metis-router`. For planning-only tasks it verifies the plan;
downstream execution remains unperformed. Only evidenced completion of all
applicable blocking requirements permits a task-complete claim.

## Tags

Skills carry two controlled tag axes in frontmatter. Their source of truth
is [../skill-contract.json](../skill-contract.json):

- `domain` — 1–2 of: literature, paper, research-design, experiment,
  data-analysis, writing, review-qa, figure, slides, office-doc, web-dev,
  knowledge, project-ops, media, workflow-meta (first is primary)
- `action` — 1–3 of: create, transform, revise, review, analyze, retrieve,
  orchestrate, record, advise, test (ordered)

Tags let the repository's collection check export domain views and help
reviewers identify overlapping capabilities.

## Dependencies

A skill that needs a shared style profile or another skill declares it in
frontmatter, e.g. `uses: [profiles/journal, metis-router]`. The repository's
`npm run skills:check` adapter validates these targets and records them as
dependency edges in `.atlas/graph.json`.

`profiles/journal` identifies `<current-project-root>/profiles/journal.yaml`;
it is not a path relative to `SKILL.md`. Installing a skill does not install
the repository's sibling `profiles/` directory. Install the profiles into
the target project using `metis-os profiles install`; see
[../profiles/README.md](../profiles/README.md) for the source and published
CLI instructions. Each artifact retains its own export and sizing defaults
when profiles share a palette or font family.

## Validation

Run `npm run skills:check` from the repository root after editing a skill,
profile or controlled vocabulary. It writes `.atlas/skills.json`,
`.atlas/graph.json` and `.atlas/audit.json`. To export a domain view, use
`npm run skills:check -- --domain paper`; the audit still covers the full
collection.

This adapter builds on the published `metis-atlas@0.1.0` scanner. Native
`npx metis-atlas scan` does not check the metis `artifacts` declarations or
resolve profile dependencies. The repository check validates declarations,
references and controlled vocabulary, and enforces the bounded-SOP contract:
required body sections (When to use / When to stop / Requirements / Output
contract), forbidden unbounded-loop phrasing, and [B]/[A]-labeled Requirements
items (reported as warnings). Assessing a skill's actual output still
requires task-specific review.

## Contributing

Open a PR with one skill per PR. Expect review on admission criteria 1–6 above.
