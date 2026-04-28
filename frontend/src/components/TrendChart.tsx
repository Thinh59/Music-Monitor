"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TrendChartProps {
  data?: { time?: string; day?: string; value?: number; views?: number }[];
  title?: string;
  color?: string;
}

const DEMO_DATA = [
  { day: "Mon", views: 4000 },
  { day: "Tue", views: 3000 },
  { day: "Wed", views: 5000 },
  { day: "Thu", views: 8000 },
  { day: "Fri", views: 12000 },
  { day: "Sat", views: 15000 },
  { day: "Sun", views: 18000 },
];

export default function TrendChart({ data, title, color = "#a855f7" }: TrendChartProps) {
  const chartData =
    data && data.length > 0
      ? data.map((d) => ({
          day: d.day ?? d.time ?? "",
          views: d.views ?? d.value ?? 0,
        }))
      : DEMO_DATA;

  return (
    <div className="h-[300px] w-full bg-bg-elevated p-4 rounded-xl border border-border">
      {title && (
        <h3 className="text-sm font-semibold text-text-primary mb-2">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
          <XAxis dataKey="day" stroke="rgb(var(--text-muted))" />
          <YAxis stroke="rgb(var(--text-muted))" />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgb(var(--bg-card))",
              border: "1px solid rgb(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="views"
            stroke={color}
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
