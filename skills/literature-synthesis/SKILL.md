---
name: literature-synthesis
description: >
  Synthesize an authorized paper corpus into a comparison matrix and evidence-linked answer across studies. Use for compare these papers, 文献综合、研究现状 or explain agreement and disagreement. Not for one-paper interpretation, paper retrieval alone or a full manuscript draft.
license: MIT
category: analyze
domain: [literature, paper]
action: [analyze, create, review]
uses: []
artifacts:
  - "Corpus and evidence comparison matrix"
  - "Source-linked synthesis answering the accepted questions"
  - "Coverage record and requirements ledger"
---

# literature-synthesis

[中文主稿](SKILL.zh.md). The Chinese guide is the authored source and this
entry is its synchronized English translation. Both carry the same workflow,
boundaries, requirements and budgets; the discovery filename grants no language
semantic priority. Sources and changes: [PROVENANCE.md](PROVENANCE.md).

## When to use

Use when several studies must be compared to answer a defined question. Freeze the supplied corpus without automatically expanding discovery. If the
user also requests a field-wide survey, route the authorized acquisition stage
to public retrieval tools or `scansci-pdf`, retaining search scope and coverage
records, then synthesize the fixed corpus; do not imagine sources. Use
`taskbook-interpret` for unresolved single-paper understanding, `research-question`
for choosing the research question and manuscript composition for a submission
draft. A synthesis report is an analysis artifact, not automatic evidence that
an entire field has been covered.

## Method

1. Freeze the question, corpus boundary and intended conclusion type. Identify
   topic, relevant units/populations, time range, study kinds and exclusions
   only to the extent they affect the answer. Label the corpus as user supplied,
   purposive, search-derived or a specified systematic-review protocol. Do not
   call a convenience sample systematic. For an incomplete field survey,
   propose the specific missing search or source before judging coverage.
2. Normalize study identities and actual evidence access. Keep stable source
   IDs, bibliographic identifiers, versions and inspected sections/figures.
   Separate a paper, preprint and later version so duplicate findings do not
   look independent. Abstract-only evidence supports a narrower comparison than
   checked full text. Reuse sound `taskbook-interpret` outputs; deepen only the
   unresolved questions on which the synthesis depends.
3. Build a comparison matrix before prose. Select axes from the question rather
   than from paper titles: object and setting; construct or outcome; design and
   assumptions; data and unit; comparison; result with units/uncertainty;
   limitations; claim supported; source location. Add relevant axes, not empty
   universal columns. Record missing details as unknown; distinguish absence in
   checked material from an explicit omission in the study.
4. Group by meaningful claim or method family. Explain what each cluster
   establishes, under what conditions, what its evidence cannot distinguish and
   how it differs from another cluster. A chronological bibliography or one
   paragraph per paper is insufficient when the request asks for synthesis.
   Preserve exceptions and negative evidence rather than selecting only papers
   that fit an attractive taxonomy. A study can belong to multiple analytic
   groups without being counted as multiple independent confirmations.
5. Resolve apparent disagreement before pooling conclusions. Compare measured
   constructs, units, populations, interventions, protocols, endpoints and
   uncertainty. Two differently defined metrics are not contradictory results.
   Separate methodological differences from unresolved competing explanations.
   Do not average incomparable scores or invent meta-analytic effects; a formal
   meta-analysis requires its own accepted design and uncertainty model.
6. Write an evidence-linked answer to each accepted question. Every material
   conclusion identifies supporting studies and source locations, the conditions
   of agreement and the strongest relevant counterevidence. Distinguish source
   claims from the analyst's synthesis or proposed research lead. “Not found in
   this corpus” is not “no work exists”; future-work sentences alone do not
   establish a valuable, unoccupied field gap.
7. Check coverage and calibration once. Trace conclusions back to the matrix;
   inspect whether source depth supports them, duplicates inflate evidence or
   excluded evidence could change the answer. For survey requests, compare
   actual search/inclusion evidence with the declared scope. Make one bounded
   supplemental batch for named gaps when acquisition is authorized; update the
   same matrix instead of restarting the investigation.

Maintain one requirements ledger for the accepted task and R1–R6 below. Record
`done`, `blocked` or `n/a` with an inspected artifact/location or a scope reason;
`n/a` cannot waive a requested outcome. A plan does not prove execution.

## Requirements

- [B] R1 Scope and corpus status are explicit — compare inclusion and coverage
  records with the accepted question and claimed review type.
- [B] R2 Studies and access levels are traceable — inspect IDs, versions,
  deduplication and checked source locations.
- [B] R3 The matrix supports meaningful comparison — verify axes, definitions,
  units and unknowns against source material.
- [B] R4 Cross-study conclusions retain disagreement and boundaries — follow
  each consequential conclusion to supporting and contrary evidence.
- [B] R5 No invented pooling or field-gap claim — check comparability before
  aggregating and restrict absence claims to observed corpus/search coverage.
- [A] R6 The organization reveals a useful relationship — inspect whether the
  synthesis answers the question better than separate paper summaries.

## When to stop

Use one full comparison/evidence review, at most one authorized supplemental
source batch and one focused repair with an affected-claim recheck. Deliver when
the accepted corpus/question is covered and applicable blocking requirements
pass. At the cap, report completed comparisons, missing studies or source
passages, and the minimum unblock condition. A limited corpus may yield a
complete corpus comparison while a requested field-wide claim stays blocked.

## Output contract

Deliver the corpus/evidence matrix, the synthesis with source-linked conclusions,
the actual search/access/coverage record where applicable and the requirements
ledger. Follow the requested language, destination and length. Keep acquisition
receipts separate from reader-facing prose. Name unresolved contradictions and
sources without filling them from memory.
