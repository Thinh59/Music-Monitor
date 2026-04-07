from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    gemini_api_key: str
    firebase_cert_path: str
    lastfm_api_key: str
    youtube_api_key: str
    # reddit_client_id: str
    # reddit_client_secret: str
    reddit_user_agent: str
    spotify_client_id: str
    spotify_client_secret: str

    class Config:
        env_file = ".env"

settings = Settings()