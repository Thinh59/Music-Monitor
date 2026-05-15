"use client";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Globe2,
  Bot,
  Sparkles,
  MonitorPlay,
  Flame,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import SourceBadge from "@/components/SourceBadge";
import TrendChart from "@/components/TrendChart";
import RichText from "@/components/RichText";
import LiveAlerts from "@/components/LiveAlerts";
import type { Track, TrendPost, SentimentResult } from "@/types";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

async function apiFetch(path: string) {
  const r = await fetch(`${BASE}${path}`, { cache: "no-store" });
  if (!r.ok) throw new Error(`${path} → ${r.status}`);
  return r.json();
}

interface YouTubeVideo {
  video_id: string;
  title: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  channel?: string;
  thumbnail?: string;
  source: string;
  source_url: string;
  growth_pct?: number;
}

interface DashboardState {
  globalCharts: Track[];
  youtubeVideos: YouTubeVideo[];
  redditPosts: TrendPost[];
  sentiment: SentimentResult | null;
  briefing: string;
  briefingDate: string;
}

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("today");
  const [state, setState] = useState<DashboardState>({
    globalCharts: [],
    youtubeVideos: [],
    redditPosts: [],
    sentiment: null,
    briefing: "",
    briefingDate: "",
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      const errs: string[] = [];
      const updates: Partial<DashboardState> = {};

      try {
        const d = await apiFetch(`/api/charts/global?limit=50&period=${timeRange}`);
        updates.globalCharts = d.data ?? [];
      } catch (e: any) {
        errs.push(`Last.fm Charts: ${e.message}`);
      }

      try {
        const d = await apiFetch("/api/trends/youtube/batch");
        updates.youtubeVideos = d.data ?? [];
      } catch {
        try {
          if (updates.globalCharts && updates.globalCharts.length > 0) {
            const top3 = updates.globalCharts.slice(0, 3);
            const videos: YouTubeVideo[] = [];
            for (const track of top3) {
              const searchRes = await apiFetch(
                `/api/trends/youtube/search?q=${encodeURIComponent(`${track.name} ${track.artist} official`)}`,
              ).catch(() => null);
              if (searchRes?.data?.[0]) videos.push(searchRes.data[0]);
            }
            updates.youtubeVideos = videos;
          }
        } catch (e2: any) {
          errs.push(`YouTube: ${e2.message}`);
        }
      }

      try {
        const d = await apiFetch("/api/trends/viral?subreddit=Music");
        updates.redditPosts = d.trending_posts ?? [];
        updates.sentiment = d.sentiment ?? null;
      } catch (e: any) {
        errs.push(`Reddit: ${e.message}`);
      }

      try {
        const d = await apiFetch("/api/briefing/daily");
        updates.briefing = d.briefing ?? "";
        updates.briefingDate = d.generated_at ?? "";
      } catch (e: any) {
        errs.push(`Briefing: ${e.message}`);
      }

      setState((prev) => ({ ...prev, ...updates }));
      setErrors(errs);
      setLoading(false);
    }

    loadAll();
  }, [timeRange]);

  const chartData = state.globalCharts.slice(0, 15).map((t, i) => ({
    time: `#${i + 1}`,
    value: Number(t.playcount ?? 0),
  }));

  if (loading && state.globalCharts.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-transparent">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-purple mx-auto mb-3" />
          <p className="text-text-muted text-sm">
            Đang tải dữ liệu từ Last.fm · YouTube · Reddit...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-aurora flex items-center justify-center shadow-glow">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
                Music Intelligence <span className="gradient-text">Dashboard</span>
              </h1>
              <p className="text-text-secondary mt-1 text-sm">
                Real-time · Last.fm · YouTube · Reddit · Gemini AI
              </p>
            </div>
          </div>
          
          {/* Time Filter */}
          <div className="flex items-center gap-2 bg-bg-card border border-border rounded-lg p-1 relative">
            {loading && <div className="absolute -left-6"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-purple" /></div>}
            <button 
              onClick={() => setTimeRange("today")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${timeRange === 'today' ? 'bg-accent-purple text-white shadow-md' : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'}`}
            >
              Today
            </button>
            <button 
              onClick={() => setTimeRange("week")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${timeRange === 'week' ? 'bg-accent-purple text-white shadow-md' : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'}`}
            >
              This Week
            </button>
            <button 
              onClick={() => setTimeRange("month")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${timeRange === 'month' ? 'bg-accent-purple text-white shadow-md' : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'}`}
            >
              This Month
            </button>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-lg px-4 py-2">
            <p className="text-amber-700 dark:text-amber-300 text-xs font-medium mb-1 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              Một số nguồn dữ liệu gặp lỗi:
            </p>
            {errors.map((e, i) => (
              <p key={i} className="text-amber-600 dark:text-amber-400 text-xs">
                {e}
              </p>
            ))}
          </div>
        )}

        {/* Real-time Viral Alert System */}
        <LiveAlerts youtubeVideos={state.youtubeVideos} redditPosts={state.redditPosts} />

        {/* Row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-accent-purple" />
                Global Top 50 & MIS Pulse
              </h2>
              <SourceBadge source="Last.fm" sourceUrl="https://www.last.fm/charts" />
            </div>
            <div className="overflow-y-auto scrollbar-thin" style={{ maxHeight: 480 }}>
              {state.globalCharts.length === 0 ? (
                <p className="text-text-muted text-sm text-center py-10">
                  Chưa có dữ liệu Last.fm
                </p>
              ) : (
                state.globalCharts.map((t, i) => {
                  const maxPlays = Math.max(...state.globalCharts.map(x => Number(x.playcount || 0)));
                  const playScore = (Number(t.playcount || 0) / (maxPlays || 1)) * 40;
                  const rankBonus = Math.max(0, 40 - i * 1.5);
                  const pseudoRandom = (t.name.charCodeAt(0) + t.artist.charCodeAt(0)) % 20; 
                  const misScore = Math.min(99, Math.round(playScore + rankBonus + pseudoRandom));

                  return (
                    <div
                      key={`${t.name}-${i}`}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-bg-elevated border-b border-border-subtle"
                    >
                      <span className="text-base font-bold text-text-muted w-7 text-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-primary truncate text-sm">{t.name}</p>
                        <p className="text-xs text-text-muted truncate">{t.artist}</p>
                      </div>
                      <div className="text-right flex-shrink-0 flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs font-medium text-text-secondary">
                            {Number(t.playcount ?? 0).toLocaleString()} plays
                          </p>
                          {t.listeners && (
                            <p className="text-xs text-text-muted">
                              {Number(t.listeners).toLocaleString()} listeners
                            </p>
                          )}
                        </div>
                        <div className="w-12 flex flex-col items-center justify-center">
                          <div className={`text-sm font-black w-10 h-8 flex items-center justify-center rounded-lg ${
                            misScore >= 85 ? 'bg-gradient-aurora text-white shadow-glow' : 
                            misScore >= 70 ? 'bg-accent-purple/20 text-accent-purple' : 
                            'bg-bg-elevated text-text-muted'
                          }`}>
                            {misScore}
                          </div>
                          <p className="text-[9px] text-text-muted mt-1 font-bold uppercase tracking-wider">MIS</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="relative rounded-xl border border-border bg-gradient-card p-5 flex flex-col overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-aurora" />
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <Bot className="h-5 w-5 text-accent-purple" />
                AI Daily Briefing
                <Sparkles className="h-3.5 w-3.5 text-accent-purple" />
              </h2>
              <span className="text-xs text-accent-purple bg-accent-purple/10 px-2 py-0.5 rounded">
                Gemini AI
              </span>
            </div>
            {state.briefingDate && (
              <p className="text-xs text-text-muted mb-3">
                {new Date(state.briefingDate).toLocaleString("vi-VN")}
              </p>
            )}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {state.briefing ? (
                <RichText text={state.briefing} size="md" />
              ) : (
                <span className="text-text-muted italic text-sm">
                  Đang sinh báo cáo bằng Gemini AI...
                </span>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-border">
              <div className="flex flex-wrap gap-1">
                <SourceBadge source="Last.fm" sourceUrl="https://www.last.fm/charts" />
                <SourceBadge source="Reddit" sourceUrl="https://reddit.com/r/Music" />
              </div>
            </div>
          </div>
        </div>

        {/* Playcount chart */}
        {chartData.length > 0 && (
          <div className="bg-bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent-purple" />
                Playcount — Top 15 Global
              </h2>
              <SourceBadge source="Last.fm" sourceUrl="https://www.last.fm/charts" />
            </div>
            <TrendChart data={chartData} title="" color="#a855f7" />
          </div>
        )}

        {/* Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* YouTube */}
          <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <MonitorPlay className="h-5 w-5 text-rose-500" />
                YouTube — MV Đang Hot
              </h2>
              <SourceBadge source="YouTube" sourceUrl="https://developers.google.com/youtube/v3" />
            </div>
            <div className="divide-y divide-border-subtle">
              {state.youtubeVideos.length === 0 ? (
                <div className="px-5 py-8 text-center text-text-muted text-sm">
                  <p className="mb-1">Chưa có dữ liệu YouTube</p>
                  <p className="text-xs">YouTube quota có thể đã hết hoặc backend chưa cấu hình</p>
                </div>
              ) : (
                state.youtubeVideos.map((v, i) => (
                  <div
                    key={v.video_id ?? i}
                    className="px-5 py-4 flex gap-3 hover:bg-bg-elevated"
                  >
                    {v.thumbnail && (
                      <img
                        src={v.thumbnail}
                        alt={v.title}
                        className="w-20 h-12 object-cover rounded flex-shrink-0 bg-bg-elevated"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <a
                        href={v.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-text-primary hover:text-accent-purple line-clamp-2"
                      >
                        {v.title}
                      </a>
                      {v.channel && <p className="text-xs text-text-muted mt-0.5">{v.channel}</p>}
                      <div className="flex gap-3 mt-1 text-xs text-text-muted">
                        <span>{Number(v.view_count).toLocaleString()} views</span>
                        <span>{Number(v.like_count).toLocaleString()} likes</span>
                        <span>{Number(v.comment_count).toLocaleString()} cmt</span>
                        {v.growth_pct !== undefined && (
                          <span
                            className={
                              v.growth_pct > 0 ? "text-emerald-500" : "text-text-muted"
                            }
                          >
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
          <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Reddit r/Music — Hot Posts
              </h2>
              <SourceBadge source="Reddit" sourceUrl="https://reddit.com/r/Music" />
            </div>

            {state.sentiment && (
              <div className="px-5 py-3 border-b border-border-subtle flex items-center gap-4">
                <span className="text-xs text-text-muted">Sentiment 24h:</span>
                <div className="flex-1 flex gap-1 h-2 rounded-full overflow-hidden bg-bg-elevated">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${state.sentiment.positive_pct}%` }}
                  />
                  <div
                    className="bg-rose-500 h-full"
                    style={{ width: `${state.sentiment.negative_pct}%` }}
                  />
                </div>
                <span
                  className={`text-xs font-medium ${
                    state.sentiment.compound > 0.05
                      ? "text-emerald-500"
                      : state.sentiment.compound < -0.05
                        ? "text-rose-500"
                        : "text-text-muted"
                  }`}
                >
                  {state.sentiment.compound > 0.05
                    ? "Positive"
                    : state.sentiment.compound < -0.05
                      ? "Negative"
                      : "Neutral"}
                </span>
              </div>
            )}

            <div
              className="divide-y divide-border-subtle overflow-y-auto scrollbar-thin"
              style={{ maxHeight: 380 }}
            >
              {state.redditPosts.length === 0 ? (
                <div className="px-5 py-8 text-center text-text-muted text-sm">
                  Chưa có dữ liệu Reddit
                </div>
              ) : (
                state.redditPosts.map((p, i) => (
                  <div key={i} className="px-5 py-3 hover:bg-bg-elevated">
                    <a
                      href={p.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-text-primary hover:text-orange-500 line-clamp-2"
                    >
                      {p.title}
                    </a>
                    <div className="flex gap-3 mt-1 text-xs text-text-muted">
                      <span>↑ {p.score.toLocaleString()}</span>
                      <span>💬 {p.num_comments}</span>
                      <span>r/{p.subreddit}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="text-xs text-text-muted text-center pb-4">
          Dữ liệu tổng hợp từ Last.fm · YouTube Data API v3 · Reddit OAuth API · Phân tích bằng
          Gemini 3.1 Flash Lite
        </div>
      </div>
    </main>
  );
}
