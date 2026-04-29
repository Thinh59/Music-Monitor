"use client";
import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Globe2, Loader2, RefreshCw, Music2, AlertTriangle, Bot, Sparkles } from "lucide-react";
import SourceBadge from "@/components/SourceBadge";
import RichText from "@/components/RichText";
import type { ClusterCountry, Track } from "@/types";

const WorldMap = dynamic(() => import("@/components/WorldMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[440px] bg-bg-elevated border border-border rounded-xl flex items-center justify-center">
      <span className="text-text-muted animate-pulse text-sm flex items-center gap-2">
        <Globe2 className="h-4 w-4" /> Đang tải bản đồ...
      </span>
    </div>
  ),
});

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const CLUSTER_COLORS = [
  "bg-purple-500", "bg-pink-500", "bg-amber-500", "bg-emerald-500",
  "bg-blue-500", "bg-red-500", "bg-violet-500", "bg-teal-500",
  "bg-orange-500", "bg-lime-500",
];

interface MapTrack extends Track {
  image?: string;
}

export default function MapPage() {
  const [clusters, setClusters] = useState<ClusterCountry[]>([]);
  const [labels, setLabels] = useState<Record<number, string>>({});
  const [selCountry, setSelCountry] = useState<string | null>(null);
  const [selName, setSelName] = useState("");
  const [tracks, setTracks] = useState<MapTrack[]>([]);
  const [aiInsight, setAiInsight] = useState("");
  const [loading, setLoading] = useState(true);
  const [trackLoad, setTrackLoad] = useState(false);
  const [insightLoad, setInsightLoad] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BASE}/api/map/clusters`)
      .then((r) => r.json())
      .then((d) => {
        setClusters(d.data ?? []);
        setLabels(d.cluster_labels ?? {});
        if (!d.data?.length) {
          setError("Backend trả về 0 quốc gia. Chờ ~60-90s để cào Deezer + Last.fm rồi F5 lại.");
        }
      })
      .catch((e) => setError(`Không kết nối được backend: ${e.message}`))
      .finally(() => setLoading(false));
  }, []);

  const handleCountryClick = useCallback(
    async (iso: string) => {
      setSelCountry(iso);
      setTracks([]);
      setAiInsight("");

      const found = clusters.find((c) => c.iso_code === iso);
      const name = found?.country ?? iso;
      setSelName(
        name.split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      );

      setTrackLoad(true);
      try {
        const r = await fetch(`${BASE}/api/map/country/${iso}/top?limit=20`);
        const d = await r.json();
        setTracks(d.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setTrackLoad(false);
      }

      setInsightLoad(true);
      try {
        const r = await fetch(`${BASE}/api/map/country/${iso}/ai-insight`);
        const d = await r.json();
        setAiInsight(d.insight ?? "");
      } catch {
        setAiInsight("AI insight tạm thời không khả dụng.");
      } finally {
        setInsightLoad(false);
      }
    },
    [clusters],
  );

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-5 flex items-start gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-aurora flex items-center justify-center shadow-glow">
            <Globe2 className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
              Global Music <span className="gradient-text">Taste Map</span>
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              {clusters.length} quốc gia · Deezer + Last.fm · K-Means Clustering · Gemini AI Insight
            </p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <SourceBadge source="Deezer" sourceUrl="https://api.deezer.com" />
              <SourceBadge source="Last.fm" sourceUrl="https://www.last.fm/api" />
              <SourceBadge source="Gemini AI" />
              <select
                aria-label="Chọn quốc gia"
                data-testid="country-picker"
                value={selCountry ?? ""}
                onChange={(e) => e.target.value && handleCountryClick(e.target.value)}
                disabled={loading || clusters.length === 0}
                className="text-xs bg-bg-card text-text-primary border border-border rounded-lg px-2 py-1 focus:outline-none focus:border-accent-purple/50 disabled:opacity-50"
              >
                <option value="">Chọn quốc gia…</option>
                {[...clusters]
                  .sort((a, b) => a.country.localeCompare(b.country))
                  .map((c) => (
                    <option key={c.iso_code} value={c.iso_code}>
                      {c.country
                        .split(" ")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")}{" "}
                      ({c.iso_code})
                    </option>
                  ))}
              </select>
              <button
                onClick={async () => {
                  if (!confirm("Xoá cache và cào lại (60-90s)?")) return;
                  try {
                    const res = await fetch(`${BASE}/api/map/clusters/cache`, { method: "DELETE" });
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    window.location.reload();
                  } catch (e) {
                    alert(`Không xoá được cache.\n\n${e instanceof Error ? e.message : e}`);
                  }
                }}
                className="text-xs text-text-muted hover:text-text-primary underline inline-flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm rounded-lg px-4 py-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!loading && clusters.length > 0 && (
          <p className="text-xs text-text-muted mb-3">
            {clusters.length} quốc gia · Click marker để xem top charts + AI insight
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(labels).map(([id, name]) => (
            <span
              key={id}
              className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full text-white ${CLUSTER_COLORS[Number(id) % CLUSTER_COLORS.length]}`}
            >
              ● {name}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            {loading ? (
              <div className="h-[440px] bg-bg-elevated border border-border rounded-xl flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-accent-purple" />
                <span className="text-text-secondary text-sm">Đang kết nối Deezer + Last.fm...</span>
                <span className="text-text-muted text-xs">Lần đầu mất 60-90 giây</span>
              </div>
            ) : (
              <WorldMap clusters={clusters} onCountryClick={handleCountryClick} />
            )}
            <p className="text-xs text-text-muted mt-2">
              Click vào chấm màu để xem Top Charts + AI phân tích gu âm nhạc
            </p>
          </div>

          <div className="space-y-4">
            {!selCountry ? (
              <div className="bg-bg-card rounded-xl border border-border h-[440px] flex items-center justify-center">
                <div className="text-center text-text-muted">
                  <Globe2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Click vào quốc gia trên bản đồ</p>
                  <p className="text-xs text-text-muted mt-1">Xem Top Charts + Gemini AI Insight</p>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-bg-card border border-border rounded-xl px-5 py-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-text-primary text-base">{selName}</h3>
                    <p className="text-text-muted text-xs">{selCountry}</p>
                  </div>
                  <SourceBadge source="Deezer" />
                </div>

                <div
                  className="bg-bg-card border border-border rounded-xl overflow-hidden"
                  style={{ maxHeight: 260 }}
                >
                  <div className="px-4 py-3 border-b border-border text-sm font-semibold text-text-primary flex items-center gap-2">
                    <Music2 className="h-4 w-4 text-accent-purple" /> Top Charts
                  </div>
                  {trackLoad ? (
                    <div className="p-6 text-center text-text-muted text-sm animate-pulse">Đang tải...</div>
                  ) : (
                    <div className="overflow-y-auto scrollbar-thin" style={{ maxHeight: 210 }}>
                      {tracks.map((t, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-bg-elevated border-b border-border-subtle"
                        >
                          <span className="text-xs font-bold text-text-muted w-5">{i + 1}</span>
                          {t.image && (
                            <img
                              src={t.image}
                              alt={t.name}
                              className="w-8 h-8 rounded object-cover bg-bg-elevated flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-text-primary truncate">{t.name}</p>
                            <p className="text-xs text-text-muted truncate">{t.artist}</p>
                          </div>
                          <span className="text-xs text-text-muted flex-shrink-0">
                            {t.source?.split(" ")[0]}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative rounded-xl border border-border bg-gradient-card p-4 overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-aurora" />
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4 text-accent-purple" />
                    <span className="text-sm font-semibold text-text-primary">
                      AI Cultural Insight
                    </span>
                    <Sparkles className="h-3 w-3 text-accent-purple" />
                    {insightLoad && (
                      <span className="text-xs text-accent-purple animate-pulse ml-auto">
                        Đang phân tích...
                      </span>
                    )}
                  </div>
                  {insightLoad ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="h-3 bg-bg-elevated rounded animate-pulse"
                          style={{ width: `${80 - i * 10}%` }}
                        />
                      ))}
                    </div>
                  ) : aiInsight ? (
                    <RichText text={aiInsight} size="sm" />
                  ) : (
                    <p className="text-xs text-text-muted italic">
                      Insight sẽ xuất hiện sau khi click quốc gia
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
