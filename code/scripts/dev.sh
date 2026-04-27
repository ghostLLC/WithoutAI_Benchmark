#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "========================================"
echo "  WithoutAI Benchmark — Dev Environment"
echo "========================================"
echo ""

echo "Starting API server (NestJS :3000)..."
cd "$ROOT/apps/api" && pnpm dev &
API_PID=$!

echo "Starting Web frontend (Next.js :3001)..."
cd "$ROOT/apps/web" && pnpm dev &
WEB_PID=$!

echo "Starting AI Core (FastAPI :8000)..."
cd "$ROOT/services/ai-core" && python -m uvicorn app.main:app --reload --port 8000 &
AI_PID=$!

echo ""
echo "All services started:"
echo "  API:     http://localhost:3000"
echo "  Web:     http://localhost:3001"
echo "  AI Core: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all services"

trap "kill $API_PID $WEB_PID $AI_PID 2>/dev/null; exit" INT TERM
wait
