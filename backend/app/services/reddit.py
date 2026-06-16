import time

import httpx

from app.config import settings

# Cache token OAuth ở mức module (app-only token thường sống ~1 giờ).
_token_cache: dict = {"value": None, "expires_at": 0.0}


def _has_oauth_creds() -> bool:
    return bool(settings.reddit_client_id and settings.reddit_client_secret)


async def _get_oauth_token() -> str | None:
    """Lấy application-only OAuth token (client_credentials), có cache."""
    now = time.time()
    if _token_cache["value"] and now < _token_cache["expires_at"]:
        return _token_cache["value"]

    auth = httpx.BasicAuth(settings.reddit_client_id, settings.reddit_client_secret)
    headers = {"User-Agent": settings.reddit_user_agent}
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://www.reddit.com/api/v1/access_token",
            auth=auth,
            headers=headers,
            data={"grant_type": "client_credentials"},
        )
        resp.raise_for_status()
        data = resp.json()

    token = data.get("access_token")
    # Trừ hao 60s để tránh dùng token sát hạn.
    _token_cache["value"] = token
    _token_cache["expires_at"] = now + data.get("expires_in", 3600) - 60
    return token


async def _reddit_get(path: str, params: dict) -> dict:
    """GET tới Reddit: ưu tiên oauth.reddit.com (không bị chặn IP cloud),
    fallback public www.reddit.com nếu chưa cấu hình OAuth."""
    headers = {"User-Agent": settings.reddit_user_agent}

    if _has_oauth_creds():
        token = await _get_oauth_token()
        headers["Authorization"] = f"Bearer {token}"
        url = f"https://oauth.reddit.com{path}"
    else:
        # Public API yêu cầu đuôi .json
        url = f"https://www.reddit.com{path}.json"

    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=headers, params=params)
        resp.raise_for_status()
        return resp.json()


async def get_trending_music_posts(subreddit: str = "Music", limit: int = 20) -> list[dict]:
    """Lấy bài đăng nổi bật của subreddit."""
    try:
        data = await _reddit_get(f"/r/{subreddit}/hot", {"limit": limit})

        posts = []
        for item in data.get("data", {}).get("children", []):
            post = item["data"]
            posts.append({
                "title": post.get("title"),
                "score": post.get("score"),
                "url": post.get("url"),
                "num_comments": post.get("num_comments"),
                "created_utc": post.get("created_utc"),
                "subreddit": subreddit,
                "source": f"Reddit r/{subreddit}",
                "source_url": f"https://reddit.com{post.get('permalink')}"
            })
        return posts
    except Exception as e:
        print(f"[Reddit Error] Lỗi lấy dữ liệu: {e}")
        return []


async def search_artist_mentions(query: str, limit: int = 25) -> list[dict]:
    """Tìm kiếm đề cập đến nghệ sĩ trên toàn Reddit."""
    try:
        data = await _reddit_get(
            "/r/all/search",
            {"q": query, "sort": "new", "limit": limit, "restrict_sr": False},
        )

        posts = []
        for item in data.get("data", {}).get("children", []):
            post = item["data"]
            posts.append({
                "title": post.get("title"),
                "score": post.get("score"),
                "subreddit": post.get("subreddit"),
                "num_comments": post.get("num_comments"),
                "created_utc": post.get("created_utc"),
                "source": f"Reddit r/{post.get('subreddit')}",
                "source_url": f"https://reddit.com{post.get('permalink')}"
            })
        return posts
    except Exception as e:
        print(f"[Reddit Error] Lỗi tìm kiếm: {e}")
        return []


def count_mentions_24h(posts: list[dict]) -> int:
    """Đếm mentions trong 24 giờ qua."""
    cutoff = time.time() - 86400
    return sum(1 for p in posts if p["created_utc"] > cutoff)
