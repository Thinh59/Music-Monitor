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
from app.services.spotify import get_playlist_tracks, get_new_releases, SpotifyConfigError

router = APIRouter()

# Spotify Global Top 50 playlist ID (public)
SPOTIFY_GLOBAL_TOP50_ID = "37i9dQZEVXbMDoHDwVN2tF"
# Spotify Viral 50 Global
SPOTIFY_VIRAL50_ID = "37i9dQZEVXbLiRSasKsNU9"


@router.get("/global")
async def global_top_charts(limit: int = Query(50, le=200), period: str = Query("today")):
    """
    Top tracks toàn cầu từ Last.fm.
    Lưu ý: Vì Database (Firestore) mới lập hôm nay nên chưa có lịch sử thật của Tuần/Tháng trước.
    Nên ở đây nhóm dùng thuật toán xáo trộn nhẹ để demo UI (Mock data). Sau 3 tháng thu thập đủ, chỉ cần query Firestore là xong.
    """
    import random
    tracks = await get_global_top_tracks(limit=limit)
    
    if period == "week":
        # Giả lập data tuần trước
        tracks = random.sample(tracks, len(tracks))
        for t in tracks:
            t["playcount"] = int(int(t.get("playcount", 0)) * random.uniform(1.5, 3.0))
    elif period == "month":
        # Giả lập data tháng trước
        tracks = random.sample(tracks, len(tracks))
        for t in tracks:
            t["playcount"] = int(int(t.get("playcount", 0)) * random.uniform(4.0, 8.0))
            
    # Re-sort theo playcount sau khi giả lập
    tracks.sort(key=lambda x: int(x.get("playcount", 0)), reverse=True)

    return {
        "data":       tracks,
        "total":      len(tracks),
        "period":     period,
        "source":     f"Last.fm chart.getTopTracks + Mock for {period}",
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


_REASON_MESSAGES = {
    "missing_env": "Cần SPOTIFY_CLIENT_ID và SPOTIFY_CLIENT_SECRET trong backend/.env",
    "invalid_credentials": "Credentials Spotify không hợp lệ — kiểm tra lại Client ID/Secret",
    "rate_limit": "Spotify đang rate-limit — thử lại sau ít phút",
    "premium_required": "Playlist editorial (Top 50, Viral 50) yêu cầu owner Spotify App có Premium. Đang dùng New Releases làm fallback.",
}


def _spotify_error_payload(err: Exception) -> dict:
    if isinstance(err, SpotifyConfigError):
        return {
            "data": [],
            "reason": err.reason,
            "message": _REASON_MESSAGES.get(err.reason, str(err)),
        }
    return {"data": [], "reason": "unknown", "message": str(err)}


@router.get("/spotify")
async def spotify_top_charts(limit: int = Query(50, le=50)):
    """Top tracks từ Spotify Global Top 50 playlist.

    Nếu Spotify trả 403 Premium-required, tự fallback sang /browse/new-releases.
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
    except SpotifyConfigError as e:
        if e.reason == "premium_required":
            try:
                tracks = await get_new_releases(limit=limit)
                return {
                    "data":        tracks,
                    "total":       len(tracks),
                    "source":      "Spotify New Releases (fallback)",
                    "source_url":  "https://open.spotify.com/genre/new-releases",
                    "fallback":    True,
                    "fallback_reason": _REASON_MESSAGES["premium_required"],
                }
            except Exception as inner:
                return _spotify_error_payload(inner)
        return _spotify_error_payload(e)
    except Exception as e:
        return _spotify_error_payload(e)


@router.get("/spotify/viral")
async def spotify_viral_charts():
    """Spotify Viral 50 Global. Fallback sang New Releases nếu cần Premium."""
    try:
        tracks = await get_playlist_tracks(SPOTIFY_VIRAL50_ID)
        return {
            "data":       tracks,
            "source":     "Spotify Viral 50 Global",
            "source_url": f"https://open.spotify.com/playlist/{SPOTIFY_VIRAL50_ID}",
        }
    except SpotifyConfigError as e:
        if e.reason == "premium_required":
            try:
                tracks = await get_new_releases(limit=20)
                return {
                    "data":     tracks,
                    "source":   "Spotify New Releases (fallback)",
                    "fallback": True,
                    "fallback_reason": _REASON_MESSAGES["premium_required"],
                }
            except Exception as inner:
                return _spotify_error_payload(inner)
        return _spotify_error_payload(e)
    except Exception as e:
        return _spotify_error_payload(e)

from fastapi import BackgroundTasks

@router.get("/force-sync")
async def force_sync_database(background_tasks: BackgroundTasks):
    """Ép scheduler chạy ngay lập tức để lấy data mẫu lưu vào Firebase."""
    print("DEBUG: Force-sync endpoint HIT!")
    from app.scheduler import poll_lastfm_charts, poll_youtube_stats
    import asyncio
    # Chạy bằng BackgroundTasks của FastAPI để đảm bảo task không bị hủy giữa chừng
    print("DEBUG: Scheduling background tasks...")
    background_tasks.add_task(poll_lastfm_charts)
    background_tasks.add_task(poll_youtube_stats)
    return {"message": "Đã ra lệnh ép chạy Scheduler qua BackgroundTasks. Hãy kiểm tra Firebase sau 10 giây!"}