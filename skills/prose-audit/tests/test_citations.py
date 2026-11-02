"""Synthetic behavior tests for the portable, optional LaTeX identity policy."""
import contextlib
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest

SCRIPT = Path(__file__).parents[1] / "scripts/check_citations.py"
spec = importlib.util.spec_from_file_location("citations", SCRIPT)
citations = importlib.util.module_from_spec(spec)
spec.loader.exec_module(citations)
REGISTRY = {"version": 1, "methods": [
    {"names": ["SampleA"], "citekeys": ["sample:a", "alias:a"]},
    {"names": ["SampleB", "SampleB-ne"], "citekeys": ["sample:b"]},
    {"names": ["SharedName"], "citekeys": ["sample:c"]},
    {"names": ["SharedName"], "citekeys": ["sample:d"]},
], "ambiguous_unmapped": ["UnresolvedNet"]}


class Citations(unittest.TestCase):
    def methods(self, text):
        return [f for f in citations.scan(text, methods=REGISTRY)["findings"] if f["method"]]

    def test_group_policy_is_opt_in_and_separate_clauses_pass(self):
        text = r"One statement\citep[see][p. 2]{a,b}"
        self.assertEqual(citations.scan(text)["findings"][0]["severity"], "warning")
        self.assertEqual(citations.scan(text, separate_attribution=True)["findings"][0]["severity"], "error")
        self.assertEqual(citations.scan(r"One\citep{a}; two\citep{b}")["findings"], [])
        self.assertEqual(citations.scan(r"Together\citep{a}\parencite{b}")["findings"][0]["keys"], ["a", "b"])

    def test_explicit_shared_claim_is_local_key_exact_and_single_use(self):
        marker = "% citation-check: shared-claim keys=a,b; reason=Both sources support this stated claim.\n"
        result = citations.scan(marker + r"Claim\citep{a,b}. Next\citep{a,b}.", separate_attribution=True)
        self.assertEqual(len(result["exceptions"]), 1)
        self.assertEqual(len(result["findings"]), 1)
        for text in [marker + r"Claim\citep{a,c}", marker + "\n" + r"Claim\citep{a,b}"]:
            self.assertTrue(any(f["severity"] == "error" for f in citations.scan(text, separate_attribution=True)["findings"]))

    def test_comments_code_nocite_and_escaped_percent(self):
        text = ("% \\citep{a,b}\n" + r"\begin{verbatim}\citep{a,b}\end{verbatim}"
                + r"\verb|\citep{a,b}| \texttt{\citep{a,b}} \nocite{a,b}")
        self.assertEqual(citations.scan(text)["findings"], [])
        self.assertEqual(len(citations.scan(r"50\%\citep{a,b}")["findings"]), 1)

    def test_comment_after_escaped_percent_and_verbatim_marker(self):
        self.assertEqual(citations.scan(r"50\% complete % hidden \citep{a,b}")["findings"], [])
        marker = "% citation-check: shared-claim keys=a,b; reason=Example only.\n"
        sample = "\\begin{verbatim}\n" + marker + "\\end{verbatim}\n" + r"Claim\citep{a,b}"
        self.assertEqual(citations.scan(sample, separate_attribution=True)["exceptions"], [])

    def test_every_occurrence_requires_immediate_identity_only_when_configured(self):
        text = r"SampleA\citep{sample:a}. SampleA uses observations\citep{sample:a}."
        self.assertEqual(citations.scan(text)["findings"], [])
        findings = self.methods(text)
        self.assertEqual([f["rule"] for f in findings], ["missing-method-citation"])
        self.assertEqual(text[findings[0]["start"]:findings[0]["end"]], "SampleA")

    def test_wrong_key_alias_and_same_name_identities(self):
        self.assertEqual(self.methods(r"SampleA\citep{alias:a} SharedName\citep{sample:d}"), [])
        self.assertEqual(self.methods(r"SampleA\citep{sample:b}")[0]["rule"], "method-key-mismatch")
        self.assertEqual(self.methods("SharedName")[0]["keys"], ["sample:c", "sample:d"])
        self.assertEqual(self.methods("UnresolvedNet")[0]["severity"], "warning")
        config = {**REGISTRY, "ambiguous_unmapped": {"UnresolvedNet": "Implementation not established."}}
        self.assertEqual(citations.scan("UnresolvedNet", methods=config)["findings"][0]["rule"], "ambiguous-method")

    def test_visible_titles_links_and_nested_formatting(self):
        self.assertEqual(self.methods(r"\emph{\textbf{SampleA}}\protect\citep[see]{sample:a}"), [])
        self.assertEqual(len(self.methods(r"\section[SampleA]{SampleA}")), 2)
        self.assertEqual(len(self.methods(r"\section{SampleA}\citep{sample:a}")), 1)
        self.assertEqual(len(self.methods(r"\href{https://example.org}{SampleA}")), 1)
        self.assertEqual(self.methods(r"\section{\texorpdfstring{SampleA\protect\citep{sample:a}}{SampleA}}"), [])

    def test_identifiers_urls_and_bookmarks_are_not_prose(self):
        text = (r"\url{https://example.org/SampleA} \label{SampleA} \ref{SampleA} "
                r"\texttt{SampleA} \path{SampleA} scripts/SampleA.py "
                r"\pdfbookmark[1]{SampleA}{SampleA} \hypertarget{SampleA}{visible} "
                r"\citep{SampleA} \hyperref[SampleA]{visible}")
        self.assertEqual(self.methods(text), [])
        self.assertEqual(citations.scan(r"\texorpdfstring{visible}{\citep{a,b}}")["findings"], [])

    def test_variants_and_attached_numbers_stay_manual(self):
        self.assertEqual(self.methods(r"SampleB-ne\citep{sample:b}"), [])
        for text in ["SampleB-new", "SampleA12.5", "SampleB+new"]:
            findings = self.methods(text)
            self.assertEqual([f["rule"] for f in findings], ["unregistered-variant-or-number"])
            self.assertEqual(findings[0]["severity"], "warning")
        self.assertEqual(self.methods("NotSampleA SampleAcronym"), [])

    def test_multiline_unicode_locations_match_original(self):
        text = "中文\n  SampleA，SampleB"
        findings = self.methods(text)
        self.assertEqual((findings[0]["line"], findings[0]["column"]), (2, 3))
        for finding in findings:
            self.assertEqual(text[finding["start"]:finding["end"]], finding["text"])

    def test_bad_registries_fail_explicitly(self):
        for data in [{}, {"version": True}, {"version": 1, "methods": {}},
                     {"version": 1, "methods": [{"names": ["A"], "citekeys": []}]},
                     {**REGISTRY, "ambiguous_unmapped": ["SampleA"]}]:
            with self.assertRaises(ValueError):
                citations.registry(data)

    def test_cli_read_only_json_and_failure_codes(self):
        with tempfile.TemporaryDirectory() as tmp:
            path, methods = Path(tmp) / "draft.tex", Path(tmp) / "methods.json"
            path.write_text("SampleA", encoding="utf-8")
            methods.write_text(json.dumps(REGISTRY), encoding="utf-8")
            original = {p: p.read_bytes() for p in (path, methods)}
            with contextlib.redirect_stdout(io.StringIO()) as out:
                code = citations.main([str(path), "--methods", str(methods), "--json"])
            self.assertEqual(code, 1)
            self.assertEqual(json.loads(out.getvalue())["errors"], 1)
            self.assertEqual(original, {p: p.read_bytes() for p in original})
            with contextlib.redirect_stderr(io.StringIO()), contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(citations.main([str(Path(tmp) / "missing.tex")]), 2)
                self.assertEqual(citations.main([tmp, "--methods", str(methods)]), 1)

    def test_rejects_nontext_oversize_and_symlink_inputs(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "draft.tex"
            for raw in [b"\xff", b"\0", b"x" * (citations.MAX_BYTES + 1)]:
                path.write_bytes(raw)
                with contextlib.redirect_stderr(io.StringIO()):
                    self.assertEqual(citations.main([str(path)]), 2)
            path.write_text("text", encoding="utf-8")
            link = Path(tmp) / "link.tex"
            link.symlink_to(path)
            with contextlib.redirect_stderr(io.StringIO()):
                self.assertEqual(citations.main([str(link)]), 2)


if __name__ == "__main__":
    unittest.main()
