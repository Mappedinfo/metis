import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const cli = fileURLToPath(new URL("../bin/metis-os.js", import.meta.url));
const original = "# USER.md\nKeep these personal preferences intact.\n";

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "metis-init-test-"));
  const project = join(root, "project");
  mkdirSync(project);
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return {
    root,
    project,
    user: join(project, "USER.md"),
    agents: join(project, "AGENTS.md"),
    run: (...args) => spawnSync(process.execPath, [cli, ...args], {
      cwd: project,
      encoding: "utf8",
      timeout: 10_000,
    }),
  };
}

function succeeds(result) {
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
}

function rejects(result, message) {
  assert.equal(result.error, undefined);
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stderr, message);
}

test("plain init preserves personal content and appends the service clause once", (t) => {
  const f = fixture(t);
  writeFileSync(f.agents, "# Project rules\nKeep existing instructions.\n");
  succeeds(f.run("init"));
  assert.match(readFileSync(f.user, "utf8"), /## Identity/);
  writeFileSync(f.user, original);
  const agents = readFileSync(f.agents, "utf8");
  succeeds(f.run("init"));
  assert.equal(readFileSync(f.user, "utf8"), original);
  assert.equal(readFileSync(f.agents, "utf8"), agents);
  assert.match(agents, /^# Project rules\nKeep existing instructions\.\n/);
  assert.equal(agents.split("<!-- metis:user-service:start -->").length, 2);
});

test("plain --force still replaces an ordinary local file", (t) => {
  const f = fixture(t);
  writeFileSync(f.user, original);
  succeeds(f.run("init", "--force"));
  assert.equal(lstatSync(f.user).isSymbolicLink(), false);
  assert.match(readFileSync(f.user, "utf8"), /## Identity/);
});

test("link initialization and repeated init preserve the canonical file", (t) => {
  const f = fixture(t);
  const canonical = join(f.root, "canonical.md");
  writeFileSync(canonical, original);
  succeeds(f.run("init", "--link", canonical));
  const link = readlinkSync(f.user);
  succeeds(f.run("init"));
  succeeds(f.run("init", "--link", canonical));
  succeeds(f.run("init", "--link", canonical, "--force"));
  assert.equal(readlinkSync(f.user), link);
  assert.equal(readFileSync(canonical, "utf8"), original);
});

test("plain --force replaces only the local link and preserves shared canonical content", (t) => {
  const f = fixture(t);
  const canonical = join(f.root, "canonical.md");
  const anotherProject = join(f.root, "another-project");
  mkdirSync(anotherProject);
  writeFileSync(canonical, original);
  symlinkSync(canonical, join(anotherProject, "USER.md"));
  succeeds(f.run("init", "--link", canonical));
  succeeds(f.run("init", "--force"));
  assert.equal(lstatSync(f.user).isSymbolicLink(), false);
  assert.match(readFileSync(f.user, "utf8"), /## Identity/);
  assert.equal(readFileSync(canonical, "utf8"), original);
  assert.equal(readFileSync(join(anotherProject, "USER.md"), "utf8"), original);
});

test("plain --force replaces a dangling link without creating its target", (t) => {
  const f = fixture(t);
  const missing = join(f.root, "missing.md");
  symlinkSync(missing, f.user);
  succeeds(f.run("init", "--force"));
  assert.equal(lstatSync(f.user).isSymbolicLink(), false);
  assert.equal(existsSync(missing), false);
});

test("--link rejects direct self-reference before removing the original", (t) => {
  const f = fixture(t);
  writeFileSync(f.user, original);
  rejects(f.run("init", "--link", "./USER.md", "--force"), /must not point to or pass through/);
  assert.equal(readFileSync(f.user, "utf8"), original);
  assert.equal(lstatSync(f.user).isSymbolicLink(), false);
  assert.equal(existsSync(f.agents), false);
});

test("--link rejects a relative symlink chain through the local USER.md", (t) => {
  const f = fixture(t);
  writeFileSync(f.user, original);
  symlinkSync("project/USER.md", join(f.root, "second.md"));
  symlinkSync("second.md", join(f.root, "first.md"));
  rejects(f.run("init", "--link", "../first.md", "--force"), /must not point to or pass through/);
  assert.equal(readFileSync(f.user, "utf8"), original);
  assert.equal(readFileSync(join(f.root, "first.md"), "utf8"), original);
});

test("--link rejects paths through a symlinked project directory", (t) => {
  const f = fixture(t);
  writeFileSync(f.user, original);
  symlinkSync(f.project, join(f.root, "project-alias"));
  rejects(f.run("init", "--link", "../project-alias/USER.md", "--force"), /must not point to or pass through/);
  assert.equal(readFileSync(f.user, "utf8"), original);
});

test("--link rejects a target that goes through an existing USER.md link", (t) => {
  const f = fixture(t);
  const canonical = join(f.root, "canonical.md");
  writeFileSync(canonical, original);
  symlinkSync(canonical, f.user);
  symlinkSync("project/USER.md", join(f.root, "alias.md"));
  rejects(f.run("init", "--link", "../alias.md", "--force"), /must not point to or pass through/);
  assert.equal(readlinkSync(f.user), canonical);
  assert.equal(readFileSync(canonical, "utf8"), original);
});

test("--link rejects a target inside a directory currently linked as USER.md", (t) => {
  const f = fixture(t);
  const canonicalDir = join(f.root, "canonical");
  mkdirSync(canonicalDir);
  const canonical = join(canonicalDir, "person.md");
  writeFileSync(canonical, original);
  symlinkSync(canonicalDir, f.user);
  rejects(f.run("init", "--link", "./USER.md/person.md", "--force"), /must not point to or pass through/);
  assert.equal(readlinkSync(f.user), canonicalDir);
  assert.equal(readFileSync(canonical, "utf8"), original);
});

test("--link rejects directories and missing targets before replacing USER.md", (t) => {
  const f = fixture(t);
  writeFileSync(f.user, original);
  rejects(f.run("init", "--link", f.root, "--force"), /must be a regular file/);
  rejects(f.run("init", "--link", "../missing.md", "--force"), /target not found/);
  assert.equal(readFileSync(f.user, "utf8"), original);
  assert.equal(existsSync(f.agents), false);
});

test("--link accepts a symlink chain to an independent regular file", (t) => {
  const f = fixture(t);
  const canonical = join(f.root, "canonical.md");
  writeFileSync(canonical, original);
  symlinkSync("canonical.md", join(f.root, "second.md"));
  symlinkSync("second.md", join(f.root, "first.md"));
  succeeds(f.run("init", "--link", "../first.md"));
  assert.equal(readFileSync(f.user, "utf8"), original);
  assert.equal(readFileSync(canonical, "utf8"), original);
});

test("--link rejects cycles without replacing existing content", (t) => {
  const f = fixture(t);
  writeFileSync(f.user, original);
  symlinkSync("second.md", join(f.root, "first.md"));
  symlinkSync("first.md", join(f.root, "second.md"));
  rejects(f.run("init", "--link", "../first.md", "--force"), /symlink cycle or too many links/);
  assert.equal(readFileSync(f.user, "utf8"), original);
});

test("--link rejects case aliases of USER.md on case-insensitive filesystems", (t) => {
  const f = fixture(t);
  writeFileSync(f.user, original);
  if (!existsSync(join(f.project, "user.md"))) {
    t.skip("filesystem is case-sensitive");
    return;
  }
  rejects(f.run("init", "--link", "./user.md", "--force"), /must not point to or pass through/);
  assert.equal(readFileSync(f.user, "utf8"), original);
  const canonical = join(f.root, "canonical.md");
  writeFileSync(canonical, original);
  rmSync(f.user);
  symlinkSync(canonical, f.user);
  rejects(f.run("init", "--link", "./user.md", "--force"), /must not point to or pass through/);
  assert.equal(readlinkSync(f.user), canonical);
  assert.equal(readFileSync(canonical, "utf8"), original);
});
