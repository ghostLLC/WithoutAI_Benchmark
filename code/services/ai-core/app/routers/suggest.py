"""行动建议优化路由 — 已接入 LLM，支持自动 fallback。"""

import json
import logging
import re

from fastapi import APIRouter, Depends

from app.config import Settings, get_settings
from app.llm.base import BaseLLMClient
from app.llm.factory import create_llm_client
from app.prompts.suggest import build_suggest_prompt
from app.models.schemas import SuggestRequest, SuggestResponse

logger = logging.getLogger(__name__)
router = APIRouter()


def _parse_json_from_llm(raw: str) -> dict | None:
    """从 LLM 返回的文本中提取 JSON 块。"""
    match = re.search(r"```(?:json)?\s*\n?(.*?)```", raw, re.DOTALL)
    if match:
        raw = match.group(1).strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def _build_fallback_response(request: SuggestRequest) -> SuggestResponse:
    """LLM 不可用时的 fallback：基于原始建议做简单润色。"""
    # 把原始建议做最基础的正向表述转换
    enhanced = []
    for suggestion in request.action_suggestions:
        s = suggestion.rstrip("。")
        # 如果已经是正向表述就直接用，否则做简单转换
        enhanced.append(s)

    priority_map = {
        "continue": "低",
        "limit": "中",
        "pause": "高",
    }

    return SuggestResponse(
        scene_id=request.scene_id,
        enhanced_suggestions=enhanced,
        priority=priority_map.get(request.final_level, "中"),
    )


# ── 依赖注入 ──

def _get_llm_client() -> BaseLLMClient:
    return create_llm_client()


# ── 路由 ──

@router.post("/suggest", response_model=SuggestResponse)
async def generate_suggestions(
    request: SuggestRequest,
    settings: Settings = Depends(get_settings),
    llm: BaseLLMClient = Depends(_get_llm_client),
):
    """基于评估结果优化行动建议。

    - LLM 可用时：调用 LLM 生成具体、可操作的建议
    - LLM 不可用时：自动 fallback 到基于模板的简单润色
    """
    system_prompt, user_prompt = build_suggest_prompt(
        scene_id=request.scene_id,
        final_level=request.final_level,
        action_suggestions=request.action_suggestions,
        triggered_rules=request.triggered_rules,
    )

    try:
        response = await llm.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )

        parsed = _parse_json_from_llm(response.content)
        if parsed is None:
            logger.warning("Failed to parse LLM JSON response, falling back")
            if settings.fallback_on_error:
                return _build_fallback_response(request)
            raise ValueError("LLM 返回的 JSON 无法解析")

        priority_map = {"continue": "低", "limit": "中", "pause": "高"}
        # 优先用 LLM 返回的 priority，兜底用规则映射
        priority = parsed.get("priority", priority_map.get(request.final_level, "中"))

        return SuggestResponse(
            scene_id=request.scene_id,
            enhanced_suggestions=parsed.get("enhanced_suggestions", request.action_suggestions),
            priority=priority,
        )

    except Exception as e:
        logger.error("LLM call failed: %s", e, exc_info=True)
        if settings.fallback_on_error:
            return _build_fallback_response(request)
        raise
