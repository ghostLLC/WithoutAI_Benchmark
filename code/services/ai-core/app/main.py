"""AI Core 服务入口。"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.routers import explain, suggest, converse


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期：启动时初始化，关闭时清理。"""
    settings = get_settings()

    # 配置日志
    logging.basicConfig(
        level=getattr(logging, settings.log_level.upper(), logging.INFO),
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    logger = logging.getLogger(__name__)

    logger.info(
        "AI Core starting — LLM enabled=%s, model=%s",
        settings.enable_llm and bool(settings.llm_api_key),
        settings.llm_model,
    )

    yield

    logger.info("AI Core shutting down")


app = FastAPI(
    title="WithoutAI AI Core",
    description="AI 核心能力服务：风险解释生成、行动建议优化",
    version="0.2.0",
    lifespan=lifespan,
)

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── 全局异常处理 ──
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger = logging.getLogger(__name__)
    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "AI Core 内部错误，请稍后重试"},
    )


# ── 路由 ──
app.include_router(explain.router, prefix="/ai", tags=["explain"])
app.include_router(suggest.router, prefix="/ai", tags=["suggest"])
app.include_router(converse.router, prefix="/ai", tags=["converse"])


# ── 健康检查 ──
@app.get("/health")
async def health_check():
    settings = get_settings()
    llm_configured = settings.enable_llm and bool(settings.llm_api_key)

    llm_reachable = False
    if llm_configured:
        try:
            from app.llm.factory import create_llm_client
            client = create_llm_client()
            llm_reachable = await client.health_check()
        except Exception:
            llm_reachable = False

    return {
        "status": "ok",
        "service": "ai-core",
        "version": "0.2.0",
        "llm_enabled": llm_configured,
        "llm_model": settings.llm_model if llm_configured else "mock",
        "llm_reachable": llm_reachable,
    }
