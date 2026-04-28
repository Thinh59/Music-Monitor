"use client";

import {
  Bot,
  Sunrise,
  BarChart3,
  Flame,
  MessageCircle,
  Target,
  RefreshCw,
  Loader2,
  Database,
  Sparkles,
} from "lucide-react";
import type { DailyBriefing, BriefingSections } from "@/types";
import { cleanText } from "@/lib/cleanText";
import {
  parseSectionText,
  tokenizeInline,
  type InlineToken,
  type SectionBlock,
} from "@/lib/parseSection";

interface BriefingCardProps {
  briefing: DailyBriefing;
  onRefresh?: () => void;
  loading?: boolean;
}

const SECTIONS: {
  key: keyof BriefingSections;
  label: string;
  Icon: typeof Sunrise;
  hue: string;
}[] = [
  { key: "overview", label: "Tổng quan hôm nay", Icon: Sunrise, hue: "from-amber-500/15 to-pink-500/10" },
  { key: "top_charts", label: "Top Charts", Icon: BarChart3, hue: "from-purple-500/15 to-blue-500/10" },
  { key: "tiktok", label: "TikTok Viral Alert", Icon: Flame, hue: "from-fuchsia-500/15 to-rose-500/10" },
  { key: "community", label: "Cộng đồng nói gì", Icon: MessageCircle, hue: "from-blue-500/15 to-cyan-500/10" },
  { key: "forecast", label: "Dự báo tuần tới", Icon: Target, hue: "from-emerald-500/15 to-teal-500/10" },
];

function fallbackSections(text: string): BriefingSections {
  return {
    overview: cleanText(text),
    top_charts: "",
    tiktok: "",
    community: "",
    forecast: "",
  };
}

function renderInline(text: string) {
  const tokens = tokenizeInline(text);
  return tokens.map((t: InlineToken, i) => {
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
        <span key={i} className="font-mono text-accent-cyan font-semibold">
          {t.value}
        </span>
      );
    }
    return <span key={i}>{t.value}</span>;
  });
}

function renderBlock(block: SectionBlock, idx: number) {
  if (block.kind === "lead") {
    return (
      <p
        key={idx}
        className="text-base leading-relaxed font-medium text-text-primary"
      >
        {renderInline(block.text)}
      </p>
    );
  }
  if (block.kind === "para") {
    return (
      <p
        key={idx}
        className="text-sm leading-relaxed text-text-secondary"
      >
        {renderInline(block.text)}
      </p>
    );
  }
  // list
  return (
    <ol key={idx} className="space-y-1.5">
      {block.items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-3 rounded-lg bg-bg-elevated/60 border border-border-subtle px-3 py-2"
        >
          <span className="flex-shrink-0 h-7 w-7 rounded-md bg-gradient-aurora flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {item.rank}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-text-primary truncate">
              {renderInline(item.primary)}
            </p>
            {item.secondary && (
              <p className="text-xs text-text-muted truncate">
                {renderInline(item.secondary)}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function BriefingCard({ briefing, onRefresh, loading }: BriefingCardProps) {
  const date = new Date(briefing.generated_at).toLocaleString("vi-VN");
  const sections =
    briefing.briefing_sections ?? fallbackSections(briefing.briefing);

  return (
    <div className="relative rounded-2xl bg-bg-card border border-border overflow-hidden shadow-card">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-aurora" />
      <div className="absolute -top-32 -right-24 w-72 h-72 bg-accent-purple/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-aurora flex items-center justify-center shadow-glow">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                AI Daily Briefing
                <Sparkles className="h-4 w-4 text-accent-purple" />
              </h2>
              <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1.5">
                {briefing.cached ? (
                  <>
                    <Database className="h-3 w-3" /> Cached
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3" /> Fresh
                  </>
                )}
                <span>·</span>
                <span>{date}</span>
              </p>
            </div>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 bg-bg-elevated border border-border hover:border-accent-purple/50 text-text-secondary hover:text-text-primary text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              Refresh
            </button>
          )}
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {SECTIONS.map(({ key, label, Icon, hue }) => {
            const content = cleanText(sections[key]);
            if (!content) return null;
            const blocks = parseSectionText(content);

            return (
              <section
                key={key}
                className={`relative rounded-xl border border-border-subtle bg-gradient-to-br ${hue} p-4`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-card border border-border px-2.5 py-1">
                    <Icon className="h-3.5 w-3.5 text-accent-purple" />
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                      {label}
                    </span>
                  </span>
                </div>
                <div className="space-y-3">
                  {blocks.map((b, i) => renderBlock(b, i))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Sources */}
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-text-muted mb-2">Nguồn dữ liệu:</p>
          <div className="flex flex-wrap gap-1.5">
            {briefing.sources.map((source, idx) => (
              <a
                key={source}
                href={briefing.source_urls?.[idx]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] bg-bg-elevated hover:bg-bg-secondary text-text-secondary hover:text-text-primary px-2 py-0.5 rounded border border-border"
              >
                {source}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
