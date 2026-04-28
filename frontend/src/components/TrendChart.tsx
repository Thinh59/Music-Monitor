"use client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

interface TrendChartProps {
  data:     Array<{ time: string; value: number; [key: string]: any }>;
  title?:   string;
  color?:   string;
  dataKey?: string;
}

export default function TrendChart({
  data,
  title   = "",
  color   = "#a855f7",
  dataKey = "value",
}: TrendChartProps) {
  return (
    <div className="h-[300px] w-full bg-[#121212] p-4 rounded-xl border border-gray-800">
      {title && <p className="text-sm font-semibold text-white mb-2">{title}</p>}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="time" stroke="#888" tick={{ fontSize: 11 }} />
          <YAxis stroke="#888" tick={{ fontSize: 11 }}
                 tickFormatter={(v) =>
                   v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}M`
                   : v >= 1000 ? `${(v/1000).toFixed(0)}K` : String(v)
                 } />
          <Tooltip
            contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }}
            labelStyle={{ color: "#ccc" }}
          />
          <Line type="monotone" dataKey={dataKey} stroke={color}
                strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 