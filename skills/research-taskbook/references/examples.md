[中文译本](examples.zh.md)

# Examples across question types

Minimal taskbook excerpts for three question types. What they share is the
method of decomposition, not one template: **broad question → verifiable
subquestions → atomic tasks with three explicit elements**.

## Example 1 · Empirical testing (quantitative)

**Vague idea**: “Can urban green space reduce residents' stress?”

**Decomposition after clarification** (excerpt):

> ### Task 1: screen the literature
> - Input: query `(green space OR NDVI) AND (stress OR cortisol)`, restricted to 2018–2026, in Web of Science + PubMed.
> - Output: `文献对比表.md`, ≥12 papers × columns (study location/exposure measure/stress measure/identification strategy/conclusion).
> - Acceptance: every paper has a DOI; 100% of rows identify the strategy as cross-sectional, longitudinal or quasi-experimental.
>
> ### Task 2: list data availability
> - Input: the table from Task 1 + a list of public data sources.
> - Output: `数据方案.md`, one row per dataset + variables + access path + license + risks.
> - Acceptance: every core variable in the paper (exposures, outcomes, covariates) has ≥1 feasible source or is marked “缺失：需向作者索取” (missing: request from the authors).

## Example 2 · Reproduction/audit

**Vague idea**: “Are this paper's results reliable, and can we reproduce them?”

**Decomposition after clarification** (excerpt):

> ### Task 1: create a table-by-table comparison checklist
> - Input: paper PDF supplied by the author + the author's public code repository, if available.
> - Output: `复现清单.md`, one row per figure/table = required data + code entry point + run command + expected output.
> - Acceptance: 100% of the paper's main tables and figures are listed; mark every dataset not supplied by the paper as “缺失” (missing), and do not fabricate it.
>
> ### Task 2: prepare the environment and acquire data
> - Input: reproduction checklist + the code repository's README.
> - Output: a runnable `environment.yml` / `requirements.txt` + a data download script; record the reason for each failed download source.
> - Acceptance: in a clean environment, `bash run_all.sh` runs as far as the failure point caused only by missing data.

## Example 3 · Qualitative interpretation

**Vague idea**: “How is ‘resilience’ articulated in official planning texts?”

**Decomposition after clarification** (excerpt):

> ### Task 1: define the corpus inventory
> - Input: a directory specified by the user, such as 20 master-plan PDFs.
> - Output: `语料清单.md`, one entry per document = filename + year + issuing institution + page count + reason for inclusion/exclusion.
> - Acceptance: check every entry against the user's inclusion criteria; every exclusion has a reason, with no invented details.
>
> ### Task 2: index keywords in context
> - Input: text from every PDF in the corpus inventory.
> - Output: `韧性索引.csv`, one row = file + page number + original sentence + preliminary semantic label (open coding).
> - Acceptance: manually check a sample of 10 entries; label-to-text correspondence is ≥90%; the coding framework describes rather than evaluates.
>
> **Boundary statement**: the researcher provides the theoretical interpretation of the codes and the discourse analysis; AI only locates and excerpts material.
