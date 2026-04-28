"use client";

import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { MessageCircle } from "lucide-react";
import ChartCard from "./ChartCard";

interface Props {
  compound?: number;
  positive?: number;
  negative?: number;
  total?: number;
}

export default function SentimentGauge({
  compound = 0,
  positive,
  negative,
  total,
}: Props) {
  // Map compound (-1 → 1) to (0 → 100)
  const score = Math.round(((compound + 1) / 2) * 100);
  const color =
    compound > 0.3
      ? "#10b981"
      : compound > 0.05
      ? "#22d3ee"
      : compound > -0.05
      ? "#a855f7"
      : compound > -0.3
      ? "#f59e0b"
      : "#f43f5e";

  const label =
    compound > 0.3
      ? "Rất tích cực"
      : compound > 0.05
      ? "Tích cực"
      : compound > -0.05
      ? "Trung tính"
      : compound > -0.3
      ? "Tiêu cực"
      : "Rất tiêu cực";

  const data = [{ name: "score", value: score, fill: color }];

  return (
    <ChartCard
      title="Sentiment Reddit 24h"
      subtitle="VADER NLP · r/Music"
      Icon={MessageCircle}
    >
      <div className="h-72 flex flex-col items-center justify-center">
        <div className="relative w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="70%"
              outerRadius="100%"
              data={data}
              startAngle={210}
              endAngle={-30}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                tick={false}
              />
              <RadialBar
                background={{ fill: "rgb(var(--bg-elevated))" }}
                dataKey="value"
                cornerRadius={10}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold text-text-primary">{score}</p>
            <p className="text-xs text-text-muted">/ 100</p>
          </div>
        </div>
        <p className="mt-2 text-sm font-semibold" style={{ color }}>
          {label}
        </p>
        <div className="mt-3 flex gap-4 text-xs text-text-muted">
          {positive !== undefined && (
            <span>
              <span className="text-emerald-400">▲</span> {positive.toFixed(0)}%
            </span>
          )}
          {negative !== undefined && (
            <span>
              <span className="text-rose-400">▼</span> {negative.toFixed(0)}%
            </span>
          )}
          {total !== undefined && <span>{total} posts</span>}
        </div>
      </div>
    </ChartCard>
  );
}
