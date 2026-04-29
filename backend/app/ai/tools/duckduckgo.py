"""DuckDuckGo web search tool — không cần API key."""

import asyncio
from typing import Any

try:
    from duckduckgo_search import DDGS
    _HAS_DDGS = True
except ImportError:
    _HAS_DDGS = False


async def web_search(query: str, max_results: int = 5, region: str = "wt-wt") -> list[dict[str, Any]]:
    """Tìm kiếm web qua DuckDuckGo. Trả về list {title, href, body}."""
    if not _HAS_DDGS:
        return [{"error": "duckduckgo-search package chưa cài. pip install duckduckgo-search"}]

    def _sync():
        try:
            with DDGS() as ddgs:
                return list(ddgs.text(query, max_results=max_results, region=region))
        except Exception as e:
            return [{"error": f"DuckDuckGo error: {e}"}]

    return await asyncio.to_thread(_sync)


async def web_news(query: str, max_results: int = 5, region: str = "wt-wt") -> list[dict[str, Any]]:
    """Tìm tin tức gần đây qua DuckDuckGo News."""
    if not _HAS_DDGS:
        return [{"error": "duckduckgo-search package chưa cài."}]

    def _sync():
        try:
            with DDGS() as ddgs:
                return list(ddgs.news(query, max_results=max_results, region=region))
        except Exception as e:
            return [{"error": f"DuckDuckGo news error: {e}"}]

    return await asyncio.to_thread(_sync)
