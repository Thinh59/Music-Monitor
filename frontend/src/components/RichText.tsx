"use client";

import {
  parseSectionText,
  tokenizeInline,
  type InlineToken,
  type SectionBlock,
} from "@/lib/parseSection";
import { cleanText } from "@/lib/cleanText";

interface Props {
  text: string;
  /** Compact mode: text size 12px thay vì 14px (cho insights phụ). */
  size?: "sm" | "md";
  /** Bỏ qua block lead — render tất cả paragraph cùng cỡ. */
  noLead?: boolean;
}

function renderInline(text: string, size: "sm" | "md") {
  const numClass = size === "sm" ? "text-[11px]" : "text-xs";
  return tokenizeInline(text).map((t: InlineToken, i) => {
    if (t.kind === "quote") {
      return (
        <mark
          key={i}
          className="text-accent-purple bg-accent-purple/10 px-1.5 py-0.5 rounded font-medium"
        >
          {t.value}
        </mark>
      );
    }
    if (t.kind === "num") {
      return (
        <span
          key={i}
          className={`font-mono text-accent-cyan font-semibold ${numClass}`}
        >
          {t.value}
        </span>
      );
    }
    return <span key={i}>{t.value}</span>;
  });
}

function renderBlock(
  block: SectionBlock,
  idx: number,
  size: "sm" | "md",
  noLead: boolean,
) {
  const baseText =
    size === "sm"
      ? "text-xs leading-relaxed"
      : "text-sm leading-relaxed";

  if (block.kind === "lead") {
    return (
      <p
        key={idx}
        className={
          noLead
            ? `${baseText} text-text-secondary`
            : `${baseText} font-medium text-text-primary`
        }
      >
        {renderInline(block.text, size)}
      </p>
    );
  }
  if (block.kind === "para") {
    if (block.label) {
      return (
        <div key={idx} className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-accent-purple">
            {block.label}
          </p>
          <p className={`${baseText} text-text-secondary`}>
            {renderInline(block.text, size)}
          </p>
        </div>
      );
    }
    return (
      <p key={idx} className={`${baseText} text-text-secondary`}>
        {renderInline(block.text, size)}
      </p>
    );
  }
  return (
    <ol key={idx} className="space-y-1.5">
      {block.items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-2.5 rounded-lg bg-bg-elevated/60 border border-border-subtle px-2.5 py-1.5"
        >
          <span className="flex-shrink-0 h-6 w-6 rounded-md bg-gradient-aurora flex items-center justify-center text-white text-[10px] font-bold">
            {item.rank}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-text-primary truncate">
              {renderInline(item.primary, size)}
            </p>
            {item.secondary && (
              <p className="text-[11px] text-text-muted truncate">
                {renderInline(item.secondary, size)}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function RichText({ text, size = "sm", noLead = false }: Props) {
  const cleaned = cleanText(text);
  if (!cleaned) return null;
  const blocks = parseSectionText(cleaned);
  return (
    <div className="space-y-2.5">
      {blocks.map((b, i) => renderBlock(b, i, size, noLead))}
    </div>
  );
}
