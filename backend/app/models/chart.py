from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base

class ChartEntry(Base):
    __tablename__ = "chart_entries"

    id           = Column(Integer, primary_key=True, index=True)
    track_name   = Column(String(255), nullable=False)
    artist_name  = Column(String(255), nullable=False)
    country      = Column(String(100), nullable=False, default="global")
    rank         = Column(Integer, nullable=False)
    playcount    = Column(Integer, default=0)
    listeners    = Column(Integer, default=0)
    source       = Column(String(50), default="Last.fm")
    source_url   = Column(String(500))
    recorded_at  = Column(DateTime, server_default=func.now())

class TrackMetadata(Base):
    __tablename__ = "track_metadata"

    id           = Column(Integer, primary_key=True, index=True)
    track_name   = Column(String(255), nullable=False)
    artist_name  = Column(String(255), nullable=False)
    mbid         = Column(String(100))          # MusicBrainz ID
    isrc         = Column(String(20))
    genre_tags   = Column(Text)                 # JSON string list
    duration_ms  = Column(Integer)
    youtube_id   = Column(String(20))
    lastfm_url   = Column(String(500))
    created_at   = Column(DateTime, server_default=func.now())
    updated_at   = Column(DateTime, onupdate=func.now())