"""风险解释增强路由 — 已接入 LLM，支持自动 fallback。"""

import json
import logging
import re

from fastapi import APIRouter, Depends

from app.config import Settings, get_settings
from app.llm.base import BaseLLMClient
from app.llm.factory import create_llm_client
from app.prompts.explain import build_explain_prompt, FALLBACK_SYSTEM_PROMPT
from app.models.schemas import ExplainRequest, ExplainResponse

logger = logging.getLogger(__name__)
router = APIRouter()


def _parse_json_from_llm(raw: str) -> dict | None:
    """从 LLM 返回的文本中提取 JSON 块。

    LLM 有时会用 ```json ... ``` 包裹，有时直接输出 JSON。
    """
    # 尝试提取 markdown code block 中的 JSON
    match = re.search(r"```(?:json)?\s*\n?(.*?)```", raw, re.DOTALL)
    if match:
        raw = match.group(1).strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def _build_fallback_response(request: ExplainRequest) -> ExplainResponse:
    """LLM 不可用时的 fallback：基于原始数据做简单润色。"""
    from app.prompts.explain import SCENE_NAMES, LEVEL_LABELS

    scene_name = SCENE_NAMES.get(request.scene_id, request.scene_id)
    level_label = LEVEL_LABELS.get(request.final_level, request.final_level)

    enhanced_reasons = [
        f"在{scene_name}场景中，{reason.rstrip('。')}"
        for reason in request.risk_reasons
    ]
    enhanced_caps = [
        cap.rstrip("。") if cap.startswith("你") else f"你仍{cap.rstrip('。')}"
        for cap in request.retained_capabilities
    ]
    summary = (
        f"在{scene_name}场景中，你的 AI 使用风险评分为 {request.base_risk_score}，"
        f"建议等级为「{level_label}」。"
    )

    return ExplainResponse(
        scene_id=request.scene_id,
        enhanced_risk_reasons=enhanced_reasons,
        enhanced_retained_capabilities=enhanced_caps,
        summary=summary,
    )


# ── 依赖注入 ──

def _get_llm_client() -> BaseLLMClient:
    return create_llm_client()


# ── 路由 ──

@router.post("/explain", response_model=ExplainResponse)
async def generate_explanation(
    request: ExplainRequest,
    settings: Settings = Depends(get_settings),
    llm: BaseLLMClient = Depends(_get_llm_client),
):
    """基于评估结果生成增强版风险解释。

    - LLM 可用时：调用 LLM 生成自然、个性化的解释
    - LLM 不可用时：自动 fallback 到基于模板的简单润色
    """
    system_prompt, user_prompt = build_explain_prompt(
        scene_id=request.scene_id,
        final_level=request.final_level,
        base_risk_score=request.base_risk_score,
        triggered_rules=request.triggered_rules,
        risk_reasons=request.risk_reasons,
        retained_capabilities=request.retained_capabilities,
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

        return ExplainResponse(
            scene_id=request.scene_id,
            enhanced_risk_reasons=parsed.get("enhanced_risk_reasons", request.risk_reasons),
            enhanced_retained_capabilities=parsed.get(
                "enhanced_retained_capabilities", request.retained_capabilities
            ),
            summary=parsed.get("summary", ""),
        )

    except Exception as e:
        logger.error("LLM call failed: %s", e, exc_info=True)
        if settings.fallback_on_error:
            return _build_fallback_response(request)
        raise
