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
import SourceBadge from "./SourceBadge";
import type { DailyBriefing, BriefingSections } from "@/types";
import { cleanText } from "@/lib/cleanText";

interface BriefingCardProps {
  briefing: DailyBriefing;
  onRefresh?: () => void;
  loading?: boolean;
}

const SECTIONS: {
  key: keyof BriefingSections;
  label: string;
  Icon: typeof Sunrise;
}[] = [
  { key: "overview", label: "Tổng quan hôm nay", Icon: Sunrise },
  { key: "top_charts", label: "Top Charts", Icon: BarChart3 },
  { key: "tiktok", label: "TikTok Viral Alert", Icon: Flame },
  { key: "community", label: "Cộng đồng nói gì", Icon: MessageCircle },
  { key: "forecast", label: "Dự báo tuần tới", Icon: Target },
];

function fallbackSections(text: string): BriefingSections {
  // Nếu backend cũ chỉ trả `briefing` text → đặt vào overview
  return {
    overview: cleanText(text),
    top_charts: "",
    tiktok: "",
    community: "",
    forecast: "",
  };
}

export default function BriefingCard({ briefing, onRefresh, loading }: BriefingCardProps) {
  const date = new Date(briefing.generated_at).toLocaleString("vi-VN");
  const sections =
    briefing.briefing_sections ?? fallbackSections(briefing.briefing);

  return (
    <div className="relative rounded-2xl bg-bg-card border border-border overflow-hidden shadow-card">
      {/* Aurora glow */}
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
        <div className="space-y-5">
          {SECTIONS.map(({ key, label, Icon }) => {
            const content = cleanText(sections[key]);
            if (!content) return null;
            return (
              <section key={key} className="group">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-lg bg-gradient-card border border-accent-purple/20 flex items-center justify-center">
                    <Icon className="h-3.5 w-3.5 text-accent-purple" />
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary">
                    {label}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-text-secondary whitespace-pre-line pl-9">
                  {content}
                </p>
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
