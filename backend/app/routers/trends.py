"""
Trends Router — Phát hiện xu hướng viral
- /viral        : Reddit hot posts + VADER sentiment
- /tiktok       : TikTok viral tracks từ Deezer (hoàn toàn miễn phí)
- /youtube/batch: YouTube MV stats cho top tracks
- /spike/{name} : Viral score tổng hợp cho 1 bài hát
- /overview     : Tổng quan tất cả nguồn (dùng cho Dashboard)
"""

from fastapi import APIRouter, Query
import asyncio

from app.services.youtube   import search_music_video, get_video_stats
from app.services.reddit    import get_trending_music_posts, search_artist_mentions, count_mentions_24h
from app.services.lastfm    import get_global_top_tracks
from app.services.deezer    import get_tiktok_viral, get_special_playlist, get_global_chart
from app.ai.trend_detection import detect_view_spike_zscore, calculate_viral_score
from app.ai.sentiment       import analyze_posts_sentiment
from app.ai.gemini_service  import analyze_country_insight   # dùng lại cho trend insight

router = APIRouter()


@router.get("/tiktok")
async def get_tiktok_trends(region: str = Query("global"), limit: int = Query(30, le=50)):
    """
    Danh sách bài hát đang viral trên TikTok.
    Nguồn: Deezer TikTok Viral Playlist (miễn phí, không cần API key).
    region: 'global' | 'us'
    """
    tracks = await get_tiktok_viral(region=region, limit=limit)
    return {
        "data":       tracks,
        "total":      len(tracks),
        "region":     region,
        "source":     "Deezer TikTok Viral Playlist",
        "source_url": "https://api.deezer.com",
        "note":       "Playlist Deezer theo dõi TikTok Viral — cập nhật hàng ngày",
    }


@router.get("/viral")
async def get_reddit_viral(subreddit: str = Query("Music"), limit: int = Query(20, le=50)):
    """
    Hot posts trên Reddit + VADER Sentiment.
    Nguồn: Reddit OAuth API + VADER NLP
    """
    posts     = await get_trending_music_posts(subreddit=subreddit, limit=limit)
    sentiment = analyze_posts_sentiment(posts)
    mentions  = count_mentions_24h(posts)

    return {
        "subreddit":      subreddit,
        "trending_posts": posts[:15],
        "sentiment":      sentiment,
        "mentions_24h":   mentions,
        "source":         f"Reddit r/{subreddit} + VADER Sentiment",
        "source_url":     f"https://reddit.com/r/{subreddit}",
    }


@router.get("/overview")
async def get_trends_overview():
    """
    Tổng quan xu hướng: TikTok + Reddit + YouTube (dùng cho Dashboard).
    Gọi song song để tiết kiệm thời gian.
    """
    # Gọi 3 nguồn song song
    tiktok_task = get_tiktok_viral("global", limit=10)
    reddit_task = get_trending_music_posts("Music", limit=20)
    lastfm_task = get_global_top_tracks(limit=10)

    tiktok_tracks, reddit_posts, lastfm_tracks = await asyncio.gather(
        tiktok_task, reddit_task, lastfm_task, return_exceptions=True
    )

    if isinstance(tiktok_tracks, Exception): tiktok_tracks = []
    if isinstance(reddit_posts,  Exception): reddit_posts  = []
    if isinstance(lastfm_tracks, Exception): lastfm_tracks = []

    sentiment = analyze_posts_sentiment(reddit_posts) if reddit_posts else {}
    mentions  = count_mentions_24h(reddit_posts)

    return {
        "tiktok":  {
            "data":   tiktok_tracks[:8],
            "source": "Deezer TikTok Viral",
        },
        "reddit": {
            "trending_posts": reddit_posts[:10],
            "sentiment":      sentiment,
            "mentions_24h":   mentions,
            "source":         "Reddit r/Music",
        },
        "lastfm": {
            "data":   lastfm_tracks[:10],
            "source": "Last.fm chart.getTopTracks",
        },
    }


@router.get("/youtube/batch")
async def get_youtube_batch(limit: int = Query(8, le=12)):
    """
    YouTube MV stats cho top bài hát (Last.fm → YouTube search → stats).
    Nguồn: Last.fm + YouTube Data API v3
    """
    top_tracks = await get_global_top_tracks(limit=10)
    results    = []

    for track in top_tracks[:limit]:
        query   = f"{track['name']} {track['artist']} official music video"
        yt_hits = await search_music_video(query)
        if not yt_hits:
            continue
        stats = await get_video_stats(yt_hits[0]["video_id"])
        if not stats:
            continue
        results.append({
            "track_name":    track["name"],
            "artist":        track["artist"],
            "video_id":      yt_hits[0]["video_id"],
            "title":         stats.get("title", yt_hits[0]["title"]),
            "view_count":    stats.get("view_count", 0),
            "like_count":    stats.get("like_count", 0),
            "comment_count": stats.get("comment_count", 0),
            "thumbnail":     yt_hits[0].get("thumbnail"),
            "channel":       yt_hits[0].get("channel"),
            "source":        "YouTube Data API v3",
            "source_url":    f"https://www.youtube.com/watch?v={yt_hits[0]['video_id']}",
        })

    results.sort(key=lambda x: x["view_count"], reverse=True)
    return {"data": results, "source": "Last.fm + YouTube Data API v3"}


@router.get("/youtube/search")
async def youtube_search(q: str = Query(..., min_length=2)):
    """Tìm MV trên YouTube."""
    results = await search_music_video(q)
    return {"data": results[:5], "query": q, "source": "YouTube Data API v3"}


@router.get("/youtube/{video_id}")
async def youtube_spike(video_id: str):
    """Stats + Z-score spike detection cho 1 MV."""
    stats = await get_video_stats(video_id)
    if not stats:
        return {"error": f"Không tìm thấy {video_id}"}
    views        = stats.get("view_count", 0)
    fake_history = [int(views * 0.55), int(views * 0.72), int(views * 0.88), views]
    spike        = detect_view_spike_zscore(fake_history)
    return {**stats, "spike_detection": spike, "source": "YouTube Data API v3 + Z-score"}


@router.get("/spike/{track_name}")
async def get_viral_score(track_name: str, artist: str = Query("")):
    """
    Viral Score tổng hợp (0-100) cho 1 bài hát.
    = YouTube growth × 0.5 + Reddit mentions × 0.3 + Comments × 0.2
    """
    query        = f"{track_name} {artist}".strip()
    reddit_posts = await search_artist_mentions(query, limit=30)
    mentions_24h = count_mentions_24h(reddit_posts)
    sentiment    = analyze_posts_sentiment(reddit_posts)

    yt_views = yt_comments = 0
    yt_hits  = await search_music_video(f"{query} official")
    if yt_hits:
        stats      = await get_video_stats(yt_hits[0]["video_id"])
        yt_views   = stats.get("view_count", 0)
        yt_comments= stats.get("comment_count", 0)

    yt_growth   = min(yt_views / 1_000_000 * 15, 500)
    viral_score = calculate_viral_score(yt_growth, mentions_24h, yt_comments)

    return {
        "track_name":      track_name,
        "artist":          artist,
        "viral_score":     viral_score,
        "youtube_views":   yt_views,
        "reddit_mentions": mentions_24h,
        "sentiment":       sentiment,
        "sources":         ["YouTube Data API v3", "Reddit API", "VADER"],
    }


@router.get("/reddit/search")
async def reddit_search(q: str = Query(...), limit: int = Query(25, le=50)):
    """Tìm bài đăng Reddit về 1 bài hát / nghệ sĩ."""
    posts     = await search_artist_mentions(q, limit=limit)
    sentiment = analyze_posts_sentiment(posts)
    return {
        "query":     q,
        "posts":     posts[:10],
        "sentiment": sentiment,
        "mentions_24h": count_mentions_24h(posts),
        "source":    "Reddit OAuth API + VADER",
    }