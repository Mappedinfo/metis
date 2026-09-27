# metis-os

Scaffold the [USER.md convention](https://github.com/mappedinfo/metis/blob/main/CONVENTION.md)
in any project: a personal `USER.md` starter plus the service clause in `AGENTS.md`.

Zero dependencies, plain ESM, Node >= 18.

## Usage

```bash
npx metis-os init
```

`init` is the default command, so `npx metis-os` works too. It is idempotent
and safe to re-run:

1. **USER.md** — if missing, writes a friendly starter template with the four
   recommended sections (`Identity` / `Goals` / `Preferences` / `Boundaries`)
   as commented prompts. An existing `USER.md` is never overwritten unless you
   pass `--force`.
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
| `metis-os --help`, `-h` | Show usage |
| `metis-os --version`, `-v` | Show version |

## Why

`USER.md` is personal and private; `AGENTS.md` is the generic service contract;
skills stay shared and public. Everything else in the agent stack exists to serve
the person described in `USER.md`. See
[CONVENTION.md](https://github.com/mappedinfo/metis/blob/main/CONVENTION.md).

## License

MIT — see [LICENSE](LICENSE).
