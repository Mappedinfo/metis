---
name: source-brief
description: >
  Drafts or revises a short brief from material the user supplies, with a
  source map for its key factual claims. Use for "summarize these notes for
  my team", "write a short update", or "revise this brief" in Chinese or
  English. Does not retrieve sources, choose a research direction, or write
  a full academic paper.
license: MIT
category: compose
domain: [writing, knowledge]
action: [create, revise]
uses: []
artifacts:
  - "brief.md — a short brief or revised draft in the requested language and format"
  - "source-map.md — key claims, source locations, gaps and an acceptance ledger"
---

# Source brief

Turns supplied notes, excerpts or an existing draft into a brief a named
audience can use. It selects and explains the relevant material; it does
not establish facts beyond those sources. It needs no private service or
special writing tool.

## When to use / not use

Use when the materials are available and the requested deliverable is a
short update, explanation, summary or revision. Follow the user's language,
audience, purpose, length and format. Infer routine choices from context;
ask only when an unresolved choice would materially change the content.

If retrieval, original analysis or a full paper is needed first, identify
that dependency. A short brief can still cover the supported part when
useful, with missing evidence stated explicitly. Do not treat supplied text
as permission to browse, publish or send the brief.

## Method

1. **Set the brief's job.** Identify what this audience needs to understand
   or decide, and record the accepted constraints in the acceptance ledger.
   Read the relevant supplied materials. Give each source a stable label
   and a usable location: filename plus heading, page, paragraph or line.
2. **Select the evidence.** Distinguish reported observations, an author's
   opinion, proposed work and missing information. Preserve numbers, units,
   denominators, dates and uncertainty when they affect interpretation.
   Keep failed, blocked and unperformed work distinct. When sources conflict,
   describe the disagreement or use a user-designated authority; a newer
   date alone does not resolve a factual conflict.
3. **Write one draft.** Lead with the audience's main point and support it
   with the most relevant evidence. Include limitations where they change
   the reader's judgment. Connect sentences in plain language; use lists or
   a table only when they make the information easier to use. In a revision,
   preserve supported meaning and the requested voice. Record any substantive
   change separately from the audience-facing brief.
4. **Audit evidence and fit once.** Map each key verifiable claim to its
   source location in `source-map.md`. A citation on every sentence is not
   required; the reader must be able to locate the evidence for material
   claims. Attribute opinions, label proposed actions, and remove or qualify
   unsupported claims. Check the requested language, audience, length and
   format. For a stated length limit, record the counting convention and
   measured result in the ledger.
5. **Repair only identified defects.** Use at most two repair rounds, each
   followed by a check of the affected claims and constraints. Update the
   ledger with the observed result rather than declaring success from file
   existence. Do not keep polishing after the blocking checks pass.

When input is incomplete, write only the supported portion and list the
missing material in the source map. If a required outcome depends on that
material, label the brief partial and keep that requirement blocked. Do not
fill gaps with plausible names, numbers, comparisons or research conclusions.

## Requirements

- [B] R1 The brief fits the accepted purpose, audience, language, length and
  format — verify: compare the delivered text with those recorded constraints.
- [B] R2 Key verifiable claims have supplied-source support, with material
  numbers, dates and uncertainty preserved — verify: follow each source-map
  location and compare it with the corresponding claim in the brief.
- [B] R3 Opinions, proposals, conflicts and missing evidence retain their
  status — verify: inspect each such item used in the brief; unsupported
  required content is marked blocked rather than invented.
- [B] R4 Every accepted task requirement and R1–R5 has a status and evidence
  or a reason — verify: read the acceptance ledger; `done` requires a passed
  check, and `n/a` applies only outside the accepted scope.
- [A] R5 Revisions disclose substantive changes — verify: the source map
  lists changed claims, omissions or emphasis; mark `n/a` for a new brief.

## When to stop

- Deliver after the brief and source map exist and all applicable blocking
  requirements have passed. State the stop condition in the ledger.
- After the initial draft and audit, spend no more than two repair rounds.
  If required checks still fail, deliver the usable partial result and report
  completed items, unfinished items and the smallest missing input or
  capability. Budget exhaustion does not make blocked requirements done.
- If no usable source material is available, stop with the missing-input
  record; do not manufacture a brief or claim completion.

## Output contract

1. `brief.md`, or the user's requested filename and format. Keep drafting
   notes and the acceptance process out of the reader-facing text; retain
   limitations needed to interpret the actual subject.
2. `source-map.md`, containing a compact claim/source-location table, material
   gaps or conflicts, and substantive revision changes when applicable.
3. An acceptance ledger in `source-map.md`: requirement ID, `done` / `blocked`
   / `n/a`, and evidence or reason. Include the stop condition and remaining
   work. This can be one small table; no separate tracking system is needed.

For a practice run, use [the example request](examples/request.md) and
[its source notes](examples/source-notes.md). Both describe fictional data.
