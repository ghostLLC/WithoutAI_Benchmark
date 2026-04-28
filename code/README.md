<div align="center">

# WithoutAI Benchmark

### 判断「现在还应不应该继续用 AI 完成这项工作」

一个聚焦 **AI 使用边界判断** 的测评系统。不是教用户如何更高效地使用 AI，而是帮助用户识别 —— 在当前任务里，自己是不是已经把关键能力交给 AI 了。

<p>
  <img alt="monorepo" src="https://img.shields.io/badge/monorepo-pnpm-%23f69220?style=flat-square" />
  <img alt="web" src="https://img.shields.io/badge/web-Next.js-111111?style=flat-square" />
  <img alt="api" src="https://img.shields.io/badge/api-NestJS-ea2845?style=flat-square" />
  <img alt="ai-core" src="https://img.shields.io/badge/ai--core-FastAPI-009688?style=flat-square" />
  <img alt="db" src="https://img.shields.io/badge/db-Prisma_+_SQLite-2D3748?style=flat-square" />
  <img alt="tests" src="https://img.shields.io/badge/tests-30_passing-22c55e?style=flat-square" />
  <img alt="license" src="https://img.shields.io/badge/license-private-red?style=flat-square" />
</p>

**先判断该不该继续用，再讨论怎么更好地用。**

</div>

---

## 这是什么

WithoutAI Benchmark 关注的不是"AI 用得熟不熟"，而是：

- 你是否已经从 **辅助使用 AI** 滑向 **替代使用 AI**
- 在某类具体任务里，你是否还保有 **最低限度的独立完成能力**
- 系统能否输出清晰的三档判断：**继续 / 限制 / 暂停**
- 五维能力画像：基础理解、自主思考、独立拆解、基础执行、判断产出

---

## 两种评估模式

### 测评模式

标准化问卷快速判断。

1. 选择任务场景，选择深度（快速 / 标准 / 深度）
2. 回答行为化选择题，覆盖起始方式、AI 介入位置、依赖惯性等维度
3. 系统基于加权风险分 + 触发规则引擎 + 五维评分输出三档结论
4. 获得原因解释、保留能力和行动建议

**特点**：稳定、可复现、无需 AI Core 也能跑。

### 对话模式

与 AI 评估师多轮自然交流，AI 根据对话内容直接给出五维评分和综合判断。

1. 选择任务场景
2. AI 评估师逐轮提问（5-7 轮），根据你的回答动态调整
3. 对话自然收束为评估结论，附带维度评分
4. 获得针对你具体使用习惯的个性化建议

**特点**：深入、自然、需要 AI Core + LLM API Key。两种模式共用同一套结果页结构。

---

## 当前支持的任务场景

| 场景 | 典型任务 | 重点保全的能力 |
|------|----------|---------------|
| 写作与汇报 | 周报、课程小结、汇报提纲 | 理解、思考、拆解与组织 |
| 学习与资料整理 | 读文章、整理资料、课程复习 | 理解、思考 |
| 基础编程 | 改 bug、写小功能、读代码 | 拆解与组织、执行、判断与产出 |
| 基础数据处理 | 表格清洗、简单统计、基础分析 | 理解、执行、判断与产出 |

---

## 项目状态

| 模块 | 状态 | 说明 |
|------|------|------|
| Web 前端 | ✅ 完成 | Next.js 14，双模式入口，明亮主题，响应式适配 |
| API / BFF | ✅ 完成 | NestJS + Prisma + SQLite，6 端点，完整校验 |
| AI Core | ✅ 完成 | FastAPI，3 端点（explain / suggest / converse），LLM + 多级降级 |
| 题库 | ✅ 完成 | 4 场景，五维评分向量，三档深度 |
| 测试 | ✅ 完成 | 22 AI Core + Jest API 测试，核心评分管线已覆盖 |
| 部署 | ✅ 就绪 | Vercel + Railway $0 方案，Docker Compose 自托管方案 |

---

## 技术架构

```
User → apps/web (Next.js :3001)
         ├─ 测评模式 → 选择题 → 五维评分 + 风险仪表盘
         └─ 对话模式 → 多轮聊天 → AI 估算维度分 + 综合判断
              ↓
       apps/api (NestJS :3000)
         ├─ 评分管线：Calculator → TriggerEngine → LevelDecider → Builder
         └─ AI 编排：并行调用 explain + suggest，2s 超时静默降级
              ↓
       services/ai-core (FastAPI :8000)
         ├─ /ai/explain   — 风险解释增强
         ├─ /ai/suggest   — 行动建议优化
         └─ /ai/converse  — 对话式评估（含五维评分）
              ↓
       DeepSeek / OpenAI-compatible LLM（可选）
```

### 边界约束

- **前端**：不持有评分规则，不直连 AI Core
- **API / BFF**：统一业务出口，负责规则计算、结果组装、AI 调用编排
- **AI Core**：测评模式下只增强解释与建议，不直接决定产品主规则；对话模式下 LLM 给出评分但仍受产品边界约束
- **Shared / Contracts**：保证跨模块字段与协议一致

---

## 仓库结构

```text
code/
├── apps/
│   ├── web/                    # Next.js 前端
│   └── api/                    # NestJS API / BFF
│       ├── prisma/             # schema / migrations / seed
│       └── src/
│           ├── common/         # Prisma / filter / middleware
│           └── modules/assessment/  # 评分管线 + 对话编排
├── services/
│   └── ai-core/                # FastAPI AI 服务
│       └── app/
│           ├── llm/            # LLM 客户端（OpenAI 兼容 + Mock）
│           ├── prompts/        # explain / suggest / converse prompt 模板
│           ├── routers/        # /ai/explain /ai/suggest /ai/converse
│           └── models/         # Pydantic schemas
├── packages/shared/            # TS 共享类型
├── contracts/                  # API 契约文档
├── docs/                       # 架构 / 协作 / 依赖说明
├── scripts/                    # 启动脚本
├── Dockerfile.api              # API Docker 镜像
├── Dockerfile.web              # 前端 Docker 镜像
├── Dockerfile.ai               # AI Core Docker 镜像
├── docker-compose.yml          # 一键部署编排
├── vercel.json                 # Vercel 部署配置
├── DEPLOY.md                   # Vercel + Railway $0 部署指南
├── .env.production.example     # 生产环境变量模板
├── start-dev.bat               # Windows 一键启动
├── pnpm-workspace.yaml
└── README.md
```

---

## 快速开始

### 环境要求

- Node.js 20+
- pnpm 8+
- Python 3.11+
- Git

### 1) 安装依赖

```bash
git clone https://github.com/ghostLLC/WithoutAI_Benchmark.git
cd WithoutAI_Benchmark/code
pnpm install
```

### 2) 构建 shared 包

```bash
cd packages/shared && npx tsc && cd ../..
```

### 3) 初始化数据库

```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
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
# Windows: 双击 start-dev.bat

# 或分别启动
pnpm dev:api     # API → http://localhost:3000
pnpm dev:web     # Web → http://localhost:3001
pnpm dev:ai      # AI Core → http://localhost:8000
```

### 6) 运行测试

```bash
pnpm test        # 运行全部测试
pnpm test:api    # 仅 API 测试
pnpm test:ai     # 仅 AI Core 测试（22 tests）
```

---

## 上线部署

两种方式：

| 方式 | 成本 | 适合 |
|------|------|------|
| Vercel + Railway | $0/月 | 快速上线、低流量 |
| Docker Compose（自托管 VPS）| ~¥24/月 | 稳定、可预期 |

详见 [`DEPLOY.md`](DEPLOY.md)

---

## 环境变量

### `apps/api/.env`

```env
DATABASE_URL="file:./dev.db"
AI_CORE_URL="http://localhost:8000"
PORT=3000
```

### `services/ai-core/.env`

```env
AI_CORE_LLM_API_KEY=
AI_CORE_LLM_MODEL=deepseek-v4-flash
AI_CORE_LLM_BASE_URL=https://api.deepseek.com
AI_CORE_ENABLE_LLM=false
```

> 不填 `AI_CORE_LLM_API_KEY` 也可以使用测评模式（自动降级到 mock/fallback）。对话模式需要 AI Core 已配置 LLM API Key。

---

## API 概览

### API / BFF

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/assessment/scenes` | 获取场景列表 |
| GET | `/api/assessment/scenes/:sceneId/questions?depth=` | 获取题目列表 |
| POST | `/api/assessment/submit` | 提交测评并返回结果 |
| POST | `/api/assessment/converse` | 对话式评估（需要 AI Core） |
| GET | `/api/assessment/follow-up/:level?sceneId=` | 获取 follow-up 建议 |

### AI Core

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | 健康检查（含 LLM 连通性） |
| POST | `/ai/explain` | 风险解释增强 |
| POST | `/ai/suggest` | 行动建议优化 |
| POST | `/ai/converse` | 对话式评估（含五维评分） |

详细定义见 `contracts/api-contracts.md`

---

## 测评链路

```
用户提交答案
  → [1] RiskScoreCalculator   — 五维风险向量累加 → 归一化 → 模式检测
  → [2] TriggerRuleEngine     — 收集触发标签（首次过程被替换 / 依赖信号 / 无法脱离AI…）
  → [3] ResultLevelDecider    — 基础分 <35 → continue | 35-69 → limit | ≥70 → pause
                                 + 跨维度模式校正 + 触发规则校正 + 单维≥80 强制 pause
  → [4] ResultBuilder         — 从数据库取 FollowUp 文案组装结果
  → [5] AiCoreService         — 调用 AI Core 增强文案（失败则静默降级）
  → 返回三档结论 + 五维评分 + 风险仪表盘 + 原因 + 保留能力 + 行动建议
```

---

## 文档索引

- 产品主文档：`../product-docs/ai-usage-product-doc-v1.md`
- 网页 PRD：`../product-docs/ai-usage-web-prd-pageflow-tasklist-v1.md`
- 架构设计：`docs/architecture.md`
- 协作约定：`docs/collaboration.md`
- 依赖说明：`docs/dependencies.md`
- API 契约：`contracts/api-contracts.md`

---

## License

Private — All rights reserved.
