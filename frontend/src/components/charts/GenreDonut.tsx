"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import ChartCard from "./ChartCard";

interface Props {
  distribution?: Record<string, number> | { genre: string; count: number }[];
}

const COLORS = [
  "#a855f7", "#3b82f6", "#06b6d4", "#22d3ee", "#10b981", "#f59e0b",
  "#f43f5e", "#ec4899", "#8b5cf6", "#0ea5e9", "#14b8a6", "#eab308",
];

export default function GenreDonut({ distribution }: Props) {
  const data = (() => {
    if (!distribution) return [];
    if (Array.isArray(distribution)) {
      return distribution.map((d) => ({ name: d.genre, value: d.count }));
    }
    return Object.entries(distribution).map(([k, v]) => ({ name: k, value: v }));
  })()
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return (
    <ChartCard
      title="Phân phối thể loại"
      subtitle="Top 50 toàn cầu · Last.fm tags"
      Icon={PieIcon}
    >
      <div className="h-72">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-text-muted text-sm">
            Chưa có dữ liệu
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                stroke="rgb(var(--bg-card))"
                strokeWidth={2}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(var(--bg-card))",
                  border: "1px solid rgb(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{ fontSize: 11, color: "rgb(var(--text-secondary))" }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
}
