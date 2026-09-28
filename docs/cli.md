# metis-os CLI

`metis-os` scaffolds the [USER.md convention](/convention) in any project: a
personal `USER.md` starter plus the service clause in `AGENTS.md`.

Zero dependencies, plain ESM, Node >= 18.

This page describes the **0.3.0 source version, not yet published to npm**.
The published 0.2.0 lacks the symlink safety fix and profile commands. Use the
source CLI below for the corrected behavior; do not run 0.2.0 `init --force`
on a linked USER.md.

## Usage

```bash
# From the target project's root; substitute the checkout path
node /path/to/metis/packages/metis-os/bin/metis-os.js init
```

`init` is the default command, so `npx metis-os` works too. It is idempotent
and safe to re-run.

## What it does

1. **USER.md** — if missing, writes a friendly starter template with the four
   recommended sections (`Identity` / `Goals` / `Preferences` /
   `Boundaries`) as commented prompts. An existing `USER.md` is never
   overwritten unless you pass `--force`. Alternatively,
   `--link <path>` creates `USER.md` as a symlink to your canonical
   personal file (the target must exist; `~` is expanded) — one person,
   one file, live in every linked project.
   In version 0.3.0, plain `init --force` replaces a symlink with a local
   starter file and preserves the canonical target. Direct or indirect
   links back to the project's own `USER.md` are rejected.
2. **AGENTS.md** — ensures the file contains the metis user-service clause:

   ```markdown
   This project serves the person described in [USER.md](USER.md); their stated
   preferences take precedence over generic defaults, within the safety and
   authorization rules below.
   ```

   The clause lives inside a managed block delimited by
   `<!-- metis:user-service:start -->` and `<!-- metis:user-service:end -->`.
   Existing content outside the block is never touched, and the block is never
   duplicated on re-run. If no `AGENTS.md` exists, a minimal one containing
   just the clause is created.
3. Prints next steps: edit `USER.md`, optionally gitignore it, and install
   shared skills with `npx skills add mappedinfo/metis`.

## Commands

| Command | Description |
|---|---|
| `metis-os init [--force]` | Scaffold `USER.md` + the `AGENTS.md` service clause (default) |
| `metis-os init --link <path>` | Symlink `USER.md` to your canonical personal file |
| `metis-os --help`, `-h` | Show usage |
| `metis-os --version`, `-v` | Show version |
| `metis-os profiles install [--force]` | Install styles in the current project's `profiles/` (0.3.0+) |
| `metis-os profiles path <name>` | Print a local profile's absolute YAML path (0.3.0+) |

## Shared styles

The skill installer installs skill folders; shared profiles require a separate
step. Build them in the metis checkout, then install in the target project:

```bash
# In the metis checkout
npm ci
npm run profiles:bundle

# From your target project; substitute the checkout path
cd /path/to/your-project
node /path/to/metis/packages/metis-os/bin/metis-os.js profiles install
node /path/to/metis/packages/metis-os/bin/metis-os.js profiles path journal
```

After 0.3.0 is published, `npx metis-os@^0.3.0` can replace the absolute source
CLI invocation. The current working directory always selects the target project.
See the [release state](https://github.com/mappedinfo/metis/blob/main/HANDOFF.md).

`uses: [profiles/journal]` resolves to `profiles/journal.yaml` in the current
project, independent of the installed skill's location. Each artifact keeps its
profile: submission figures retain print settings while slides retain deck
settings. Palette and font roles can be coordinated without replacing export
formats, dimensions or type sizes.

Installation preserves matching files and named local variants. A differing
bundled filename stops the operation before writes; `--force` explicitly replaces
it. Symlink destinations are refused. Profile installation does not change
personal or agent-instruction files.

## Source

The package lives in
[`packages/metis-os`](https://github.com/mappedinfo/metis/tree/main/packages/metis-os)
and is released under the MIT license.
