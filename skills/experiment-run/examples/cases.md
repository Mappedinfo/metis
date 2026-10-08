# 虚构运行案例

正例：按protocol.json在新目录运行synthetic_run.py，核对n=3、均值4及原件哈希；
只能认定算术入口检查完成，不认定方法优越或论文复现。

```bash
uv run --offline --no-project python <skill>/scripts/run.py --spec <skill>/examples/protocol.json --project-root <skill> --output-directory runs
```

相邻反例：只请求复现数据缺口和脚手架，不启动正式实验。数据／对照／验收标准
尚未确定时，仅有可运行程序不能证明已经完成复现。

失败案例：非零退出、超时、退出0但缺metrics.json，都保留实际状态和日志；
最后一项必须为incomplete。失败运行原件不被重跑覆盖。
