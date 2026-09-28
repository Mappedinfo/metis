#!/usr/bin/env node
// metis-os — scaffold USER.md and the AGENTS.md service clause.
// Zero dependencies, Node >= 18, plain ESM.

import {
  existsSync,
  lstatSync,
  readFileSync,
  readlinkSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, isAbsolute, parse, resolve, sep } from "node:path";
import { cmdProfiles } from "../lib/profiles.js";

const VERSION = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8")
).version;

const BLOCK_START = "<!-- metis:user-service:start -->";
const BLOCK_END = "<!-- metis:user-service:end -->";

const SERVICE_SENTENCE =
  "This project serves the person described in [USER.md](USER.md); their stated\n" +
  "preferences take precedence over generic defaults, within the safety and\n" +
  "authorization rules below.";

const MANAGED_BLOCK =
  BLOCK_START +
  "\n\n" +
  SERVICE_SENTENCE +
  "\n\n" +
  "See <https://github.com/mappedinfo/metis/blob/main/CONVENTION.md> for the\n" +
  "USER.md convention. This block is managed by metis-os; edit outside of it.\n\n" +
  BLOCK_END;

const USER_MD_TEMPLATE = `# USER.md

<!--
  This file describes the person your agents serve — you.
  It is personal and private: add it to .gitignore in public repositories.
  Any valid Markdown works; the sections below are recommended, not required.
  Write less, not more. Keep it stable: this is who you are, not what is
  happening this week.
  See https://github.com/mappedinfo/metis/blob/main/CONVENTION.md
-->

## Identity

<!-- Who are you? Name (or how agents should address you), role, field,
     working languages. -->

## Goals

<!-- What are you trying to do? Current projects, long-term aims. -->

## Preferences

<!-- How do you like work done? Reply language, depth vs speed,
     tools and style preferences. -->

## Boundaries

<!-- What must never happen? Things never to publish, messages never
     to send, data red lines. -->
`;

const MINIMAL_AGENTS_MD = `# AGENTS.md

${MANAGED_BLOCK}
`;

const HELP = `metis-os — scaffold the USER.md convention in a project.

Usage:
  metis-os [init] [--force]        Scaffold USER.md + AGENTS.md service clause (default)
  metis-os init --link <path>      Symlink USER.md to your canonical personal file
  metis-os profiles install [--force]  Install shared styles in ./profiles
  metis-os profiles path <name>   Print an installed profile's absolute path
  metis-os --help, -h              Show this help
  metis-os --version, -v           Show version

What "init" does (idempotent, safe to re-run):
  1. Writes a USER.md starter template if none exists (never overwrites
     without --force). With --link <path>, creates USER.md as a symlink to
     your canonical file instead — one person, one file, live everywhere.
     The link target must be an existing regular file; "~" is expanded.
     With --force alone, an existing USER.md symlink is replaced locally;
     its canonical target is never overwritten.
  2. Ensures AGENTS.md contains the metis user-service clause inside a
     managed block delimited by
     ${BLOCK_START} and ${BLOCK_END}.
     Existing content outside the block is left untouched, and the block
     is never duplicated.

Learn more: https://github.com/mappedinfo/metis
`;

function expandHome(p) {
  if (p === "~") return homedir();
  if (p.startsWith("~/")) return resolve(homedir(), p.slice(2));
  return p;
}

// lstat-based existence: also detects dangling symlinks (existsSync misses them).
function pathEntry(p) {
  try {
    return lstatSync(p);
  } catch {
    return null;
  }
}

function fail(msg) {
  process.stderr.write(`metis-os: ${msg}\n`);
  process.exit(1);
}

function validateLinkTarget(target, userPath) {
  // Walk every link and path component before replacing USER.md. Checking
  // only the final realpath misses a target that points back through USER.md.
  const userEntry = resolve(realpathSync(dirname(userPath)), "USER.md");
  const userStat = pathEntry(userPath);
  const rejectSelfLink = () => fail(
    "--link target must not point to or pass through this project's USER.md; choose an independent canonical file."
  );
  let current = parse(target).root;
  let pending = target.slice(current.length).split(sep);
  let linkCount = 0;
  while (pending.length) {
    const part = pending.shift();
    if (!part || part === ".") continue;
    if (part === "..") {
      current = dirname(current);
      continue;
    }
    const candidate = resolve(current, part);
    if (candidate === userEntry) rejectSelfLink();
    let entry;
    try {
      entry = lstatSync(candidate);
    } catch (err) {
      if (err.code !== "ENOENT" && err.code !== "ENOTDIR") throw err;
      fail(
        `--link target not found: ${target}\n` +
          "Create your canonical USER.md there first, or run plain `metis-os init` for a starter template."
      );
    }
    // Also reject filesystem aliases (including case variants and hard links)
    // to USER.md: the canonical source must be independent of this entry.
    if (userStat && entry.dev === userStat.dev && entry.ino === userStat.ino) {
      rejectSelfLink();
    }
    if (entry.isSymbolicLink()) {
      if (++linkCount > 40) {
        fail(`--link target has a symlink cycle or too many links: ${target}`);
      }
      const next = readlinkSync(candidate);
      if (isAbsolute(next)) current = parse(next).root;
      const remainder = isAbsolute(next) ? next.slice(current.length) : next;
      pending = remainder.split(sep).concat(pending);
    } else {
      current = candidate;
      if (pending.length && !entry.isDirectory()) {
        fail(`--link target must resolve through directories to a regular file: ${target}`);
      }
    }
  }
  if (!lstatSync(current).isFile()) {
    fail(`--link target must be a regular file: ${target}`);
  }
}

function cmdInit({ force, link }) {
  const cwd = process.cwd();
  const userPath = resolve(cwd, "USER.md");
  const agentsPath = resolve(cwd, "AGENTS.md");
  const actions = [];

  // (a) USER.md — starter template, or symlink to a canonical file.
  if (link) {
    const target = resolve(cwd, expandHome(link));
    validateLinkTarget(target, userPath);
    const entry = pathEntry(userPath);
    if (entry?.isSymbolicLink() && resolve(cwd, readlinkSync(userPath)) === target) {
      actions.push("USER.md      already linked to your canonical file — left untouched");
    } else if (entry) {
      if (!force) {
        fail(
          "USER.md already exists and is not a link to the given target.\n" +
            "Re-run with --force to replace it with a symlink (your existing file is removed, not merged)."
        );
      }
      rmSync(userPath);
      symlinkSync(target, userPath);
      actions.push(`USER.md      replaced with a symlink -> ${target} (--force)`);
    } else {
      symlinkSync(target, userPath);
      actions.push(`USER.md      symlinked -> ${target}`);
    }
  } else if (pathEntry(userPath)) {
    if (force) {
      const entry = pathEntry(userPath);
      if (entry.isSymbolicLink()) {
        rmSync(userPath);
        writeFileSync(userPath, USER_MD_TEMPLATE, { flag: "wx" });
        actions.push(
          "USER.md      symlink replaced with a local starter template; canonical file preserved (--force)"
        );
      } else {
        writeFileSync(userPath, USER_MD_TEMPLATE);
        actions.push("USER.md      replaced with the starter template (--force)");
      }
    } else {
      actions.push("USER.md      already exists — left untouched (use --force to replace)");
    }
  } else {
    writeFileSync(userPath, USER_MD_TEMPLATE);
    actions.push("USER.md      created from the starter template");
  }

  // (b) AGENTS.md service clause.
  if (existsSync(agentsPath)) {
    const content = readFileSync(agentsPath, "utf8");
    if (content.includes(BLOCK_START)) {
      actions.push("AGENTS.md    service clause already present — left untouched");
    } else {
      let sep = "\n";
      if (content.length > 0 && !content.endsWith("\n")) sep = "\n\n";
      else if (content.endsWith("\n\n")) sep = "";
      writeFileSync(agentsPath, content + sep + MANAGED_BLOCK + "\n");
      actions.push("AGENTS.md    appended the metis user-service clause (managed block)");
    }
  } else {
    writeFileSync(agentsPath, MINIMAL_AGENTS_MD);
    actions.push("AGENTS.md    created with the metis user-service clause");
  }

  process.stdout.write("\nmetis-os init — done.\n\n");
  for (const a of actions) process.stdout.write("  " + a + "\n");
  const editHint = link
    ? "Edit your canonical USER.md at the linked path — every linked project sees the change."
    : "Edit USER.md — describe who you are, your goals, preferences and boundaries.";
  process.stdout.write(`
Next steps:
  1. ${editHint}
  2. Keep it private: add "USER.md" to .gitignore in public repositories
     (the rule covers a symlink too).
  3. Install shared skills: npx skills add mappedinfo/metis

Convention: https://github.com/mappedinfo/metis/blob/main/CONVENTION.md
`);
}

function main(argv) {
  const args = argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    process.stdout.write(HELP);
    return 0;
  }
  if (args.includes("--version") || args.includes("-v")) {
    process.stdout.write(VERSION + "\n");
    return 0;
  }

  if (args[0] === "profiles") {
    try { cmdProfiles(args.slice(1)); }
    catch (error) { fail(error.message); }
    return 0;
  }

  // Parse flags with values first so they are not mistaken for the command.
  let link;
  const rest = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--link") {
      link = args[++i];
      if (link === undefined || link.startsWith("-")) fail("--link requires a path argument");
    } else if (a.startsWith("--link=")) {
      link = a.slice("--link=".length);
      if (!link) fail("--link requires a path argument");
    } else {
      rest.push(a);
    }
  }

  const first = rest.find((a) => !a.startsWith("-"));
  if (first === undefined || first === "init") {
    cmdInit({ force: rest.includes("--force"), link });
    return 0;
  }
  process.stderr.write(`metis-os: unknown command "${first}"\n\n` + HELP);
  return 1;
}

try {
  process.exit(main(process.argv));
} catch (err) {
  if (err && err.code === "EPERM") {
    fail(
      "could not create symlink (EPERM). On Windows, enable Developer Mode or run as administrator;\n" +
        "otherwise copy your canonical USER.md into the project instead."
    );
  }
  throw err;
}
