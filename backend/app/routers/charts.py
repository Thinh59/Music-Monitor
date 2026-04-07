# from fastapi import APIRouter, Query
# from app.services.lastfm import get_global_top_tracks, get_top_tracks_by_country

# router = APIRouter()

# @router.get("/global")
# async def global_top_charts(limit: int = Query(20, le=50)):
#     """Top tracks toàn cầu — nguồn: Last.fm."""
#     tracks = await get_global_top_tracks(limit=limit)
#     return {"data": tracks, "source": "Last.fm chart.getTopTracks"}

# @router.get("/country/{country}")
# async def country_top_charts(country: str, limit: int = Query(20, le=50)):
#     """Top tracks theo quốc gia — nguồn: Last.fm."""
#     tracks = await get_top_tracks_by_country(country=country, limit=limit)
#     return {"data": tracks, "country": country, "source": "Last.fm geo.getTopTracks"}

from fastapi import APIRouter, Query
from app.services.lastfm import get_global_top_tracks, get_top_tracks_by_country
from app.services.spotify import get_playlist_tracks

router = APIRouter()

# Spotify Global Top 50 playlist ID (public)
SPOTIFY_GLOBAL_TOP50_ID = "37i9dQZEVXbMDoHDwVN2tF"
# Spotify Viral 50 Global
SPOTIFY_VIRAL50_ID = "37i9dQZEVXbLiRSasKsNU9"


@router.get("/global")
async def global_top_charts(limit: int = Query(50, le=200)):
    """
    Top tracks toàn cầu từ Last.fm.
    Nguồn: Last.fm chart.getTopTracks
    """
    tracks = await get_global_top_tracks(limit=limit)
    return {
        "data":       tracks,
        "total":      len(tracks),
        "source":     "Last.fm chart.getTopTracks",
        "source_url": "https://www.last.fm/charts",
    }


@router.get("/country/{country}")
async def country_top_charts(country: str, limit: int = Query(50, le=200)):
    """
    Top tracks theo tên quốc gia tiếng Anh (vietnam, japan, ...).
    Nguồn: Last.fm geo.getTopTracks
    """
    tracks = await get_top_tracks_by_country(country=country, limit=limit)
    return {
        "data":       tracks,
        "country":    country,
        "total":      len(tracks),
        "source":     "Last.fm geo.getTopTracks",
        "source_url": f"https://www.last.fm/charts/country/{country.replace(' ', '-')}",
    }


@router.get("/spotify")
async def spotify_top_charts(limit: int = Query(50, le=50)):
    """
    Top tracks từ Spotify Global Top 50 playlist.
    Nguồn: Spotify Web API (playlist public, không cần OAuth user)
    """
    try:
        tracks = await get_playlist_tracks(SPOTIFY_GLOBAL_TOP50_ID)
        return {
            "data":        tracks[:limit],
            "total":       len(tracks[:limit]),
            "playlist_id": SPOTIFY_GLOBAL_TOP50_ID,
            "source":      "Spotify Global Top 50",
            "source_url":  f"https://open.spotify.com/playlist/{SPOTIFY_GLOBAL_TOP50_ID}",
        }
    except Exception as e:
        return {
            "error":   str(e),
            "data":    [],
            "message": "Cần SPOTIFY_CLIENT_ID và SPOTIFY_CLIENT_SECRET trong .env",
        }


@router.get("/spotify/viral")
async def spotify_viral_charts():
    """Spotify Viral 50 Global."""
    try:
        tracks = await get_playlist_tracks(SPOTIFY_VIRAL50_ID)
        return {
            "data":       tracks,
            "source":     "Spotify Viral 50 Global",
            "source_url": f"https://open.spotify.com/playlist/{SPOTIFY_VIRAL50_ID}",
        }
    except Exception as e:
        return {"error": str(e), "data": []}