import SourceBadge from "./SourceBadge";
import type { Track } from "@/types";

interface ChartTableProps {
  tracks: Track[];
  title?: string;
  showPrediction?: boolean;
}

export default function ChartTable({ tracks, title, showPrediction = false }: ChartTableProps) {
  return (
    <div className="bg-bg-card rounded-xl border border-border overflow-hidden shadow-card">
      {title && (
        <div className="px-5 py-4 border-b border-border bg-bg-elevated">
          <h3 className="font-semibold text-text-primary">{title}</h3>
        </div>
      )}
      <div className="divide-y divide-border-subtle">
        {tracks.length === 0 && (
          <div className="px-5 py-8 text-center text-text-muted text-sm">
            Đang tải dữ liệu...
          </div>
        )}
        {tracks.map((track, idx) => (
          <div
            key={`${track.name}-${idx}`}
            className="flex items-center gap-3 px-5 py-3 hover:bg-bg-elevated"
          >
            <span className="text-lg font-bold text-text-muted w-7 flex-shrink-0 text-center">
              {track.rank ?? idx + 1}
            </span>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary truncate">{track.name}</p>
              <p className="text-sm text-text-secondary truncate">{track.artist}</p>
            </div>

            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              {track.playcount !== undefined && (
                <span className="text-xs font-medium text-accent-purple">
                  {Number(track.playcount).toLocaleString()} plays
                </span>
              )}
              {showPrediction && track.hit_probability !== undefined && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    track.hit_probability > 60
                      ? "bg-emerald-500/15 text-emerald-400"
                      : track.hit_probability > 30
                      ? "bg-amber-500/15 text-amber-400"
                      : "bg-bg-elevated text-text-muted"
                  }`}
                >
                  {track.hit_probability}% hit
                </span>
              )}
              {track.source && (
                <SourceBadge source={track.source} sourceUrl={track.source_url} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
