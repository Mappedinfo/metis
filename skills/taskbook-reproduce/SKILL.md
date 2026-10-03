---
name: taskbook-reproduce
description: >
  Prepare to reproduce one paper PDF: a figure/table checklist, a data
  availability plan marking every missing dataset without fabrication, and a
  runnable code scaffold (src/ + README). Use when a user provides a paper PDF
  and asks to reproduce it, prepare a reproduction, get its experiments
  running, or reproduce Table 3/Figure 2. Produce preparation materials, not
  reproduction conclusions. Not for close reading (use taskbook-interpret) or
  executing the full experiment once complete data and code are available.
license: MIT
category: build
domain: [experiment, paper]
action: [create, test]
uses: [scansci-pdf]
artifacts:
  - "复现计划.md — Figure/table reproduction checklist: data, steps, expected outputs and acceptance criteria against the original"
  - "data_plan.md — Data availability plan identifying every missing item and suggesting alternatives"
  - "src/ — Runnable code scaffold, including src/README.md"
---

[中文译本](SKILL.zh.md)

# Prepare Reproduction Data and Code (taskbook family)

For the attached paper PDF or the PDF at the specified path, produce the
plan, data strategy, and code scaffold needed for reproduction. **This step
prepares reproduction; it does not draw conclusions on behalf of the paper's
authors.** A person determines whether the results are correct. For a large
PDF or scanned document, first use `scansci-pdf` to extract the text and a
figure/table inventory.

## When to use

- The user provides a paper PDF and asks to reproduce it, prepare a
  reproduction, get its experiments running, or reproduce Table 3/Figure 2.

Do not use for close reading (use `taskbook-interpret`) or executing the full
experiment after complete data and code are available. Such execution belongs
to an experiment workflow outside this skill's scope.

## Method

1. **Read the entire paper PDF**, including every figure, table, and appendix.
   List the experiments, tables, and figures that need to be reproduced.
2. **Produce three outputs**:
   - `复现计划.md`: at least one line per figure/table, covering required
     data, steps, expected outputs, and acceptance criteria against the
     original paper.
   - `data_plan.md`: inventory of required data with names, sources, access
     methods, and licenses. Mark every dataset not provided by the paper
     **缺失** (missing), and suggest alternative sources (public proxy
     datasets) or explicitly state “无法获取” (cannot be obtained).
   - `src/`: a runnable code scaffold for data loading, preprocessing, and
     the core algorithm entry point. Include `src/README.md` explaining the
     directory structure and how to run it.
3. **Explicitly mark** uncertain implementation details in code comments;
   do not silently assume them.
4. Finish with a brief Chinese summary listing each output path.

## Requirements

- [B] R1 Include 100% of the paper's main tables and figures in the plan —
  Verification: the number of entries in `复现计划.md` matches the paper's
  number of main tables and figures.
- [B] R2 Mark every missing dataset; fabricate nothing — Verification:
  every missing item in `data_plan.md` has an alternative access suggestion
  or is marked “无法获取”.
- [B] R3 In a clean environment, `src/` runs until only missing data prevents
  progress, or runs successfully — Verification: executing the entry script
  produces no syntax or import errors.

## When to stop

- Stop after delivering the three outputs with a path summary.
- Do not execute the full reproduction experiment or report a conclusion of
  "reproduction succeeded/failed". Interpretation and judgment belong to
  the researcher.

## Output contract

1. `复现计划.md`, `data_plan.md`, and `src/` (including `src/README.md`).
2. Never invent data or results, or draw conclusions on behalf of the paper's
   authors.
3. Explicitly mark uncertain implementation details in code comments.
4. Write outputs only in the current working directory.

Taskbook family: this skill is the independently triggerable version of the
`reproduce` preset in [research-taskbook](https://github.com/mappedinfo/metis),
originating in the skill maintainers' own MIT-licensed project
[GIStudio/research-taskbook](https://github.com/GIStudio/research-taskbook).
