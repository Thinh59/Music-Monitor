// Parse section text từ AI briefing thành blocks: lead, list rows, body.
// Mục tiêu: tăng readability mà không cần dùng markdown.

export type SectionBlock =
  | { kind: "lead"; text: string }
  | { kind: "list"; items: { rank: number; primary: string; secondary?: string }[] }
  | { kind: "para"; text: string; label?: string };

const LIST_ITEM_RE = /^\s*(\d+)[\.\)]\s+(.+?)(?:\s+[-—–]\s+(.+))?$/;

// Vietnamese (and English) capitalized labels that introduce a new section.
// Match: "Word Word: " sau dấu kết câu hoặc đầu đoạn.
const LABEL_RE = /([.!?…])\s+([A-ZÀÁẢÃẠÂẦẤẨẪẬĂẰẮẲẴẶĐÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴ][\p{L}\d ]{2,32}):\s/gu;

const LABEL_AT_LINE_RE = /^([A-ZÀÁẢÃẠÂẦẤẨẪẬĂẰẮẲẴẶĐÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴ][\p{L}\d ]{2,32}):\s+(.+)$/u;

/** Chèn `\n\n` trước các label Vietnamese để tách đoạn. */
function injectParagraphBreaks(text: string): string {
  return text.replace(LABEL_RE, "$1\n\n$2: ");
}

export function parseSectionText(raw: string): SectionBlock[] {
  if (!raw) return [];
  const text = injectParagraphBreaks(raw.replace(/\r\n/g, "\n").trim());
  if (!text) return [];

  // Tách paragraphs theo blank line, sau đó split lines bên trong từng para
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const blocks: SectionBlock[] = [];
  let firstBlockEmitted = false;

  for (const para of paragraphs) {
    const lines = para.split("\n").map((l) => l.trim()).filter(Boolean);

    // Detect list (≥2 numbered items consecutive)
    const listItems: { rank: number; primary: string; secondary?: string }[] = [];
    let allListy = true;
    for (const line of lines) {
      const m = line.match(LIST_ITEM_RE);
      if (m) {
        listItems.push({
          rank: parseInt(m[1], 10),
          primary: m[2].trim(),
          secondary: m[3]?.trim(),
        });
      } else {
        allListy = false;
      }
    }
    if (allListy && listItems.length >= 2) {
      blocks.push({ kind: "list", items: listItems });
      continue;
    }

    // Otherwise: detect label + body (e.g. "Chủ đề chính: ...")
    const joined = lines.join(" ").trim();
    const labelMatch = joined.match(LABEL_AT_LINE_RE);

    if (labelMatch) {
      const label = labelMatch[1].trim();
      const body = labelMatch[2].trim();
      blocks.push({ kind: "para", text: body, label });
      firstBlockEmitted = true;
      continue;
    }

    // First plain paragraph: split lead sentence
    if (!firstBlockEmitted) {
      const split = splitLead(joined);
      blocks.push({ kind: "lead", text: split.lead });
      if (split.rest) blocks.push({ kind: "para", text: split.rest });
      firstBlockEmitted = true;
    } else {
      blocks.push({ kind: "para", text: joined });
    }
  }

  return blocks;
}

function splitLead(text: string): { lead: string; rest: string } {
  const idx = text.search(/(?<![\d])([.!?…])\s+/);
  if (idx === -1 || idx > 220) return { lead: text, rest: "" };
  const lead = text.slice(0, idx + 1).trim();
  const rest = text.slice(idx + 1).trim();
  return { lead, rest };
}

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
