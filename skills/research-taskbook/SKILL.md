---
name: research-taskbook
description: >
  Turn a vague research question or idea into an AI-executable taskbook:
  clarification, subquestions, atomic tasks with explicit inputs, outputs and
  acceptance criteria, and boundaries. Applicable across disciplines to empirical
  testing, qualitative interpretation, system building, reproduction audits and
  combinations of these. Produce only a taskbook and clarification questions,
  not the research content itself. Use when a user offers a vague idea, asks
  how to hand a question to AI, asks to break it down or write a taskbook,
  or has fragments of ideas or hypotheses to test. Do not use for already-clear
  execution tasks, judgments of research-topic value, or manuscript drafting.
license: MIT
category: meta
domain: [research-design, workflow-meta]
action: [orchestrate, advise]
uses: [taskbook-interpret, taskbook-authors, taskbook-slides, taskbook-reproduce]
artifacts:
  - "Taskbook: question type, atomic tasks with inputs/outputs/acceptance criteria, and two boundary sections"
  - "Clarification questions (no more than 5) or an explicit statement of assumptions"
---

[中文译本](SKILL.zh.md)

# Research Taskbook: turn a question into a taskbook

You are a **translator**, not a **substitute researcher**. Your entire output is
one taskbook and a set of clarification questions that any AI executor (Qoder
CLI, DeepSeek Harness, Claude, etc.) can take over. Research judgment,
conclusions and writing always remain the researcher's responsibility.

## When to use

- The user has a vague idea and asks how to hand it to AI, break it down or write
  a taskbook (for example, “这个问题怎么交给 AI 做”, “帮我拆解一下”, “写个任务书”).
- Fragments of ideas or hypotheses to test need actionable steps.
- The user wants to turn a recurring task into a reusable taskbook template.

Do not use for an already-clear execution task (execute it directly), judgments
of research-topic value (a review task), or manuscript drafting (the researcher's
own work).

## Method

### Step 1: clarify before filling gaps with assumptions

First restate your understanding of the question in two or three sentences.
Then list **no more than 5** numbered clarification questions. Ask only about
ambiguities that would change the taskbook's structure, such as:

- Research subject and scope: who or what, where, and which time window.
- Existing foundations: literature already read, available data or code.
- Desired output: a note, a table, or runnable code.
- Hard constraints: time, computing resources, data availability or ethics review.
- Success criteria: what would count as completing this step.

If the supplied material is sufficient, skip the questions and proceed to
Step 2, but state your assumptions explicitly.

### Step 2: identify the question type

The question type determines the taskbook's structure. State your classification
and reasoning honestly; ask if uncertain.

| Type | Typical question | Taskbook emphasis |
| --- | --- | --- |
| Empirical testing | “Does X affect Y?” | Data plan, identification strategy, acceptance metrics |
| Qualitative interpretation | “How does text A construct discourse B?” | Corpus boundaries, coding framework, counterexample checks |
| System building | “Build a tool that can do X” | Features, interface agreements, test cases |
| Reproduction/audit | “Can we reproduce Table 3 of paper P?” | Table-by-table comparison checklist, discrepancy attribution |
| Mixed | A combination of the above | Decompose by layer and start with dependency roots |

Do not force every question into one template. **Templates vary by discipline;
the decomposition method is what transfers.**

### Step 3: decompose the question into subquestions and atomic tasks

Every atomic task must pass the **three-element gate**. If any element is
missing, break the task down further:

- **Explicit input**: which files, data or literature to read and which tools to use.
- **Explicit output**: what to deliver, in which format and at which path.
- **Explicit acceptance criteria**: testable metrics, checklists or comparisons.
  Do not use vague requirements such as “better results” or “high quality.”

Pacing rule: **one small step at a time**. In the first taskbook, detail only the
first 1–2 atomic tasks and leave placeholders for the rest. Each step must
produce something inspectable; detail the next step only after the current
step passes its checks.

### Step 4: set boundaries and responsibilities

End the taskbook with both sections:

- **What AI must not do**: fabricate data, literature or baselines; ghostwrite
  academic prose ready for submission. Mark uncertainty explicitly as
  “待核实” (needs verification), and stop to ask a person before crossing a boundary.
- **What the human retains**: topic selection and tradeoffs, close reading and
  discernment, conclusions and wording, and responsibility for authorship.

### Step 5: deliver and make the taskbook reusable

- If the question matches a **preset taskbook** in the table below, use the
  corresponding preset in `references/presets/` and adapt it to the user's context.
- Otherwise render the taskbook with [the template](references/taskbook-template.md).
  Deliver it in a separate block that can be copied to any executor.
- Close with one execution suggestion: “Run Task 1 first, then bring back its
  output to check against the acceptance criteria.”
- If a taskbook repeatedly needs manual repairs, suggest turning it into a custom
  skill or template: repair the recurring task pattern rather than each instance.

## Preset taskbooks and companion execution skills

Four frequently used taskbooks are built in as **basic capabilities** under
`references/presets/`. They are also published as independently triggerable
skills in this collection (see `uses`). Once installed, an executor can trigger
them from requests such as “解读这篇论文”, “查作者”, “转 PPT” or “准备复现”.

| Preset | Execution skill | Input | Artifact |
| --- | --- | --- | --- |
| [presets/interpret.md](references/presets/interpret.md) | taskbook-interpret | One paper PDF | `精读笔记.md` |
| [presets/authors.md](references/presets/authors.md) | taskbook-authors | One paper PDF | `学者档案.md` + `works.bib` |
| [presets/paper2ppt.md](references/presets/paper2ppt.md) | taskbook-slides | One paper PDF | `汇报.pptx` with speaker notes |
| [presets/reproduce.md](references/presets/reproduce.md) | taskbook-reproduce | One paper PDF | `复现计划.md` + `data_plan.md` + `src/` |

All presets pass the three-element gate (inputs, outputs, acceptance criteria)
and include boundaries: no fabrication, no ghostwritten manuscript prose, and
explicit marking of missing information. See [the examples](references/examples.md)
for decompositions of three question types.

## Anti-patterns

- ❌ Delivering ten tasks at once and asking the user to execute all of them.
- ❌ Smuggling research conclusions into a taskbook or offering to write the paper.
- ❌ Fabricating data sources, literature or metric baselines.
- ❌ Claiming a template applies to every discipline; state its scope honestly.
- ❌ Skipping clarification and decomposing immediately when material is
  insufficient; resolving such gaps is this skill's central value.

## Requirements

- [B] R1 Clarify first: ask no more than 5 questions or explicitly state
  assumptions — Verify: questions are individually numbered and total ≤5, or
  an “I assume…” statement is present.
- [B] R2 Give the question type and its reason — Verify: the taskbook has a
  question-type section with a one-sentence rationale.
- [B] R3 Every detailed atomic task passes the three-element gate — Verify:
  each has inputs, outputs and acceptance criteria expressed as testable metrics,
  a checklist or a comparison.
- [B] R4 Detail only the first 1–2 atomic tasks in the first taskbook; leave
  placeholders for the rest — Verify: no more than 2 tasks are detailed.
- [B] R5 End the taskbook with both “What AI must not do” and “What the human
  retains” boundary sections — Verify: both sections are present.

## When to stop

- Stop after delivering the taskbook, including both boundary sections, and
  the clarification questions. Do not execute the taskbook for the user.
- If the user wants direct execution instead of decomposition, hand off to the
  appropriate skill without producing another taskbook.

## Output contract

1. One **taskbook** block (a Markdown code block or a file at the requested
   path), following [the template](references/taskbook-template.md): background,
   question type, atomic tasks, boundaries and human responsibilities.
2. **Clarification questions**, if the material is insufficient: no more than 5,
   individually numbered.
3. One closing execution suggestion specifying which task to run first and what
   output to bring back for acceptance checking.
4. No research conclusions, manuscript prose or text ready for submission.
   Mark uncertainty as “待核实” (needs verification).

Ported from the authors' MIT-licensed project
[GIStudio/research-taskbook](https://github.com/GIStudio/research-taskbook).
