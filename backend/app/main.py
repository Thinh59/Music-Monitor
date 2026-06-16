import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import charts, trends, map, prediction, briefing, analysis, agent
from app.scheduler import start_scheduler

app = FastAPI(title="Global Music Intelligence Monitor", version="1.0.0")

# Cho phép localhost (mọi port) và mọi domain *.vercel.app (production + preview).
# Có thể override bằng biến môi trường ALLOWED_ORIGIN_REGEX khi dùng domain riêng.
ALLOWED_ORIGIN_REGEX = os.getenv(
    "ALLOWED_ORIGIN_REGEX",
    r"https?://(localhost|127\.0\.0\.1)(:\d+)?|https://([a-z0-9-]+\.)*vercel\.app",
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=ALLOWED_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(charts.router, prefix="/api/charts", tags=["Charts"])
app.include_router(trends.router, prefix="/api/trends", tags=["Trends"])
app.include_router(map.router, prefix="/api/map", tags=["Map"])
app.include_router(prediction.router, prefix="/api/prediction", tags=["Prediction"])
app.include_router(briefing.router, prefix="/api/briefing", tags=["Briefing"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(agent.router, prefix="/api/agent", tags=["Agent"])

@app.on_event("startup")
async def startup_event():
    start_scheduler()

@app.get("/health")
async def health():
    return {"status": "ok", "message": "Backend is running!"}