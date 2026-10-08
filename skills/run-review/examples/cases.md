# 虚构审查案例

正例：使用experiment-run的fictional-smoke运行目录，只读检查manifest、protocol、
日志和实际指标；对[2,4,6]重算n=3、均值4。完整性可用而科学结论受smoke范围限制，
不是“方法已验证”。审查前后原件哈希保持相同。

相邻反例：要求继续运行一个大实验，应交执行能力，并保留原预算和当前授权。
没有原件但有漂亮总结时，只能检查总结内在一致性并列缺失证据，不补造manifest。

```bash
uv run --offline --no-project python <skill>/scripts/review.py runs/fictional-smoke --output-directory reviews/fictional-smoke
```

篡改指标、缺少日志或自相矛盾的成功标签不能得到accept；自动程序保留科学状态未验证。
