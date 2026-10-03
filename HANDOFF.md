# Project handoff

Read this entry before continuing implementation or preparing a release.

## Current contract

The public collection uses seven capability categories, controlled domain and
action tags, explicit `uses` dependencies and required `artifacts` declarations.
The vocabulary is maintained in [skill-contract.json](skill-contract.json).
Root [profiles/](profiles/) owns shared style data. Each artifact keeps its own
export and sizing defaults, including in mixed figure-and-deck tasks.

The [language workflow](CONTRIBUTING.md#skill-languages) makes English
authoritative for bilingual skills: `SKILL.md` is the execution entry and
`SKILL.zh.md` its editable translation. Changes may start in either language;
synchronize workflow meaning in the same change. Output language remains
independent of source language.

## Writing workflow integration — 2026-10-03

- Added the independent [workflow layer](workflows/README.md), with an English
  execution entry and editable Chinese guides. The first `writing-review`
  workflow injects the full bundled `prose-audit` skill, captures a draft,
  records a contextual review, permits at most one revision, verifies the
  current artifact and delivers the requested text. Public skills remain
  standalone; no private writing rules or runtime paths enter their sources.
- `metis-os workflows` installs or removes project-level Codex hooks and exports
  a DSH `@deepseek-ai/dsh-hooks-codex` Cordis patch. Installation preserves other
  hooks, refuses conflicting or edited managed configuration and supports
  automatic Chinese/English matching or explicit request markers. Generated
  machine paths and review history are ignored; `.metis/workflows.json` is the
  portable opt-in. A new source bundle is checked and included by npm packing.
- Private per-run snapshots and hashes bind the original draft, review,
  optional revision and final verification. Chat-only writing uses a private
  buffer. Stale receipts, changed final text, unsafe paths and repeated budget
  consumption are rejected. Stop permits one recovery continuation, including
  hosts that issue a new turn for it; repeated internal steps do not rearm it.
  These records attest model checks, not their semantic correctness, and the
  Stop hook cannot hide or retract text already streamed to the user.
- Validated: all 100 collection tests, the 11-skill / 4-profile audit with no
  errors or warnings, three source/bundle checks and the docs build. The 51
  added tests cover state transitions, stale evidence, cross-process budgets,
  hook replay/continuation, installed commands, configuration preservation and
  uninstall/reinstall failure paths. A bounded independent installer review
  found two issues; both have fixes and regression coverage.
- An independent agent consumed the actual injected context from an isolated
  installed package and completed a fictional Chinese release-note revision.
  Readback confirmed `ready`, one revision, unchanged numerical facts,
  citation marker and limitations, and final text identical to the verified
  revision snapshot. This is bounded package/adapter use, not a live Codex or
  DSH hook-delivery test or a general editorial-accuracy benchmark.
- Codex configuration now sets `additionalContextLimit` only on
  `UserPromptSubmit`; `Stop` cannot emit additional context. Reinstall upgrades
  the earlier managed Stop entry and its installation record, preserving other
  hooks. Regression coverage checks new installation and legacy upgrade.
- This checkout has both adapters prepared. After user approval, a read-only
  `hooks/list` check using the desktop's Codex 0.160.0 reports both hooks enabled
  and trusted, with no loading warnings or errors. The separately installed
  CLI 0.142.5 computes a different prompt-hook hash; diagnose trust using the
  intended host version instead of treating that older CLI as desktop evidence.
  This is configuration-loading validation; an actual writing turn remains the
  runtime execution check. The DSH export has not been mounted in a live host.
  This repair did not write the trust store or restart a service. npm publication
  and Pages deployment remain separate; validated source changes follow the
  existing daily push queue.

## Public prose review — 2026-10-03

- Added [prose-audit](skills/prose-audit/SKILL.md), the eleventh public skill,
  in `compose` with `writing` / `review-qa` domains. Four English/Chinese
  document pairs cover the workflow, contextual signals, optional scanner
  and fictional practice cases. English governs execution; audit, edit and
  result-only modes support Chinese, English and mixed prose.
- The workflow reads the supplied scope before judging wording. Keywords,
  repetition and syntax identify candidates; actual findings need a source
  location and an explanation of reader impact. Necessary technical terms,
  evidence limits, quotations and author voice remain protected. There are
  no authorship probabilities, automatic forbidden-word replacements or
  invented details to make prose appear human. The public material is original;
  existing personal writing skills and runtime exposures were not changed.
- The optional Python standard-library scanner is local and read-only. It
  reports original character/line locations, configurable frequency triggers
  and descriptive lengths. Its finite vocabulary, limited traditional-character
  mapping and Markdown/quotation protection are heuristics. A candidate-free
  scan neither completes the semantic review nor proves prose quality.
- Validated: 29 scanner tests, all 49 collection tests, the 11-skill / 4-profile
  audit (0 errors / 0 warnings), source/bundle consistency and the docs build.
  Focused tests include preserved source locations, LF/CRLF parity, quoted and
  literal regions, invalid inputs/configuration, read-only behavior and a
  malformed-delimiter hang regression. The 22 local Markdown links resolve;
  an isolated single-skill installation matches source files and its scanner
  runs without changing the supplied input.
- An independent agent used the public workflow and signal guide in manual
  mode on four fictional cases. Readback verified technical-term preservation,
  a complete fact-preserving result-only revision, recognition of a semantic
  loop, and retention of ordinary personal voice. All 11 frozen inputs stayed
  unchanged. This is bounded simulated use, not a general accuracy benchmark.
- Local bundles include the skill. Fresh-session runtime discovery, npm
  publication and Pages deployment remain separate; the validated local commit
  follows the existing daily push queue.

## Public retrospective workflow — 2026-10-03

- Added [review-advance](skills/review-advance/SKILL.md), the tenth public skill,
  in `meta` with `project-ops` / `workflow-meta` domains. Its six English/Chinese
  document pairs cover the core SOP, caller inputs, evidence decisions,
  optional companion learning, unattended delivery and fictional raw evidence.
  English is authoritative; the public method works with supplied facts alone.
- The public SOP owns Reflect → Summarize → Advance → Plan. A caller may supply
  personal defaults and optional local adapters; those values are data, not
  authorization. Research alignment is conditional, source validity stays
  separate from learner mastery, and a review does not install scheduled jobs.
  Personal paths, actual learning records and runtime integrations remain with
  the caller. The selected owner-authorized extraction is documented in the
  contribution rules; it does not authorize mirroring private collections.
- Validated: independent privacy and bilingual review, all 17 local links,
  installation of only the new skill with identical source hashes, all 49
  existing tests, the 10-skill / 4-profile audit (0 errors / 0 warnings), bundle
  consistency and docs build. Local bundles include the new skill. These checks
  do not establish fresh-session discovery, a real scheduled review, npm
  publication or Pages deployment.
- An independent agent applied the copied public source to two fictional cases
  in an isolated directory. Readback confirms a no-config review works, planned
  actions stay unexecuted, config values do not override read-only authority,
  and process success / learner exposure are not promoted to delivery / mastery.
  All 19 frozen input files are unchanged; only the two requested responses were
  added. This is bounded simulated use, not a real project review.

## Bilingual migration — 2026-10-03

- All 9 skills now have complete English `SKILL.md` entries and editable
  Chinese `SKILL.zh.md` companions. The 11 directly used Markdown references,
  templates, presets and example descriptions are also paired: 20 document
  pairs in total. Canonical English files retain their original paths;
  Chinese documents link their translated counterparts where available.
- The five taskbook entries and previously Chinese supporting workflows now
  have English instructions. Chinese output requirements, artifact filenames,
  status labels, identifiers, commands, numerical limits and source attribution
  are preserved. Translation does not change what the skills are authorized
  to do. The scansci-pdf modification notice records its translation; its
  Apache-2.0 license file is unchanged.
- Validated: each pair was reviewed against the pre-migration source for
  workflow meaning; independent reviews covered all nine skills and their
  support documents. Structural checks confirm 20 pairs, 83 resolving local
  links, unchanged runtime identity fields and requirement IDs/levels, and
  no duplicate Chinese runtime frontmatter. These checks complement semantic
  review; they do not automate translation-equivalence judgment.
- `npm run check` passes all 49 tests, profile/skill bundle checks, the
  9-skill / 4-profile audit (0 errors / 0 warnings) and the docs build.
  A clean temporary installation exposes all nine skills; every installed
  Markdown file matches its canonical source. Local release bundles are
  regenerated. This does not establish fresh-session discovery or replace
  task-specific end-to-end validation.
- The catalog links both languages. npm publication and Pages deployment
  remain separate; local commits follow the existing daily push queue.
  Taskbook PDF/OCR routing and slides profile integration remain separate
  method defects; translation does not resolve those earlier findings.

## Language policy — 2026-10-03

- Accepted: English governs conflicts; Git history supports reconciliation,
  not execution-language selection. This replaces the earlier proposal to
  choose whichever language was modified last. Chinese-origin workflow edits
  remain pending until incorporated into English; retain their intent.
- The initial policy-only change left migration pending. The subsequent
  bilingual migration above completes all 9 current entries and their used
  Markdown support documents. New skills also use the English/Chinese pair.
- Acceptance for a migrated pair: equivalent triggers, inputs, workflow,
  boundaries, outputs, checks and stop rules; preserved identifiers, commands,
  references and licensing; a passing collection check and a regenerated
  bundle. Existing lint checks the runtime entry, not translation equivalence.
- Installation and discovery already use `SKILL.md`, and the bundler copies
  supporting files. No loader changes, automatic translator or timestamp
  arbitration were added. npm publication and Pages deployment remain separate.
- Validated: scoped policy review, `git diff --check`, `npm run skills:check`
  (9 skills, 4 profiles, 0 errors / 0 warnings) and `npm run docs:build` pass.
  No skill workflow or executable implementation changed in this update.

## Chart expansion — 2026-10-02

- `table-chart` now proposes chart, layout and profile alternatives from a
  prepared CSV and explicit column semantics. Its `chart.py plan` output is
  a set of candidates requiring the comparison question, title and units;
  automatic type/group guesses are not scientific decisions.
- `chart.py render` supports bar, dot, line, scatter, histogram, box and
  heatmap, with grouping and shared-scale facets where supported. The original
  `bar_chart.py` interface remains compatible. Line ordering, histogram bins
  and descriptive box statistics are recorded; rows are never silently dropped
  or averaged. Outputs include source/spec/profile/script snapshots, hashes,
  dependency versions, a rerun command and an actual-palette grayscale preview.
- `journal` adds Okabe–Ito series encodings and continuous scales;
  `journal-grayscale` and `journal-npg` add named alternatives. NPG uses ggsci's
  Nature Reviews Cancer-inspired colors, not an official journal palette or
  accessibility certification. The collection now has 9 skills and 4 profiles.
- All shared figure profiles require figure titles, captions and panel titles
  below their plots. Both chart entrypoints apply this project convention;
  optional captions wrap to the available width, and labeled subplots reserve
  separate space below axis labels. Slide headings retain their own layout.
- Validated: `npm run check` passes 49 tests, bundle consistency, the collection
  audit (0 errors / 0 warnings) and the docs build. `npm run table-chart:check`
  passes 38 tests, including the legacy interface, every chart family, malformed
  specs, missing/duplicate data, numeric precision, portable snapshot reruns and
  measured figure/panel title and caption positions.
  A bounded code review found and fixed non-renderable numeric-line suggestions
  and malformed type fields; regression cases pass.
- Nine fictional examples cover all seven forms, facets and the three figure
  profiles. Color/grayscale PNGs were inspected; PDF pages were rasterized and
  inspected in the coordinator and independent consumer checks. These checks
  verify the example artifacts, not universal readability or user satisfaction.
  Reproduce the examples with `scripts/render_examples.py` inside the skill;
  [the chart guide](skills/table-chart/references/chart-guide.md) gives commands.
- Source and generated runtime bundles are updated locally. Shared profiles
  already copied into other projects remain snapshots and require explicit
  reinstallation; do not overwrite local variants. This task does not publish
  npm or deploy Pages. Local commits follow the existing daily push queue.

## Source changes — 2026-10-02

- Added two original, narrowly scoped skills: `source-brief` (compose) turns
  supplied material into a short brief or revision with a claim/source map;
  `table-chart` (visualize) turns a prepared CSV into one horizontal bar
  chart using `profiles/journal`, with a reproducible plotter and receipt.
  No private skill text or research material was copied. The collection now
  has entries in all seven categories; this is coverage, not seven-category
  business validation.
- [Minimal skills](docs/minimal-skills.md) explains each entry's smallest
  input, output and acceptance check. Existing paper-reading, slides and
  reproduction entries retain their scope; no parallel generic aliases were
  added. The installer tests now inspect every bundled skill rather than
  hard-coding the former collection size.
- The full check reproduced a race: the tarball test's prepack rebuilt the
  shared skill bundle while installer tests were reading it. Test files now
  run serially so package rebuilds finish before another file reads them.
- Verified locally: `npm run check` passed 49 tests, both bundle checks,
  the 9-skill / 2-profile audit (0 errors, 0 warnings) and the docs build.
  `npm run table-chart:check` passed 10 behavior tests, including rejection
  of nonzero underflow and decimal precision loss. These optional Python
  tests run with uv-managed dependencies and do not add CLI dependencies.
- Independent source-brief forward-use tasks delivered a 223-character
  Chinese brief and a 119-word English brief from fictional notes; source
  maps preserve blocked checks, proposals and absent comparison/user data.
  English and CJK chart examples were rendered; PNGs and PDF rasterizations
  were inspected for values, signed baseline, glyphs and clipping. The
  default journal profile correctly rejects unsupported CJK text; a named
  CJK font variant supports it. An exported script was rerun successfully.
  These are bounded example checks, not general usability measurements.
- Remaining work: the taskbook PDF/OCR routing and slides profile connection
  still need repair and task-specific acceptance. Bilingual migration was
  subsequently completed under the English-authoritative language policy above.
  No npm publication or Pages deployment is part of this change.

## Source changes — 2026-09-30

- Ported the research-taskbook family from our own MIT-licensed
  GIStudio/research-taskbook into `skills/`, split across the category system and
  upgraded to contract v2: `research-taskbook` (meta, with references/ presets),
  `taskbook-interpret` (analyze), `taskbook-authors` (acquire),
  `taskbook-slides` (present), `taskbook-reproduce` (build). Original Chinese
  method content preserved; added license/category/domain/action/uses/artifacts
  frontmatter and the four required sections. Executor skills declare
  `uses: [scansci-pdf]` for large-PDF extraction. `skills:check` PASS with
  7 skills / 0 errors / 0 warnings; acquire/analyze/build/meta/present categories
  now filled, compose/visualize remain empty.
- `taskbook-slides` gained the rendered-page visual QA step (render every
  delivered page, inspect crop/overlap/legibility, recheck after fixes; report
  "visual unverified" when the environment cannot render) plus requirement R4.
  Source: the vault copy's verified learning — the first private→public flow
  through this family.
- Source of truth: for the `taskbook-*` family and `research-taskbook`, **metis
  is canonical**. The vault keeps generated copies (metis content + the private
  `metadata.integration` overlay) and a copy of `references/`; regeneration is a
  copy of the metis files with the overlay re-injected. The vault's
  `scripts/audit_skill_sync.py` does not follow directory symlinks, so vault
  `references/` must stay real files.
- Added `.github/ISSUE_TEMPLATE/skill-report.yml` (plus `config.yml`): the form
  asks for skill, version anchor (`metis-os skills list` output), the failing
  ledger item ([B]/[A] R#, Output contract item, or When to stop), evidence and
  the caller's reading of the clause — so external reports land as directly
  actionable polish input and clause rewording is first-class feedback.

## Source changes — 2026-09-29

- `metis-os skills install` symlinks the bundled skills into
  `~/.agents/skills/` (or `--dir`), with `--skill` subset selection,
  `skills uninstall` and `skills list`. Only package-owned symlinks are
  managed: foreign links require `--force` to retarget, and real directories
  block the install entirely even with `--force`. Bundles are generated from
  root skills/ by `scripts/bundle-skills.mjs` (`npm run skills:bundle`,
  `skills:bundle:check` in `npm run check`); the skill tree hash in the
  manifest is verified on every CLI run.

## Source changes — 2026-09-28

- `metis-os` 0.3.0 protects canonical USER.md files when replacing local symlinks
  and rejects link targets that depend on the local USER.md entry.
- `metis-os profiles install` delivers bundled styles to a consumer project.
  Bundles are generated from root profiles during packing; installed copies are
  snapshots. Conflict and symlink checks preserve existing project files.
- `npm run skills:check` adapts the pinned published Atlas 0.1.0 libraries:
  explicit dependencies, profile nodes, graph tags/domain views and machine
  checks for declarations, vocabulary and references. Native Atlas 0.1.0 does
  not offer these checks. Artifact quality remains a task-specific judgment.
- The router separates planning from execution, checks whether analysis is
  complete, and retains the appropriate profile for each artifact.

Verification entry: `npm ci && npm run check`. Tests include temporary filesystem
fixtures for canonical-file preservation, invalid skill contracts, dependency
graphs, profile conflicts and a real npm tarball installed in an empty project.
Passing these checks establishes source/package behavior, not human usability
validation or successful remote publication.

Verified locally on 2026-09-28: regression tests passed, the collection audit
reported 2 skills / 2 profiles / 0 errors, profile bundles matched canonical
files, the packed CLI installed and resolved both profiles in an empty project,
and the VitePress production build passed.

## Release state

Version 0.3.0 is prepared in source. It has not been published to npm by this
repair. Version 0.2.0 users do not receive these changes until a new release.
Until then, use the source entry documented in [profiles/README.md](profiles/README.md).
Local commits, queued Git synchronization, npm publication and Pages deployment
are separate steps; do not infer one from another.

Before publishing, rerun `npm run check`, inspect `npm pack --workspace metis-os
--dry-run`, then publish the tested package under the maintainer's release
authorization. Verify the published version and its installed behavior. Pages
deploys on a main-branch push only after the checks pass; pull requests run the
same checks without deployment.

## Deferred work

`organize` remains folded into `acquire`; reconsider when actual skill coverage
justifies another capability category. No parallel old/new taxonomy is needed
for this small collection. The profile seeds are available before the first
visual consumer; fixture consumers verify the dependency and installation path.

The existing VitePress 1.6 development-server dependency advisories are outside
this repair; review a supported documentation-toolchain upgrade separately.
Static Pages builds and the zero-dependency metis-os runtime are distinct from
the development server.

## 2026-09-28 — skill-contract v2: bounded SOPs (draft/3.md)

Source changes in 91f196b, on top of 13e7758:

- `skill-contract.json` v2: `required_sections` (When to use / When to stop /
  Requirements / Output contract, case-insensitive heading substring) and
  `boundedness.forbidden_patterns` (unbounded-loop phrasing, per-line scan of
  SKILL.md bodies only).
- `scripts/lib/skill-contract.mjs`: severity tiers; new diagnostics
  SECTION_MISSING (error), UNBOUNDED_LANGUAGE (error, file line number),
  LEDGER_ITEM_UNLABELED (warning, [B]/[A] labels); `audit.ok` gates on errors
  only; counts gain `warnings`.
- `scripts/check-skills.mjs`: summary prints warnings; diagnostics prefixed
  with severity; help updated.
- `test/skill-contract.test.mjs`: fixture helper now emits a compliant body;
  3 new tests (36 total, all green).
- Template + skills/README criterion 6 + docs/skills.md document the contract.
- metis-router: Method ### 5 map–freeze–reduce parallel pattern; Stop rules
  promoted to `## When to stop`; `## Requirements` ledger; Output contract
  gains the frozen-ledger deliverable.
- scansci-pdf: minimal When to use / Requirements / When to stop additions;
  Provenance log updated per Apache-2.0 §4. Workflow text unchanged.

Verification: `npm run check` green — 36/36 tests, profiles bundle match,
skills:check PASS 2 skills / 0 errors / 0 warnings, vitepress build ok.

### Review corrections

The follow-up review reproduced a copied template rejected by its own lint,
code-block headings accepted as required sections, and Requirements subsections
skipped by the warning check. It also identified the missing execution-status
ledger required by the accepted design. The 36-test result above did not cover
these cases.

The repair uses Markdown structure for section and list-item boundaries,
retains per-line forbidden-language checks, and adds regression fixtures for
these failures. The authoring template and both skills require requirement
statuses with evidence, explicit unfinished items at budget exhaustion, and
scope-based reasons for inapplicable requirements. The router bundles a reusable
execution ledger; its frozen audit findings remain a separate repair input.

Verified after the repair: `npm ci && npm run check` passed all 41 tests,
including five new regression tests; profile bundles matched, the collection
audit reported 2 skills / 2 profiles / 0 errors / 0 warnings, and the production
docs build passed. The original vendored workflow file remains unchanged.
Planning-only and budget-exhaustion ledger examples were reviewed for scope
and evidence semantics; these examples are not claims of live retrieval runs.

Git synchronization for this repair is explicitly authorized as an immediate
push. Verify the repaired commit on the remote and the Pages workflow for that
exact commit; npm publication still requires separate release authorization.
