# Writing review workflow

The opt-in `writing-review` workflow connects a writing request to
`prose-audit`: prepare a draft, read it in full, make at most one revision,
verify the result, and deliver the requested text. It is a project
integration, separate from installing the skill.

The hook injects the workflow entry, both versions of shared writing judgment,
and both complete `prose-audit` processing guides, recording a source hash
for each guide. The English and
Chinese guides share review requirements and are authored for their
respective languages. Select the method from the actual prose; request
language, report language and genre remain separate choices. Mixed prose
uses the relevant method by passage, with one coverage record and budget.
The writing scenario keeps responsibility from situation and organization to
final delivery; this review adapter adds no router, scenario or review pass.
See the complete
[workflow guide](https://github.com/mappedinfo/metis/blob/main/workflows/README.md)
or [中文说明](https://github.com/mappedinfo/metis/blob/main/workflows/README.zh.md).

## Install from source

Use the source checkout for this feature; local source availability does
not establish npm publication. In the metis checkout, prepare the runtime
bundles with `npm run skills:bundle` and `npm run workflows:bundle`, then install:

```bash
node /path/to/metis/packages/metis-os/bin/metis-os.js workflows install writing-review --runtime codex --project /path/to/project --activation auto
```

Use `--runtime dsh` for a DSH adapter or `--activation explicit` to require
a request marker. `--project` defaults to the current directory.

- **Codex:** merges managed `UserPromptSubmit` and `Stop` hooks into
  `.codex/hooks.json`, preserving unrelated entries. Review and trust them
  through `/hooks` before testing a new request.
- **DSH:** generates `.metis/adapters/dsh/hooks.json` and `cordis.patch.yml`
  for `@deepseek-ai/dsh-hooks-codex` with `configPath`. Loading the patch is a separate authorized step;
  the installer does not change live DSH configuration or restart it.

Portable project opt-in lives in `.metis/workflows.json`. Captured text and
execution state remain under the ignored `.metis/state/`; generated local
adapter paths are also ignored. Installing does not prove a live runtime
loaded the integration.

## Choose requests

`auto` uses a finite set of Chinese and English writing-request patterns.
For a deliberate activation, start the prompt with:

```text
[metis:writing-review]
Revise this paragraph and return only the revised text.
```

For a one-request opt-out, use `[metis:skip-writing-review]` on the first
line. Markers affect routing in an enabled project; they do not grant
additional permissions. Automatic matching can miss a writing request or
activate on an unintended one.

## Check the result

The runtime provides session-specific commands to capture the draft,
submit a semantic review, record one revision if needed, and verify exact
artifact and review hashes. Use `workflows status --session ID` with the
source CLI prefix to inspect the current local run.

For chat-only writing, the agent uses the current run's private
`artifact.md` buffer and returns that verified text. A `result-only`
request keeps review records out of the final prose. The workflow does not
require a public project document for an ordinary chat response.

Hashes bind records to content; they do not prove that the agent read or
reasoned well. Full-text coverage and preservation checks remain model
attestations backed by the skill's contextual review. The system reports
wording defects, never AI-authorship probabilities.

An incomplete run can receive one Stop-hook continuation. That prompt
cannot hide text already displayed or guarantee that every final token
matches the verified buffer. Unfinished or cancelled runs remain distinct
from successful verification. Read the
[execution entry](https://github.com/mappedinfo/metis/blob/main/workflows/writing-review/workflow.md)
for the bounded sequence and recovery rules.

Use `workflows uninstall --runtime codex|dsh --project PATH` with the source
CLI prefix to remove a selected adapter. Its managed entries are removed;
foreign hooks and local history are preserved. A loaded DSH patch must be
removed from the host configuration separately.
