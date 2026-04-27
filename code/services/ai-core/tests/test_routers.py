"""Test AI Core router fallback logic (no LLM required)."""

import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    with patch("app.routers.explain.create_llm_client") as mock_explain:
        with patch("app.routers.suggest.create_llm_client") as mock_suggest:
            from app.llm.factory import MockLLMClient
            mock_explain.return_value = MockLLMClient()
            mock_suggest.return_value = MockLLMClient()
            from app.main import app
            with TestClient(app) as c:
                yield c


class TestHealth:
    def test_health_ok(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"
        assert data["service"] == "ai-core"
        assert "llm_enabled" in data
        assert "llm_reachable" in data


class TestExplainRouter:
    def test_explain_minimal_request(self, client):
        resp = client.post("/ai/explain", json={
            "scene_id": "writing-report",
            "final_level": "limit",
            "base_risk_score": 50,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["scene_id"] == "writing-report"
        assert "enhanced_risk_reasons" in data
        assert "enhanced_retained_capabilities" in data
        assert data["summary"] is not None  # fallback always produces a summary

    def test_explain_full_request(self, client):
        resp = client.post("/ai/explain", json={
            "scene_id": "basic-coding",
            "final_level": "pause",
            "base_risk_score": 85,
            "triggered_rules": ["core_step_fully_replaced"],
            "risk_reasons": ["核心编码过程被替代。"],
            "retained_capabilities": ["你仍能阅读代码。"],
        })
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["enhanced_risk_reasons"]) >= 1
        assert len(data["enhanced_retained_capabilities"]) >= 1

    def test_explain_empty_risk_reasons(self, client):
        resp = client.post("/ai/explain", json={
            "scene_id": "writing-report",
            "final_level": "continue",
            "base_risk_score": 19,
            "risk_reasons": [],
            "retained_capabilities": ["你能独立完成。"],
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["enhanced_risk_reasons"] == []


class TestSuggestRouter:
    def test_suggest_minimal_request(self, client):
        resp = client.post("/ai/suggest", json={
            "scene_id": "learning-research",
            "final_level": "limit",
            "action_suggestions": ["先自己读原文。"],
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["scene_id"] == "learning-research"
        assert "enhanced_suggestions" in data
        assert data["priority"] in ("高", "中", "低")

    def test_suggest_priority_mapping(self, client):
        for level, expected in [("continue", "低"), ("limit", "中"), ("pause", "高")]:
            resp = client.post("/ai/suggest", json={
                "scene_id": "s",
                "final_level": level,
                "action_suggestions": ["test"],
            })
            assert resp.status_code == 200
            assert resp.json()["priority"] == expected

    def test_suggest_empty_suggestions(self, client):
        resp = client.post("/ai/suggest", json={
            "scene_id": "s",
            "final_level": "continue",
            "action_suggestions": [],
        })
        assert resp.status_code == 200
        assert resp.json()["enhanced_suggestions"] == []
