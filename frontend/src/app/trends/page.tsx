"use client";
import { useEffect, useState } from "react";
import { Flame, Music2, MessageSquare, Bot, Sparkles, Play, Square, Loader2 } from "lucide-react";
import SourceBadge from "@/components/SourceBadge";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface TikTokTrack {
  name: string;
  artist: string;
  image?: string;
  preview?: string;
  deezer_id?: string;
  source: string;
  source_url?: string;
}
interface RedditPost {
  title: string;
  score: number;
  num_comments: number;
  subreddit: string;
  source_url: string;
}
interface Sentiment {
  compound: number;
  positive_pct: number;
  negative_pct: number;
  total: number;
}

const SUBREDDITS = ["Music", "hiphopheads", "kpop", "popheads", "indieheads", "Rnb"];

export default function TrendsPage() {
  const [tiktokTracks, setTiktok] = useState<TikTokTrack[]>([]);
  const [redditPosts, setReddit] = useState<RedditPost[]>([]);
  const [sentiment, setSentiment] = useState<Sentiment | null>(null);
  const [mentions, setMentions] = useState(0);
  const [subreddit, setSubreddit] = useState("Music");
  const [selectedPost, setSelected] = useState<RedditPost | null>(null);
  const [aiInsight, setAiInsight] = useState("");
  const [loadTiktok, setLoadTiktok] = useState(true);
  const [loadReddit, setLoadReddit] = useState(true);
  const [loadAi, setLoadAi] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BASE}/api/trends/tiktok?region=global&limit=20`)
      .then((r) => r.json())
      .then((d) => setTiktok(d.data ?? []))
      .catch(console.error)
      .finally(() => setLoadTiktok(false));
  }, []);

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

  async function loadAiInsight(post: RedditPost) {
    setSelected(post);
    setAiInsight("");
    setLoadAi(true);
    try {
      const res = await fetch(
        `${BASE}/api/trends/reddit-insight?title=${encodeURIComponent(post.title)}&subreddit=${encodeURIComponent(post.subreddit)}`,
      );
      const data = await res.json();
      setAiInsight(data.insight ?? "");
    } catch {
      setAiInsight("AI insight tạm thời không khả dụng.");
    } finally {
      setLoadAi(false);
    }
  }

  const sentimentColor = !sentiment
    ? "text-text-muted"
    : sentiment.compound > 0.05
      ? "text-emerald-500"
      : sentiment.compound < -0.05
        ? "text-rose-500"
        : "text-text-muted";

  const sentimentLabel = !sentiment
    ? "—"
    : sentiment.compound > 0.3
      ? "Rất tích cực"
      : sentiment.compound > 0.05
        ? "Tích cực"
        : sentiment.compound > -0.05
          ? "Trung tính"
          : "Tiêu cực";

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-aurora flex items-center justify-center shadow-glow">
            <Flame className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
              Trending <span className="gradient-text">Intelligence</span>
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              TikTok Viral · Reddit Social Listening · Spike Detection · AI Insight
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <SourceBadge source="Deezer TikTok" sourceUrl="https://api.deezer.com" />
              <SourceBadge source="Reddit" sourceUrl="https://reddit.com/r/Music" />
              <SourceBadge source="VADER NLP" />
              <SourceBadge source="Gemini AI" />
            </div>
          </div>
        </div>

        {/* TikTok Viral */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Music2 className="h-5 w-5 text-accent-pink" />
            <span className="text-lg font-bold text-text-primary">TikTok Viral Global</span>
            <SourceBadge source="Deezer TikTok Playlist" sourceUrl="https://api.deezer.com" />
          </div>

          {loadTiktok ? (
            <div className="h-32 bg-bg-card border border-border rounded-xl flex items-center justify-center">
              <p className="text-text-muted animate-pulse text-sm">Đang tải dữ liệu TikTok từ Deezer...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {tiktokTracks.slice(0, 15).map((t, i) => (
                <div
                  key={i}
                  className="bg-bg-card border border-border rounded-xl p-3 hover:border-accent-pink/50"
                >
                  {t.image ? (
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-full aspect-square object-cover rounded-lg mb-2 bg-bg-elevated"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-bg-elevated rounded-lg mb-2 flex items-center justify-center">
                      <Music2 className="h-8 w-8 text-text-muted" />
                    </div>
                  )}
                  <p className="text-text-primary text-xs font-semibold truncate">{t.name}</p>
                  <p className="text-text-muted text-xs truncate">{t.artist}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-accent-pink font-medium">#{i + 1}</span>
                    {t.preview && (
                      <button
                        onClick={() => setPlaying(playing === t.preview ? null : t.preview!)}
                        className="text-xs text-accent-purple hover:text-accent-blue"
                        aria-label={playing === t.preview ? "Stop" : "Play"}
                      >
                        {playing === t.preview ? (
                          <Square className="h-3 w-3" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
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

        {/* Reddit */}
        <section>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-orange-500" />
              <div>
                <span className="text-lg font-bold text-text-primary">Reddit Social Listening</span>
                <p className="text-text-muted text-xs mt-0.5">
                  Real-time sentiment analysis · VADER NLP
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUBREDDITS.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSubreddit(sub)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    subreddit === sub
                      ? "bg-gradient-aurora text-white"
                      : "bg-bg-card border border-border text-text-secondary hover:border-accent-purple/40"
                  }`}
                >
                  r/{sub}
                </button>
              ))}
            </div>
          </div>

          {sentiment && (
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-bg-card border border-border rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-orange-500">{mentions}</p>
                <p className="text-xs text-text-muted mt-1">Mentions 24h</p>
              </div>
              <div className="bg-bg-card border border-border rounded-xl p-4 text-center">
                <p className={`text-base font-bold ${sentimentColor}`}>{sentimentLabel}</p>
                <div className="w-full bg-bg-elevated rounded-full h-1.5 mt-2 overflow-hidden flex">
                  <div className="bg-emerald-500 h-full" style={{ width: `${sentiment.positive_pct}%` }} />
                  <div className="bg-rose-500 h-full" style={{ width: `${sentiment.negative_pct}%` }} />
                </div>
                <p className="text-xs text-text-muted mt-1">
                  {sentiment.positive_pct.toFixed(0)}% pos · {sentiment.negative_pct.toFixed(0)}% neg
                </p>
              </div>
              <div className="bg-bg-card border border-border rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-accent-purple">{sentiment.total}</p>
                <p className="text-xs text-text-muted mt-1">Posts phân tích</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2 space-y-2">
              {loadReddit ? (
                <div className="h-48 bg-bg-card border border-border rounded-xl flex items-center justify-center">
                  <p className="text-text-muted animate-pulse text-sm">Đang tải Reddit...</p>
                </div>
              ) : (
                redditPosts.map((post, i) => (
                  <button
                    key={i}
                    onClick={() => setSelected(post)}
                    className={`w-full text-left p-3 rounded-xl border ${
                      selectedPost?.title === post.title
                        ? "bg-accent-purple/10 border-accent-purple/50"
                        : "bg-bg-card border-border hover:border-accent-purple/30"
                    }`}
                  >
                    <p className="text-text-primary text-xs font-medium line-clamp-2">{post.title}</p>
                    <div className="flex gap-3 mt-1.5 text-xs text-text-muted">
                      <span>↑ {post.score.toLocaleString()}</span>
                      <span>💬 {post.num_comments}</span>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="md:col-span-3 bg-bg-card border border-border rounded-xl p-5">
              {!selectedPost ? (
                <div className="h-full flex items-center justify-center text-text-muted text-sm">
                  Chọn một post để xem chi tiết
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-text-primary font-semibold text-sm leading-relaxed">
                      {selectedPost.title}
                    </p>
                    <div className="flex gap-3 mt-2 text-xs text-text-muted">
                      <span>↑ {selectedPost.score.toLocaleString()}</span>
                      <span>💬 {selectedPost.num_comments}</span>
                      <span>r/{selectedPost.subreddit}</span>
                    </div>
                  </div>
                  <a
                    href={selectedPost.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-orange-500 hover:bg-orange-600 text-white text-xs px-4 py-2 rounded-lg"
                  >
                    Đọc trên Reddit →
                  </a>

                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-text-primary flex items-center gap-2">
                        <Bot className="h-4 w-4 text-accent-purple" />
                        AI Insight
                        <Sparkles className="h-3 w-3 text-accent-purple" />
                      </p>
                      <button
                        onClick={() => loadAiInsight(selectedPost)}
                        disabled={loadAi}
                        className="text-xs text-text-secondary hover:text-text-primary bg-bg-elevated border border-border hover:border-accent-purple/40 px-3 py-1 rounded-lg disabled:opacity-50 inline-flex items-center gap-1.5"
                      >
                        {loadAi ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                        Phân tích
                      </button>
                    </div>
                    {aiInsight ? (
                      <div className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
                        {aiInsight}
                      </div>
                    ) : (
                      <p className="text-xs text-text-muted italic">
                        Click "Phân tích" để Gemini phân tích xu hướng này
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
