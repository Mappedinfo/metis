[中文译本](reproduce.zh.md)

# Taskbook preset: reproduction data and code (reproduce)

> **Input**: one paper PDF, attached or at an explicit path, optionally with a
> link to the authors' public code repository.
> **Artifacts**: `复现计划.md` + `data_plan.md` + a code scaffold under `src/`.
> **Usage**: this taskbook prepares for reproduction. Deliver a plan and scaffold,
> not a claim that reproduction succeeded; a person draws that conclusion after
> checking the results.

## The three elements

- **Input**: the full paper PDF, including all figures, tables and appendices,
  plus the authors' public code/data, if available.
- **Output**: three artifacts: `复现计划.md`, `data_plan.md` and `src/` (a runnable
  scaffold with a README).
- **Acceptance**: the plan lists 100% of the paper's main tables and figures;
  every dataset not provided is marked “缺失” (missing); `src/README.md` explains
  how to run the code; uncertain implementation details are explicitly marked
  in comments.

## Artifact structure (for the executor to follow)

1. **`复现计划.md`**: an inventory of experiments, tables and figures to reproduce
   from the paper. Each item has inputs, steps, expected outputs and acceptance
   criteria for comparison with the original.
2. **`data_plan.md`**: an inventory of required data (name, source, access method,
   license). Mark every dataset not supplied by the paper **“缺失” (missing)**;
   suggest alternative acquisition routes, such as a public proxy dataset, or
   explicitly mark it “无法获取” (unavailable).
3. **`src/`**: a runnable code scaffold covering data loading, preprocessing and
   the core algorithm entry point. Explain the directory structure and run
   instructions in `src/README.md`.

## Boundaries

- Do not fabricate any data or results. Mark data not supplied by the paper
  “缺失” (missing); do not generate it from nothing.
- Mark uncertain implementation details explicitly in comments rather than
  silently assuming them.
- This step prepares for reproduction; it does not draw conclusions on behalf
  of the paper's authors. A person checks whether the results are correct.
