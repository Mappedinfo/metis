[中文译本](paper2ppt.zh.md)

# Taskbook preset: paper to slides (paper2ppt)

> **Input**: one paper PDF, attached or at an explicit path.
> **Artifact**: `汇报.pptx`, in Chinese, with speaker notes.
> **Usage**: for a group meeting or reading group. The executor needs a PowerPoint
> generation tool, such as the pptx skill or python-pptx.

## The three elements

- **Input**: the full paper PDF, plus the target audience and presentation
  duration. The default is 10–15 slides for a group meeting.
- **Output**: `汇报.pptx`, 10–15 slides in Chinese, with speaker notes on every slide.
- **Acceptance**: the structure is complete (title → research question → methods
  → key results → limitations → summary and discussion questions); every slide
  has notes; every number and conclusion can be traced to the original paper;
  nothing is fabricated.

## Slide structure (for the executor to follow)

1. **Title slide**: paper title, authors and presenter.
2. **Research question and motivation**: why the work was undertaken and what
   it aims to answer.
3. **Methods**: how the work was done; explain the core design on one slide.
4. **Key results**: work through the original figures/tables slide by slide;
   favor figures/tables over text.
5. **Limitations**: both limitations stated by the authors and doubts you identify.
6. **Summary and discussion questions**: 3 questions to ask the authors or audience.

## Boundaries

- Keep all content faithful to the original PDF: do not invent results, numbers
  or conclusions absent from the paper.
- Prefer reusing the original figures/tables with attribution; preserve the data
  when redrawing them.
- Speaker notes are spoken presentation cues, not a translation of the paper;
  write them in a conversational voice.
