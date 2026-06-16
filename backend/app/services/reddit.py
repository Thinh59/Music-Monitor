import httpx
import time
from app.config import settings

async def get_trending_music_posts(subreddit: str = "Music", limit: int = 20) -> list[dict]:
    """Lấy bài đăng nổi bật qua Public JSON của Reddit thay vì OAuth."""
    url = f"https://www.reddit.com/r/{subreddit}/hot.json"
    
    # User-Agent là BẮT BUỘC để không bị Reddit block
    headers = {
        "User-Agent": settings.reddit_user_agent
    }
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, headers=headers, params={"limit": limit})
            resp.raise_for_status()
            data = resp.json()
            
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
    """Tìm kiếm đề cập đến nghệ sĩ qua public search JSON."""
    url = "https://www.reddit.com/r/all/search.json"
    headers = {
        "User-Agent": settings.reddit_user_agent
    }
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, headers=headers, params={
                "q": query,
                "sort": "new",
                "limit": limit
            })
            resp.raise_for_status()
            data = resp.json()
            
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