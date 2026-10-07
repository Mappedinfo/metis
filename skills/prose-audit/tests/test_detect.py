"""Behavioral acceptance tests for the public, candidate-only prose scanner."""

import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "detect.py"
spec = importlib.util.spec_from_file_location("prose_audit_detect", SCRIPT)
detect = importlib.util.module_from_spec(spec)
spec.loader.exec_module(detect)


def candidates(result, rule_id):
    return [c for c in result["candidates"] if c["rule_id"] == rule_id]


def locations(result, rule_id):
    return [p for c in candidates(result, rule_id) for p in c["locations"]]


class SourceLocationTests(unittest.TestCase):
    def test_nfkc_expansion_bom_crlf_and_traditional_text(self):
        source = "\ufeffoﬃce。\r\n說明：ＲＯＢＵＳＴ 方法。當前合同。\r\nDelving deeper."
        result = detect.scan(source)
        robust = locations(result, "robust")[0]
        self.assertEqual(robust["text"], "ＲＯＢＵＳＴ")
        self.assertEqual(robust["start"], source.index("Ｒ"))
        self.assertEqual((robust["line"], robust["column"]), (2, 4))
        self.assertEqual((robust["end_line"], robust["end_column"]), (2, 10))
        self.assertEqual(locations(result, "current_contract")[0]["text"], "當前合同")
        self.assertEqual((locations(result, "delve")[0]["line"], locations(result, "delve")[0]["column"]), (3, 1))
        for candidate in result["candidates"]:
            for item in candidate["locations"]:
                self.assertEqual(source[item["start"]:item["end"]], item["text"])

    def test_normalization_map_preserves_composed_cluster(self):
        source = "Cafe\u0301 ﬁle ＲＯＢＵＳＴ"
        normalized, mapping = detect.normalized_source(source, [False] * len(source), {})
        self.assertEqual(normalized, "café file robust")
        offset = normalized.index("é")
        self.assertEqual(source[slice(*mapping[offset])], "e\u0301")
        self.assertEqual(locations(detect.scan(source), "robust")[0]["start"], source.index("Ｒ"))

    def test_bom_is_original_column_and_lone_cr_is_line_break(self):
        result = detect.scan("\ufeffRobust\rDelved")
        self.assertEqual((locations(result, "robust")[0]["line"], locations(result, "robust")[0]["column"]), (1, 2))
        self.assertEqual((locations(result, "delve")[0]["line"], locations(result, "delve")[0]["column"]), (2, 1))


class VocabularyTests(unittest.TestCase):
    def test_english_case_explicit_inflections_and_word_boundaries(self):
        result = detect.scan("DELVE delves Delved delving. undelved delver. Robust robustness robustly robustification. caférobust 可靠robust方法")
        self.assertEqual([p["text"] for p in locations(result, "delve")], ["DELVE", "delves", "Delved", "delving"])
        self.assertEqual([p["text"] for p in locations(result, "robust")], ["Robust", "robustly", "robust"])

    def test_longest_overlapping_phrase_counts_once(self):
        result = detect.scan("A holistic approach is described here.", {"tier2_document": 1})
        self.assertFalse(locations(result, "holistic"))
        self.assertEqual([p["text"] for p in locations(result, "holistic_approach")], ["holistic approach"])

    def test_tier2_document_or_paragraph_threshold(self):
        self.assertFalse(candidates(detect.scan("Leverage one. Leverage two."), "leverage"))
        self.assertEqual(len(locations(detect.scan("Leverage one. Leverage two. Leverage three."), "leverage")), 3)
        self.assertFalse(candidates(detect.scan("Leverage.\n\nLeverage.\n\nLeverage."), "leverage"))
        self.assertEqual(len(locations(detect.scan("Leverage.\n\nLeverage.\n\nLeverage.\n\nLeverage."), "leverage")), 4)

    def test_tier3_mixed_aliases_and_config_effect(self):
        source = "其实该方案有效。实际上它可运行。In fact the test passed."
        result = detect.scan(source)
        self.assertEqual(len(locations(result, "actually")), 3)
        self.assertFalse(candidates(detect.scan(source, {"tier3_document": 4}), "actually"))
        self.assertTrue(candidates(detect.scan("Robust.", {"tier1_document": 1}), "robust"))
        self.assertFalse(candidates(detect.scan("Robust.", {"tier1_document": 2}), "robust"))

    def test_thresholds_are_per_family_not_a_tier_total(self):
        self.assertFalse([c for c in detect.scan("Leverage synergy deep dive 赋能")['candidates'] if c["kind"] == "vocabulary"])

    def test_technical_terms_are_context_candidates(self):
        result = detect.scan("The context window contains 4096 tokens. Robust regression is appropriate.")
        self.assertTrue(candidates(result, "technical_context"))
        self.assertIn("technical", candidates(result, "technical_context")[0]["message"])
        self.assertEqual(result["review_status"], "candidate_scan_only")
        self.assertTrue(result["context_review_required"])
        self.assertNotIn("score", result)
        self.assertNotIn("verdict", result)


class ProtectedSourceTests(unittest.TestCase):
    def test_literals_metadata_links_comments_quotes_and_visible_label(self):
        source = '''---
title: robust
---
```python
robust = "delve"
```
~~~
robust
~~~
`robust` and ``delve``.
$robust$ and $$delve$$ and \\(robust\\) and \\[delve\\].
<!-- robust and delve -->
https://example.test/robust [visible](local/robust "delve")
[ref]: https://example.test/delve "robust"
> robust and delve
continued robust source quotation

“robust” 「delve」 'robust' "delve"

[Robust](https://example.test/delve)
'''
        result = detect.scan(source)
        self.assertEqual([p["text"] for p in locations(result, "robust")], ["Robust"])
        self.assertFalse(locations(result, "delve"))
        self.assertEqual(locations(result, "robust")[0]["start"], source.rindex("Robust"))

    def test_include_quotes_restores_only_quotes(self):
        source = '> robust\n\n“delve” and "robust". `robust` $robust$ <!--robust-->'
        result = detect.scan(source, include_quotes=True)
        self.assertEqual(len(locations(result, "robust")), 2)
        self.assertEqual(len(locations(result, "delve")), 1)
        self.assertFalse(detect.scan(source)["candidates"])

    def test_unclosed_fence_yaml_comment_and_indented_code(self):
        for source in ("```\nrobust", "---\nrobust", "<!-- robust", "    robust\n\tdelve"):
            with self.subTest(source=source):
                result = detect.scan(source)
                self.assertFalse(result["candidates"])
                self.assertEqual(result["input_status"], "insufficient_text")

    def test_protected_occurrences_do_not_reach_threshold(self):
        result = detect.scan("leverage `leverage` [label](leverage) “leverage”")
        self.assertFalse(candidates(result, "leverage"))
        self.assertEqual(result["statistics"]["paragraph_lengths"], [2])

    def test_apostrophes_in_contractions_are_not_quotations(self):
        result = detect.scan("It's not speed; it's accuracy. It's robust when tested.")
        self.assertTrue(candidates(result, "contrast_en"))
        self.assertTrue(candidates(result, "robust"))

    def test_code_delimiter_lengths_and_quote_boundaries(self):
        source = "``code with `robust` inside`` 'robust' It's robust. ''delve' “robust” robust"
        result = detect.scan(source)
        self.assertEqual(len(locations(result, "robust")), 2)
        self.assertFalse(locations(result, "delve"))


class SyntaxAndStatisticsTests(unittest.TestCase):
    def test_split_contrast_crosses_sentence_and_line(self):
        source = "这不是更快。\n这是更准确。\n\nThis is not speed.\r\nIt is accuracy."
        result = detect.scan(source)
        self.assertEqual(locations(result, "negation_split_zh")[0]["text"], "这不是更快。\n这是更准确")
        self.assertEqual(locations(result, "negation_split_en")[0]["text"], "This is not speed.\r\nIt is accuracy")

    def test_same_sentence_contrast_and_importance_are_only_candidates(self):
        result = detect.scan("不是速度，而是精度。It is not speed but accuracy. It plays a crucial role in calibration.")
        for rule in ("contrast_zh", "contrast_en", "importance_en"):
            self.assertTrue(candidates(result, rule))
        self.assertTrue(result["context_review_required"])

    def test_adjacent_repetition_below_vocabulary_frequency_threshold(self):
        result = detect.scan("真正值得比较的是误差。真正需要报告的是范围。")
        self.assertFalse(candidates(result, "truly"))
        self.assertEqual(len(locations(result, "adjacent_repetition:truly")), 2)
        self.assertFalse(candidates(detect.scan("Truly helpful. Other text. Truly useful."), "adjacent_repetition:truly"))
        self.assertFalse(candidates(detect.scan("Truly helpful.\n\nTruly useful."), "adjacent_repetition:truly"))
        self.assertFalse(candidates(detect.scan("Truly helpful. `source` Truly useful."), "adjacent_repetition:truly"))

    def test_descriptive_mixed_lengths_and_crlf_paragraphs(self):
        result = detect.scan("中文 test.\r\n中文 test!\r\n\r\nOne two. `ignored prose`")
        stats = result["statistics"]
        self.assertEqual(stats["sentence_lengths"], [3, 3, 2])
        self.assertEqual(stats["paragraph_lengths"], [6, 2])
        self.assertEqual(stats["paragraph_count"], 2)
        self.assertFalse(result["candidates"])

    def test_lf_crlf_unpunctuated_lines_have_identical_counts(self):
        source = "Leverage one\nLeverage two\nLeverage three\n\nFinal line"
        lf = detect.scan(source)
        crlf = detect.scan(source.replace("\n", "\r\n"))
        self.assertEqual(lf["statistics"]["sentence_lengths"], [2, 2, 2, 2])
        self.assertEqual(crlf["statistics"]["sentence_lengths"], lf["statistics"]["sentence_lengths"])
        self.assertEqual(crlf["statistics"]["paragraph_lengths"], [6, 2])
        self.assertEqual(candidates(lf, "leverage")[0]["counts"], {"document": 3, "paragraph_max": 3})
        self.assertEqual(candidates(crlf, "leverage")[0]["counts"], candidates(lf, "leverage")[0]["counts"])

    def test_formatting_surface_is_located(self):
        source = "- **Outcome**: The count changed."
        self.assertEqual(locations(detect.scan(source), "bold_label_list")[0]["text"], "- **Outcome**:")

    def test_empty_or_no_supported_prose_is_insufficient(self):
        for source in ("", "\ufeff \r\n", "1234 + 567", "```\nrobust\n```", "“robust”"):
            with self.subTest(source=source):
                result = detect.scan(source)
                self.assertEqual(result["input_status"], "insufficient_text")
                self.assertFalse(result["candidates"])
                self.assertIsNone(result["statistics"]["sentence_length_mean"])

    def test_no_false_range_or_semantic_loop_verdict(self):
        result = detect.scan("From data to insight. Small, narrow, shallow. 从好奇到行动。")
        self.assertFalse(result["candidates"])
        self.assertTrue(any("semantic loops" in note for note in result["limitations"]))


class GenrePolicyTests(unittest.TestCase):
    def test_same_rainfall_distinction_has_different_genre_actions(self):
        source = "记录的不是降雨量，而是降雨概率。"
        academic = detect.scan(source, genre="academic")
        explain = detect.scan(source, genre="explain")
        a = candidates(academic, "contrast_zh")[0]
        e = candidates(explain, "contrast_zh")[0]
        self.assertEqual(a["policy_action"], "revise")
        self.assertEqual(e["policy_action"], "context")
        self.assertEqual(a["locations"], e["locations"])
        self.assertEqual(academic["review_status"], "candidate_scan_only")
        self.assertTrue(academic["context_review_required"])
        self.assertFalse(candidates(detect.scan("本研究记录降雨概率。", genre="academic"), "contrast_zh"))

    def test_split_english_contrast_uses_same_selected_convention(self):
        source = "This is not rainfall volume. It is rainfall probability."
        for genre, action in (("academic", "revise"), ("explain", "context"), ("general", "context")):
            with self.subTest(genre=genre):
                self.assertEqual(candidates(detect.scan(source, genre=genre), "negation_split_en")[0]["policy_action"], action)

    def test_execution_reminders_are_context_candidates_in_every_genre(self):
        source = "这里不冒充全局。我们坚持真实口径。"
        for genre in ("general", "academic", "explain"):
            result = detect.scan(source, genre=genre)
            self.assertEqual(candidates(result, "execution_reminder")[0]["policy_action"], "context")
            self.assertEqual([p["text"] for p in locations(result, "execution_reminder")], ["不冒充全局", "真实口径"])

    def test_consecutive_negative_framing_and_wrapped_source_locations(self):
        source = "这不是降雨量。\r\n那不是累计降雨。"
        academic = candidates(detect.scan(source, genre="academic"), "negative_listing_zh")[0]
        self.assertEqual(academic["policy_action"], "revise")
        self.assertEqual(academic["locations"][0]["text"], source[:-1])
        self.assertEqual(academic["locations"][0]["end_line"], 2)
        self.assertEqual(candidates(detect.scan(source, genre="explain"), "negative_listing_zh")[0]["policy_action"], "context")

    def test_real_scope_evidence_and_explicit_comparison_stay_eligible_for_preservation(self):
        source = "样本仅来自三个城市。该结果不能证明因果关系。本研究预测降雨概率，基线模型预测降雨量。"
        self.assertFalse(detect.scan(source, genre="academic")["candidates"])

    def test_rule_examples_and_source_quotations_remain_protected(self):
        source = '`不冒充全局`\n“真实口径”\n> 记录的不是降雨量，而是降雨概率。\n'
        self.assertFalse(detect.scan(source, genre="academic")["candidates"])
        included = detect.scan(source, include_quotes=True, genre="academic")
        self.assertEqual(locations(included, "execution_reminder")[0]["text"], "真实口径")
        self.assertEqual(candidates(included, "contrast_zh")[0]["policy_action"], "revise")

    def test_unknown_genre_is_rejected_without_reconstructing_rules(self):
        for genre in ("science-ish", "", None, []):
            with self.subTest(genre=genre), self.assertRaises(ValueError):
                detect.scan("记录降雨概率。", genre=genre)


class ConfigurationAndCliTests(unittest.TestCase):
    def test_invalid_overrides_rejected(self):
        for config in ({"unknown": 2}, {"tier1_document": True}, {"tier2_document": 0},
                       {"tier3_document": -1}, {"tier2_paragraph": 1.0}, {"tier1_document": "1"}, []):
            with self.subTest(config=config), self.assertRaises(ValueError):
                detect.scan("Robust.", config)

    def run_cli(self, *args):
        return subprocess.run([sys.executable, "-B", str(SCRIPT), *map(str, args)], capture_output=True, text=True)

    def test_cli_preserves_bytes_and_positions_and_returns_success_with_candidates(self):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "source.md"
            raw = "\ufeffﬁle\r\nＲＯＢＵＳＴ".encode("utf-8")
            source.write_bytes(raw)
            before = source.stat().st_mtime_ns
            output = self.run_cli(source, "--json")
            self.assertEqual(output.returncode, 0, output.stderr)
            result = json.loads(output.stdout)
            item = locations(result, "robust")[0]
            self.assertEqual(item["start"], raw.decode("utf-8").index("Ｒ"))
            self.assertEqual((item["line"], item["column"]), (2, 1))
            self.assertEqual(source.read_bytes(), raw)
            self.assertEqual(source.stat().st_mtime_ns, before)
            self.assertEqual(sorted(p.name for p in Path(directory).iterdir()), ["source.md"])

    def test_cli_config_changes_scan_and_has_text_mode(self):
        with tempfile.TemporaryDirectory() as directory:
            source, config = Path(directory) / "text.md", Path(directory) / "config.json"
            source.write_text("Leverage resources.", encoding="utf-8")
            config.write_text('{"tier2_document": 1}', encoding="utf-8")
            output = self.run_cli(source, "--json", "--config", config)
            self.assertEqual(output.returncode, 0, output.stderr)
            self.assertTrue(candidates(json.loads(output.stdout), "leverage"))
            text_output = self.run_cli(source)
            self.assertEqual(text_output.returncode, 0)
            self.assertIn("review_status: candidate_scan_only", text_output.stdout)

    def test_cli_loads_genre_and_rules_version_without_changing_input(self):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "draft.md"
            raw = "记录的不是降雨量，而是降雨概率。".encode("utf-8")
            source.write_bytes(raw)
            output = self.run_cli(source, "--genre", "academic", "--json")
            self.assertEqual(output.returncode, 0, output.stderr)
            result = json.loads(output.stdout)
            self.assertEqual(result["genre"], "academic")
            self.assertEqual(result["rules_version"], 2)
            self.assertEqual(candidates(result, "contrast_zh")[0]["policy_action"], "revise")
            self.assertEqual(source.read_bytes(), raw)
            self.assertEqual(self.run_cli(source, "--genre", "unknown").returncode, 2)

    def test_cli_invalid_utf8_missing_input_nul_and_config_return_2(self):
        with tempfile.TemporaryDirectory() as directory:
            source, config = Path(directory) / "text.md", Path(directory) / "config.json"
            source.write_bytes(b"\xff")
            for output in (self.run_cli(source, "--json"), self.run_cli(source.with_name("missing.md")), self.run_cli(Path(directory))):
                self.assertEqual(output.returncode, 2)
                self.assertEqual(output.stdout, "")
            source.write_text("\x00Robust.", encoding="utf-8")
            self.assertEqual(self.run_cli(source).returncode, 2)
            source.write_text("Robust.", encoding="utf-8")
            for invalid in ('[]', '{"unknown": 1}', '{"tier1_document": 0}', '{"tier1_document": true}',
                            '{"tier1_document": 1, "tier1_document": 2}', '{bad'):
                config.write_text(invalid, encoding="utf-8")
                output = self.run_cli(source, "--config", config)
                self.assertEqual(output.returncode, 2, invalid)
                self.assertEqual(output.stdout, "")

    def test_cli_empty_and_oversize_inputs(self):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "text.md"
            source.write_bytes(b"")
            output = self.run_cli(source, "--json")
            self.assertEqual(output.returncode, 0)
            self.assertEqual(json.loads(output.stdout)["input_status"], "insufficient_text")
            source.write_bytes(b"a" * (detect.MAX_INPUT_BYTES + 1))
            self.assertEqual(self.run_cli(source).returncode, 2)

    def test_malformed_repeated_opening_delimiters_leave_visible_candidate(self):
        # A missing closer must not cause a new suffix search for every opener.
        # The generous process timeout guards against hangs, not speed tuning.
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "malformed.md"
            prose = "“" * 25_000 + " prefix " + "`" * 25_000 + " robust"
            source.write_text(prose, encoding="utf-8")
            output = subprocess.run([sys.executable, "-B", str(SCRIPT), str(source), "--json"],
                                    capture_output=True, text=True, timeout=10)
            self.assertEqual(output.returncode, 0, output.stderr)
            result = json.loads(output.stdout)
            self.assertEqual(locations(result, "robust")[0]["start"], prose.index("robust"))
            self.assertEqual(locations(result, "robust")[0]["text"], "robust")


if __name__ == "__main__":
    unittest.main()
