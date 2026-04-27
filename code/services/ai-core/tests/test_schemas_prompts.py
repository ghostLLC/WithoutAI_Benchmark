"""Test AI Core schemas and prompt builders."""

import pytest
from app.models.schemas import (
    ExplainRequest,
    ExplainResponse,
    SuggestRequest,
    SuggestResponse,
    AssessmentLevel,
    RiskSignal,
)
from app.prompts.explain import build_explain_prompt, SCENE_NAMES, LEVEL_LABELS
from app.prompts.suggest import build_suggest_prompt


class TestSchemas:
    def test_explain_request_valid(self):
        req = ExplainRequest(
            scene_id="writing-report",
            final_level="limit",
            base_risk_score=50,
            triggered_rules=["first_process_replaced"],
            risk_reasons=["risk1"],
            retained_capabilities=["cap1"],
        )
        assert req.scene_id == "writing-report"
        assert req.final_level == "limit"
        assert req.base_risk_score == 50

    def test_explain_request_minimal(self):
        req = ExplainRequest(scene_id="s", final_level="continue", base_risk_score=10)
        assert len(req.triggered_rules) == 0
        assert len(req.risk_reasons) == 0

    def test_explain_request_score_bounds(self):
        with pytest.raises(Exception):
            ExplainRequest(scene_id="s", final_level="continue", base_risk_score=101)
        with pytest.raises(Exception):
            ExplainRequest(scene_id="s", final_level="continue", base_risk_score=-1)

    def test_suggest_request_valid(self):
        req = SuggestRequest(
            scene_id="basic-coding",
            final_level="pause",
            action_suggestions=["sug1", "sug2"],
            triggered_rules=["core_step_fully_replaced"],
        )
        assert len(req.action_suggestions) == 2

    def test_enum_values(self):
        assert AssessmentLevel.CONTINUE.value == "continue"
        assert AssessmentLevel.LIMIT.value == "limit"
        assert AssessmentLevel.PAUSE.value == "pause"
        assert RiskSignal.WEAKENING.value == "weakening"
        assert RiskSignal.REPLACEMENT.value == "replacement"
        assert RiskSignal.DEPENDENCY.value == "dependency"


class TestPromptBuilders:
    def test_build_explain_prompt_has_scene_name(self):
        system, user = build_explain_prompt(
            scene_id="writing-report",
            final_level="limit",
            base_risk_score=68,
            triggered_rules=["first_process_replaced"],
            risk_reasons=["越来越依赖 AI"],
            retained_capabilities=["仍保留部分能力"],
        )
        assert "写作与汇报" in user
        assert "68" in user
        assert "first_process_replaced" in user

    def test_build_explain_prompt_empty_inputs(self):
        system, user = build_explain_prompt(
            scene_id="s", final_level="continue", base_risk_score=10,
            triggered_rules=[], risk_reasons=[], retained_capabilities=[],
        )
        assert "无" in user

    def test_build_suggest_prompt_includes_level(self):
        system, user = build_suggest_prompt(
            scene_id="basic-coding",
            final_level="pause",
            action_suggestions=["暂停 AI 介入"],
            triggered_rules=["cannot_finish_without_ai"],
        )
        assert "基础编程" in user
        assert "pause" in user

    def test_scene_names_coverage(self):
        assert SCENE_NAMES["writing-report"] == "写作与汇报"
        assert SCENE_NAMES["learning-research"] == "学习与资料整理"
        assert SCENE_NAMES["basic-coding"] == "基础编程"
        assert SCENE_NAMES["basic-data"] == "基础数据处理"

    def test_level_labels(self):
        assert LEVEL_LABELS["continue"] == "可以继续"
        assert LEVEL_LABELS["limit"] == "建议限制"
        assert LEVEL_LABELS["pause"] == "建议暂停"
