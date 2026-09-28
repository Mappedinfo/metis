# metis-os

Scaffold the [USER.md convention](https://github.com/mappedinfo/metis/blob/main/CONVENTION.md)
in any project and install shared metis style profiles.

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
3. Prints next steps: edit `USER.md`, optionally gitignore it, and install
   shared skills with `npx skills add mappedinfo/metis`.

## Commands

| Command | Description |
|---|---|
| `metis-os init [--force]` | Scaffold `USER.md` + the `AGENTS.md` service clause (default) |
| `metis-os init --link <path>` | Symlink `USER.md` to your canonical personal file |
| `metis-os --help`, `-h` | Show usage |
| `metis-os --version`, `-v` | Show version |
| `metis-os profiles install [--force]` | Install bundled styles into the current project's `profiles/` |
| `metis-os profiles path <name>` | Print the installed YAML path for a profile such as `journal` |

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
