---
name: scansci-pdf
description: >
  Orchestrates the scansci-pdf MCP server (17 tools) for academic paper
  acquisition: literature search, DOI/arXiv validation, citation export
  (BibTeX/RIS/EndNote), single and batch PDF download, and access diagnostics
  through open-access, publisher, or authorized institutional routes. Use when
  the user wants to download papers, search literature, export citations, or
  process a DOI/arXiv list. Do not use for conceptual discussion of papers
  without retrieval intent, or for non-academic PDFs.
category: acquire
domain: [literature]
action: [retrieve, orchestrate]
uses: []
artifacts:
  - "Paper search, retrieval or access diagnostic report with sources and item outcomes"
  - "Downloaded PDFs or exported BibTeX, RIS or EndNote records when requested"
source: https://github.com/Rimagination/scansci-pdf
source_license: Apache-2.0
---

# ScanSci PDF

Use the bundled `scansci-pdf` MCP server for paper discovery, metadata,
citations, download queues, access diagnostics, and result reporting.
The full workflow reference (17-tool routing, WebVPN, Elsevier API fast path,
Tor fallback) is [references/full-workflow.md](references/full-workflow.md);
read it when the task needs detailed tool routing or configuration guidance.

## Route by intent

- Search or identify papers: `scansci_pdf_search`, `scansci_pdf_verify_identifiers`,
  and `scansci_pdf_parse_list` for list files.
- Resolve open-access locations: `scansci_pdf_prepare_queue(action="resolve_oa")`.
- Download one paper: `scansci_pdf_download` with an explicit strategy when the
  user has a source preference.
- Process a list: `scansci_pdf_parse_list` or `scansci_pdf_batch_download`.
- Export citations: `scansci_pdf_citation`; push to Zotero via `scansci_pdf_zotero_push`.
- Diagnose setup or access: `scansci_pdf_diagnostics` (check=health|network|sources|setup).

## Operating boundaries

- Preserve the user's requested source strategy and report the actual source in
  every download result.
- Prefer open-access, publisher API, and institution-authorized routes when no
  source preference is given.
- Ask before opening an interactive login, importing cookies, or changing access
  configuration.
- Treat API keys, cookies, proxy credentials, and institution details as secrets;
  never repeat them in the response.
- Gray-source and anti-bot routes require the user's explicit choice and must be
  used only where the user has the right to do so and applicable rules permit it.

## When to use

Use when the task is retrieving scientific PDFs, validating DOI/arXiv
identifiers, searching literature by known criteria, or exporting citation
records. Do not use for topic discovery without retrieval intent, reading or
summarizing PDF content, or non-academic documents — those need other routes.

## Requirements

- [B] R1 Search or validate identifiers before downloading — 验证: the
  report lists the sources used and per-item outcomes.
- [B] R2 Deliver PDFs and citation records through the declared routes
  only — 验证: artifact files or exports exist at the reported paths.
- [A] R3 Diagnose inaccessible items instead of retrying blindly — 验证:
  the diagnostic report names the smallest unblock condition per item.

## When to stop

- The item queue is drained, or every remaining item has a written access
  diagnostic (paywalled, missing identifier, route failure).
- A named budget (items, retries, rounds) is exhausted: report completed
  items, unfinished items and the smallest unblock condition; never loop a
  failing route or mark unresolved required downloads complete.
- Stop once the declared artifacts exist; judging their scientific quality
  is the caller's review, not this skill's loop.

## Metis output contract

Return the artifact requested by the user: a sourced search result list,
verified identifier list, citation export, downloaded PDFs, or an access
diagnostic report. State what was retrieved or verified, include the actual
source and local file paths when applicable, and distinguish failed or
unavailable items from successful downloads. An access report is an output;
it does not count as a downloaded PDF.

Include a compact ledger for the accepted task requirements and R1–R3:
record `done`, `blocked` or `n/a` plus verification evidence or a reason for
each item. Use one row per item:
`ID | B/A | requirement | verification | status | evidence or reason`.
`n/a` is for a requirement outside the requested retrieval mode,
not a waiver of a required user outcome. Declare completion only when every
applicable blocking requirement is done with evidence; keep inaccessible
required items blocked even when their diagnostics are complete.

## Provenance

Vendored from [Rimagination/scansci-pdf](https://github.com/Rimagination/scansci-pdf)
(Apache-2.0, see LICENSE in this directory). Modifications: frontmatter extended
with metis taxonomy and contract fields (`category: acquire`, `domain`,
`action`, `uses`, `artifacts`, `source`, `source_license`); the full workflow
reference moved from the upstream `skill/SKILL.md` to
`references/full-workflow.md`; added a "do not use"
boundary to the description; added the Metis output contract above;
added the When to use / Requirements / When to stop sections required by
skill-contract.json v2, explicit unfinished-item reporting on budget
exhaustion, and a status-and-evidence ledger in the Metis output contract
(2026-09-28). The vendored workflow instructions and
full workflow reference are unchanged.
