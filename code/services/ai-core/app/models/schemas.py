"""AI Core 的 Pydantic 模型，与 contracts/api-contracts.md 对齐。"""

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


# ── 枚举 ──

class AssessmentLevel(str, Enum):
    CONTINUE = "continue"
    LIMIT = "limit"
    PAUSE = "pause"


class RiskSignal(str, Enum):
    WEAKENING = "weakening"
    REPLACEMENT = "replacement"
    DEPENDENCY = "dependency"


# ── Explain 接口 ──

class ExplainRequest(BaseModel):
    scene_id: str = Field(description="场景 ID")
    final_level: str = Field(description="评估等级: continue / limit / pause")
    base_risk_score: int = Field(ge=0, le=100, description="基础风险分")
    triggered_rules: list[str] = Field(default_factory=list, description="触发的规则列表")
    risk_reasons: list[str] = Field(default_factory=list, description="原始风险原因")
    retained_capabilities: list[str] = Field(default_factory=list, description="保留的能力")


class ExplainResponse(BaseModel):
    scene_id: str
    enhanced_risk_reasons: list[str] = Field(description="LLM 增强后的风险原因")
    enhanced_retained_capabilities: list[str] = Field(description="LLM 增强后的保留能力")
    summary: Optional[str] = Field(default=None, description="一句话概括评估结论")


# ── Suggest 接口 ──

class SuggestRequest(BaseModel):
    scene_id: str = Field(description="场景 ID")
    final_level: str = Field(description="评估等级: continue / limit / pause")
    action_suggestions: list[str] = Field(default_factory=list, description="原始行动建议")
    triggered_rules: list[str] = Field(default_factory=list, description="触发的规则列表")


class SuggestResponse(BaseModel):
    scene_id: str
    enhanced_suggestions: list[str] = Field(description="LLM 优化后的行动建议")
    priority: str = Field(description="建议优先级: 高/中/低")


# ── 通用 DTO（contracts 中的结构，供内部使用） ──

class SceneDTO(BaseModel):
    id: str
    name: str
    slug: str
    summary: str
    examples: list[str]
    focus_capabilities: list[str]
    enabled: bool
    sort_order: int


class AssessmentResultDTO(BaseModel):
    scene_id: str
    base_risk_score: int
    triggered_rules: list[str]
    final_level: AssessmentLevel
    risk_reasons: list[str]
    retained_capabilities: list[str]
    action_suggestions: list[str]


# ── Converse 接口 ──

class ConverseMessage(BaseModel):
    role: str = Field(description="'ai' 或 'user'")
    content: str


class ConverseRequest(BaseModel):
    scene_id: str = Field(description="场景 ID")
    scene_name: str = Field(description="场景中文名")
    focus_capabilities: list[str] = Field(default_factory=list, description="场景重点能力")
    history: list[ConverseMessage] = Field(default_factory=list, description="对话历史")


class ConverseResponse(BaseModel):
    type: str = Field(description="'question' 或 'assessment'")
    message: str = Field(description="AI 回复文本")
    dimensions_covered: list[str] = Field(default_factory=list, description="已覆盖的维度列表")
    final_level: str | None = Field(default=None, description="评估等级（仅 assessment 时）")
    risk_reasons: list[str] | None = Field(default=None, description="风险原因（仅 assessment 时）")
    retained_capabilities: list[str] | None = Field(default=None, description="保留能力（仅 assessment 时）")
    action_suggestions: list[str] | None = Field(default=None, description="行动建议（仅 assessment 时）")
