"""
YouTube Data API v3 Service
FIX: Thêm xử lý lỗi chi tiết hơn, timeout, và fallback khi key hết quota
"""
import httpx
from app.config import settings

BASE_URL = "https://www.googleapis.com/youtube/v3"
_YT_KEY  = settings.youtube_api_key


async def _yt_get(endpoint: str, params: dict) -> dict:
    """Helper GET YouTube API với timeout và error handling."""
    params["key"] = _YT_KEY
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(f"{BASE_URL}/{endpoint}", params=params)
            data = resp.json()
            # Kiểm tra YouTube API error
            if "error" in data:
                err = data["error"]
                code    = err.get("code", 0)
                message = err.get("message", "Unknown YouTube API error")
                print(f"⚠️ YouTube API error {code}: {message}")
                return {}
            return data
    except Exception as e:
        print(f"⚠️ YouTube request error: {e}")
        return {}


async def get_video_stats(video_id: str) -> dict:
    """Lấy view count, like count của MV."""
    data  = await _yt_get("videos", {
        "part": "statistics,snippet",
        "id":   video_id,
    })
    items = data.get("items", [])
    if not items:
        return {}
    item  = items[0]
    stats = item.get("statistics", {})
    snip  = item.get("snippet", {})
    return {
        "video_id":      video_id,
        "title":         snip.get("title", ""),
        "channel":       snip.get("channelTitle", ""),
        "view_count":    int(stats.get("viewCount",   0)),
        "like_count":    int(stats.get("likeCount",   0)),
        "comment_count": int(stats.get("commentCount", 0)),
        "published_at":  snip.get("publishedAt", ""),
        "thumbnail":     snip.get("thumbnails", {}).get("medium", {}).get("url", ""),
        "source":        "YouTube",
        "source_url":    f"https://www.youtube.com/watch?v={video_id}",
    }


async def search_music_video(query: str) -> list[dict]:
    """Tìm MV theo tên bài hát."""
    data  = await _yt_get("search", {
        "part":            "snippet",
        "q":               query,
        "type":            "video",
        "videoCategoryId": "10",   # Music
        "maxResults":      5,
    })
    items = data.get("items", [])
    results = []
    for item in items:
        vid_id = item.get("id", {}).get("videoId")
        if not vid_id:
            continue
        snip = item.get("snippet", {})
        results.append({
            "video_id":    vid_id,
            "title":       snip.get("title", ""),
            "channel":     snip.get("channelTitle", ""),
            "published_at":snip.get("publishedAt", ""),
            "thumbnail":   snip.get("thumbnails", {}).get("medium", {}).get("url", ""),
            "source":      "YouTube",
            "source_url":  f"https://www.youtube.com/watch?v={vid_id}",
        })
    return results


async def track_view_growth(video_id: str, previous_views: int) -> dict:
    """Tính % tăng trưởng view so với lần đo trước."""
    stats         = await get_video_stats(video_id)
    current_views = stats.get("view_count", 0)
    growth_pct    = ((current_views - previous_views) / previous_views * 100) if previous_views > 0 else 0
    return {**stats, "previous_views": previous_views, "growth_pct": round(growth_pct, 2)}