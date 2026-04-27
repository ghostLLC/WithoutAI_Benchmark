"""Test LLM client factory."""

import pytest
from unittest.mock import patch
from app.llm.base import BaseLLMClient
from app.llm.factory import create_llm_client, MockLLMClient


class TestMockLLMClient:
    @pytest.mark.asyncio
    async def test_generate_returns_placeholder(self):
        client = MockLLMClient()
        resp = await client.generate("sys", "user")
        assert "[mock]" in resp.content
        assert resp.model == "mock"

    @pytest.mark.asyncio
    async def test_health_check_always_ok(self):
        client = MockLLMClient()
        assert await client.health_check() is True


class TestCreateLLMClient:
    def test_returns_mock_when_llm_disabled(self):
        with patch("app.llm.factory.get_settings") as mock_settings:
            mock_settings.return_value.enable_llm = False
            mock_settings.return_value.llm_api_key = ""
            client = create_llm_client()
            assert isinstance(client, MockLLMClient)

    def test_returns_mock_when_api_key_empty(self):
        with patch("app.llm.factory.get_settings") as mock_settings:
            mock_settings.return_value.enable_llm = True
            mock_settings.return_value.llm_api_key = ""
            client = create_llm_client()
            assert isinstance(client, MockLLMClient)

    def test_returns_non_mock_when_credentials_present(self):
        with patch("app.llm.factory.get_settings") as mock_settings:
            mock_settings.return_value.enable_llm = True
            mock_settings.return_value.llm_api_key = "sk-test"
            mock_settings.return_value.llm_base_url = "https://api.test.com"
            mock_settings.return_value.llm_model = "test-model"
            mock_settings.return_value.llm_temperature = 1.0
            mock_settings.return_value.llm_top_p = 1.0
            mock_settings.return_value.llm_frequency_penalty = 0.0
            mock_settings.return_value.llm_presence_penalty = 0.0
            mock_settings.return_value.llm_max_tokens = 1024
            mock_settings.return_value.llm_thinking_enabled = False
            mock_settings.return_value.llm_reasoning_effort = "high"
            mock_settings.return_value.llm_response_format_json = True
            mock_settings.return_value.llm_timeout_seconds = 60
            client = create_llm_client()
            # 有有效凭证时应返回非 mock 客户端
            assert not isinstance(client, MockLLMClient)
            assert isinstance(client, BaseLLMClient)
