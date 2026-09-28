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

## Provenance

Vendored from [Rimagination/scansci-pdf](https://github.com/Rimagination/scansci-pdf)
(Apache-2.0, see LICENSE in this directory). Modifications: frontmatter extended
with metis taxonomy fields (`category: acquire`, `domain`, `action`, `source`,
`source_license`); the full workflow reference moved from the upstream
`skill/SKILL.md` to `references/full-workflow.md`; added a "do not use"
boundary to the description. No workflow content changed.
