"use client";
import { useEffect, useState } from "react";
import { LineChart, BarChart, Globe2, Sparkles, TrendingUp, Music, Loader2, AlertTriangle } from "lucide-react";
import SourceBadge from "@/components/SourceBadge";
import RichText from "@/components/RichText";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function InsightPage() {
  const [marketSummary, setMarketSummary] = useState<any>(null);
  const [genreComparison, setGenreComparison] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [marketRes, genreRes] = await Promise.all([
          fetch(`${BASE}/api/analysis/market-summary`).then(r => r.json()),
          fetch(`${BASE}/api/analysis/genre-comparison`).then(r => r.json())
        ]);
        
        setMarketSummary(marketRes);
        setGenreComparison(genreRes);
      } catch (e: any) {
        setError(`Lỗi tải dữ liệu insight: ${e.message}`);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-aurora flex items-center justify-center shadow-glow">
            <LineChart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
              Global Market <span className="gradient-text">Insight</span>
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Phân tích chuyên sâu về xu hướng âm nhạc toàn cầu từ AI
            </p>
            <div className="flex gap-2 mt-2">
              <SourceBadge source="Gemini AI" />
              <SourceBadge source="Last.fm Data" />
              <SourceBadge source="Deezer API" />
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm px-4 py-3 rounded-xl">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-bg-card border border-border rounded-2xl p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-accent-purple" />
            <p className="text-text-secondary">Đang phân tích hàng ngàn dữ liệu từ các quốc gia...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Market Summary */}
            <div className="bg-bg-card border border-border rounded-xl overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                <h2 className="text-base font-semibold text-text-primary">Market Intelligence Summary</h2>
              </div>
              <div className="p-5 flex-1 bg-gradient-card relative">
                <div className="absolute top-4 right-4 opacity-10">
                  <Sparkles className="h-24 w-24" />
                </div>
                {marketSummary?.insight ? (
                  <div className="prose prose-invert max-w-none text-sm text-text-secondary leading-relaxed space-y-4">
                    {marketSummary.insight.split('\n').map((para: string, i: number) => {
                      if (!para.trim()) return null;
                      const [label, ...rest] = para.split(':');
                      return (
                        <div key={i} className="bg-bg-elevated border border-border-subtle p-3 rounded-lg">
                          <strong className="text-text-primary block mb-1 text-accent-purple">
                            {label}:
                          </strong>
                          {rest.join(':').trim()}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-text-muted text-sm">Không có dữ liệu báo cáo</p>
                )}
                <div className="mt-4 pt-4 border-t border-border-subtle text-xs text-text-muted">
                  Được tổng hợp tự động bởi Gemini 3.1 Flash-Lite vào ngày {marketSummary?.generated_date}
                </div>
              </div>
            </div>

            {/* Genre Comparison */}
            <div className="bg-bg-card border border-border rounded-xl overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-accent-blue" />
                <h2 className="text-base font-semibold text-text-primary">So Sánh Gu Âm Nhạc Theo Vùng</h2>
              </div>
              <div className="p-5 flex-1 flex flex-col gap-5">
                
                {/* AI Insight */}
                {genreComparison?.insight && (
                  <div className="bg-accent-blue/10 border border-accent-blue/20 rounded-lg p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-accent-blue mb-2 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Điểm nhấn từ AI
                    </h3>
                    <RichText text={genreComparison.insight} size="sm" />
                  </div>
                )}

                {/* Country Tags */}
                <div className="space-y-4 flex-1">
                  {genreComparison?.data && Object.values(genreComparison.data).map((item: any, i: number) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-text-primary">{item.country}</span>
                        <span className="text-xs text-text-muted">{item.tag_count} thể loại</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags?.slice(0, 8).map((tag: string, j: number) => (
                          <span key={j} className="text-[10px] bg-bg-elevated border border-border-subtle text-text-secondary px-2 py-1 rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
