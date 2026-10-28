"""
Main FastAPI Application Entry Point.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import time

from app.core.config import settings
from app.core.logging import setup_logging
from app.api import trips, recommendations, itinerary, export

# Setup structured logging
setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Intelligent AI-powered personalized travel itinerary planner API.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ── CORS Middleware ──────────────────────────────────────────────────────────
# Allow frontend origins + wildcards in development
origins = settings.cors_origins_list
if "http://localhost:5173" not in origins:
    origins.append("http://localhost:5173")
if "http://localhost:3000" not in origins:
    origins.append("http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.app_env == "development" else origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request Logging Middleware ───────────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info(
        "%s %s -> Status %d (took %.2fms)",
        request.method,
        request.url.path,
        response.status_code,
        duration * 1000
    )
    return response


# ── Health Check ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "app": settings.app_name,
        "version": settings.app_version,
        "environment": settings.app_env,
        "ai_enabled": settings.ai_enabled,
        "supabase_configured": settings.supabase_configured
    }


# ── Mount API Routers ────────────────────────────────────────────────────────
API_PREFIX = "/api/v1"
app.include_router(trips.router, prefix=API_PREFIX)
app.include_router(recommendations.router, prefix=API_PREFIX)
app.include_router(itinerary.router, prefix=API_PREFIX)
app.include_router(export.router, prefix=API_PREFIX)


@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"Welcome to {settings.app_name} API",
        "docs": "/docs",
        "health": "/health"
    }
