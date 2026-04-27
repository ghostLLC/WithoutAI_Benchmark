# 依赖与环境搭建说明

## 1. 当前结论

当前项目的正式技术栈已调整为：

- `apps/web`：Next.js + TypeScript
- `apps/api`：NestJS + TypeScript
- `services/ai-core`：Python + FastAPI
- `packages/shared`：TypeScript 共享类型与常量
- `contracts`：OpenAPI / JSON Schema / 示例协议

因此环境准备不再以 PHP / Composer / Laravel 为主，而是以 Node.js 与 Python 双环境为主。

---

## 2. Node.js 环境

### 推荐版本

- Node.js 20 LTS
- 包管理器建议：`pnpm`

### 建议安装方式

#### 方式 A：直接安装 Node.js
安装 Node.js 20 LTS 后执行：

```powershell
node -v
npm -v
```

#### 方式 B：安装 pnpm
```powershell
npm install -g pnpm
pnpm -v
```

---

## 3. Python 环境

### 推荐版本

- Python 3.11 或 3.12

### 验证命令

```powershell
python --version
```

如果系统只有 `python3`，则改用：

```powershell
python3 --version
```

### 虚拟环境建议

后续在 `services/ai-core/` 下建议使用虚拟环境：

```powershell
python -m venv .venv
.\.venv\Scripts\activate
```

---

## 4. API / Web 依赖建议

用于 `apps/web` 与 `apps/api`：

- Next.js
- React
- NestJS
- TypeScript
- Zod（可选，用于 schema 对齐）
- Prisma（推荐）
- PostgreSQL 驱动

后续安装方式以 monorepo 为准，优先使用 `pnpm workspace` 管理。

---

## 5. AI Core 依赖建议

用于 `services/ai-core`：

- FastAPI
- Uvicorn
- Pydantic
- httpx
- 各类 LLM SDK
- 后续按需要接入向量、检索、评估相关依赖

---

## 6. 数据与基础设施

### 主数据库
- PostgreSQL

### 本地 MVP 可选
- SQLite（仅本地开发验证用）

### 可选组件
- Redis：缓存 / 队列 / 异步任务
- pgvector / Milvus / Weaviate：后续向量检索需要时接入

---

## 7. 安装完成后的验证命令

建议至少验证：

```powershell
node -v
pnpm -v
python --version
```

若使用 PostgreSQL，本地也建议确认数据库连通性。

---

## 8. 推荐的最低可用环境

如果目标是尽快进入正式开发，最低建议如下：

1. 安装 Node.js 20 LTS
2. 安装 pnpm
3. 安装 Python 3.11+
4. 准备 PostgreSQL（本地或远程都可）
5. 后续按 monorepo 结构初始化 `apps/web`、`apps/api`、`services/ai-core`

---

## 9. 后续项目落地建议

当本机环境完成后，可直接继续以下动作：

1. 初始化 monorepo 目录结构
2. 建立 `apps/web`
3. 建立 `apps/api`
4. 建立 `services/ai-core`
5. 建立 `packages/shared` 与 `contracts`
6. 先打通：
   - 场景列表接口
   - 题目列表接口
   - 提交测评接口
   - AI 解释生成接口（可先 mock）

---

## 10. 补充说明

旧的 PHP / Laravel 相关说明已不再是正式方向。当前更应优先准备 Node.js + Python 双环境，以适配 Web 与 AI 分栈架构。
