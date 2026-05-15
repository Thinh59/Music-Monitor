# Global Music Intelligence Monitor — Tài liệu Reverse Engineering

> **Mục tiêu tài liệu**: Sau khi đọc file này, developer mới hiểu gần như toàn bộ hệ thống mà không cần hỏi thêm.

---

## 1. Tổng quan Project

### 1.1 Project dùng để làm gì?

**Global Music Intelligence Monitor** là nền tảng web phân tích và dự đoán xu hướng âm nhạc toàn cầu theo thời gian thực. Hệ thống thu thập dữ liệu từ 5+ nguồn (Last.fm, YouTube, Reddit, Deezer), áp dụng ML/AI để phân tích, phân cụm và dự đoán, sau đó trình bày kết quả qua dashboard web đẹp.

**Context**: Đây là đồ án môn Phân tích Dữ liệu Thông minh (SmartDA), hoàn thành tháng 4/2026.

### 1.2 Mục tiêu hệ thống

| Mục tiêu | Mô tả |
|----------|-------|
| Real-time monitoring | Polling dữ liệu mỗi 6 giờ, cache Firestore |
| Trend detection | Z-score + Isolation Forest phát hiện spike viral |
| Hit prediction | XGBoost dự đoán bài hát sẽ lọt top chart |
| Music taste clustering | K-Means phân cụm 80+ quốc gia theo gu âm nhạc |
| AI narrative | Gemini 3.1 Flash-Lite sinh báo cáo ngôn ngữ tự nhiên tiếng Việt |
| AI Chat Agent | ReAct agent gọi tool nội bộ + DuckDuckGo web search |

### 1.3 Các tính năng chính

1. **Dashboard** (`/dashboard`): Hiển thị Global Top 50 Last.fm + YouTube MV hot + Reddit sentiment + AI Briefing
2. **World Map** (`/map`): Bản đồ Leaflet.js tô màu 80+ quốc gia theo cluster K-Means, click để xem AI insight
3. **Trending** (`/trends`): Viral score tổng hợp, TikTok viral list từ Deezer, Reddit hot posts + VADER sentiment
4. **Hit Prediction** (`/predict`): Form nhập tên bài → tự động thu thập data → XGBoost dự đoán xác suất
5. **Daily Briefing** (`/briefing`): Báo cáo AI Gemini tự động hàng ngày, cache in-memory
6. **AI Chat** (`/chat`): Chat với Music Intelligence Agent (ReAct style, streaming SSE)

### 1.4 Luồng hoạt động end-to-end

```
User truy cập web
  → Next.js render page
  → Fetch API calls tới FastAPI backend
  → Backend gọi services (Last.fm / Deezer / YouTube / Reddit)
  → AI modules xử lý (clustering / prediction / sentiment / Gemini)
  → Trả JSON về frontend
  → Frontend render charts / map / cards
```

### 1.5 User flow chính

**Flow 1 — Xem tình hình âm nhạc hôm nay:**
Landing Page → Briefing (AI tóm tắt) → Dashboard (charts + YouTube + Reddit) → Trending (viral)

**Flow 2 — Khám phá bản đồ thế giới:**
World Map → Xem màu cluster quốc gia → Click marker → AI insight popup → Xem top chart quốc gia đó

**Flow 3 — Dự đoán hit:**
Predict page → Nhập tên bài + nghệ sĩ → Backend tự thu thập data → Xem hit probability + top candidates

**Flow 4 — Hỏi AI:**
Chat page → Nhập câu hỏi → Agent gọi tools (Last.fm + YouTube + Reddit + DuckDuckGo) → Stream kết quả về

---

## 2. Kiến trúc tổng thể

### 2.1 Folder structure

```
Music-Monitor/
├── backend/                    # FastAPI Python backend
│   ├── app/
│   │   ├── main.py             # FastAPI app entry, router registration, startup hook
│   │   ├── config.py           # Pydantic Settings — load .env
│   │   ├── database.py         # Firebase Admin SDK init + Firestore client
│   │   ├── scheduler.py        # APScheduler — poll Last.fm mỗi 6 giờ
│   │   ├── routers/            # API route handlers (7 router modules)
│   │   │   ├── charts.py       # /api/charts/*
│   │   │   ├── trends.py       # /api/trends/*
│   │   │   ├── map.py          # /api/map/*
│   │   │   ├── prediction.py   # /api/prediction/*
│   │   │   ├── briefing.py     # /api/briefing/*
│   │   │   ├── analysis.py     # /api/analysis/*
│   │   │   └── agent.py        # /api/agent/* (SSE streaming)
│   │   ├── services/           # External API clients (5 services)
│   │   │   ├── lastfm.py       # Last.fm API (httpx async)
│   │   │   ├── youtube.py      # YouTube Data API v3 (httpx async)
│   │   │   ├── reddit.py       # Reddit Public JSON API (httpx async)
│   │   │   ├── spotify.py      # Spotify Web API (spotipy, lazy-init)
│   │   │   └── deezer.py       # Deezer API (httpx async, no key needed)
│   │   ├── ai/                 # AI/ML modules
│   │   │   ├── agent.py        # ReAct agent loop (Gemini)
│   │   │   ├── gemini_service.py # Gemini API wrapper + rate limiting + cache
│   │   │   ├── clustering.py   # K-Means country clustering
│   │   │   ├── hit_prediction.py # XGBoost hit predictor
│   │   │   ├── trend_detection.py # Z-score + Isolation Forest
│   │   │   ├── sentiment.py    # VADER sentiment analysis
│   │   │   ├── text_clean.py   # Strip markdown từ Gemini output
│   │   │   ├── claude_narrative.py # Legacy file (đã replace bằng gemini_service.py)
│   │   │   └── tools/          # Agent tool implementations
│   │   │       ├── data_query.py # Wrap internal services cho agent
│   │   │       └── duckduckgo.py # DuckDuckGo web search tool
│   │   └── models/             # SQLAlchemy models (legacy) + trained ML model
│   │       ├── chart.py        # ChartEntry, TrackMetadata (SQLAlchemy, unused)
│   │       ├── trend.py        # TrendSnapshot, HitPrediction, DailyBriefing (unused)
│   │       └── hit_predictor.joblib # XGBoost trained model (240KB)
│   ├── firebase-cert.json      # Firebase service account credentials
│   ├── map_cache.json          # File-based cache cho /api/map/clusters
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                   # Next.js 14 App Router frontend
│   ├── src/
│   │   ├── app/                # Pages (App Router)
│   │   │   ├── layout.tsx      # Root layout: Sidebar + Providers
│   │   │   ├── page.tsx        # Landing page (/)
│   │   │   ├── (auth)/         # Clerk auth pages (sign-in, sign-up)
│   │   │   ├── briefing/       # /briefing page
│   │   │   ├── dashboard/      # /dashboard page (15943 bytes — lớn nhất)
│   │   │   ├── map/            # /map page
│   │   │   ├── trends/         # /trends page
│   │   │   ├── predict/        # /predict page
│   │   │   └── chat/           # /chat page
│   │   ├── components/         # React components
│   │   │   ├── Sidebar.tsx     # Navigation sidebar + Clerk auth
│   │   │   ├── AgentChat.tsx   # Chat UI + SSE stream handler
│   │   │   ├── BriefingCard.tsx # AI briefing display với rich text
│   │   │   ├── WorldMap.tsx    # Leaflet map (dynamic import)
│   │   │   ├── TrendChart.tsx  # Recharts line chart
│   │   │   ├── ChartTable.tsx  # Bảng xếp hạng
│   │   │   ├── HitCard.tsx     # Predicted hit card
│   │   │   ├── SourceBadge.tsx # Badge nguồn dữ liệu
│   │   │   ├── RichText.tsx    # Text renderer với formatting
│   │   │   ├── ThemeToggle.tsx # Dark/light mode toggle
│   │   │   ├── MusicMap.tsx    # Map wrapper
│   │   │   ├── charts/         # Chart components (Recharts wrappers)
│   │   │   │   ├── GenreDonut.tsx
│   │   │   │   ├── GrowthArea.tsx
│   │   │   │   ├── KpiCardGrid.tsx
│   │   │   │   ├── PredictionRadar.tsx
│   │   │   │   ├── SentimentGauge.tsx
│   │   │   │   ├── TopChartsBar.tsx
│   │   │   │   ├── ViralHeatmap.tsx
│   │   │   │   └── ChartCard.tsx
│   │   │   └── providers/
│   │   │       ├── AppClerkProvider.tsx # Clerk auth provider
│   │   │       ├── SWRProvider.tsx      # SWR global config
│   │   │       └── ThemeProvider.tsx    # next-themes provider
│   │   ├── lib/
│   │   │   ├── api.ts          # Tất cả API fetch functions
│   │   │   ├── agentClient.ts  # SSE stream reader cho Agent chat
│   │   │   ├── cleanText.ts    # Text cleaning helper
│   │   │   └── parseSection.ts # Parse AI briefing text thành blocks
│   │   └── types/index.ts      # TypeScript interfaces
│   └── Dockerfile
├── kaggle/
│   └── music-monitor-eda-training.ipynb # EDA + XGBoost training notebook
├── docker-compose.yml          # Orchestration (postgres + redis + backend + frontend)
├── .env                        # Root env (không dùng trực tiếp)
└── README.md
```

### 2.2 Architectural Pattern

Hệ thống theo kiến trúc **3-tier web application** với thêm AI layer:

```
┌─────────────────────────────────────────────────────┐
│  FRONTEND (Next.js 14, App Router, TypeScript)      │
│  Port 3000 — Vercel deploy                          │
└─────────────────┬───────────────────────────────────┘
                  │ HTTP REST + SSE
┌─────────────────▼───────────────────────────────────┐
│  BACKEND (FastAPI, Python 3.11, Uvicorn)            │
│  Port 8000 — Render.com deploy                      │
│  ┌──────────┐ ┌─────────┐ ┌──────────┐ ┌────────┐  │
│  │ Routers  │ │Services │ │ AI/ML    │ │Schedul.│  │
│  └──────────┘ └────┬────┘ └──────────┘ └────────┘  │
└───────────────────┬─────────────────────────────────┘
                    │ HTTP calls
┌───────────────────▼─────────────────────────────────┐
│  EXTERNAL APIs                                       │
│  Last.fm · YouTube · Reddit · Deezer · Spotify       │
│  Gemini AI · DuckDuckGo                              │
└─────────────────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│  DATA LAYER                                          │
│  Firebase Firestore (primary cache)                  │
│  map_cache.json (file-based, clustering result)      │
│  In-memory dict (briefing cache, insight cache)      │
└─────────────────────────────────────────────────────┘
```

**Lưu ý kiến trúc thực tế**: Mặc dù `docker-compose.yml` có PostgreSQL và Redis, thực tế backend **không dùng chúng**. `database.py` đã được refactor sang Firebase Firestore. SQLAlchemy models trong `models/` là **legacy code** không được gọi từ bất kỳ router nào.

### 2.3 Data Flow tổng quát

```
External API → services/*.py → routers/*.py → JSON response → frontend/lib/api.ts → React state → UI render
                                    ↕
                              ai/*.py modules
                              (clustering, prediction, sentiment, gemini)
                                    ↕
                              Firebase Firestore / file cache
```


---

## 3. Phân tích từng folder/file quan trọng

### 3.1 Backend Entry Point — `backend/app/main.py`

**Chức năng**: Khởi tạo FastAPI app, đăng ký tất cả routers, cấu hình CORS, trigger scheduler khi startup.

**Code quan trọng**:
```python
app = FastAPI(title="Global Music Intelligence Monitor", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    # Chỉ cho phép localhost — production cần thay bằng domain thật
)

app.include_router(charts.router,     prefix="/api/charts")
app.include_router(trends.router,     prefix="/api/trends")
app.include_router(map.router,        prefix="/api/map")
app.include_router(prediction.router, prefix="/api/prediction")
app.include_router(briefing.router,   prefix="/api/briefing")
app.include_router(analysis.router,   prefix="/api/analysis")
app.include_router(agent.router,      prefix="/api/agent")

@app.on_event("startup")
async def startup_event():
    start_scheduler()   # Kick off APScheduler background job
```

**Điểm chú ý**: CORS chỉ cho `localhost` — khi deploy production phải đổi `allow_origin_regex` thành domain thật.

---

### 3.2 Config — `backend/app/config.py`

**Chức năng**: Load biến môi trường từ `.env` qua Pydantic `BaseSettings`.

```python
class Settings(BaseSettings):
    gemini_api_key: str
    firebase_cert_path: str
    lastfm_api_key: str
    youtube_api_key: str
    reddit_user_agent: str
    spotify_client_id: str
    spotify_client_secret: str
    class Config:
        env_file = ".env"

settings = Settings()
```

**Điểm chú ý**: `reddit_client_id` và `reddit_client_secret` đã bị comment — Reddit hiện dùng Public JSON API (không cần OAuth).

---

### 3.3 Database — `backend/app/database.py`

**Chức năng**: Khởi tạo Firebase Admin SDK, tạo Firestore client singleton.

```python
try:
    firebase_admin.get_app()   # Tránh init lại nếu đã có
except ValueError:
    cred = credentials.Certificate(settings.firebase_cert_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()

def get_db():
    return db
```

**Vì sao tồn tại**: Thay thế PostgreSQL/Redis trong thiết kế ban đầu. Firestore là NoSQL document store hoàn toàn miễn phí cho scale nhỏ.

**Được gọi từ**: `scheduler.py`, `routers/analysis.py`

**Firestore collections đang dùng**:
- `cache/global_top` — Last.fm top tracks (cập nhật mỗi 6h bởi scheduler)
- `youtube_snapshots/{doc_id}/history` — lịch sử view count YouTube (chưa có job cập nhật)

---

### 3.4 Scheduler — `backend/app/scheduler.py`

**Chức năng**: Background job polling Last.fm mỗi 6 tiếng, cache vào Firestore.

```python
scheduler = AsyncIOScheduler()

async def poll_lastfm_charts():
    tracks = await get_global_top_tracks(limit=50)
    db.collection('cache').document('global_top').set({
        'updated_at': datetime.datetime.now(datetime.timezone.utc),
        'tracks': tracks
    })

def start_scheduler():
    scheduler.add_job(poll_lastfm_charts, IntervalTrigger(hours=6))
    scheduler.start()
```

**Vì sao 6 giờ**: Tối ưu quota Firebase (free tier: 50K reads/ngày, 20K writes/ngày) và Last.fm rate limit.

**Điểm rủi ro**: Scheduler chạy in-process với FastAPI. Nếu server restart, job bị clear. Không có persistence — mỗi lần deploy lại, job chạy lại từ đầu theo interval.

---

### 3.5 Services Layer — `backend/app/services/`

Mỗi file là một async HTTP client gọi external API:

#### `lastfm.py`
- **`get_global_top_tracks(limit)`**: Gọi `chart.getTopTracks` → top bài hát toàn cầu
- **`get_top_tracks_by_country(country, limit)`**: Gọi `geo.getTopTracks` → top bài theo quốc gia (tên tiếng Anh: "vietnam", "japan")
- **`get_artist_tags(artist_name)`**: Gọi `artist.getTopTags` → top 5 genre tags
- **`get_top_tracks_multiple_countries(countries)`**: Sequential loop trên nhiều quốc gia
- **Auth**: Chỉ cần `api_key` trong query param, không cần OAuth
- **Timeout**: 8s connect, 5s total

#### `deezer.py` ⭐ (quan trọng nhất)
- **Hoàn toàn miễn phí, không cần API key**
- **`get_country_chart(iso_code, limit, strict)`**: 3-level fallback: editorial → playlist → global
  - `strict=True`: không fallback global (dùng cho clustering)
  - `strict=False` (default): fallback sang global chart nếu không có data
- **`get_multiple_country_charts(iso_codes)`**: Sequential với `delay=0.2s` tránh rate limit
- **`get_tiktok_viral(region)`**: TikTok viral list từ Deezer playlist
- **`search_track(track_name, artist_name)`**: Tìm bài hát với fallback fuzzy search
- **`_format_track(t)`**: Chuẩn hóa track format về schema chung

```python
COUNTRY_EDITORIAL_IDS = {
    "VN": 122, "US": 198, "KR": 151, ...  # ~40 quốc gia
}
COUNTRY_PLAYLIST_FALLBACK = {
    "VN": "10155037362",  # Nhạc Hot Việt Nam
    ...
}
SPECIAL_PLAYLISTS = {
    "tiktok_viral_global": "8912748682",
    ...
}
```

#### `youtube.py`
- **`search_music_video(query)`**: Tìm MV với `videoCategoryId=10` (Music)
- **`get_video_stats(video_id)`**: View count, like count, comment count
- **`track_view_growth(video_id, previous_views)`**: Tính % tăng trưởng
- **`_yt_get(endpoint, params)`**: Shared helper với error handling và quota detection

#### `reddit.py`
- **Dùng Public JSON API** (không OAuth): `https://www.reddit.com/r/{subreddit}/hot.json`
- **`get_trending_music_posts(subreddit, limit)`**: Hot posts từ subreddit
- **`search_artist_mentions(query, limit)`**: Tìm bài đăng đề cập đến nghệ sĩ
- **`count_mentions_24h(posts)`**: Đếm posts trong 24h qua từ `created_utc`

#### `spotify.py`
- **Lazy-init**: `_get_spotify_client()` chỉ init khi gọi lần đầu
- **SpotifyConfigError**: Custom exception với `reason` code (`missing_env`, `invalid_credentials`, `rate_limit`, `premium_required`)
- **`_wrap_call(fn)`**: Decorator bắt `SpotifyOauthError` → `SpotifyConfigError`
- **`get_new_releases()`**: Fallback khi playlist editorial cần Premium
- **Vấn đề**: Spotify editorial playlists (Top 50, Viral 50) yêu cầu owner app có Premium subscription → hệ thống auto fallback sang `new_releases`

#### `musicbrainz.py`
- Rate limit **1 req/giây** → dùng `asyncio.sleep(1)` giữa các call
- `search_recording()`, `get_artist_info()`, `get_release_info()`
- Được gọi ít — chủ yếu cho metadata enrichment

---

### 3.6 AI/ML Layer — `backend/app/ai/`

#### `gemini_service.py` ⭐ (critical)
**Chức năng**: Wrapper duy nhất cho Gemini API với rate limiting, retry, cache.

**Rate limiting implementation**:
```python
_MAX_RPM = 12           # an toàn dưới 14/phút free tier
_WINDOW_SEC = 62        # cửa sổ 62 giây
_request_times: deque = deque()

async def _wait_for_slot():
    async with _rate_lock:
        while True:
            now = time.monotonic()
            # Xóa timestamps cũ
            while _request_times and now - _request_times[0] > _WINDOW_SEC:
                _request_times.popleft()
            if len(_request_times) < _MAX_RPM:
                _request_times.append(now)
                return
            # Chờ đến khi có slot
            wait_s = _WINDOW_SEC - (now - _request_times[0]) + 0.5
            await asyncio.sleep(wait_s)
```

**Retry với exponential backoff**: 3 lần, đọc `retry-after` từ error message của Gemini.

**Cache theo ngày**:
```python
_insight_cache: dict[str, str] = {}
# Key format: "YYYY-MM-DD:cache_key"
```

**Public functions**:
- `analyze_country_insight(prompt, cache_key)` — hàm chung gọi Gemini + cache
- `generate_daily_briefing(...)` — legacy, dùng cho backward compat
- `explain_trend(track_name, artist, ...)` — giải thích tại sao bài viral

#### `clustering.py`
```python
GENRE_LIST = ["pop", "hip-hop", "k-pop", "rock", "electronic", "indie",
              "r&b", "latin", "jazz", "classical", "metal", "country",
              "reggae", "folk", "dance", "alternative"]  # 16 genres

def build_country_vectors(country_tags) -> pd.DataFrame:
    # Đếm tần suất từng genre → vector 16 chiều cho mỗi quốc gia

def cluster_countries(df, n_clusters=5) -> pd.DataFrame:
    # KMeans(n_clusters, random_state=42)
    # PCA(n_components=2) để visualization
    # Thêm columns: cluster, pca_x, pca_y

def get_cluster_label(cluster_id, df) -> str:
    # Tìm genre có mean cao nhất trong cluster → "POP-dominant"
```

#### `hit_prediction.py`
**Model**: XGBoost, lazy-load từ `models/hit_predictor.joblib`.

**11 features**:
```python
features = [
    youtube_growth_24h,    # % tăng view 24h
    youtube_growth_48h,
    youtube_growth_7d,
    reddit_mentions_24h,
    youtube_comments,
    lastfm_playcount,
    lastfm_listeners,
    genre_popularity,      # 0-1, cao hơn với pop/k-pop/hip-hop
    artist_playcount,
    datetime.now().month,  # Seasonality
    1 if month in [11,12,1] else 0,  # Holiday season flag
]
```

**Fallback heuristic** (khi chưa có model):
```python
prob = min((growth / 1000 * 0.6 + mentions / 200 * 0.4), 0.99)
```

**Output**: `{"hit_probability": 72.3, "prediction": "Potential Hit", "confidence": "High", "model_used": "XGBoost"}`

#### `trend_detection.py`
```python
def detect_view_spike_zscore(view_history, threshold=2.5):
    # Tính growth = np.diff(view_history)
    # Z-score của growth array
    # is_spike nếu z_score[-1] > threshold

def detect_anomalies_isolation_forest(features):
    # IsolationForest(contamination=0.1)
    # -1 = anomaly (viral), 1 = normal

def calculate_viral_score(youtube_growth_pct, reddit_mentions, youtube_comments):
    # YouTube 50%: min(growth/500 * 50, 50)
    # Reddit 30%:  min(mentions/100 * 30, 30)
    # Comments 20%: min(comments/50000 * 20, 20)
```

#### `sentiment.py`
```python
analyzer = SentimentIntensityAnalyzer()  # VADER — init 1 lần

def analyze_posts_sentiment(posts):
    # Phân tích title của mỗi Reddit post
    # compound > 0.05: positive
    # compound < -0.05: negative
    # Trả về: {compound, positive_pct, negative_pct, total}
```

#### `text_clean.py`
Strip markdown khỏi Gemini output: `##`, `**`, `*`, `_`, `` ` ``, `>`, `---`, `[text](url)` → `text`, bullet markers → `•`.

#### `agent.py` ⭐
**ReAct-style agent** — xem Section 4.

#### `tools/data_query.py`
Wrap internal services thành async functions cho agent gọi:
`get_global_charts`, `get_country_top`, `get_tiktok_trends`, `get_reddit_buzz`, `get_youtube_for_track`, `viral_score`, `artist_tags`

#### `tools/duckduckgo.py`
```python
async def web_search(query, max_results=5, region="wt-wt"):
    # Chạy DDGS().text() trong thread pool (sync → async)
    return await asyncio.to_thread(_sync)
```

---

### 3.7 Routers Layer — `backend/app/routers/`

#### `charts.py` — `/api/charts/*`

| Endpoint | Mô tả |
|----------|-------|
| `GET /global` | Top tracks toàn cầu — Last.fm `chart.getTopTracks` |
| `GET /country/{country}` | Top tracks theo quốc gia (tên tiếng Anh) — Last.fm |
| `GET /spotify` | Spotify Global Top 50; fallback → New Releases nếu 403 Premium |
| `GET /spotify/viral` | Spotify Viral 50; fallback → New Releases |

#### `trends.py` — `/api/trends/*`

| Endpoint | Mô tả | Sources |
|----------|-------|---------|
| `GET /tiktok` | TikTok viral list | Deezer playlist |
| `GET /viral` | Reddit hot posts + VADER | Reddit + VADER |
| `GET /overview` | Tổng hợp 3 nguồn song song | Deezer + Reddit + Last.fm |
| `GET /youtube/batch` | YouTube stats cho top tracks | Last.fm → YouTube search → stats |
| `GET /reddit-insight` | Gemini phân tích 1 Reddit post | Reddit + Gemini |
| `GET /youtube/search` | Tìm MV YouTube | YouTube |
| `GET /youtube/{video_id}` | Stats + Z-score spike | YouTube + Z-score |
| `GET /spike/{track_name}` | Viral score tổng hợp 0-100 | YouTube + Reddit + VADER |
| `GET /explain/{track_name}` | Gemini giải thích tại sao viral | YouTube + Reddit + Last.fm + Gemini |
| `GET /reddit/search` | Tìm bài đăng Reddit về 1 bài hát | Reddit |

**Parallel execution trong `/overview`**:
```python
tiktok_task = get_tiktok_viral("global", limit=10)
reddit_task = get_trending_music_posts("Music", limit=20)
lastfm_task = get_global_top_tracks(limit=10)

tiktok_tracks, reddit_posts, lastfm_tracks = await asyncio.gather(
    tiktok_task, reddit_task, lastfm_task, return_exceptions=True
)
```

#### `map.py` — `/api/map/*`

| Endpoint | Mô tả |
|----------|-------|
| `GET /clusters` | Phân cụm 80+ quốc gia — K-Means (cache file) |
| `GET /country/{iso}/top` | Top tracks tại 1 quốc gia (Deezer → Last.fm fallback) |
| `GET /country/{iso}/ai-insight` | Gemini AI insight cho quốc gia |
| `DELETE /clusters/cache` | Xóa `map_cache.json` để cào lại |

**File-based cache**:
```python
CACHE_FILE = "map_cache.json"
if os.path.exists(CACHE_FILE):
    return cached  # Instant response

# Nếu không có cache: cào 80+ quốc gia (60-90 giây)
sem = asyncio.Semaphore(8)  # Tối đa 8 fetch đồng thời
pairs = await asyncio.gather(*(fetch_one(iso, name) for iso, name in COUNTRY_MAP.items()))
```

**LOCAL_GENRE_BOOST**: Hard-coded genre boost cho quốc gia có âm nhạc địa phương đặc thù:
```python
LOCAL_GENRE_BOOST = {
    "vietnam":     ["v-pop", "ballad", "rap viet"] * 4,
    "south korea": ["k-pop", "k-hiphop", "k-r&b"] * 5,
    # ...
}
```

#### `prediction.py` — `/api/prediction/*`

| Endpoint | Mô tả |
|----------|-------|
| `GET /artists/search` | Autocomplete tên nghệ sĩ từ Deezer |
| `POST /` | Predict với features cung cấp thủ công |
| `POST /quick` | Tự động thu thập data rồi predict |
| `GET /top-candidates` | Top bài tiềm năng từ TikTok + Global + Last.fm |

**Quick predict pipeline**:
```
Deezer search (validate bài tồn tại)
→ YouTube search + get_video_stats (view count, comments)
→ Tính decay_factor theo tuổi MV (>365 ngày → 0.02, >100 ngày → 0.15, ...)
→ Reddit search_artist_mentions
→ Last.fm get_artist_tags (genre popularity)
→ predict_hit_probability(features)
```

#### `briefing.py` — `/api/briefing/*`

| Endpoint | Mô tả |
|----------|-------|
| `GET /daily` | Briefing hàng ngày (cache in-memory theo ngày) |
| `GET /history` | 7 ngày gần nhất từ `_cache` dict |

**In-memory cache**: `_cache: dict = {"2026-05-14": {...}}` — không persist qua restart.

**Structured output**: Gemini trả JSON 5 fields `{overview, top_charts, tiktok, community, forecast}`, parse bằng `json.loads()`.

**Fallback**: Nếu Gemini lỗi/quota, `_fallback_briefing()` tạo text structured từ data thô.

#### `analysis.py` — `/api/analysis/*`

| Endpoint | Mô tả |
|----------|-------|
| `GET /distribution/genre` | Phân phối genre từ top 20 artists |
| `GET /genre-comparison` | So sánh genre giữa các quốc gia + Gemini insight |
| `GET /timeseries/global-charts` | Lịch sử từ Firestore (hoặc realtime fallback) |
| `GET /timeseries/youtube/{track}` | Lịch sử YouTube view count |
| `GET /clustering/elbow` | Elbow method info (đọc từ map_cache.json) |
| `GET /insight/market-summary` | Market Intelligence Summary — Gemini |

**Trùng lặp**: Có **2 route** `GET /distribution/genre` (line 22 và line 183) — route đầu có `top_n_artists` param và cache, route sau không có. Python/FastAPI sẽ dùng route đăng ký đầu tiên.

#### `agent.py` — `/api/agent/*`

| Endpoint | Mô tả |
|----------|-------|
| `POST /chat` | Stream SSE agent response |
| `GET /tools` | Liệt kê tools agent có |

**SSE format**: Mỗi event là `data: {json}\n\n`. Frontend đọc qua `ReadableStream` (không dùng `EventSource` vì EventSource không support POST).


---

## 4. Phân tích Core Logic

### 4.1 Logic Monitor Music hoạt động thế nào

Hệ thống **không** monitor theo event-driven (không có webhook từ Spotify/YouTube). Thay vào đó dùng **polling approach**:

```
Scheduler (6h) → Last.fm API → Firestore cache
                                    ↓
User request → Router → Check cache → Hit: return cache
                                    → Miss: fetch live → return
```

Với các module nặng (clustering), dùng **file-based cache** (`map_cache.json`) tồn tại qua restart.

### 4.2 Polling / Scheduling

```python
# scheduler.py
scheduler = AsyncIOScheduler()
scheduler.add_job(poll_lastfm_charts, IntervalTrigger(hours=6))
scheduler.start()
```

- **APScheduler AsyncIOScheduler**: chạy trong event loop của FastAPI
- Chỉ có **1 job** duy nhất: poll Last.fm global top 50
- **Không có job** cho YouTube, Reddit, Deezer — chúng được fetch on-demand khi có request

### 4.3 Detect Logic — Viral Spike Detection

**Z-score approach** (cho 1 video):
```python
arr = np.array(view_history)
growth = np.diff(arr)            # Tốc độ tăng view
z_scores = np.abs(stats.zscore(growth))
is_spike = z_scores[-1] > 2.5   # Threshold
```

**Vấn đề thực tế**: Endpoint `GET /trends/youtube/{video_id}` dùng **fake history**:
```python
fake_history = [int(views * 0.55), int(views * 0.72), int(views * 0.88), views]
```
→ Chỉ có 4 điểm → `detect_view_spike_zscore` trả `is_spike: False` vì cần ít nhất 5 điểm.

**Isolation Forest** (cho batch tracks): Chỉ được định nghĩa, chưa được gọi từ router nào.

### 4.4 Viral Score Calculation

```python
def calculate_viral_score(youtube_growth_pct, reddit_mentions, youtube_comments):
    yt_score      = min(youtube_growth_pct / 500 * 50, 50)   # max 50 pts
    reddit_score  = min(reddit_mentions / 100 * 30, 30)      # max 30 pts
    comment_score = min(youtube_comments / 50000 * 20, 20)   # max 20 pts
    return round(yt_score + reddit_score + comment_score, 1) # 0-100
```

**YouTube growth proxy**: Vì không có historical data, `yt_growth` được tính từ view count:
```python
yt_growth = min(yt_views / 1_000_000 * 15, 500)
```
→ 1M views ≈ 15% growth (rất approximate)

### 4.5 Hit Prediction Pipeline

**Quick predict flow** (endpoint `POST /prediction/quick`):

```
1. Deezer search_track → validate bài tồn tại + lấy chuẩn tên
2. YouTube search_music_video → tìm MV official
3. YouTube get_video_stats → view_count, comment_count, published_at
4. Tính decay_factor:
   - days_old > 365 → decay = 0.02 (bài quá cũ)
   - days_old > 100 → decay = 0.15
   - days_old > 30  → decay = 0.5
   - days_old ≤ 30  → decay = 1.0
5. mock_growth_24h = min(views/1M * 12 * decay, 600)
6. Reddit search_artist_mentions (30 posts)
7. Last.fm get_artist_tags → genre_popularity score
8. XGBoost predict_proba(features) → hit_probability
```

**Decay factor**: Fix bài cũ như "Love Shot 2018" không bị model classify là hit vì view count cao nhưng growth 24h thực tế thấp.

### 4.6 K-Means Clustering Flow

```
1. Fetch 80+ quốc gia (song song, semaphore=8)
   Mỗi quốc gia:
     a. Deezer get_country_chart(strict=True) → top 10 tracks
     b. Last.fm get_artist_tags cho mỗi track → genre tags
     c. LOCAL_GENRE_BOOST → add thêm genre địa phương
     d. Nếu < 5 tags: Last.fm geo chart fallback
     e. Nếu vẫn < 3 tags: skip quốc gia này
2. build_country_vectors: dict → DataFrame (16 genre columns)
3. KMeans(n_clusters=6, random_state=42).fit_predict(X)
4. PCA(n_components=2) → pca_x, pca_y cho visualization
5. get_cluster_label: tìm genre dominant → "POP-dominant"
6. Lưu cache vào map_cache.json
```

**Thời gian**: ~60-90 giây lần đầu. Sau đó: <0.01s từ cache.

### 4.7 ReAct Agent Loop

```python
SYSTEM_PROMPT = """Bạn là Music Intelligence Agent...
QUY TẮC:
1. Output DUY NHẤT một JSON: {"thought": ..., "action": ..., "input": {...}}
2. Hoặc: {"thought": ..., "final_answer": "..."}
3. Tối đa 6 vòng tool
"""

async def run_agent(user_message) -> AsyncGenerator[dict]:
    history = [SYSTEM_PROMPT, user_message]
    
    for iteration in range(MAX_ITERATIONS):  # MAX = 6
        prompt = "\n\n".join(history) + "\n\nASSISTANT (JSON):"
        raw = await _call_agent_model(prompt)  # Gemini call
        parsed = _parse_agent_output(raw)      # Extract JSON
        
        if "final_answer" in parsed:
            yield {"type": "answer", "message": parsed["final_answer"]}
            yield {"type": "done"}
            return
        
        # Tool call
        action = parsed.get("action")
        tool_input = parsed.get("input", {})
        yield {"type": "tool_call", "name": action, "input": tool_input}
        
        result = await TOOLS[action]["fn"](**tool_input)
        yield {"type": "tool_result", "name": action, "preview": _shrink(result, 400)}
        
        history.append(f"ASSISTANT_ACTION: {action}({tool_input})")
        history.append(f"OBSERVATION: {_shrink(result, 2200)}")
    
    # Forced final answer sau 6 vòng
    raw = await _call_agent_model(forced_prompt)
    yield {"type": "answer", ...}
```

**Tools available**:
- `web_search` / `web_news` — DuckDuckGo (không cần key)
- `get_global_charts` / `get_country_top` — Last.fm
- `get_tiktok_trends` — Deezer
- `get_reddit_buzz` — Reddit + VADER
- `get_youtube_for_track` — YouTube
- `viral_score` — YouTube + Reddit combined
- `artist_tags` — Last.fm

### 4.8 Gemini Rate Limiting

Rate limiting dùng **sliding window** với `asyncio.Lock()`:
- Max 12 requests/62 giây (dưới free tier limit 14/phút)
- Nếu đầy window: sleep đến khi có slot
- 429 error: exponential backoff (35s → 70s → 105s)

**Cache strategy**: `{date}:{cache_key}` → results cached in-memory theo ngày. Cache reset khi server restart.

### 4.9 Error Handling

| Module | Pattern |
|--------|---------|
| Services | try/except → return `[]` hoặc `{}` + print warning |
| Gemini | Retry 3 lần → return `"⚠️ AI tạm thời không khả dụng"` |
| Spotify | Custom `SpotifyConfigError(reason, message)` → caller xử lý theo reason |
| Briefing | Gemini lỗi → `_fallback_briefing()` từ data thô |
| Agent | Tool lỗi → add vào history → agent thử tool khác |
| Routes | `asyncio.gather(return_exceptions=True)` → không crash toàn bộ |

### 4.10 Concurrency Handling

- **FastAPI**: Async endpoints, không block event loop
- **httpx.AsyncClient**: Tất cả HTTP calls đều async
- **asyncio.gather()**: Parallel calls trong `/trends/overview`, `/briefing/daily`
- **asyncio.Semaphore(8)**: Giới hạn 8 concurrent requests khi cào 80+ quốc gia
- **asyncio.sleep()**: Rate limit thủ công cho Last.fm (0.03-0.05s), MusicBrainz (1s)
- **DuckDuckGo**: `asyncio.to_thread()` vì DDGS là sync library


---

## 5. Phân tích Database/Data Layer

### 5.1 Thực trạng Data Layer

Hệ thống có **3 lớp persistence**, mỗi lớp có mục đích riêng:

| Layer | Technology | Dùng cho | Persist? |
|-------|-----------|----------|----------|
| Firebase Firestore | NoSQL Cloud | Last.fm chart cache, YouTube history | ✅ Cloud |
| File JSON | Local file | Map clustering results | ✅ Disk |
| In-memory dict | Python dict | Briefing cache, Gemini insight cache | ❌ Reset khi restart |

### 5.2 Firestore Schema

**Collection `cache`**:
```
cache/
└── global_top (document)
    ├── updated_at: Timestamp
    └── tracks: Array[{name, artist, playcount, listeners, source, source_url, rank}]
```
Được ghi bởi `scheduler.py::poll_lastfm_charts()` mỗi 6 giờ.
Được đọc bởi `routers/analysis.py::timeseries_global_charts()`.

**Collection `youtube_snapshots`** (thiết kế, chưa được ghi):
```
youtube_snapshots/
└── {track_name}_{artist} (document)
    └── history/ (subcollection)
        └── {timestamp} (document)
            ├── timestamp: Timestamp
            └── view_count: Number
```
Được đọc bởi `routers/analysis.py::timeseries_youtube()` nhưng **chưa có job nào ghi vào**.

### 5.3 SQLAlchemy Models (Legacy — không dùng)

`models/chart.py` và `models/trend.py` định nghĩa SQLAlchemy ORM models nhưng **không được import** ở bất kỳ router nào. `database.py` đã replace sang Firebase. Các models này là artifact từ thiết kế ban đầu dùng PostgreSQL.

```python
# chart.py — UNUSED
class ChartEntry(Base):     # chart_entries table
class TrackMetadata(Base):  # track_metadata table

# trend.py — UNUSED
class TrendSnapshot(Base):  # trend_snapshots table
class HitPrediction(Base):  # hit_predictions table
class DailyBriefing(Base):  # daily_briefings table
```

### 5.4 File Cache — `map_cache.json`

Format:
```json
{
  "data": [
    {
      "country": "vietnam",
      "iso_code": "VN",
      "cluster": 2,
      "cluster_label": "POP-dominant",
      "pca_x": 0.234,
      "pca_y": -1.456
    }
  ],
  "cluster_labels": {"0": "POP-dominant", "1": "ELECTRONIC-dominant", ...},
  "n_clusters": 6,
  "total_countries": 47,
  "source": "Deezer Chart + Last.fm Tags + K-Means Clustering"
}
```

File này **~17KB**, committed vào git repo. Refresh bằng `DELETE /api/map/clusters/cache` + `GET /api/map/clusters`.

### 5.5 In-memory Caches

**Briefing cache** (`briefing.py`):
```python
_cache: dict = {}  # {"2026-05-14": {briefing_result}}
```

**Gemini insight cache** (`gemini_service.py`):
```python
_insight_cache: dict[str, str] = {}
# Key: "2026-05-14:country_insight_VN" → insight text
```

**Genre distribution cache** (`analysis.py`):
```python
_genre_cache: dict[str, dict] = {}
# Key: "2026-05-14:20" → distribution result
```

---

## 6. API Analysis

### 6.1 Tất cả API Endpoints

| Method | Path | Router | Mô tả |
|--------|------|--------|-------|
| GET | `/health` | main.py | Health check |
| GET | `/api/charts/global` | charts | Last.fm global top (limit param) |
| GET | `/api/charts/country/{country}` | charts | Last.fm country top |
| GET | `/api/charts/spotify` | charts | Spotify Global Top 50 |
| GET | `/api/charts/spotify/viral` | charts | Spotify Viral 50 |
| GET | `/api/trends/tiktok` | trends | TikTok viral từ Deezer |
| GET | `/api/trends/viral` | trends | Reddit hot posts + sentiment |
| GET | `/api/trends/overview` | trends | Tổng hợp 3 nguồn |
| GET | `/api/trends/youtube/batch` | trends | YouTube stats cho top tracks |
| GET | `/api/trends/reddit-insight` | trends | Gemini phân tích Reddit post |
| GET | `/api/trends/youtube/search` | trends | Tìm MV YouTube |
| GET | `/api/trends/youtube/{video_id}` | trends | Stats + spike detection |
| GET | `/api/trends/spike/{track_name}` | trends | Viral score tổng hợp |
| GET | `/api/trends/explain/{track_name}` | trends | Gemini giải thích viral |
| GET | `/api/trends/reddit/search` | trends | Tìm bài đăng Reddit |
| GET | `/api/map/clusters` | map | K-Means clustering 80+ quốc gia |
| GET | `/api/map/country/{iso}/top` | map | Top tracks tại quốc gia |
| GET | `/api/map/country/{iso}/ai-insight` | map | Gemini insight quốc gia |
| DELETE | `/api/map/clusters/cache` | map | Xóa map cache |
| GET | `/api/prediction/artists/search` | prediction | Autocomplete nghệ sĩ |
| POST | `/api/prediction/` | prediction | Predict với features thủ công |
| POST | `/api/prediction/quick` | prediction | Auto-collect + predict |
| GET | `/api/prediction/top-candidates` | prediction | Top bài tiềm năng |
| GET | `/api/briefing/daily` | briefing | Daily briefing (cached) |
| GET | `/api/briefing/history` | briefing | Lịch sử 7 ngày |
| GET | `/api/analysis/distribution/genre` | analysis | Phân phối genre |
| GET | `/api/analysis/genre-comparison` | analysis | So sánh genre đa quốc gia |
| GET | `/api/analysis/timeseries/global-charts` | analysis | Lịch sử global chart |
| GET | `/api/analysis/timeseries/youtube/{track}` | analysis | Lịch sử YouTube views |
| GET | `/api/analysis/clustering/elbow` | analysis | Elbow method info |
| GET | `/api/analysis/insight/market-summary` | analysis | Market summary Gemini |
| POST | `/api/agent/chat` | agent | SSE streaming agent |
| GET | `/api/agent/tools` | agent | Liệt kê agent tools |

### 6.2 Request/Response Format

**Standard response pattern**:
```json
{
  "data": [...],
  "total": 50,
  "source": "Last.fm chart.getTopTracks",
  "source_url": "https://www.last.fm/charts"
}
```

**Error response** (Spotify):
```json
{
  "data": [],
  "reason": "premium_required",
  "message": "Playlist editorial yêu cầu owner có Premium..."
}
```

**Prediction response**:
```json
{
  "hit_probability": 72.3,
  "prediction": "Potential Hit",
  "confidence": "High",
  "model_used": "XGBoost",
  "track": "APT.",
  "artist": "Rosé"
}
```

**Agent SSE event types**:
```
data: {"type": "thought", "message": "Cần tìm data từ Last.fm"}
data: {"type": "tool_call", "name": "get_global_charts", "input": {"limit": 10}, "iteration": 1}
data: {"type": "tool_result", "name": "get_global_charts", "preview": "[{rank: 1, ...}]"}
data: {"type": "answer", "message": "Top chart toàn cầu hôm nay..."}
data: {"type": "done"}
```

### 6.3 Authentication

- **Backend**: Không có auth ở API level. CORS chỉ cho localhost.
- **Frontend**: Clerk.js authentication
  - Public routes: `/`, `/sign-in`, `/sign-up`, `/api/webhooks`
  - Protected routes: tất cả còn lại (`/dashboard`, `/map`, `/trends`, `/predict`, `/briefing`, `/chat`)
  - Middleware: `middleware.ts` dùng `clerkMiddleware` + `createRouteMatcher`

### 6.4 Middleware

**CORS** (backend): `allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?"`

**Clerk** (frontend `middleware.ts`):
```typescript
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);
export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) auth().protect();
});
```

---

## 7. Environment & Configuration

### 7.1 Backend `.env`

```env
GEMINI_API_KEY=AIzaSy...        # Google AI Studio key
FIREBASE_CERT_PATH=./firebase-cert.json  # Path tới service account JSON
LASTFM_API_KEY=20bd440e...      # Last.fm API key (miễn phí)
YOUTUBE_API_KEY=AIzaSyB...      # YouTube Data API v3 key (10K units/ngày)
REDDIT_USER_AGENT=MusicMonitor/1.0 by /u/username  # Bắt buộc cho Reddit
SPOTIFY_CLIENT_ID=7ac21b...     # Spotify app client ID
SPOTIFY_CLIENT_SECRET=1ade2d... # Spotify app client secret
```

**Đã bị comment** (không dùng):
```env
# REDDIT_CLIENT_ID=...     (không cần — dùng public JSON)
# REDDIT_CLIENT_SECRET=... (không cần)
```

### 7.2 Frontend `.env.local`

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/briefing
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/briefing
```

### 7.3 Runtime Modes

| Mode | Backend | Frontend |
|------|---------|----------|
| Dev | `uvicorn app.main:app --reload` | `npm run dev` |
| Docker | `docker-compose up` | Build + serve từ Docker |
| Prod | Render.com (uvicorn) | Vercel (Next.js) |

---

## 8. Dependency Analysis

### 8.1 Backend Dependencies (`requirements.txt`)

| Package | Version | Dùng để làm gì | Critical? |
|---------|---------|----------------|-----------|
| `fastapi` | 0.110.0 | Web framework, router, validation | ⭐⭐⭐ |
| `uvicorn[standard]` | 0.27.1 | ASGI server | ⭐⭐⭐ |
| `firebase-admin` | 6.4.0 | Firestore client | ⭐⭐⭐ |
| `httpx` | 0.27.0 | Async HTTP (Last.fm, YouTube, Reddit, Deezer) | ⭐⭐⭐ |
| `pydantic` | 2.6.3 | Request/response validation | ⭐⭐⭐ |
| `pydantic-settings` | 2.2.1 | `.env` loading | ⭐⭐ |
| `apscheduler` | 3.10.4 | Background polling job | ⭐⭐ |
| `google-generativeai` | 0.4.1 | Gemini API client | ⭐⭐⭐ |
| `spotipy` | 2.23.0 | Spotify API wrapper | ⭐⭐ |
| `praw` | 7.7.1 | Reddit API (installed nhưng dùng httpx trực tiếp) | ⭐ |
| `scikit-learn` | 1.4.2 | KMeans, PCA, IsolationForest | ⭐⭐⭐ |
| `xgboost` | 2.0.3 | Hit prediction model | ⭐⭐⭐ |
| `pandas` | 2.2.1 | DataFrame cho clustering | ⭐⭐ |
| `numpy` | 1.26.4 | Array ops, Z-score | ⭐⭐ |
| `vaderSentiment` | 3.3.2 | Reddit post sentiment | ⭐⭐ |
| `duckduckgo-search` | ≥6.0.0 | Web search tool cho agent | ⭐⭐ |
| `sse-starlette` | ≥2.0.0 | Server-Sent Events (installed nhưng agent dùng StreamingResponse) | ⭐ |
| `python-dotenv` | 1.0.1 | Load `.env` (dự phòng cho pydantic-settings) | ⭐ |

### 8.2 Frontend Dependencies (`package.json`)

| Package | Dùng để làm gì |
|---------|----------------|
| `next` 14 | App Router framework |
| `react` / `react-dom` | UI library |
| `typescript` | Type safety |
| `tailwindcss` | Utility CSS |
| `@clerk/nextjs` | Authentication |
| `recharts` | Charts (TrendChart, KpiCard, ...) |
| `leaflet` | Interactive map |
| `lucide-react` | Icons |
| `framer-motion` | Animation trong AgentChat |
| `next-themes` | Dark/light mode |
| `swr` | Data fetching + caching |

---

## 9. Startup Lifecycle

### 9.1 Backend Boot Sequence

```
1. Python import app.main
   → import routers (charts, trends, map, prediction, briefing, analysis, agent)
   → import services (lastfm, youtube, reddit, spotify, deezer)
   → import ai modules (gemini_service, clustering, hit_prediction, sentiment, ...)

2. Module-level initialization:
   → config.py: Settings() → đọc .env
   → database.py: firebase_admin.initialize_app() + firestore.client()
   → gemini_service.py: genai.configure(api_key) + GenerativeModel('gemini-3.1-flash-lite-preview')
   → agent.py: genai.configure() + GenerativeModel (riêng cho agent)
   → hit_prediction.py: joblib.load('models/hit_predictor.joblib') nếu file tồn tại
   → sentiment.py: SentimentIntensityAnalyzer() init

3. FastAPI startup event:
   → start_scheduler() → AsyncIOScheduler.start()
   → Thêm job: poll_lastfm_charts mỗi 6 giờ

4. Uvicorn ready → Accept requests
```

### 9.2 Frontend Boot Sequence

```
1. next dev / next build → compile TypeScript + Tailwind
2. Browser request → Next.js serve layout.tsx
3. layout.tsx render providers:
   ThemeProvider → AppClerkProvider → SWRProvider → Sidebar + {children}
4. Clerk middleware check → redirect nếu chưa login
5. Page component render → useEffect → fetch API → setState → render data
```

### 9.3 Shutdown Flow

- **Backend**: Ctrl+C → Uvicorn graceful shutdown → APScheduler.shutdown()
- **Mất data**: `_cache` dict (briefing), `_insight_cache` (Gemini) bị clear
- **Không mất**: Firestore data, `map_cache.json`

---

## 10. Execution Trace

### Trace: User nhập "APT." → Hệ thống xử lý → Trả kết quả

**Scenario**: User vào `/predict`, nhập "APT." của "Rosé" → Click Predict.

```
1. Frontend: quickPredict("APT.", "Rosé")
   → POST /api/prediction/quick
   → body: {"track_name": "APT.", "artist_name": "Rosé"}

2. prediction.py::quick_predict(req)
   │
   ├─ 2a. deezer.search_track("APT.", "Rosé", limit=1)
   │       → _get(f"{BASE}/search", {"q": 'track:"APT." artist:"Rosé"', "limit": 1})
   │       → Deezer API response: [{name: "APT.", artist: "Rosé", deezer_id: "xxx", image: "...", preview: "..."}]
   │       → Cập nhật req.track_name = "APT." (chuẩn hóa từ Deezer)
   │
   ├─ 2b. youtube.search_music_video("APT. Rosé official music video")
   │       → _yt_get("search", {q, type:"video", videoCategoryId:"10", maxResults:5})
   │       → Trả [{"video_id": "abc123", "title": "...", ...}]
   │
   ├─ 2c. youtube.get_video_stats("abc123")
   │       → _yt_get("videos", {part:"statistics,snippet", id:"abc123"})
   │       → stats = {view_count: 800_000_000, published_at: "2024-10-18T...", ...}
   │
   ├─ 2d. Tính decay_factor:
   │       days_old = (now - 2024-10-18).days ≈ 210 ngày
   │       decay_factor = 0.15  (100 < 210 < 365)
   │       mock_growth_24h = min(800M/1M * 12 * 0.15, 600) = min(1440, 600) = 600
   │
   ├─ 2e. reddit.search_artist_mentions("APT. Rosé", limit=30)
   │       → GET https://www.reddit.com/r/all/search.json?q=APT.+Rosé&sort=new&limit=30
   │       → reddit_mentions_24h = count_mentions_24h(posts)
   │
   ├─ 2f. lastfm.get_artist_tags("Rosé")
   │       → GET https://ws.audioscrobbler.com/2.0/?method=artist.getTopTags&artist=Rosé
   │       → tags = ["k-pop", "pop", "kpop", ...]
   │       → high_pop match: {"k-pop", "pop"} → 2 matches / 3 = 0.67 genre_popularity
   │
   ├─ 2g. hit_prediction.predict_hit_probability({
   │       youtube_growth_24h: 600,
   │       youtube_growth_48h: 1080,
   │       youtube_growth_7d: 3000,
   │       reddit_mentions_24h: 5,
   │       youtube_comments: 500000,
   │       genre_popularity: 0.67,
   │       ...
   │   })
   │   → build_features() → np.array([600, 1080, 3000, 5, 500000, 0, 0, 0.67, 0, 5, 0])
   │   → _model.predict_proba(features)[0][1] → 0.923
   │   → return {"hit_probability": 92.3, "prediction": "Potential Hit", "confidence": "High"}
   │
   └─ Return JSON:
      {
        "hit_probability": 92.3,
        "prediction": "Potential Hit",
        "confidence": "High",
        "model_used": "XGBoost",
        "track": "APT.",
        "artist": "Rosé",
        "metadata": {"image": "deezer_cover_url", "preview": "30s_preview_url"},
        "data_collected": {...},
        "sources": ["Deezer", "YouTube Data API v3", "Reddit API", "Last.fm"]
      }

3. Frontend nhận response → render HitCard với probability gauge
```

### Trace: User hỏi Agent "Bài hát hot nhất Việt Nam?"

```
1. Frontend AgentChat::send("Bài hát hot nhất Việt Nam?")
   → streamAgent(message, onEvent)
   → POST /api/agent/chat {message: "Bài hát hot nhất Việt Nam?"}

2. agent.py::run_agent("Bài hát hot nhất Việt Nam?")
   
   Iteration 1:
   → Gemini: {"thought": "Cần tìm top chart VN. Ưu tiên web search vì Last.fm data hạn chế",
               "action": "web_search",
               "input": {"query": "Bảng xếp hạng âm nhạc Việt Nam", "region": "vi-vn"}}
   → yield tool_call event
   → duckduckgo.web_search(...) → [{title, href, body}, ...]
   → yield tool_result event
   → history += "OBSERVATION: [{...}]"
   
   Iteration 2:
   → Gemini: {"thought": "Có kết quả web. Thêm data nội bộ",
               "action": "get_country_top",
               "input": {"country": "vietnam", "limit": 10}}
   → yield tool_call event
   → data_query.get_country_top("vietnam", 10)
     → lastfm.get_top_tracks_by_country("vietnam", 10)
     → [{rank:1, name:"...", artist:"..."}, ...]
   → yield tool_result event
   
   Iteration 3:
   → Gemini: {"thought": "Đủ thông tin để trả lời",
               "final_answer": "Top bài hát hot nhất Việt Nam..."}
   → yield answer event
   → yield done event

3. Frontend: onEvent xử lý mỗi event → update messages state → re-render
```


---

## 11. Những phần khó hiểu / Rủi ro

### 11.1 Technical Debt

| Vấn đề | File | Mức độ |
|--------|------|--------|
| SQLAlchemy models (`chart.py`, `trend.py`) không được dùng | `models/` | Thấp |
| `claude_narrative.py` — legacy file, đã có `gemini_service.py` thay thế nhưng file vẫn còn | `ai/claude_narrative.py` | Thấp |
| `praw` installed nhưng Reddit dùng httpx trực tiếp | `requirements.txt` | Thấp |
| `sse-starlette` installed nhưng agent dùng `StreamingResponse` thuần | `requirements.txt` | Thấp |
| 2 routes `GET /distribution/genre` trùng trong `analysis.py` (line 22 và 183) | `routers/analysis.py` | Trung bình |
| `docker-compose.yml` có postgres + redis nhưng backend không kết nối | `docker-compose.yml` | Trung bình |

### 11.2 Race Conditions

**Gemini rate limiter**: `_rate_lock = asyncio.Lock()` chỉ protect single-process. Nếu deploy multi-worker (`uvicorn --workers 4`), mỗi worker có lock riêng → 4 × 12 = 48 req/phút → vượt quota.

**Map cache**: Không có lock khi nhiều request đồng thời gọi `GET /map/clusters` lúc chưa có cache → nhiều request cùng crawl 80+ quốc gia đồng thời → rate limit Deezer/Last.fm.

### 11.3 Bug Risks

**Fake view history** trong spike detection:
```python
fake_history = [int(views * 0.55), int(views * 0.72), int(views * 0.88), views]
# Chỉ có 4 điểm, nhưng detect_view_spike_zscore cần ≥ 5 → luôn trả is_spike: False
```

**Duplicate route**: `analysis.py` có 2 functions đều `@router.get("/distribution/genre")`. FastAPI sẽ dùng route đăng ký đầu (line 22) — route thứ 2 (line 183) không bao giờ được gọi.

**YouTube growth "mock"**: `mock_growth_24h` là số ước tính từ total view count, không phải growth thực. Bài cũ nhiều view sẽ bị coi là "đang hot" dù đã phát hành từ lâu → decay_factor fix một phần nhưng vẫn không chính xác.

**top-candidates dùng fixed features**: Tất cả bài từ TikTok viral list đều nhận cùng `track_data = {youtube_growth_24h: 80, ...}` → prediction score giống nhau → thứ tự không có nghĩa thực sự.

### 11.4 Tight Coupling

- `briefing.py` import trực tiếp `_call_gemini` và `_insight_cache` từ `gemini_service.py` (private names) → fragile
- `agent.py` tạo model Gemini riêng, không tái sử dụng từ `gemini_service.py` → 2 connections Gemini
- `map.py` hardcode `CACHE_FILE = "map_cache.json"` relative path → phụ thuộc working directory khi chạy

### 11.5 Hidden Side Effects

- `database.py` được import → Firebase admin init ngay lập tức → cần `firebase-cert.json` valid, nếu không có thì **crash ngay khi startup**
- `hit_prediction.py` import → load `hit_predictor.joblib` vào RAM → ~240KB model luôn chiếm memory
- `sentiment.py` import → `SentimentIntensityAnalyzer()` tải VADER lexicon → slow import lần đầu

### 11.6 Bottlenecks

**`GET /map/clusters` lần đầu** (cold start):
- Crawl 80+ quốc gia × (Deezer + 6 Last.fm calls) ≈ 600+ HTTP requests
- asyncio.Semaphore(8) → ~60-90 giây
- Không có timeout cho toàn bộ operation → client có thể timeout trước

**Gemini rate limit**: 12 req/62s → agent dùng nhiều tool call → có thể chờ nhiều phút nếu cache miss và nhiều người dùng đồng thời.

### 11.7 Security Risks

**API keys trong `.env` bị committed**: File `backend/.env` chứa real API keys và đã bị committed vào git (thấy trong file system). Cần add vào `.gitignore` và rotate keys.

**Firebase cert committed**: `firebase-cert.json` là service account credentials — cực kỳ nhạy cảm, không nên commit.

**CORS localhost-only**: Tốt cho dev, nhưng cần nhớ thay trước khi deploy production.

---

## 12. Đề xuất Cải tiến

### 12.1 Architecture Improvements

1. **Worker separation**: Tách scheduler ra service riêng (Celery + Redis) tránh ảnh hưởng request handling
2. **Multi-worker safe rate limiting**: Dùng Redis-based rate limiter thay in-memory deque
3. **Map cache invalidation**: Dùng Redis TTL thay file JSON — auto expire sau 24h
4. **Remove dead code**: Xóa `models/chart.py`, `models/trend.py`, `claude_narrative.py`, `praw` dep

### 12.2 Bug Fixes Ưu tiên

```python
# Fix 1: spike detection cần ít nhất 5 điểm
fake_history = [int(views * r) for r in [0.4, 0.55, 0.68, 0.82, 0.93, 1.0]]

# Fix 2: duplicate route — xóa bỏ 1 trong 2
# analysis.py line 183: xóa function genre_distribution() thứ 2

# Fix 3: map cache race condition
_map_cache_lock = asyncio.Lock()
async with _map_cache_lock:
    if not os.path.exists(CACHE_FILE):
        # ... crawl
```

### 12.3 Performance Improvements

1. **Parallel country fetching trong map**: Tăng semaphore từ 8 → 15 với retry
2. **YouTube batch**: Cache video IDs của top tracks theo ngày tránh search lại
3. **Gemini cache**: Persist cache vào Firestore thay in-memory (survive restart)

### 12.4 Reliability Improvements

1. **Health check enriched**: Kiểm tra Firestore connection, model loaded, API keys valid
2. **Graceful degradation**: Mọi endpoint nên trả partial data thay 500 khi 1 source fail
3. **Briefing persistence**: Lưu briefing vào Firestore thay in-memory dict

### 12.5 Testing Strategy

```
Unit tests:
- sentiment.py: test với sample posts
- clustering.py: test với mock country_tags
- hit_prediction.py: test với mock features
- text_clean.py: test strip_markdown

Integration tests:
- Mock httpx để test services không cần real API
- Test router endpoints với TestClient

E2E:
- Playwright test các trang frontend với backend running
```

---

## 13. Knowledge Map

### 13.1 "Nếu muốn sửa feature X, đọc file nào?"

| Feature | Files cần đọc |
|---------|---------------|
| Thêm nguồn dữ liệu mới | `services/newservice.py` → `routers/trends.py` hoặc router phù hợp → `lib/api.ts` |
| Thay đổi clustering algorithm | `ai/clustering.py` → `routers/map.py::_build_country_tags()` |
| Thay đổi hit prediction features | `ai/hit_prediction.py::build_features()` → retrain Kaggle notebook |
| Thêm agent tool mới | `ai/tools/data_query.py` → `ai/agent.py::TOOLS` |
| Thay Gemini bằng model khác | `ai/gemini_service.py::_call_gemini()` + `ai/agent.py::_call_agent_model()` |
| Thêm trang mới | `frontend/src/app/newpage/page.tsx` + add vào `components/Sidebar.tsx::NAV_ITEMS` |
| Thêm API endpoint | Router file phù hợp + `frontend/src/lib/api.ts` |
| Sửa briefing format | `routers/briefing.py::_generate_briefing_with_gemini()` → `components/BriefingCard.tsx` |
| Sửa map colors/clusters | `components/WorldMap.tsx::CLUSTER_COLORS` + `routers/map.py::n_clusters` |
| Thêm quốc gia mới vào map | `routers/map.py::COUNTRY_MAP` + `services/deezer.py::COUNTRY_EDITORIAL_IDS` + `components/WorldMap.tsx::COUNTRY_COORDS` |
| Thay đổi scheduler interval | `scheduler.py::IntervalTrigger(hours=6)` |
| Sửa viral score formula | `ai/trend_detection.py::calculate_viral_score()` |

### 13.2 Critical Files (không được sửa bừa)

```
⭐⭐⭐ CRITICAL — thay đổi ảnh hưởng toàn hệ thống:
  backend/app/main.py         — router registration, startup
  backend/app/config.py       — tất cả API keys
  backend/app/database.py     — Firebase init (crash if wrong)
  backend/app/ai/gemini_service.py — rate limiting (quota risk)

⭐⭐ IMPORTANT — thay đổi ảnh hưởng nhiều feature:
  backend/app/routers/map.py       — COUNTRY_MAP (80+ countries)
  backend/app/services/deezer.py   — COUNTRY_EDITORIAL_IDS, SPECIAL_PLAYLISTS
  backend/app/ai/hit_prediction.py — feature schema (retrain if changed)
  frontend/src/lib/api.ts          — tất cả API calls
  frontend/src/middleware.ts       — auth protection
```

### 13.3 Dependency Graph (simplified)

```
main.py
├── routers/charts.py → services/lastfm.py, services/spotify.py
├── routers/trends.py → services/youtube.py, services/reddit.py
│                    → services/deezer.py, services/lastfm.py
│                    → ai/trend_detection.py, ai/sentiment.py
│                    → ai/gemini_service.py
├── routers/map.py   → services/deezer.py, services/lastfm.py
│                    → ai/clustering.py, ai/gemini_service.py
├── routers/prediction.py → ai/hit_prediction.py
│                         → services/deezer.py, services/youtube.py
│                         → services/reddit.py, services/lastfm.py
├── routers/briefing.py → services/lastfm.py, services/deezer.py
│                       → services/reddit.py, ai/sentiment.py
│                       → ai/gemini_service.py, ai/text_clean.py
├── routers/analysis.py → services/lastfm.py, services/deezer.py
│                       → ai/gemini_service.py, database.py
├── routers/agent.py → ai/agent.py
│                       → ai/tools/data_query.py → (all services)
│                       → ai/tools/duckduckgo.py
└── scheduler.py → services/lastfm.py, database.py

ai/gemini_service.py → ai/text_clean.py
ai/agent.py → ai/text_clean.py, ai/tools/*, config.py
```

### 13.4 Frontend Component Hierarchy

```
layout.tsx
├── ThemeProvider
├── AppClerkProvider (Clerk)
├── SWRProvider
├── Sidebar.tsx (navigation + auth)
└── {page}
    ├── /briefing → BriefingCard.tsx (lib/parseSection.ts, lib/cleanText.ts)
    ├── /dashboard → TrendChart.tsx, SourceBadge.tsx, RichText.tsx
    ├── /map → WorldMap.tsx (Leaflet, dynamic import)
    ├── /trends → TrendChart.tsx, SourceBadge.tsx + charts/*
    ├── /predict → HitCard.tsx, charts/PredictionRadar.tsx
    └── /chat → AgentChat.tsx (lib/agentClient.ts)
```

---

## 14. Frontend Chi tiết

### 14.1 Pages

**`/` — Landing Page** (`app/page.tsx`): Static page với gradient background, CTA button → `/briefing`. Không fetch API.

**`/briefing`** (`app/briefing/page.tsx`): Fetch `fetchDailyBriefing()`. Dùng `BriefingCard` component với 5 sections: overview, top_charts, tiktok, community, forecast. Có "Refresh" button gọi `force_refresh=true`.

**`/dashboard`** (`app/dashboard/page.tsx`, 402 lines — lớn nhất): Sequential fetch:
- `/api/charts/global` → Global Top 50 table
- `/api/trends/youtube/batch` → YouTube MV list (fallback: search từng bài)
- `/api/trends/viral` → Reddit posts + sentiment bar
- `/api/briefing/daily` → AI briefing text

**`/map`** (`app/map/page.tsx`): Fetch `fetchMapData()` → Render `WorldMap` với clusters. Click country → fetch `fetchCountryAiInsight(iso)` → hiển thị AI insight panel + top tracks.

**`/trends`** (`app/trends/page.tsx`): Fetch multiple endpoints, render charts từ `components/charts/*`:
- `ViralHeatmap` — TikTok viral intensity
- `GrowthArea` — YouTube growth area chart
- `SentimentGauge` — Reddit sentiment gauge
- `GenreDonut` — Genre distribution donut
- `TopChartsBar` — Top charts bar chart
- `KpiCardGrid` — KPI metric cards

**`/predict`** (`app/predict/page.tsx`): Form nhập tên bài + nghệ sĩ → `quickPredict()`. Hiển thị `PredictionRadar` chart + `HitCard` danh sách candidates từ `fetchTopCandidates()`.

**`/chat`** (`app/chat/page.tsx`): Render `AgentChat` component.

### 14.2 Key Components

**`WorldMap.tsx`**: Dynamic import Leaflet (tránh SSR issue). Dùng `useRef` cho map instance để tránh re-init. Theme-aware tile URLs (CARTO dark/light). `COUNTRY_COORDS` lookup table cho 80+ quốc gia.

**`AgentChat.tsx`**: Dùng `framer-motion` cho animation. `AbortController` để cancel stream khi user gửi tin mới. `TraceItem[]` hiển thị thought/tool_call/tool_result chain. `SUGGESTIONS` array cho quick-start prompts.

**`BriefingCard.tsx`**: Rich text rendering với `parseSectionText()` → `SectionBlock[]` (lead, para, list). `renderInline()` highlight quoted text và numbers. `fallbackSections()` khi `briefing_sections` không có.

**`lib/agentClient.ts`**: Manual SSE parser (không dùng `EventSource`). Buffer-based newline splitting cho `data: {...}\n\n` events.

**`lib/parseSection.ts`**: Parse AI-generated plain text thành blocks:
- `lead`: đoạn đầu tiên (font lớn hơn)
- `para`: đoạn thường, có thể có `label:` prefix → highlight
- `list`: dòng bắt đầu bằng số (1. 2. 3.) → ordered list với rank badge

