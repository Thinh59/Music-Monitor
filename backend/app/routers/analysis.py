"""
Analysis Router — EDA endpoints: genre comparison, timeseries, distribution.
"""
from fastapi import APIRouter, Query
import asyncio

from app.services.lastfm   import get_global_top_tracks, get_artist_tags
from app.services.deezer   import get_country_chart, get_tiktok_viral
from app.ai.gemini_service import analyze_country_insight

router = APIRouter()


@router.get("/genre-comparison")
async def genre_comparison(
    countries: str = Query("VN,JP,US,KR,BR", description="ISO codes, comma-separated")
):
    """So sánh phân phối genre giữa các quốc gia."""
    iso_list = [c.strip().upper() for c in countries.split(",")]
    COUNTRY_MAP = {
        "VN": "vietnam", "JP": "japan",   "KR": "south korea",
        "US": "united states", "BR": "brazil", "NG": "nigeria",
        "FR": "france",  "DE": "germany", "IN": "india", "GB": "united kingdom",
    }
    result = {}
    for iso in iso_list:
        name = COUNTRY_MAP.get(iso)
        if not name:
            continue
        tags: list[str] = []
        try:
            dz_tracks = await get_country_chart(iso, limit=8)
            for t in dz_tracks[:5]:
                t_tags = await get_artist_tags(t["artist"])
                tags.extend(t_tags[:3])
                await asyncio.sleep(0.05)
        except:
            pass
        result[iso] = {"country": name, "tags": tags,
                       "tag_count": len(tags), "source": "Deezer + Last.fm Tags"}

    summary_str = "\n".join([
        f"- {iso} ({v['country']}): {', '.join(set(v['tags'][:8]))}"
        for iso, v in result.items()
    ])
    prompt = f"""Bạn là chuyên gia âm nhạc toàn cầu. Dựa trên genre tags:
{summary_str}
Viết insight so sánh ngắn gọn (150 từ, tiếng Việt):
- Điểm chung về gu âm nhạc giữa các khu vực
- Sự khác biệt đáng chú ý nhất
- Xu hướng nào đang lan rộng toàn cầu"""

    insight = await analyze_country_insight(prompt, cache_key=f"genre_cmp_{'_'.join(iso_list)}")
    return {"data": result, "insight": insight,
            "source": "Deezer Chart + Last.fm artist.getTopTags + Gemini AI"}


@router.get("/distribution/genre")
async def genre_distribution():
    """Phân phối genre toàn cầu từ Last.fm Top 50."""
    tracks = await get_global_top_tracks(limit=50)
    genre_count: dict[str, int] = {}
    for track in tracks[:30]:
        try:
            tags = await get_artist_tags(track["artist"])
            for tag in tags[:3]:
                genre_count[tag] = genre_count.get(tag, 0) + 1
            await asyncio.sleep(0.05)
        except:
            pass
    sorted_genres = sorted(genre_count.items(), key=lambda x: x[1], reverse=True)
    return {
        "data":         [{"genre": g, "count": c} for g, c in sorted_genres[:20]],
        "total_tracks": len(tracks),
        "source":       "Last.fm chart.getTopTracks + artist.getTopTags",
    }


@router.get("/timeseries/global-charts")
async def timeseries_global_charts():
    """Top charts hiện tại — fallback khi chưa có historical data."""
    try:
        from app.database import get_db
        db  = get_db()
        doc = db.collection("cache").document("global_top").get()
        if doc.exists:
            data = doc.to_dict()
            return {"data": data.get("tracks", [])[:10],
                    "updated_at": str(data.get("updated_at", "")),
                    "source": "Last.fm → Firestore cache"}
    except:
        pass
    tracks = await get_global_top_tracks(limit=20)
    return {"data": tracks[:10], "source": "Last.fm (real-time)",
            "note": "Chưa có historical data — scheduler sẽ tích lũy dần"}


@router.get("/insight/market-summary")
async def market_summary():
    """Gemini tổng hợp insight thị trường âm nhạc hiện tại."""
    global_tracks, tiktok_tracks = await asyncio.gather(
        get_global_top_tracks(limit=10),
        get_tiktok_viral("global", limit=10),
    )
    chart_str  = "\n".join([f"{i+1}. {t['name']} — {t['artist']}"
                            for i, t in enumerate(global_tracks[:5])])
    tiktok_str = "\n".join([f"- {t['name']} — {t['artist']}"
                            for t in tiktok_tracks[:5]])
    import datetime
    prompt = f"""Bạn là nhà phân tích thị trường âm nhạc toàn cầu.
Ngày: {datetime.date.today().strftime('%d/%m/%Y')}
Top Charts (Last.fm): {chart_str}
TikTok Viral (Deezer): {tiktok_str}

Viết báo cáo insight ngắn gọn (200 từ, tiếng Việt):
- Xu hướng nổi bật nhất hôm nay
- Genre/khu vực nào đang thống trị
- Dự báo tuần tới"""

    insight = await analyze_country_insight(prompt, cache_key="market_summary_today")
    return {"insight": insight, "global_top": global_tracks[:5],
            "tiktok_viral": tiktok_tracks[:5],
            "source": "Last.fm + Deezer + Gemini AI"}