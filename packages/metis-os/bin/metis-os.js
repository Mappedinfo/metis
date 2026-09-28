#!/usr/bin/env node
// metis-os — scaffold USER.md and the AGENTS.md service clause.
// Zero dependencies, Node >= 18, plain ESM.

import {
  existsSync,
  lstatSync,
  readFileSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";

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
  metis-os --help, -h              Show this help
  metis-os --version, -v           Show version

What "init" does (idempotent, safe to re-run):
  1. Writes a USER.md starter template if none exists (never overwrites
     without --force). With --link <path>, creates USER.md as a symlink to
     your canonical file instead — one person, one file, live everywhere.
     The link target must already exist; "~" is expanded.
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

function cmdInit({ force, link }) {
  const cwd = process.cwd();
  const userPath = resolve(cwd, "USER.md");
  const agentsPath = resolve(cwd, "AGENTS.md");
  const actions = [];

  // (a) USER.md — starter template, or symlink to a canonical file.
  if (link) {
    const target = resolve(cwd, expandHome(link));
    if (!existsSync(target)) {
      fail(
        `--link target not found: ${target}\n` +
          "Create your canonical USER.md there first, or run plain `metis-os init` for a starter template."
      );
    }
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
      writeFileSync(userPath, USER_MD_TEMPLATE);
      actions.push("USER.md      replaced with the starter template (--force)");
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
