import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from app.config import settings

def get_spotify_client() -> spotipy.Spotify:
    """Khởi tạo Spotify client với Client Credentials Flow."""
    auth_manager = SpotifyClientCredentials(
        client_id=settings.spotify_client_id,
        client_secret=settings.spotify_client_secret
    )
    return spotipy.Spotify(auth_manager=auth_manager)

async def search_track(track_name: str, artist_name: str) -> dict:
    """Tìm bài hát trên Spotify để lấy metadata cơ bản."""
    sp = get_spotify_client()
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
        "popularity": track["popularity"],  # 0-100
        "isrc": track.get("external_ids", {}).get("isrc"),
        "preview_url": track.get("preview_url"),   # 30s preview
        "source": "Spotify",
        "source_url": track["external_urls"].get("spotify")
    }

async def get_artist_info(artist_id: str) -> dict:
    """Lấy thông tin nghệ sĩ từ Spotify."""
    sp = get_spotify_client()
    artist = sp.artist(artist_id)
    return {
        "spotify_id": artist["id"],
        "name": artist["name"],
        "genres": artist.get("genres", []),
        "followers": artist["followers"]["total"],
        "popularity": artist["popularity"],
        "image_url": artist["images"][0]["url"] if artist.get("images") else None,
        "source": "Spotify",
        "source_url": artist["external_urls"].get("spotify")
    }

async def get_playlist_tracks(playlist_id: str) -> list[dict]:
    """
    Lấy danh sách bài hát từ playlist công khai.
    Dùng để scrape Spotify Charts playlist.
    """
    sp = get_spotify_client()
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
            "source_url": track["external_urls"].get("spotify")
        })
    return tracks