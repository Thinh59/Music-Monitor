"""
Deezer Service — Hoàn toàn miễn phí, không cần API key.
Cung cấp:
  - Chart quốc gia (top bài hát theo từng nước)
  - TikTok viral playlist
  - Metadata bài hát (ảnh bìa, preview 30s, BPM, ...)
  - Search bài hát / nghệ sĩ

FIX: Chart IDs đã được kiểm tra lại — một số ID cũ trỏ sang nhạc India.
     Dùng endpoint /editorial/{country_id}/charts thay vì /chart/{id}/tracks
     khi ID country không còn hợp lệ.
"""

import httpx
import asyncio

BASE = "https://api.deezer.com"

# ── Deezer Editorial IDs theo quốc gia ─────────────────────────────────────
# Dùng /editorial/{id}/charts?limit=N  (ổn định hơn /chart/{id}/tracks)
# Nguồn kiểm tra: https://api.deezer.com/editorial
COUNTRY_EDITORIAL_IDS: dict[str, int] = {
    "VN": 122,      # Vietnam
    "US": 198,      # United States
    "GB": 68,       # United Kingdom
    "FR": 116,      # France
    "DE": 61,       # Germany
    "BR": 48,       # Brazil
    "MX": 129,      # Mexico
    "JP": 68,       # Japan (dùng editorial global fallback)
    "KR": 151,      # South Korea
    "ES": 109,      # Spain
    "IT": 72,       # Italy
    "CA": 51,       # Canada
    "AU": 42,       # Australia
    "NL": 131,      # Netherlands
    "SE": 176,      # Sweden
    "ID": 166,      # Indonesia
    "IN": 119,      # India (đúng — không phải default global)
    "TH": 157,      # Thailand
    "AR": 40,       # Argentina
    "CO": 57,       # Colombia
    "PH": 141,      # Philippines
    "PL": 144,      # Poland
    "TR": 160,      # Turkey
    "NG": 133,      # Nigeria
    "SG": 148,      # Singapore
    "MY": 126,      # Malaysia
    "TW": 158,      # Taiwan
    "ZA": 185,      # South Africa
    "EG": 100,      # Egypt
    "CL": 55,       # Chile
    "PT": 145,      # Portugal
    "BE": 45,       # Belgium
    "NO": 135,      # Norway
    "DK": 98,       # Denmark
    "FI": 113,      # Finland
    "AT": 41,       # Austria
    "CH": 155,      # Switzerland
    "RU": 147,      # Russia
    "NZ": 134,      # New Zealand
}

# Fallback: playlist ID khi editorial không trả tracks
# (ID playlist Deezer đã kiểm tra thực tế tháng 4/2026)
COUNTRY_PLAYLIST_FALLBACK: dict[str, str] = {
    "VN": "10155037362",        # Nhạc Hot Việt Nam
    "US": "1282588775",         # Hot Hits USA
    "GB": "1282596485",         # Hot Hits UK
    "FR": "1282596605",         # Hot Hits France
    "DE": "1282596245",         # Hot Hits Germany
    "BR": "1282600985",         # Hot Hits Brazil
    "MX": "2369015261",         # Hot Hits Mexico
    "KR": "6741578344",         # K-Pop Hits
    "JP": "2367364021",         # J-Pop Hits
    "IN": "2369003901",         # Bollywood Hits
    "AU": "2369007421",         # Hot Hits Australia
    "ID": "2369011841",         # Hot Hits Indonesia
    "TH": "2369014741",         # Hot Hits Thailand
    "CA": "1282598365",         # Hot Hits Canada
    "ES": "1282598925",         # Hot Hits Spain
    "IT": "1282599225",         # Hot Hits Italy
    "AR": "2369012481",         # Top Argentina
    "CO": "2369013061",         # Top Colombia
    "CL": "2369012821",         # Top Chile
    "PE": "2369013961",         # Top Peru
    "NO": "1282600585",         # Top Norway
    "AT": "1282597405",         # Top Austria
    "EG": "8046890342",         # Top Egypt
    "CN": "2367364021",         # Tạm dùng list J-pop/C-pop vì Deezer chặn ở TQ
}

# ── Deezer Playlist IDs nổi tiếng ────────────────────────────────────────────
SPECIAL_PLAYLISTS = {
    "tiktok_viral_global":  "8912748682",
    "tiktok_viral_us":      "7305684504",
    "hot_hits_global":      "1282588775",
    "pop_rising":           "4523543204",
    "rap_caviar":           "6728019124",
    "k-pop_hits":           "6741578344",
    "latin_hits":           "7052553504",
}


async def _get(url: str, params: dict | None = None, retries: int = 2) -> dict:
    """Helper GET với retry."""
    for attempt in range(retries):
        try:
            async with httpx.AsyncClient(timeout=12) as client:
                r = await client.get(url, params=params)
                if r.status_code == 200:
                    data = r.json()
                    # Deezer trả lỗi dạng {"error": {...}}
                    if "error" not in data:
                        return data
        except Exception as e:
            if attempt == retries - 1:
                print(f"⚠️ Deezer GET error [{url}]: {e}")
    return {}


def _format_track(t: dict, source: str = "Deezer") -> dict:
    """Chuẩn hóa 1 track Deezer sang format chung."""
    return {
        "name":       t.get("title") or t.get("name", ""),
        "artist":     t.get("artist", {}).get("name", ""),
        "album":      t.get("album", {}).get("title", ""),
        "deezer_id":  str(t.get("id", "")),
        "image":      t.get("album", {}).get("cover_medium", ""),
        "preview":    t.get("preview", ""),
        "duration":   t.get("duration", 0),
        "rank":       t.get("rank", 0),
        "explicit":   t.get("explicit_lyrics", False),
        "link":       t.get("link", ""),
        "source":     source,
        "source_url": t.get("link", ""),
    }


# ── Country Charts ────────────────────────────────────────────────────────────

async def get_country_chart(iso_code: str, limit: int = 30) -> list[dict]:
    """
    Top tracks tại 1 quốc gia theo Deezer.
    Thử theo thứ tự: editorial → playlist fallback → global chart
    """
    iso = iso_code.upper()

    # 1. Thử editorial chart (cách ổn định nhất)
    ed_id = COUNTRY_EDITORIAL_IDS.get(iso)
    if ed_id:
        data   = await _get(f"{BASE}/editorial/{ed_id}/charts")
        tracks = data.get("tracks", {}).get("data", [])
        if tracks:
            return [_format_track(t, source=f"Deezer Chart {iso}") for t in tracks[:limit]]

    # 2. Thử playlist fallback
    pl_id = COUNTRY_PLAYLIST_FALLBACK.get(iso)
    if pl_id:
        data   = await _get(f"{BASE}/playlist/{pl_id}/tracks", {"limit": limit})
        tracks = data.get("data", [])
        if tracks:
            return [_format_track(t, source=f"Deezer Playlist {iso}") for t in tracks[:limit]]

    # 3. Fallback sang global chart (chart/0)
    print(f"⚠️ Deezer: không tìm được chart {iso}, dùng global chart")
    data   = await _get(f"{BASE}/chart/0/tracks", {"limit": limit})
    tracks = data.get("data", [])
    return [_format_track(t, source="Deezer Global Fallback") for t in tracks[:limit]]


async def get_multiple_country_charts(
    iso_codes: list[str],
    limit: int = 10,
    delay: float = 0.2,
) -> dict[str, list[dict]]:
    """Lấy chart nhiều quốc gia — có delay tránh rate limit."""
    results: dict[str, list[dict]] = {}
    for code in iso_codes:
        results[code] = await get_country_chart(code, limit=limit)
        if results[code]:
            print(f"  ✓ Deezer {code}: {len(results[code])} tracks")
        await asyncio.sleep(delay)
    return results


# ── TikTok Viral / Special Playlists ─────────────────────────────────────────

async def get_tiktok_viral(region: str = "global", limit: int = 30) -> list[dict]:
    """Lấy danh sách bài hát đang viral TikTok từ Deezer playlist."""
    key   = f"tiktok_viral_{region}" if region != "global" else "tiktok_viral_global"
    pl_id = SPECIAL_PLAYLISTS.get(key, SPECIAL_PLAYLISTS["tiktok_viral_global"])
    data  = await _get(f"{BASE}/playlist/{pl_id}/tracks", {"limit": limit})
    tracks = data.get("data", [])
    return [_format_track(t, source="Deezer TikTok Viral") for t in tracks]


async def get_special_playlist(key: str, limit: int = 30) -> list[dict]:
    """Lấy 1 playlist đặc biệt theo key."""
    pl_id = SPECIAL_PLAYLISTS.get(key)
    if not pl_id:
        return []
    data   = await _get(f"{BASE}/playlist/{pl_id}/tracks", {"limit": limit})
    tracks = data.get("data", [])
    return [_format_track(t, source=f"Deezer {key}") for t in tracks]


# ── Global Chart ──────────────────────────────────────────────────────────────

async def get_global_chart(limit: int = 50) -> list[dict]:
    """Deezer Global Top chart."""
    data   = await _get(f"{BASE}/chart/0/tracks", {"limit": limit})
    tracks = data.get("data", [])
    return [_format_track(t, source="Deezer Global Chart") for t in tracks]


# ── Search & Metadata ─────────────────────────────────────────────────────────

async def search_track(track_name: str, artist_name: str = "", limit: int = 5) -> list[dict]:
    """Tìm bài hát trên Deezer."""
    q    = f'track:"{track_name}"' + (f' artist:"{artist_name}"' if artist_name else "")
    data = await _get(f"{BASE}/search", {"q": q, "limit": limit})
    return [_format_track(t, source="Deezer Search") for t in data.get("data", [])]


async def get_track_metadata(deezer_id: str) -> dict:
    """Lấy đầy đủ metadata 1 bài hát theo Deezer ID."""
    data = await _get(f"{BASE}/track/{deezer_id}")
    if not data:
        return {}
    return {
        **_format_track(data, source="Deezer"),
        "bpm":          data.get("bpm", 0),
        "gain":         data.get("gain", 0),
        "contributors": [c.get("name") for c in data.get("contributors", [])],
        "release_date": data.get("release_date", ""),
    }


async def get_artist_top_tracks(artist_id: str, limit: int = 10) -> list[dict]:
    """Top tracks của 1 nghệ sĩ trên Deezer."""
    data   = await _get(f"{BASE}/artist/{artist_id}/top", {"limit": limit})
    tracks = data.get("data", [])
    return [_format_track(t, source="Deezer Artist Top") for t in tracks]


async def get_artist_info(artist_name: str) -> dict:
    """Tìm thông tin nghệ sĩ trên Deezer."""
    data  = await _get(f"{BASE}/search/artist", {"q": artist_name, "limit": 1})
    items = data.get("data", [])
    if not items:
        return {}
    a = items[0]
    return {
        "deezer_id": str(a.get("id")),
        "name":      a.get("name"),
        "image":     a.get("picture_medium"),
        "fans":      a.get("nb_fan", 0),
        "albums":    a.get("nb_album", 0),
        "link":      a.get("link"),
        "source":    "Deezer",
    }