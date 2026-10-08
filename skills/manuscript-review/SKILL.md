---
name: manuscript-review
description: >
  Audit a supplied manuscript against its claims, evidence, argument, figures and stated submission requirements. Use for 审稿、投稿前检查、manuscript audit or is this paper ready. Produces source-located findings and evidence-bounded readiness; not a language-only review or invented journal score.
license: MIT
category: analyze
domain: [paper, review-qa]
action: [review, analyze, advise]
uses: [prose-audit]
artifacts:
  - "Coverage-aware manuscript review with located findings and remedies"
  - "Claim-to-evidence and submission-requirement checks"
  - "Readiness judgment and requirements ledger"
---

# manuscript-review

[中文主稿](SKILL.zh.md). The Chinese guide is the authored source and this
entry is its synchronized English translation. Both carry the same workflow,
boundaries, requirements and budgets; the discovery filename grants no language
semantic priority. Sources and changes: [PROVENANCE.md](PROVENANCE.md).

## When to use

Use for a manuscript or substantial draft requiring argument/evidence scrutiny,
with optional submission checks when a venue is supplied. Use `prose-audit` for
language alone, `taskbook-interpret` for understanding a published paper,
`research-story` for arranging a narrative and `run-review` for experiment artifact
integrity. A manuscript review may use run evidence but does not certify unseen
runs or infer authors' compliance from polished text.

## Method

1. Define review coverage and the decision. List supplied manuscript parts,
   figures/tables, appendices, bibliography and requested venue requirements;
   record unavailable parts. Distinguish complete-manuscript review from excerpt
   review. Ask only for material necessary to the accepted decision; otherwise
   review the available scope and keep full-readiness claims blocked.
2. Map each consequential claim to the evidence it needs and the material
   actually provided. Choose the standard by claim type: proof assumptions and
   steps; measurement and sampling; causal identification; fair performance
   comparisons; reproducibility; qualitative material and competing readings.
   Check uncertainty, conditions and the relevant alternative explanation.
   Do not force ablations onto a theory or interpretive paper. A claim in the
   abstract must retain the same strength and domain as its supporting body.
3. Reconstruct the argument across sections. Does the question in the opening
   match the methods and ending? Are constructs stable, the comparison justified
   and the claimed increment distinct from background? Inspect whether sections
   and figures supply the premises their conclusions use, whether failure and
   negative evidence is retained, and whether the discussion extends beyond the
   sample or protocol. Missing evidence is not a fabricated flaw: identify the
   exact unsupported inference and the source/check that could resolve it.
4. Check source and figure integrity within actual access. Verify material
   citations support the nearby proposition, and references actually identify
   the cited work. A novelty check needs the closest relevant work and authorized
   retrieval when not supplied; absent search cannot certify novelty. Inspect
   actual figure/table labels, units, denominators, scales and captions against
   text and underlying data when available. A local metric or image export
   check does not verify an entire experiment; use `run-review` for that request.
5. Apply stated submission requirements separately from scientific judgment.
   Inspect only the accepted current venue/template rules and explicit author
   requirements, with their source/version. Do not invent universal limits,
   typographic bans, mandatory section counts or journal scoring. A missing
   venue permits content review; it blocks only venue-specific readiness.
   For language defects use `prose-audit` within the same coverage/budget and
   merge duplicate findings rather than producing a second full review.
6. Deliver actionable located findings. Each finding has a stable ID, exact
   manuscript location/quotation, defect, evidence basis, consequence, remedy
   and status. Classify as blocking for the accepted decision, substantive
   revision or minor clarification based on consequence, not a points formula.
   Give the most consequential fixes first. If revision is requested, preserve
   supported claims and show changes; never invent methods/results to close a
   finding. Recheck changed claims and the premises they affect once.

Maintain one requirements ledger for the accepted task and R1–R6. Record
`done`, `blocked` or `n/a` with checked evidence or a scope reason. Plans and
recommendations do not establish that downstream actions occurred.

## Requirements

- [B] R1 Actual review coverage is explicit — reconcile requested material with
  inspected sections, figures, supplements and missing parts.
- [B] R2 Consequential claims have appropriate checked support — follow the
  claim/evidence map and preserve uncertainty and domain limits.
- [B] R3 Findings are located and evidence-bounded — verify quotes/locations,
  consequences and concrete remedies against supplied material.
- [B] R4 Scientific and submission checks remain separate — inspect current
  stated rules; keep unverified novelty, compliance and runs unresolved.
- [B] R5 Readiness matches open findings — no ready judgment while an applicable
  blocking requirement or required coverage remains missing.
- [A] R6 Requested repairs are verified once — compare modified claims and
  affected premises; for audit-only explain why revision is outside scope.

## When to stop

Use one complete pass over accepted coverage and at most one focused
repair/recheck when revision is authorized. For decisive missing public
requirements or literature, use one bounded acquisition batch when permitted.
Deliver when the review and applicable blocking checks are evidenced; a review
can be complete while the manuscript is not ready. At the cap, name reviewed
parts, remaining findings and minimum evidence/material needed. Do not relax
scientific requirements merely to produce a ready verdict.

## Output contract

Deliver a review with coverage, prioritized located findings, a compact
claim/evidence and submission checklist, readiness bounded to that coverage and
the requirements ledger. Deliver revised text only when requested. Original
source, runs and bibliography remain protected; proposed fixes are not observed
results. An excerpt-only review cannot certify a full submission.
