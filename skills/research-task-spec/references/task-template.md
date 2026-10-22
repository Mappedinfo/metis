# Adaptable task agreement

Use when creating a durable agreement. Reuse existing sections and omit unused
fields. Sources may be current user requirements, authorized file locations or
current project specifications. Stable IDs connect the records.

```markdown
# Task: <observable goal>

Updated: <date and timezone>
Agreement version: <version or commit>
Current mode: <alignment / execution / acceptance>

## Goal and scope

- Goal, object and purpose: <who needs what and why>
- Artifacts and coverage: <files, formats, counts, regions, periods>
- Constraints and resources: <accepted data, time, compute or cost boundaries>
- Evaluator and criteria: <assistant checks / user review / existing protocol>
- Current priority: <unknown that could alter subsequent value or correctness>

## Ambiguity and assumptions

| ID | Original wording or gap, with source | Interpretations and consequences | Disposition and state | Affected items |
| --- | --- | --- | --- | --- |
| A1 | <consequential ambiguity> | <difference in meaning> | <verified / stated assumption / awaiting answer> | <R/T IDs> |

## Requirements and acceptance

| Requirement | Original and source | Action and deliverable | Required level and acceptance state | Check and basis | Result and evidence |
| --- | --- | --- | --- | --- | --- |
| R1 | <wording or locator> | <object, scope, output> | <required/preference/proposal; accepted/pending> | <case, units, tolerance or review criteria> | <pass/fail/unverified; evidence> |

## Execution tasks

| Task | Requirements | Inputs and dependencies | Output and acceptance | Executor and state | Next action or unblock condition |
| --- | --- | --- | --- | --- | --- |
| T1 | R1 | <input versions; predecessors> | <artifact; check> | <executor; plan/doing/done/blocked/drop> | <specific action or gap> |

## Claims and evidence (when scientific claims are involved)

| Claim | Scope and comparison | Weakening or refuting condition | Supporting and opposing evidence | Current judgment |
| --- | --- | --- | --- | --- |
| C1 | <pending claim> | <counterexample, control, premise> | <R/T IDs and evidence> | <pending/conditionally supported/unsupported/uncertain> |

## Consequential changes

- <time> <decision/experiment/failed path/pivot/requirement change>: <event>.
  - Basis and source role: <user requirement/source fact/AI proposal/AI execution; acceptance state>.
  - Consequences: <R/T/C IDs, rechecks, retained results, next action>.

## Execution ledger (reuse the existing acceptance table)

| Task or skill requirement ID | done / blocked / n/a | Evidence or reason |
| --- | --- | --- |
| <applicable requirement> | <state> | <check result or smallest unblock condition> |

## Delivery and continuation

- Accepted by verification: <requirements and actual evidence; viewing or run instructions if needed>.
- Failed or unverified: <consequences and smallest unblock condition>.
- Scientific judgment: <support scope, opposing evidence, uncertainty, if applicable>.
- External acceptance: <whether user/reviewer has accepted; unknown stays unknown>.
- Next step: <action, input and completion condition>.
```

Evidence needs no additional fixed format. Link existing runs, result tables,
test reports or manual checks. State what was actually checked and its result;
a folder link alone does not explain what it supports.
