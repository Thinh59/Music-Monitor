"""Music Intelligence Agent — ReAct-style với Gemini.

Agent có quyền gọi các tool nội bộ (chart data, trend, prediction) và web search
qua DuckDuckGo. Mỗi vòng agent xuất 1 JSON: hoặc gọi tool, hoặc trả lời cuối cùng.
Thông tin trace được stream ra qua SSE.
"""

from __future__ import annotations

import json
import re
from typing import Any, AsyncGenerator, Callable, Awaitable

import google.generativeai as genai

from app.config import settings
from app.ai.text_clean import strip_markdown
from app.ai.tools import duckduckgo, data_query

genai.configure(api_key=settings.gemini_api_key)
_agent_model = genai.GenerativeModel("gemini-3.1-flash-lite-preview")


# ── Tool registry ────────────────────────────────────────────────────────────
ToolFn = Callable[..., Awaitable[Any]]

TOOLS: dict[str, dict[str, Any]] = {
    "web_search": {
        "fn": duckduckgo.web_search,
        "description": "Tìm kiếm web qua DuckDuckGo. Dùng khi cần thông tin mới ngoài database. Nếu tìm kiếm thông tin về Việt Nam, hãy đặt region='vi-vn'.",
        "params": {"query": "string", "max_results": "int (mặc định 5)", "region": "string (mặc định 'wt-wt', ví dụ 'vi-vn' cho Việt Nam)"},
    },
    "web_news": {
        "fn": duckduckgo.web_news,
        "description": "Tìm tin tức gần đây qua DuckDuckGo News. Dùng region='vi-vn' để tìm tin Việt Nam.",
        "params": {"query": "string", "max_results": "int (mặc định 5)", "region": "string (mặc định 'wt-wt')"},
    },
    "get_global_charts": {
        "fn": data_query.get_global_charts,
        "description": "Top tracks toàn cầu hôm nay từ Last.fm.",
        "params": {"limit": "int (mặc định 10)"},
    },
    "get_country_top": {
        "fn": data_query.get_country_top,
        "description": "Top tracks theo quốc gia (vietnam, korea, japan, ...).",
        "params": {"country": "string (tên tiếng Anh, lowercase)", "limit": "int"},
    },
    "get_tiktok_trends": {
        "fn": data_query.get_tiktok_trends,
        "description": "Bài hát đang viral TikTok (Deezer playlist).",
        "params": {"limit": "int"},
    },
    "get_reddit_buzz": {
        "fn": data_query.get_reddit_buzz,
        "description": "Hot posts + sentiment trên subreddit nhạc.",
        "params": {"subreddit": "string (mặc định Music)", "limit": "int"},
    },
    "get_youtube_for_track": {
        "fn": data_query.get_youtube_for_track,
        "description": "Tìm MV YouTube cho 1 bài hát và lấy view/like/comment.",
        "params": {"track_name": "string", "artist": "string"},
    },
    "viral_score": {
        "fn": data_query.viral_score,
        "description": "Tính viral score 0-100 cho 1 bài (kết hợp YouTube + Reddit).",
        "params": {"track_name": "string", "artist": "string"},
    },
    "artist_tags": {
        "fn": data_query.artist_tags,
        "description": "Genre tags của 1 nghệ sĩ.",
        "params": {"artist": "string"},
    },
}


def _tools_descriptor() -> str:
    lines = []
    for name, meta in TOOLS.items():
        params = ", ".join(f"{k}: {v}" for k, v in meta["params"].items())
        lines.append(f"- {name}({params}): {meta['description']}")
    return "\n".join(lines)


SYSTEM_PROMPT = f"""Bạn là Music Intelligence Agent. Bạn trả lời câu hỏi của người dùng về \
âm nhạc toàn cầu bằng cách kết hợp dữ liệu nội bộ (Last.fm, Deezer, Reddit, YouTube) \
và web search (DuckDuckGo).

Bạn có các tool sau:
{_tools_descriptor()}

QUY TẮC TRẢ LỜI:
1. Mỗi lượt, output DUY NHẤT một JSON object — KHÔNG kèm markdown, KHÔNG ```.
2. Nếu cần dùng tool: {{"thought": "lý do ngắn", "action": "tên_tool", "input": {{...}}}}
3. Nếu đã đủ thông tin: {{"thought": "lý do", "final_answer": "câu trả lời tiếng Việt, plain text"}}
4. Để xác minh thông tin, dùng ít nhất 2 nguồn khác nhau (web_search + dữ liệu nội bộ) trước khi trả lời.
5. KIẾN THỨC VỀ VIỆT NAM (QUAN TRỌNG):
   - Khi hỏi "bài hát hot nhất Việt Nam / top trending VN", hạn chế chỉ dựa vào dữ liệu Last.fm "vietnam" (get_country_top) vì data ít và lỗi thời.
   - BẮT BUỘC ưu tiên sử dụng web_search(query="Bảng xếp hạng âm nhạc Việt Nam Zing MP3, Nhaccuatui, Spotify VN hoặc YouTube trending music VN", region="vi-vn") & web_news(query="nhạc Việt Nam tiktok trending", region="vi-vn") để có thông tin V-Pop mới nhất và chính xác nhất. HÃY dùng web_search để tự do tìm hiểu rộng hơn nếu thấy cần thiết.
6. Trong final_answer: KHÔNG dùng markdown, KHÔNG dùng ## hay **. Chỉ plain text với xuống dòng \\n.
7. Nếu tool báo lỗi, thử tool khác hoặc trả lời "Không tìm thấy dữ liệu".
8. Tối đa 6 vòng tool — sau đó BẮT BUỘC trả final_answer.
"""

MAX_ITERATIONS = 6


# ── Helpers ──────────────────────────────────────────────────────────────────


def _parse_agent_output(text: str) -> dict[str, Any]:
    """Trích JSON từ output Gemini (đôi khi wrap trong ```json...```)."""
    s = text.strip()
    if s.startswith("```"):
        s = s.split("```", 2)[1]
        if s.startswith("json"):
            s = s[4:]
        s = s.strip().rstrip("`").strip()

    # Cố gắng parse trực tiếp
    try:
        return json.loads(s)
    except Exception:
        pass

    # Tìm khối JSON đầu tiên trong text
    m = re.search(r"\{[\s\S]+\}", s)
    if m:
        try:
            return json.loads(m.group(0))
        except Exception:
            pass

    return {"final_answer": s, "thought": "(không parse được JSON)"}


async def _call_agent_model(prompt: str) -> str:
    response = await _agent_model.generate_content_async(
        prompt,
        generation_config=genai.types.GenerationConfig(
            temperature=0.4,
            max_output_tokens=900,
        ),
    )
    return response.text or ""


def _shrink(obj: Any, max_chars: int = 1800) -> str:
    """Convert tool result thành chuỗi gọn để gửi lại cho agent."""
    try:
        s = json.dumps(obj, ensure_ascii=False, default=str)
    except Exception:
        s = str(obj)
    if len(s) > max_chars:
        s = s[:max_chars] + "...(cắt)"
    return s


# ── Main agent loop ──────────────────────────────────────────────────────────


async def run_agent(user_message: str) -> AsyncGenerator[dict[str, Any], None]:
    """Generator yield event dicts cho SSE.

    Mỗi event có {"type": "thought|tool_call|tool_result|answer|error|done", ...}.
    """

    history = [
        f"SYSTEM:\n{SYSTEM_PROMPT}",
        f"USER:\n{user_message}",
    ]

    for iteration in range(MAX_ITERATIONS):
        prompt = "\n\n".join(history) + "\n\nASSISTANT (JSON):"

        try:
            raw = await _call_agent_model(prompt)
        except Exception as e:
            yield {"type": "error", "message": f"Gemini lỗi: {e}"}
            return

        parsed = _parse_agent_output(raw)
        thought = parsed.get("thought", "")
        if thought:
            yield {"type": "thought", "message": strip_markdown(thought)}

        # Final answer
        if "final_answer" in parsed and parsed["final_answer"]:
            answer = strip_markdown(str(parsed["final_answer"]))
            yield {"type": "answer", "message": answer}
            yield {"type": "done"}
            return

        # Tool call
        action = parsed.get("action")
        if not action:
            # Không có action, không có final → coi như final
            yield {
                "type": "answer",
                "message": strip_markdown(raw) or "Không tạo được câu trả lời.",
            }
            yield {"type": "done"}
            return

        if action not in TOOLS:
            yield {"type": "error", "message": f"Tool không tồn tại: {action}"}
            history.append(
                f"OBSERVATION:\nLỗi: tool '{action}' không tồn tại. Dùng tool khác từ danh sách."
            )
            continue

        tool_input = parsed.get("input", {}) or {}
        yield {
            "type": "tool_call",
            "name": action,
            "input": tool_input,
            "iteration": iteration + 1,
        }

        try:
            result = await TOOLS[action]["fn"](**tool_input)
        except TypeError as e:
            result = {"error": f"Sai tham số tool {action}: {e}"}
        except Exception as e:
            result = {"error": f"Tool {action} lỗi: {e}"}

        preview = _shrink(result, max_chars=400)
        yield {"type": "tool_result", "name": action, "preview": preview}

        history.append(
            f"ASSISTANT_ACTION:\n{json.dumps({'action': action, 'input': tool_input}, ensure_ascii=False)}"
        )
        history.append(f"OBSERVATION:\n{_shrink(result, max_chars=2200)}")

    # Đã hết MAX_ITERATIONS — buộc trả lời cuối
    final_prompt = (
        "\n\n".join(history)
        + "\n\nĐÃ HẾT lượt tool. Hãy trả lời cuối cùng dưới dạng JSON:\n"
        + '{"final_answer": "..."}'
    )
    try:
        raw = await _call_agent_model(final_prompt)
        parsed = _parse_agent_output(raw)
        answer = strip_markdown(str(parsed.get("final_answer", raw)))
    except Exception as e:
        answer = f"Hết lượt tool. Lỗi: {e}"

    yield {"type": "answer", "message": answer}
    yield {"type": "done"}
