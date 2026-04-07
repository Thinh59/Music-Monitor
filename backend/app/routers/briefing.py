"""
Briefing Router — AI Daily Music Briefing
Dùng Gemini 3.1 Flash-Lite (thay Claude) để tiết kiệm chi phí.
Tổng hợp: Last.fm + Deezer TikTok + Reddit → Gemini viết báo cáo.

FIX:
- Cache chặt chẽ theo ngày (1 lần Gemini / ngày)
- Fallback tĩnh chất lượng cao khi Gemini bị quota
- Không retry Gemini trong briefing nếu đang bị 429 (tiết kiệm quota cho các module khác)
"""

from fastapi import APIRouter, Query
from datetime import datetime, date

from app.services.lastfm    import get_global_top_tracks
from app.services.deezer    import get_tiktok_viral, get_global_chart
from app.services.reddit    import get_trending_music_posts, count_mentions_24h
from app.ai.sentiment       import analyze_posts_sentiment
from app.ai.trend_detection import calculate_viral_score
from app.ai.gemini_service  import analyze_country_insight

router  = APIRouter()
_cache: dict = {}   # { "YYYY-MM-DD": { briefing, ... } }


def _fallback_briefing(
    lf_tracks:     list,
    tiktok_tracks: list,
    reddit_posts:  list,
    sentiment:     dict,
) -> str:
    """Tạo briefing dạng template khi Gemini không khả dụng."""
    today_str  = date.today().strftime("%d/%m/%Y")
    tops       = "\n".join([f"  {i+1}. **{t['name']}** — {t['artist']}" for i, t in enumerate(lf_tracks[:5])])
    tiktoks    = "\n".join([f"  {i+1}. {t['name']} — {t['artist']}"    for i, t in enumerate(tiktok_tracks[:3])])
    hot_reddit = reddit_posts[0]["title"][:80] if reddit_posts else "Không có dữ liệu"
    sent_label = (
        "Tích cực 😊" if sentiment.get("compound", 0) > 0.05
        else "Tiêu cực 😠" if sentiment.get("compound", 0) < -0.05
        else "Trung tính 😐"
    )
    return f"""## 🌅 Daily Music Briefing — {today_str}

> *(Chế độ tóm tắt — AI đang tạm nghỉ để tiết kiệm quota)*

## 📊 Top Charts (Last.fm Global)
{tops}

## 🔥 TikTok Viral Alert
{tiktoks}

## 💬 Cộng đồng Reddit r/Music
Sentiment 24h: **{sent_label}** · {sentiment.get('total', 0)} posts
Hot nhất: *{hot_reddit}*

## 🎯 Ghi chú
Dữ liệu tổng hợp tự động từ Last.fm · Deezer · Reddit. AI Insight sẽ được kích hoạt trở lại vào ngày mai."""


async def _generate_briefing_with_gemini(
    lastfm_tracks: list,
    tiktok_tracks: list,
    reddit_posts:  list,
    sentiment:     dict,
) -> str:
    """Gọi Gemini để sinh Daily Music Briefing."""

    lf_str = "\n".join([
        f"  {i+1}. {t['name']} — {t['artist']} ({int(t.get('playcount', 0)):,} plays)"
        for i, t in enumerate(lastfm_tracks[:5])
    ])
    tk_str = "\n".join([
        f"  {i+1}. {t['name']} — {t['artist']}"
        for i, t in enumerate(tiktok_tracks[:5])
    ])
    reddit_str = "\n".join([
        f"  - {p['title'][:80]} (⬆️ {p['score']:,})"
        for p in reddit_posts[:5]
    ])
    sentiment_label = (
        "rất tích cực 😊" if sentiment.get("compound", 0) > 0.3 else
        "tích cực 🙂"    if sentiment.get("compound", 0) > 0.05 else
        "trung tính 😐"  if sentiment.get("compound", 0) > -0.05 else
        "tiêu cực 😠"
    )

    prompt = f"""Bạn là biên tập viên âm nhạc chuyên nghiệp của tờ báo âm nhạc hàng đầu châu Á.
Hôm nay là {date.today().strftime('%d/%m/%Y')}.

Dữ liệu thực tế hôm nay:

📊 TOP LAST.FM GLOBAL:
{lf_str}

🎵 ĐANG VIRAL TIKTOK:
{tk_str}

💬 REDDIT r/Music HOT POSTS (24h):
{reddit_str}
→ Sentiment cộng đồng: {sentiment_label} (score: {sentiment.get('compound', 0):.2f})
→ Mentions: {sentiment.get('total', 0)} posts phân tích

---
Viết **Daily Music Intelligence Briefing** (tiếng Việt, 200-250 từ) theo cấu trúc:

## 🌅 Tổng quan ngày {date.today().strftime('%d/%m/%Y')}
(1-2 câu tóm tắt tình hình âm nhạc toàn cầu hôm nay)

## 📊 Top Charts
(Phân tích top 3 bài hát nổi bật nhất — tại sao chúng đang dẫn đầu?)

## 🔥 TikTok Viral Alert  
(Bài nào đang làm mưa làm gió TikTok? Dự đoán chúng có lên chart không?)

## 💬 Cộng đồng nói gì?
(Tóm tắt tâm lý người nghe từ Reddit — chủ đề nào đang hot?)

## 🎯 Dự báo tuần tới
(1-2 bài có khả năng bứt phá nhất — lý do cụ thể)

Viết như một biên tập viên thực thụ: súc tích, có insight, không liệt kê khô khan."""

    # Dùng cache_key = "daily_briefing" để Gemini chỉ gọi 1 lần/ngày
    return await analyze_country_insight(prompt, cache_key="daily_briefing")


@router.get("/daily")
async def get_daily_briefing(force_refresh: bool = Query(False)):
    """
    Daily Music Briefing từ Gemini AI.
    Cache trong ngày — chỉ gọi Gemini 1 lần/ngày.
    Nguồn: Last.fm + Deezer TikTok + Reddit → Gemini 3.1 Flash-Lite
    """
    today = str(date.today())

    if not force_refresh and today in _cache:
        return {**_cache[today], "cached": True}

    import asyncio
    lf_task     = get_global_top_tracks(limit=10)
    tiktok_task = get_tiktok_viral("global", limit=10)
    reddit_task = get_trending_music_posts("Music", limit=20)

    lf_tracks, tiktok_tracks, reddit_posts = await asyncio.gather(
        lf_task, tiktok_task, reddit_task, return_exceptions=True
    )
    if isinstance(lf_tracks,     Exception): lf_tracks     = []
    if isinstance(tiktok_tracks, Exception): tiktok_tracks = []
    if isinstance(reddit_posts,  Exception): reddit_posts  = []

    sentiment = analyze_posts_sentiment(reddit_posts) if reddit_posts else {}

    # Gọi Gemini — nếu lỗi 429 thì dùng fallback (không retry để tiết kiệm quota)
    briefing_text = await _generate_briefing_with_gemini(
        lf_tracks, tiktok_tracks, reddit_posts, sentiment
    )
    if briefing_text.startswith("⚠️"):
        briefing_text = _fallback_briefing(lf_tracks, tiktok_tracks, reddit_posts, sentiment)

    result = {
        "briefing":         briefing_text,
        "date":             today,
        "generated_at":     datetime.now().isoformat(),
        "top_tracks_used":  lf_tracks[:5],
        "tiktok_used":      tiktok_tracks[:5],
        "reddit_sentiment": sentiment,
        "sources":          ["Last.fm", "Deezer TikTok Viral", "Reddit r/Music", "Gemini 3.1 Flash-Lite"],
        "source_urls": [
            "https://www.last.fm/charts",
            "https://api.deezer.com",
            "https://reddit.com/r/Music",
            "https://ai.google.dev",
        ],
        "cached": False,
    }

    _cache[today] = result
    return result


@router.get("/history")
async def get_briefing_history():
    """Lịch sử 7 ngày gần nhất (trong memory cache)."""
    return {
        "history": [
            {"date": k, "preview": v["briefing"][:300] + "..."}
            for k, v in list(_cache.items())[-7:]
        ]
    }