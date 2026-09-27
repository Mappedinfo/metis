# metis-os CLI

`metis-os` scaffolds the [USER.md convention](/convention) in any project: a
personal `USER.md` starter plus the service clause in `AGENTS.md`.

Zero dependencies, plain ESM, Node >= 18.

## Usage

```bash
npx metis-os init
```

`init` is the default command, so `npx metis-os` works too. It is idempotent
and safe to re-run.

## What it does

1. **USER.md** — if missing, writes a friendly starter template with the four
   recommended sections (`Identity` / `Goals` / `Preferences` /
   `Boundaries`) as commented prompts. An existing `USER.md` is never
   overwritten unless you pass `--force`.
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
| `metis-os --help`, `-h` | Show usage |
| `metis-os --version`, `-v` | Show version |

## Source

The package lives in
[`packages/metis-os`](https://github.com/mappedinfo/metis/tree/main/packages/metis-os)
and is released under the MIT license.
