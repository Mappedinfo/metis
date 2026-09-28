# Requirements ledger

Template version: 1

Copy this template into the task's working record or include it in the
routing note. Reuse the same ledger during the task and its corrections.
Add rows for the accepted task requirements and each active skill's
Requirements items; retain their IDs, levels and verification methods.
Use a skill-name prefix where IDs could collide.

- Accepted outcome: <what the user requested>
- Mode: <planning only / execution>
- Scope: <included outcomes and explicit exclusions>
- Budget: <named round, retry or item limits for iterative work>

| ID | Level | Requirement | Verification | Status at close-out | Evidence or reason |
|---|---|---|---|---|---|
| U1 | B | <required user outcome> | <how to check it> | <done / blocked / n/a> | <artifact and check result, or specific reason> |
| skill-name:R1 | B | <skill requirement> | <its stated verification> | <done / blocked / n/a> | <artifact and check result, or specific reason> |
| skill-name:R2 | A | <advisory requirement> | <its stated verification> | <done / blocked / n/a> | <artifact and check result, or specific reason> |

Maintain the rows during work and resolve every status at close-out. An
unchecked row is still open; never mark it done merely to fill the table.

- `done`: the requirement's verification passed. Link or name the artifact
  and state the observed result; file existence alone proves only existence.
- `blocked`: the requirement is unmet, including when its allocated budget
  ended. State the unfinished work and the smallest condition that would
  allow it to continue.
- `n/a`: the requirement does not apply to the accepted scope. State why.
  A required user outcome cannot be waived this way; it stays blocking
  unless the user explicitly changes the scope.

For planning-only requests, U1 covers the requested plan. List downstream
work separately as unperformed; a sound plan supplies no evidence that its
execution succeeded. For execution requests, include every required outcome
and phase artifact in the ledger. A frozen audit finding list may be linked
from rows, but it is not a substitute for this requirements check.

## Close-out

- Stop condition: <artifact acceptance / budget exhausted / capability gap>
- Task state: <complete / partial / blocked>
- Completed items: <IDs and evidence>
- Unfinished items: <IDs and remaining work; none only when verified>
- Smallest unblock condition: <concrete condition for each unresolved
  blocking item; none if there are no unresolved blocking items>
- Planning-only downstream work: <unperformed phases, or not applicable>

Declare the task complete only when every applicable blocking requirement
is done with evidence. Advisory gaps remain visible without blocking
completion. A budget stop bounds the run; it does not turn unfinished work
into completed work.
