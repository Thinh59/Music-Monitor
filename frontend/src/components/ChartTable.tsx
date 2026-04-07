import SourceBadge from "./SourceBadge";
import type { Track } from "@/types";

interface ChartTableProps {
  tracks: Track[];
  title?: string;
  showPrediction?: boolean;
}

export default function ChartTable({ tracks, title, showPrediction = false }: ChartTableProps) {
  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      {title && (
        <div className="px-5 py-4 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
      )}
      <div className="divide-y divide-gray-50">
        {tracks.length === 0 && (
          <div className="px-5 py-8 text-center text-gray-400 text-sm">
            Đang tải dữ liệu...
          </div>
        )}
        {tracks.map((track, idx) => (
          <div
            key={`${track.name}-${idx}`}
            className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
          >
            {/* Rank */}
            <span className="text-lg font-bold text-gray-200 w-7 flex-shrink-0 text-center">
              {track.rank ?? idx + 1}
            </span>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{track.name}</p>
              <p className="text-sm text-gray-500 truncate">{track.artist}</p>
            </div>

            {/* Stats */}
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              {track.playcount !== undefined && (
                <span className="text-xs font-medium text-indigo-600">
                  {Number(track.playcount).toLocaleString()} plays
                </span>
              )}
              {showPrediction && track.hit_probability !== undefined && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    track.hit_probability > 60
                      ? "bg-green-100 text-green-700"
                      : track.hit_probability > 30
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-600"
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