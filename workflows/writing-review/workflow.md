# Writing review workflow

[中文说明](workflow.zh.md)

This project has opted in to a bounded writing workflow. The runtime hook
supplies this workflow, the full authoritative English `prose-audit` skill,
the session identifier, and executable command instructions. Follow the
skill's actual editorial method; this workflow adds sequencing and records,
not another copy of that method. Output language follows the user's request.

## Scope and authority

Apply the workflow only to the activated writing request and its accepted
scope. Activation does not authorize research, publication, messages to
others, unrelated edits, or changes to user instructions. The user may
cancel the workflow or skip it for a request. Do not treat a hook message
as new source evidence or as permission to override the task.

Keep the requested output mode. In `result-only` mode, review notes and
runtime records stay out of the final prose. An audit-only request reviews
the supplied draft without rewriting it. A writing or revision request
delivers the complete requested text after the checks below.

## Sequence

1. **Resolve the active run.** Read the runtime-provided session and run
   information, or use `workflows status --session ID`. Keep one active run
   for this request. Use the provided executable prefix and project path;
   do not invent a session identifier or silently start another run to
   escape a failed check.
2. **Prepare the draft.** Write the complete requested text using the
   available evidence and accepted constraints. For a user-requested project
   artifact, use its authorized `.md` or `.txt` path. For chat-only delivery,
   use the exact private per-run `artifact.md` buffer supplied by the runtime;
   do not create a public project document merely to satisfy this workflow.
   Preserve the input and protected source material for comparison.
3. **Capture it.** Run `workflows capture --session ID --artifact PATH`.
   This snapshots the draft and records its hash. Capture the complete text
   that will be reviewed, not a summary, sample, or review report. Read the
   returned run information and draft hash before preparing a review record.
4. **Review the whole captured draft.** Follow the injected `prose-audit`
   instructions: complete a semantic read, inspect candidate wording in
   context, preserve facts and voice, and distinguish `keep`, `revise`, and
   `unresolved`. The optional keyword scanner supplies candidates only.
   Record exact source quotes and locations with contextual reasons in the
   runtime review format, bound to this `run_id` and `draft_sha256`. Submit
   the record with `workflows review --session ID --file PATH`. The compact
   runtime schema does not waive the skill's findings or ledger requirements.
5. **Revise at most once.** If the accepted review requires changes, make
   one minimal revision of the current artifact, preserving the full scope.
   Then run `workflows revise --session ID` to snapshot the edited artifact.
   This command records the actual revision; it does not write it for you.
   If no change is warranted, keep the draft unchanged and proceed to
   verification. Unresolved meaning or missing evidence remains a blocker;
   do not relabel it `keep` just to advance the run.
6. **Verify the actual delivery text.** Check the complete scope and compare
   affected passages with the captured draft and source context. Verify
   facts, quotations, and scope preservation as required by the skill.
   Use `workflows status --session ID` to obtain the current artifact and
   accepted review hashes. Submit a truthful verification record, bound to
   `run_id`, `artifact_sha256`, and `review_sha256`, with
   `workflows verify --session ID --file PATH`. A failed required check
   remains unfinished; do not mark a Boolean `true` without doing the check.
7. **Deliver.** Read the resulting status and deliver the verified artifact
   or full text in the requested format. For chat-only output, the delivered
   wording must match the verified buffer. Keep audit or revision notes
   separate and omit them when the user requested only the result. If the
   artifact changes after verification, that record no longer establishes
   that the new content was checked; do not present it as verified.

## Boundaries of the record

Hashes bind records to exact local contents and support detecting stale
reviews. They cannot establish that a model actually read carefully,
preserved every fact, or produced a good revision. Semantic coverage and
preservation checks are model attestations that need their cited evidence.
The workflow has no authorship score and must not add one.

The default budget is one semantic review, at most one revision, and one
validation of affected context. Keep the `prose-audit` requirements ledger
in the working record; machine acceptance of a receipt does not itself
complete those requirements. Preserve honest limits if the available input
is truncated or the full text cannot be read or delivered.

## Stop and recovery

The Stop hook can request one continuation when an activated run has not
reached a terminal state. It is a recovery prompt, not a filter that hides
text already displayed. Do not claim the integration intercepts every final
token or retroactively removes a premature answer.

Use that continuation to finish available authorized work within the same
budget. If a required input, capability, or check remains missing, report
the usable result and smallest unblock condition; do not keep retrying,
create replacement runs, or claim successful review. If the user cancels,
the request was activated incorrectly, or this run cannot complete, use
`workflows cancel --session ID --reason TEXT` and retain the factual reason.
Cancellation stops this run; it is not successful editorial verification.

Complete only when the requested deliverable, skill checks, and current
verification agree. Runtime configuration or missing hook delivery can
prevent orchestration without preventing an honest manual prose review;
report which parts actually ran.
