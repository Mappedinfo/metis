[English](SKILL.md) 是执行依据；本文件为可编辑的中文译本。

# ScanSci PDF

从 DOI、arXiv 标识、URL、题名或确定的论文列表获取并核验实际学术 PDF，
支持单篇、批量、引用导出和访问诊断。普通“下载这篇论文／获取这个 DOI 的 PDF”
即可选择此公共能力；后端以 scansci-pdf 当前实际可用工具为准。已有本地 PDF 的
阅读、渲染和 OCR，以及概念解释或固定语料综合交给相应能力。

使用当前实际连接的 scansci-pdf MCP 服务处理论文发现、元数据、下载队列和访问状态。
详细工具路由和必要配置见 [完整工作流](references/full-workflow.zh.md)；
工具数量与参数以会话实际发现为准，指南安装不代表服务器已连接。

## 按意图路由

- 搜索或识别论文：使用 `scansci_pdf_search`、`scansci_pdf_prepare_queue(action="verify")`；
  列表文件使用 `scansci_pdf_parse_list`。
- 解析开放获取位置：`scansci_pdf_prepare_queue(action="resolve_oa")`。
- 下载单篇论文：使用 `scansci_pdf_download`；用户有来源偏好时显式指定策略。
- 处理列表：`scansci_pdf_parse_list` 或 `scansci_pdf_batch_download`。
- 导出引文：`scansci_pdf_citation`；通过 `scansci_pdf_zotero_push` 推送到 Zotero。
- 诊断设置或访问：`scansci_pdf_diagnostics`（check=health|network|sources|setup）。

## 操作边界

- 保留用户要求的来源策略，并在每个下载结果中报告实际来源。
- 未指定来源偏好时，优先采用开放获取、出版商 API 和经机构授权的渠道。
- 打开交互式登录、导入 cookies 或修改访问配置之前，先询问用户。
- API 密钥、cookies、代理凭据和机构信息均按秘密处理，不得在回复中复述。
- 灰色源和反爬渠道必须由用户显式选择，且仅可在用户有权使用、适用规则允许的
  情况下使用。

## 何时使用

任务需要获取科学论文 PDF、验证 DOI/arXiv 标识符、按已知条件检索文献或
导出引文记录时使用本技能。没有检索意图的选题探索、PDF 内容阅读或总结，
以及非学术文档应使用其他路径。

## 要求

- [B] R1 下载前先检索或验证标识符——验证：报告列出所用来源和各条目的结果。
- [B] R2 仅通过声明的路径交付 PDF 与引文记录——验证：产出物文件或导出记录
  存在于报告注明的路径。
- [A] R3 对无法访问的条目进行诊断，不盲目重试——验证：诊断报告注明各条目的
  最小解除阻塞条件。

## 何时停止

- 条目队列已处理完，或每个剩余条目都有书面访问诊断（付费墙、缺少标识符、
  渠道故障）。
- 声明的预算（条目数、重试次数、轮次）已耗尽：报告已完成项、未完成项和
  最小解除阻塞条件；不得循环尝试失败渠道，也不得将尚未解决的必需下载项
  标为完成。
- 声明的产出物一旦存在便停止；判断其科学质量是调用者的审阅任务，不属于本
  技能的循环。

## Metis 输出契约

返回用户要求的产出物：带来源的搜索结果列表、已验证的标识符列表、引文导出、
下载的 PDF 或访问诊断报告。说明已获取或已验证的内容，在适用时提供实际来源
和本地文件路径，并区分失败或不可用条目与成功下载项。访问报告是一项产出，
但不等同于已下载的 PDF。

为已接受的任务要求和 R1–R3 附上简洁台账：每项记录 `done`、`blocked` 或
`n/a`，并附验证证据或理由。每项一行，字段保留为：
`ID | B/A | requirement | verification | status | evidence or reason`。
`n/a` 适用于所请求检索模式之外的要求，不能免除用户要求的必需结果。只有
所有适用的阻断项都已完成且有证据时，才能宣布完成；无法访问的必需条目即使
诊断已完成，也须保持 `blocked`。

调用前核对工具是否实际暴露及其参数。安装指南不等于安装或连接 MCP 服务。
服务或必要工具不可用时，说明依赖并将对应获取要求标为 `blocked`；不编造
接口，也不静默改变来源策略。

## 来源与修改声明

本技能引入自 [Rimagination/scansci-pdf](https://github.com/Rimagination/scansci-pdf)
（Apache-2.0，见本目录 LICENSE）。修改包括：在 frontmatter 中补充 metis
分类及契约字段（`category: acquire`、`domain`、`action`、`uses`、`artifacts`、
`source`、`source_license`）；将完整工作流参考从上游 `skill/SKILL.md` 移至
`references/full-workflow.md`；在描述中加入“不使用”的边界；加入上述 Metis
输出契约；加入 skill-contract.json v2 要求的 When to use / Requirements /
When to stop 各节，明确预算耗尽时报告未完成项，并在 Metis 输出契约中加入
状态与证据台账（2026-09-28）。新增中文入口，将完整工作流参考译为英文并保留
中文对应文件，补充语言互链和本修改声明（2026-10-03）。工作流含义、命令和
授权边界保持不变；Apache-2.0 许可证未修改。
修正标识符验证为 `prepare_queue(action="verify")`，区分指南安装与实际工具
暴露（2026-10-08）。
