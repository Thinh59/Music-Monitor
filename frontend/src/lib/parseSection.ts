// Parse section text từ AI briefing thành blocks: lead, list rows, body.
// Mục tiêu: tăng readability mà không cần dùng markdown.

export type SectionBlock =
  | { kind: "lead"; text: string }
  | { kind: "list"; items: { rank: number; primary: string; secondary?: string }[] }
  | { kind: "para"; text: string };

const LIST_ITEM_RE = /^\s*(\d+)[\.\)]\s+(.+?)(?:\s+[-—–]\s+(.+))?$/;

export function parseSectionText(raw: string): SectionBlock[] {
  if (!raw) return [];
  const text = raw.replace(/\r\n/g, "\n").trim();
  if (!text) return [];

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const blocks: SectionBlock[] = [];
  let buffer: string[] = [];
  let listBuffer: { rank: number; primary: string; secondary?: string }[] = [];
  let firstBlockEmitted = false;

  const flushBuffer = () => {
    if (!buffer.length) return;
    const joined = buffer.join(" ").trim();
    if (!joined) {
      buffer = [];
      return;
    }
    if (!firstBlockEmitted) {
      // First non-list paragraph: split into lead (1st sentence) + rest
      const split = splitLead(joined);
      blocks.push({ kind: "lead", text: split.lead });
      if (split.rest) blocks.push({ kind: "para", text: split.rest });
      firstBlockEmitted = true;
    } else {
      blocks.push({ kind: "para", text: joined });
    }
    buffer = [];
  };

  const flushList = () => {
    if (!listBuffer.length) return;
    blocks.push({ kind: "list", items: listBuffer });
    listBuffer = [];
  };

  for (const line of lines) {
    const m = line.match(LIST_ITEM_RE);
    if (m) {
      flushBuffer();
      listBuffer.push({
        rank: parseInt(m[1], 10),
        primary: m[2].trim(),
        secondary: m[3]?.trim(),
      });
    } else {
      flushList();
      buffer.push(line);
    }
  }
  flushBuffer();
  flushList();
  return blocks;
}

function splitLead(text: string): { lead: string; rest: string } {
  // Tách câu đầu tiên (dừng ở `.`, `!`, `?`, `…` không phải số thập phân)
  const idx = text.search(/(?<![\d])([.!?…])\s+/);
  if (idx === -1 || idx > 220) {
    return { lead: text, rest: "" };
  }
  const lead = text.slice(0, idx + 1).trim();
  const rest = text.slice(idx + 1).trim();
  return { lead, rest };
}

// Highlight inline: quoted strings → tokens for renderer to wrap.
export type InlineToken =
  | { kind: "text"; value: string }
  | { kind: "quote"; value: string }
  | { kind: "num"; value: string };

const QUOTE_RE = /["“”]([^"“”\n]{1,80})["“”]/g;
const NUM_RE = /\b\d+(?:[.,]\d+)?%?\b/g;

export function tokenizeInline(text: string): InlineToken[] {
  if (!text) return [];
  const tokens: InlineToken[] = [];
  let lastIdx = 0;

  // Find quotes first (priority), then numbers in non-quote spans
  const quoteMatches: { start: number; end: number; value: string }[] = [];
  for (const m of text.matchAll(QUOTE_RE)) {
    if (m.index === undefined) continue;
    quoteMatches.push({
      start: m.index,
      end: m.index + m[0].length,
      value: m[1],
    });
  }

  const pushTextWithNums = (slice: string) => {
    if (!slice) return;
    let pos = 0;
    for (const nm of slice.matchAll(NUM_RE)) {
      if (nm.index === undefined) continue;
      if (nm.index > pos) {
        tokens.push({ kind: "text", value: slice.slice(pos, nm.index) });
      }
      tokens.push({ kind: "num", value: nm[0] });
      pos = nm.index + nm[0].length;
    }
    if (pos < slice.length) {
      tokens.push({ kind: "text", value: slice.slice(pos) });
    }
  };

  for (const q of quoteMatches) {
    if (q.start > lastIdx) pushTextWithNums(text.slice(lastIdx, q.start));
    tokens.push({ kind: "quote", value: q.value });
    lastIdx = q.end;
  }
  if (lastIdx < text.length) pushTextWithNums(text.slice(lastIdx));

  return tokens.length ? tokens : [{ kind: "text", value: text }];
}
