# Evidence and decision rules

Use for a review that combines sources, tests a completion claim, or must
choose between explanations and workstreams.

## Match evidence to the claim

| Claim | Inspect | What this does not establish by itself |
|---|---|---|
| A feature is usable | Relevant accepted behavior and a reproducible interaction or focused test | A commit or successful build does not establish usability or deployment |
| An experiment changed a conclusion | Run configuration, completed run, actual result, and the comparison it supports | A launcher, planned analysis, or running process is not a result |
| A source changed an argument | The relevant source passage and the resulting claim or decision | A citation count or downloaded paper does not establish reading or support |
| A milestone is complete | Every accepted required outcome and its acceptance evidence | A checklist, file count, or selected successful component does not establish the whole milestone |
| A learner understands a concept | The learner's actual explanation, solution, application, or delayed recall | An agent-produced answer does not demonstrate the learner's mastery |
| An automated review was delivered | The actual run, requested artifact, persisted status, and promised delivery surface | A scheduler entry or zero process exit does not establish delivered content |

Record each material claim with its evidence location, observed time when
known, coverage limit, and implication. A supplied user statement can be
evidence; attribute it as such instead of relabeling it independently
verified. Inspect the promised result rather than relying only on its
producer's success message.

## Time and conflicting sources

Keep event time, observation time, and file modification time distinct.
An artifact may be current but describe an older event. A dirty working
tree can contain changes from outside the requested interval. State the
timezone used to resolve local date boundaries and the exact interpretation
of phrases such as "this week" when it matters.

When sources disagree, preserve the conflict and choose the source that
can establish the particular claim. A newer proposal does not override an
accepted scope merely because of its timestamp. Inspect a focused diff,
the accepted decision, or a direct result before choosing between accounts.
If the bounded follow-up cannot resolve it, report the unresolved claim and
the smallest discriminating check; do not average incompatible assertions.

## Diagnose a blockage

For each consequential blocker, write:

```text
Symptom: what is directly observed.
Cause: supported explanation, or competing hypotheses.
Discriminating check: the smallest observation that separates those hypotheses.
Impact: which accepted outcome remains impossible or unverified.
Unblock condition: required input, repair, decision, or authorization.
```

Distinguish not started, running, failed, and completed but unverified;
missing, stale, and invalid inputs; technical dependencies and permission
limits. Repeated polishing may avoid a decisive check, but call that an
interpretation unless the inspected history supports it.

For example, an export job reported success while the required output is
absent. The observation is a missing artifact, not automatically a failed
algorithm. Check the output destination and completion record once within
the budget; preserve other plausible causes until evidence distinguishes
them. The accepted result remains unverified.

## Turn evidence into a priority

Prefer an action that can change the most consequential pending decision,
fits the authorized time and scope, and has an observable acceptance check.
Name the tradeoff when two workstreams compete. Treat cosmetic work and
infrastructure as useful only to the extent that they serve the accepted
outcome; neither is automatically waste nor substantive progress.

For research, state the concrete reference value: the question, mechanism,
comparison, claim boundary, figure, or decision that the activity supports.
Separate a direct contribution from capacity that still needs a bridge to
one. A negative result can be the most valuable progress when it rules out
an unsupported claim. Do not impose this research lens on ordinary work.

Preserve required coverage when proposing priorities. A postponed or
dropped requirement needs an explicit accepted change, not just a lower
rank in the agent's list. Finish by linking the selected action to its
deliverable, check, dependency, and truthful state.
