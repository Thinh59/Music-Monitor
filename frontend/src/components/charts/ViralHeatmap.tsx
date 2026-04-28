"use client";

import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { Flame } from "lucide-react";
import ChartCard from "./ChartCard";

interface TikTokTrack {
  name: string;
  artist: string;
  rank?: number;
  viral_score?: number;
}

export default function ViralHeatmap({ tracks }: { tracks: TikTokTrack[] }) {
  const data = tracks.slice(0, 20).map((t, i) => ({
    name: t.name.length > 18 ? t.name.slice(0, 18) + "…" : t.name,
    artist: t.artist,
    size: Math.max(20 - i, 1) * 10 + (t.viral_score ?? 0),
    score: t.viral_score ?? 0,
  }));

  return (
    <ChartCard
      title="TikTok Viral Heatmap"
      subtitle="Top 20 · Deezer TikTok Viral playlist"
      Icon={Flame}
    >
      <div className="h-80">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-text-muted text-sm">
            Chưa có dữ liệu TikTok
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={data}
              dataKey="size"
              stroke="rgb(var(--bg-card))"
              fill="#a855f7"
              content={<HeatmapCell />}
            >
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(var(--bg-card))",
                  border: "1px solid rgb(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(_v, _n, p) => {
                  const d = p.payload as { artist: string };
                  return [d.artist, "Nghệ sĩ"];
                }}
              />
            </Treemap>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
}

interface CellProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  name?: string;
}

function HeatmapCell(props: CellProps) {
  const { x = 0, y = 0, width = 0, height = 0, index = 0, name = "" } = props;
  const palette = [
    "#7c3aed", "#a855f7", "#c084fc", "#3b82f6", "#06b6d4", "#22d3ee",
    "#0ea5e9", "#10b981", "#f59e0b", "#ec4899",
  ];
  const fill = palette[index % palette.length];
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        opacity={0.85}
        stroke="rgb(var(--bg-card))"
        strokeWidth={2}
        rx={4}
      />
      {width > 60 && height > 28 && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 4}
          textAnchor="middle"
          fill="white"
          fontSize={11}
          fontWeight={600}
        >
          {name}
        </text>
      )}
    </g>
  );
}
