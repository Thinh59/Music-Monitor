from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
from sqlalchemy.sql import func
from app.database import Base

class TrendSnapshot(Base):
    __tablename__ = "trend_snapshots"

    id                  = Column(Integer, primary_key=True, index=True)
    track_name          = Column(String(255), nullable=False)
    artist_name         = Column(String(255), nullable=False)
    youtube_video_id    = Column(String(20))
    youtube_views       = Column(Integer, default=0)
    youtube_likes       = Column(Integer, default=0)
    youtube_comments    = Column(Integer, default=0)
    youtube_growth_pct  = Column(Float, default=0.0)
    reddit_mentions_24h = Column(Integer, default=0)
    sentiment_score     = Column(Float, default=0.0)  # -1 đến 1
    viral_score         = Column(Float, default=0.0)  # 0 đến 100
    is_spike            = Column(Boolean, default=False)
    z_score             = Column(Float, default=0.0)
    recorded_at         = Column(DateTime, server_default=func.now())

class HitPrediction(Base):
    __tablename__ = "hit_predictions"

    id               = Column(Integer, primary_key=True, index=True)
    track_name       = Column(String(255), nullable=False)
    artist_name      = Column(String(255), nullable=False)
    hit_probability  = Column(Float, nullable=False)
    prediction_label = Column(String(50))     # "Potential Hit", "Watch", "Normal"
    confidence       = Column(String(20))
    features_json    = Column(Text)           # JSON string của input features
    predicted_at     = Column(DateTime, server_default=func.now())

class DailyBriefing(Base):
    __tablename__ = "daily_briefings"

    id           = Column(Integer, primary_key=True, index=True)
    content      = Column(Text, nullable=False)
    sources      = Column(Text)              # JSON list nguồn dùng
    generated_at = Column(DateTime, server_default=func.now())