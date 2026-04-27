# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

Following file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

WithoutAI Benchmark is a **task-level AI usage boundary detector**. It tells users whether they should continue, limit, or pause AI use for a specific task type — not whether they're "good at AI." The product doc in `product-docs/` is the source of truth for all product logic.

## Essential commands

```bash
# Install (run once)
cd code && pnpm install
cd packages/shared && npx tsc && cd ../..
cd apps/api && npx prisma migrate dev --name init && npx prisma generate && npx tsx prisma/seed.ts

# Development servers
pnpm dev:api     # NestJS on :3000
pnpm dev:web     # Next.js on :3001
pnpm dev:ai      # FastAPI on :8000

# Testing
pnpm test:api    # Jest (tests for core scoring)
pnpm test:ai     # pytest (22 tests, 3 suites)
pnpm test        # both

# Prisma
cd apps/api
npx prisma generate          # regenerate client after schema change
npx prisma migrate dev --name <name>  # create migration
npx tsx prisma/seed.ts       # re-seed (wipes and repopulates)

# AI Core
cd services/ai-core
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
python -m pytest tests/ -v
```

## Architecture

```
User → apps/web (Next.js :3001) → apps/api (NestJS :3000) → services/ai-core (FastAPI :8000)
                                        ↓                            ↓
                                  Prisma + SQLite             DeepSeek LLM (optional)
                                        ↓
                                  packages/shared (TS types)
                                  contracts/api-contracts.md
```

## Critical boundaries (do not violate)

1. **Frontend never holds scoring rules** and never calls AI Core directly
2. **AI Core only enhances text** (explain/suggest) — it does NOT decide `continue/limit/pause`
3. **API/BFF is the single business-logic owner** — all rule calculation, result assembly, and AI orchestration happens here
4. **Shared types** (`packages/shared/src/assessment.ts`) are the canonical TS type definitions for frontend and API

## Assessment pipeline (the core product logic)

When `POST /api/assessment/submit` is called, five services execute in order:

1. **RiskScoreCalculator** — sums `option.riskScore × question.weight` across all answers
2. **TriggerRuleEngine** — collects `triggerTags` from selected options (deduplicated). Key tags: `first_process_replaced`, `dependency_signal_detected`, `cannot_finish_without_ai`, `core_step_fully_replaced`
3. **ResultLevelDecider** — thresholds: `<35 continue | 35-69 limit | ≥70 pause`. Plus pattern-based correction (全面退化→pause, 替代模式→limit) and single-dimension ≥80→pause override. Escalation triggers (`first_process_replaced`/`dependency_signal_detected`) force continue→limit. Pause triggers (`cannot_finish_without_ai`/`core_step_fully_replaced`) force limit→pause.
4. **ResultBuilder** — reads `FollowUp` table for the scene+level combo, assembles `riskReasons`, `retainedCapabilities`, `actionSuggestions`
5. **AiCoreService** — calls AI Core `/ai/explain` and `/ai/suggest` in parallel (2s timeout). On failure, silently falls back to database text. Uses `summary !== null` / `priority !== null` to detect whether AI enhancement actually succeeded (fallback returns null for these fields).

## Database (Prisma + SQLite)

Four models: `Scene` → `Question` → `QuestionOption` + `FollowUp` (keyed by sceneId+level). JSON arrays are stored as strings in SQLite (`examples`, `focusCapabilities`, `signals`, `triggerTags`, etc.) and parsed at the repository layer.

The seed file (`prisma/seed.ts`) is the single source of truth for all questions, options, scores, and follow-up content. After any scoring or content change, re-seed: `npx tsx prisma/seed.ts`.

## AI Core (Python/FastAPI)

Two endpoints: `POST /ai/explain` and `POST /ai/suggest`. LLM client factory (`app/llm/factory.py`) auto-selects: `OpenAIClient` if `AI_CORE_LLM_API_KEY` is set, `MockLLMClient` otherwise. The mock client returns `[mock]` placeholder text — the fallback in the routers (`_build_fallback_response`) handles actual template-based text generation.

Prompt builders in `app/prompts/` enforce product boundaries: explain prompts forbid judgmental language and imperatives; suggest prompts provide actionable, scenario-specific advice.

## Key types (`packages/shared/src/assessment.ts`)

`AssessmentLevel = 'continue' | 'limit' | 'pause'`
`AssessmentResult` — the unified response shape for `POST /api/assessment/submit`
`QuestionOption` carries `riskScore`, `signals` (RiskSignal[]), and `triggerTags` (string[]) — these drive the entire scoring pipeline.
