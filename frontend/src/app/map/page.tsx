"use client";
import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import SourceBadge from "@/components/SourceBadge";
import type { ClusterCountry, Track } from "@/types";

const WorldMap = dynamic(() => import("@/components/WorldMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[440px] bg-[#121212] border border-gray-800 rounded-xl flex items-center justify-center">
      <span className="text-gray-400 animate-pulse text-sm">🌍 Đang tải bản đồ...</span>
    </div>
  ),
});

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const CLUSTER_COLORS = [
  "bg-indigo-500","bg-pink-500","bg-amber-500","bg-emerald-500",
  "bg-blue-500","bg-red-500","bg-violet-500","bg-teal-500",
  "bg-orange-500","bg-lime-500",
];

export default function MapPage() {
  const [clusters,    setClusters]  = useState<ClusterCountry[]>([]);
  const [labels,      setLabels]    = useState<Record<number,string>>({});
  const [selCountry,  setSelCountry]= useState<string | null>(null);
  const [selName,     setSelName]   = useState("");
  const [tracks,      setTracks]    = useState<Track[]>([]);
  const [aiInsight,   setAiInsight] = useState("");
  const [loading,     setLoading]   = useState(true);
  const [trackLoad,   setTrackLoad] = useState(false);
  const [insightLoad, setInsightLoad] = useState(false);
  const [error,       setError]     = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BASE}/api/map/clusters`)
      .then((r) => r.json())
      .then((d) => {
        console.log(`[Map] ${d.data?.length ?? 0} countries loaded`);
        setClusters(d.data ?? []);
        setLabels(d.cluster_labels ?? {});
        if (!d.data?.length) {
          setError("Backend trả về 0 quốc gia. Chờ ~60-90s để cào Deezer + Last.fm rồi F5 lại.");
        }
      })
      .catch((e) => setError(`Không kết nối được backend: ${e.message}`))
      .finally(() => setLoading(false));
  }, []);

  const handleCountryClick = useCallback(async (iso: string) => {
    setSelCountry(iso);
    setTracks([]);
    setAiInsight("");

    // Tìm tên hiển thị
    const found = clusters.find((c) => c.iso_code === iso);
    const name  = found?.country ?? iso;
    setSelName(name.split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "));

    // Load tracks
    setTrackLoad(true);
    try {
      const r  = await fetch(`${BASE}/api/map/country/${iso}/top?limit=20`);
      const d  = await r.json();
      setTracks(d.data ?? []);
    } catch (e) { console.error(e); }
    finally { setTrackLoad(false); }

    // Load AI insight
    setInsightLoad(true);
    try {
      const r  = await fetch(`${BASE}/api/map/country/${iso}/ai-insight`);
      const d  = await r.json();
      setAiInsight(d.insight ?? "");
    } catch { setAiInsight("⚠️ AI insight tạm thời không khả dụng."); }
    finally { setInsightLoad(false); }
  }, [clusters]);

  return (
    <main className="min-h-screen bg-transparent p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-white">🗺️ Global Music Taste Map</h1>
          <p className="text-gray-400 text-sm mt-1">
            {clusters.length} quốc gia · Deezer + Last.fm · K-Means Clustering · Gemini AI Insight
          </p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <SourceBadge source="Deezer" sourceUrl="https://api.deezer.com" />
            <SourceBadge source="Last.fm" sourceUrl="https://www.last.fm/api" />
            <SourceBadge source="Gemini AI" />
            <button
              onClick={async () => {
                if (!confirm("Xoá cache và cào lại (60-90s)?")) return;
                await fetch(`${BASE}/api/map/clusters/cache`, { method: "DELETE" });
                window.location.reload();
              }}
              className="text-xs text-gray-600 hover:text-gray-400 underline"
            >
              🔄 Refresh data
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-950 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
            ⚠️ {error}
          </div>
        )}

        {/* Status */}
        {!loading && clusters.length > 0 && (
          <p className="text-xs text-gray-600 mb-3">
            ✅ {clusters.length} quốc gia · Click marker để xem top charts + AI insight
          </p>
        )}

        {/* Cluster legend */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(labels).map(([id, name]) => (
            <span
              key={id}
              className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full text-white ${
                CLUSTER_COLORS[Number(id) % CLUSTER_COLORS.length]
              }`}
            >
              ● {name}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Map */}
          <div className="xl:col-span-2">
            {loading ? (
              <div className="h-[440px] bg-[#121212] border border-gray-800 rounded-xl flex flex-col items-center justify-center gap-2">
                <span className="text-gray-400 animate-pulse text-sm">
                  🌍 Đang kết nối Deezer + Last.fm...
                </span>
                <span className="text-gray-600 text-xs">Lần đầu mất 60-90 giây</span>
              </div>
            ) : (
              <WorldMap clusters={clusters} onCountryClick={handleCountryClick} />
            )}
            <p className="text-xs text-gray-700 mt-2">
              💡 Click vào chấm màu → xem Top Charts + Gemini AI phân tích gu âm nhạc
            </p>
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            {!selCountry ? (
              <div className="bg-[#1a1b1e] rounded-xl border border-gray-800 h-[440px] flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <div className="text-5xl mb-3 opacity-30">🌍</div>
                  <p className="text-sm">Click vào quốc gia trên bản đồ</p>
                  <p className="text-xs text-gray-700 mt-1">
                    Xem Top Charts + Gemini AI Insight
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Country title */}
                <div className="bg-[#1a1b1e] border border-gray-800 rounded-xl px-5 py-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">{selName}</h3>
                    <p className="text-gray-500 text-xs">{selCountry}</p>
                  </div>
                  <SourceBadge source="Deezer" />
                </div>

                {/* Top Tracks */}
                <div className="bg-[#1a1b1e] border border-gray-800 rounded-xl overflow-hidden" style={{ maxHeight: 260 }}>
                  <div className="px-4 py-3 border-b border-gray-800 text-sm font-semibold text-white">
                    🎵 Top Charts
                  </div>
                  {trackLoad ? (
                    <div className="p-6 text-center text-gray-500 text-sm animate-pulse">Đang tải...</div>
                  ) : (
                    <div className="overflow-y-auto" style={{ maxHeight: 210 }}>
                      {tracks.map((t: any, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 border-b border-gray-800/40 transition-colors">
                          <span className="text-xs font-bold text-gray-600 w-5">{i + 1}</span>
                          {t.image && (
                            <img src={t.image} alt={t.name} className="w-8 h-8 rounded object-cover bg-gray-800 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white truncate">{t.name}</p>
                            <p className="text-xs text-gray-600 truncate">{t.artist}</p>
                          </div>
                          <span className="text-xs text-gray-700 flex-shrink-0">{t.source?.split(" ")[0]}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Insight */}
                <div className="bg-gradient-to-br from-indigo-950/80 to-purple-950/80 border border-indigo-800/40 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-white">🤖 Gemini AI Cultural Insight</span>
                    {insightLoad && <span className="text-xs text-indigo-400 animate-pulse">Đang phân tích...</span>}
                  </div>
                  {insightLoad ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-3 bg-indigo-900/50 rounded animate-pulse" style={{ width: `${80 - i * 10}%` }} />
                      ))}
                    </div>
                  ) : aiInsight ? (
                    <div className="text-xs text-indigo-200 leading-relaxed whitespace-pre-wrap">
                      {aiInsight}
                    </div>
                  ) : (
                    <p className="text-xs text-indigo-700 italic">Insight sẽ xuất hiện sau khi click quốc gia</p>
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