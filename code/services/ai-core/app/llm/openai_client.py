"""OpenAI 兼容客户端实现，按 DeepSeek 官方文档接入。

参考：https://api-docs.deepseek.com/zh-cn/
"""

import logging
from typing import Any
from openai import AsyncOpenAI

from app.config import get_settings
from app.llm.base import BaseLLMClient, LLMResponse

logger = logging.getLogger(__name__)


class OpenAIClient(BaseLLMClient):
    """基于 openai Python SDK 的 LLM 客户端，按 DeepSeek 官方接入方式配置。"""

    def __init__(self) -> None:
        settings = get_settings()
        self._model = settings.llm_model
        self._temperature = settings.llm_temperature
        self._top_p = settings.llm_top_p
        self._frequency_penalty = settings.llm_frequency_penalty
        self._presence_penalty = settings.llm_presence_penalty
        self._max_tokens = settings.llm_max_tokens
        self._thinking_enabled = settings.llm_thinking_enabled
        self._reasoning_effort = settings.llm_reasoning_effort
        self._response_format_json = settings.llm_response_format_json
        self._timeout_seconds = settings.llm_timeout_seconds

        # DeepSeek 官方示例：base_url 不带 /v1 后缀，SDK 会自动补全
        self._client = AsyncOpenAI(
            api_key=settings.llm_api_key,
            base_url=settings.llm_base_url,
            timeout=self._timeout_seconds,
        )

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> LLMResponse:
        temp = temperature if temperature is not None else self._temperature
        max_tok = max_tokens if max_tokens is not None else self._max_tokens

        # ── 构建请求参数，严格按 DeepSeek 官方文档 ──
        # 官方示例：https://api-docs.deepseek.com/zh-cn/
        params: dict[str, Any] = {
            "model": self._model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "stream": False,
        }

        # 思考模式关闭时才传采样参数（官方：思考模式下不建议设 temperature）
        if not self._thinking_enabled:
            params["temperature"] = temp
            params["top_p"] = self._top_p

        # frequency_penalty / presence_penalty 在两种模式下都可用
        params["frequency_penalty"] = self._frequency_penalty
        params["presence_penalty"] = self._presence_penalty

        # max_tokens
        params["max_tokens"] = max_tok

        # ── 思考模式（DeepSeek V4 特色） ──
        # 官方 Python SDK 示例中，thinking 通过 extra_body 传递
        extra_body: dict[str, Any] = {}
        if self._thinking_enabled:
            extra_body["thinking"] = {"type": "enabled"}
            params["reasoning_effort"] = self._reasoning_effort

        # ── JSON 输出模式 ──
        if self._response_format_json:
            params["response_format"] = {"type": "json_object"}

        logger.info(
            "LLM request: model=%s, temp=%s, top_p=%s, max_tokens=%d, "
            "thinking=%s, reasoning_effort=%s, json_mode=%s",
            self._model,
            temp if not self._thinking_enabled else "N/A(thinking)",
            self._top_p if not self._thinking_enabled else "N/A(thinking)",
            max_tok,
            self._thinking_enabled,
            self._reasoning_effort if self._thinking_enabled else "N/A",
            self._response_format_json,
        )

        response = await self._client.chat.completions.create(
            **params,
            extra_body=extra_body if extra_body else None,
        )

        choice = response.choices[0]
        content = choice.message.content or ""

        usage = response.usage
        prompt_tokens = usage.prompt_tokens if usage else 0
        completion_tokens = usage.completion_tokens if usage else 0

        logger.info(
            "LLM response: model=%s, tokens=%d+%d, finish_reason=%s",
            response.model,
            prompt_tokens,
            completion_tokens,
            choice.finish_reason,
        )

        return LLMResponse(
            content=content,
            model=response.model,
            usage_prompt_tokens=prompt_tokens,
            usage_completion_tokens=completion_tokens,
        )

    async def health_check(self) -> bool:
        """通过列出模型来检查 API 是否可达。"""
        try:
            await self._client.models.list()
            return True
        except Exception:
            return False
