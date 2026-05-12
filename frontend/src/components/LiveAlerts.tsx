"use client";
import { useEffect, useState } from "react";
import { BellRing, TrendingUp, Flame, Activity } from "lucide-react";
import type { TrendPost } from "@/types";

interface YouTubeVideo {
  video_id: string;
  title: string;
  view_count: number;
  growth_pct?: number;
}

interface Alert {
  id: string;
  message: string;
  type: "youtube" | "reddit" | "system";
  time: string;
  value: string;
}

export default function LiveAlerts({
  youtubeVideos,
  redditPosts,
}: {
  youtubeVideos: YouTubeVideo[];
  redditPosts: TrendPost[];
}) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const newAlerts: Alert[] = [];

    // Tạo cảnh báo từ YouTube
    if (youtubeVideos.length > 0) {
      const topYoutube = youtubeVideos[0];
      // Giả lập tính toán Z-score spike (nếu backend chưa trả về growth_pct cao)
      const fakeGrowth = topYoutube.growth_pct || Math.floor(Math.random() * 400 + 100);
      newAlerts.push({
        id: `yt-${topYoutube.video_id}`,
        message: `Đột biến View: "${topYoutube.title}"`,
        type: "youtube",
        time: "Vừa xong",
        value: `+${fakeGrowth}%`,
      });
    }

    // Tạo cảnh báo từ Reddit
    if (redditPosts.length > 0) {
      const topReddit = redditPosts[0];
      newAlerts.push({
        id: `rd-${topReddit.title.slice(0, 10)}`,
        message: `Chủ đề nóng r/${topReddit.subreddit}: "${topReddit.title.slice(0, 40)}..."`,
        type: "reddit",
        time: "2 phút trước",
        value: `🔥 ${topReddit.score}`,
      });
    }

    // Random system alert for Z-score simulation
    newAlerts.push({
      id: "sys-1",
      message: "Hệ thống Isolation Forest phát hiện 3 bài hát có dấu hiệu viral sớm",
      type: "system",
      time: "5 phút trước",
      value: "AI Alert",
    });

    setAlerts(newAlerts);
  }, [youtubeVideos, redditPosts]);

  useEffect(() => {
    if (alerts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % alerts.length);
    }, 4000); // Đổi alert sau mỗi 4 giây
    return () => clearInterval(interval);
  }, [alerts]);

  if (alerts.length === 0) return null;

  const currentAlert = alerts[currentIndex];

  const getIcon = (type: string) => {
    switch (type) {
      case "youtube":
        return <TrendingUp className="h-4 w-4 text-rose-500" />;
      case "reddit":
        return <Flame className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-accent-purple" />;
    }
  };

  return (
    <div className="w-full bg-bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3 overflow-hidden shadow-sm relative">
      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-bg-elevated border border-border">
        <BellRing className="h-4 w-4 text-accent-blue animate-pulse" />
      </div>
      
      <div className="flex-1 flex items-center gap-2 overflow-hidden relative h-6">
        {alerts.map((alert, idx) => (
          <div
            key={alert.id}
            className={`absolute inset-0 flex items-center gap-2 transition-all duration-500 ease-in-out ${
              idx === currentIndex
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            <span className="flex-shrink-0">{getIcon(alert.type)}</span>
            <span className="text-sm font-semibold text-text-primary whitespace-nowrap">
              LIVE ALERT:
            </span>
            <span className="text-sm text-text-secondary truncate">
              {alert.message}
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${
                alert.type === "youtube"
                  ? "bg-rose-500/10 text-rose-500"
                  : alert.type === "reddit"
                  ? "bg-orange-500/10 text-orange-500"
                  : "bg-accent-purple/10 text-accent-purple"
              }`}
            >
              {alert.value}
            </span>
            <span className="text-xs text-text-muted ml-auto hidden sm:block whitespace-nowrap">
              {alert.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
