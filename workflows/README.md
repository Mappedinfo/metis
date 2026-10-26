# metis workflows

[中文说明](README.zh.md)

Workflows connect a task to ordered skill use and a small local execution
record. They are project-level, opt-in integrations. Installing a skill
alone does not install hooks or enable a workflow.

| Workflow | Sequence | Editorial capability |
|---|---|---|
| [writing-review](writing-review/workflow.md) | Writing request → draft → semantic review → at most one revision → verification → delivery | [prose-audit](../skills/prose-audit/SKILL.md) |

The workflow entry is independent of the skill. A runtime hook injects
`workflow.md`, the Chinese source and English translation of shared writing
judgment, and both complete `prose-audit` processing guides, recording
each guide's source hash. The Chinese and English guides share review
requirements and supply methods written for their respective languages.
`SKILL.md` remains the skill's sole discovery entry; its filename does not
give English semantic priority. Select the method from the actual prose,
independently of the request language, report language and genre. For mixed
prose, use the relevant method by passage with one coverage record and
budget. Do not maintain a second copied `SKILL.md` under a workflow.
The article's scenario owner retains complete delivery responsibility; situation,
organization and review are reusable internal modules. This workflow adapts checks
and records for the existing writing task, without selecting another owner or
adding a revision budget.

## Install in a project

Use the source checkout for this implementation; these commands do not
establish that the feature is available in a published npm release. Prepare
the runtime bundles in the metis checkout:

```bash
npm ci
npm run skills:bundle
npm run workflows:bundle
```

Then install into the target project:

```bash
node /path/to/metis/packages/metis-os/bin/metis-os.js workflows install writing-review --runtime codex --project /path/to/project --activation auto
```

Use `--runtime dsh` to generate the DSH adapter. Set `--activation explicit`
when each request should opt in individually. A fresh installation defaults
to `auto`; reinstalling without that flag preserves the existing mode.
`--project` is optional and defaults to the current directory. This installs a project integration,
not a global hook or a recurring job.

Project configuration is stored in `.metis/workflows.json`. Runtime state
and machine-specific adapter exports remain private under `.metis/`.
The installer adds ignore rules for `state/` and `adapters/` in
`.metis/.gitignore`; the portable workflow configuration may be committed.
Do not commit captured drafts or local run records merely because the
workflow finished.

### Codex

The installer merges its managed `UserPromptSubmit` and `Stop` entries into
`.codex/hooks.json`, preserving unrelated hooks. The generated command uses
a machine-local executable path, so `.codex/.gitignore` excludes
`hooks.json`. Existing project instructions and other hooks keep their
independent meaning. Review and trust the generated hooks through `/hooks`
in Codex, then verify a new writing request. Confirm the runtime actually
loads the project hooks; installation success alone is not a live integration test.

### DSH

The installer produces `.metis/adapters/dsh/hooks.json` and
`.metis/adapters/dsh/cordis.patch.yml`. The generated Cordis patch configures
`@deepseek-ai/dsh-hooks-codex` with `configPath` pointing to the hook export.
Load that patch
through the DSH instance's supported configuration mechanism when authorized.
metis does not edit the live DSH patch, restart the host, or interrupt active
sessions. Generated files establish adapter preparation, not live loading.

## Activation

An enabled project uses one of two activation modes:

- `auto`: a finite set of Chinese and English writing-request patterns can
  activate the workflow. This is a convenience matcher, not a complete
  language or intent classifier; both missed matches and false matches are
  possible.
- `explicit`: only the request marker activates it.

To activate it deliberately, put this marker on the first line:

```text
[metis:writing-review]
Revise the following release note. Return only the revised text.
```

To skip it for a request, put this marker on the first line:

```text
[metis:skip-writing-review]
Explain how the following parser works.
```

The skip marker takes precedence for that request. A request marker does
not replace project opt-in or install missing hooks. Markers change workflow
routing, not the task's permissions. Automatic matching does not authorize
publishing, sending, or unrelated writes.

## The local lifecycle

The hook supplies the real session identifier, current run, private draft
buffer, and complete executable commands. Use those values. The command
forms below omit the source CLI prefix for readability; append
`--project PATH` when the working directory is not the target project.

| Command | Effect |
|---|---|
| `workflows status --session ID` | Inspect the current run, state, paths, and hashes. |
| `workflows capture --session ID --artifact PATH` | Snapshot the draft and bind its content to the run. |
| `workflows review --session ID --file JSON` | Submit a full-coverage semantic-review record for the captured draft. |
| `workflows revise --session ID` | Snapshot the current edited artifact; allow at most one revision. |
| `workflows verify --session ID --file JSON` | Submit preservation checks bound to the artifact and accepted review. |
| `workflows cancel --session ID --reason TEXT` | End the run with its actual cancellation reason. |

The agent drafts first, captures that draft, reads the complete text, and
submits contextual findings. Findings can be `keep`, `revise`, or
`unresolved`. Each finding's exact quote must occur in the captured draft.
The agent must inspect whether its location and explanation identify the
right passage; finding the same string is not semantic validation.

If revision is needed, the agent edits the artifact and captures that
revision once. A review with no required changes may verify the unchanged
draft, including a truthful review with no findings. Unresolved findings
block completion. Neither a keyword scan nor an empty finding list is a
substitute for reading the full text.

The normal states are `drafting` → `drafted` → `reviewed` → `revised`
(when needed) → `ready`. `blocked` and `cancelled` are distinct outcomes.
`status` returns `ready: true` only when the stored artifact and review and
verification records still agree; this is record validity, not proof of
editorial quality.

### Files and chat-only delivery

Artifacts are UTF-8 `.md` or `.txt` files inside the project. The runtime
validates the actual path; do not use a symlink or traversal to move this
work outside the allowed project boundary. The private state store is:

```text
.metis/state/writing-review/<session-hash>/runs/<run-id>/
```

For chat-only writing, use the exact current run's private `artifact.md`
buffer supplied by the hook. This lets the workflow check a complete draft
without creating a public project document. The exception permits this
specific buffer, not arbitrary files in another run or elsewhere in state.

Return the verified buffer's text in the final answer. Keep audit notes and
checks out of `result-only` prose. A different final chat response is not
automatically covered by the buffer's verification; the adapter does not
compare or filter every token of the final stream.

## What records establish

Review records identify `schema_version`, `run_id`, `draft_sha256`,
`coverage: "full"`, findings, and a summary. Findings identify an exact
quote, location, contextual reason, and decision. Verification records bind
`run_id`, `artifact_sha256`, and `review_sha256` to checks for full text,
facts, quotations, and scope preservation, plus notes. Follow the record
format provided by the runtime; do not add authorship scores.

Hashes let the local implementation reject a stale record or detect changed
artifact content. They do not prove a semantic read, factual accuracy,
faithful voice, or editorial quality. `coverage: "full"` and preservation
Booleans are model attestations; the model must perform the corresponding
checks. The skill's contextual evidence and requirements ledger remain
necessary even when the machine accepts a record.

## Stopping and recovery

The semantic budget is one complete review, at most one revision, and one
check of affected context. If the run is still incomplete when the agent
stops, the Stop hook can request one continuation. It cannot retract or
hide text already shown, and it is not a pre-delivery token filter.

After the allowed continuation, unfinished work remains unfinished. Inspect
`status` and report the completed parts and smallest unblock condition.
If a mistaken trigger or missing prerequisite makes the run inapplicable or
impossible to finish, cancel it with the real reason. Cancellation and
budget exhaustion are not successful verification. DSH may not display every
nonblocking hook warning; the durable run status is the authoritative local
record of what completed.

Source schemas and state checks establish local behavior, not successful
loading by an actual Codex or DSH session. Test a bounded writing request in
the selected runtime before claiming end-to-end operation.

## Remove an adapter

```bash
node /path/to/metis/packages/metis-os/bin/metis-os.js workflows uninstall --runtime codex --project /path/to/project
```

Choose `--runtime dsh` for the DSH export. Uninstall removes the selected
adapter's managed hook entries while preserving foreign hooks and local
review history. The project workflow is disabled when its last installed
adapter is removed. An unchanged generated DSH patch is removed; edited
patches are preserved. Remove a loaded DSH mount
separately through that instance's authorized configuration process.

If someone changed a managed entry after installation, reconcile it before
reinstalling or uninstalling; the installer will not guess which foreign
content to replace. Moving the source checkout also changes generated
absolute commands, so reinstall from the intended checkout and recheck
runtime loading.
