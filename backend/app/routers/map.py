"""
Map Router — World Music Taste Map
- 40+ quốc gia (gấp đôi cũ)
- Dữ liệu từ Deezer (primary) + Last.fm (secondary)
- K-Means clustering với genre vector phong phú hơn
- Gemini AI insight cho từng quốc gia khi click
- Cache file-based tránh gọi API 110 lần mỗi lần F5
"""

from fastapi import APIRouter, HTTPException, Query
import json, os, asyncio

from app.services.lastfm  import get_artist_tags, get_top_tracks_by_country
from app.services.deezer  import get_country_chart, get_multiple_country_charts
from app.ai.clustering    import build_country_vectors, cluster_countries, get_cluster_label
from app.ai.gemini_service import analyze_country_insight

router     = APIRouter()
CACHE_FILE = "map_cache.json"

# ── ~80 quốc gia (ISO code cho Deezer, name cho Last.fm) ────────────────────
# Backend tự skip nước có 0 tag sau khi fetch (xem `_build_country_tags`),
# nên thêm thoải mái — nước không có data sẽ tự loại khỏi cluster.
COUNTRY_MAP: dict[str, str] = {
    # ── Asia ────────────────────────────────────────────────────────────────
    "VN": "vietnam",       "JP": "japan",         "KR": "south korea",
    "TH": "thailand",      "ID": "indonesia",     "PH": "philippines",
    "IN": "india",         "TW": "taiwan",        "SG": "singapore",
    "MY": "malaysia",      "CN": "china",         "HK": "hong kong",
    "MM": "myanmar",       "KH": "cambodia",      "LA": "laos",
    "BD": "bangladesh",    "PK": "pakistan",      "LK": "sri lanka",
    "NP": "nepal",         "MN": "mongolia",      "KZ": "kazakhstan",
    # ── Middle East ─────────────────────────────────────────────────────────
    "AE": "united arab emirates", "SA": "saudi arabia", "IL": "israel",
    "IR": "iran",          "IQ": "iraq",          "JO": "jordan",
    "LB": "lebanon",
    # ── Americas ────────────────────────────────────────────────────────────
    "US": "united states", "CA": "canada",        "BR": "brazil",
    "MX": "mexico",        "AR": "argentina",     "CO": "colombia",
    "CL": "chile",         "PE": "peru",          "VE": "venezuela",
    "BO": "bolivia",       "EC": "ecuador",       "UY": "uruguay",
    "PY": "paraguay",      "GT": "guatemala",     "CR": "costa rica",
    "PA": "panama",        "PR": "puerto rico",   "DO": "dominican republic",
    "JM": "jamaica",       "CU": "cuba",
    # ── Europe ──────────────────────────────────────────────────────────────
    "GB": "united kingdom","FR": "france",        "DE": "germany",
    "ES": "spain",         "IT": "italy",         "NL": "netherlands",
    "SE": "sweden",        "NO": "norway",        "PL": "poland",
    "PT": "portugal",      "BE": "belgium",       "CH": "switzerland",
    "AT": "austria",       "DK": "denmark",       "FI": "finland",
    "TR": "turkey",        "RU": "russia",        "IE": "ireland",
    "IS": "iceland",       "GR": "greece",        "CZ": "czech republic",
    "HU": "hungary",       "RO": "romania",       "SK": "slovakia",
    "HR": "croatia",       "BG": "bulgaria",      "RS": "serbia",
    "UA": "ukraine",
    # ── Africa ──────────────────────────────────────────────────────────────
    "NG": "nigeria",       "ZA": "south africa",  "EG": "egypt",
    "KE": "kenya",         "MA": "morocco",       "DZ": "algeria",
    "TN": "tunisia",       "ET": "ethiopia",      "GH": "ghana",
    "SN": "senegal",       "CI": "ivory coast",   "TZ": "tanzania",
    "UG": "uganda",        "ZW": "zimbabwe",
    # ── Oceania ─────────────────────────────────────────────────────────────
    "AU": "australia",     "NZ": "new zealand",   "FJ": "fiji",
}

# Các genre bổ sung thủ công cho quốc gia có âm nhạc địa phương đặc thù
LOCAL_GENRE_BOOST: dict[str, list[str]] = {
    "vietnam":       ["v-pop", "ballad", "rap viet"] * 4,
    "japan":         ["j-pop", "anime", "city pop"] * 4,
    "south korea":   ["k-pop", "k-hiphop", "k-r&b"] * 5,
    "india":         ["bollywood", "punjabi", "hindi pop"] * 4,
    "brazil":        ["funk carioca", "sertanejo", "latin"] * 4,
    "nigeria":       ["afrobeats", "afropop", "amapiano"] * 4,
    "south africa":  ["amapiano", "afrohouse"] * 3,
    "colombia":      ["reggaeton", "vallenato", "latin"] * 3,
    "mexico":        ["banda", "ranchera", "latin pop"] * 3,
    "turkey":        ["turkish pop", "arabesk"] * 3,
    "russia":        ["russian pop", "chanson"] * 3,
    "indonesia":     ["dangdut", "indie pop"] * 3,
    "taiwan":        ["mandopop", "c-pop"] * 4,
    "china":         ["c-pop", "mandopop"] * 4,
}


async def _build_country_tags(iso_code: str, country_name: str) -> list[str]:
    """
    Xây dựng danh sách genre tags cho 1 quốc gia.
    Nguồn: Deezer Chart (strict — không fallback global) → Last.fm + Local boost.
    Nếu cả 2 đều rỗng, trả [] để cluster loop skip nước này.
    """
    tags: list[str] = []

    # 1. Deezer chart strict — chỉ chấp nhận editorial/playlist của nước này
    deezer_tracks = await get_country_chart(iso_code, limit=10, strict=True)
    if deezer_tracks:
        for t in deezer_tracks[:6]:
            try:
                artist_tags = await get_artist_tags(t["artist"])
                tags.extend(artist_tags[:4])
                await asyncio.sleep(0.03)
            except Exception:
                pass

    # 2. Fallback: Last.fm geo chart
    if len(tags) < 5:
        try:
            lf_tracks = await get_top_tracks_by_country(country_name, limit=5)
            for t in lf_tracks[:4]:
                artist_tags = await get_artist_tags(t["artist"])
                tags.extend(artist_tags[:3])
                await asyncio.sleep(0.03)
        except Exception:
            pass

    # 3. Local genre boost
    local = LOCAL_GENRE_BOOST.get(country_name, [])
    tags.extend(local)

    return tags


@router.get("/clusters")
async def get_country_clusters(
    n_clusters: int = Query(6, ge=3, le=10),
    refresh:    bool = Query(False),
):
    """
    Phân cụm 40+ quốc gia theo gu âm nhạc.
    Nguồn: Deezer Chart + Last.fm tags + K-Means + PCA
    - Lần đầu: ~60-90s (cào Deezer + Last.fm)
    - Lần sau: cache (<0.01s)
    - ?refresh=true để xoá cache
    """
    if refresh and os.path.exists(CACHE_FILE):
        os.remove(CACHE_FILE)
        print("🗑️  Cache xoá. Sẽ cào lại toàn bộ.")

    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            cached = json.load(f)
        print(f"⚡ Cache hit: {len(cached.get('data', []))} countries")
        return cached

    # ── Cào dữ liệu (parallel với semaphore để né rate-limit) ───────────────
    print(f"🐌 Bắt đầu cào {len(COUNTRY_MAP)} quốc gia...")
    sem = asyncio.Semaphore(8)  # tối đa 8 fetch đồng thời

    async def fetch_one(iso: str, name: str) -> tuple[str, list[str]]:
        async with sem:
            tags = await _build_country_tags(iso, name)
            print(f"  ✓ {iso} ({name}): {len(tags)} tags")
            return name, tags

    pairs = await asyncio.gather(
        *(fetch_one(iso, name) for iso, name in COUNTRY_MAP.items()),
        return_exceptions=False,
    )
    # Skip countries với 0 tag (Deezer + Last.fm đều rỗng)
    country_tags: dict[str, list[str]] = {
        name: tags for name, tags in pairs if tags and len(tags) >= 3
    }
    skipped = len(COUNTRY_MAP) - len(country_tags)
    if skipped:
        print(f"⏭️  Skip {skipped} nước không có data")

    # ── Clustering ───────────────────────────────────────────────────────────
    df            = build_country_vectors(country_tags)
    df            = cluster_countries(df, n_clusters=n_clusters)
    cluster_labels: dict[int, str] = {
        int(cid): get_cluster_label(int(cid), df)
        for cid in df["cluster"].unique()
    }

    # ── Build kết quả ────────────────────────────────────────────────────────
    results  = []
    names    = list(country_tags.keys())
    iso_rev  = {v: k for k, v in COUNTRY_MAP.items()}   # name → ISO

    for i, (_, row) in enumerate(df.iterrows()):
        name     = names[i] if i < len(names) else ""
        iso_code = iso_rev.get(name, "")
        results.append({
            "country":       name,
            "iso_code":      iso_code,
            "cluster":       int(row["cluster"]),
            "cluster_label": cluster_labels[int(row["cluster"])],
            "pca_x":         float(row.get("pca_x", 0)),
            "pca_y":         float(row.get("pca_y", 0)),
        })

    response = {
        "data":           results,
        "cluster_labels": {str(k): v for k, v in cluster_labels.items()},
        "n_clusters":     n_clusters,
        "total_countries": len(results),
        "source":         "Deezer Chart + Last.fm Tags + K-Means Clustering",
        "source_url":     "https://api.deezer.com",
    }

    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(response, f, ensure_ascii=False, indent=2)
    print(f"✅ Cache lưu: {len(results)} quốc gia")
    return response


@router.get("/country/{iso_code}/top")
async def get_country_top(iso_code: str, limit: int = Query(20, le=50)):
    """
    Top bài hát tại 1 quốc gia.
    Nguồn ưu tiên: Deezer Chart → fallback Last.fm
    """
    iso  = iso_code.upper()
    if iso not in COUNTRY_MAP:
        raise HTTPException(status_code=404, detail=f"Unknown country code: {iso}")
    name = COUNTRY_MAP[iso]

    tracks: list[dict] = []

    # Primary: Deezer
    dz = await get_country_chart(iso, limit=limit)
    if dz:
        tracks = dz
    else:
        # Fallback: Last.fm
        try:
            lf = await get_top_tracks_by_country(name, limit=limit)
            for t in lf:
                tracks.append({**t, "source": "Last.fm"})
        except:
            pass

    return {
        "iso_code": iso,
        "country":  name,
        "data":     tracks,
        "total":    len(tracks),
        "source":   "Deezer Chart" if dz else "Last.fm geo.getTopTracks",
    }


@router.get("/country/{iso_code}/ai-insight")
async def get_country_ai_insight(iso_code: str):
    """
    Gemini AI phân tích gu âm nhạc của 1 quốc gia.
    Gọi khi user click vào marker trên bản đồ.
    """
    iso = iso_code.upper()
    if iso not in COUNTRY_MAP:
        raise HTTPException(status_code=404, detail=f"Unknown country code: {iso}")
    name = COUNTRY_MAP[iso]

    # Lấy top 10 bài hát thật
    tracks = await get_country_chart(iso, limit=10)
    if not tracks:
        try:
            lf = await get_top_tracks_by_country(name, limit=10)
            tracks = [{"name": t["name"], "artist": t["artist"]} for t in lf]
        except:
            tracks = []

    track_list = ", ".join([f"{t['name']} - {t['artist']}" for t in tracks[:8]])

    prompt = f"""Bạn là chuyên gia phân tích thị trường âm nhạc toàn cầu.

Dưới đây là 8 bài hát đang TOP tại {name.title()} ({iso}) hôm nay:
{track_list}

Viết báo cáo NGẮN GỌN (150-200 từ, tiếng Việt) gồm 4 đoạn liên tiếp, mỗi đoạn 2-3 câu:
1. Bức tranh âm nhạc — gu âm nhạc hiện tại của {name.title()} (Pop, hiphop, indie, hay địa phương).
2. Lý do viral — vì sao những bài này đang hot (TikTok, phim, collab).
3. Xu hướng — phản ánh văn hóa địa phương hay ảnh hưởng toàn cầu.
4. Dự báo — gu sẽ thay đổi theo hướng nào trong tháng tới.

QUAN TRỌNG: Trả về plain text thuần. Không dùng markdown, không dùng ## hay **, không dùng bullet ngôi sao."""

    insight = await analyze_country_insight(prompt, cache_key=f"country_insight_{iso}")

    return {
        "country":     name,
        "iso_code":    iso,
        "top_tracks":  tracks[:8],
        "insight":     insight,
        "source":      "Deezer Chart + Gemini AI",
        "source_url":  "https://api.deezer.com",
    }


@router.delete("/clusters/cache")
async def clear_map_cache():
    """Xoá cache để cào lại từ đầu."""
    if os.path.exists(CACHE_FILE):
        os.remove(CACHE_FILE)
        return {"message": "✅ Cache đã xoá. Gọi GET /clusters để cào lại (60-90s)."}
    return {"message": "Không có cache nào."}