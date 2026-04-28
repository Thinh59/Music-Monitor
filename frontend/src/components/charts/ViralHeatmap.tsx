"use client";

import { Flame, TrendingUp, Crown, Music2 } from "lucide-react";
import { motion } from "framer-motion";
import ChartCard from "./ChartCard";

interface TikTokTrack {
  name: string;
  artist: string;
  rank?: number;
  viral_score?: number;
}

// Gradient palette by rank tier
const TIER_GRADIENTS = [
  "from-fuchsia-500 via-purple-500 to-indigo-500", // 1-3
  "from-purple-500 via-blue-500 to-cyan-500",      // 4-6
  "from-blue-500 to-cyan-500",                     // 7-10
  "from-cyan-500 to-emerald-500",                  // 11-15
  "from-emerald-500 to-amber-500",                 // 16-20
];

function tierFor(rank: number) {
  if (rank <= 3) return TIER_GRADIENTS[0];
  if (rank <= 6) return TIER_GRADIENTS[1];
  if (rank <= 10) return TIER_GRADIENTS[2];
  if (rank <= 15) return TIER_GRADIENTS[3];
  return TIER_GRADIENTS[4];
}

export default function ViralHeatmap({ tracks }: { tracks: TikTokTrack[] }) {
  const list = tracks.slice(0, 20);
  const top3 = list.slice(0, 3);
  const rest = list.slice(3);

  return (
    <ChartCard
      title="TikTok Viral Top 20"
      subtitle="Deezer TikTok Viral · ranking heatmap"
      Icon={Flame}
    >
      {list.length === 0 ? (
        <div className="h-72 flex items-center justify-center text-text-muted text-sm">
          Chưa có dữ liệu TikTok
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top 3 podium cards */}
          <div className="grid grid-cols-3 gap-2">
            {top3.map((t, i) => {
              const rank = i + 1;
              const tier = tierFor(rank);
              return (
                <motion.div
                  key={`${t.name}-${i}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${tier} p-3 text-white shadow-card`}
                >
                  <div className="absolute -right-3 -top-3 opacity-25">
                    {rank === 1 ? (
                      <Crown className="h-12 w-12" />
                    ) : (
                      <Music2 className="h-12 w-12" />
                    )}
                  </div>
                  <div className="relative">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                        #{rank}
                      </span>
                      {rank === 1 && (
                        <Crown className="h-3 w-3" />
                      )}
                    </div>
                    <p className="font-bold text-sm leading-tight line-clamp-2">
                      {t.name}
                    </p>
                    <p className="text-[11px] opacity-80 mt-1 line-clamp-1">
                      {t.artist}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Ranked bars 4-20 */}
          <div className="space-y-1.5 max-h-72 overflow-y-auto scrollbar-thin pr-1">
            {rest.map((t, i) => {
              const rank = i + 4;
              const tier = tierFor(rank);
              // Bar width: rank 4 = 95%, rank 20 = 25%
              const width = Math.max(25, 100 - (rank - 4) * 4);
              return (
                <motion.div
                  key={`${t.name}-${rank}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.02 }}
                  className="relative flex items-center gap-2 group"
                >
                  <div className="w-7 h-7 rounded-md bg-bg-elevated border border-border flex items-center justify-center flex-shrink-0">
                    <span className="text-[11px] font-bold text-text-secondary">
                      {rank}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 relative">
                    <div className="relative h-7 rounded-md overflow-hidden bg-bg-elevated">
                      <div
                        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${tier} opacity-80 group-hover:opacity-100 transition-opacity`}
                        style={{ width: `${width}%` }}
                      />
                      <div className="relative px-2.5 h-full flex items-center justify-between gap-2 z-10">
                        <span className="text-xs font-semibold text-white truncate drop-shadow">
                          {t.name}
                        </span>
                        <span className="text-[10px] font-medium text-white/85 truncate flex-shrink-0 drop-shadow">
                          {t.artist}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border text-[11px] text-text-muted">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-accent-purple" />
              Vị trí cao = bar dài hơn
            </span>
            <span>{list.length} bài tracking</span>
          </div>
        </div>
      )}
    </ChartCard>
  );
}
