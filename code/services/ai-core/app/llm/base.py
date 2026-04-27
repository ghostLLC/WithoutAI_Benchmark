"""LLM 客户端抽象基类。"""

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class LLMResponse:
    """LLM 返回的统一结构。"""

    content: str
    model: str
    usage_prompt_tokens: int = 0
    usage_completion_tokens: int = 0


class BaseLLMClient(ABC):
    """LLM 客户端抽象，所有实现必须继承此类。"""

    @abstractmethod
    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> LLMResponse:
        """调用 LLM 生成文本。

        Args:
            system_prompt: 系统提示词
            user_prompt: 用户消息
            temperature: 覆盖默认温度
            max_tokens: 覆盖默认最大 token 数

        Returns:
            LLMResponse 统一返回结构
        """
        ...

    @abstractmethod
    async def health_check(self) -> bool:
        """检查 LLM 服务是否可用。"""
        ...
