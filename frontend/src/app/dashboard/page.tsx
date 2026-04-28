// // "use client";
// // import { useEffect, useState } from "react";
// // import { fetchGlobalCharts, fetchViralTrends, fetchDailyBriefing } from "@/lib/api";
// // import SourceBadge from "@/components/SourceBadge";

// // interface Track {
// //   rank: number;
// //   name: string;
// //   artist: string;
// //   playcount: number;
// //   source: string;
// //   source_url: string;
// // }

// // export default function Dashboard() {
// //   const [charts, setCharts] = useState<Track[]>([]);
// //   const [briefing, setBriefing] = useState("");
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     async function load() {
// //       try {
// //         const [chartData, briefingData] = await Promise.all([
// //           fetchGlobalCharts(10),
// //           fetchDailyBriefing()
// //         ]);
// //         setCharts(chartData.data || []);
// //         setBriefing(briefingData.briefing || "");
// //       } catch (e) {
// //         console.error(e);
// //       } finally {
// //         setLoading(false);
// //       }
// //     }
// //     load();
// //   }, []);

// //   if (loading) return (
// //     <div className="flex items-center justify-center h-screen">
// //       <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
// //     </div>
// //   );

// //   return (
// //     <main className="min-h-screen bg-gray-50 p-6">
// //       <header className="mb-8">
// //         <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
// //           🎵 Global Music Intelligence Monitor
// //         </h1>
// //         <p className="text-gray-500 mt-1">Real-time music trends powered by AI</p>
// //       </header>

// //       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
// //         {/* Top Charts */}
// //         <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
// //           <div className="flex items-center justify-between mb-4">
// //             <h2 className="text-xl font-semibold">🌍 Global Top Charts</h2>
// //             <SourceBadge source="Last.fm" sourceUrl="https://www.last.fm/charts" />
// //           </div>
// //           <div className="space-y-3">
// //             {charts.map((track, idx) => (
// //               <div key={idx} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
// //                 <span className="text-2xl font-bold text-gray-300 w-8">#{track.rank || idx + 1}</span>
// //                 <div className="flex-1">
// //                   <p className="font-medium text-gray-900">{track.name}</p>
// //                   <p className="text-sm text-gray-500">{track.artist}</p>
// //                 </div>
// //                 <div className="text-right">
// //                   <p className="text-sm font-medium text-indigo-600">
// //                     {Number(track.playcount).toLocaleString()} plays
// //                   </p>
// //                   <SourceBadge source={track.source} sourceUrl={track.source_url} />
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         </div>

// //         {/* AI Daily Briefing */}
// //         <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-sm p-6 text-white">
// //           <h2 className="text-xl font-semibold mb-3">🤖 AI Daily Briefing</h2>
// //           <p className="text-indigo-100 text-sm mb-3">Powered by Gemini 3.1 Flash Lite · Cập nhật hằng ngày</p>
// //           <div className="text-sm leading-relaxed whitespace-pre-wrap">
// //             {briefing || "Loading briefing..."}
// //           </div>
// //           <div className="mt-4 pt-4 border-t border-indigo-500">
// //             <span className="text-xs text-indigo-200">Sources: Last.fm + YouTube + Reddit + Gemini API</span>
// //           </div>
// //         </div>
// //       </div>
// //     </main>
// //   );
// // }


// "use client";
// import { useEffect, useState } from "react";
// import { fetchGlobalCharts, fetchDailyBriefing } from "@/lib/api";
// import ChartTable from "@/components/ChartTable";
// import BriefingCard from "@/components/BriefingCard";
// import type { Track, DailyBriefing as BriefingType } from "@/types";

// export default function Dashboard() {
//   const [charts, setCharts] = useState<Track[]>([]);
//   const [briefing, setBriefing] = useState<BriefingType | null>(null);
//   const [loading, setLoading] = useState(true);

//   async function loadData(forceRefresh = false) {
//     setLoading(true);
//     try {
//       const [chartData, briefingData] = await Promise.all([
//         fetchGlobalCharts(10),
//         fetchDailyBriefing(forceRefresh)
//       ]);
//       setCharts(chartData.data || []);
//       setBriefing(briefingData);
//     } catch (e) {
//       console.error("Lỗi Dashboard:", e);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => { loadData(); }, []);

//   if (loading) return (
//     <div className="flex items-center justify-center h-screen bg-gray-50">
//       <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
//     </div>
//   );

//   return (
//     <main className="p-6 space-y-8 animate-in fade-in duration-500">
//       <header>
//         <h1 className="text-3xl font-bold text-gray-900">Music Intelligence Dashboard ☕</h1>
//         <p className="text-gray-500 mt-1">Tổng hợp thị trường âm nhạc toàn cầu hôm nay.</p>
//       </header>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Top Charts dùng Component mới */}
//         <div className="lg:col-span-2 space-y-4">
//           <h2 className="text-xl font-bold text-gray-800">🌍 Global Top 10</h2>
//           <ChartTable tracks={charts} />
//         </div>

//         {/* AI Briefing dùng Component mới */}
//         <div className="space-y-4">
//           <h2 className="text-xl font-bold text-gray-800">🤖 AI Insights</h2>
//           {briefing && (
//             <BriefingCard briefing={briefing} onRefresh={() => loadData(true)} loading={loading} />
//           )}
//         </div>
//       </div>
//     </main>
//   );
// }
"use client";
import { useEffect, useState } from "react";
import SourceBadge from "@/components/SourceBadge";
import ChartTable  from "@/components/ChartTable";
import TrendChart  from "@/components/TrendChart";
import type { Track, TrendPost, SentimentResult } from "@/types";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

async function apiFetch(path: string) {
  const r = await fetch(`${BASE}${path}`, { cache: "no-store" });
  if (!r.ok) throw new Error(`${path} → ${r.status}`);
  return r.json();
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface YouTubeVideo {
  video_id:      string;
  title:         string;
  view_count:    number;
  like_count:    number;
  comment_count: number;
  channel?:      string;
  thumbnail?:    string;
  source:        string;
  source_url:    string;
  growth_pct?:   number;
}

interface SpotifyTrack {
  name:         string;
  artist:       string;
  album?:       string;
  popularity:   number;
  preview_url?: string;
  source:       string;
  source_url?:  string;
}

interface DashboardState {
  // Last.fm
  globalCharts:  Track[];
  // YouTube
  youtubeVideos: YouTubeVideo[];
  // Reddit
  redditPosts:   TrendPost[];
  sentiment:     SentimentResult | null;
  // Spotify
  spotifyTracks: SpotifyTrack[];
  // Briefing
  briefing:      string;
  briefingDate:  string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [state,   setState]   = useState<DashboardState>({
    globalCharts:  [],
    youtubeVideos: [],
    redditPosts:   [],
    sentiment:     null,
    spotifyTracks: [],
    briefing:      "",
    briefingDate:  "",
  });
  const [loading, setLoading] = useState(true);
  const [errors,  setErrors]  = useState<string[]>([]);

  const [timeFilter, setTimeFilter] = useState<"today"|"week"|"month">("today");

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      const errs: string[] = [];
      const updates: Partial<DashboardState> = {};

      // ── 1. Last.fm Top 50 Charts ──────────────────────────────────────────
      try {
        const d = await apiFetch("/api/charts/global?limit=50");
        updates.globalCharts = d.data ?? [];
      } catch (e: any) {
        errs.push(`Last.fm Charts: ${e.message}`);
      }

      // ── 2. YouTube — tìm MV của top bài đang trending ────────────────────
      try {
        // Gọi endpoint trending YouTube từ backend
        const d = await apiFetch("/api/trends/youtube/batch");
        updates.youtubeVideos = d.data ?? [];
      } catch {
        // Fallback: tìm manual top 3 từ Last.fm
        try {
          if (updates.globalCharts && updates.globalCharts.length > 0) {
            const top3 = updates.globalCharts.slice(0, 3);
            const videos: YouTubeVideo[] = [];
            for (const track of top3) {
              const searchRes = await apiFetch(
                `/api/trends/youtube/search?q=${encodeURIComponent(`${track.name} ${track.artist} official`)}`
              ).catch(() => null);
              if (searchRes?.data?.[0]) {
                videos.push(searchRes.data[0]);
              }
            }
            updates.youtubeVideos = videos;
          }
        } catch (e2: any) {
          errs.push(`YouTube: ${e2.message}`);
        }
      }

      // ── 3. Reddit Trending ────────────────────────────────────────────────
      try {
        const d = await apiFetch("/api/trends/viral?subreddit=Music");
        updates.redditPosts = d.trending_posts ?? [];
        updates.sentiment   = d.sentiment       ?? null;
      } catch (e: any) {
        errs.push(`Reddit: ${e.message}`);
      }

      // ── 4. Spotify Top Tracks (playlist public) ───────────────────────────
      try {
        const d = await apiFetch("/api/charts/spotify?limit=20");
        updates.spotifyTracks = d.data ?? [];
      } catch (e: any) {
        errs.push(`Spotify: ${e.message}`);
        // Không fatal — bỏ qua
      }

      // ── 5. Daily Briefing (Claude AI) ─────────────────────────────────────
      try {
        const d = await apiFetch("/api/briefing/daily");
        updates.briefing     = d.briefing     ?? "";
        updates.briefingDate = d.generated_at ?? "";
      } catch (e: any) {
        errs.push(`Briefing: ${e.message}`);
      }

      setState((prev) => ({ ...prev, ...updates }));
      setErrors(errs);
      setLoading(false);
    }

    loadAll();
  }, []);

  // Chart data cho Recharts
  const chartData = state.globalCharts.slice(0, 15).map((t, i) => ({
    time:  `#${i + 1}`,
    value: Number(t.playcount ?? 0),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-transparent">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Đang tải dữ liệu từ Last.fm · YouTube · Reddit · Spotify...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-transparent p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div>
          <h1 className="text-3xl font-bold text-white">🎵 Global Music Intelligence Monitor</h1>
          <p className="text-gray-400 mt-1 text-sm">Real-time · Last.fm · YouTube · Reddit · Spotify · Claude AI</p>
          <div className="flex gap-2 mt-3">
            {(["today","week","month"] as const).map((f) => (
              <button key={f} onClick={() => setTimeFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  timeFilter === f
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}>
                {f === "today" ? "Today" : f === "week" ? "This Week" : "This Month"}
              </button>
            ))}
</div>
        </div>

        {/* ── Error notices (non-fatal) ── */}
        {errors.length > 0 && (
          <div className="bg-yellow-950/50 border border-yellow-800/50 rounded-lg px-4 py-2">
            <p className="text-yellow-400 text-xs font-medium mb-1">⚠️ Một số nguồn dữ liệu gặp lỗi:</p>
            {errors.map((e, i) => (
              <p key={i} className="text-yellow-500/70 text-xs">{e}</p>
            ))}
          </div>
        )}

        {/* ── ROW 1: Last.fm Top 50 + Briefing ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Last.fm Top 50 */}
          <div className="xl:col-span-2 bg-[#1a1b1e] rounded-xl border border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">🌍 Global Top 50</h2>
              <SourceBadge source="Last.fm" sourceUrl="https://www.last.fm/charts" />
            </div>
            {/* Scrollable list */}
            <div className="overflow-y-auto" style={{ maxHeight: 480 }}>
              {state.globalCharts.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-10">Chưa có dữ liệu Last.fm</p>
              ) : (
                state.globalCharts.map((t, i) => (
                  <div
                    key={`${t.name}-${i}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 border-b border-gray-800/50 transition-colors"
                  >
                    <span className="text-base font-bold text-gray-600 w-7 text-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate text-sm">{t.name}</p>
                      <p className="text-xs text-gray-500 truncate">{t.artist}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-medium text-indigo-400">
                        {Number(t.playcount ?? 0).toLocaleString()} plays
                      </p>
                      {t.listeners && (
                        <p className="text-xs text-gray-600">
                          {Number(t.listeners).toLocaleString()} listeners
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Daily Briefing */}
          <div className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 rounded-xl border border-indigo-700/40 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-white">🤖 AI Daily Briefing</h2>
              <span className="text-xs text-indigo-300 bg-indigo-800/50 px-2 py-0.5 rounded">Claude AI</span>
            </div>
            {state.briefingDate && (
              <p className="text-xs text-indigo-400 mb-3">
                {new Date(state.briefingDate).toLocaleString("vi-VN")}
              </p>
            )}
            <div className="flex-1 text-sm text-indigo-100 leading-relaxed whitespace-pre-wrap overflow-y-auto">
              {state.briefing || (
                <span className="text-indigo-400 italic">Đang sinh báo cáo bằng Claude AI...</span>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-indigo-700/40">
              <div className="flex flex-wrap gap-1">
                <SourceBadge source="Last.fm" sourceUrl="https://www.last.fm/charts" />
                <SourceBadge source="Reddit" sourceUrl="https://reddit.com/r/Music" />
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 2: Playcount chart ── */}
        {chartData.length > 0 && (
          <div className="bg-[#1a1b1e] rounded-xl border border-gray-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-white">📈 Playcount — Top 15 Global</h2>
              <SourceBadge source="Last.fm" sourceUrl="https://www.last.fm/charts" />
            </div>
            <TrendChart data={chartData} title="" color="#6366f1" />
          </div>
        )}

        {/* ── ROW 3: YouTube + Reddit ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* YouTube */}
          <div className="bg-[#1a1b1e] rounded-xl border border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h2 className="text-base font-semibold text-white">▶️ YouTube — MV Đang Hot</h2>
              <SourceBadge source="YouTube" sourceUrl="https://developers.google.com/youtube/v3" />
            </div>
            <div className="divide-y divide-gray-800/50">
              {state.youtubeVideos.length === 0 ? (
                <div className="px-5 py-8 text-center text-gray-600 text-sm">
                  <p className="mb-1">Chưa có dữ liệu YouTube</p>
                  <p className="text-xs">Cần bật endpoint <code>/api/trends/youtube/batch</code> trong backend</p>
                </div>
              ) : (
                state.youtubeVideos.map((v, i) => (
                  <div key={v.video_id ?? i} className="px-5 py-4 flex gap-3 hover:bg-white/5 transition-colors">
                    {v.thumbnail && (
                      <img
                        src={v.thumbnail}
                        alt={v.title}
                        className="w-20 h-12 object-cover rounded flex-shrink-0 bg-gray-800"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <a
                        href={v.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-white hover:text-indigo-400 transition-colors line-clamp-2"
                      >
                        {v.title}
                      </a>
                      {v.channel && <p className="text-xs text-gray-500 mt-0.5">{v.channel}</p>}
                      <div className="flex gap-3 mt-1 text-xs text-gray-500">
                        <span>👁 {Number(v.view_count).toLocaleString()}</span>
                        <span>❤️ {Number(v.like_count).toLocaleString()}</span>
                        <span>💬 {Number(v.comment_count).toLocaleString()}</span>
                        {v.growth_pct !== undefined && (
                          <span className={v.growth_pct > 0 ? "text-green-500" : "text-gray-500"}>
                            {v.growth_pct > 0 ? "▲" : "▼"} {Math.abs(v.growth_pct).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Reddit */}
          <div className="bg-[#1a1b1e] rounded-xl border border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h2 className="text-base font-semibold text-white">🔥 Reddit r/Music — Hot Posts</h2>
              <SourceBadge source="Reddit" sourceUrl="https://reddit.com/r/Music" />
            </div>

            {/* Sentiment bar */}
            {state.sentiment && (
              <div className="px-5 py-3 border-b border-gray-800/50 flex items-center gap-4">
                <span className="text-xs text-gray-500">Sentiment 24h:</span>
                <div className="flex-1 flex gap-1 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-green-500 h-full transition-all"
                    style={{ width: `${state.sentiment.positive_pct}%` }}
                  />
                  <div
                    className="bg-red-500 h-full transition-all"
                    style={{ width: `${state.sentiment.negative_pct}%` }}
                  />
                  <div className="bg-gray-600 h-full flex-1" />
                </div>
                <span className={`text-xs font-medium ${
                  state.sentiment.compound > 0.05 ? "text-green-400" :
                  state.sentiment.compound < -0.05 ? "text-red-400" : "text-gray-400"
                }`}>
                  {state.sentiment.compound > 0.05 ? "😊 Positive" :
                   state.sentiment.compound < -0.05 ? "😠 Negative" : "😐 Neutral"}
                </span>
              </div>
            )}

            <div className="divide-y divide-gray-800/50 overflow-y-auto" style={{ maxHeight: 380 }}>
              {state.redditPosts.length === 0 ? (
                <div className="px-5 py-8 text-center text-gray-600 text-sm">
                  Chưa có dữ liệu Reddit
                </div>
              ) : (
                state.redditPosts.map((p, i) => (
                  <div key={i} className="px-5 py-3 hover:bg-white/5 transition-colors">
                    <a
                      href={p.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white hover:text-orange-400 transition-colors line-clamp-2"
                    >
                      {p.title}
                    </a>
                    <div className="flex gap-3 mt-1 text-xs text-gray-600">
                      <span>⬆️ {p.score.toLocaleString()}</span>
                      <span>💬 {p.num_comments}</span>
                      <span>r/{p.subreddit}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── ROW 4: Spotify ── */}
        {state.spotifyTracks.length > 0 && (
          <div className="bg-[#1a1b1e] rounded-xl border border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h2 className="text-base font-semibold text-white">🎧 Spotify — Top Tracks</h2>
              <SourceBadge source="Spotify" sourceUrl="https://developer.spotify.com" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-0 divide-x divide-gray-800/50">
              {state.spotifyTracks.slice(0, 20).map((t, i) => (
                <div key={i} className="px-4 py-3 hover:bg-white/5 transition-colors border-b border-gray-800/30">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-gray-600 mt-0.5 w-5 flex-shrink-0">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">{t.name}</p>
                      <p className="text-xs text-gray-500 truncate">{t.artist}</p>
                      <div className="mt-1 flex items-center gap-1">
                        <div className="h-1 flex-1 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${t.popularity}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{t.popularity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="text-xs text-gray-700 text-center pb-4">
          Dữ liệu tổng hợp từ Last.fm · YouTube Data API v3 · Reddit OAuth API · Spotify Web API · Phân tích bằng Gemini 3.1 Flash Lite
        </div>

      </div>
    </main>
  );
}