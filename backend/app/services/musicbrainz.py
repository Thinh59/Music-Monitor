import httpx
import asyncio

BASE_URL = "https://musicbrainz.org/ws/2"
HEADERS  = {"User-Agent": "MusicMonitor/1.0 ( contact@example.com )"}

async def search_recording(song_name: str, artist_name: str) -> dict:
    """
    Tìm kiếm bài hát trên MusicBrainz để lấy MBID, metadata.
    Rate limit: 1 req/giây — dùng asyncio.sleep(1) giữa các call.
    """
    async with httpx.AsyncClient(headers=HEADERS) as client:
        resp = await client.get(f"{BASE_URL}/recording/", params={
            "query": f"{song_name} artist:{artist_name}",
            "fmt": "json",
            "limit": 5
        })
        data = resp.json()
        recordings = data.get("recordings", [])
        if not recordings:
            return {}
        rec = recordings[0]
        return {
            "mbid": rec.get("id"),
            "title": rec.get("title"),
            "artist": rec["artist-credit"][0]["name"] if rec.get("artist-credit") else artist_name,
            "duration_ms": rec.get("length"),
            "isrc": rec.get("isrcs", [None])[0],
            "source": "MusicBrainz",
            "source_url": f"https://musicbrainz.org/recording/{rec.get('id')}"
        }

async def get_artist_info(artist_name: str) -> dict:
    """Lấy thông tin nghệ sĩ: quốc gia xuất xứ, năm hoạt động, thể loại."""
    await asyncio.sleep(1)   # Tôn trọng rate limit 1 req/s
    async with httpx.AsyncClient(headers=HEADERS) as client:
        resp = await client.get(f"{BASE_URL}/artist/", params={
            "query": artist_name,
            "fmt": "json",
            "limit": 3
        })
        data = resp.json()
        artists = data.get("artists", [])
        if not artists:
            return {}
        a = artists[0]
        return {
            "mbid": a.get("id"),
            "name": a.get("name"),
            "country": a.get("country"),
            "begin_year": a.get("life-span", {}).get("begin", "")[:4],
            "end_year": a.get("life-span", {}).get("end", ""),
            "tags": [t["name"] for t in a.get("tags", [])[:5]],
            "source": "MusicBrainz",
            "source_url": f"https://musicbrainz.org/artist/{a.get('id')}"
        }

async def get_release_info(album_name: str, artist_name: str) -> dict:
    """Lấy thông tin album/single: ngày phát hành theo quốc gia."""
    await asyncio.sleep(1)
    async with httpx.AsyncClient(headers=HEADERS) as client:
        resp = await client.get(f"{BASE_URL}/release/", params={
            "query": f"{album_name} artist:{artist_name}",
            "fmt": "json",
            "limit": 3
        })
        data = resp.json()
        releases = data.get("releases", [])
        if not releases:
            return {}
        r = releases[0]
        return {
            "mbid": r.get("id"),
            "title": r.get("title"),
            "date": r.get("date"),
            "country": r.get("country"),
            "label": r.get("label-info", [{}])[0].get("label", {}).get("name") if r.get("label-info") else None,
            "source": "MusicBrainz",
            "source_url": f"https://musicbrainz.org/release/{r.get('id')}"
        }