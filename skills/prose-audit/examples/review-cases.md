# Fictional practice inputs

[中文说明](review-cases.zh.md)

These requests and drafts are invented practice material. Keep each original
draft unchanged and put the requested response in a separate destination. The
English and Chinese instructions below use the same source passages so their
facts and candidate locations can be compared. They contain no expected answer.

## Case A: audit a technical explanation

Request: Review this explanation for jargon and formulaic wording. Give only an
audit with source locations, reasons and minimal suggestions. Do not rewrite
the whole draft. Can the wording establish whether AI wrote it? Reply in Chinese.

Draft:

> 本接口的输入是 prompt，输出是 token 序列。上下文窗口最多容纳 8,192 个 token。
> 请求不合法时，接口返回错误码 E12，而不是空结果。这一约定让客户端区分失败与没有匹配项。
> 三组日志只来自内部测试，不能说明所有用户的请求都能被正确处理。
> Robust regression was used because two observed values were extreme. The quoted warning in the log is “这是一个革命性的突破”.

The blockquote above delimits the entire supplied draft; review its prose as
the target, while preserving the quotation inside it. If using the helper,
save the draft body as plain text without the surrounding Markdown quote marks.

## Case B: minimally revise a release note

Request: Revise this internal release note to remove empty emphasis and
repetition. Preserve all supported facts, uncertainty and scope; supply the
full revised draft and a brief explanation. Reply in the draft's language.

Supplied facts: This is an internal pilot. A queue page combines three existing
status views. In a test of 40 tasks, 36 completed and 4 failed because their
source files were missing. There is no previous-version comparison or user
satisfaction measurement. A retry button is planned and has not been built.

Draft:

> 值得注意的是，这不是一次普通更新。这是全面赋能协同的新范式。它真正形成了闭环，真正实现了落地，也真正重塑了工作方式。
>
> 队列页把三个状态视图放到一起。在 40 个测试任务中，36 个完成，4 个因源文件缺失而失败。这一结果彰显了系统卓越的稳健性，从数据到洞察，从效率到未来，为团队带来了前所未有的价值。
>
> 更重要的是，我们计划增加重试按钮。综上所述，这次内部试用取得了革命性成功。

## Case C: review meaning when keyword hits are sparse

Request: Audit this English paragraph for useful explanation and repetition.
Keep observations separate from suggestions. Do not invent dates, people or
measurements, and do not produce a replacement draft.

Draft:

> The page matters because it is useful. Its usefulness is what gives the page value. The value comes from how much it helps. This is why the page matters.

## Case D: preserve the author's voice

Request: Check whether this personal note needs a wording change. Leave sound
sentences intact. The stated events are supplied facts; do not add other ones.

Draft:

> 其实我昨天没弄懂。今天重读第二段，才发现自己把输入和输出看反了。笔记里还留着那个箭头，我先把它改过来。

## Case E: apply the same facts in two genres

Request: Prepare a research-manuscript sentence (`academic`) and a popular
science spoken explanation (`explain`) from the same draft. Apply fixed rules
without rebuilding an SOP. Keep the supplied scope, source quotation and
method comparison; give both complete versions with a brief genre rationale.

Supplied facts: The records contain rainfall probability. The sample comes
from three cities. The baseline predicts rainfall volume. The log excerpt
is a source quotation, not the author's claim.

Draft:

> 记录的不是降雨量，而是降雨概率。这里不冒充全局，采用真实口径。样本仅来自三个城市。本研究预测降雨概率，基线模型预测降雨量。日志原文是“真实口径”。

Use the same original body and supply the appropriate `--genre` on each
scanner run; quotation protection remains enabled. Compare the fixed rule
actions with the contextual editing decisions. A retained quotation or
useful explanation can produce a legitimate candidate when quoted material
is deliberately included; zero candidates is not the goal.

## Local checks

Run the helper on a saved draft to obtain candidates, then perform the contextual
review. A successful helper run is not completion of any of these requests.
The test suite checks the helper's observable behavior:

```bash
uv run --offline --no-project python -B -m unittest discover -s skills/prose-audit/tests -p 'test_*.py'
```
