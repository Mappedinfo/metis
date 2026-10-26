> 本文件介绍工作流的中文用法，与[配套说明](README.md)共同维护执行顺序、记录和停止要求。

# metis 工作流

工作流把任务、按顺序使用的技能和少量本地执行记录连接起来。它是项目级的可选集成。
仅安装技能不会安装钩子，也不会启用工作流。

| 工作流 | 顺序 | 编辑能力 |
|---|---|---|
| [writing-review](writing-review/workflow.zh.md) | 写作请求 → 草稿 → 语义审校 → 最多一次修改 → 验证 → 交付 | [prose-audit](../skills/prose-audit/SKILL.zh.md) |

工作流入口独立于技能。运行时钩子注入 `workflow.md`、共同写作判断的中文主稿及英文译文，
以及 `prose-audit` 的两份完整处理指南，
分别记录每份指南的来源哈希。中英文指南共有审校要求，按各自的写作逻辑和表达习惯分别编写。
`SKILL.md` 仍是技能的唯一发现入口，文件名不赋予英文语义优先。
按实际稿件语言采用处理方法，请求语言、报告语言和文体分别确定。混合稿按段落采用相应方法，
保留同一覆盖记录和预算。不要在工作流下维护另一份复制的 `SKILL.md`。
文章的场景负责人持续负责完整交付；情境、组织和审校作为内部模块复用，
本工作流只是现有写作任务的检查与记录适配器，不再选择一次主人，也不叠加修订预算。

## 在项目中安装

此实现使用源码检出目录；以下命令不代表相关功能已经发布到 npm。
先在 metis 检出目录准备运行时包：

```bash
npm ci
npm run skills:bundle
npm run workflows:bundle
```

然后安装到目标项目：

```bash
node /path/to/metis/packages/metis-os/bin/metis-os.js workflows install writing-review --runtime codex --project /path/to/project --activation auto
```

使用 `--runtime dsh` 生成 DSH 适配器。希望每次请求单独启用时，设置 `--activation explicit`。
新安装默认使用 `auto`；重新安装时省略该参数，则保留现有模式。
`--project` 可省略，默认为当前目录。安装的是项目集成，不是全局钩子或定时任务。

项目配置保存在 `.metis/workflows.json`。运行状态及含本机信息的适配器导出保留在 `.metis/` 下。
安装器在 `.metis/.gitignore` 中为 `state/` 和 `adapters/` 添加忽略规则；可移植的工作流配置可以提交。
不要因为流程完成，就把草稿快照和本地运行记录一并提交。

### Codex

安装器把其管理的 `UserPromptSubmit` 和 `Stop` 项合并进 `.codex/hooks.json`，保留无关钩子。
生成命令使用本机可执行文件路径，因此 `.codex/.gitignore` 排除 `hooks.json`。
现有项目指令和其他钩子的含义保持独立。在 Codex 中通过 `/hooks` 检查并信任生成的钩子，
再验证一个新的写作请求。确认运行时实际加载了项目钩子；安装成功本身不是实机集成验证。

### DSH

安装器生成 `.metis/adapters/dsh/hooks.json` 和 `.metis/adapters/dsh/cordis.patch.yml`。
生成的 Cordis 补丁为 `@deepseek-ai/dsh-hooks-codex` 配置 `configPath`，使其指向钩子导出。
在获得授权时，通过该 DSH 实例支持的配置方式加载补丁。
metis 不修改运行中的 DSH 补丁、不重启 Host，也不中断活动会话。
生成文件只证明适配器已准备，不证明已被实际加载。

## 触发方式

已启用的项目采用以下一种模式：

- `auto`：有限的中英文写作请求模式可以触发流程。这是便利用的匹配器，不是完整语言或意图分类器；
  可能漏触发，也可能误触发。
- `explicit`：仅请求标记可以触发。

明确启用时，把以下标记放在第一行：

```text
[metis:writing-review]
Revise the following release note. Return only the revised text.
```

某次请求跳过时，把以下标记放在第一行：

```text
[metis:skip-writing-review]
Explain how the following parser works.
```

跳过标记对该次请求优先。请求标记不能代替项目启用，也不会安装缺失钩子。
标记改变流程路由，不改变任务权限。自动匹配不授权发布、发送或修改无关内容。

## 本地执行过程

钩子提供真实会话标识、当前运行、私有草稿缓冲文件及完整可执行命令。使用这些值。
下表为便于阅读省略了源码 CLI 前缀；当前目录不是目标项目时，添加 `--project PATH`。

| 命令 | 作用 |
|---|---|
| `workflows status --session ID` | 检查当前运行、状态、路径和哈希。 |
| `workflows capture --session ID --artifact PATH` | 保存草稿快照，将其内容绑定到本次运行。 |
| `workflows review --session ID --file JSON` | 提交针对已保存草稿的全文语义审校记录。 |
| `workflows revise --session ID` | 保存当前已编辑文件的快照；最多允许一次修改。 |
| `workflows verify --session ID --file JSON` | 提交与文件及已接受审校记录绑定的保留检查。 |
| `workflows cancel --session ID --reason TEXT` | 以真实取消原因结束本次运行。 |

智能体先写草稿，保存快照，通读全文，再提交有语境依据的发现。
发现可标为 `keep`、`revise` 或 `unresolved`。每项发现的精确摘录必须出现在草稿快照中。
智能体仍须检查位置和解释是否指向正确段落；找到同一字符串不是语义验证。

需要修改时，智能体编辑文件，再保存一次改稿快照。
没有必要修改的审校可以直接验证原稿，包括确实没有发现问题的审校。
未解决发现阻止完成。关键词扫描或空发现列表都不能替代全文阅读。

正常状态依次为 `drafting` → `drafted` → `reviewed` → `revised`（需要时）→ `ready`。
`blocked` 和 `cancelled` 是不同结果。只有保存的文件、审校和验证记录仍然一致时，
`status` 才返回 `ready: true`；这表示记录有效，不证明编辑质量。

### 文件与仅对话交付

交付文件是项目内的 UTF-8 `.md` 或 `.txt` 文件。运行时校验实际路径；
不要使用符号链接或路径穿越将工作移出允许的项目范围。私有状态目录为：

```text
.metis/state/writing-review/<session-hash>/runs/<run-id>/
```

仅对话写作使用钩子提供的当前运行专用私有 `artifact.md` 缓冲文件。
这样可以检查完整草稿，无须创建公开项目文档。
例外只允许这一指定缓冲文件，不允许其他运行或状态目录中的任意文件。

最终答案返回已验证缓冲文件的文字。`result-only` 正文不含审校说明和检查记录。
与缓冲文件不同的最终对话内容，不会自动得到已有验证的覆盖；适配器不会比较或过滤最终流中的每个 token。

## 记录能证明什么

审校记录包含 `schema_version`、`run_id`、`draft_sha256`、`coverage: "full"`、发现及总结。
每项发现包含精确摘录、位置、语境理由和决定。
验证记录把 `run_id`、`artifact_sha256` 和 `review_sha256` 绑定到全文、事实、引文和范围保留检查，
并附说明。遵循运行时提供的记录格式，不添加作者来源评分。

哈希使本地实现可以拒绝过期记录或发现文件内容变化，但不能证明语义通读、事实准确、
作者语气保留或编辑质量。`coverage: "full"` 和保留检查布尔值是模型声明，模型必须实际执行相应检查。
即使机器接受记录，技能要求的语境证据和验收台账仍然必要。

## 停止与恢复

语义预算为一次完整审校、最多一次修改和一次受影响上下文检查。
智能体停止时运行仍未完成，Stop 钩子可以请求一次继续。
它不能撤回或隐藏已显示的文字，也不是交付前的 token 过滤器。

用完允许的继续次数后，未完成工作仍未完成。检查 `status`，报告已完成部分和最小解除阻碍条件。
误触发或缺少前提导致流程不适用或无法完成时，以真实原因取消。
取消和预算耗尽都不代表验证成功。DSH 可能不显示每条非阻断钩子警告；
持久化运行状态才是本地实际完成情况的权威记录。

源码格式和状态检查证明的是本地行为，不证明真实 Codex 或 DSH 会话成功加载。
声称端到端运行成功前，应在选定运行时中测试一次有界写作请求。

## 移除适配器

```bash
node /path/to/metis/packages/metis-os/bin/metis-os.js workflows uninstall --runtime codex --project /path/to/project
```

DSH 导出使用 `--runtime dsh`。卸载只移除选定适配器所管理的钩子项，保留无关钩子和本地审校历史。
最后一个已安装适配器被移除后，项目工作流才会禁用。
未改动的 DSH 生成补丁会移除，手动修改过的补丁会保留；若已加载 DSH 挂载，通过该实例获授权的配置流程另行移除。

若安装后有人改动了受管理的条目，应先协调这些修改再重装或卸载；安装器不会猜测该替换哪项外部内容。
移动源码检出目录也会改变生成的绝对命令路径，因此应从目标检出目录重新安装，再检查运行时加载。
