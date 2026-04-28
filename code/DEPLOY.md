# $0 部署指南 — Vercel + Railway

## 前置

1. 注册 [Vercel](https://vercel.com)（用 GitHub 账号直接登录）
2. 注册 [Railway](https://railway.app)（也绑 GitHub）
3. 注册 [DeepSeek](https://platform.deepseek.com) 拿 API Key（对话模式才需要，可跳过）
4. 把项目推送到 GitHub 公开仓库

---

## 第一步：Vercel 部署前端

1. 打开 [vercel.com/new](https://vercel.com/new)
2. **Import** → 选择你的 GitHub 仓库
3. 配置：
   | 设置项 | 值 |
   |---|---|
   | Root Directory | `code` |
   | Framework | Next.js（自动识别） |
4. **Environment Variables** 添加：
   ```
   NEXT_PUBLIC_API_URL  =  https://你的Railway-API地址.up.railway.app/api
   ```
   （Railway 地址先随便填 `https://placeholder.up.railway.app/api`，等 Railway 部署完再回来改成真的）

5. 点 **Deploy**，等 1 分钟就好。

> 完成后你会得到一个 `https://xxx.vercel.app` 地址。

---

## 第二步：Railway 部署 API 和 AI Core

### 2.1 创建项目

打开 [railway.app/new](https://railway.app/new)，选择 **Deploy from GitHub repo** → 选同一个仓库。

### 2.2 添加 API 服务

1. 在项目中点 **+ New Service**，再次选同一个 GitHub 仓库
2. 服务名改叫 `api`，Root Directory 填 `code`
3. 切到 **Settings** 页，修改：
   - **Build Command**：
     ```
     pnpm install && pnpm --filter @without-ai/shared build && npx prisma generate --schema=apps/api/prisma/schema.prisma && npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma && npx tsx apps/api/prisma/seed.ts && pnpm --filter @without-ai/api build
     ```
   - **Start Command**：
     ```
     node apps/api/dist/main.js
     ```
4. **Environment Variables** 添加：
   ```
   DATABASE_URL  =  file:/data/dev.db
   AI_CORE_URL   =  http://localhost:8000
   PORT          =  3000
   ```
5. 点 **Deploy**

### 2.3 添加 AI Core 服务

Railway 免费额度紧张的话，AI Core 可以先跳过（测评模式不依赖它，对话模式才需要）。

1. **+ New Service** → 同一个仓库 → 命名 `ai-core`，Root Directory 填 `code`
2. **Settings**：
   - **Build Command**：
     ```
     pip install -r services/ai-core/requirements.txt
     ```
   - **Start Command**：
     ```
     cd services/ai-core && uvicorn app.main:app --host 0.0.0.0 --port 8000
     ```
3. **Environment Variables**：
   ```
   AI_CORE_LLM_API_KEY   =  sk-你的DeepSeek key
   AI_CORE_LLM_BASE_URL  =  https://api.deepseek.com
   AI_CORE_LLM_MODEL     =  deepseek-v4-flash
   AI_CORE_ENABLE_LLM    =  true
   ```

### 2.4 关联两个 Railway 服务

回到 API 服务的 **Environment Variables**，把 `AI_CORE_URL` 改为 AI Core 服务的内部域名（Railway 内网的 `Variables` 标签页可以看到）。

如果没部署 AI Core，可以跳过这一步。前端和 API 已经可以正常工作了。

---

## 第三步：回到 Vercel 改环境变量

Railway 部署完，API 服务会有一个公开地址，类似：
```
https://xxx.up.railway.app
```

回到 Vercel → 你的项目 → Settings → Environment Variables，把 `NEXT_PUBLIC_API_URL` 改成：
```
https://xxx.up.railway.app/api
```
Redeploy 一次。

---

## 搞定

打开 Vercel 给的地址（`https://xxx.vercel.app`），你应该能看到完整的应用了。

### 成本

| 项目 | 月费 |
|---|---|
| Vercel | $0 |
| Railway（API） | 额度内 $0 |
| Railway（AI Core） | 额度内 $0 |
| **合计** | **$0** |

Railway 每月给 $5 免费额度。两个小服务跑不满 $5，除非访问量很大。
