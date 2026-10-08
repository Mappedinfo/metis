# 虚构前向案例

全部站点与数据为虚构。

正例：按 rules.json 准备 raw.csv，不补值也不删观测。检查四条记录、site-date唯一、
NA转成已声明的缺失、原件哈希不变；每条输出能定位到源记录。

相邻反例：已准备好CSV，只要求比较cost变化并导出图。直接交绘图能力，不重做清洗。
无法确定单位或要求“删到相关性最高”时，相关操作保持待决定，不以结果好看决定样本。

运行：

```bash
uv run --offline --no-project python <skill>/scripts/prepare.py --input <skill>/examples/raw.csv --spec <skill>/examples/rules.json --output-directory prepared
```

交付目录必须尚不存在。真实运行与读取产物之后才填验收台账；示例预期不证明执行已完成。
