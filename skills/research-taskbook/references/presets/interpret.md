[中文译本](interpret.zh.md)

# Taskbook preset: interpret a paper (interpret)

> **Input**: one paper PDF, attached or at an explicit path, optionally with a
> sentence stating the specific question of interest.
> **Artifact**: `精读笔记.md`.
> **Usage**: give this taskbook unchanged to an AI executor together with the
> paper, or adapt it to your discipline using [the template](../taskbook-template.md).

## The three elements

- **Input**: the full paper PDF; the executor must read it completely, including
  the reference list.
- **Output**: one file, `精读笔记.md`, with the structured items below.
- **Acceptance**: all eight items are present; every core claim identifies its
  evidence location in the paper (section/figure/table); the three reference
  categories remain distinct; mark information absent from the full text as
  “论文未说明” (not stated in the paper), rather than guessing.

## Note structure (for the executor to follow)

1. **One-sentence summary**: what the paper did and what it concluded.
2. **Research question and motivation**: what question it tries to answer and
   why it matters.
3. **Core claims**: list each claim with its evidence location (section/figure/table).
4. **Methods and data**: methods, data and data sources.
5. **Limitations and doubts**: weaknesses in the methods or evidence, and
   assumptions left unstated.
6. **Evidence level**: full-text reading / abstract only / metadata only;
   explicitly identify the basis.
7. **Transferable insights**: implications for the reader's own research;
   provide only analysis and suggestions.
8. **Reference organization**, in three categories, using the paper's original
   reference list as the authority for cited-reference information:
   - **Main references**: works on which the paper's argument centrally depends
     (methods, data or works it directly engages with). Identify the part of the
     paper each supports.
   - **Important works in the field**: cited classic or foundational works;
     state why they matter.
   - **Potentially relevant (AI additions, not cited by the paper)**: directions
     or works that may be relevant but are not cited. Mark each “AI 建议，待核实”
     (AI suggestion, needs verification). Recommend only classic works whose
     existence is certain, or provide a specific search query. Do not list works
     whose existence cannot be confirmed.

## Boundaries

- Do not fabricate references, data or conclusions; mark what the paper does not
  state as “论文未说明” (not stated in the paper).
- Produce only structured analytical notes. Do not ghostwrite a paper, review
  article or any academic prose ready for submission.
- Keep “AI additions” distinct from works actually cited by the paper.
