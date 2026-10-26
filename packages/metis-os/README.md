# metis-os

Scaffold the [USER.md convention](https://github.com/mappedinfo/metis/blob/main/CONVENTION.md)
in any project, install shared metis style profiles, and link the bundled
metis skills into an agent skill directory.

Zero dependencies, plain ESM, Node >= 18.

**Version 0.3.0 is prepared in source and has not been published to npm.**
The behavior below describes that source version. The published 0.2.0 does not
include the symlink safety fix or profile commands; do not use its `init --force`
on a linked USER.md.

## Usage

```bash
# Run from the target project's root; substitute the metis checkout path
node /path/to/metis/packages/metis-os/bin/metis-os.js init
```

`init` is the default command, so `npx metis-os` works too. It is idempotent
and safe to re-run:

1. **USER.md** — if missing, writes a friendly starter template with the four
   recommended sections (`Identity` / `Goals` / `Preferences` / `Boundaries`)
   as commented prompts. An existing `USER.md` is never overwritten unless you
   pass `--force`. Alternatively, `--link <path>` creates `USER.md` as a
   symlink to your canonical personal file (the target must exist; `~` is
   expanded) — one person, one file, live in every linked project.
   With plain `init --force`, an existing symlink is replaced by a local
   starter file; its canonical target is preserved. Linking to the local
   `USER.md` itself, directly or through another link, is rejected.
2. **AGENTS.md** — ensures the file contains the metis user-service clause:

   > This project serves the person described in [USER.md](USER.md); their stated
   > preferences take precedence over generic defaults, within the safety and
   > authorization rules below.

   The clause lives inside a managed block delimited by
   `<!-- metis:user-service:start -->` and `<!-- metis:user-service:end -->`.
   Existing content outside the block is never touched, and the block is never
   duplicated on re-run. If no `AGENTS.md` exists, a minimal one containing just
   the clause is created.
3. Prints next steps: edit `USER.md`, optionally gitignore it, and link the
   shared skills with `metis-os skills install`.

## Commands

| Command | Description |
|---|---|
| `metis-os init [--force]` | Scaffold `USER.md` + the `AGENTS.md` service clause (default) |
| `metis-os init --link <path>` | Symlink `USER.md` to your canonical personal file |
| `metis-os --help`, `-h` | Show usage |
| `metis-os --version`, `-v` | Show version |
| `metis-os profiles install [--force]` | Install bundled styles into the current project's `profiles/` |
| `metis-os profiles path <name>` | Print the installed YAML path for a profile such as `journal` |
| `metis-os skills install [--force] [--dir <path>] [--skill <name> ...]` | Symlink the bundled skills into an agent skill directory |
| `metis-os skills uninstall [--dir <path>] [--skill <name> ...]` | Remove only the symlinks created by `skills install` |
| `metis-os skills list [--dir <path>]` | Show each bundled skill's link state |

## Writing workflow integration

The source version also provides an independent `writing-review` workflow:
enter a writing task, inject shared writing judgment and the complete `prose-audit` instructions, draft,
review, revise at most once, verify the current text and deliver it.
The writing scenario keeps complete delivery ownership; situation, organization
and review are internal modules rather than successive task owners.

```bash
metis-os workflows install writing-review --runtime codex
metis-os workflows install writing-review --runtime dsh
metis-os workflows status --session <session-id>
metis-os workflows uninstall --runtime codex
```

Run installation in the consuming project, or pass `--project /path/to/project`.
Use `--activation explicit` to require the standalone first-line marker
`[metis:writing-review]`; the default uses configurable Chinese/English writing
patterns. `[metis:skip-writing-review]` skips an activated task.

Codex installation preserves other hooks in `.codex/hooks.json`; review and
trust the generated hooks in Codex before expecting them to run. DSH installation
exports hook JSON and a `cordis.patch.yml` under `.metis/adapters/dsh/`; load the
patch in the intended DSH composition. It does not restart or reconfigure a
running service. Generated machine paths and `.metis/state/` are locally ignored.

The hook supplies the evidence commands (`capture`, `review`, `revise`, `verify`)
with the current session identity. Records bind the captured text, review and
verification by hash; their semantic checks are model attestations. One Stop
continuation can recover a missed check, but cannot hide text already streamed.
See the repository's [bilingual workflow guide](https://github.com/mappedinfo/metis/tree/main/workflows)
for the complete protocol, supported text formats and recovery behavior.

## Shared skills

`metis-os skills install` symlinks the skills bundled with the package
(`metis-router`, `scansci-pdf`, and the four-skill `taskbook-*`
family plus `research-taskbook`) into the cross-agent skill directory
`~/.agents/skills/`, where Claude Code, Codex, DSH and other agents scan for
skills. Use `--dir` to target a project-level `.agents/skills/` or any other
directory instead, and `--skill <name>` (repeatable) to manage a subset.

The command manages only the skills it ships, so it coexists with your other
entries in the same directory:

- Re-running is idempotent; already-linked skills are left unchanged.
- A **foreign symlink** (same name, pointing elsewhere) is never replaced
  without `--force`; `--force` retargets it.
- A **real directory or file** with the same name blocks the install entirely
  and is never removed or replaced, even with `--force`.
- `skills uninstall` removes only the symlinks it manages; foreign links and
  real directories stay untouched.
- The symlinked skills are **live views** of the package content: upgrading
  `metis-os` updates what every agent sees, with no copy step.

`skills list` reports `linked` / `missing` / `foreign-link` / `blocked`
per skill. The root repository's `skills/` is canonical; `npm pack`
regenerates the bundled copy (`packages/metis-os/skills/`, gitignored) via
`scripts/bundle-skills.mjs`, and `npm run skills:bundle:check` fails CI when
the bundle is stale.

## Shared profiles

From the project root, run `metis-os profiles install` after installing skills.
The skill installer alone does not install repository-level assets. Consumers
resolve `uses: [profiles/journal]` as `<project-root>/profiles/journal.yaml`,
or ask `metis-os profiles path journal` for its absolute path.

Matching files are left untouched. Different local copies cause an error before
any writes; use named variants to retain local styles, or `--force` to replace
the bundled names. Directory and file symlinks are refused even with `--force`.
Installing profiles does not create or modify `USER.md` or `AGENTS.md`.

The root repository's `profiles/` is canonical. `npm pack` generates the release
bundle from it; installed profiles are versioned snapshots, not live links.
For a checkout, run `npm ci && npm run profiles:bundle` at the metis repository
root first. Then switch to the target project and invoke
`node /path/to/metis/packages/metis-os/bin/metis-os.js profiles install`, using
the absolute checkout path. The current working directory selects the target.
These commands require version 0.3.0 or later; check the repository's
[release state](https://github.com/mappedinfo/metis/blob/main/HANDOFF.md)
before relying on npm availability.

## Why

`USER.md` is personal and private; `AGENTS.md` is the generic service contract;
skills stay shared and public. Everything else in the agent stack exists to serve
the person described in `USER.md`. See
[CONVENTION.md](https://github.com/mappedinfo/metis/blob/main/CONVENTION.md).

## License

MIT — see [LICENSE](LICENSE).
