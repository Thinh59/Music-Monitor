"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { BarChart3 } from "lucide-react";
import ChartCard from "./ChartCard";

interface Track {
  name: string;
  artist: string;
  playcount?: number;
}

const COLORS = ["#a855f7", "#8b5cf6", "#7c3aed", "#6366f1", "#3b82f6", "#06b6d4", "#22d3ee", "#0ea5e9", "#10b981", "#f43f5e"];

export default function TopChartsBar({ tracks }: { tracks: Track[] }) {
  const data = tracks.slice(0, 10).map((t) => ({
    name: t.name.length > 20 ? t.name.slice(0, 20) + "…" : t.name,
    fullName: `${t.name} — ${t.artist}`,
    plays: Number(t.playcount ?? 0),
  }));

  return (
    <ChartCard
      title="Top 10 toàn cầu"
      subtitle="Last.fm chart.getTopTracks"
      Icon={BarChart3}
    >
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis
              type="number"
              hide
              tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tick={{ fontSize: 11, fill: "rgb(var(--text-secondary))" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgb(var(--bg-elevated))" }}
              contentStyle={{
                backgroundColor: "rgb(var(--bg-card))",
                border: "1px solid rgb(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v: number) => [`${v.toLocaleString()} plays`, "Listens"]}
              labelFormatter={(_, payload) =>
                (payload?.[0]?.payload as { fullName?: string })?.fullName ?? ""
              }
            />
            <Bar dataKey="plays" radius={[0, 6, 6, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
