[中文译本](signal-guide.zh.md)

# Contextual signal guide

Use this guide to decide whether a candidate harms the text's purpose.
Read the sentence, neighboring sentences, and document role before acting.
Examples below illustrate decisions; the executable vocabulary and
thresholds are maintained only in [rules.json](../scripts/rules.json).
Tier numbers are candidate-selection settings, not severity classes.

## Vocabulary, abstraction, and emphasis

**Process jargon.** Contract, boundary, receipt, alignment, loop, ecosystem,
and related expressions need an identifiable referent. In a plain progress
note, “完成指标回执” may conceal whether someone measured, checked, or recorded
something. Choose a replacement only after the surrounding text establishes
the actual action. A real API contract, acceptance condition, legal contract,
or scientific validity limit may be precisely the right term.

**Domain language.** Terms such as hallucination, token, prompt injection,
agent, temperature, framework, and paradigm can carry technical meaning.
Preserve them when they name the subject accurately. If the audience needs
an explanation, define the term; do not erase the concept to reduce hits.
For a nontechnical use, identify the concealed action or claim before
calling the wording jargon.

**Execution reminders in prose.** Expressions such as "不冒充全局" or
"真实口径" may be instructions to the writer carried into a reader-facing
passage. Establish whether the requested subject is the writing process
itself. Otherwise, express the actual coverage, evidence source, date,
method or action already available, or delete an empty assurance. Preserve
"样本仅来自三个城市" and genuine uncertainty because they affect interpretation.
If detail is missing, flag that gap; never invent scope or measurements.

**Prestige and intensity.** Words such as “pivotal”, “robust”, “holistic”,
“赋能”, or “极其关键” require context, not automatic deletion. Ask what result,
comparison, condition, or reader decision the emphasis describes. Keep
“robust to these specified perturbations” when supported; qualify or remove
unexplained praise. An adjective's frequency does not establish a defect.

**Promotion and emotion.** Inspect “boasts”, “stunning”, “震撼”, “眼前一亮”, and
similar framing against the genre. “Located in”/“坐落于” can simply state a
location. A supplied personal reaction can be appropriate in a memoir;
neutral reporting may need a factual description instead. Never invent an
experience or sensory detail to make a revision sound personal.

## Sentence relationships

**Negation and contrast.** Select the genre before judging split negation
(“This is not X. This is Y.”), “不是 X，而是 Y”, “不在……而在……”, or consecutive
“这不是……那不是……”. In research prose and academic reviews (`academic`),
mark rhetorical framing for revision and state the object, method or result
directly: "本研究记录降雨概率。" In popular science, teaching and scripts
(`explain`), inspect context; "记录的不是降雨量，而是降雨概率" can correct a
relevant misconception. General prose also needs context. A real method
comparison or necessary limitation must keep its information, expressed
directly when appropriate: "本研究预测降雨概率，基线模型预测降雨量。"
Revise an unmotivated rejected alternative, false opposition or repetitive
delay. Changing punctuation alone leaves that reasoning problem intact.

**Three-part lists.** A triad is useful when its three members are distinct
and relevant, such as three specified experimental conditions. Inspect
forced symmetry, overlapping members, and unexplained extras. Do not cut a
valid item or invent a fourth to disrupt the pattern.

**Transitions and stock introductions.** A chain of “first”, “therefore”,
“in other words”, “首先”, “当然”, “更麻烦的是”, or “说到这里” is useful only if it
expresses the actual sequence or relation. Keep functional signposting.
Delete a redundant transition or correct the relation when the text does
not support it; a causal connector may expose a substantive evidence gap.

**Intensifier repetition.** Adjacent sentences repeating the same
strengthener merit attention even below a frequency threshold. Check the
claim being strengthened and whether the second sentence adds information.
Forms such as “很 + adjective”, “高度 + abstract noun”, and “有很 X 的感觉”
are reading prompts, not complete grammatical definitions or defects.

**Passive openings and missing actors.** A passive can properly foreground
an object or procedure. Revise “is widely believed”/“被广泛认为” when it hides
a necessary source or attribution. Supply an actor only if already known.
For “越……越……”, check whether the subject is recoverable and whether the
claimed relationship is supported; ordinary Chinese subject omission is
not itself an error.

**Importance and superficial interpretation.** “Marking a pivotal moment”,
“highlighting its importance”, “体现了”, or “反映了” may attach a conclusion
without explaining the bridge from observation. Ask what inference the
phrase adds, what warrants it, and what changes for the reader. Preserve a
supported interpretation; remove an empty afterthought or flag the missing
reason. An English participle ending in “-ing” is not a defect by form.

## Meaning across passages

**Semantic loops.** Different words can repeat one claim, even with no
lexical repetition. Compare the propositions: do “narrow”, “small”, and
“shallow” add distinct dimensions here, or restate an unsupported judgment?
Merge only true redundancy, preserving differences in population, scale,
mechanism, or consequence. A repeated keyword can instead maintain a clear
referent. No fixed word count establishes a semantic loop.

**False ranges.** For “from X to Y” or “从 X 到 Y，从 A 到 B”, identify the
axis or process connecting the endpoints. Dates, measured ranges, stages,
and a clearly explained transformation may be valid. Flag a range only
when the text implies continuity or progression it has not established.
Explain the missing relation; a surface match cannot decide this.

**Template endings.** A summary may help a reader use a long argument.
Check whether it supplies a decision, implication, or needed synthesis.
Cut a closing paragraph only if it repeats without serving the accepted
purpose. A conclusion heading or “综上所述” is not sufficient evidence.

## Shape and presentation

Sentence and paragraph lengths can describe rhythm. They cannot establish
authorship or a universal ideal. Never apply a supposed AI range such as
12–18 words or a standard-deviation cutoff. Review whether a passage is
monotonous, overloaded, or difficult to follow in its language and genre;
revise only the parts responsible for that reader effect.

Title Case, bold terminology, emoji, and `**Label**: explanation` lists can
support navigation or match a house style. Inspect emphasis saturation,
inconsistent hierarchy, and audience mismatch. Technical instructions may
benefit from repeated labels. Do not globally strip formatting because it
resembles a template. The scanner covers only its documented surface forms;
manual review remains responsible for the actual structure.

## Calibration and historical context

The helper applies local rules to locate wording. It cannot determine whether
text was written by an AI system or a person. Do not
convert its counts into “AI likelihood”, invent confidence percentages, or use
colloquialness, spelling errors, emotional variability, or concrete details
as evidence of authenticity or truth.

Two historical examples explain why provenance claims require their own
evidence: OpenAI withdrew its specific classifier in July 2023 citing low
accuracy ([OpenAI notice](https://openai.com/index/new-ai-classifier-for-indicating-ai-written-text/));
Liang and colleagues reported misclassification of non-native English
writing in the detectors and samples they tested in 2023
([Patterns paper](https://doi.org/10.1016/j.patter.2023.100779)). These are
bounded findings about those systems and settings. They neither validate
this helper nor establish the performance of all present-day detectors.
