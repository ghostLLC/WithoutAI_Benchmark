<div align="center">

<img src="https://img.shields.io/badge/status-MVP_ready-22c55e?style=for-the-badge" alt="status" />
<img src="https://img.shields.io/badge/deploy-Vercel_+_Railway-%23000?style=for-the-badge" alt="deploy" />
<img src="https://img.shields.io/badge/cost-$0/month-0d9488?style=for-the-badge" alt="cost" />

</div>

<br>

# WithoutAI Benchmark

### 你不是在用 AI，你是在被 AI 用吗？

一个**任务级 AI 使用边界判断工具**。它不教你怎么把 AI 用得更好——它帮你判断：**在当前任务上，AI 是在辅助你，还是在替代你。**

<br>

<div align="center">

| | 测评模式 | 对话模式 |
|---|---|---|
| 怎么用 | 选场景 → 答选择题 → 出结果 | 选场景 → AI 聊天 → 出结果 |
| 耗时 | ~2 分钟 | ~5 分钟 |
| 需要什么 | 仅浏览器 | 浏览器 + LLM API Key |
| 产出 | 风险仪表盘 + 五维评分 + 行动建议 | 同上 + AI 个性化解读 |

</div>

<br>

---

## 它会告诉你三件事

| # | 问题 | 答案 |
|---|---|---|
| ① | 我还该不该继续这样用 AI？ | **继续** · **限制** · **暂停** —— 三档结论 |
| ② | 为什么？风险出在哪？ | 五维能力画像 + 触发规则 + 主导风险模式 |
| ③ | 我应该怎么做？ | 针对本次任务的具体调整建议 |

---

## 它对标的能力维度

```
基础理解  ──  你是否还能自己读懂任务要求？
自主思考  ──  你是否还能自己启动思考和形成观点？
独立拆解  ──  你是否还能自己搭建结构和组织步骤？
基础执行  ──  你是否还能亲手完成关键操作？
判断产出  ──  你是否还能自己判断和验证结果？
```

> 每个维度 0-100 分。**低分 = 你还在自己手里**，高分 = AI 已在替代你。

---

## 它不是什么

| ❌ 不是 | ✅ 而是 |
|---------|---------|
| 人格测试 | 任务级行为判断 |
| AI 技巧评分 | AI 使用边界检测 |
| 教你怎么 Prompt | 告诉你该不该继续用 |
| 一次性结论 | 可重新测评、持续对照 |

---

## 快速开始

```bash
git clone https://github.com/ghostLLC/WithoutAI_Benchmark.git
cd WithoutAI_Benchmark/code

pnpm install                          # 安装依赖
cd packages/shared && npx tsc && cd ../..  # 编译共享类型

cd apps/api
npx prisma migrate dev --name init    # 初始化数据库
npx prisma generate
npx tsx prisma/seed.ts                # 灌入题库
cd ../..

cd services/ai-core
pip install -r requirements.txt       # AI Core 依赖
cd ../..

# 启动三个服务
pnpm dev:api    # → http://localhost:3000
pnpm dev:web    # → http://localhost:3001
pnpm dev:ai     # → http://localhost:8000
```

打开 `http://localhost:3001`，选一个场景开始测评。

> 测评模式不依赖 AI Core。对话模式需要先配好 DeepSeek API Key（见 `services/ai-core/.env.example`）。

---

## 架构

```
浏览器 (:3001)                   后端 (:3000)                   AI 引擎 (:8000)
┌──────────────────┐           ┌──────────────────┐           ┌──────────────────┐
│  Next.js 前端     │  ──POST── │  NestJS API/BFF   │  ──POST── │  FastAPI AI Core │
│                  │           │                  │           │                  │
│ • 场景选择        │           │ • 评分管线 (5步)   │           │ • 风险解释增强    │
│ • 测评答题        │           │ • 规则引擎        │           │ • 建议优化       │
│ • 对话模式        │           │ • Prisma + SQLite │           │ • 对话评估       │
│ • 结果仪表盘      │  ←─JSON── │ • AI 编排 + 降级   │  ←─JSON── │ • DeepSeek/Mock  │
└──────────────────┘           └──────────────────┘           └──────────────────┘
```

**硬边界**：前端不持有评分逻辑，AI Core 不取代业务规则。

---

## 项目结构

```text
WithoutAI_Benchmark/
├── README.md                      # 你在这
├── product-docs/                  # 产品文档（设计源头）
└── code/
    ├── apps/
    │   ├── web/                   # Next.js 14 前端
    │   └── api/                   # NestJS 后端
    │       └── prisma/            # Schema · 迁移 · 种子题库
    ├── services/ai-core/          # FastAPI AI 服务
    ├── packages/shared/           # TS 共享类型
    ├── contracts/                 # API 契约
    ├── docs/                      # 架构 · 协作约定
    ├── Dockerfile.*               # 三服务 Docker 镜像
    ├── docker-compose.yml         # 一键部署
    ├── vercel.json                # Vercel 配置
    ├── DEPLOY.md                  # $0 上线指南
    └── README.md                  # 详细技术文档
```

---

## 上线

两种方式，任选：

| 方式 | 成本 | 难度 | 适合 |
|------|------|------|------|
| [Vercel + Railway](code/DEPLOY.md) | **$0/月** | 低 | 快速上线、分享体验 |
| [Docker Compose](code/docker-compose.yml) | ~¥24/月 (轻量云) | 中 | 长期稳定运行 |

详见 [`code/DEPLOY.md`](code/DEPLOY.md)

---

## 技术栈

<div align="center">

| 层 | 技术 | 说明 |
|---|---|---|
| 前端 | **Next.js 14** · React 18 · Tailwind CSS 4 | 响应式 · 明亮主题 |
| 后端 | **NestJS** · Prisma · SQLite | 5 步评分管线 · 限流 · 校验 |
| AI | **FastAPI** · DeepSeek V4 | LLM 工厂模式 · 多级降级 |
| 共享 | **TypeScript** · pnpm workspace | 类型统一 · 契约优先 |
| 测试 | **Jest** · **pytest** | 22 + 8 测试覆盖核心管线 |
| 部署 | **Vercel** · **Railway** · Docker | $0 方案或自托管 |

</div>

---

## 产品原则

1. **不是人格判断**——不把人标签化。结论永远针对「这个任务 + 这个使用方式」
2. **不是道德说教**——不说「你太依赖了」「你应该反思」。只呈现事实和风险
3. **不教怎么用 AI**——本项目不讨论 Prompt 技巧、协作方法、效率优化
4. **只回答一个边界问题**——你现在还该不该继续这样用 AI

> 产品设计详见 [`product-docs/`](product-docs/)

---

## License

Private — All rights reserved.
