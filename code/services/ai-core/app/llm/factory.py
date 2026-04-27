"""LLM 客户端工厂 + fallback mock 实现。"""

import logging
from app.config import get_settings
from app.llm.base import BaseLLMClient, LLMResponse

logger = logging.getLogger(__name__)


class MockLLMClient(BaseLLMClient):
    """Fallback mock 客户端，当 LLM 不可用时使用。"""

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> LLMResponse:
        logger.warning("Using mock LLM client — LLM is unavailable or disabled")
        return LLMResponse(
            content="[mock] LLM 服务不可用，此内容为占位文本。",
            model="mock",
        )

    async def health_check(self) -> bool:
        return True  # mock 永远可用


def create_llm_client() -> BaseLLMClient:
    """根据配置创建 LLM 客户端实例。

    - 如果 enable_llm=False，直接返回 MockLLMClient
    - 如果 llm_api_key 为空，降级到 MockLLMClient
    - 否则创建 OpenAI 兼容客户端（按 DeepSeek 官方文档接入）
    """
    settings = get_settings()

    if not settings.enable_llm:
        logger.info("LLM disabled by config, using mock client")
        return MockLLMClient()

    if not settings.llm_api_key:
        logger.warning(
            "LLM API key is empty, falling back to mock client. "
            "Set AI_CORE_LLM_API_KEY to enable LLM."
        )
        return MockLLMClient()

    from app.llm.openai_client import OpenAIClient

    logger.info(
        "Creating DeepSeek client: base_url=%s, model=%s",
        settings.llm_base_url,
        settings.llm_model,
    )
    return OpenAIClient()
