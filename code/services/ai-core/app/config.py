"""AI Core 配置管理，基于 pydantic-settings 读取环境变量。"""

from pydantic_settings import BaseSettings
from pydantic import Field
from functools import lru_cache


class Settings(BaseSettings):
    """应用配置，优先从 .env 文件和环境变量读取。"""

    # ── LLM 接入（DeepSeek V4，OpenAI 兼容格式） ──
    # 参考：https://api-docs.deepseek.com/zh-cn/
    llm_api_key: str = Field(
        default="",
        description="DeepSeek API Key，留空则 fallback 到 mock 模式。"
        "申请地址：https://platform.deepseek.com/api_keys",
    )
    llm_base_url: str = Field(
        default="https://api.deepseek.com",
        description="DeepSeek API base URL（官方值，不带 /v1 后缀）",
    )
    llm_model: str = Field(
        default="deepseek-v4-flash",
        description="模型名称。可选值：deepseek-v4-flash、deepseek-v4-pro",
    )

    # ── 采样控制 ──
    # 参考：https://api-docs.deepseek.com/zh-cn/api/create-chat-completion
    llm_temperature: float = Field(
        default=1.0,
        description="采样温度，0~2，值越高越随机。建议与 top_p 只改其中一个",
    )
    llm_top_p: float = Field(
        default=1.0,
        description="核采样阈值，0~1。如 0.1 表示仅考虑概率最高 10% 的 token",
    )
    llm_frequency_penalty: float = Field(
        default=0.0,
        description="频率惩罚，-2~2，正值降低重复 token 的出现概率",
    )
    llm_presence_penalty: float = Field(
        default=0.0,
        description="存在惩罚，-2~2，正值增加谈论新主题的概率",
    )

    # ── 输出控制 ──
    llm_max_tokens: int = Field(
        default=1024,
        description="生成的最大 token 数（不含 prompt），受模型上下文总长度限制",
    )

    # ── 思考模式（DeepSeek V4 特色） ──
    llm_thinking_enabled: bool = Field(
        default=False,
        description="是否启用思考模式。非思考模式响应更快、token 消耗更低",
    )
    llm_reasoning_effort: str = Field(
        default="high",
        description="推理强度：high（默认）、max（复杂 Agent 场景）",
    )

    # ── JSON 输出模式 ──
    llm_response_format_json: bool = Field(
        default=True,
        description="是否启用 JSON 输出模式（response_format=json_object）。"
        "启用时需在 system/user 消息中指示模型输出 JSON",
    )

    # ── 请求超时 ──
    llm_timeout_seconds: float = Field(
        default=60.0,
        description="单次 LLM 请求超时时间（秒）",
    )

    # ── 行为开关 ──
    enable_llm: bool = Field(
        default=True,
        description="是否启用 LLM 调用；关闭后所有请求走 fallback mock",
    )
    fallback_on_error: bool = Field(
        default=True,
        description="LLM 调用失败时是否自动 fallback 到 mock",
    )

    # ── 服务配置 ──
    log_level: str = Field(default="INFO", description="日志级别")

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "env_prefix": "AI_CORE_",
        "extra": "ignore",
    }


@lru_cache
def get_settings() -> Settings:
    """获取全局配置单例。"""
    return Settings()
