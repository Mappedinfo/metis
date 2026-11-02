[English guide](citations.md)

# LaTeX 引用与可编辑比较表

仅在任务涉及 LaTeX 引用位置或恢复表格选字、批注能力时使用。本模块纳入已有语义审校，
不增加轮次。书目、论文方法身份和表格数据仍由项目维护。

## 引用检查

各研究的引用对应其支持的分句。综合判断可以由多篇共同支持，成组引用本身不构成错误。
结果来自另一篇研究的比较表时，保留该结果的真实出处和页表定位；方法原论文的身份引用
不能代替成绩出处。

对明确的 `.tex` 文件或目录调用只读检查器：

```bash
python3 skills/prose-audit/scripts/check_citations.py review --json
```

已安装技能按该技能目录定位脚本。仅需 Python 3.10+ 标准库；每个文件和身份表须为 UTF-8、
不含 NUL、最多 2,000,000 字节；一次接受 1–1000 个 `.tex` 文件。拒绝符号链接文件，
不递归跟随目录链接。退出码 `0` 表示已处理且没有策略错误，仍可能有 warning；`1` 为策略
错误，`2` 为输入或配置失败。脚本不写输入。

默认将多键引用和紧邻引用组列为 **warning 候选**，返回原文字符起止位置、行列和片段。
项目已明确要求分开归因时，可采用：

```bash
python3 skills/prose-audit/scripts/check_citations.py review --separate-attribution --json
```

该模式将待核成组引用列为 error；同一综合判断确由多篇支持时，在紧邻的上一行源码注释
记录完整键及具体原因：

```tex
% citation-check: shared-claim keys=sample:a,sample:b; reason=已核的两篇原表都报告这一项限制。
这一综合判断\parencite{sample:a,sample:b}。
```

例外仅匹配下一行键集合完全相同的一组引用，使用一次。报告以
`documented_not_semantically_verified` 保留理由；标记不证明语义支持，也不豁免方法身份检查。
未匹配的标记仍为 warning。

## 按需启用项目方法身份策略

只有项目已经接受“登记方法名**每次出现立即引用**”的要求时，传入项目现有身份表：

```bash
python3 skills/prose-audit/scripts/check_citations.py review --methods scripts/methods.json --json
```

最小虚构示例；公共包不附带真实论文名单：

```json
{
  "version": 1,
  "methods": [{"names": ["SampleMethod"], "citekeys": ["sample:method", "sample:alias"]}],
  "ambiguous_unmapped": ["UnresolvedName"]
}
```

忽略其他说明字段，拒绝重复 JSON 键。同名不同论文可分别登记，保留候选键，不自动选论文。
`ambiguous_unmapped` 也接受“名称 → 非空原因”的对象，便于直接读取既有项目表，无须复制一份。
未映射的歧义名称、未知变体后缀和紧贴数字的名称列为人工 warning；脚本不插入或替换引用。
身份表须按项目真实书目和别名核定；本脚本不解析 BibTeX，不核实引文对主张的支持程度。

可见标题、目录短标题和链接显示文字参与检查。跳过常见注释、代码、URL／路径目标、标签与
交叉引用、引用键、PDF 书签及 `texorpdfstring` 的书签分支。支持常见嵌套强调和引用前的
`protect`；标题外的引文不能代替标题内的身份引用。覆盖有限：自定义宏、异常 TeX、图片文字
和未登记名称仍须人工检查；不识别全部迟引，不展开宏或包含文件，不读 PDF。零错误不能证明
引用正确或全文已获语义核查。

已有项目适配层可使用 Python API 版本 `1`：
`scan(text, filename, methods=None, separate_attribution=False)` 的后两个参数只能按名称传入；
`source_view(text)` 返回按原位置空白化注释和 verbatim 的源码，便于保留项目自己的有限语言
启发式而不复制解析器。`API_VERSION` 标识这一合同。项目引用建议可消费 findings；公共脚本仍不应用修改。

## 原生比较表

读者需要检索、选字或逐字批注时，从既有结构化数据导出原生表，保留稳定行 ID、单元格出处、
引用、单位和限定。普通文本单元格须转义，原始 TeX 只允许放在明确可信的字段；数据改动后
重新导出。工作簿字段和导出器继续归项目，另行整理前不当作通用 XLSX 工具发布。

导出后核对字段及引用是否保留、换行和分页是否可读，再实际验证 PDF 选字／文本提取；
源码为原生表不等于导出件已经可选字。标签检查按真实包含关系计数：只有 dispatch 明确证明
调用与目标声明输出同一个标签时，才合并这两处记录；重复包含、标签不匹配和其他真实重复
仍须报出。复用项目编译和审计入口，不全面忽略重复标签，也不将科研图像强制改成表。

## 运行时边界

`writing-review` 提供随包检查器路径和条件式调用说明；它不执行该脚本，不替项目启用逐次
引用策略，也不证明检查已经运行。现有记录机制绑定所保存的 `.md`／`.txt`，不覆盖多文件
LaTeX 编译。实际调用和结果分别报告；缺少本地 Python 时沿用既有有界人工退路。
不需要新增 hook、监视器、安装步骤或网络访问。
