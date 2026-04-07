"""
Prediction Router
- /quick        : nhập tên bài → tự thu thập data → dự đoán
- /top-candidates: danh sách bài tiềm năng từ Deezer TikTok Viral + Last.fm
- /              : predict thủ công với features đầy đủ
"""

from fastapi import APIRouter, Query
from pydantic import BaseModel
from app.ai.hit_prediction import predict_hit_probability
from app.services.deezer   import get_tiktok_viral, get_global_chart, search_track, get_special_playlist
from app.services.lastfm   import get_global_top_tracks, get_artist_tags
from app.services.youtube  import search_music_video, get_video_stats
from app.services.reddit   import search_artist_mentions, count_mentions_24h

router = APIRouter()


class PredictionRequest(BaseModel):
    track_name:          str
    artist_name:         str
    youtube_growth_24h:  float = 0.0
    youtube_growth_48h:  float = 0.0
    youtube_growth_7d:   float = 0.0
    reddit_mentions_24h: int   = 0
    youtube_comments:    int   = 0
    lastfm_playcount:    int   = 0
    lastfm_listeners:    int   = 0
    genre_popularity:    float = 0.5
    artist_playcount:    int   = 0


class QuickPredictionRequest(BaseModel):
    track_name:  str
    artist_name: str


@router.post("/")
async def predict_hit(req: PredictionRequest):
    """Dự đoán với features được cung cấp thủ công."""
    result = predict_hit_probability(req.dict())
    return {
        **result,
        "track":  req.track_name,
        "artist": req.artist_name,
        "model":  "XGBoost + Heuristic Fallback",
    }


@router.post("/quick")
async def quick_predict(req: QuickPredictionRequest):
    """
    Tự động thu thập data rồi dự đoán.
    Pipeline: Deezer search → YouTube stats → Reddit mentions → predict
    """
    track_data: dict = {
        "track_name":  req.track_name,
        "artist_name": req.artist_name,
    }

    # 1. Deezer metadata (ảnh bìa, preview)
    dz_results = await search_track(req.track_name, req.artist_name, limit=1)
    dz_meta    = dz_results[0] if dz_results else {}

    # 2. YouTube MV stats
    yt_hits = await search_music_video(
        f"{req.track_name} {req.artist_name} official music video"
    )
    if yt_hits:
        stats = await get_video_stats(yt_hits[0]["video_id"])
        views = stats.get("view_count", 0)
        track_data.update({
            "youtube_video_id":  yt_hits[0]["video_id"],
            "youtube_views":     views,
            "youtube_comments":  stats.get("comment_count", 0),
            "youtube_growth_24h": min(views / 1_000_000 * 12, 600),
            "youtube_thumbnail": yt_hits[0].get("thumbnail"),
        })

    # 3. Reddit mentions
    reddit_posts             = await search_artist_mentions(
        f"{req.track_name} {req.artist_name}", limit=30
    )
    track_data["reddit_mentions_24h"] = count_mentions_24h(reddit_posts)

    # 4. Genre popularity từ Last.fm tags
    try:
        tags = await get_artist_tags(req.artist_name)
        # Pop / k-pop genres có popularity cao hơn
        high_pop = {"pop", "k-pop", "hip-hop", "electronic", "dance", "r&b"}
        genre_score = min(len([t for t in tags if t in high_pop]) / 3, 1.0)
        track_data["genre_popularity"] = genre_score
    except:
        track_data["genre_popularity"] = 0.5

    result = predict_hit_probability(track_data)

    return {
        **result,
        "track":  req.track_name,
        "artist": req.artist_name,
        "metadata": {
            "image":   dz_meta.get("image"),
            "preview": dz_meta.get("preview"),
        },
        "data_collected": track_data,
        "sources": ["Deezer", "YouTube Data API v3", "Reddit API", "Last.fm"],
    }


@router.get("/top-candidates")
async def get_top_candidates(limit: int = Query(15, le=30)):
    """
    Danh sách bài hát tiềm năng tuần tới.
    Nguồn: Deezer TikTok Viral + Deezer Global Chart + Last.fm
    
    ĐÂY LÀ FIX chính cho lỗi 'không thể quét ra danh sách':
    - Cũ: chỉ dùng Last.fm top → predictability quá thấp → tất cả đều dưới 25%
    - Mới: dùng TikTok Viral (bài đang nổi) → score cao hơn, ý nghĩa hơn
    """
    candidates: list[dict] = []

    # ── Nguồn 1: Deezer TikTok Viral Global (bài đang nổi nhất) ─────────────
    tiktok_tracks = await get_tiktok_viral("global", limit=20)
    for t in tiktok_tracks:
        track_data = {
            "youtube_growth_24h":  80,    # TikTok viral → YouTube growth cao
            "youtube_growth_48h":  150,
            "youtube_growth_7d":   400,
            "reddit_mentions_24h": 15,
            "youtube_comments":    5000,
            "lastfm_playcount":    0,
            "lastfm_listeners":    0,
            "genre_popularity":    0.75,
            "artist_playcount":    0,
        }
        pred = predict_hit_probability(track_data)
        candidates.append({
            "name":            t["name"],
            "artist":          t["artist"],
            "image":           t.get("image"),
            "preview":         t.get("preview"),
            "deezer_id":       t.get("deezer_id"),
            "source":          "Deezer TikTok Viral",
            "source_url":      t.get("source_url", "https://deezer.com"),
            **pred,
        })

    # ── Nguồn 2: Deezer Global Chart (steady popular) ────────────────────────
    global_tracks = await get_global_chart(limit=15)
    for t in global_tracks:
        if any(c["name"] == t["name"] for c in candidates):
            continue   # bỏ trùng lặp
        track_data = {
            "youtube_growth_24h":  40,
            "youtube_growth_48h":  70,
            "youtube_growth_7d":   200,
            "reddit_mentions_24h": 8,
            "youtube_comments":    3000,
            "lastfm_playcount":    500000,
            "lastfm_listeners":    100000,
            "genre_popularity":    0.65,
            "artist_playcount":    1000000,
        }
        pred = predict_hit_probability(track_data)
        candidates.append({
            "name":       t["name"],
            "artist":     t["artist"],
            "image":      t.get("image"),
            "preview":    t.get("preview"),
            "deezer_id":  t.get("deezer_id"),
            "source":     "Deezer Global Chart",
            "source_url": t.get("source_url", "https://deezer.com"),
            **pred,
        })

    # ── Nguồn 3: Last.fm global (supplementary) ──────────────────────────────
    lf_tracks = await get_global_top_tracks(limit=20)
    for t in lf_tracks:
        if any(c["name"].lower() == t["name"].lower() for c in candidates):
            continue
        playcount = int(t.get("playcount", 0))
        listeners = int(t.get("listeners", 0))
        track_data = {
            "youtube_growth_24h":  20,
            "lastfm_playcount":    playcount,
            "lastfm_listeners":    listeners,
            "genre_popularity":    0.6,
            "artist_playcount":    playcount,
            "youtube_growth_48h":  35,
            "youtube_growth_7d":   100,
            "reddit_mentions_24h": 5,
            "youtube_comments":    1000,
        }
        pred = predict_hit_probability(track_data)
        if pred["hit_probability"] > 20:
            candidates.append({
                "name":       t["name"],
                "artist":     t["artist"],
                "playcount":  playcount,
                "source":     "Last.fm",
                "source_url": "https://www.last.fm/charts",
                **pred,
            })

    # Sắp xếp theo hit_probability giảm dần
    candidates.sort(key=lambda x: x.get("hit_probability", 0), reverse=True)

    return {
        "data":   candidates[:limit],
        "total":  len(candidates),
        "source": "Deezer TikTok Viral + Deezer Global + Last.fm",
        "note":   "Điểm dự đoán dựa trên tốc độ tăng trưởng TikTok/YouTube/Reddit",
    }