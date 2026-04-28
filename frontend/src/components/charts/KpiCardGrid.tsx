"use client";

import { TrendingUp, MessageCircle, Flame, Sparkles } from "lucide-react";

interface Kpi {
  label: string;
  value: string;
  delta?: string;
  Icon: typeof TrendingUp;
  hue: "purple" | "blue" | "cyan" | "pink";
}

interface Props {
  trackCount?: number;
  viralAvg?: number;
  sentiment?: number;
  redditMentions?: number;
}

const HUE_CLASS: Record<Kpi["hue"], string> = {
  purple: "from-accent-purple/20 to-accent-purple/0 text-accent-purple",
  blue: "from-accent-blue/20 to-accent-blue/0 text-accent-blue",
  cyan: "from-accent-cyan/20 to-accent-cyan/0 text-accent-cyan",
  pink: "from-accent-pink/20 to-accent-pink/0 text-accent-pink",
};

export default function KpiCardGrid({
  trackCount,
  viralAvg,
  sentiment,
  redditMentions,
}: Props) {
  const sentimentLabel =
    sentiment === undefined
      ? "—"
      : sentiment > 0.3
      ? "Rất tích cực"
      : sentiment > 0.05
      ? "Tích cực"
      : sentiment > -0.05
      ? "Trung tính"
      : "Tiêu cực";

  const items: Kpi[] = [
    {
      label: "Tracks tracked",
      value: trackCount?.toLocaleString() ?? "—",
      Icon: TrendingUp,
      hue: "purple",
    },
    {
      label: "Viral score TB",
      value: viralAvg !== undefined ? `${viralAvg.toFixed(0)}/100` : "—",
      Icon: Flame,
      hue: "pink",
    },
    {
      label: "Sentiment Reddit",
      value: sentimentLabel,
      delta: sentiment !== undefined ? sentiment.toFixed(2) : undefined,
      Icon: MessageCircle,
      hue: "blue",
    },
    {
      label: "Mentions 24h",
      value: redditMentions?.toLocaleString() ?? "—",
      Icon: Sparkles,
      hue: "cyan",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map(({ label, value, delta, Icon, hue }) => (
        <div
          key={label}
          className="relative overflow-hidden rounded-2xl border border-border bg-bg-card p-4"
        >
          <div
            className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${HUE_CLASS[hue]} blur-2xl opacity-50 pointer-events-none`}
          />
          <div className="relative flex items-start justify-between mb-3">
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
              {label}
            </p>
            <Icon className={`h-4 w-4 ${HUE_CLASS[hue].split(" ").pop()}`} />
          </div>
          <div className="relative">
            <p className="text-2xl font-bold text-text-primary leading-tight">
              {value}
            </p>
            {delta && (
              <p className="text-xs text-text-muted mt-1">score {delta}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
