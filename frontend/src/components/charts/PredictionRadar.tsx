"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Target } from "lucide-react";
import ChartCard from "./ChartCard";

interface Candidate {
  track_name?: string;
  name?: string;
  artist?: string;
  artist_name?: string;
  hit_probability?: number;
  viral_score?: number;
  youtube_growth?: number;
  reddit_mentions?: number;
  sentiment?: number;
}

const COLORS = ["#a855f7", "#06b6d4", "#f43f5e"];

export default function PredictionRadar({ candidates }: { candidates: Candidate[] }) {
  const top = candidates.slice(0, 3);

  const axes = ["Hit prob", "Viral", "Growth", "Buzz", "Sentiment"];
  const normalize = (c: Candidate) => ({
    "Hit prob": Math.min(100, c.hit_probability ?? 0),
    Viral: Math.min(100, c.viral_score ?? 0),
    Growth: Math.min(100, (c.youtube_growth ?? 0) * 10),
    Buzz: Math.min(100, (c.reddit_mentions ?? 0) * 5),
    Sentiment: Math.min(100, ((c.sentiment ?? 0) + 1) * 50),
  });

  const data = axes.map((axis) => {
    const point: Record<string, string | number> = { axis };
    top.forEach((c) => {
      const name = (c.track_name || c.name || "?").slice(0, 16);
      point[name] = normalize(c)[axis as keyof ReturnType<typeof normalize>];
    });
    return point;
  });

  return (
    <ChartCard
      title="Hit Prediction · Top 3"
      subtitle="XGBoost feature radar"
      Icon={Target}
    >
      <div className="h-80">
        {top.length === 0 ? (
          <div className="h-full flex items-center justify-center text-text-muted text-sm">
            Chưa có top candidates
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} outerRadius="70%">
              <PolarGrid stroke="rgb(var(--border))" />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fontSize: 11, fill: "rgb(var(--text-secondary))" }}
              />
              <PolarRadiusAxis
                domain={[0, 100]}
                tick={{ fontSize: 9, fill: "rgb(var(--text-muted))" }}
                axisLine={false}
              />
              {top.map((c, i) => {
                const key = (c.track_name || c.name || "?").slice(0, 16);
                return (
                  <Radar
                    key={key}
                    name={key}
                    dataKey={key}
                    stroke={COLORS[i]}
                    fill={COLORS[i]}
                    fillOpacity={0.18}
                    strokeWidth={2}
                  />
                );
              })}
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(var(--bg-card))",
                  border: "1px solid rgb(var(--border))",
                  borderRadius: 8,
                  fontSize: 11,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
}
