[中文说明](citations.zh.md)

# LaTeX attribution and editable comparison tables

Use this module when the accepted task includes LaTeX citation placement or
recovering selectable, annotatable table text. It supplements the existing
semantic review and does not add a review pass. Keep a project's bibliography,
method identities and data in that project.

## Citation checks

Place each study's attribution with the clause it supports. Multiple sources
can support one synthesis; a grouped citation alone does not establish an error.
When a result is reported by a comparison paper, preserve that result's actual
source and page/table locator even if the method's original paper is also cited.

Run the bundled read-only helper on explicit `.tex` files or directories:

```bash
python3 skills/prose-audit/scripts/check_citations.py review --json
```

For an installed skill, resolve the script relative to that skill's directory.
Python 3.10+ and the standard library suffice. Each file/registry must be UTF-8,
without NUL, at most 2,000,000 bytes; each call accepts up to 1000 `.tex` files.
The helper rejects symlink files and does not recursively follow directory
symlinks. Exit `0`: processed, no policy errors (warnings may remain); `1`:
policy errors; `2`: invalid input/configuration. It never rewrites input.

Default behavior surfaces multi-key or adjacent citation commands as **warning
candidates**, with original code-point offsets, line/column and source text.
An explicit project rule can require separate attribution:

```bash
python3 skills/prose-audit/scripts/check_citations.py review --separate-attribution --json
```

Under that policy, a grouped citation requires contextual review. A specific
shared-claim reason may be recorded on the immediately preceding source line:

```tex
% citation-check: shared-claim keys=sample:a,sample:b; reason=Both inspected tables report this same limitation.
The stated synthesis\parencite{sample:a,sample:b}.
```

The marker matches one group with exactly those keys, once. The report preserves
the reason as `documented_not_semantically_verified`; a marker cannot prove
support or exempt an identity check. Unused markers remain warnings.

## Optional project identity policy

Only when the accepted project requires **every occurrence** of a registered
method name to be immediately cited, pass its existing project-owned registry:

```bash
python3 skills/prose-audit/scripts/check_citations.py review --methods scripts/methods.json --json
```

Minimal synthetic registry (no real paper identities are bundled):

```json
{
  "version": 1,
  "methods": [{"names": ["SampleMethod"], "citekeys": ["sample:method", "sample:alias"]}],
  "ambiguous_unmapped": ["UnresolvedName"]
}
```

Additional descriptive fields are ignored; duplicate JSON keys are rejected.
`ambiguous_unmapped` also accepts an object mapping each name to a nonempty
reason, so an existing project registry can be read directly without a copy.
Multiple records can share a name, keeping their candidate keys without choosing
a paper. An ambiguous unmapped name, an unknown variant suffix or an attached
number remains a manual warning. The helper never inserts or substitutes keys.
Confirm the registry against the project's actual bibliography and aliases;
this helper does not resolve BibTeX or establish what a source supports.

Visible titles, short titles and link text are eligible. Common comments, code,
URL/path destinations, labels/references, citation keys, PDF bookmarks and the
bookmark branch of `texorpdfstring` are excluded. Nested common emphasis wrappers
and `protect` before a citation are allowed; a citation outside a title does not
stand in for attribution inside it. Coverage is finite: custom macros, malformed
or unusual TeX, images and unregistered names need manual inspection. This helper
does not detect all delayed attribution, expand includes/macros, or read PDFs.
Zero errors never establishes citation correctness or semantic coverage.

For an existing project adapter, Python API version `1` exposes
`scan(text, filename, methods=None, separate_attribution=False)` (the two policy
arguments are keyword-only) and `source_view(text)`. The latter blanks comments
and verbatim at their original offsets so a project can retain its own finite
language heuristic without duplicating the parser. `API_VERSION` identifies this
contract. Project-only suggestion logic can consume the findings; the public
helper still never applies edits.

## Native comparison tables

When readers need text search, selection or inline annotation, export structured
comparison data as native tables from the existing source. Keep stable row IDs,
cell provenance, citations, units and qualifiers. Escape plain-text cells; reserve
raw TeX for an explicit trusted field. Regenerate derived tables after data edits.
The exporter and workbook schema remain project-specific unless separately
curated; this module does not ship a general XLSX exporter.

After export, check field/citation preservation, wrapping and page breaks, then
verify actual text selection/extraction in the PDF. Native source alone does not
prove the exported PDF is selectable. Test labels against actual inclusion:
deduplicate a macro call and target declaration only when the dispatch proves
they emit one label. Repeated inclusions, mismatches and unrelated duplicate
labels must remain visible. Reuse the project's compiler/audit; do not suppress
all duplicate labels or convert scientific image figures into tables.

## Runtime boundary

`writing-review` supplies the bundled helper path and these conditional commands.
It does not execute the helper, enable a project identity policy, or prove a scan
ran. Existing receipt acceptance covers its captured `.md`/`.txt` artifact, not a
multi-file LaTeX build. Report actual checker calls and results separately; a
missing local Python runtime uses the existing bounded manual fallback. No
additional hooks, watchers, installation or network access is needed.
