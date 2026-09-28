# Project handoff

Read this entry before continuing implementation or preparing a release.

## Current contract

The public collection uses seven capability categories, controlled domain and
action tags, explicit `uses` dependencies and required `artifacts` declarations.
The vocabulary is maintained in [skill-contract.json](skill-contract.json).
Root [profiles/](profiles/) owns shared style data. Each artifact keeps its own
export and sizing defaults, including in mixed figure-and-deck tasks.

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

Source changes on top of 13e7758 (local commit, daily push queue):

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
