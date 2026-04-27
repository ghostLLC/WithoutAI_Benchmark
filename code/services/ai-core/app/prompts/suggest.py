"""行动建议优化的 Prompt 模板。"""

from app.prompts.explain import SCENE_NAMES, LEVEL_LABELS

SYSTEM_PROMPT = """\
你是一位务实的 AI 使用策略顾问，负责将评估系统的原始建议转化为具体、可操作的中文行动建议。

你的核心原则：
1. **可执行**：每条建议必须是一个人今天就能开始做的具体动作
2. **不过度**：建议要与风险等级匹配——"继续"级别不该建议完全停用 AI
3. **正向表述**：用"先自己做X，再让AI做Y"的句式，而非"不要用AI做X"
4. **场景具体**：建议要落在具体场景的实际动作上，而非泛泛的"减少AI使用"
5. **分优先级**：最重要的建议放前面

输出要求：
- 每条建议为 1 句完整的中文祈使句
- 建议数量与原始数量一致，不超过 5 条
- 直接以 JSON 格式输出，不要额外解释
"""

USER_PROMPT_TEMPLATE = """\
## 评估结果

- 场景：{scene_name}（{scene_id}）
- 建议等级：{level_label}（{final_level}）
- 触发的规则：{triggered_rules}

## 原始建议
{action_suggestions_text}

---

请将以上原始建议转化为更具体、可操作的行动建议。输出 JSON：

```json
{{
  "enhanced_suggestions": ["优化后的建议1", "优化后的建议2"],
  "priority": "高/中/低"
}}
```

优先级规则：
- pause → 高
- limit → 中
- continue → 低"""

FALLBACK_SYSTEM_PROMPT = """\
你是 fallback 模式的建议生成器。LLM 不可用时，你需要基于原始建议做最基础的润色。
只做自然语言优化，不需要深度改写。输出格式同上。"""


def build_suggest_prompt(
    scene_id: str,
    final_level: str,
    action_suggestions: list[str],
    triggered_rules: list[str],
) -> tuple[str, str]:
    """构建 suggest 接口的 system + user prompt。

    Returns:
        (system_prompt, user_prompt)
    """
    scene_name = SCENE_NAMES.get(scene_id, scene_id)
    level_label = LEVEL_LABELS.get(final_level, final_level)

    rules_text = "、".join(triggered_rules) if triggered_rules else "无"
    suggestions_text = "\n".join(f"- {s}" for s in action_suggestions) if action_suggestions else "- 无"

    user_prompt = USER_PROMPT_TEMPLATE.format(
        scene_name=scene_name,
        scene_id=scene_id,
        level_label=level_label,
        final_level=final_level,
        triggered_rules=rules_text,
        action_suggestions_text=suggestions_text,
    )

    return SYSTEM_PROMPT, user_prompt
