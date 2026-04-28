// const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// export async function fetchGlobalCharts(limit = 20) {
//   const res = await fetch(`${BASE_URL}/api/charts/global?limit=${limit}`);
//   if (!res.ok) throw new Error("Failed to fetch global charts");
//   return res.json();
// }

// export async function fetchCountryCharts(country: string) {
//   const res = await fetch(`${BASE_URL}/api/charts/country/${country}`);
//   if (!res.ok) throw new Error("Failed to fetch country charts");
//   return res.json();
// }

// export async function fetchViralTrends(subreddit = "Music") {
//   const res = await fetch(`${BASE_URL}/api/trends/viral?subreddit=${subreddit}`);
//   if (!res.ok) throw new Error("Failed to fetch viral trends");
//   return res.json();
// }

// // SỬA HÀM NÀY: Thêm tham số forceRefresh
// export async function fetchDailyBriefing(forceRefresh = false) {
//   // Tạo URL: nếu forceRefresh là true thì thêm ?force_refresh=true
//   const url = `${BASE_URL}/api/briefing/daily${forceRefresh ? "?force_refresh=true" : ""}`;
  
//   const res = await fetch(url);
//   if (!res.ok) throw new Error("Failed to fetch briefing");
//   return res.json();
// }

// export async function fetchMapData() {
//   const res = await fetch(`${BASE_URL}/api/map/clusters`);
//   if (!res.ok) throw new Error("Failed to fetch map data");
//   return res.json();
// }

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// ─── Helper ─────────────────────────────────────────────────────────────────

async function get(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status} ${res.statusText}`);
  return res.json();
}

async function post(path: string, body: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
    cache:   "no-store",
  });
  if (!res.ok) throw new Error(`POST ${path} → ${res.status} ${res.statusText}`);
  return res.json();
}

// ─── Charts ─────────────────────────────────────────────────────────────────

/** Top 50 tracks toàn cầu — Last.fm */
export async function fetchGlobalCharts(limit = 50) {
  return get(`/api/charts/global?limit=${limit}`);
}

/** Top charts theo quốc gia — Last.fm */
export async function fetchCountryCharts(isoCode: string, limit = 20) {
  // Backend endpoint: GET /api/map/country/{iso_code}/top
  return get(`/api/map/country/${isoCode}/top?limit=${limit}`);
}

// ─── Map / Clustering ────────────────────────────────────────────────────────

/** Dữ liệu phân cụm 22 quốc gia — Last.fm + K-Means */
export async function fetchMapData() {
  return get("/api/map/clusters");
}

// ─── Trends ─────────────────────────────────────────────────────────────────

/** Bài hát đang viral — Reddit + VADER Sentiment */
export async function fetchViralTrends(subreddit = "Music") {
  return get(`/api/trends/viral?subreddit=${subreddit}`);
}

/** Stats + spike detection cho một MV YouTube */
export async function fetchYouTubeTrend(videoId: string) {
  return get(`/api/trends/youtube/${videoId}`);
}

// ─── Dashboard tổng hợp ─────────────────────────────────────────────────────

/**
 * Lấy dữ liệu dashboard đầy đủ song song:
 * Last.fm global charts + YouTube + Reddit + Spotify overview
 */
export async function fetchDashboardData() {
  const [charts, viral, briefing] = await Promise.allSettled([
    fetchGlobalCharts(50),
    fetchViralTrends("Music"),
    fetchDailyBriefing(),
  ]);

  return {
    charts:   charts.status   === "fulfilled" ? charts.value   : null,
    viral:    viral.status    === "fulfilled" ? viral.value    : null,
    briefing: briefing.status === "fulfilled" ? briefing.value : null,
  };
}

// ─── Hit Prediction ──────────────────────────────────────────────────────────

export async function fetchTopCandidates(limit = 10) {
  return get(`/api/prediction/top-candidates?limit=${limit}`);
}

export async function quickPredict(trackName: string, artistName: string) {
  return post("/api/prediction/quick", {
    track_name:  trackName,
    artist_name: artistName,
  });
}

// ─── Briefing ────────────────────────────────────────────────────────────────

export async function fetchDailyBriefing(forceRefresh = false) {
  const qs = forceRefresh ? "?force_refresh=true" : "";
  return get(`/api/briefing/daily${qs}`);
}

// ─── Analysis / Insight & Interpretation ─────────────────────────────────────

/** Market Intelligence Summary — Gemini AI viết (cache theo ngày) */
export async function fetchMarketSummary() {
  return get("/api/analysis/insight/market-summary");
}

/** So sánh genre giữa các quốc gia — EDA comparison */
export async function fetchGenreComparison(countries = "VN,JP,US,KR,BR,NG") {
  return get(`/api/analysis/genre-comparison?countries=${countries}`);
}

/** Phân phối genre toàn cầu — EDA distribution */
export async function fetchGenreDistribution() {
  return get("/api/analysis/distribution/genre");
}

/** Time-series chart toàn cầu (Firestore snapshot hoặc realtime fallback) */
export async function fetchTimeseriesCharts() {
  return get("/api/analysis/timeseries/global-charts");
}

/** Time-series YouTube view count cho 1 bài hát */
export async function fetchTimeseriesYoutube(trackName: string, artist = "") {
  const qs = artist ? `?artist=${encodeURIComponent(artist)}` : "";
  return get(`/api/analysis/timeseries/youtube/${encodeURIComponent(trackName)}${qs}`);
}

/** Elbow Method info cho K-Means country clustering */
export async function fetchClusteringElbow() {
  return get("/api/analysis/clustering/elbow");
}

/** AI Insight cho 1 quốc gia khi click marker bản đồ */
export async function fetchCountryAiInsight(isoCode: string) {
  return get(`/api/map/country/${isoCode}/ai-insight`);
}