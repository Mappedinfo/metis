# Companion learning during a review

Use when the task asks what to remember, revisit, or learn before the next
step. A daily or weekly cadence alone does not authorize a persistent
learning database or reminders. The public workflow defines useful
decisions; a selected local adapter defines its actual storage schema.

## Select an item worth reviewing

Retain a concept, invariant, method, formula, corrected misconception, or
missing prerequisite only when it has inspected evidence and a concrete
next use. Do not count files opened or time spent as learning progress.
Prefer a few consequential items over an activity archive.

For each candidate identify:

- A stable topic and source location, including a section, equation, code
  location, or artifact anchor precise enough to check the claim.
- Its next use in a task or decision.
- Its source status and the learner's demonstrated understanding, separately.
- An executable review prompt and a check for an adequate response.
- A preview need if the next task requires knowledge not yet demonstrated.

When a richer classification is useful, keep independent axes:
`knowledge_type = project | domain | math`, an informative snake-case
`domain`, and `review_mode = teach_back | derivation | problem | transfer`.
A math item should isolate one formula, equivalence, derivation step, or
small quantitative control with a precise source anchor; do not put an
entire chapter into one mastery item. Translate these concepts into the
adapter's documented fields instead of imposing a public storage version.

## Separate source validity and mastery

| Axis | Useful distinctions |
|---|---|
| Source status | Directly supported by inspected source; explicitly derived from supported premises; unverified hypothesis; corrected claim with replacement evidence |
| Understanding evidence | Encountered; explained; applied; retrieved after delay; misconception corrected |

Record what was actually observed and whose performance it was. An agent's
correct derivation can support a claim without proving that the user can
derive it. A user's successful recall does not independently validate the
source claim. A correction is an event with evidence, not automatically
the highest mastery level. With no observed learner response, report the
check as proposed or awaiting response; never fabricate recall quality.

## Design recall and preview prompts

Use a prompt that can expose the specific misconception or skill gap:

- **Teach-back:** explain the key distinction without looking at the source,
  then compare with the cited definition.
- **Derivation:** reconstruct the named step and state the assumptions that
  permit it; check intermediate reasoning, not only the final formula.
- **Problem:** solve a small new case whose solution tests the concept.
- **Transfer:** apply the idea to a different task and identify where the
  analogy fails.

A preview item names the upcoming task, the smallest needed source/concept,
and an observable preparation artifact such as an explanation, example,
derivation, or toy implementation. Proposing it does not mean the source
has been read or the learner is ready.

If review dates are requested, use the user's or adapter's spacing policy.
Spaced retrieval is an operational heuristic, not proof of mastery or a
universal memory law. Good recall may justify a longer interval; partial
recall needs a focused check; failed recall needs a prerequisite or simpler
prompt. Pause or retire items only with a recorded relevance reason and
reopen condition. With no policy, propose a cadence rather than silently
creating due dates. A review date is not a deployed reminder.

## Keep durable updates optional and verifiable

Without an authorized store, deliver proposed review/preview items in the
review. Do not create a fallback ledger. With authorized updates:

1. Resolve `learning.adapter` and `learning.store` within the permitted
   roots; inspect and validate the existing schema before changing state.
2. Use stable item identity, preserve prior review dates and history, and
   merge new evidence without inventing a completed review. Resolve a
   classification conflict explicitly instead of silently reclassifying.
3. Validate a complete proposed batch before committing it to the store.
   Replaying unchanged intake should not create duplicates or advance review
   counters. Storage migration needs its own authorization.
4. Read back affected records and report actual additions, corrections,
   review updates, pauses, or retirements with evidence. If validation or
   writing fails, leave the store intact and report the unblock condition.

Keep the learner's knowledge records separate from agent self-assessment
and skill-quality feedback. A successful agent task is not evidence of
user mastery, satisfaction, or permission to alter future behavior.
