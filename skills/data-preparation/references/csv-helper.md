# CSV 辅助程序合同

Python 3.10+，仅标准库。显式声明全部输入列与观测单位，输出到尚不存在的目录：

```bash
uv run --offline --no-project python <skill>/scripts/prepare.py --input raw.csv --spec rules.json --output-directory prepared
```

`rules.json` 使用 `schema_version: 1`、非空 `unit`、有序 `columns`。每列 `type`
为 string／number／integer／date；date 接收 ISO 日期。可选 `rename`、`trim`、
`missing_values`、`missing`（preserve／drop_row／fill）及明确的 `fill` 值。
默认缺失记号是空字符串，默认保留缺失。`keys` 使用输出列名；`duplicates` 默认为
error，也可明确 preserve 或 drop_exact。后者只删除转换后完全相同的记录，其他
重复键继续报错；preserve 对重复和空键的保留须在分析中解释。

程序拒绝非有限数字、无法转换的整数／日期、列数量不一致、未声明列、未知选项和
已存在输出。CSV 记录号从表头之后的第一条开始，不等于物理行号。交付
`prepared.csv`、`spec.json`、`audit.json`、`report.md`；不自动合并、聚合或拟合补值。
