import httpx
from app.config import settings

BASE_URL = "https://ws.audioscrobbler.com/2.0/"

async def get_top_tracks_by_country(country: str, limit: int = 20) -> list[dict]:
    """Lấy top tracks theo quốc gia từ Last.fm."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(BASE_URL, params={
            "method": "geo.getTopTracks",
            "country": country,
            "api_key": settings.lastfm_api_key,
            "format": "json",
            "limit": limit
        })
        data = resp.json()
        tracks = data.get("tracks", {}).get("track", [])
        return [
            {
                "name": t["name"],
                "artist": t["artist"]["name"],
                "listeners": t.get("listeners", 0),
                "source": "Last.fm",
                "source_url": f"https://www.last.fm/music/{t['artist']['name'].replace(' ', '+')}/_/{t['name'].replace(' ', '+')}"
            }
            for t in tracks
        ]

async def get_global_top_tracks(limit: int = 20) -> list[dict]:
    """Top tracks toàn cầu tuần này."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(BASE_URL, params={
            "method": "chart.getTopTracks",
            "api_key": settings.lastfm_api_key,
            "format": "json",
            "limit": limit
        })
        data = resp.json()
        tracks = data.get("tracks", {}).get("track", [])
        return [
            {
                "rank": idx + 1,
                "name": t["name"],
                "artist": t["artist"]["name"],
                "playcount": t.get("playcount", 0),
                "listeners": t.get("listeners", 0),
                "source": "Last.fm",
                "source_url": "https://www.last.fm/charts"
            }
            for idx, t in enumerate(tracks)
        ]

async def get_artist_tags(artist_name: str) -> list[str]:
    """Lấy genre tags của nghệ sĩ từ Last.fm."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(BASE_URL, params={
            "method": "artist.getTopTags",
            "artist": artist_name,
            "api_key": settings.lastfm_api_key,
            "format": "json"
        })
        data = resp.json()
        tags = data.get("toptags", {}).get("tag", [])
        return [t["name"].lower() for t in tags[:5]]

async def get_top_tracks_multiple_countries(countries: list[str]) -> dict:
    """Lấy top tracks cho nhiều quốc gia — dùng cho Music Taste Map."""
    results = {}
    for country in countries:
        try:
            tracks = await get_top_tracks_by_country(country, limit=10)
            results[country] = tracks
        except Exception:
            results[country] = []
    return results