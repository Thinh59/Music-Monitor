"use client";

import useSWR from "swr";
import { Newspaper, Loader2, RefreshCw } from "lucide-react";
import BriefingCard from "@/components/BriefingCard";
import KpiCardGrid from "@/components/charts/KpiCardGrid";
import TopChartsBar from "@/components/charts/TopChartsBar";
import GenreDonut from "@/components/charts/GenreDonut";
import SentimentGauge from "@/components/charts/SentimentGauge";
import GrowthArea from "@/components/charts/GrowthArea";
import ViralHeatmap from "@/components/charts/ViralHeatmap";
import PredictionRadar from "@/components/charts/PredictionRadar";
import type { DailyBriefing, Track } from "@/types";

interface OverviewData {
  reddit?: {
    sentiment?: {
      compound: number;
      positive_pct: number;
      negative_pct: number;
      total: number;
    };
    mentions_24h?: number;
  };
}

interface YouTubeBatch {
  data: {
    track_name: string;
    artist: string;
    view_count: number;
    like_count: number;
    comment_count: number;
  }[];
}

export default function BriefingPage() {
  // Mỗi nguồn 1 SWR key — cache độc lập, dedupe in-flight, sống sót khi đổi tab
  const briefingSwr = useSWR<DailyBriefing>("/api/briefing/daily");
  const chartsSwr = useSWR<{ data: Track[] }>("/api/charts/global?limit=50");
  const genresSwr = useSWR<{ distribution: Record<string, number> }>(
    "/api/analysis/distribution/genre",
  );
  const overviewSwr = useSWR<OverviewData>("/api/trends/overview");
  const youtubeSwr = useSWR<YouTubeBatch>("/api/trends/youtube/batch");
  const tiktokSwr = useSWR<{ data: Track[] }>("/api/trends/tiktok");
  const candidatesSwr = useSWR<{ data: Track[] }>(
    "/api/prediction/top-candidates?limit=10",
  );

  const allSwrs = [
    briefingSwr,
    chartsSwr,
    genresSwr,
    overviewSwr,
    youtubeSwr,
    tiktokSwr,
    candidatesSwr,
  ];
  const initialLoading = allSwrs.every((s) => !s.data && !s.error);
  const anyValidating = allSwrs.some((s) => s.isValidating);

  function refreshAll() {
    // Force refetch của tất cả endpoints + bust briefing cache backend
    briefingSwr.mutate(
      fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/briefing/daily?force_refresh=true`,
      ).then((r) => r.json()),
      { revalidate: false },
    );
    chartsSwr.mutate();
    genresSwr.mutate();
    overviewSwr.mutate();
    youtubeSwr.mutate();
    tiktokSwr.mutate();
    candidatesSwr.mutate();
  }

  const sentiment = overviewSwr.data?.reddit?.sentiment;
  const briefing = briefingSwr.data;
  const tiktokData = tiktokSwr.data?.data ?? [];

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
                Daily Music <span className="gradient-text">Briefing</span>
              </h1>
              <p className="text-text-secondary text-sm mt-1">
                Báo cáo âm nhạc hằng ngày · Sinh tự động bởi Gemini 3.1 Flash-Lite
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={refreshAll}
            disabled={anyValidating}
            data-testid="briefing-refresh"
            className="flex items-center gap-2 bg-bg-card border border-border hover:border-accent-purple/50 text-text-primary text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {anyValidating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </button>
        </div>

        {/* KPIs */}
        <KpiCardGrid
          trackCount={chartsSwr.data?.data?.length}
          viralAvg={
            tiktokData.length
              ? tiktokData
                  .slice(0, 10)
                  .reduce((s, t) => s + (t.viral_score ?? 50), 0) /
                Math.min(tiktokData.length, 10)
              : undefined
          }
          sentiment={sentiment?.compound}
          redditMentions={overviewSwr.data?.reddit?.mentions_24h}
        />

        {/* Briefing + Sentiment gauge */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {initialLoading && !briefing ? (
              <div className="rounded-2xl border border-border bg-bg-card p-6 animate-pulse h-96" />
            ) : briefing ? (
              <BriefingCard
                briefing={briefing}
                onRefresh={refreshAll}
                loading={briefingSwr.isValidating}
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
          <TopChartsBar tracks={chartsSwr.data?.data ?? []} />
          <GenreDonut distribution={genresSwr.data?.distribution} />
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GrowthArea videos={youtubeSwr.data?.data ?? []} />
          <ViralHeatmap tracks={tiktokData} />
        </div>

        {/* Charts row 3 */}
        <div className="grid grid-cols-1 gap-6">
          <PredictionRadar candidates={candidatesSwr.data?.data ?? []} />
        </div>
      </div>
    </main>
  );
}
