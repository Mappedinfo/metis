[中文译本](full-workflow.zh.md)

# scansci-pdf — Academic paper download MCP service

## Scope

Use this skill whenever the user wants to download academic papers, search for
research literature, get citations (BibTeX/RIS/EndNote), manage a WebVPN
institutional proxy for paper access, import .bib files, or batch-download
papers. This skill orchestrates the scansci-pdf MCP server, which exposes 17
high-level tools covering download (OA/grey/institutional channels), discovery,
queue preparation, diagnostics, and login.

Trigger when the user mentions downloading papers, DOI, arXiv ID, Sci-Hub,
paper search, literature review, citation export, WebVPN, institutional access,
"帮我下载论文", "搜索文献", "批量下载", "论文下载", "文献检索", or provides a list
of DOIs/arXiv IDs. Skip when the user is only discussing papers conceptually
without intent to download/search/cite, or asks about non-academic PDFs
(invoices, reports, etc.).

## Overview

scansci-pdf is an MCP server with **17 high-level tools** covering academic
paper search, download (open-access / grey sources / institutional channels),
discovery and queue preparation, citation export, and diagnostics. Its download
engine supports parallel racing across 13+ sources and WebVPN access for 100+
Chinese universities.

## MCP tool reference (17 tools)

### Downloads

| Tool | Function | Key parameters |
|------|------|----------|
| `scansci_pdf_download` | Download one paper (OA/grey/institutional cascade) | `identifier` (required), `strategy` (overrides the global strategy), `markdown`/`bibtex`/`download_si` (optional) |
| `scansci_pdf_batch_download` | Batch download | `identifiers` (required), `scihub_enabled`, `batch_id` (resume a batch), `resume` (default true) |
| `scansci_pdf_cache_clear` | Clear the download cache | `identifier` (optional; omit to clear all) |

**identifier formats**: DOI (`10.1038/nature12373`), DOI URL, or arXiv ID (`2301.00001`).

**Download strategies (`download_strategy`, set globally or overridden by `strategy=` for one call)**:

| Strategy | Meaning |
|------|------|
| `fastest` (default) | Race all sources in parallel (including grey sources if `scihub_enabled=true`) |
| `oa_first` | Prefer OA sources, then fall back to grey sources on failure |
| `scihub_first` | Prefer grey sources, then fall back to legal sources on failure |
| `scihub_only` | Sci-Hub only |
| `legal_only` | Legal sources only (Unpaywall/publishers/OpenAIRE, etc.); no Sci-Hub/LibGen |

**Scheduling cannot expand source authorization**: when the user explicitly sets
`scihub_enabled=false` or `legal_only`, no batch/lane scheduler may re-enable grey
sources. They are enabled only with explicit `--scihub`/`scihub_enabled=true` or
when the global strategy permits them.

### Discovery and queue preparation

| Tool | Function | Key parameters |
|------|------|----------|
| `scansci_pdf_find` | ScanSci Find engine: systematic review search protocol with `action=plan\|estimate\|smoke\|calibrate` | `action`, `query`, `domain`, `depth`, `sample_size` |
| `scansci_pdf_expand_citations` | Citation tracing (Semantic Scholar/OpenCitations) | `query`, `rounds` (≤5), `citation_source` |
| `scansci_pdf_prepare_queue` | Prepare a download queue: `action=verify\|resolve_oa\|build\|full` | `candidates_json`, `query`, `limit` |
| `scansci_pdf_search` | Keyword/author search (OpenAlex) | `query`/`author`/`author_id`, `limit`, `year_from`, `year_to`, `sort` |
| `scansci_pdf_parse_list` | Parse paper-list files (APA/BibTeX/DOI lists/tables) | `file_path` (required) |
| `scansci_pdf_citation` | Export citations | `identifier` (required), `format` (bibtex/ris/endnote/metadata) |
| `scansci_pdf_zotero_push` | Push downloaded papers to Zotero | `identifier` (required; download first) |

**Important**: `verify`/`resolve_oa` are lightweight operations with a 45-second
return budget. Timeouts return a structured error
(`stage`/`timeout_seconds`/`retryable`), rather than waiting 180 seconds without
feedback. `resolve_oa` requires an Unpaywall email configuration
(`scansci_pdf_config(key='email', ...)`); when missing, it immediately returns
`blocked_configuration` instead of failing item by item.

### Configuration, channels, and diagnostics

| Tool | Function | Key parameters |
|------|------|----------|
| `scansci_pdf_config` | Read/set configuration (values are redacted) | `key` (optional), `value` (optional) |
| `scansci_pdf_channel_status` | Institutional channel status: `kind=webvpn\|carsi\|ezproxy\|browser\|webvpn_test` | `kind`, `doi` (testing only) |
| `scansci_pdf_schools` | Search/set a WebVPN university | `action=search\|set`, `query`, `school` |
| `scansci_pdf_diagnostics` | Health/network/source/setup diagnostics | `check=health\|network\|sources\|setup` |
| `scansci_pdf_tor` | Embedded Tor: `action=install\|start\|stop` | `action`, `use_bridges` |

### Login (institutional channels)

| Tool | Function | Key parameters |
|------|------|----------|
| `scansci_pdf_login` | Unified login: `kind=publisher\|webvpn\|carsi\|ezproxy\|custom\|cookie_import` | `kind` (default publisher), `identifier`, `publisher`, `custom_url`, `cookie_file` |
| `scansci_pdf_elsevier_setup` | Elsevier API key setup guide (free; no institutional email required) | `test` (validate the key) |

## Workflow orchestration

### Workflow 1: Vague research query → download

```
1. scansci_pdf_find(action="plan"|"estimate", query="植物功能性状 气候变化")
   or scansci_pdf_search(query="plant functional traits climate change", limit=20, sort="cited_by_count")
2. scansci_pdf_prepare_queue(action="full", candidates_json=<candidates>)
   → Validate DOIs + resolve OA locations (45s budget; structured error on timeout)
3. scansci_pdf_batch_download(identifiers=[...])
```

**Key point**: ask the user to confirm after searching; do not automatically
download all results.

### Workflow 2: Download full text from a paper list

```
1. scansci_pdf_parse_list(file_path="papers.md") → Inspect the parsed results
2. scansci_pdf_batch_download(identifiers=entries) (or an equivalent combination of resolve_and_download operations)
```

### Workflow 3: WebVPN institutional proxy

```
1. scansci_pdf_schools(action="search", query="清华") → Find the university
2. scansci_pdf_schools(action="set", school="清华大学")
3. scansci_pdf_login(kind="webvpn") → CAS authentication in the browser
4. scansci_pdf_channel_status(kind="webvpn_test", doi="10.1038/nature12373") → Verify connectivity
5. scansci_pdf_download(identifier="...") → Automatically use the WebVPN channel
```

### Workflow 4: Log in and download a paywalled paper (publisher SSO)

When a download returns `error_type="paywall"` and `action="login_required"`:

```
1. scansci_pdf_download(identifier="10.1126/science.aec6396")
   → Returns {"error_type": "paywall", "action": "login_required", ...}
2. scansci_pdf_login(identifier="10.1126/science.aec6396")  # kind=publisher is the default
   → Open the paper page in the browser → User clicks "Access through your institution" → Select institution → SSO → Close browser
3. scansci_pdf_download(identifier="10.1126/science.aec6396") → Download successfully using the saved cookies
```

**Key points**:

- Any user with an institutional account can use this; no WebVPN/CARSI preconfiguration is required.
- Cookies persist, so one login per publisher is sufficient.
- The browser engine is **CloakBrowser** (a Playwright-compatible anti-detection browser), which can pass Cloudflare Turnstile. Publishers detect TLS fingerprints, so Python HTTP clients may receive a 403 even with cookies.

### Workflow 5: Elsevier API fast path (1–2 second downloads)

```
1. scansci_pdf_elsevier_setup → Browser registration guidance → Copy the API key
2. scansci_pdf_config(key="elsevier_api_key", value="...")
3. scansci_pdf_elsevier_setup(test=true) → Validate
4. Subsequent DOIs beginning with 10.1016/ automatically download through the API (no insttoken required: a campus network connection + API key suffice)
```

**Meaning of NOT_ENTITLED**: the user is not on the campus network or the
institution does not subscribe to the journal; it does not mean an insttoken
is missing.

### Workflow 6: Embedded Tor (when grey sources are blocked)

```
1. scansci_pdf_tor(action="install")   # Download Tor Expert Bundle on first use
2. scansci_pdf_tor(action="start")     # Use use_bridges=true on restricted networks
3. scansci_pdf_download(identifier="...", strategy="scihub_only")
```

## Capability boundaries

| Request | Handling |
|------|----------|
| Read/understand paper content | Unsupported — downloads PDFs only (`markdown=true` can provide an AI-readable text layer) |
| Translate a paper | Requires other tools |
| Generate a literature review/summary | Requires an LLM to read the PDF and generate it |
| Download a non-academic PDF | Unsupported |
| User provides a title but no DOI | Use `search` to obtain the DOI before downloading |
| Batch of 100+ papers | Use `batch_download`; concurrency is controlled by `batch_workers` |
| Paper requiring institutional access | Use `login`, then retry the download |
| Download failure | Results include `error_type`; `paywall` → login workflow, `rate_limited` → retry later, `cloudflare_blocked` → start CloakBrowser/configure a proxy |

## Common edge cases

- Scientific symbols (copyright ©, accented names) may produce quality warnings
  (`markdown_warnings`) in Markdown exports. The text is readable, but unusual
  characters need manual verification.
- Batch tasks exit within their budget and atomically write `batch_results.json`
  whether they succeed, fail, or time out. Hanging sources are abandoned instead
  of blocking the entire batch.
- If `scan_find` is not installed, `find`/`search`/`expand_citations` provide
  installation guidance. `verify`/`resolve_oa` return structured errors on timeout.

## Environment setup guidance

```
1. scansci_pdf_diagnostics(check="setup") → Environment status
2. Act on readiness: ready / partial / limited
3. Install missing components as suggested (pymupdf4llm for markdown; cloakbrowser for anti-bot login)
```

## Quick installation

```
pip install -U scansci-pdf
pip install -U cloakbrowser    # Anti-bot browser (Chromium engine)
scansci-pdf doctor             # Or MCP: scansci_pdf_diagnostics(check="health")
```

## Provenance

This reference was vendored from `skill/SKILL.md` in
[Rimagination/scansci-pdf](https://github.com/Rimagination/scansci-pdf)
(Apache-2.0; see [LICENSE](../LICENSE)). Modifications on 2026-10-03: retained
the original Chinese body in its companion, moved the original frontmatter
description into Scope above, provided this English reference, and added
language links and modification notices. Workflow meaning, commands and
authorization boundaries are preserved; execution is also subject to the
operating boundaries in [SKILL.md](../SKILL.md).
