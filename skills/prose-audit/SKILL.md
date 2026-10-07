---
name: prose-audit
description: >
  Reviews Chinese, English, or mixed prose for jargon, empty emphasis, and
  formulaic wording when asked to "check AI slop", "去 AI 腔", or "检查黑话".
  Produces contextual findings with source locations and, when requested,
  a minimally revised full text. Does not determine who or what wrote a text.
license: MIT
category: compose
domain: [writing, review-qa]
action: [review, revise]
uses: []
artifacts:
  - "Contextual prose review with source locations, reasons, and minimal remedies"
  - "Optional minimally revised full text with preserved meaning and author voice"
---

# Prose audit

[中文译本](SKILL.zh.md)

## What it does

Read the supplied prose as a whole, identify wording that obstructs its
purpose, and explain or make the smallest useful changes. Collect potentially
problematic passages as candidates, then judge in context whether they need
revision. The review works
without scripts, network access, private services, or another skill.

This skill reviews wording. It cannot determine whether text was written by
an AI system or a person, and must not assign probabilities to either conclusion.
When asked "was this written by AI?", state this limitation briefly and
offer the supported assessment of the wording actually present.

## When to use / not use

Use for an explicit audit or revision of prose described as mechanical,
vague, inflated, overstructured, or full of jargon, including a relevant
final pass in an already authorized writing task. Do not impose this pass
on every unrelated response or rewrite quoted material merely because it
contains a listed phrase.

This skill does not authenticate authorship, detect plagiarism, fact-check
external sources, or certify legal or scientific correctness. It does not
optimize for evading a detector: improve clarity and accuracy without adding
errors, artificial irregularity, or invented personal experience.

## Workflow

Follow steps 1–5 in order. In `audit` mode, skip step 4 and continue to step 5.
Both `edit` and `result-only` include step 4. Preservation of the input,
coverage records, and the requirements ledger apply throughout the workflow.
The requirements R1–R8 below also apply throughout; their numbers are
reference IDs, not steps.

### 1. Resolve the request and reading scope

Identify the audience, genre, purpose, language, protected material, and
accepted length or format from the request and supplied context. Ask only
when a missing choice materially changes the review. Use these modes:

| Mode | Action |
|---|---|
| `audit` | Default for "check", "detect", or an authorship question: inspect and report; do not rewrite the document. |
| `edit` | For a revision request: report the important defects and deliver the full minimally revised text. |
| `result-only` | For "only give me the revised text": perform the same checks, then return only the requested text; retain the checks outside its body. |

Work in the conversation unless the user has authorized file changes.
Preserve the original input for comparison. Assign stable locations:
filename plus line or paragraph, or paragraph/sentence numbers for pasted
text. State how paragraphs are counted when the layout makes this ambiguous.

Keep a working requirements ledger covering accepted user outcomes and the
skill requirements (R1–R8, listed under Requirements below):
`ID | level | requirement | verification | status | evidence or reason`.
At close-out each item is `done`, `blocked`, or `n/a`; the last requires a
scope-based reason and cannot waive a required user outcome. No separate
file is needed unless the task calls for one.

Select the writing convention from the task once: `academic` for research
manuscripts and academic reviews; `explain` for popular science, teaching,
spoken explanations and scripts; `general` for other or unspecified prose.
Genre is independent of language and output mode. A mixed document may need
separate already-defined sections; preserve their locations and coverage.
Keep execution instructions, review records and reader-facing prose in
separate fields or files. Only the requested prose belongs in its body.

### 2. Read the entire available text before evaluating signals

Read for the argument, factual content, referents, sequence, register, and
author's voice. Identify what each paragraph adds. Mark quotations,
citations, code, identifiers, legal provisions, and technical definitions
whose exact form or distinction matters. A semantic read includes these
regions even when the optional scanner skips them.

For a long input, divide the supplied scope into a finite list of chunks
and read them in order. Carry a short argument map across chunks to catch
repeated claims and broken references. Record every inspected range. If
the available input is truncated or the reading budget ends, report the
precise coverage and pending ranges; do not call an excerpt review a
full-document audit or silently shorten the requested deliverable.

Default budget: one complete semantic pass, at most one revision pass, and
one validation pass over affected passages and their context. The finite
chunk list belongs to the first pass, not a license for repeated rereading.
Resolve a different budget from the task before using it.

### 3. Find candidates, then judge them in context

Inspect word choice, sentence logic, transitions, emphasis, repetition, and
document structure. Read the [signal guide](references/signal-guide.md)
when a candidate needs a decision rule or a false-positive check. Its
families are prompts for reading, not an exhaustive prohibited-word list.

After the semantic read, use the [local scanner](references/scanner.md) when
a local Python runtime and a suitable text artifact are available. It loads
the fixed `scripts/rules.json`; supply the selected `--genre`. Do not
regenerate a prohibited-word list, retrieve past conversations or reconstruct
an SOP for each draft. Use the returned locations and nearby context as the
revision queue, merging overlapping hits; preserve the one-pass budget.
If the runtime or artifact is unavailable, inspect the existing rules once
and apply them in a bounded manual pass, recording that fallback. Do not
install a runtime or upload prose just to enable this check. Manual review
remains supported. Tier and count control surfaced candidates, not editorial
severity or authorship confidence. An empty list proves no prose quality.

Genre-specific `policy_action` values prioritize the queue. `academic`
marks rhetorical negation/contrast and consecutive negative framing for
`revise`: state the supported object, method or result directly, for example
"本研究记录降雨概率。" `explain` and `general` use `context`: a useful
misconception correction can stay, for example "记录的不是降雨量，而是降雨概率。"
Preserve a real method comparison or necessary exclusion as an explicit
factual relation. Internal reminders such as "不冒充全局" or "真实口径"
always require context: replace reader-facing self-instruction with available
coverage, evidence or action details, or remove empty framing. If the process
itself is the requested subject, the wording may be relevant. Never invent
specificity or mechanically delete quotations, rule examples or limitations.

For each consequential candidate:

1. Quote the exact original span and name its location; inspect surrounding
   sentences and the paragraph's role.
2. Decide `revise`, `keep`, or `unresolved`. Name the actual defect, such as
   a missing actor, duplicated claim, unsupported emphasis, or a transition
   that asserts a relationship the text does not establish. A phrase being
   on a list is not a reason to revise it.
3. For `revise`, explain the reader impact and give the smallest remedy.
   For `keep`, record the relevant function when dismissal is consequential,
   such as a necessary domain term or meaningful contrast. For `unresolved`,
   identify the missing evidence or intent without guessing it.
4. Merge overlapping hits with the same underlying defect. Group a repeated
   defect with its locations rather than counting keywords as separate faults.

Use impact levels: `high` changes a claim, responsibility, certainty, or
decision; `medium` obscures the argument or imposes substantial repetition;
`low` is a local distraction or needless word. Multiple patterns in one
sentence do not automatically raise its level. A semantic loop or false
range needs a meaning-based explanation; a regular expression cannot prove it.

### 4. Revise only when requested

Keep the original meaning, evidence, numbers, units, dates, comparisons,
citations, actual uncertainty, and useful author voice. Preserve necessary
AI terminology, real API or legal contracts, scientific qualifiers,
meaningful negation, justified passive voice, and functional three-part
lists. Do not replace them wholesale with casual language.

Prefer deleting redundant framing, naming an already-known actor, or
stating the supported relationship directly. If concrete detail is absent,
flag the gap or retain an accurate general statement; invent no metric,
causal mechanism, event, quotation, or personal anecdote. Do not turn
"may" into certainty or remove a limitation because it sounds formulaic.
Do not alter quoted source text without explicit permission; place an
editorial note outside the quote instead.

Revise a rhetorical pattern at the level of its meaning. Swapping synonyms
or changing an em dash to a comma does not fix empty contrast. Vary sentence
or paragraph length only when it improves reading, never to satisfy an
alleged human-writing distribution. Colloquial language, typos, emotion,
dates, and place names establish neither truth nor human authorship.

Return the complete revised text in the accepted scope, keeping unchanged
sections. A list of suggested replacements is not a full-text revision.
If the output cannot fit, provide it in an authorized file or agreed parts;
otherwise state that the required full-text delivery is blocked.

### 5. Validate and close out

Compare the revision with the original for changed claims, lost limitations,
numbers, attribution, quotations, and broken references. Check the affected
passages in paragraph context and check that the full requested scope is
present. In audit mode, validate the quoted spans, locations, reasons, and
remedies instead. Re-running a scanner is optional and never substitutes
for this check; zero matches is not an acceptance target.

Give an editorial assessment such as "no consequential wording defect
found in the inspected scope", "localized revision useful", or "repeated
wording problems obstruct the argument", supported by the actual findings.
Avoid "highly likely AI", "human score", or equivalent labels. Record the
stopping condition, coverage, unresolved items, and ledger evidence.

When reviewing a skill or rule document itself, use `general` for its
instructions and assess grammar, clarity, and consistency of execution rules
separately. Preserve deliberately flawed examples, source quotations,
functional prohibitions, and technical terms. Scanner output cannot establish
grammatical correctness. After a repair, use an independent case to check
whether the instructions produce the intended behavior, then stop within the
declared scope and pass budget. This check applies only to instruction
maintenance.

## Requirements

R1–R8 identify eight acceptance requirements, not an execution order.
The level markers mean:

| Marker | Meaning |
|---|---|
| `[B]` — Blocking | Each applicable item must be verified as complete before the review can be declared complete. |
| `[A]` — Advisory | Apply when useful for the task; record relevant gaps without treating them as blockers. |

An explicit user requirement remains mandatory regardless of this marker.

- [B] R1 Mode, purpose, scope, and actual reading coverage match the request. Verification: compare the accepted constraints and inspected ranges with the delivered review or full revision; disclose missing or truncated text.
- [B] R2 Findings follow a semantic read and have exact source spans, locations, contextual reasons, impact levels, and minimal remedies; overlapping defects are merged. Verification: revisit each reported passage and its surrounding context; distinguish scanner candidates from editorial findings.
- [B] R3 Facts, quotations, citations, technical meanings, genuine uncertainty, and useful author voice are preserved; missing evidence is not invented. Verification: compare affected passages with the original and inspect every changed claim or protected span.
- [B] R4 Conclusions concern wording quality, without authorship probabilities, universal sentence-length rules, or detector-evasion tactics. Verification: inspect the assessment, rationale, and revision for these unsupported inferences.
- [B] R5 The requested mode's deliverable is complete: audit findings or the full revised text, with accurate limitations. Verification: read back the output, check all requested sections, and confirm that result-only prose contains no review apparatus.
- [B] R6 The declared pass budget is respected, and every accepted outcome and requirement has a final ledger status with evidence or a reason. Verification: reconcile completed and pending scope; unmet required work remains blocked at a budget stop.
- [B] R7 The fixed rules and selected genre guide the check; any scanner use stays local and read-only, with its configuration, exclusions, and candidate-only limits understood. Verification: inspect the actual rule version, genre, output and input/configuration; when no suitable runtime or artifact is available, record the bounded manual fallback. Do not build a new SOP or keyword list for each draft.
- [A] R8 Consequential dismissed candidates and successful phrasing are retained where they help explain a decision. Verification: record a concise keep reason in the review or working record; do not add filler praise or a log of every harmless match.

## When to stop

Stop when the selected artifact is delivered, the affected context has
been checked, and all applicable blocking requirements have evidence of
completion. Retained legitimate phrases need not be removed.

After one semantic pass, at most one revision pass, and one affected-context
validation pass, stop further polishing. If a required check still fails,
report the usable result, unfinished items, and smallest missing input,
capacity, or decision. Keep those requirements `blocked`; budget exhaustion
does not make the work complete. Empty or unreadable input yields a missing
input report, never a clean bill of prose quality.

## Output contract

- `audit`: scope and coverage, a supported editorial assessment, and findings
  with `location | exact quote | defect and reader impact | level | minimal remedy`.
  Include consequential keep/unresolved decisions and a concise ledger and
  stop condition. Do not manufacture findings to fill a report.
- `edit`: the same review plus the full minimally revised text, with review
  notes outside the reader-facing text. Distinguish changed wording from
  unresolved source or factual questions.
- `result-only`: the full revised text in the requested format. Keep the
  ledger and checks in the working record, not in the text; create no extra
  sidecar without authorization. If missing input or capacity prevents full
  delivery, give the necessary coverage/blocker notice outside the text
  rather than presenting a partial result as complete.

For a bounded practice run, use the bilingual
[fictional review cases](examples/review-cases.md).
