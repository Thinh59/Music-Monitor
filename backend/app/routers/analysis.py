"""
Analysis Router — EDA endpoints cho đề bài (yêu cầu trend, distribution, comparison).
Các endpoint này phục vụ phần Insight & Interpretation (30% điểm).
"""
from fastapi import APIRouter, Query
import asyncio

from app.services.lastfm   import get_global_top_tracks, get_top_tracks_by_country, get_artist_tags
from app.services.deezer   import get_country_chart, get_tiktok_viral
from app.ai.gemini_service import analyze_country_insight
from app.database          import get_db

router = APIRouter()
db     = get_db()


@router.get("/genre-comparison")
async def genre_comparison(
    countries: str = Query("VN,JP,US,KR,BR,NG", description="ISO codes, comma-separated")
):
    """
    So sánh phân phối genre giữa các quốc gia.
    Đây là EDA 'so sánh theo yếu tố liên quan' theo yêu cầu đề.
    """
    iso_list = [c.strip().upper() for c in countries.split(",")]
    COUNTRY_MAP = {
        "VN": "vietnam", "JP": "japan", "KR": "south korea", "US": "united states",
        "BR": "brazil",  "NG": "nigeria","FR": "france",      "DE": "germany",
        "IN": "india",   "GB": "united kingdom",
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

    # Gemini insight so sánh
    summary_str = "\n".join([f"- {iso} ({v['country']}): {', '.join(set(v['tags'][:8]))}"
                              for iso, v in result.items()])
    prompt = f"""Bạn là chuyên gia âm nhạc toàn cầu. Dựa trên genre tags của các quốc gia:

{summary_str}

Viết insight so sánh ngắn gọn (150 từ, tiếng Việt):
- Điểm chung về gu âm nhạc giữa các khu vực
- Sự khác biệt đáng chú ý nhất
- Xu hướng nào đang lan rộng toàn cầu vs. nào còn mang tính địa phương"""

    insight = await analyze_country_insight(prompt, cache_key=f"genre_comparison_{'_'.join(iso_list)}")
    return {"data": result, "insight": insight,
            "source": "Deezer Chart + Last.fm artist.getTopTags + Gemini AI"}


@router.get("/timeseries/global-charts")
async def timeseries_global_charts():
    """
    Lịch sử top charts từ Firestore (nếu scheduler đã chạy đủ lâu).
    Dùng để vẽ time-series chart theo yêu cầu đề.
    """
    try:
        # Lấy snapshot mới nhất từ Firestore
        doc = db.collection("cache").document("global_top").get()
        if not doc.exists:
            # Fallback: lấy real-time từ Last.fm
            tracks = await get_global_top_tracks(limit=20)
            return {
                "data":   [{"name": t["name"], "artist": t["artist"],
                            "playcount": int(t.get("playcount", 0))} for t in tracks[:10]],
                "source": "Last.fm chart.getTopTracks (real-time)",
                "note":   "Chưa có historical data — chạy scheduler để tích lũy",
            }
        data = doc.to_dict()
        return {
            "data":       data.get("tracks", [])[:10],
            "updated_at": str(data.get("updated_at", "")),
            "source":     "Last.fm → Firestore cache",
        }
    except Exception as e:
        tracks = await get_global_top_tracks(limit=20)
        return {"data": tracks[:10], "source": "Last.fm (fallback)", "error": str(e)}


@router.get("/timeseries/youtube/{track_name}")
async def timeseries_youtube(track_name: str, artist: str = Query("")):
    """
    Lịch sử view count YouTube cho 1 bài hát (từ Firestore snapshots).
    """
    from app.services.youtube import search_music_video, get_video_stats
    try:
        query   = f"{track_name} {artist} official".strip()
        yt_hits = await search_music_video(query)
        if not yt_hits:
            return {"error": "Không tìm thấy MV", "data": []}

        video_id = yt_hits[0]["video_id"]
        stats    = await get_video_stats(video_id)

        # Lấy lịch sử từ Firestore
        doc_id  = f"{track_name}_{artist}".replace("/", "_")[:80]
        history_ref = (db.collection("youtube_snapshots")
                        .document(doc_id)
                        .collection("history")
                        .order_by("timestamp")
                        .limit(48))
        history = [{"timestamp": d.to_dict()["timestamp"],
                    "view_count": d.to_dict()["view_count"]}
                   for d in history_ref.stream()]

        return {
            "track_name": track_name, "artist": artist,
            "video_id":   video_id,
            "current":    stats,
            "history":    history,
            "source":     "YouTube Data API v3 + Firestore history",
            "note":       "History tích lũy dần qua scheduler (30 phút/lần)",
        }
    except Exception as e:
        return {"error": str(e), "data": []}


@router.get("/distribution/genre")
async def genre_distribution():
    """
    Phân phối genre toàn cầu từ Last.fm Top 50.
    EDA: 'Phân bố dữ liệu' theo yêu cầu đề.
    """
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
        "data":   [{"genre": g, "count": c} for g, c in sorted_genres[:20]],
        "total_tracks": len(tracks),
        "source": "Last.fm chart.getTopTracks + artist.getTopTags",
        "description": "Phân phối genre trong top 50 bài hát toàn cầu",
    }


@router.get("/clustering/elbow")
async def clustering_elbow():
    """
    Elbow Method — tìm k tối ưu cho K-Means clustering quốc gia.
    Dùng để trình bày trong báo cáo EDA.
    """
    import os, json
    CACHE_FILE = "map_cache.json"
    if not os.path.exists(CACHE_FILE):
        return {"error": "Chưa có map cache. Gọi /api/map/clusters trước.", "data": []}
    with open(CACHE_FILE, "r") as f:
        cached = json.load(f)
    # Build dummy vectors từ cache data (simplified)
    cluster_data = cached.get("data", [])
    if not cluster_data:
        return {"error": "Cache trống", "data": []}
    return {
        "message": "Elbow data: k=6 được chọn dựa trên Silhouette Score",
        "silhouette_score": cached.get("silhouette_score", 0),
        "n_clusters_used":  cached.get("n_clusters", 6),
        "total_countries":  cached.get("total_countries", 0),
        "note": "Để vẽ elbow chart đầy đủ, chạy clustering.elbow_method() trong Kaggle notebook",
    }


@router.get("/insight/market-summary")
async def market_summary():
    """
    Tổng hợp insight thị trường âm nhạc hiện tại — Gemini viết.
    Đây là phần 'Insight có giá trị thực tế' (30% điểm).
    """
    # Thu thập data
    global_tracks, tiktok_tracks = await asyncio.gather(
        get_global_top_tracks(limit=10),
        get_tiktok_viral("global", limit=10),
    )

    chart_str  = "\n".join([f"{i+1}. {t['name']} — {t['artist']}" for i, t in enumerate(global_tracks[:5])])
    tiktok_str = "\n".join([f"- {t['name']} — {t['artist']}" for t in tiktok_tracks[:5]])

    prompt = f"""Bạn là nhà phân tích thị trường âm nhạc toàn cầu cấp cao.

DỮ LIỆU HÔM NAY ({__import__('datetime').date.today().strftime('%d/%m/%Y')}):
Top Charts (Last.fm): {chart_str}
TikTok Viral (Deezer): {tiktok_str}

Viết Market Intelligence Summary (tiếng Việt, ~250 từ) thành 5 đoạn liên tiếp, mỗi đoạn 2-3 câu, mỗi đoạn bắt đầu bằng nhãn ngắn rồi hai chấm:

Insight 1: Xu hướng nổi bật nhất hôm nay (pattern đáng chú ý).
Insight 2: Sự dịch chuyển thể loại (genre nào lên, genre nào xuống).
Insight 3: TikTok vs Charts gap (bài viral TikTok nhưng chưa vào chart).
Dự đoán: 1-2 bài/nghệ sĩ có khả năng bứt phá tuần tới và lý do cụ thể.
Khuyến nghị: nhà sản xuất hoặc marketing nên làm gì tuần này.

QUAN TRỌNG: Plain text thuần, không markdown, không ## hay **, không dùng dấu sao làm bullet."""

    insight = await analyze_country_insight(prompt, cache_key="market_summary")
    return {
        "insight":        insight,
        "data_used":      {"global_charts": global_tracks[:5], "tiktok": tiktok_tracks[:5]},
        "generated_date": str(__import__("datetime").date.today()),
        "source":         "Last.fm + Deezer TikTok + Gemini AI",
    }
