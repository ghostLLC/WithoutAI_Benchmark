"""对话式评估路由 — 多轮交互，LLM 动态出题与判断。"""

import json
import logging
import re

from fastapi import APIRouter, Depends

from app.config import Settings, get_settings
from app.llm.base import BaseLLMClient
from app.llm.factory import create_llm_client
from app.prompts.converse import build_converse_system_prompt
from app.models.schemas import ConverseRequest, ConverseResponse

logger = logging.getLogger(__name__)
router = APIRouter()

# 维度与 fallback 问题的对应关系
DIMENSION_QUESTIONS = [
    ("understanding", "在「{scene}」这类任务里，你通常是怎么开始的？是先自己想一想，还是先让 AI 帮你起个头？"),
    ("thinking", "这个过程中，哪些步骤是你自己做的，哪些交给了 AI？"),
    ("organization", "如果现在不能用 AI 了，你还能不能独立完成「{scene}」这类任务？完成到哪个程度？"),
    ("execution", "收到 AI 给你的结果，你一般怎么处理？是自己再改一轮，还是大致看看就用了？"),
    ("judgment", "你觉得你对 AI 的依赖，更多是'用了更方便'，还是'不用就不太会做了'？"),
]


def _parse_json(raw: str) -> dict | None:
    match = re.search(r"```(?:json)?\s*\n?(.*?)```", raw, re.DOTALL)
    if match:
        raw = match.group(1).strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def _build_fallback(request: ConverseRequest) -> ConverseResponse:
    """LLM 不可用时的 fallback：预设问题序列，带维度追踪。"""
    asked = len([m for m in request.history if m.role == "ai"])
    covered = [d for d, _ in DIMENSION_QUESTIONS[:asked]]

    if asked >= len(DIMENSION_QUESTIONS):
        return ConverseResponse(
            type="assessment",
            message="根据我们的对话，我判断你目前仍处于辅助使用区间。AI 还没有明显替代你的核心能力。建议继续保持当前边界。",
            dimensions_covered=[d for d, _ in DIMENSION_QUESTIONS],
            final_level="continue",
            risk_reasons=[],
            retained_capabilities=["你仍能独立完成核心过程。"],
            action_suggestions=[
                "继续把 AI 限制在润色和补充环节。",
                "定期脱离 AI 独立完成一版。",
                "关注自己是否出现'不用就不舒服'的惯性。",
            ],
        )

    q = DIMENSION_QUESTIONS[asked][1].format(scene=request.scene_name)
    return ConverseResponse(
        type="question",
        message=q,
        dimensions_covered=covered,
    )


@router.post("/converse", response_model=ConverseResponse)
async def converse(
    request: ConverseRequest,
    settings: Settings = Depends(get_settings),
    llm: BaseLLMClient = Depends(create_llm_client),
):
    system_prompt = build_converse_system_prompt(
        scene_name=request.scene_name,
        focus_capabilities=request.focus_capabilities,
    )

    # 将历史转为文本
    history_text = ""
    for msg in request.history:
        prefix = "评估师" if msg.role == "ai" else "用户"
        history_text += f"{prefix}：{msg.content}\n"

    user_prompt = f"""以下是对话历史：

{history_text}

请根据以上对话，给出你的下一轮回复（一个问题，或者如果已收集足够信息则给出评估结论）。
只输出 JSON，不要其他内容。"""

    try:
        response = await llm.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )

        parsed = _parse_json(response.content)
        if parsed is None or "type" not in parsed:
            logger.warning("Failed to parse LLM converse response")
            if settings.fallback_on_error:
                return _build_fallback(request)
            raise ValueError("LLM 返回的 JSON 无法解析")

        return ConverseResponse(
            type=parsed.get("type", "question"),
            message=parsed.get("message", ""),
            dimensions_covered=parsed.get("dimensions_covered", []),
            final_level=parsed.get("final_level"),
            risk_reasons=parsed.get("risk_reasons"),
            retained_capabilities=parsed.get("retained_capabilities"),
            action_suggestions=parsed.get("action_suggestions"),
        )

    except Exception as e:
        logger.error("Converse LLM call failed: %s", e, exc_info=True)
        if settings.fallback_on_error:
            return _build_fallback(request)
        raise
