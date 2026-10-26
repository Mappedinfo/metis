# 基础能力 / Minimal skills

从你要交付的东西选择 skill：找一篇文献、读清一篇论文、写一份简报、画一张图、
做一份汇报、准备一个可运行项目，或把这些步骤组织起来。
这些是七个能力域的最小用法，不是七个万能助手。

## 七类各自完成什么

| 类别 | 基础入口 | 你提供什么 | 最小交付与验收 |
|---|---|---|---|
| 获取 / acquire | `scansci-pdf` | 一个 DOI、arXiv 标识或明确检索条件 | 论文文件或检索结果、引用记录、逐项获取状态；核对标识、来源和文件可读性。受限来源如实报告。 |
| 分析 / analyze | `taskbook-interpret` | 一篇可读论文全文 | 精读笔记；研究问题、主张、证据和局限能定位到原文，作者结论与读者推断分开。 |
| 写作 / compose | `source-brief` | 已有材料、读者和写作目的 | 简报或修订稿、关键主张的来源对照；数值、时间、归属和不确定性保留。 |
| 制图 / visualize | `table-chart` / `scientific-plot` | 准备好的 CSV，或数组／计算结果／明确要求的教学演示；比较目的和单位 | 按输入选择能力，生成图与再生成材料，核对数值、轴、逐面板标注及灰度可辨性。 |
| 呈现 / present | `taskbook-slides` | 一篇论文及汇报用途 | 10–15 页中文 PPTX，每页有备注；核心结论有原文依据，逐页渲染检查。 |
| 构建 / build | `taskbook-reproduce` | 一篇论文及可获得的数据/代码线索 | 逐图表复现计划、数据方案和可运行脚手架；缺失条件列明，入口能运行。它交付复现准备，不证明论文结果已复现。 |
| 编排 / meta | `research-task-spec` / `metis-router` | 需要对齐或接续的科研任务；或跨能力目标及已有材料 | 前者建立或更新范围、重点、变更和证据验收；后者组织阶段与技能。复用现有入口，计划交付与实际执行分别验收。 |

另外的专用入口：`taskbook-authors` 从论文作者名单整理带来源的作者档案；
`research-taskbook` 把尚不清楚的研究想法变成带输入、输出、验收的任务书。
`review-advance` 根据已有目标和工作证据复盘，给出可核查的进展、下一步与计划。
它们保留各自职责，不需要再创建同义的通用 skill。

## 核心任务约定：research-task-spec

> 把这项科研任务的歧义、范围和重点写清楚，明确可验收产物；复用当前任务入口，
> 按实际证据跟踪进度。要求变更时保留继续有效的部分，缺口只阻塞依赖工作。

交付是任务约定及同一入口中的变更、验收与执行台账。验收时逐项查需求 → 任务
→ 产物 → 证据；研究流程完成与假设得到支持分别判断，阴性结果如实报告。
地理科学、城市科学、GeoAI 和计算机科学的合成示例随技能按需读取。已有要求充分时
直接推进，清楚的小修复无需任务书。仅初次拆题用 `research-taskbook`，仅维护既定
计划用 `project-plan`，跨能力编排用 `metis-router`。

## 两个可以从小任务开始的入口

### source-brief：已有材料 → 可核对的文章

示例请求：

> 把这些材料写成面向项目协作者的中文简报。保留已完成、受阻和待验证的区别，
> 不额外检索。另给一张关键主张到材料位置的对照表。

材料可以是笔记、事实清单、会议记录或原稿。这个 skill 负责选择和表达已有信息，
不会把“有人提出的判断”改写成“已经证实的事实”，也不会为了让短文显得完整而补造
缺失结果。材料不足时，会说明能写到哪一步。
既有简报用法保持兼容；也可按请求写解释性长文或选择性技术史。负责人复用共同模块
完成情境、信息组织、起稿和审校，不把每一步拆成新的技能身份。

英文写作只需在请求中指定读者、目的和 English；输出语言不改变证据要求。
可用仓库中 `skills/source-brief/examples/` 的虚构材料做一次练习。

### table-chart：整理好的表格 → 选图、排版、配色与导出

示例请求：

> 这个 CSV 记录了三组对象连续四天的分数，单位为 points。我想比较变化过程。
> 请推荐图型、叠加或分面排版，并给出色盲友好和灰度打印方案。
> 选用清楚的方案绘图，交付导出图、输入与样式快照、再生成方式。

| 你要比较什么 | 可用图型 | 排版判断 |
|---|---|---|
| 类别之间的数值 | 水平条形图、点图 | 长名称沿纵轴排列；多组拥挤时分面，条形图保留零基线。 |
| 时间或有序变量上的变化 | 折线图 | 少量序列叠加并配合点形、线型；重叠明显时按组分面。 |
| 两个数值变量的关系 | 散点图 | 用点形和配色区分组别；遮挡明显时分面，不自动拟合趋势。 |
| 单个变量的分布 | 直方图 | 说明分箱数；比较组别时共用分箱边界和可比坐标轴。 |
| 不同类别下的重复观测 | 箱线图 | 展示分布摘要及原始观测，回执记录样本量；箱体不是置信区间。 |
| 两个分类维度构成的完整矩阵 | 热图 | 数值大小用顺序色；有明确参考中心的差值用发散色。 |

程序先检查列类型并给出候选方案；列的含义和读者的问题决定最终选择。
数字形式的编号不能自动当作连续变量，年份也不应仅因能转为数字就用于相关分析。
支持单栏、双栏以及按组分面，最多六组或六个面板。字号和尺寸由共享 profile 决定。

本项目统一把整图标题和图注放在图下方，把子图标题放在对应面板下方，坐标轴名称
仍靠近坐标轴。排版预留独立空间，避免子图标题、刻度文字和整图图注重叠。
图注可说明量与单位、摘要统计的含义和已有来源；未提供的来源或结论不补造。

配色提供三个入口：`journal` 使用 Okabe–Ito 系列；`journal-grayscale` 面向灰度打印；
`journal-npg` 提供 ggsci 的 NPG 风格系列。NPG 风格不等于 Nature 官方指定，
也不自动保证色盲或灰度可辨。多组数据同时使用点形、线型、纹理或分面，导出后检查
彩色图和灰度预览，避免图例只靠颜色表达含义。

缺失值、无效数字、重复热图单元等会先报告，不会偷偷删行、补值或求均值。
直方图分箱与箱线图描述统计会记入回执；统计推断、地图和误差估计仍需相应分析流程。

它需要 Python、Matplotlib、PyYAML，以及当前项目的
共享 profile。样式安装方式见
[profiles 指南](https://github.com/mappedinfo/metis/blob/main/profiles/README.md)。
入口自带选图与绘图脚本、虚构 CSV 和折线图/热图规格示例；具体命令与限制见
[`table-chart` 使用说明](https://github.com/mappedinfo/metis/blob/main/skills/table-chart/SKILL.md)
和[图型与排版指南](https://github.com/mappedinfo/metis/blob/main/skills/table-chart/references/chart-guide.md)。
仅要求方案时交付方案；要求绘图时，还须查看实际图和完成验收台账。

### scientific-plot：计算结果与自定义面板 → 科研图

示例请求：

> 用固定种子生成标为虚构的三维弯曲样本，并排展示前两维坐标与 PCA 投影。
> 按项目 profile 绘图，把说明放在对应面板下方，保留计算缓存和重画入口。

[`scientific-plot`](https://github.com/mappedinfo/metis/blob/main/skills/scientific-plot/SKILL.md)
接收数组、缓存模型结果和明确要求的教学计算。先确定解释边界，再选择编码，
按 profile 制作、导出并查看最终文件。固定种子不证明结构稳定，教学演示不证明
方法普遍优越。重画从缓存读取，新增研究实验另行处理。

`table-chart` 继续负责准备好的 CSV 及其受支持图型。项目名称不会自动选择绘图技能，
也不要求所有图形经过 router；输入与产物明确时直接加载匹配能力。

## review-advance：已有目标与证据 → 复盘和下一步

示例请求：

> 根据本周的目标、变更记录和验收结果，解释哪些工作真正推进了目标、哪些还没有证据。
> 给出最值得先做的一步及其验收条件。这次只读审查，不更新项目状态或安排定时任务。

公有 SOP 负责反思、总结、推进、规划，区分观察、解释、决策和行动。
实际执行下一步、写入台账或改变调度，需要当前任务或既有有效授权。
研究主线判断只在研究任务中启用；伴学复习和预习也按任务需要启用。

个人时区、证据目录、主线入口、输出位置和伴学工具由调用方提供。
不提供个人配置时，也可以只凭明确目标和所给材料完成一次只读复盘。
私人适配层可以复用这个流程，同时将真实台账和本地工具保留在自己的存储中。
具体输入契约见
[`review-advance`](https://github.com/mappedinfo/metis/blob/main/skills/review-advance/SKILL.md)。

## prose-audit：已有文稿 → 表达审查或最小改稿

示例请求：

> 检查这段中英文说明里的黑话、空泛强调和机械重复。逐处说明原因，保留
> 有实际含义的专业词和结论限制；最后给出最小改稿，不增加原文没有的事实。

[`prose-audit`](https://github.com/mappedinfo/metis/blob/main/skills/prose-audit/SKILL.md)
先通读全文，再核对词语、句式和结构。脚本只定位待检查片段，不能代替语义判断。
“审查”模式给出位置、原文、问题及建议；“改稿”模式返回完整修订文本。
技术术语、引文、有效对比和作者风格可以保留。报告不判断文本是不是由 AI 写成。

中英文处理指南在同一审校框架下分别编写，按各自的写作逻辑、语法和表达习惯判断。
按实际稿件选择方法：中文请求审英文稿时，采用英文处理方法，报告仍可用中文；
混合稿按已有段落分别处理，保留统一的覆盖记录与轮次预算。文体另行确定。

本地辅助检查不需要第三方 Python 包：

```bash
uv run --offline --no-project python -B skills/prose-audit/scripts/detect.py draft.md --json
npm run prose-audit:check
```

## 什么才算 MVP 通过

每个入口至少要完成一个有代表性的任务，并检查实际产物。声明齐全、安装成功和
代码测试通过，各自只能证明对应的那一层。

新加入的 `source-brief` 和 `table-chart` 使用虚构材料进行样例验收；这证明指定
输入下的行为，不代表覆盖所有文体、数据或运行环境。其他入口保留现有方法边界，
需要各自的真实任务验证。当前分类覆盖不能作为“七类业务均已验收”的声明。

维护者在仓库根目录运行 `npm run check` 检查集合、安装和文档，运行
`npm run table-chart:check` 检查绘图行为。后者需要 `uv`，会使用独立的
Matplotlib/PyYAML 环境；它不增加 metis-os CLI 的运行依赖。

四个 taskbook 已将论文获取与本地 PDF 阅读、渲染和 OCR 分开；具体工具以会话实际可用能力为准。
幻灯入口及论文转幻灯预设均读取同一 deck profile，并按独立入口的产物与逐页验收执行。

## 扩展能力与交接

| 当前输入／目标 | 主入口 | 交付边界 |
|---|---|---|
| 问题驱动的概念／方法笔记、来源定位与理解边界 | [`concept-note`](https://github.com/mappedinfo/metis/blob/main/skills/concept-note/SKILL.md) | 见单项指南的产物、相邻边界与验收要求 |
| 已确定文献集合的证据矩阵、综合结论、冲突与空白 | [`literature-synthesis`](https://github.com/mappedinfo/metis/blob/main/skills/literature-synthesis/SKILL.md) | 见单项指南的产物、相邻边界与验收要求 |
| 研究问题、竞争解释、可检验试验与否决条件 | [`research-question`](https://github.com/mappedinfo/metis/blob/main/skills/research-question/SKILL.md) | 见单项指南的产物、相邻边界与验收要求 |
| 方法／机制语义；默认 Mermaid＋SVG，按请求提供 draw.io | [`research-diagram`](https://github.com/mappedinfo/metis/blob/main/skills/research-diagram/SKILL.md) | 见单项指南的产物、相邻边界与验收要求 |
| 观测单位、显式转换规则、准备后数据与逐记录变更审计 | [`data-preparation`](https://github.com/mappedinfo/metis/blob/main/skills/data-preparation/SKILL.md) | 见单项指南的产物、相邻边界与验收要求 |
| 描述诊断、异常与分析限制；探索结果保留证据边界 | [`exploratory-analysis`](https://github.com/mappedinfo/metis/blob/main/skills/exploratory-analysis/SKILL.md) | 见单项指南的产物、相邻边界与验收要求 |
| 执行明确协议并保存配置、输入、环境、日志、指标及产物 | [`experiment-run`](https://github.com/mappedinfo/metis/blob/main/skills/experiment-run/SKILL.md) | 见单项指南的产物、相邻边界与验收要求 |
| 只读核验运行；分别报告执行完整性与科学证据 | [`run-review`](https://github.com/mappedinfo/metis/blob/main/skills/run-review/SKILL.md) | 见单项指南的产物、相邻边界与验收要求 |
| 多来源、进展或教学演示；默认 PPTX，按请求 Beamer，含备注及逐页验收 | [`source-slides`](https://github.com/mappedinfo/metis/blob/main/skills/source-slides/SKILL.md) | 见单项指南的产物、相邻边界与验收要求 |
| 将已有结果组织为证据支持的贡献论证 | [`research-story`](https://github.com/mappedinfo/metis/blob/main/skills/research-story/SKILL.md) | 见单项指南的产物、相邻边界与验收要求 |
| 审查主张、方法、证据、图表与限制；语言修订交 prose-audit | [`manuscript-review`](https://github.com/mappedinfo/metis/blob/main/skills/manuscript-review/SKILL.md) | 见单项指南的产物、相邻边界与验收要求 |
| 维护已有计划中的任务、依赖、状态和验收 | [`project-plan`](https://github.com/mappedinfo/metis/blob/main/skills/project-plan/SKILL.md) | 见单项指南的产物、相邻边界与验收要求 |

数据准备 → 探索分析 → 明确协议运行 → 只读运行审查，按前一阶段产物进入下一阶段；
已有充分综合材料才进入多来源幻灯片。单一请求直接读取对应入口。
来源处理、实际调用证据及桌面观察边界见[升级台账](skill-system-upgrade.md)。

## 安装和语言边界

在当前源码 checkout 中运行 `npm run skills:bundle`，再使用
`node packages/metis-os/bin/metis-os.js skills install` 安装集合。
`skills list` 检查的是链接状态；新安装的入口是否被宿主发现，需要在新会话核对。
源码增加技能不代表旧的 npm 发布版本已包含它们。

每个 skill 保留一个身份，`SKILL.md` 是唯一发现入口，`SKILL.zh.md` 不重复声明运行时元数据，
不另设 `SKILL.en.md` 或把中文文件安装成另一项技能。入口文件名本身不赋予英文语义优先。

`prose-audit` 的中文与英文处理指南分别成文。共同维护模式、覆盖范围、受保护材料、
R1–R8、轮次预算和交付要求；语言方法、语序和案例可以独立组织，无须逐段对应。
共有要求发生冲突时，按已接受要求、依据与修改意图核对，标明受影响项，保留待解决修改。
不能默认英文或最新文件胜出，也不能在必需项未解决时宣称相关工作完成。

其他技能保留各自现有语言约定；本次调整不意味着它们已经改成分别编写的处理指南。
两边都可发起修改，共有要求的变更须在同一次维护中核对；只影响某一语言方法或措辞的修订，
可留在对应文件。Git 记录用于追溯意图，不用于选择稿件的处理语言。

集合中的 skill 均配有 `SKILL.md` 与 `SKILL.zh.md`，
直接使用的流程参考、模板和 Markdown 示例说明按各自约定维护配套文件。
[技能目录](skills.md#catalog)提供每个入口的中英文链接。详见
[维护规范](https://github.com/mappedinfo/metis/blob/main/CONTRIBUTING.md#skill-languages)
和[迁移状态](https://github.com/mappedinfo/metis/blob/main/HANDOFF.md)。
工作流的源语言不限制交付语言；例如简报可按请求输出中文或英文，
文献转幻灯入口仍按其约定产出中文汇报。
