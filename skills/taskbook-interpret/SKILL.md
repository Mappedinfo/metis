---
name: taskbook-interpret
description: >
  Analyze one paper or answer a scoped question about a supplied passage,
  figure or table: contribution type, question, method, evidence and limitations.
  Use for "interpret this paper", "explain Figure 2", "comment on this passage",
  解读论文、局部提问 or 批注. Full reading produces structured notes; a local
  question produces a focused answer with actual coverage. Not for retrieval
  alone, multi-paper synthesis, manuscript drafting or formal experiment execution.
license: MIT
category: analyze
domain: [paper, literature]
action: [analyze, record]
uses: [scansci-pdf]
artifacts:
  - "Full-reading notes in eight sections, including contribution type and evidence locations"
  - "Scoped answer or annotation with exact passage/page/figure locations and actual coverage"
---

[中文译本](SKILL.zh.md)

# Interpret a paper

Choose `full`, `question` or `annotation` from the accepted request. Preserve
its scope and requested output language. A local question does not require an
eight-section report; supplying one page does not establish full-text reading.

## When to use

Use for a single paper's close reading, contribution/method explanation,
figure/table question or passage annotation. `full` reads the complete supplied
paper; `question` answers the named issue; `annotation` attaches focused notes
to identifiable locations. Default to full notes for an unqualified request to
closely read the paper, and to a focused answer for a named question.

Do not use for acquisition alone, multi-paper synthesis, manuscript prose or
formal reproduction. Hand a requested subsequent stage to its matching
capability rather than treating its output as completed here.

## Method

1. Resolve mode, input and reader's question. Confirm the exact version and
   available pages; distinguish the paper's statements, supporting observations
   and the reader's interpretation. Preserve material limitations and unknowns.
2. Check the actual PDF reader and page renderer. OCR is conditional on a
   missing/defective text layer and an available tool; verify numbers, equations
   and labels against original pages. `scansci-pdf` acquires papers, and its
   download-time Markdown does not establish local-PDF reading, OCR or figure
   extraction. Use it only if retrieval is needed. Record unreadable pages.
3. Read the accepted scope. `full` covers all sections, figures, tables,
   appendices and references. For a local question, inspect its passage/figure,
   caption, definitions and the methods/results context needed to answer it;
   read an additional section only to resolve a named dependency. If it is
   unavailable, qualify the answer or keep the affected claim blocked. Record
   actual page/section coverage, not an inferred "full text read" label.
4. Select contribution type from evidence: method, empirical finding, theory,
   dataset/benchmark, review or system; multiple types may coexist. Describe
   the local problem, proposed change, evidence supporting it and the claim's
   limits. These are analytical lenses, not a required novelty ranking. Do not
   force an experimental comparison template onto theory or review papers, or
   declare novelty against literature that was not examined.
5. Produce the matching output below. Every material claim has an evidence
   location. For annotations, retain the original passage and pair its exact
   quote/location with explanation, question or suggested interpretation.
   Use native comments only when available and authorized; otherwise provide
   a location-indexed note. A note file does not prove the PDF was annotated.
6. Check claims against the inspected pages once; repair only identified
   defects within the budget. Keep a ledger for accepted outcomes and R1–R4:
   `ID | requirement | done/blocked/n/a | evidence or reason`. A scope-based
   `n/a` cannot waive a requested result. Record coverage and remaining inputs.

### Full notes

Use `精读笔记.md` or the requested format and filename:

1. One-sentence summary: what the paper did and concluded.
2. Research question and motivation, including supported contribution type.
3. Core claims with section/page/figure/table evidence locations.
4. Methods, data, sources and the assumptions required for the stated result.
5. Limitations and questions, separating author-stated limits from reader doubts.
6. Evidence level and precise reading coverage. Abstract/metadata-only notes
   are partial for a full-reading request, not a completed substitute.
7. Transferable insights, with their conditions of applicability.
8. References in three groups: main citations with their argumentative role;
   important cited field works with reasons; and AI additions not cited by the
   paper, each labeled “AI 建议，待核实”. Use the original reference list as
   authority. Omit unconfirmed works or provide search queries instead.

### Local answer or annotations

Answer the question first, then explain the necessary terms, evidence and
limits using the inspected context. Supply locations and unresolved dependencies.
For an annotation request, use `location | exact passage | note/question` or
an authorized editor's comment objects. Only relevant contribution analysis is
needed; do not append the full-notes structure or an invented literature review.

For a fictional forward exercise, use [scoped-reading cases](examples/scoped-reading.md).

## Requirements

- [B] R1 Reading coverage matches the mode and request — Verification: full
  mode accounts for every section, figure/table, appendix and reference list;
  local mode records the requested object and necessary context. Missing
  required material stays blocked, even when useful partial notes exist.
- [B] R2 The requested output and material claims are supported — Verification:
  full notes contain the eight sections; a local answer/annotation addresses
  the named issue without forced full reporting. Check each claim's original
  location, contribution type where applicable, assumptions and limitations.
- [B] R3 Sources and interpretation remain distinct — Verification: claims
  absent from inspected material are unavailable, not invented. In full notes,
  references stay in the three groups and every AI addition is labeled.
- [B] R4 The ledger and checks describe actual work — Verification: reconcile
  scope, delivered output, coverage, evidence and every applicable requirement;
  a location-indexed note is not a claim of editing the source PDF.

## When to stop

Use one scoped reading/analysis pass, at most one targeted repair round and
one final affected-context check. Deliver when all applicable blocking items
have evidence. At missing input/tool/context or budget exhaustion, deliver a
useful partial answer with completed/blocked items, actual coverage, stop
condition and the smallest unblock condition. Do not claim full acceptance
or reopen passed checks; continue independent work within the accepted scope.

## Output contract

Deliver the requested notes, focused answer or annotations in the requested
language. Preserve the source; do not alter a PDF or write outside the
requested/authorized location merely to store comments. Include a compact
ledger and coverage in existing notes or the delivery summary. Keep analysis
separate from manuscript drafting and formal experiment execution.

Taskbook family: this skill is the independently triggerable version of the
`interpret` preset in [research-taskbook](https://github.com/mappedinfo/metis),
originating in the skill maintainers' own MIT-licensed project
[GIStudio/research-taskbook](https://github.com/GIStudio/research-taskbook).
