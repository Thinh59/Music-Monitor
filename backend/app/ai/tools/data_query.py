"""Wrap các service hiện có để agent có thể truy vấn dữ liệu nội bộ."""

from typing import Any

from app.services.lastfm import (
    get_global_top_tracks,
    get_top_tracks_by_country,
    get_artist_tags,
)
from app.services.deezer import get_tiktok_viral
from app.services.reddit import get_trending_music_posts, count_mentions_24h
from app.services.youtube import search_music_video, get_video_stats
from app.ai.sentiment import analyze_posts_sentiment
from app.ai.trend_detection import calculate_viral_score


async def get_global_charts(limit: int = 10) -> list[dict[str, Any]]:
    """Top tracks toàn cầu — Last.fm chart.getTopTracks."""
    tracks = await get_global_top_tracks(limit=limit)
    return [
        {
            "rank": i + 1,
            "name": t.get("name"),
            "artist": t.get("artist"),
            "playcount": t.get("playcount"),
        }
        for i, t in enumerate(tracks[:limit])
    ]


async def get_country_top(country: str, limit: int = 10) -> list[dict[str, Any]]:
    """Top tracks theo quốc gia (tên đầy đủ tiếng Anh: 'vietnam', 'korea', ...)."""
    tracks = await get_top_tracks_by_country(country.lower(), limit=limit)
    return [
        {"rank": i + 1, "name": t.get("name"), "artist": t.get("artist")}
        for i, t in enumerate(tracks[:limit])
    ]


async def get_tiktok_trends(limit: int = 10) -> list[dict[str, Any]]:
    """TikTok viral tracks từ Deezer playlist."""
    tracks = await get_tiktok_viral("global", limit=limit)
    return [
        {"rank": i + 1, "name": t.get("name"), "artist": t.get("artist")}
        for i, t in enumerate(tracks[:limit])
    ]


async def get_reddit_buzz(subreddit: str = "Music", limit: int = 10) -> dict[str, Any]:
    """Hot posts + sentiment trên một subreddit nhạc."""
    posts = await get_trending_music_posts(subreddit, limit=limit)
    sent = analyze_posts_sentiment(posts) if posts else {}
    return {
        "top_posts": [
            {"title": p.get("title"), "score": p.get("score")}
            for p in posts[:5]
        ],
        "sentiment": sent,
        "mentions_24h": count_mentions_24h(posts),
    }


async def get_youtube_for_track(track_name: str, artist: str = "") -> dict[str, Any]:
    """Tìm MV YouTube cho 1 track và lấy view/like/comment."""
    query = f"{track_name} {artist} official music video".strip()
    hits = await search_music_video(query)
    if not hits:
        return {"error": f"Không tìm thấy MV cho '{track_name}'"}
    stats = await get_video_stats(hits[0]["video_id"])
    if not stats:
        return {"error": "Không lấy được stats từ YouTube"}
    return {
        "video_id": hits[0]["video_id"],
        "title": stats.get("title"),
        "view_count": stats.get("view_count"),
        "like_count": stats.get("like_count"),
        "comment_count": stats.get("comment_count"),
        "url": f"https://www.youtube.com/watch?v={hits[0]['video_id']}",
    }


async def viral_score(track_name: str, artist: str = "") -> dict[str, Any]:
    """Tính viral score 0-100 tổng hợp YouTube + Reddit cho 1 bài hát."""
    yt = await get_youtube_for_track(track_name, artist)
    if "error" in yt:
        return yt

    posts = await get_trending_music_posts("Music", limit=20)
    sent = analyze_posts_sentiment(posts) if posts else {}
    mentions = count_mentions_24h(posts) or 0
    score = calculate_viral_score(
        youtube_growth_pct=0.0,
        reddit_mentions=mentions,
        youtube_comments=int(yt.get("comment_count", 0) or 0),
    )
    return {
        "track": track_name,
        "artist": artist,
        "viral_score": score,
        "youtube": yt,
        "reddit_mentions": mentions,
        "sentiment": sent.get("compound", 0),
    }


async def artist_tags(artist: str) -> list[str]:
    """Lấy genre tags của 1 nghệ sĩ từ Last.fm."""
    return await get_artist_tags(artist) or []
