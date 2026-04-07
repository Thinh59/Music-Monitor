import SourceBadge from "./SourceBadge";
import type { HitPrediction } from "@/types";

interface HitCardProps {
  track: string;
  artist: string;
  prediction: HitPrediction;
  sources?: string[];
}

const PREDICTION_STYLE: Record<string, string> = {
  "Potential Hit": "from-green-500 to-emerald-600",
  "Watch":         "from-yellow-400 to-orange-500",
  "Normal":        "from-gray-400 to-gray-500",
};

const PREDICTION_EMOJI: Record<string, string> = {
  "Potential Hit": "🚀",
  "Watch":         "👀",
  "Normal":        "📻",
};

export default function HitCard({ track, artist, prediction, sources = [] }: HitCardProps) {
  const gradientClass = PREDICTION_STYLE[prediction.prediction] ?? "from-gray-400 to-gray-500";
  const emoji = PREDICTION_EMOJI[prediction.prediction] ?? "🎵";
  const pct = prediction.hit_probability;

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      {/* Gradient header */}
      <div className={`bg-gradient-to-r ${gradientClass} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <span className="text-2xl">{emoji}</span>
          <span className="text-3xl font-bold">{pct}%</span>
        </div>
        <p className="font-semibold mt-1">{prediction.prediction}</p>
        <p className="text-xs opacity-75">Confidence: {prediction.confidence}</p>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="font-semibold text-gray-900 truncate">{track}</p>
        <p className="text-sm text-gray-500 mb-3">{artist}</p>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
          <div
            className={`h-2 rounded-full bg-gradient-to-r ${gradientClass} transition-all duration-500`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex flex-wrap gap-1">
          <SourceBadge source="XGBoost Model" />
          {sources.map((s) => (
            <SourceBadge key={s} source={s} />
          ))}
        </div>
      </div>
    </div>
  );
}