import { Rocket, Eye, Radio, Music2 } from "lucide-react";
import SourceBadge from "./SourceBadge";
import type { HitPrediction } from "@/types";

interface HitCardProps {
  track: string;
  artist: string;
  prediction: HitPrediction;
  sources?: string[];
}

const PREDICTION_STYLE: Record<string, string> = {
  "Potential Hit": "from-emerald-500 to-teal-500",
  Watch: "from-amber-500 to-orange-500",
  Normal: "from-slate-500 to-slate-600",
};

const PREDICTION_ICON: Record<string, typeof Rocket> = {
  "Potential Hit": Rocket,
  Watch: Eye,
  Normal: Radio,
};

export default function HitCard({ track, artist, prediction, sources = [] }: HitCardProps) {
  const gradientClass = PREDICTION_STYLE[prediction.prediction] ?? PREDICTION_STYLE.Normal;
  const Icon = PREDICTION_ICON[prediction.prediction] ?? Music2;
  const pct = prediction.hit_probability;

  return (
    <div className="bg-bg-card rounded-xl border border-border shadow-card overflow-hidden">
      <div className={`bg-gradient-to-r ${gradientClass} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <Icon className="h-6 w-6" />
          <span className="text-3xl font-bold">{pct}%</span>
        </div>
        <p className="font-semibold mt-1">{prediction.prediction}</p>
        <p className="text-xs opacity-75">Confidence: {prediction.confidence}</p>
      </div>

      <div className="p-4">
        <p className="font-semibold text-text-primary truncate">{track}</p>
        <p className="text-sm text-text-muted mb-3">{artist}</p>

        <div className="w-full bg-bg-elevated rounded-full h-2 mb-3">
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
