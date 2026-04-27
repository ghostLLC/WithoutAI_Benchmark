"""风险解释增强的 Prompt 模板。"""

# 场景名称映射，用于让 LLM 输出更自然的中文场景名
SCENE_NAMES: dict[str, str] = {
    "writing-report": "写作与汇报",
    "learning-research": "学习与资料整理",
    "basic-coding": "基础编程",
    "basic-data": "基础数据处理",
}

LEVEL_LABELS: dict[str, str] = {
    "continue": "可以继续",
    "limit": "建议限制",
    "pause": "建议暂停",
}

SYSTEM_PROMPT = """\
你是一位专业的 AI 使用风险分析师，负责将评估系统的原始输出转化为用户能直接理解的、有温度的中文解释。

你的核心原则：
1. **不评判人格**：你分析的是任务级别的行为模式，不是人的能力或品质
2. **有温度但准确**：用自然的中文表达，不用机械的评分术语
3. **具体而非空泛**：解释要落在这个人具体做了什么，而非泛泛而谈
4. **保留事实**：原始风险原因和保留能力中的关键信息不能丢失
5. **不过度建议**：解释只说清楚"发生了什么"和"意味着什么"，具体建议由另一个模块负责

输出要求：
- 每条解释为 1-2 句自然的中文
- 不使用"你应该如何"的祈使句
- 不使用"建议""应该"等建议性词汇
- 直接以 JSON 格式输出，不要额外解释
"""

USER_PROMPT_TEMPLATE = """\
## 评估结果

- 场景：{scene_name}（{scene_id}）
- 风险评分：{risk_score}/100
- 建议等级：{level_label}（{final_level}）
- 触发的规则：{triggered_rules}

## 原始风险原因
{risk_reasons_text}

## 原始保留能力
{retained_capabilities_text}

---

请将以上原始输出转化为用户能直接理解的解释。输出 JSON：

```json
{{
  "enhanced_risk_reasons": ["增强后的风险原因1", "增强后的风险原因2"],
  "enhanced_retained_capabilities": ["增强后的保留能力1", "增强后的保留能力2"],
  "summary": "一段话概括该场景的评估结论"
}}
```"""

FALLBACK_SYSTEM_PROMPT = """\
你是 fallback 模式的解释生成器。LLM 不可用时，你需要基于原始数据生成简洁但可用的解释。
只做最基础的自然语言润色，不需要深度分析。输出格式同上。"""


def build_explain_prompt(
    scene_id: str,
    final_level: str,
    base_risk_score: int,
    triggered_rules: list[str],
    risk_reasons: list[str],
    retained_capabilities: list[str],
) -> tuple[str, str]:
    """构建 explain 接口的 system + user prompt。

    Returns:
        (system_prompt, user_prompt)
    """
    scene_name = SCENE_NAMES.get(scene_id, scene_id)
    level_label = LEVEL_LABELS.get(final_level, final_level)

    rules_text = "、".join(triggered_rules) if triggered_rules else "无"
    reasons_text = "\n".join(f"- {r}" for r in risk_reasons) if risk_reasons else "- 无"
    caps_text = "\n".join(f"- {c}" for c in retained_capabilities) if retained_capabilities else "- 无"

    user_prompt = USER_PROMPT_TEMPLATE.format(
        scene_name=scene_name,
        scene_id=scene_id,
        risk_score=base_risk_score,
        level_label=level_label,
        final_level=final_level,
        triggered_rules=rules_text,
        risk_reasons_text=reasons_text,
        retained_capabilities_text=caps_text,
    )

    return SYSTEM_PROMPT, user_prompt
