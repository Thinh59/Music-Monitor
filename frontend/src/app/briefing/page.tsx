"use client";
import { useEffect, useState } from "react";
import BriefingCard from "@/components/BriefingCard";
import ChartTable from "@/components/ChartTable";
import type { DailyBriefing } from "@/types";

export default function BriefingPage() {
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [loading, setLoading]   = useState(true);

  async function load(forceRefresh = false) {
    setLoading(true);
    try {
      const url = forceRefresh
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/briefing/daily?force_refresh=true`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/briefing/daily`;
      const res = await fetch(url);
      const data = await res.json();
      setBriefing(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    // Sửa bg-gray-50 thành bg-transparent để hiện nền đen từ layout
    <main className="min-h-screen bg-transparent p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          {/* Sửa màu chữ thành trắng */}
          <h1 className="text-2xl font-bold text-white">📰 Daily Music Briefing</h1>
          <p className="text-gray-400 text-sm mt-1">
            Báo cáo âm nhạc hằng ngày · Sinh tự động bởi Gemini 3.1 Flash-Lite
          </p>
        </div>

        {loading ? (
          <div className="bg-[#1a1b1e] border border-gray-800 rounded-xl p-6 text-white animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/3 mb-3" />
            <div className="h-3 bg-gray-700 rounded w-full mb-2" />
            <div className="h-3 bg-gray-700 rounded w-5/6 mb-2" />
            <div className="h-3 bg-gray-700 rounded w-4/6" />
          </div>
        ) : briefing ? (
          <div className="space-y-6">
            <BriefingCard
              briefing={briefing}
              onRefresh={() => load(true)}
              loading={loading}
            />

            {briefing.top_tracks_used?.length > 0 && (
              <ChartTable
                tracks={briefing.top_tracks_used}
                title="🎵 Top Tracks dùng để sinh Briefing"
              />
            )}
          </div>
        ) : (
          <div className="bg-[#1a1b1e] border border-gray-800 rounded-xl p-8 text-center text-gray-500">
            Không thể tải briefing. Kiểm tra backend logs.
          </div>
        )}
      </div>
    </main>
  );
}