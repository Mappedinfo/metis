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
the specified path. Produce `学者档案.md` and `works.bib`. For a large PDF or
scanned document, first use `scansci-pdf` to extract the text.

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
   the paper and explicitly state this fallback.
3. **Produce two files**:
   - `学者档案.md`: author list with corresponding authors marked → each
     author's affiliation, interests, and 2–4 representative works with
     verifiable links or DOIs → team/laboratory context, if available.
   - `works.bib`: BibTeX entries for the representative works and the paper.
4. **Source discipline**: cite a source for each piece of information using a
   link, DOI, or paper reference. Mark information that cannot be found as
   “未检索到” (not found); do not leave it blank or invent it.
5. Finish with a brief Chinese summary of the output file paths.

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

- Stop after delivering `学者档案.md` and `works.bib` with a path summary.
- Do not extend the task into interpreting the paper or judging academic
  standing; those are separate tasks.

## Output contract

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
