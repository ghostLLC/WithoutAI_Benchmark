# WithoutAI Benchmark

<div align="center">

**AI Usage Boundary Detector — 任务级 AI 使用边界判断工具**

一个帮助你判断「现在还该不该继续用 AI 完成这类工作」的测评系统。交叉五维能力画像与触发规则引擎，输出 **继续 / 限制 / 暂停** 三档结论与可执行建议。

<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-111111?style=flat-square&logo=next.js&logoColor=white">
  <img alt="NestJS" src="https://img.shields.io/badge/NestJS-10-ea2845?style=flat-square&logo=nestjs&logoColor=white">
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi&logoColor=white">
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-SQLite-2D3748?style=flat-square&logo=prisma&logoColor=white">
  <img alt="pnpm" src="https://img.shields.io/badge/pnpm-workspace-F69220?style=flat-square&logo=pnpm&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript&logoColor=white">
  <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white">
  <img alt="DeepSeek" src="https://img.shields.io/badge/LLM-DeepSeek_V4-4F46E5?style=flat-square">
  <img alt="Tests" src="https://img.shields.io/badge/Tests-30_passing-22c55e?style=flat-square">
  <img alt="Deploy" src="https://img.shields.io/badge/Deploy-Vercel_+_Railway-000000?style=flat-square">
  <img alt="Cost" src="https://img.shields.io/badge/Cost-$0/month-0d9488?style=flat-square">
  <img alt="License" src="https://img.shields.io/badge/License-Private-red?style=flat-square">
</p>

</div>

---

## Overview

WithoutAI Benchmark 不是一个「AI 技巧测试」或「人格测评」，而是一个**任务级 AI 使用边界检测器**。它关注的核心问题只有一个：

> **在当前任务上，你现在的 AI 使用方式，是在辅助你，还是在替代你？**

系统围绕 5 个核心能力维度（基础理解、自主思考、独立拆解、基础执行、判断产出），通过**测评模式**（标准化问卷）或**对话模式**（AI 多轮访谈）收集行为数据，经五步评分管线后输出：

- **三档结论**：继续使用 / 限制使用 / 暂停使用
- **风险仪表盘**：0-100 综合风险分 + 五维雷达
- **触发规则**：哪些关键过程已被 AI 替代
- **保有能力**：哪些能力仍在你手里
- **行动建议**：3 条可执行的下一步调整

测评模式不依赖外部 AI 服务，仅浏览器即可完成。对话模式由 DeepSeek V4 驱动，AI 直接给出五维评分和个性化解读。

### 两种评估模式

| | 测评模式 | 对话模式 |
|---|---|---|
| 评估方式 | 标准化选择题（快速/标准/深度三档） | AI 评估师 5-7 轮自然对话 |
| 耗时 | ~2 分钟 | ~5 分钟 |
| 评分引擎 | 规则引擎（加权风险分 + 触发规则） | LLM 估算（prompt 约束 + 维度指南） |
| 依赖 | 仅浏览器 | 需要 AI Core + LLM API Key |
| 结果结构 | 风险分 + 五维评分 + 检测模式 + 触发规则 + 建议 | 同上（AI 直接输出五维评分和综合判断） |
| 可复现性 | 相同答案 = 相同结果 | 语义相近 = 结论相近 |

两种模式共用同一套结果页：结论横幅 → 评估概要 → 风险来源 → 保有能力 → 行动建议。

---

## Highlights

| 能力 | 说明 |
|---|---|
| **双模式评估** | 测评模式（规则引擎，无需 AI）+ 对话模式（LLM 访谈，含五维评分） |
| **五维能力画像** | 理解 / 思考 / 拆解 / 执行 / 判断，每维 0-100 分雷达图 |
| **风险仪表盘** | 半圆弧 gauge 展示综合风险分，三色分区（安全 / 警戒 / 危险） |
| **触发规则引擎** | 4 条关键规则（首次过程替代 / 依赖信号 / 无法脱离 AI / 核心步骤替代） |
| **三档结论** | continue（继续）/ limit（限制）/ pause（暂停），含跨维度模式校正 |
| **AI 增强层** | 测评模式下 LLM 增强解释与建议文本，对话模式下 AI 直接评分 |
| **静默降级** | AI Core 不可用时自动回退到数据库文案，不影响测评核心功能 |
| **多级测评深度** | 快速（核心风险）/ 标准（全维度）/ 深度（情境+自检），三档可选 |
| **响应式明亮主题** | 电脑 / 平板 / 手机三端适配，明亮色调优先，纯 CSS 变量体系 |
| **$0 部署** | Vercel + Railway 零成本上线，Docker Compose 自托管备选 |

---

## Architecture

```text
┌──────────────────────────────────────────────────────────────────────┐
│                         Browser (:3001)                              │
│   Next.js 14 · React 18 · Tailwind CSS 4 · 响应式明亮主题            │
│   首页 → 场景选择 → 测评答题 / 对话 → 结果仪表盘                      │
├──────────────────────────────────────────────────────────────────────┤
│                         API / BFF (:3000)                            │
│   NestJS 10 · Prisma · SQLite · 限流 · 校验                          │
│                                                                      │
│   POST /api/assessment/submit                                        │
│        ↓                                                             │
│   ┌──────────────────────────────────────────────────────┐           │
│   │              Assessment Pipeline (5 steps)            │           │
│   │                                                      │           │
│   │  ① RiskScoreCalculator  — 五维风险累加 → 模式检测    │           │
│   │  ② TriggerRuleEngine    — 收集触发标签               │           │
│   │  ③ ResultLevelDecider   — continue/limit/pause 判定  │           │
│   │  ④ ResultBuilder        — 组装 FollowUp 文案         │           │
│   │  ⑤ AiCoreService        — 并行增强 explain + suggest │           │
│   └──────────────────────────────────────────────────────┘           │
│                                                                      │
│   POST /api/assessment/converse → 代理到 AI Core /ai/converse        │
├──────────────────────────────────────────────────────────────────────┤
│                       AI Core (:8000)                                │
│   FastAPI · Python 3.12 · DeepSeek V4                                │
│                                                                      │
│   POST /ai/explain   — 风险解释增强（2s timeout）                    │
│   POST /ai/suggest   — 行动建议优化（2s timeout）                    │
│   POST /ai/converse  — 对话式评估（15s timeout，含五维评分）         │
│                                                                      │
│   LLM Factory: MockLLM (无 API Key) ←→ OpenAIClient (DeepSeek)       │
└──────────────────────────────────────────────────────────────────────┘
```

### Assessment Pipeline

```text
POST /api/assessment/submit { sceneId, depth, answers[] }
      ↓
① RiskScoreCalculator
   - option.riskScore × question.weight → 加权累加
   - option.dimensionScores → 五维向量聚合 → 归一化
   - 检测主导风险模式（全面退化 / 替代模式 / 启动依赖 / 外围依赖 / 健康辅助）
      ↓
② TriggerRuleEngine
   - 收集选中 option 的 triggerTags（去重）
   - 关键标签: first_process_replaced / dependency_signal_detected
              cannot_finish_without_ai / core_step_fully_replaced
      ↓
③ ResultLevelDecider
   - 基础阈值: <35 → continue | 35-69 → limit | ≥70 → pause
   - 跨维度模式校正: 全面退化 → pause / 替代模式 → limit
   - 触发规则校正: escalation → 继续→限制 / pause trigger → 限制→暂停
   - 单维度 ≥80 强制 pause
      ↓
④ ResultBuilder
   - 查询 FollowUp 表（sceneId + level → 文案模板）
   - 组装 riskReasons / retainedCapabilities / actionSuggestions
      ↓
⑤ AiCoreService
   - 并行调用 POST /ai/explain + POST /ai/suggest（各 2s timeout）
   - 成功: 替换为 LLM 增强文本
   - 失败: summary=null / priority=null → 静默降级为 DB 原文
      ↓
AssessmentResult { finalLevel, baseRiskScore, dimensions, dominantPattern,
                   triggeredRules, riskReasons, retainedCapabilities,
                   actionSuggestions, aiEnhanced, aiSummary }
```

### Converse Pipeline

```text
POST /api/assessment/converse { sceneId, sceneName, focusCapabilities, history[] }
      ↓
API BFF → AiCoreService.converse() → POST /ai/converse
      ↓
AI Core:
  - System prompt: 产品边界 + 五维评分指南 + 输出格式
  - LLM 逐轮输出 JSON: type=question（继续提问）或 type=assessment（给出结论）
  - assessment 包含: final_level / base_risk_score / dimensions / dominant_pattern
                      risk_reasons / retained_capabilities / action_suggestions
  - LLM 不可用时: fallback 预设问题序列（5 轮，含硬编码评分）
      ↓
前端: 收到 type=assessment → 组装 AssessmentResult → 跳转结果页
```

---

## Project Structure

```text
WithoutAI_Benchmark/
├── README.md                          # 你在这
├── product-docs/                      # 产品文档（设计源头）
│   ├── ai-usage-product-doc-v1.md     #   主文档：定位、逻辑、边界
│   └── ai-usage-web-prd-*.md          #   Web PRD：页面流、任务清单
└── code/
    ├── apps/
    │   ├── web/                       # Next.js 14 前端
    │   │   ├── src/app/
    │   │   │   ├── page.tsx           #   首页（从 API 拉取场景列表）
    │   │   │   ├── layout.tsx         #   全局布局（header + footer）
    │   │   │   ├── globals.css        #   设计 Token + 动画 + 组件样式
    │   │   │   ├── assessment/
    │   │   │   │   ├── page.tsx       #   场景选择页
    │   │   │   │   └── [slug]/
    │   │   │   │       ├── page.tsx           #   测评答题页（深度选择 + 答题）
    │   │   │   │       ├── result/page.tsx    #   结果页（仪表盘 + 建议）
    │   │   │   │       └── converse/page.tsx  #   对话评估页（聊天 UI）
    │   │   │   └── converse/page.tsx  #   对话模式全局入口
    │   │   └── src/lib/api.ts         #   API 请求封装（fetch wrapper）
    │   │
    │   └── api/                       # NestJS 10 后端
    │       ├── prisma/
    │       │   ├── schema.prisma       #   数据模型（Scene / Question / Option / FollowUp）
    │       │   ├── migrations/         #   迁移历史
    │       │   └── seed.ts             #   题库种子（4 场景 × 8 题 = 180+ option）
    │       └── src/
    │           ├── main.ts             #   应用入口（CORS + 全局管道）
    │           ├── app.module.ts       #   根模块
    │           ├── common/             #   通用层
    │           │   ├── prisma/         #   Prisma 服务
    │           │   ├── filters/        #   HTTP 异常过滤器
    │           │   └── middleware/     #   日志 + 限流
    │           └── modules/assessment/
    │               ├── assessment.controller.ts   # 6 端点（含 /health）
    │               ├── assessment.service.ts      # 核心编排逻辑
    │               ├── dto/                       # 请求校验 DTO
    │               ├── repositories/
    │               │   └── config.repository.ts   # Prisma 数据访问层
    │               └── services/
    │                   ├── risk-score-calculator.ts    # ① 五维评分
    │                   ├── trigger-rule-engine.ts      # ② 触发规则
    │                   ├── result-level-decider.ts     # ③ 结论判定
    │                   ├── result-builder.ts           # ④ 结果组装
    │                   └── ai-core.service.ts          # ⑤ AI 编排 + 对话代理
    │
    ├── services/
    │   └── ai-core/                    # FastAPI AI 服务
    │       ├── app/
    │       │   ├── main.py             #   应用入口
    │       │   ├── config.py           #   配置（pydantic-settings）
    │       │   ├── llm/
    │       │   │   ├── base.py         #   LLM 抽象基类
    │       │   │   ├── openai_client.py #   OpenAI-compatible 客户端
    │       │   │   └── factory.py      #   LLM 工厂（Mock / OpenAI 自动选择）
    │       │   ├── models/
    │       │   │   └── schemas.py      #   Pydantic 模型（请求 / 响应）
    │       │   ├── prompts/
    │       │   │   ├── explain.py      #   风险解释增强 prompt
    │       │   │   ├── suggest.py      #   行动建议优化 prompt
    │       │   │   └── converse.py     #   对话评估 system prompt（含五维评分指南）
    │       │   └── routers/
    │       │       ├── explain.py      #   POST /ai/explain
    │       │       ├── suggest.py      #   POST /ai/suggest
    │       │       └── converse.py     #   POST /ai/converse（含 fallback）
    │       ├── tests/
    │       │   ├── test_llm_factory.py     # LLM 工厂测试
    │       │   ├── test_routers.py         # 路由测试
    │       │   └── test_schemas_prompts.py # Schema + Prompt 测试
    │       └── requirements.txt
    │
    ├── packages/shared/               # TS 共享类型
    │   └── src/
    │       ├── assessment.ts           #   所有 TS 类型定义（单一数据源）
    │       └── index.ts               #   re-export
    │
    ├── contracts/
    │   └── api-contracts.md           # API 契约文档（请求 / 响应示例）
    ├── docs/
    │   ├── architecture.md            # 架构设计文档
    │   ├── collaboration.md           # 协作约定
    │   └── dependencies.md            # 依赖说明
    ├── scripts/
    │   ├── dev.sh                     # 一键启动（macOS / Linux）
    │   └── dev.ps1                    # 一键启动（Windows PowerShell）
    ├── Dockerfile.api                 # API Docker 镜像
    ├── Dockerfile.web                 # 前端 Docker 镜像
    ├── Dockerfile.ai                  # AI Core Docker 镜像
    ├── docker-compose.yml             # 一键部署编排（三服务）
    ├── vercel.json                    # Vercel 构建配置
    ├── DEPLOY.md                      # Vercel + Railway $0 部署指南
    ├── .env.production.example        # 生产环境变量模板
    └── start-dev.bat                  # Windows 一键启动
```

---

## Core Modules

### 1. `risk-score-calculator.ts` — 五维风险评分与模式检测

加权累加所有选中选项的风险分与维度分，输出综合风险指数和主导模式识别。

| 指标 | 计算方式 |
|---|---|
| baseRiskScore | Σ(option.riskScore × question.weight)，归一化到 0-100 |
| dimensions[5] | Σ(option.dimensionScores[dim])，五维独立累加 |
| dominantPattern | 基于五维分布特征的模式识别（5 种） |

**5 种风险模式**：

| 模式 | 特征 | 影响 |
|---|---|---|
| 全面退化 | 多维度同时高分（≥70） | 强制 pause |
| 替代模式 | 思考+拆解高分，执行尚低 | 强制 ≥ limit |
| 启动依赖 | 起始环节风险突出 | 指示性 |
| 外围依赖 | 各维度中等风险 | 指示性 |
| 健康辅助 | 各维度低风险 | 维持 continue |

### 2. `trigger-rule-engine.ts` — 关键触发规则检测

从用户所选选项的 `triggerTags` 中收集去重标签，4 条关键规则：

| 触发规则 | 含义 | 效应 |
|---|---|---|
| `first_process_replaced` | AI 已替代任务启动环节 | escalation：continue → limit |
| `dependency_signal_detected` | 检测到对 AI 的持续依赖信号 | escalation：continue → limit |
| `cannot_finish_without_ai` | 离开 AI 难以独立完成任务 | pause trigger：limit → pause |
| `core_step_fully_replaced` | 核心步骤已被 AI 完全替代 | pause trigger：limit → pause |

### 3. `result-level-decider.ts` — 三档结论判定

四层判定逻辑，按优先级依次执行：

```text
① 基础阈值: baseRiskScore < 35 → continue | 35-69 → limit | ≥70 → pause
② 模式校正: 全面退化 → pause | 替代模式 + continue → limit
③ 规则校正: escalation trigger + continue → limit | pause trigger + limit → pause
④ 单维兜底: max(dimensions) ≥ 80 → pause
```

### 4. `result-builder.ts` — 结果文案组装

根据 `sceneId` + `level` 查询 `FollowUp` 表，获取对应等级的文案模板：

- `riskReasons[]`：2-3 条具体风险来源
- `retainedCapabilities[]`：1-2 条仍保有的能力
- `actionSuggestions[]`：3 条可执行的调整行动

每个场景 × 每个等级（continue / limit / pause）各有一组文案，共 12 条记录。

### 5. `ai-core.service.ts` — AI 增强编排

双向 AI 集成：

**测评增强**（静默降级）：
```typescript
const [explain, suggest] = await Promise.all([
  fetch(`${AI_CORE_URL}/ai/explain`, { signal: AbortSignal.timeout(2000) }),
  fetch(`${AI_CORE_URL}/ai/suggest`, { signal: AbortSignal.timeout(2000) }),
]);
// 成功 → 替换为 LLM 增强文本
// 失败 → summary=null / priority=null → 保持 DB 原文
```

**对话代理**（透传）：
```typescript
const res = await fetch(`${AI_CORE_URL}/ai/converse`, {
  signal: AbortSignal.timeout(15000),
});
// 成功 → 返回 { type, message, finalLevel, dimensions, ... }
// 失败 → 返回 null → Controller 抛出 400
```

### 6. `ai-core/app/llm/factory.py` — LLM 客户端工厂

自动选择后端，不调用任何外部 API 时也能工作：

```python
if not settings.AI_CORE_LLM_API_KEY:
    return MockLLMClient()        # 返回 [mock] 占位文本
else:
    return OpenAIClient(          # DeepSeek / OpenAI-compatible
        api_key=...,
        base_url=...,
        model=...,
    )
```

`MockLLMClient` 返回 `[mock] 这是一个占位响应`，触发路由层 `_build_fallback_response()` 生成基于模板的正式文本。

### 7. `ai-core/app/prompts/converse.py` — 对话评估 System Prompt

定义 LLM 的完整行为约束，包含：

- **五维评分指南**：每维 0-100 分，0-30 健康、70-100 危险，附评分依据
- **对话规则**：一次一问、已覆盖不重复、口语化、不评判
- **产品边界**：不做人格评价、不说道德说教、不教 AI 技巧
- **JSON 输出格式**：question（继续提问）或 assessment（给出结论，含五维评分）

### 8. `prisma/seed.ts` — 题库种子

**单一数据源** — 所有题目、选项、分值、标签和 FollowUp 文案均定义在此，经 Prisma 写入 SQLite。

| 数据 | 数量 |
|---|---|
| 场景（Scene） | 4 |
| 题目（Question） | 32（每场景 8 题） |
| 选项（QuestionOption） | 180+ |
| FollowUp 文案 | 12（4 场景 × 3 等级） |

每个选项携带完整评分元数据：

```typescript
interface OptDef {
  label: string;           // 选项文本
  riskLevel: string;       // continue / limit / pause
  dims: [number x5];       // 五维分数向量
  signals: string[];       // weakening / replacement / dependency
  triggers: string[];      // 触发标签
}
```

---

## Quick Start

### 环境要求

- **Node.js** 20.x
- **pnpm** 9.x
- **Python** ≥ 3.11
- **Git**

### 1) 克隆与安装

```bash
git clone https://github.com/ghostLLC/WithoutAI_Benchmark.git
cd WithoutAI_Benchmark/code

pnpm install
```

### 2) 编译共享类型

```bash
cd packages/shared
npx tsc
cd ../..
```

### 3) 初始化数据库

```bash
cd apps/api

# 执行迁移
npx prisma migrate dev --name init

# 生成 Prisma Client
npx prisma generate

# 灌入题库种子（4 场景 × 8 题 × N 选项 + 12 FollowUp）
npx tsx prisma/seed.ts

cd ../..
```

### 4) 安装 AI Core 依赖

```bash
cd services/ai-core
pip install -r requirements.txt
cd ../..
```

### 5) 启动

```bash
# 三个终端分别启动，或 Windows 双击 start-dev.bat

pnpm dev:api     # NestJS API    → http://localhost:3000
pnpm dev:web     # Next.js 前端  → http://localhost:3001
pnpm dev:ai      # FastAPI AI    → http://localhost:8000
```

打开 `http://localhost:3001`，选一个场景开始测评。

> 测评模式不依赖 AI Core 和任何 LLM API Key。对话模式需要先配置 `AI_CORE_LLM_API_KEY`。

### 6) 测试

```bash
pnpm test:api    # Jest（评分管线核心测试）
pnpm test:ai     # pytest -v（22 tests, 3 suites）
pnpm test        # 全部
```

---

## API Reference

### API / BFF（NestJS :3000）

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | 健康检查 |
| `GET` | `/api/assessment/scenes` | 获取所有启用的场景列表 |
| `GET` | `/api/assessment/scenes/:sceneId/questions?depth=` | 获取场景题目（depth: quick/standard/deep） |
| `POST` | `/api/assessment/submit` | 提交答案，返回完整 AssessmentResult |
| `POST` | `/api/assessment/converse` | 对话评估代理（需 AI Core） |
| `GET` | `/api/assessment/follow-up/:level?sceneId=` | 获取指定等级的 FollowUp 文案 |

### AI Core（FastAPI :8000）

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | 健康检查（含 LLM 连通性） |
| `POST` | `/ai/explain` | 增强风险解释文本 |
| `POST` | `/ai/suggest` | 优化行动建议文本 |
| `POST` | `/ai/converse` | 对话式评估（输出含五维评分） |

### 请求 / 响应示例

```bash
# 获取场景列表
curl http://localhost:3000/api/assessment/scenes

# 获取写作场景的快速测评题目
curl "http://localhost:3000/api/assessment/scenes/writing-report/questions?depth=quick"

# 提交测评
curl -X POST http://localhost:3000/api/assessment/submit \
  -H "Content-Type: application/json" \
  -d '{
    "sceneId": "writing-report",
    "depth": "quick",
    "answers": [
      {"questionId": "wr_q01", "optionId": "wr_q01_b"},
      {"questionId": "wr_q02", "optionId": "wr_q02_c"}
    ]
  }'
```

完整响应格式见 `code/contracts/api-contracts.md`

---

## Configuration

### API（`apps/api/.env`）

```env
DATABASE_URL="file:./dev.db"     # SQLite 文件路径
AI_CORE_URL=http://localhost:8000 # AI Core 地址
PORT=3000                         # 服务端口
```

### AI Core（`services/ai-core/.env`）

```env
AI_CORE_LLM_API_KEY=              # DeepSeek API Key（留空 = Mock 模式）
AI_CORE_LLM_BASE_URL=https://api.deepseek.com
AI_CORE_LLM_MODEL=deepseek-v4-flash
AI_CORE_ENABLE_LLM=true           # 是否启用 LLM（false = 强制 Mock）
AI_CORE_FALLBACK_ON_ERROR=true    # LLM 失败时是否降级
AI_CORE_LLM_MAX_TOKENS=1024
AI_CORE_LLM_TEMPERATURE=1.0
AI_CORE_LLM_RESPONSE_FORMAT_JSON=true
AI_CORE_LOG_LEVEL=INFO
```

> API Key 为空 = 测评模式正常工作（自动降级 Mock），对话模式不可用。

---

## Database

Prisma schema 定义的 4 个模型：

```text
Scene
  ├─ id / name / slug / summary
  ├─ examples[] / focusCapabilities[]
  ├─ enabled / sortOrder
  └─ Question[]

Question
  ├─ id / sceneId / type / questionType / category
  ├─ title / description
  ├─ weight / isHighWeight
  ├─ depthLevels[] / sortOrder / enabled
  └─ QuestionOption[]

QuestionOption
  ├─ id / questionId / label
  ├─ riskLevel / riskScore
  ├─ dimensionScores: { understanding, thinking, organization, execution, judgment }
  ├─ signals[] / triggerTags[]
  └─ sortOrder

FollowUp
  ├─ sceneId + level (unique)
  ├─ title
  ├─ riskReasons[] / retainedCapabilities[] / actionSuggestions[]
```

SQLite 下 JSON 数组以字符串存储，在 Repository 层解析。

---

## Deployment

### $0/月 — Vercel + Railway

| 组件 | 平台 | 说明 |
|---|---|---|
| 前端 | Vercel | 自动检测 Next.js，设置 Root Directory = `code` |
| API | Railway | Node.js 服务，设置 Build/Start 命令 |
| AI Core | Railway | Python 服务（可选，测评模式不需要） |

Railway 每月 $5 免费额度，两个小服务跑不满。详细步骤见 [`code/DEPLOY.md`](code/DEPLOY.md)

### 自托管 — Docker Compose

```bash
cp .env.production.example .env
# 编辑 .env 填入 API URL 和 DeepSeek Key

docker compose up -d --build
```

三个服务自动编排：web (:3001) + api (:3000) + ai-core (:8000)

---

## Product Principles

四个硬约束，所有代码和文案必须遵守：

1. **不做人格判断** — 不把人标签化。结论永远针对「当前任务 + 当前使用方式」
2. **不做道德说教** — 不说「你太依赖了」「你应该反思」。只呈现事实和风险
3. **不教怎么用 AI** — 不讨论 Prompt 技巧、协作方法、效率优化
4. **只回答一个边界问题** — 在当前任务上，以当前使用方式，AI 是在辅助你还是在替代你

产品设计详见 `product-docs/`

---

## Roadmap

- [x] MVP：4 场景 × 标准化测评 × 三档结论
- [x] 对话模式：AI 评估师多轮访谈
- [x] AI 增强文本（explain + suggest）
- [x] 对话模式 AI 直接输出五维评分
- [x] 双模式共用统一结果页结构
- [x] 风险仪表盘（gauge + 维度条 + 触发规则展示）
- [x] 响应式明亮主题
- [x] Docker Compose 部署
- [x] Vercel + Railway $0 部署方案
- [x] 线上运行: [without-ai-benchmark.vercel.app](https://without-ai-benchmark.vercel.app)
- [ ] 更多任务场景
- [ ] 场景对比：同一用户跨场景 AI 使用画像
- [ ] HTTPS 与自定义域名

---

## License

Private — All rights reserved.
