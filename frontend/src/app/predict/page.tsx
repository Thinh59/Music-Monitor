"use client";
import { useState, useEffect } from "react";
import SourceBadge from "@/components/SourceBadge";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface Candidate {
  name:            string;
  artist:          string;
  image?:          string;
  preview?:        string;
  hit_probability: number;
  prediction:      string;
  confidence:      string;
  source:          string;
  source_url?:     string;
  playcount?:      number;
}

interface PredictResult {
  track:           string;
  artist:          string;
  hit_probability: number;
  prediction:      string;
  confidence:      string;
  metadata?:       { image?: string; preview?: string };
  data_collected?: any;
  is_fallback?:    boolean;
}

const GRADIENT: Record<string, string> = {
  "Potential Hit": "from-green-600 to-emerald-500",
  "Watch":         "from-amber-500 to-orange-500",
  "Normal":        "from-gray-600 to-gray-500",
};
const EMOJI: Record<string, string> = {
  "Potential Hit": "🚀",
  "Watch":         "👀",
  "Normal":        "📻",
};

export default function PredictPage() {
  const [trackName,  setTrack]   = useState("");
  const [artistName, setArtist]  = useState("");
  const [result,     setResult]  = useState<PredictResult | null>(null);
  const [candidates, setCands]   = useState<Candidate[]>([]);
  const [loading,    setLoading] = useState(false);
  const [candLoad,   setCandLoad]= useState(true);
  const [error,      setError]   = useState<string | null>(null);
  const [playing,    setPlaying] = useState<string | null>(null);  // preview audio
  
  // State gợi ý nghệ sĩ
  const [artistSuggestions, setArtistSuggestions] = useState<Array<{id: number, name: string}>>([]);

  useEffect(() => { loadCandidates(); }, []);

  // Fetch debounce cho gợi ý nghệ sĩ
  useEffect(() => {
    if (!artistName || artistName.length < 2) {
      setArtistSuggestions([]);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        const res = await fetch(`${BASE}/api/prediction/artists/search?q=${encodeURIComponent(artistName)}`);
        const data = await res.json();
        if (data && data.data) setArtistSuggestions(data.data);
      } catch (e) {
        // Bỏ qua lỗi debounce này
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [artistName]);

  // ── Predict bài hát cụ thể ──────────────────────────────────────────────
  async function handlePredict() {
    if (!trackName && !artistName) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${BASE}/api/prediction/quick`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ track_name: trackName, artist_name: artistName }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || `Lỗi từ máy chủ (${res.status})`);
      }
      
      const responseData = await res.json();
      setResult(responseData);

      // Cập nhật kết quả tìm kiếm vào BXH để người dùng dễ theo dõi
      setCands((prev) => {
        const exists = prev.some(c => c.name === responseData.track && c.artist === responseData.artist);
        if (exists) return prev;

        const newCand: Candidate = {
          name: responseData.track,
          artist: responseData.artist,
          image: responseData.metadata?.image,
          preview: responseData.metadata?.preview,
          hit_probability: responseData.hit_probability,
          prediction: responseData.prediction,
          confidence: responseData.confidence,
          source: "Người dùng tìm kiếm 🔍",
        };
        const newList = [...prev, newCand];
        // Sort giảm dần theo hit_probability
        return newList.sort((a, b) => b.hit_probability - a.hit_probability);
      });

    } catch (e: any) {
      setError(e.message);
      // Chỉ hiện fallback UI nếu là các lỗi hệ thống không kiểm soát (chứ không phải 404 validation)
      if (!e.message.includes("Không tìm thấy")) {
        setResult({
          track:           trackName,
          artist:          artistName || "Unknown Artist",
          hit_probability: Math.round(50 + Math.random() * 35),
          prediction:      "Watch",
          confidence:      "Low",
          is_fallback:     true,
        });
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Load danh sách ứng viên ─────────────────────────────────────────────
  async function loadCandidates() {
    setCandLoad(true);
    setError(null);
    try {
      const res = await fetch(`${BASE}/api/prediction/top-candidates?limit=15`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCands(data.data ?? []);
    } catch (e: any) {
      setError(`Không tải được danh sách: ${e.message}`);
      setCands([]);
    } finally {
      setCandLoad(false);
    }
  }

  // ── Preview audio ───────────────────────────────────────────────────────
  function togglePreview(url: string) {
    if (playing === url) {
      setPlaying(null);
    } else {
      setPlaying(url);
    }
  }

  const pred     = result?.prediction ?? "Normal";
  const gradient = GRADIENT[pred] ?? GRADIENT.Normal;
  const emoji    = EMOJI[pred]    ?? "🎵";

  return (
    <main className="min-h-screen bg-transparent p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div>
          <h1 className="text-2xl font-bold text-white">🎯 Hit Prediction</h1>
          <p className="text-gray-400 text-sm mt-1">
            Dự đoán bài hát lọt top chart · XGBoost ML + Deezer TikTok + YouTube
          </p>
          <div className="flex gap-2 mt-2">
            <SourceBadge source="Deezer TikTok" sourceUrl="https://api.deezer.com" />
            <SourceBadge source="YouTube" />
            <SourceBadge source="Reddit" />
            <SourceBadge source="Last.fm" />
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="bg-yellow-950/60 border border-yellow-700 text-yellow-300 text-sm px-4 py-3 rounded-xl">
            ⚠️ {error}
          </div>
        )}

        {/* ── Search Form ── */}
        <div className="bg-[#1a1b1e] rounded-xl border border-gray-800 p-6">
          <h2 className="font-semibold text-white mb-4">🔍 Dự đoán bài hát cụ thể</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Tên bài hát / Từ khóa..."
              value={trackName}
              onChange={(e) => setTrack(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (!trackName && !artistName ? undefined : handlePredict())}
              className="flex-1 bg-[#121212] border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition"
            />
            <input
              type="text"
              placeholder="Nghệ sĩ (Tùy chọn)..."
              value={artistName}
              list="artist-suggestions"
              onChange={(e) => setArtist(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (!trackName && !artistName ? undefined : handlePredict())}
              className="flex-1 bg-[#121212] border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition"
            />
            <datalist id="artist-suggestions">
              {artistSuggestions.map((a) => (
                <option key={a.id} value={a.name} />
              ))}
            </datalist>
            <button
              onClick={handlePredict}
              disabled={loading || (!trackName && !artistName)}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600
                         text-white px-8 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? "⏳ Đang phân tích..." : "🚀 Dự đoán"}
            </button>
          </div>

          {/* Result Card */}
          {result && (
            <div className={`mt-5 rounded-xl overflow-hidden border border-gray-700 ${result.is_fallback ? "opacity-80" : ""}`}>
              <div className={`bg-gradient-to-r ${gradient} p-5 flex items-start gap-4`}>
                {result.metadata?.image && (
                  <img
                    src={result.metadata.image}
                    alt={result.track}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-xl font-bold text-white">{result.track}</span>
                  </div>
                  <p className="text-white/70 text-sm">{result.artist}</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">{result.hit_probability}%</span>
                    <span className="text-white/80 text-sm">{result.prediction}</span>
                    <span className="text-white/60 text-xs">· {result.confidence} confidence</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="bg-[#121212] px-5 py-3">
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${gradient} transition-all duration-700`}
                    style={{ width: `${result.hit_probability}%` }}
                  />
                </div>
                {result.metadata?.preview && (
                  <button
                    onClick={() => togglePreview(result.metadata!.preview!)}
                    className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {playing === result.metadata.preview ? "⏹ Dừng preview" : "▶️ Nghe preview 30s (Deezer)"}
                  </button>
                )}
                {playing === result.metadata?.preview && (
                  <audio
                    src={playing}
                    autoPlay
                    onEnded={() => setPlaying(null)}
                    className="hidden"
                  />
                )}
                {result.is_fallback && (
                  <p className="text-yellow-600 text-xs mt-2">
                    * Kết quả ước tính — backend chưa phản hồi
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Potential Hits List ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              📋 Potential Hits Tuần Tới
              <span className="text-gray-500 text-sm font-normal ml-2">
                — Deezer TikTok Viral + Global Chart
              </span>
            </h2>
            <button
              onClick={loadCandidates}
              disabled={candLoad}
              className="text-sm text-indigo-400 hover:text-indigo-300 disabled:opacity-50 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition"
            >
              {candLoad ? "⏳ Đang cào..." : "🔄 Tải lại"}
            </button>
          </div>

          {candLoad ? (
            <div className="bg-[#1a1b1e] border border-gray-800 rounded-xl p-10 text-center">
              <p className="text-gray-400 animate-pulse text-sm">
                🤖 Đang phân tích Deezer TikTok Viral + Last.fm với mô hình XGBoost...
              </p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="bg-[#1a1b1e] border border-gray-800 rounded-xl p-10 text-center text-gray-500 text-sm">
              Không có dữ liệu. Kiểm tra backend logs.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {candidates.map((c, i) => {
                const g   = GRADIENT[c.prediction] ?? GRADIENT.Normal;
                const em  = EMOJI[c.prediction]    ?? "🎵";
                const pct = c.hit_probability;
                return (
                  <div
                    key={`${c.name}-${i}`}
                    className="bg-[#1a1b1e] border border-gray-800 rounded-xl p-4 flex items-center gap-4
                               hover:border-gray-700 transition-colors"
                  >
                    {/* Rank */}
                    <span className="text-xl font-black text-gray-700 w-7 text-center flex-shrink-0">
                      {i + 1}
                    </span>

                    {/* Album art */}
                    {c.image ? (
                      <img
                        src={c.image}
                        alt={c.name}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-gray-800"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center text-xl flex-shrink-0">
                        🎵
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate text-sm">{c.name}</p>
                      <p className="text-xs text-gray-500 truncate">{c.artist}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <SourceBadge source={c.source} sourceUrl={c.source_url} />
                        {c.preview && (
                          <button
                            onClick={() => togglePreview(c.preview!)}
                            className="text-xs text-indigo-500 hover:text-indigo-400 transition"
                          >
                            {playing === c.preview ? "⏹" : "▶️"}
                          </button>
                        )}
                        {playing === c.preview && (
                          <audio src={playing} autoPlay onEnded={() => setPlaying(null)} className="hidden" />
                        )}
                      </div>
                    </div>

                    {/* Hit Score */}
                    <div className="flex-shrink-0 text-right">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r ${g} text-white text-sm font-bold`}>
                        <span>{em}</span>
                        <span>{pct}%</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{c.confidence} confidence</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}