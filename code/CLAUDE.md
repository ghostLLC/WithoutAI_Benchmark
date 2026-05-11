# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

WithoutAI Benchmark is a **task-level AI usage boundary detector** — it tells users whether they should continue, limit, or pause AI use for a specific task type. It is NOT an AI skills test or personality quiz. The product doc at `product-docs/ai-usage-product-doc-v1.md` is the source of truth for all product logic.

## Essential commands

All commands run from `code/`:

```bash
# Install (first time)
pnpm install
cd packages/shared && npx tsc && cd ../..
cd apps/api && npx prisma migrate dev --name init && npx prisma generate && npx tsx prisma/seed.ts

# Development (three terminals)
pnpm dev:api    # NestJS → :3000
pnpm dev:web    # Next.js → :3001
pnpm dev:ai     # FastAPI → :8000 (cd services/ai-core && uvicorn)

# Testing
pnpm test:api   # Jest — core scoring pipeline
pnpm test:ai    # pytest -v (22 tests, 3 suites)
pnpm test       # both

# Prisma (from apps/api/)
npx prisma generate                        # regenerate client after schema change
npx prisma migrate dev --name <name>       # create migration
npx tsx prisma/seed.ts                     # re-seed (wipes and repopulates)

# AI Core (from services/ai-core/)
pip install -r requirements.txt            # Python deps
python -m pytest tests/ -v                 # run Python tests
```

## Architecture

```
User → apps/web (Next.js 14 :3001) → apps/api (NestJS 10 :3000) → services/ai-core (FastAPI :8000)
                                           ↓                              ↓
                                     Prisma + SQLite               DeepSeek V4 (optional)
                                           ↓
                                     packages/shared (canonical TS types)
```

**Monorepo structure** (`code/`):
- `apps/web/` — Next.js 14 frontend (React 18, Tailwind CSS 4)
- `apps/api/` — NestJS 10 BFF (Prisma + SQLite, all business logic)
- `services/ai-core/` — FastAPI Python AI service (LLM-powered text enhancement)
- `packages/shared/` — canonical TS type definitions
- `contracts/` — API contract docs (request/response examples)
- `product-docs/` — product design documents (source of truth)

## Critical boundaries (do not violate)

1. **Frontend never holds scoring rules** and never calls AI Core directly
2. **AI Core only enhances text** (explain/suggest) — it does NOT decide `continue/limit/pause`
3. **API/BFF is the single business-logic owner** — all rule calculation, result assembly, and AI orchestration happens here
4. **Shared types** (`packages/shared/src/assessment.ts`) are the canonical TS type definitions

## Assessment pipeline (the core)

When `POST /api/assessment/submit` is called, 6 services execute in order:

1. **RiskScoreCalculator** — computes 5-dimension risk profile, applies scene-aware weights (`SCENE_WEIGHTS` matrix with per-dimension multipliers), fits to 0-100. Also computes `completionAvgScore` from "脱离AI可完成度" category questions.
2. **TriggerRuleEngine** — collects `triggerTags` from selected options (deduplicated). Key tags: `first_process_replaced`, `dependency_signal_detected`, `cannot_finish_without_ai`, `core_step_fully_replaced`
3. **ResultLevelDecider** — thresholds: `<35 continue | 35-69 limit | ≥70 pause`. Pattern correction (全面退化→pause), trigger escalation, single-dimension ≥80 overwrite, and completion safety net (`completionAvgScore ≥ 70` forces at least `limit`)
4. **ResultBuilder** — queries `FollowUp` table by sceneId+level, assembles riskReasons, retainedCapabilities, actionSuggestions
5. **ConsistencyChecker** — cross-validates 8 question pairs (2 per scene). Risk level gap ≥ 2 flags inconsistency, sets `suggestionLevel = 'limit'`
6. **AiCoreService** — parallel calls to `/ai/explain` and `/ai/suggest` (2s timeout each). On failure: silent fallback to database text. Detects success via `summary !== null` / `priority !== null`

## Database (Prisma + SQLite)

Four models: `Scene` → `Question` → `QuestionOption` + `FollowUp` (unique on sceneId+level).

JSON arrays (`signals`, `triggerTags`, `depthLevels`, `examples`, etc.) are stored as strings in SQLite and parsed at the repository layer.

**The seed file** (`apps/api/prisma/seed.ts`) is the single source of truth for all questions, options, scores, and follow-up content. After any scoring or content change, re-seed: `npx tsx prisma/seed.ts`.

Question scoring quality varies by scene: writing/learning scene questions are hand-crafted with precise per-option dimension scores. Coding/data scenes use `dimsForCategory()` templates for deep-tier questions. When adjusting scoring, calibrate the hand-crafted questions first.

## Product principles (4 hard constraints)

All code and copy must respect:
1. **No personality judgment** — conclusions are about "current task + current usage pattern", never about the person
2. **No moralizing** — never say "you're too dependent" or "you should reflect". Present facts and risks only
3. **No AI usage advice** — don't discuss prompt techniques, collaboration methods, or efficiency tips
4. **Answer only one boundary question** — is AI assisting you or replacing you on this task?

## AI Core (Python/FastAPI)

Three endpoints: `POST /ai/explain`, `POST /ai/suggest`, `POST /ai/converse`.

LLM client factory (`app/llm/factory.py`) auto-selects:
- `AI_CORE_LLM_API_KEY` set → `OpenAIClient` (DeepSeek-compatible)
- No key → `MockLLMClient` (returns `[mock]` placeholder → fallback template text in routers)

Converse mode uses DeepSeek V4 with a system prompt that enforces product boundaries, 5-dimension scoring guidelines, and structured JSON output (`type: "question"` or `type: "assessment"`).

## Key types (`packages/shared/src/assessment.ts`)

- `AssessmentLevel = 'continue' | 'limit' | 'pause'` — the three output tiers
- `AssessmentResult` — unified response shape; includes optional `consistencyCheck` (`ConsistencyResult`)
- `Dimension = 'understanding' | 'thinking' | 'organization' | 'execution' | 'judgment'` — 5-dimension vector
- `QuestionOption` carries `riskScore`, `dimensionScores` (5-dim Record), `signals` (RiskSignal[]), and `triggerTags` (string[]) — these drive the entire scoring pipeline
- `RiskPattern` — 全面退化 | 替代模式 | 启动依赖 | 外围依赖 | 健康辅助

## Scene-aware weights

Each scene weights its critical dimensions higher:
| Scene | High weight (×1.5) | Low weight (×0.7) |
|---|---|---|
| writing-report | thinking, organization | execution |
| learning-material | understanding, thinking | execution |
| basic-coding | execution, organization | understanding |
| basic-data | judgment, understanding | thinking |

## Testing

- API tests: Jest (`apps/api/jest.config.ts`). One spec file at `result-level-decider.spec.ts` — tests the 5-layer decision logic with 30 cases.
- AI Core tests: pytest, 3 files — `test_llm_factory.py`, `test_routers.py`, `test_schemas_prompts.py` (22 tests total).
- When changing scoring logic, add cases to the Jest spec. When changing AI prompts, add cases to `test_schemas_prompts.py`.
