import SourceBadge from "./SourceBadge";
import type { Track } from "@/types";

interface ChartTableProps {
  tracks:          Track[];
  title?:          string;
  showPrediction?: boolean;
}

export default function ChartTable({ tracks, title, showPrediction = false }: ChartTableProps) {
  return (
    <div className="bg-[#1a1b1e] rounded-xl border border-gray-800 overflow-hidden">
      {title && (
        <div className="px-5 py-4 border-b border-gray-800">
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
      )}
      <div className="divide-y divide-gray-800/50">
        {tracks.length === 0 && (
          <div className="px-5 py-8 text-center text-gray-500 text-sm animate-pulse">
            Đang tải dữ liệu...
          </div>
        )}
        {tracks.map((track, idx) => (
          <div
            key={`${track.name}-${idx}`}
            className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors"
          >
            {track.image && (
              <img src={track.image} alt={track.name}
                   className="w-9 h-9 rounded object-cover bg-gray-800 flex-shrink-0" />
            )}
            <span className="text-base font-bold text-gray-600 w-7 flex-shrink-0 text-center">
              {track.rank ?? idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate text-sm">{track.name}</p>
              <p className="text-xs text-gray-500 truncate">{track.artist}</p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              {track.playcount !== undefined && (
                <span className="text-xs font-medium text-indigo-400">
                  {Number(track.playcount).toLocaleString()} plays
                </span>
              )}
              {showPrediction && track.hit_probability !== undefined && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  track.hit_probability > 60 ? "bg-green-500/20 text-green-400" :
                  track.hit_probability > 30 ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-gray-500/20 text-gray-400"
                }`}>
                  {track.hit_probability}% hit
                </span>
              )}
              {track.source && <SourceBadge source={track.source} sourceUrl={track.source_url} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}