"""Agent Chat Router — SSE streaming endpoint."""

import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.ai.agent import run_agent

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


@router.post("/chat")
async def chat(req: ChatRequest):
    """Stream phản hồi của Music Intelligence Agent qua Server-Sent Events.

    Frontend nên dùng `fetch` + `ReadableStream` (EventSource không hỗ trợ POST).
    Mỗi event là 1 dòng JSON kết thúc bằng \\n\\n.
    """

    async def event_stream():
        try:
            async for event in run_agent(req.message):
                yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
        except Exception as e:
            yield f'data: {json.dumps({"type": "error", "message": str(e)})}\n\n'
            yield f'data: {json.dumps({"type": "done"})}\n\n'

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@router.get("/tools")
async def list_tools():
    """Liệt kê các tool agent có thể dùng (cho UI hiển thị)."""
    from app.ai.agent import TOOLS

    return {
        "tools": [
            {"name": name, "description": meta["description"], "params": meta["params"]}
            for name, meta in TOOLS.items()
        ]
    }
