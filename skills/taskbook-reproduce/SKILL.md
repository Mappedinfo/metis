---
name: taskbook-reproduce
description: >
  Prepare to reproduce one paper PDF: a figure/table checklist, a data
  availability plan marking every missing dataset without fabrication, and a
  runnable code scaffold (src/ + README). Use when a user provides a paper PDF
  and asks for a reproduction plan, missing-data assessment, or runnable
  scaffold to prepare Table 3/Figure 2. Produce preparation materials, not
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
authors.** A person determines whether the results are correct.

Check the available local PDF reader and page renderer first. Use OCR only
when the text layer is absent or defective and an OCR tool is available;
verify numbers, equations and figure/table labels against the original pages.
Record unreadable pages and actual reading coverage. `scansci-pdf` retrieves
papers by identifiers; its optional download-time Markdown is not a local-PDF
reader, OCR service or guarantee of figure extraction. Use it only when
retrieval is needed. Missing reading tools leave affected requirements blocked.

## When to use

- The user provides a paper PDF and requests a reproduction plan, data
  availability assessment or runnable scaffold. For “reproduce this paper” or
  “run its experiments”, determine whether preparation is the unresolved stage;
  do not substitute a plan for an explicitly requested formal execution.
  When data and code are ready, route execution to an available experiment
  capability and report any missing capability.

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
   do not silently assume them. Perform a finite entry-point smoke check in
   a clean environment: validate syntax/imports and expected missing-data
   handling. This is scaffold verification, not a formal training/evaluation
   run; do not generate substitute results or claim reproduction success.
4. Finish with a brief Chinese summary listing each output path.

Maintain one ledger for the accepted task and the requirements below:
`ID | requirement | done/blocked/n/a | evidence or reason`. `n/a` needs a
scope-based reason and cannot waive a requested outcome. A file or an honest
partial-coverage label does not establish completion of the accepted scope.

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

Use one scoped reading/creation pass, at most one targeted repair round and
one final check of affected outputs. Deliver when every applicable blocking
requirement has passing evidence in the ledger. Do not reopen passed checks.
If input, tools or a required verification are unavailable, or the budget is
exhausted, deliver a useful partial result only with completed and blocked
items, the stop condition and the smallest unblock condition. Partial delivery
is not full acceptance; mark unsupported content unavailable rather than
inventing it. Continue independent work within the accepted scope.

## Output contract

Include the requirements ledger and actual coverage/check status in the
existing notes or delivery summary, with remaining work and unblock conditions.
Do not add a separate tracking system.

1. `复现计划.md`, `data_plan.md`, and `src/` (including `src/README.md`).
2. Never invent data or results, or draw conclusions on behalf of the paper's
   authors.
3. Explicitly mark uncertain implementation details in code comments.
4. Write outputs only in the current working directory.

Taskbook family: this skill is the independently triggerable version of the
`reproduce` preset in [research-taskbook](https://github.com/mappedinfo/metis),
originating in the skill maintainers' own MIT-licensed project
[GIStudio/research-taskbook](https://github.com/GIStudio/research-taskbook).
