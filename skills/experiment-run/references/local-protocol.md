# 本地运行协议 v1

Python 3.10+，标准库。对项目内的显式输入记录哈希，使用新 run_id，不覆盖既有运行。

```bash
uv run --offline --no-project python <skill>/scripts/run.py --spec protocol.json --project-root . --output-directory runs
```

协议字段：`schema_version: 1`、`run_id`（小写短横线标识）、`objective`、`kind`
（smoke／evaluation／reproduction）、`argv` 字符串数组、`timeout_seconds`（正数且
不超过一天）、`inputs` 项目相对文件路径列表、`required_outputs` 运行目录相对文件路径列表。
可选整数 `seed` 和不含凭据的 `environment` 字符串映射。`argv` 的 `{project_root}`
与 `{run_dir}` 是唯二路径替换；执行不经 shell，工作目录为新运行目录。源码、数据和锁文件
应列入 inputs；命令需要哪些原始输入由执行者核对，程序不推断完整依赖图。

程序记录 `manifest.json`、`protocol.json`、stdout/stderr 及必需产物的哈希和大小。
退出为零但缺必需非空文件时状态为 incomplete；非零为 failed，超时为 timed_out。
Unix 超时结束该进程组；其他平台只保证结束直接子进程，使用产生后代进程的工作负载前
先核对该平台的清理后端。没有自动重试、下载、SSH、GPU 分配或秘密环境注入。

manifest v1 包括 run_id、objective、kind、status、时间、argv、exit_code、seed、
inputs、required_outputs、artifacts（path／sha256／bytes）、protocol_sha256、environment、
missing_outputs 与 limitations。它是 `run-review` 的最小共享接口，非个人 Harness 合同。
环境记录中的 launcher_python 仅指运行器，不证明实际命令的解释器和依赖完整。
