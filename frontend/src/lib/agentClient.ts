// Stream agent events từ backend qua SSE-style POST.

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export type AgentEvent =
  | { type: "thought"; message: string }
  | { type: "tool_call"; name: string; input: Record<string, unknown>; iteration: number }
  | { type: "tool_result"; name: string; preview: string }
  | { type: "answer"; message: string }
  | { type: "error"; message: string }
  | { type: "done" };

export async function streamAgent(
  message: string,
  onEvent: (e: AgentEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/agent/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`Agent stream failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let sep: number;
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const chunk = buffer.slice(0, sep).trim();
      buffer = buffer.slice(sep + 2);
      if (!chunk.startsWith("data:")) continue;
      const payload = chunk.replace(/^data:\s*/, "");
      try {
        const evt = JSON.parse(payload) as AgentEvent;
        onEvent(evt);
        if (evt.type === "done") return;
      } catch {
        // skip malformed
      }
    }
  }
}
