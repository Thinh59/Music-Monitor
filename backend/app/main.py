from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import charts, trends, map, prediction, briefing
from app.scheduler import start_scheduler

app = FastAPI(title="Global Music Intelligence Monitor", version="1.0.0")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"], # Tùy chỉnh lúc deploy
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(charts.router, prefix="/api/charts", tags=["Charts"])
app.include_router(trends.router, prefix="/api/trends", tags=["Trends"])
app.include_router(map.router, prefix="/api/map", tags=["Map"])
app.include_router(prediction.router, prefix="/api/prediction", tags=["Prediction"])
app.include_router(briefing.router, prefix="/api/briefing", tags=["Briefing"])

@app.on_event("startup")
async def startup_event():
    start_scheduler()

@app.get("/health")
async def health():
    return {"status": "ok", "message": "Backend is running!"}