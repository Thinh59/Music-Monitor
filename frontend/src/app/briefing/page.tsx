"use client";

import { useEffect, useState } from "react";
import { Newspaper, Loader2, RefreshCw } from "lucide-react";
import BriefingCard from "@/components/BriefingCard";
import KpiCardGrid from "@/components/charts/KpiCardGrid";
import TopChartsBar from "@/components/charts/TopChartsBar";
import GenreDonut from "@/components/charts/GenreDonut";
import SentimentGauge from "@/components/charts/SentimentGauge";
import GrowthArea from "@/components/charts/GrowthArea";
import ViralHeatmap from "@/components/charts/ViralHeatmap";
import PredictionRadar from "@/components/charts/PredictionRadar";
import {
  fetchDailyBriefing,
  fetchGlobalCharts,
  fetchGenreDistribution,
  fetchTrendsOverview,
  fetchYouTubeBatch,
  fetchTikTokTrends,
  fetchTopCandidates,
} from "@/lib/api";
import type { DailyBriefing, Track } from "@/types";

interface DashboardData {
  briefing: DailyBriefing | null;
  charts: { data: Track[] } | null;
  genres: { distribution: Record<string, number> } | null;
  overview: {
    reddit?: {
      sentiment?: { compound: number; positive_pct: number; negative_pct: number; total: number };
      mentions_24h?: number;
    };
  } | null;
  youtube: { data: { track_name: string; artist: string; view_count: number; like_count: number; comment_count: number }[] } | null;
  tiktok: { data: Track[] } | null;
  candidates: { data: Track[] } | null;
}

export default function BriefingPage() {
  const [d, setD] = useState<DashboardData>({
    briefing: null,
    charts: null,
    genres: null,
    overview: null,
    youtube: null,
    tiktok: null,
    candidates: null,
  });
  const [loading, setLoading] = useState(true);

  async function loadAll(forceRefresh = false) {
    setLoading(true);
    const settle = async <T,>(p: Promise<T>): Promise<T | null> =>
      p.catch(() => null);

    const [briefing, charts, genres, overview, youtube, tiktok, candidates] =
      await Promise.all([
        settle(fetchDailyBriefing(forceRefresh)),
        settle(fetchGlobalCharts(50)),
        settle(fetchGenreDistribution()),
        settle(fetchTrendsOverview()),
        settle(fetchYouTubeBatch()),
        settle(fetchTikTokTrends()),
        settle(fetchTopCandidates(10)),
      ]);

    setD({
      briefing: briefing as DailyBriefing | null,
      charts: charts as DashboardData["charts"],
      genres: genres as DashboardData["genres"],
      overview: overview as DashboardData["overview"],
      youtube: youtube as DashboardData["youtube"],
      tiktok: tiktok as DashboardData["tiktok"],
      candidates: candidates as DashboardData["candidates"],
    });
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const sentiment = d.overview?.reddit?.sentiment;

  return (
    <main className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-aurora flex items-center justify-center shadow-glow">
              <Newspaper className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
                Daily Music{" "}
                <span className="gradient-text">Briefing</span>
              </h1>
              <p className="text-text-secondary text-sm mt-1">
                Báo cáo âm nhạc hằng ngày · Sinh tự động bởi Gemini 3.1 Flash-Lite
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => loadAll(true)}
            disabled={loading}
            data-testid="briefing-refresh"
            className="flex items-center gap-2 bg-bg-card border border-border hover:border-accent-purple/50 text-text-primary text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </button>
        </div>

        {/* KPIs */}
        <KpiCardGrid
          trackCount={d.charts?.data?.length}
          viralAvg={
            d.tiktok?.data?.length
              ? d.tiktok.data
                  .slice(0, 10)
                  .reduce((s, t) => s + (t.viral_score ?? 50), 0) /
                Math.min(d.tiktok.data.length, 10)
              : undefined
          }
          sentiment={sentiment?.compound}
          redditMentions={d.overview?.reddit?.mentions_24h}
        />

        {/* Briefing + Top charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {loading && !d.briefing ? (
              <div className="rounded-2xl border border-border bg-bg-card p-6 animate-pulse h-96" />
            ) : d.briefing ? (
              <BriefingCard
                briefing={d.briefing}
                onRefresh={() => loadAll(true)}
                loading={loading}
              />
            ) : (
              <div className="rounded-2xl border border-border bg-bg-card p-8 text-center text-text-muted">
                Không thể tải briefing. Kiểm tra backend logs.
              </div>
            )}
          </div>
          <div>
            <SentimentGauge
              compound={sentiment?.compound}
              positive={sentiment?.positive_pct}
              negative={sentiment?.negative_pct}
              total={sentiment?.total}
            />
          </div>
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopChartsBar tracks={d.charts?.data ?? []} />
          <GenreDonut
            distribution={
              d.genres?.distribution as Record<string, number> | undefined
            }
          />
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GrowthArea videos={d.youtube?.data ?? []} />
          <ViralHeatmap tracks={d.tiktok?.data ?? []} />
        </div>

        {/* Charts row 3 */}
        <div className="grid grid-cols-1 gap-6">
          <PredictionRadar candidates={d.candidates?.data ?? []} />
        </div>
      </div>
    </main>
  );
}
