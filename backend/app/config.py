from typing import Optional

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    gemini_api_key: str
    firebase_cert_path: str
    lastfm_api_key: str
    youtube_api_key: str
    # Optional: nếu có thì gọi Reddit qua OAuth (oauth.reddit.com) để không bị
    # chặn IP cloud; nếu không, fallback về public JSON (chỉ chạy ở IP nhà).
    reddit_client_id: Optional[str] = None
    reddit_client_secret: Optional[str] = None
    reddit_user_agent: str
    spotify_client_id: str
    spotify_client_secret: str

    class Config:
        env_file = ".env"

settings = Settings()