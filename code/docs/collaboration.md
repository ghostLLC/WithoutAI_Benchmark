# 协作约定

## 目录边界

- 前端：`apps/web/`
- API / BFF：`apps/api/`
- AI Core：`services/ai-core/`
- 共享层：`packages/shared/`
- 协议层：`contracts/`
- 文档：`docs/`

## 并行开发原则

1. 共享字段改动优先更新 `packages/shared/` 与 `contracts/`
2. 涉及 API 变更时，先改契约文档，再改实现
3. AI Core 不直接决定前端展示协议，由 API 层统一收口
4. 前端不内嵌业务评分规则，只消费 API 输出
5. Web 与 AI 分栈开发，但必须通过统一协议对齐

## 当前建议分工

- Web 前端：页面骨架、答题流、结果页、响应式布局
- API / BFF：场景配置、题目配置、测评提交、结果聚合、AI 编排
- AI Core：解释生成、建议生成、未来 RAG / Agent / Eval 能力
- Shared / Contracts：由涉及字段变更的一方优先维护，再同步其他方

## 当前协作约定

当前仓库已完成旧骨架向正式分栈架构的迁移，后续协作统一按以下规则执行：

1. 新功能只落到 `apps/ services/ packages/ contracts/`
2. 字段或协议变更时，优先同步 `packages/shared/` 与 `contracts/`
3. API 层统一对前端收口，AI Core 不直接暴露给前端
4. 不再以旧目录结构作为开发参考或扩展基础

