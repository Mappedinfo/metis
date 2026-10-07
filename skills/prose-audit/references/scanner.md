[中文译本](scanner.zh.md)

# Local candidate scanner

Read this reference when the local helper is available. Complete the
semantic read required by [the skill](../SKILL.md) first. The helper is a
Python 3.10+ standard-library program: no network calls, package dependencies,
automatic rewriting, external detector, or authorship score. It reads the
input and configuration and writes a report to standard output.

## Run

From the repository root, with a local Python runtime available:

```bash
uv run --offline --no-project python skills/prose-audit/scripts/detect.py draft.md --json
uv run --offline --no-project python skills/prose-audit/scripts/detect.py draft.md --json --genre academic
uv run --offline --no-project python skills/prose-audit/scripts/detect.py draft.md --json --genre explain
uv run --offline --no-project python skills/prose-audit/scripts/detect.py draft.md --json --config thresholds.json
uv run --offline --no-project python skills/prose-audit/scripts/detect.py draft.md --json --include-quotes
```

For an installed skill, resolve `scripts/detect.py` relative to that skill's
directory. `INPUT` is a regular UTF-8 plain-text or Markdown file, at most
2,000,000 bytes. There is no stdin mode or PDF/Word extraction. The script
does not truncate oversized files; it rejects them. Keep any extraction or
chunking outside this helper and record its actual coverage and source map.

Select `--genre` once from the actual writing task. `general` is the default
for unspecified genres, technical documentation and personal prose;
`academic` covers research manuscript prose and academic reviews; `explain`
covers popular science, teaching and spoken/scripted explanations. Language
does not select genre. Callers with separate language profiles can map their
academic/review profiles to `academic` and popular/spoken profiles to `explain`.
For mixed genres, scan already-defined sections separately and retain their
original location map. An unknown genre is rejected.

If local Python or a suitable artifact is unavailable, read the existing
rules once and complete the bounded manual review; record the fallback.
Do not install software, upload text or regenerate an SOP just to run a scan.

Without `--json`, the helper prints a readable candidate report with the
same limitations. Exit `0` means the input was processed, including an empty
input or zero candidates; it does not mean the prose passed review. Exit `2`
means invalid input, configuration, arguments, or a read failure. Fix only
the specific local problem; do not switch to uploading the text elsewhere.

## Rules and thresholds

[scripts/rules.json](../scripts/rules.json) is the executable single source
for the finite vocabulary, explicit forms, small traditional-character fold
table, surface patterns, and default thresholds. The qualitative
[signal guide](signal-guide.md) is not a duplicate machine-readable dictionary.

The rule data is version `2`; report JSON stays at schema version `1` with
additive metadata. Every candidate has `policy_action`: `context` asks for a
contextual decision; `revise` marks a selected writing convention requiring
direct restatement. In `academic`, rhetorical negation/contrast and repeated
negative framing use `revise`; in `explain` and `general` they use `context`.
This is a configured editorial policy, not an error or authorship verdict.
Preserve actual comparisons, quotations and necessary scope/evidence limits.
Internal execution reminders always use `context`. No action edits the input.

These defaults implement a review-queue convention, not empirical cutoffs
for quality or authorship:

| Configuration key | Default | Meaning |
|---|---|---|
| `tier1_document` | 1 | A Tier 1 rule family occurs at least once in the scanned document. |
| `tier2_document` | 4 | A Tier 2 rule family occurs at least four times in the scanned document. |
| `tier2_paragraph` | 3 | A Tier 2 rule family occurs at least three times in one scanned paragraph; this also qualifies it. |
| `tier3_document` | 3 | A Tier 3 rule family occurs at least three times in the scanned document. |

Counts apply **per rule family**, combining that rule's listed aliases and
explicit inflections, including cross-language forms when grouped together.
They are not totals across an entire tier. Overlapping vocabulary matches
use the longest phrase once before counting; equal lengths use the stored
rule order. Thus the separate entries “holistic” and “holistic approach” do
not both count the same occurrence. This convention can omit a shorter
candidate; it is not a semantic judgment about either phrase.

An optional JSON object overrides only the supplied keys:

```json
{
  "tier2_document": 5,
  "tier2_paragraph": 4
}
```

Configuration is at most 16,384 bytes. Values must be positive integers;
unknown or duplicate keys, booleans, strings, fractions, and zero or negative
values are rejected. Record overrides when interpreting results. Raising
thresholds reduces surfaced candidates, not the need for semantic review.

## What matching covers

- Unicode NFKC normalization, case folding, curly-apostrophe folding, and
  the small character-alias table operate on a matching view. The original
  input is unchanged. This is not comprehensive traditional/simplified
  conversion, Chinese segmentation, or English lemmatization.
- English vocabulary uses explicit forms and Latin-word boundaries, so a
  term should not match inside a larger English word. A mixed-language
  passage uses the same rule collection. Multiword forms may span wrapping
  whitespace; uncommon forms and complex syntax can be missed.
- Current surface patterns cover selected split negation, contrast, and
  importance claims in Chinese and English, and consecutive Chinese negative
  framing. The finite vocabulary also locates internal execution reminders.
  Listed strengtheners repeated
  in adjacent approximate sentences within one paragraph generate
  `adjacent_repetition:<id>` candidates, independently of vocabulary
  thresholds. They do not join across a protected span.
- The formatting helper covers `bold_label_list`, not every title style,
  emoji, triad, transition chain, passive, or visual pattern in the guide.
  Semantic loops, false ranges, warranted emphasis, term relevance, and
  evidence quality always require reading. No match proves a defect.

## Protected content and coverage

By default, the helper heuristically excludes YAML frontmatter, fenced and
indented code, inline code, math, HTML comments/tags, URL/link destinations,
reference-definition lines, blockquotes, and paired quotation spans.
Readable Markdown link labels remain eligible. Unclosed frontmatter,
fences, or comments may protect the remainder of a document. This is a
conservative heuristic, not a full Markdown or quotation parser; malformed,
nested, escaped, or unusual constructs may be misclassified.

`--include-quotes` makes recognized blockquotes and paired straight, curly,
and CJK-style quotations eligible again. It does not restore code, math, or
other literal regions and does not authorize editing source quotations.
If Markdown blockquote markers merely wrap the whole supplied draft, save
its body as the input or use the option deliberately. Continue to identify
actual quotations inside the draft during the semantic review.

Protected characters do not contribute to match counts or descriptive
lengths. An all-protected, empty, or unrecognized-language input can yield
`input_status: insufficient_text`; this is not a clean review. Even
`input_status: scanned` can describe a very short excerpt. Inspect the
original input and excluded regions yourself, and state what was actually
reviewed. The helper does not turn partial access into full-text coverage.

## Read the report

The JSON contains:

| Field | Interpretation |
|---|---|
| `schema_version` | Currently `1`. |
| `review_status` | Always `candidate_scan_only`. |
| `context_review_required` | Always `true`, including zero-candidate results. |
| `input_status` | `scanned` or `insufficient_text`; a processing status, not a grade. |
| `genre` / `rules_version` | Selected writing convention and fixed rule-data version. |
| `thresholds` | Effective values after validated overrides. |
| `candidates` | `kind`, `rule_id`, `policy_action`, `message`, and `locations`; vocabulary candidates also have `tier` and `counts`. |
| `statistics` | Descriptive sentence/paragraph lengths, counts, means, population standard deviations, and protected-character count. |
| `limitations` | Interpretation and coverage limits returned with every scan. |

Candidate kinds are `vocabulary`, `syntax`, and `formatting`. Vocabulary
counts include `document` and `paragraph_max`. Each location includes
`start`, `end`, `text`, `line`, `column`, `end_line`, and `end_column`.
Offsets are zero-based Unicode **code-point** positions in the original
input, with an exclusive end: `original[start:end] == text`. They are not
UTF-8 byte or UTF-16 editor offsets. Lines and columns are one-based; a BOM
counts as an original character and CRLF as one line break. Use the original
quoted `text`, not the normalized match, in a finding.

Length units are approximately Han characters plus normalized ASCII
English tokens, including internal apostrophes. Digits and protected spans
do not count as units. Blank lines approximate paragraphs; punctuation and
line breaks approximate sentences, so abbreviations, line wrapping, other
languages, and complex markup can distort the figures. Empty length lists
have `null` means and standard deviations. There is no length threshold,
burstiness verdict, combined suspicion score, or textual quality grade.

After scanning, confirm or dismiss candidates in context, merge duplicates,
and record only justified findings in the editorial review. Use original
spans and nearby context for local revision, then check the changed passages
once; do not rebuild a word list or reread unrelated instructions per hit.
Keep execution checks outside the exported prose. Preserve the
true distinction between scanner completion and completed semantic review.
