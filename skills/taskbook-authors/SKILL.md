---
name: taskbook-authors
description: >
  Build author profiles from one paper PDF: all authors and corresponding-author
  labels, current affiliations, research interests, representative works with
  verifiable sources, team context, and BibTeX for the works. Use when a user
  provides a paper PDF and asks to look up its authors, identify them, organize
  author information, or find out what the team does. Requires web search;
  without network access, fall back to information within the paper only.
  Not for interpreting the paper (use taskbook-interpret) or making slides.
license: MIT
category: acquire
domain: [literature, research-design]
action: [retrieve, record]
uses: [scansci-pdf]
artifacts:
  - "学者档案.md — Author affiliations, interests, representative works and team context, each with a verifiable source"
  - "works.bib — BibTeX entries for representative works and the supplied paper; leave missing fields empty"
---

[中文译本](SKILL.zh.md)

# Explore an Author Team (taskbook family)

Organize information about the authors of the attached paper or the paper at
the specified path. Produce `学者档案.md` and `works.bib`.

Check the available local PDF reader and page renderer first. Use OCR only
when the text layer is absent or defective and an OCR tool is available;
verify numbers, equations and figure/table labels against the original pages.
Record unreadable pages and actual reading coverage. `scansci-pdf` retrieves
papers by identifiers; its optional download-time Markdown is not a local-PDF
reader, OCR service or guarantee of figure extraction. Use it only when
retrieval is needed. Missing reading tools leave affected requirements blocked.

## When to use

- The user provides a paper PDF and asks to look up its authors, identify
  them, organize author information, or find out what the team does.

Do not use for interpreting the paper (use `taskbook-interpret`) or turning
it into slides (use `taskbook-slides`).

## Method

1. **Read the paper PDF** and confirm the author list, author order, and
   corresponding-author labels.
2. **Search the web to fill in** each author's current affiliation, research
   interests, and representative works. Consult laboratory and academic
   homepages when needed. Without network access, use only information within
   the paper and explicitly state this fallback. Treat the paper's affiliation
   as historical to that publication; do not relabel it current without a
   dated public source. Keep requested current information blocked when unknown.
3. **Produce two files**:
   - `学者档案.md`: author list with corresponding authors marked → each
     author's affiliation, interests, and 2–4 representative works with
     verifiable links or DOIs → team/laboratory context, if available.
   - `works.bib`: BibTeX entries for the representative works and the paper.
4. **Source discipline**: cite a source for each piece of information using a
   link, DOI, or paper reference. Mark information that cannot be found as
   “未检索到” (not found); do not leave it blank or invent it.
5. Finish with a brief Chinese summary of the output file paths.

Maintain one ledger for the accepted task and the requirements below:
`ID | requirement | done/blocked/n/a | evidence or reason`. `n/a` needs a
scope-based reason and cannot waive a requested outcome. A file or an honest
partial-coverage label does not establish completion of the accepted scope.

## Requirements

- [B] R1 Every author has an affiliation entry with a verifiable source —
  Verification: each author's profile includes a source link/DOI; entries
  without sources are marked “未检索到”.
- [B] R2 Corresponding authors are explicitly identified — Verification:
  the author list includes corresponding-author labels.
- [B] R3 Entries in `works.bib` are real and parseable; leave missing fields
  empty — Verification: the bibliography contains no invented placeholder
  values, such as "unknown" used as a year.

## When to stop

Use one scoped reading/creation pass, at most one targeted repair round and
one final check of affected outputs. Deliver when every applicable blocking
requirement has passing evidence in the ledger. Do not reopen passed checks.
If input, tools or a required verification are unavailable, or the budget is
exhausted, deliver a useful partial result only with completed and blocked
items, the stop condition and the smallest unblock condition. Partial delivery
is not full acceptance; mark unsupported content unavailable rather than
inventing it. Continue independent work within the accepted scope.

Do not extend this task into paper interpretation or ranking academic standing.

## Output contract

Include the requirements ledger and actual coverage/check status in the
existing notes or delivery summary, with remaining work and unblock conditions.
Do not add a separate tracking system.

1. Two files: `学者档案.md` and `works.bib`.
2. Never invent author information, affiliations, references, or links.
   Organize only publicly available information; do not infer or spread
   unverified personal information.
3. Mark all unconfirmed information “待核实” (to be verified); prefer missing
   entries to fabricated ones.
4. Write outputs only in the current working directory.

Taskbook family: this skill is the independently triggerable version of the
`authors` preset in [research-taskbook](https://github.com/mappedinfo/metis),
originating in the skill maintainers' own MIT-licensed project
[GIStudio/research-taskbook](https://github.com/GIStudio/research-taskbook).
