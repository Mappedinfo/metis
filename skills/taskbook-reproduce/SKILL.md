---
name: taskbook-reproduce
description: >
  Prepare to reproduce one paper PDF: a figure/table checklist, a data
  availability plan marking every missing dataset without fabrication, and a
  runnable code scaffold (src/ + README). Use when a user provides a paper PDF
  and asks for a reproduction plan, missing-data assessment, or runnable
  scaffold to prepare Table 3/Figure 2. Produce preparation materials, not
  reproduction conclusions. Not for close reading (use taskbook-interpret) or
  executing the full experiment once the accepted mode has usable inputs and code.
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
  When inputs and code for the accepted mode are ready, route to an experiment
  capability and report any missing capability.

Do not use for close reading (use `taskbook-interpret`) or executing the full
experiment once accepted inputs and code are ready. Such execution belongs
to an experiment workflow outside this skill's scope.

## Reproduction scope and data availability

Distinguish exact reproduction, method adaptation and new ablation in the
existing plan. Exact source data, versions and hyperparameters constrain
exact-reproduction claims; they do not automatically block agreed adaptation.
Before declaring data missing, check existing assets/upstream runs, paper
references and public sources within scope. Not found is not nonexistent.

Allow fixed category cleanup, tokenization, supported translation and parent
fallback using real data/vectors. Report differences, actual-count-weighted
coverage and OOV; no 100% match or universal percentage gate. Preserve
column/count alignment, train/test separation and time-sensitive alignment;
never fabricate semantics/results or select mappings by evaluation scores.
Show frequent ambiguity, key semantic loss or cross-time substitution with
concrete examples and impact for human judgment. Routine term conversion
needs no repeated approval; do not invent unapproved major substitutions.
Keep viable authorized work moving and disclose adaptation in existing notes
without an additional evidence or approval system.

## Method

1. **Read the entire paper PDF**, including every figure, table, and appendix.
   List the experiments, tables, and figures that need to be reproduced.
2. **Produce three outputs**:
   - `复现计划.md`: at least one line per figure/table, covering required
     data, steps, expected outputs, and acceptance criteria against the
     original paper.
   - `data_plan.md`: inventory of required data with names, sources, access
     methods, and licenses. After checking sources, distinguish original
     assets not yet obtained, available adaptations and unresolved lookups.
     For actual gaps state access suggestions or the observed access limit;
     paper omission alone does not establish “无法获取” (cannot be obtained).
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
- [B] R2 Identify actual data gaps without fabrication — Verification:
  `data_plan.md` records searched sources, available originals/adaptations
  and remaining gaps, with access suggestions or observed limitations.
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
