[中文译本](taskbook-template.zh.md)

# Taskbook template

> Usage: `{braces}` mark placeholders. Deliver the taskbook in a separate block
> that can be copied directly to any AI executor. Let the question's complexity
> determine the number of subtasks; in the first taskbook, detail only the first
> 1–2 atomic tasks and leave placeholders for the rest.

```markdown
# Taskbook: {one-sentence title}

## Background
{2–3 sentences: where the task came from, why it is needed and which research question it serves.}

## Question type
{Empirical testing / Qualitative interpretation / System building / Reproduction audit / Mixed}
{One sentence explaining the classification.}

## Atomic tasks

### Task 1: {a name beginning with a verb}
- Input: {which files to read, data to use and literature to consult; specify paths or sources}
- Output: {which file to deliver, in which format and at which path}
- Acceptance: {testable criteria: a metric threshold / an item-by-item checklist / comparison with a baseline}
- Suggested tools: {optional: suitable commands, libraries or skills}

### Task 2: {…}
{Use the same structure, or write “Placeholder: detail after Task 1 passes acceptance checks.”}

## Boundaries (the executor must read)
- Do not fabricate data, literature or metric baselines; mark unverifiable sources as “待核实” (needs verification).
- Do not ghostwrite academic prose ready for submission; limit outputs to structured notes, data and code.
- When encountering ambiguity or an action that crosses a boundary, stop and ask a person rather than improvising.

## Human responsibilities (outside the taskbook's execution scope)
- Judge whether the task is worth doing and whether the subquestions are well decomposed.
- Read key material closely and exercise discernment.
- Interpret results, draw conclusions and write formal prose.
```

## Writing acceptance criteria

| Counterexample: not testable | Example: testable |
| --- | --- |
| “Organize the relevant literature.” | “Deliver `文献对比表.md` with ≥8 papers published after 2020 × 5 columns (question/method/data/conclusion/limitations), each with a DOI.” |
| “Run a regression and see.” | “`results/表1.csv` contains the NDVI coefficient, SE, p-value and N; values match the paper's Table 1 within ±0.01, or discrepancies can be attributed.” |
| “Make the code cleaner.” | “`src/` passes every assertion in `python -m src.check`; every public function has type annotations.” |
