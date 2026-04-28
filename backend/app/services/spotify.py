"""Spotify wrapper — lazy init + clear error reasons.

Trả về `(client, reason)` tuple từ `_get_spotify_client()`. Caller dùng `reason`
để báo lý do cụ thể với người dùng (missing_env / invalid_credentials / ...).
"""

from __future__ import annotations

import spotipy
from spotipy.oauth2 import SpotifyClientCredentials, SpotifyOauthError
from app.config import settings


class SpotifyConfigError(Exception):
    """Lỗi cấu hình Spotify — kèm `reason` code để frontend render message."""

    def __init__(self, reason: str, message: str):
        super().__init__(message)
        self.reason = reason


def _get_spotify_client() -> spotipy.Spotify:
    """Lazy-init Spotify client. Raise SpotifyConfigError với reason cụ thể."""
    cid = (settings.spotify_client_id or "").strip()
    secret = (settings.spotify_client_secret or "").strip()

    if not cid or not secret:
        raise SpotifyConfigError(
            "missing_env",
            "Thiếu SPOTIFY_CLIENT_ID hoặc SPOTIFY_CLIENT_SECRET trong backend/.env",
        )

    auth_manager = SpotifyClientCredentials(client_id=cid, client_secret=secret)
    return spotipy.Spotify(auth_manager=auth_manager)


def _wrap_call(fn):
    """Decorator: bắt SpotifyOauthError → SpotifyConfigError(invalid_credentials)."""

    async def wrapper(*args, **kwargs):
        try:
            return await fn(*args, **kwargs)
        except SpotifyOauthError as e:
            raise SpotifyConfigError(
                "invalid_credentials",
                f"Credentials Spotify không hợp lệ: {e}",
            )
        except spotipy.SpotifyException as e:
            if e.http_status == 429:
                raise SpotifyConfigError("rate_limit", "Spotify rate-limit, thử lại sau.")
            if e.http_status == 401:
                raise SpotifyConfigError(
                    "invalid_credentials",
                    "Spotify trả 401 — kiểm tra Client ID/Secret.",
                )
            raise

    return wrapper


@_wrap_call
async def search_track(track_name: str, artist_name: str) -> dict:
    """Tìm bài hát trên Spotify để lấy metadata cơ bản."""
    sp = _get_spotify_client()
    results = sp.search(q=f"track:{track_name} artist:{artist_name}", type="track", limit=3)
    items = results.get("tracks", {}).get("items", [])
    if not items:
        return {}
    track = items[0]
    return {
        "spotify_id": track["id"],
        "name": track["name"],
        "artist": track["artists"][0]["name"],
        "album": track["album"]["name"],
        "release_date": track["album"]["release_date"],
        "duration_ms": track["duration_ms"],
        "explicit": track["explicit"],
        "popularity": track["popularity"],
        "isrc": track.get("external_ids", {}).get("isrc"),
        "preview_url": track.get("preview_url"),
        "source": "Spotify",
        "source_url": track["external_urls"].get("spotify"),
    }


@_wrap_call
async def get_artist_info(artist_id: str) -> dict:
    sp = _get_spotify_client()
    artist = sp.artist(artist_id)
    return {
        "spotify_id": artist["id"],
        "name": artist["name"],
        "genres": artist.get("genres", []),
        "followers": artist["followers"]["total"],
        "popularity": artist["popularity"],
        "image_url": artist["images"][0]["url"] if artist.get("images") else None,
        "source": "Spotify",
        "source_url": artist["external_urls"].get("spotify"),
    }


@_wrap_call
async def get_playlist_tracks(playlist_id: str) -> list[dict]:
    """Lấy danh sách bài hát từ playlist công khai."""
    sp = _get_spotify_client()
    results = sp.playlist_tracks(playlist_id, limit=50)
    tracks = []
    for item in results.get("items", []):
        track = item.get("track")
        if not track:
            continue
        tracks.append({
            "name": track["name"],
            "artist": track["artists"][0]["name"],
            "album": track["album"]["name"],
            "release_date": track["album"]["release_date"],
            "popularity": track["popularity"],
            "spotify_id": track["id"],
            "source": "Spotify Playlist",
            "source_url": track["external_urls"].get("spotify"),
        })
    return tracks
