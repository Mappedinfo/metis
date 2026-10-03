---
name: taskbook-interpret
description: >
  Closely read one paper PDF and produce structured notes: a one-sentence
  summary, research question and motivation, core claims with evidence
  locations, methods and data, limitations and questions, evidence level,
  transferable insights, and references in three groups (main citations,
  important field references, and AI suggestions awaiting verification).
  Use when a user provides a paper PDF and asks to interpret, closely read,
  analyze, break down, or take reading notes on it. Produce analysis notes
  only, not manuscript prose. Not for PDF retrieval alone (use tools such
  as scansci-pdf) or writing multi-paper literature reviews.
license: MIT
category: analyze
domain: [paper, literature]
action: [analyze, record]
uses: [scansci-pdf]
artifacts:
  - "精读笔记.md — Structured close-reading notes in eight sections, including references in three groups"
---

[中文译本](SKILL.zh.md)

# Interpret a Paper (taskbook family)

Closely read the attached paper PDF or the PDF at the specified path and
write structured notes in `精读笔记.md`. For a large PDF or scanned document,
first use `scansci-pdf` to extract structured text, then read it closely.

## When to use

- The user provides a paper PDF and asks to interpret, closely read, analyze,
  break down, or take reading notes on it.

Do not use for PDF retrieval alone (an `acquire` task) or writing multi-paper
literature reviews. Synthesis across papers exceeds this skill's scope of
closely reading one paper.

## Method

1. **Read the entire PDF**, including its reference list, without skipping
   sections.
2. Produce each item in the note structure below. Every core claim must cite
   an evidence location (section/figure/table).
3. State the evidence level honestly: “全文阅读” (full text read), “仅摘要”
   (abstract only), or “仅元数据” (metadata only).
4. Finish with a brief Chinese summary listing the output file path.

### Note structure (use these output labels)

1. **一句话概括** (one-sentence summary): what the paper did and concluded.
2. **研究问题与动机** (research question and motivation): the question it
   attempts to answer and why it matters.
3. **核心主张** (core claims): list each claim with its evidence location.
4. **方法与数据** (methods and data): methods, data, and data sources.
5. **局限与疑点** (limitations and questions): weaknesses in methods or
   evidence, and unstated assumptions.
6. **证据等级** (evidence level): “全文阅读” / “仅摘要” / “仅元数据”.
7. **可借鉴之处** (transferable insights): implications for the reader's own
   research; provide analysis and suggestions only.
8. **参考文献整理** (reference organization): three groups, using the paper's
   original reference list as the authority:
   - **主要引用** (main citations): references central to the paper's
     argument; identify which part of the paper each supports.
   - **领域重要文献** (important field references): cited classic or
     foundational works in the field; explain why they matter.
   - **潜在相关（AI 补充，未被论文引用）** (potentially related: AI additions
     not cited by the paper): potentially relevant directions or works that
     the paper did not cite. Mark every item “AI 建议，待核实” (AI suggestion,
     to be verified). Recommend only classic works known to exist, or give
     specific search queries. Omit works whose existence cannot be confirmed.

## Requirements

- [B] R1 Read the entire PDF without skipping sections — Verification:
  evidence locations in the notes cover methods, results, and references;
  the evidence level is stated honestly.
- [B] R2 Include all eight sections and an evidence location for every core
  claim — Verification: the notes contain all 8 sections, and each claim
  identifies a section/figure/table.
- [B] R3 Separate AI additions from references actually cited by the paper;
  mark each “AI 建议，待核实” — Verification: the three reference groups have
  separate sections, and no AI addition lacks the label.

## When to stop

- Stop after delivering `精读笔记.md` with a path summary.
- If the user subsequently asks for a literature review or manuscript prose,
  state that this exceeds the skill's scope and do not produce it under this
  skill.

## Output contract

1. One `精读笔记.md` file containing all eight sections.
2. Mark information absent from the paper “论文未说明” (not specified in the
   paper). Never invent references, data, or conclusions.
3. Produce structured analysis notes only. Do not ghostwrite a paper,
   literature review, or any academic prose ready for submission.
4. Write outputs only in the current working directory; do not modify any
   files outside it.

Taskbook family: this skill is the independently triggerable version of the
`interpret` preset in [research-taskbook](https://github.com/mappedinfo/metis),
originating in the skill maintainers' own MIT-licensed project
[GIStudio/research-taskbook](https://github.com/GIStudio/research-taskbook).
