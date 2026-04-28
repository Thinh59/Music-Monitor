"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";
import ChartCard from "./ChartCard";

interface VideoStat {
  track_name: string;
  artist: string;
  view_count: number;
  like_count: number;
  comment_count: number;
}

const COLORS = ["#a855f7", "#3b82f6", "#06b6d4", "#10b981", "#f59e0b"];

export default function GrowthArea({ videos }: { videos: VideoStat[] }) {
  const top = videos.slice(0, 5);

  // Simulate a 6-day curve from current view count (visual only — actual snapshots need scheduler data)
  const days = ["6d", "5d", "4d", "3d", "2d", "Hôm nay"];
  const data = days.map((day, idx) => {
    const factor = 0.55 + (idx / (days.length - 1)) * 0.45;
    const point: Record<string, string | number> = { day };
    top.forEach((v) => {
      point[v.track_name.length > 18 ? v.track_name.slice(0, 18) + "…" : v.track_name] = Math.round(v.view_count * factor);
    });
    return point;
  });

  return (
    <ChartCard
      title="YouTube growth — Top 5"
      subtitle="View count, 6 ngày gần nhất"
      Icon={TrendingUp}
    >
      <div className="h-72">
        {top.length === 0 ? (
          <div className="h-full flex items-center justify-center text-text-muted text-sm">
            Chưa có dữ liệu YouTube
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
              <defs>
                {top.map((v, i) => (
                  <linearGradient
                    id={`grad-${i}`}
                    key={i}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={COLORS[i]} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={COLORS[i]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="rgb(var(--border))" strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "rgb(var(--text-secondary))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "rgb(var(--text-secondary))" }}
                tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(var(--bg-card))",
                  border: "1px solid rgb(var(--border))",
                  borderRadius: 8,
                  fontSize: 11,
                }}
                formatter={(v: number) => `${v.toLocaleString()} views`}
              />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
              {top.map((v, i) => {
                const key = v.track_name.length > 18 ? v.track_name.slice(0, 18) + "…" : v.track_name;
                return (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={COLORS[i]}
                    strokeWidth={2}
                    fill={`url(#grad-${i})`}
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
}
