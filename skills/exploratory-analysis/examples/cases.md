# 虚构前向案例

正例：prepared.csv四条site-day记录、两站点重复观测；检查score有效3、缺失1，
cost有效4，score均值14，相关关系完整配对3。单个站点的多日记录不能自动当作独立站点。

相邻反例：问“提高cost能否导致score上升”。描述关联不足以回答干预因果效果，
先明确混杂、时间与设计，不能用相关系数或普通显著性替代因果证据。

```bash
uv run --offline --no-project python <skill>/scripts/describe.py --input <skill>/examples/prepared.csv --numeric score cost --identifier site --unit 'site-day observation' --output-directory diagnosis
```

核对diagnostics.json与原记录；summary脚本没有权重、时间依赖或总体推断。
