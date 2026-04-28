"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  User,
  Send,
  Search,
  Wrench,
  Loader2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { streamAgent, type AgentEvent } from "@/lib/agentClient";

interface TraceItem {
  kind: "thought" | "tool_call" | "tool_result" | "error";
  text: string;
  toolName?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  trace?: TraceItem[];
  pending?: boolean;
}

const SUGGESTIONS = [
  "Bài hát nào đang viral nhất ở Việt Nam hôm nay?",
  "So sánh top chart Hàn Quốc và Mỹ tuần này.",
  "Tại sao bài 'APT.' của Rosé đang trending? Verify từ web.",
  "Sentiment cộng đồng Reddit về K-pop tuần này thế nào?",
];

export default function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function send(messageText?: string) {
    const text = (messageText ?? input).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text,
    };
    const assistantId = crypto.randomUUID();
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      text: "",
      trace: [],
      pending: true,
    };
    setMessages((m) => [...m, userMsg, assistantMsg]);
    setInput("");
    setLoading(true);

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const updateAssistant = (patch: (m: Message) => Message) =>
      setMessages((all) =>
        all.map((m) => (m.id === assistantId ? patch(m) : m)),
      );

    const onEvent = (evt: AgentEvent) => {
      if (evt.type === "thought") {
        updateAssistant((m) => ({
          ...m,
          trace: [...(m.trace ?? []), { kind: "thought", text: evt.message }],
        }));
      } else if (evt.type === "tool_call") {
        updateAssistant((m) => ({
          ...m,
          trace: [
            ...(m.trace ?? []),
            {
              kind: "tool_call",
              text: JSON.stringify(evt.input),
              toolName: evt.name,
            },
          ],
        }));
      } else if (evt.type === "tool_result") {
        updateAssistant((m) => ({
          ...m,
          trace: [
            ...(m.trace ?? []),
            { kind: "tool_result", text: evt.preview, toolName: evt.name },
          ],
        }));
      } else if (evt.type === "answer") {
        updateAssistant((m) => ({ ...m, text: evt.message }));
      } else if (evt.type === "error") {
        updateAssistant((m) => ({
          ...m,
          trace: [...(m.trace ?? []), { kind: "error", text: evt.message }],
        }));
      } else if (evt.type === "done") {
        updateAssistant((m) => ({ ...m, pending: false }));
      }
    };

    try {
      await streamAgent(text, onEvent, ctrl.signal);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Lỗi kết nối agent";
      updateAssistant((m) => ({
        ...m,
        text: m.text || `⚠️ ${msg}`,
        pending: false,
        trace: [
          ...(m.trace ?? []),
          { kind: "error", text: msg },
        ],
      }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] max-w-4xl mx-auto">
      <div className="flex items-center gap-3 px-2 mb-4 flex-shrink-0">
        <div className="h-11 w-11 rounded-xl bg-gradient-aurora flex items-center justify-center shadow-glow">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">
            Music Intelligence{" "}
            <span className="gradient-text">Agent</span>
          </h1>
          <p className="text-xs text-text-muted">
            Có thể tìm kiếm web, truy vấn dữ liệu nội bộ và verify thông tin
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-thin space-y-4 px-2 pb-2"
      >
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-aurora items-center justify-center mb-4 shadow-glow">
              <Bot className="h-7 w-7 text-white" />
            </div>
            <p className="text-text-secondary mb-6">
              Hỏi gì cũng được. Agent sẽ tự gọi tool và verify thông tin.
            </p>
            <div className="grid sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-sm px-4 py-3 rounded-xl border border-border bg-bg-card hover:border-accent-purple/50 hover:bg-bg-elevated text-text-secondary hover:text-text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className={`flex gap-3 ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.role === "assistant" && (
                <div className="h-8 w-8 rounded-lg bg-gradient-aurora flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[78%] ${
                  m.role === "user" ? "order-2" : ""
                }`}
              >
                {/* trace */}
                {m.role === "assistant" && m.trace && m.trace.length > 0 && (
                  <div className="mb-2 space-y-1.5">
                    {m.trace.map((t, idx) => (
                      <TraceLine key={idx} item={t} />
                    ))}
                  </div>
                )}
                {/* main bubble */}
                {m.text || m.pending ? (
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm whitespace-pre-line ${
                      m.role === "user"
                        ? "bg-gradient-aurora text-white"
                        : "bg-bg-card border border-border text-text-primary"
                    }`}
                  >
                    {m.text ||
                      (m.pending ? (
                        <span className="text-text-muted inline-flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" /> Đang nghĩ...
                        </span>
                      ) : (
                        ""
                      ))}
                  </div>
                ) : null}
              </div>
              {m.role === "user" && (
                <div className="h-8 w-8 rounded-lg bg-bg-elevated border border-border flex items-center justify-center flex-shrink-0 order-3">
                  <User className="h-4 w-4 text-text-secondary" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="mt-4 flex gap-2 flex-shrink-0"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Hỏi về xu hướng, viral score, so sánh thị trường..."
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple/60"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 rounded-xl bg-gradient-aurora text-white font-semibold disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>
    </div>
  );
}

function TraceLine({ item }: { item: TraceItem }) {
  const Icon =
    item.kind === "tool_call"
      ? Wrench
      : item.kind === "tool_result"
      ? Search
      : item.kind === "error"
      ? AlertCircle
      : Sparkles;
  const color =
    item.kind === "error"
      ? "text-rose-400"
      : item.kind === "tool_call"
      ? "text-accent-blue"
      : item.kind === "tool_result"
      ? "text-emerald-400"
      : "text-accent-purple";

  return (
    <div className="flex items-start gap-2 text-xs text-text-muted">
      <Icon className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${color}`} />
      <div className="min-w-0">
        {item.toolName && (
          <span className="font-mono text-text-secondary">{item.toolName}</span>
        )}
        {item.toolName && " · "}
        <span className="break-words">
          {item.text.length > 220 ? item.text.slice(0, 220) + "…" : item.text}
        </span>
      </div>
    </div>
  );
}
