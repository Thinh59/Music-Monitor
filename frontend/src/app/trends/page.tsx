"use client";
import { useEffect, useState } from "react";
import SourceBadge from "@/components/SourceBadge";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface TikTokTrack {
  name:       string;
  artist:     string;
  image?:     string;
  preview?:   string;
  deezer_id?: string;
  source:     string;
  source_url?: string;
}
interface RedditPost {
  title:       string;
  score:       number;
  num_comments:number;
  subreddit:   string;
  source_url:  string;
}
interface Sentiment {
  compound:     number;
  positive_pct: number;
  negative_pct: number;
  total:        number;
}

const SUBREDDITS = ["Music", "hiphopheads", "kpop", "popheads", "indieheads", "Rnb"];

export default function TrendsPage() {
  const [tiktokTracks, setTiktok]     = useState<TikTokTrack[]>([]);
  const [redditPosts,  setReddit]     = useState<RedditPost[]>([]);
  const [sentiment,    setSentiment]  = useState<Sentiment | null>(null);
  const [mentions,     setMentions]   = useState(0);
  const [subreddit,    setSubreddit]  = useState("Music");
  const [selectedPost, setSelected]   = useState<RedditPost | null>(null);
  const [aiInsight,    setAiInsight]  = useState("");
  const [loadTiktok,   setLoadTiktok] = useState(true);
  const [loadReddit,   setLoadReddit] = useState(true);
  const [loadAi,       setLoadAi]     = useState(false);
  const [playing,      setPlaying]    = useState<string | null>(null);

  // Load TikTok viral (1 lần)
  useEffect(() => {
    fetch(`${BASE}/api/trends/tiktok?region=global&limit=20`)
      .then((r) => r.json())
      .then((d) => setTiktok(d.data ?? []))
      .catch(console.error)
      .finally(() => setLoadTiktok(false));
  }, []);

  // Load Reddit khi đổi subreddit
  useEffect(() => {
    setLoadReddit(true);
    setSelected(null);
    setAiInsight("");
    fetch(`${BASE}/api/trends/viral?subreddit=${subreddit}&limit=20`)
      .then((r) => r.json())
      .then((d) => {
        setReddit(d.trending_posts ?? []);
        setSentiment(d.sentiment ?? null);
        setMentions(d.mentions_24h ?? 0);
        if (d.trending_posts?.[0]) setSelected(d.trending_posts[0]);
      })
      .catch(console.error)
      .finally(() => setLoadReddit(false));
  }, [subreddit]);

  // Gemini AI insight khi chọn post
  async function loadAiInsight(post: RedditPost) {
    setSelected(post);
    setAiInsight("");
    setLoadAi(true);
    try {
      const res = await fetch(`${BASE}/api/map/country/US/ai-insight`);
      // Dùng endpoint country insight với prompt custom
      // Thực tế: gọi endpoint riêng nếu muốn prompt về post
      // Tạm thời dùng mock insight nếu chưa có endpoint riêng
      const data = await res.json();
      setAiInsight(data.insight ?? "");
    } catch {
      setAiInsight("⚠️ AI insight tạm thời không khả dụng.");
    } finally {
      setLoadAi(false);
    }
  }

  const sentimentColor = !sentiment ? "text-gray-400"
    : sentiment.compound > 0.05  ? "text-green-400"
    : sentiment.compound < -0.05 ? "text-red-400"
    : "text-gray-400";

  const sentimentLabel = !sentiment ? "—"
    : sentiment.compound > 0.3  ? "Rất tích cực 😊"
    : sentiment.compound > 0.05 ? "Tích cực 🙂"
    : sentiment.compound > -0.05? "Trung tính 😐"
    : "Tiêu cực 😠";

  return (
    <main className="min-h-screen bg-transparent p-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div>
          <h1 className="text-2xl font-bold text-white">🔥 Trending Intelligence</h1>
          <p className="text-gray-400 text-sm mt-1">
            TikTok Viral · Reddit Social Listening · Spike Detection · AI Insight
          </p>
          <div className="flex gap-2 mt-2">
            <SourceBadge source="Deezer TikTok" sourceUrl="https://api.deezer.com" />
            <SourceBadge source="Reddit" sourceUrl="https://reddit.com/r/Music" />
            <SourceBadge source="VADER NLP" />
            <SourceBadge source="Gemini AI" />
          </div>
        </div>

        {/* ── SECTION 1: TikTok Viral ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg font-bold text-white">🎵 TikTok Viral Global</span>
            <SourceBadge source="Deezer TikTok Playlist" sourceUrl="https://api.deezer.com" />
          </div>

          {loadTiktok ? (
            <div className="h-32 bg-[#1a1b1e] border border-gray-800 rounded-xl flex items-center justify-center">
              <p className="text-gray-500 animate-pulse text-sm">Đang tải dữ liệu TikTok từ Deezer...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {tiktokTracks.slice(0, 15).map((t, i) => (
                <div
                  key={i}
                  className="bg-[#1a1b1e] border border-gray-800 rounded-xl p-3 hover:border-pink-500/50 transition-colors"
                >
                  {t.image ? (
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-full aspect-square object-cover rounded-lg mb-2 bg-gray-800"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-gray-800 rounded-lg mb-2 flex items-center justify-center text-3xl">
                      🎵
                    </div>
                  )}
                  <p className="text-white text-xs font-semibold truncate">{t.name}</p>
                  <p className="text-gray-500 text-xs truncate">{t.artist}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-pink-400 font-medium">#{i + 1} TikTok</span>
                    {t.preview && (
                      <button
                        onClick={() => setPlaying(playing === t.preview ? null : t.preview!)}
                        className="text-xs text-indigo-400 hover:text-indigo-300"
                      >
                        {playing === t.preview ? "⏹" : "▶️"}
                      </button>
                    )}
                  </div>
                  {playing === t.preview && (
                    <audio src={playing} autoPlay onEnded={() => setPlaying(null)} className="hidden" />
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── SECTION 2: Reddit Social Listening ── */}
        <section>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <span className="text-lg font-bold text-white">💬 Reddit Social Listening</span>
              <p className="text-gray-500 text-xs mt-0.5">Real-time sentiment analysis · VADER NLP</p>
            </div>
            {/* Subreddit selector */}
            <div className="flex flex-wrap gap-2">
              {SUBREDDITS.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSubreddit(sub)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    subreddit === sub
                      ? "bg-orange-500 text-white"
                      : "bg-[#1a1b1e] border border-gray-700 text-gray-400 hover:border-gray-500"
                  }`}
                >
                  r/{sub}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Row */}
          {sentiment && (
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-[#1a1b1e] border border-gray-800 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-orange-400">{mentions}</p>
                <p className="text-xs text-gray-500 mt-1">Mentions 24h</p>
              </div>
              <div className="bg-[#1a1b1e] border border-gray-800 rounded-xl p-4 text-center">
                <p className={`text-lg font-bold ${sentimentColor}`}>{sentimentLabel}</p>
                <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2 overflow-hidden flex">
                  <div className="bg-green-500 h-full" style={{ width: `${sentiment.positive_pct}%` }} />
                  <div className="bg-red-500 h-full"   style={{ width: `${sentiment.negative_pct}%` }} />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {sentiment.positive_pct.toFixed(0)}% pos · {sentiment.negative_pct.toFixed(0)}% neg
                </p>
              </div>
              <div className="bg-[#1a1b1e] border border-gray-800 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-indigo-400">{sentiment.total}</p>
                <p className="text-xs text-gray-500 mt-1">Posts phân tích</p>
              </div>
            </div>
          )}

          {/* Posts + Detail */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Post list */}
            <div className="md:col-span-2 space-y-2">
              {loadReddit ? (
                <div className="h-48 bg-[#1a1b1e] border border-gray-800 rounded-xl flex items-center justify-center">
                  <p className="text-gray-500 animate-pulse text-sm">Đang tải Reddit...</p>
                </div>
              ) : redditPosts.map((post, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(post)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedPost?.title === post.title
                      ? "bg-indigo-900/30 border-indigo-600"
                      : "bg-[#1a1b1e] border-gray-800 hover:border-gray-700"
                  }`}
                >
                  <p className="text-white text-xs font-medium line-clamp-2">{post.title}</p>
                  <div className="flex gap-3 mt-1.5 text-xs text-gray-600">
                    <span>⬆️ {post.score.toLocaleString()}</span>
                    <span>💬 {post.num_comments}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Detail panel */}
            <div className="md:col-span-3 bg-[#1a1b1e] border border-gray-800 rounded-xl p-5">
              {!selectedPost ? (
                <div className="h-full flex items-center justify-center text-gray-600 text-sm">
                  Chọn một post để xem chi tiết
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-white font-semibold text-sm leading-relaxed">{selectedPost.title}</p>
                    <div className="flex gap-3 mt-2 text-xs text-gray-500">
                      <span>⬆️ {selectedPost.score.toLocaleString()}</span>
                      <span>💬 {selectedPost.num_comments}</span>
                      <span>r/{selectedPost.subreddit}</span>
                    </div>
                  </div>
                  <a
                    href={selectedPost.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-orange-600 hover:bg-orange-500 text-white text-xs px-4 py-2 rounded-lg transition-colors"
                  >
                    Đọc trên Reddit →
                  </a>

                  {/* AI Insight section */}
                  <div className="border-t border-gray-800 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-white">🤖 Gemini AI Insight</p>
                      <button
                        onClick={() => loadAiInsight(selectedPost)}
                        disabled={loadAi}
                        className="text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-50 bg-indigo-900/30 px-3 py-1 rounded-lg transition"
                      >
                        {loadAi ? "⏳ Đang phân tích..." : "✨ Phân tích AI"}
                      </button>
                    </div>
                    {aiInsight ? (
                      <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {aiInsight}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600 italic">
                        Click "Phân tích AI" để Gemini phân tích xu hướng này
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}