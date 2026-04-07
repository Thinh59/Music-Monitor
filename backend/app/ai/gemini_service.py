"""
Gemini Service — Dùng Gemini 3.1 Flash-Lite (tên đúng trong API Google)
Thay thế hoàn toàn Claude API để tiết kiệm chi phí.

FIX: Rate-limit throttle — tối đa 12 req/phút (dưới ngưỡng 14/phút của free tier)
     + Exponential backoff khi gặp 429
     + In-memory daily cache cho briefing
"""

import asyncio
import time
import re
from collections import deque
from datetime import date

import google.generativeai as genai
from app.config import settings

# ── Khởi tạo model 1 lần ─────────────────────────────────────────────────────
genai.configure(api_key=settings.gemini_api_key)
_model =  genai.GenerativeModel('gemini-3.1-flash-lite-preview')

# ── Rate-limit queue (tối đa 12 req / 62s) ────────────────────────────────────
_MAX_RPM       = 12          # an toàn dưới giới hạn 14/phút của free tier
_WINDOW_SEC    = 62          # cửa sổ 62s để chắc chắn
_request_times: deque = deque()
_rate_lock = asyncio.Lock()


async def _wait_for_slot():
    """Chờ cho đến khi còn slot trong cửa sổ 62s."""
    async with _rate_lock:
        while True:
            now = time.monotonic()
            while _request_times and now - _request_times[0] > _WINDOW_SEC:
                _request_times.popleft()

            if len(_request_times) < _MAX_RPM:
                _request_times.append(now)
                return

            oldest = _request_times[0]
            wait_s = _WINDOW_SEC - (now - oldest) + 0.5
            print(f"⏳ Gemini throttle: chờ {wait_s:.1f}s ({len(_request_times)}/{_MAX_RPM} req/min)")
            await asyncio.sleep(wait_s)


async def _call_gemini(prompt: str, max_tokens: int = 600, retries: int = 3) -> str:
    """Gọi Gemini, tự retry khi gặp 429 với exponential backoff."""
    for attempt in range(retries):
        await _wait_for_slot()
        try:
            response = await _model.generate_content_async(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=max_tokens,
                ),
            )
            return response.text
        except Exception as e:
            err_str = str(e)
            is_rate  = "429" in err_str or "quota" in err_str.lower() or "rate" in err_str.lower()

            if is_rate and attempt < retries - 1:
                wait_s = 35 * (attempt + 1)
                m = re.search(r"seconds[\":\s]+(\d+)", err_str)
                if m:
                    wait_s = int(m.group(1)) + 3
                print(f"⚠️ Gemini 429 (lần {attempt+1}/{retries}): chờ {wait_s}s...")
                await asyncio.sleep(wait_s)
                continue

            print(f"⚠️ Gemini error: {e}")
            return f"⚠️ AI tạm thời không khả dụng. Lỗi: {err_str[:300]}"

    return "⚠️ AI không khả dụng sau nhiều lần thử. Vui lòng thử lại sau vài phút."


# ── Cache theo ngày ──────────────────────────────────────────────────────────
_insight_cache: dict[str, str] = {}


async def analyze_country_insight(prompt: str, cache_key: str = "") -> str:
    """
    Hàm chung — gửi prompt lên Gemini và trả về text.
    Dùng cho: country insight, daily briefing, trend explanation.
    """
    if cache_key:
        full_key = f"{date.today()}:{cache_key}"
        if full_key in _insight_cache:
            print(f"💾 Gemini cache hit: {cache_key}")
            return _insight_cache[full_key]

    result = await _call_gemini(prompt)

    if cache_key and not result.startswith("⚠️"):
        _insight_cache[f"{date.today()}:{cache_key}"] = result

    return result


async def generate_daily_briefing(
    top_tracks:     list,
    trending:       list,
    predicted_hits: list,
    regions:        dict = {},
) -> str:
    """Tương thích ngược với các file cũ."""
    tracks_str   = "\n".join([f"- {t.get('name','')} ({t.get('artist','')}): {int(t.get('playcount',0)):,} plays" for t in top_tracks[:5]])
    trending_str = "\n".join([f"- {t.get('name','')} — viral score {t.get('viral_score', 0)}" for t in trending[:3]])
    hits_str     = "\n".join([f"- {h.get('name','')} — {h.get('hit_probability', 0)}% hit probability" for h in predicted_hits[:3]])

    prompt = f"""Bạn là biên tập viên âm nhạc. Viết Daily Music Briefing ngắn gọn bằng tiếng Việt (150 từ).

Top charts: {tracks_str}
Đang viral: {trending_str}
Dự báo hit: {hits_str}

Viết theo 3 phần: 📊 Top Charts · 🔥 Đang Viral · 🎯 Dự báo"""

    return await analyze_country_insight(prompt, cache_key="daily_briefing_legacy")


async def explain_trend(
    track_name: str, artist: str,
    youtube_growth_pct: float, reddit_mentions: int,
    sentiment_score: float, top_reddit_post: str = "", genre: str = "",
) -> str:
    """Giải thích tại sao 1 bài hát đang viral."""
    cache_key = f"trend:{track_name}:{artist}"
    prompt = f"""Bài hát "{track_name}" của {artist} đang viral. Hãy giải thích ngắn gọn (2-3 câu tiếng Việt) tại sao:
- YouTube growth 24h: {youtube_growth_pct:.1f}%
- Reddit mentions: {reddit_mentions} posts
- Sentiment score: {sentiment_score:.2f}
- Post hot nhất: "{top_reddit_post[:100]}"
- Thể loại: {genre}"""
    return await analyze_country_insight(prompt, cache_key=cache_key)