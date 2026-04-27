# API 契约（V1）

## 1. 评估场景接口

### GET /api/assessment/scenes

返回所有启用的评估场景列表。

**响应示例：**
```json
{
  "items": [
    {
      "id": "writing-report",
      "name": "写作与汇报",
      "slug": "writing-report",
      "summary": "判断用户在写作与表达类任务中是否已经把关键过程交给 AI。",
      "examples": ["周报", "课程小结", "汇报提纲"],
      "focusCapabilities": ["基础理解能力", "自主思考能力", "独立拆解与组织能力"],
      "enabled": true,
      "sortOrder": 1
    }
  ]
}
```

## 2. 题目列表接口

### GET /api/assessment/scenes/{sceneId}/questions

返回指定场景的所有题目与选项。

**响应示例：**
```json
{
  "sceneId": "writing-report",
  "items": [
    {
      "id": "q1",
      "type": "single_choice",
      "category": "起始方式",
      "title": "你通常从哪里开始这类任务？",
      "description": "请选择最接近你真实习惯的一项。",
      "sortOrder": 1,
      "options": [
        { "id": "q1_a", "label": "先自己理解任务，再决定要不要用 AI" },
        { "id": "q1_b", "label": "先让 AI 帮我起草第一步" }
      ]
    }
  ]
}
```

## 3. 提交测评接口

### POST /api/assessment/submit

提交答案并获取评估结果。

**请求示例：**
```json
{
  "sceneId": "writing-report",
  "depth": "quick",
  "answers": [
    { "questionId": "q1", "optionId": "q1_b" },
    { "questionId": "q2", "optionId": "q2_c" }
  ]
}
```

**响应示例：**
```json
{
  "sceneId": "writing-report",
  "finalLevel": "limit",
  "baseRiskScore": 68,
  "triggeredRules": ["first_process_replaced", "dependency_signal_detected"],
  "dimensions": {
    "understanding": 15, "thinking": 62, "organization": 55, "execution": 30, "judgment": 42
  },
  "dominantPattern": "启动依赖",
  "riskReasons": [
    "你越来越依赖 AI 帮你启动第一步",
    "AI 已开始进入结构组织或第一版产出"
  ],
  "retainedCapabilities": [
    "你仍能完成局部修改",
    "你仍保留部分任务理解能力"
  ],
  "actionSuggestions": [
    "先自己完成首轮理解和结构，再使用 AI",
    "把 AI 限制在润色、检查、补充环节",
    "缩减对第一版生成的依赖"
  ]
}
```

## 4. 后续动作接口

### GET /api/assessment/follow-up/{level}?sceneId=...

获取指定等级的后续行动建议。

**响应示例：**
```json
{
  "sceneId": "writing-report",
  "level": "limit",
  "title": "你现在更适合限制 AI 介入范围",
  "riskReasons": ["你越来越依赖 AI 帮你启动第一步。"],
  "retainedCapabilities": ["你仍保留部分任务理解能力。"],
  "actions": [
    "先自己写出提纲，再让 AI 做补充",
    "不要直接让 AI 生成第一版完整内容",
    "优先收回首次理解和首次组织环节"
  ]
}
```

## 5. AI Core 接口

### POST /ai/explain

基于评估结果生成增强版风险解释。

**请求示例：**
```json
{
  "scene_id": "writing-report",
  "final_level": "limit",
  "base_risk_score": 68,
  "triggered_rules": ["first_process_replaced"],
  "risk_reasons": ["你越来越依赖 AI 帮你启动第一步。"],
  "retained_capabilities": ["你仍保留部分任务理解能力。"]
}
```

**响应示例：**
```json
{
  "scene_id": "writing-report",
  "enhanced_risk_reasons": ["..."],
  "enhanced_retained_capabilities": ["..."],
  "summary": "在 writing-report 场景中，你的 AI 使用风险评分为 68，建议等级为「limit」。"
}
```

### POST /ai/suggest

基于评估结果优化行动建议。

**请求示例：**
```json
{
  "scene_id": "writing-report",
  "final_level": "limit",
  "action_suggestions": ["先自己完成首轮理解和结构，再使用 AI。"],
  "triggered_rules": ["first_process_replaced"]
}
```

**响应示例：**
```json
{
  "scene_id": "writing-report",
  "enhanced_suggestions": ["..."],
  "priority": "中"
}
```

## 6. 对话式评估接口

### POST /ai/converse

基于多轮对话进行动态评估。AI 逐轮提问，5-7 轮后给出结论。

**请求示例：**
```json
{
  "scene_id": "writing-report",
  "scene_name": "写作与汇报",
  "focus_capabilities": ["基础理解能力", "自主思考能力", "独立拆解与组织能力"],
  "history": [
    {"role": "ai", "content": "你通常怎么开始写作任务？"},
    {"role": "user", "content": "我一般先看看要写什么，然后让 AI 帮我搭个框架"}
  ]
}
```

**响应示例（继续提问）：**
```json
{
  "type": "question",
  "message": "你让 AI 帮你搭框架之后，你会怎么处理它给你的内容？"
}
```

**响应示例（给出结论）：**
```json
{
  "type": "assessment",
  "message": "根据我们的对话，你在写作任务中已经开始让 AI 进入结构组织和首轮产出。...",
  "final_level": "limit",
  "risk_reasons": ["..."],
  "retained_capabilities": ["..."],
  "action_suggestions": ["..."]
}
```

## 7. API BFF 对话接口

### POST /api/assessment/converse

前端调用的对话评估 BFF 端点，封装了 AI Core 的 `/ai/converse` 调用。
