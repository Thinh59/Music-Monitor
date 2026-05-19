# 🎵 Global Music Intelligence Monitor
> **Mục tiêu:** Xây dựng nền tảng web phân tích & dự đoán xu hướng âm nhạc toàn cầu theo real-time, tích hợp AI, có nguồn trích dẫn rõ ràng.

---

## 📁 CẤU TRÚC THƯ MỤC

```
music-monitor/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI entrypoint
│   │   ├── config.py                # Biến môi trường, API keys
│   │   ├── database.py              # Kết nối PostgreSQL & Redis
│   │   ├── scheduler.py             # APScheduler polling jobs
│   │   ├── routers/
│   │   │   ├── charts.py            # Endpoint: top charts
│   │   │   ├── trends.py            # Endpoint: trending songs
│   │   │   ├── map.py               # Endpoint: music taste map
│   │   │   ├── prediction.py        # Endpoint: hit prediction
│   │   │   └── briefing.py          # Endpoint: daily AI briefing
│   │   ├── services/
│   │   │   ├── lastfm.py            # Last.fm API client
│   │   │   ├── youtube.py           # YouTube Data API client
│   │   │   ├── reddit.py            # Reddit OAuth client
│   │   │   ├── musicbrainz.py       # MusicBrainz client
│   │   │   └── spotify.py           # Spotify Web API client
│   │   ├── ai/
│   │   │   ├── clustering.py        # K-Means taste clustering
│   │   │   ├── trend_detection.py   # Z-score / Isolation Forest
│   │   │   ├── hit_prediction.py    # XGBoost hit predictor
│   │   │   ├── sentiment.py         # VADER sentiment analysis
│   │   │   └── gemini_service.py    # Gemini API narrative gen
│   │   └── models/
│   │       ├── chart.py             # SQLAlchemy models
│   │       └── trend.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx             # Dashboard chính
│   │   │   ├── map/page.tsx         # Global Music Map
│   │   │   ├── trends/page.tsx      # Trending Now
│   │   │   ├── predict/page.tsx     # Hit Prediction
│   │   │   └── briefing/page.tsx    # Daily AI Briefing
│   │   ├── components/
│   │   │   ├── WorldMap.tsx         # Leaflet.js bản đồ
│   │   │   ├── TrendChart.tsx       # Recharts line chart
│   │   │   ├── ChartTable.tsx       # Top charts table
│   │   │   ├── HitCard.tsx          # Predicted hit card
│   │   │   ├── BriefingCard.tsx     # AI briefing display
│   │   │   └── SourceBadge.tsx      # Nguồn dữ liệu badge
│   │   ├── lib/
│   │   │   └── api.ts               # Fetch wrapper
│   │   └── types/
│   │       └── index.ts
│   ├── package.json
│   ├── next.config.js
│   └── Dockerfile
├── kaggle/
│   └── music_monitor_eda.ipynb      # EDA & train models trên Kaggle
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🔑 BƯỚC 0: ĐĂNG KÝ API KEYS

### 0.1 Last.fm API Key (Miễn phí)
1. Vào https://www.last.fm/api/account/create
2. Điền form → nhận `API_KEY` ngay
3. Lưu vào `.env`: `LASTFM_API_KEY=your_key`

### 0.2 YouTube Data API v3 (Miễn phí, 10.000 units/ngày)
1. Vào https://console.cloud.google.com
2. Tạo project mới → Enable **YouTube Data API v3**
3. Credentials → Create → API Key
4. Lưu: `YOUTUBE_API_KEY=your_key`

### 0.3 Reddit OAuth (Miễn phí, 100 req/phút)
1. Vào https://www.reddit.com/prefs/apps → Create App
2. Chọn **script**, điền redirect_uri: `http://localhost:8080`
3. Lưu: `REDDIT_CLIENT_ID=...` và `REDDIT_CLIENT_SECRET=...`

### 0.4 Spotify Web API (Miễn phí)
1. Vào https://developer.spotify.com/dashboard → Create App
2. Lưu: `SPOTIFY_CLIENT_ID=...` và `SPOTIFY_CLIENT_SECRET=...`

### 0.5 Anthropic Claude API
1. Vào https://console.anthropic.com → API Keys → Create
2. Lưu: `ANTHROPIC_API_KEY=sk-ant-...`

### 0.6 File `.env` hoàn chỉnh
```env
# Last.fm
LASTFM_API_KEY=your_lastfm_key

# YouTube
YOUTUBE_API_KEY=your_youtube_key

# Reddit
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=MusicMonitor/1.0 by YourUsername

# Spotify
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Anthropic
ANTHROPIC_API_KEY=sk-ant-your_key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/musicdb
REDIS_URL=redis://localhost:6379

# App
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

---

## 🐍 BƯỚC 1: BACKEND (FastAPI + Python)

### 1.1 Cài đặt môi trường Python

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Linux/Mac
# hoặc: venv\Scripts\activate    # Windows

pip install -r requirements.txt
```

**`requirements.txt`:**
```
fastapi==0.110.0
uvicorn[standard]==0.27.1
sqlalchemy==2.0.28
asyncpg==0.29.0
redis==5.0.1
httpx==0.27.0
pydantic==2.6.3
pydantic-settings==2.2.1
apscheduler==3.10.4
spotipy==2.23.0
praw==7.7.1
anthropic==0.21.3
scikit-learn==1.4.1
xgboost==2.0.3
pandas==2.2.1
numpy==1.26.4
vaderSentiment==3.3.2
python-dotenv==1.0.1
psycopg2-binary==2.9.9
```

### 1.2 Chạy Backend

```bash
cd backend
venv\Scripts\activate

# Lần đầu: tạo database
python -c "from app.database import Base, engine; import asyncio; asyncio.run(Base.metadata.create_all(engine))"

# Chạy server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Truy cập: http://localhost:8000/docs — Swagger UI tự động

---

## ⚛️ BƯỚC 2: FRONTEND (Next.js + React)

### 2.1 Khởi tạo project

```bash
npx create-next-app@latest frontend --typescript --tailwind --app
cd frontend
npm install recharts leaflet react-leaflet axios @types/leaflet
```

### 2.2 Chạy Frontend

```bash
cd frontend
npm run dev
```

Truy cập: http://localhost:3000

---

---

## 🐳 BƯỚC 3: DOCKER & CHẠY TOÀN HỆ THỐNG

### Chạy toàn hệ thống

```bash
# Clone repo / vào thư mục dự án
cd music-monitor

# Copy .env
cp .env.example .env
# Điền API keys vào .env

# Build và chạy tất cả services
docker-compose up --build

# Lần sau (đã build rồi):
docker-compose up

# Dừng:
docker-compose down
```

**URL sau khi chạy:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Swagger docs: http://localhost:8000/docs

---

## 🧪 BƯỚC 4: KIỂM TRA TỪNG API

```bash
# Test Last.fm — Global charts
curl http://localhost:8000/api/charts/global?limit=5

# Test Last.fm — Vietnam charts
curl http://localhost:8000/api/charts/country/vietnam

# Test Reddit trending
curl http://localhost:8000/api/trends/viral?subreddit=Music

# Test Hit Prediction
curl -X POST http://localhost:8000/api/prediction/ \
  -H "Content-Type: application/json" \
  -d '{"youtube_growth_24h": 250, "reddit_mentions_24h": 45, "lastfm_listeners": 200000, "genre_popularity": 0.8, "artist_playcount": 5000000}'

# Test Daily Briefing (gọi Claude API)
curl http://localhost:8000/api/briefing/daily

# Health check
curl http://localhost:8000/health
```

---

## 🌐 BƯỚC 6: DEPLOY LÊN INTERNET (Miễn phí)

### 6.1 Deploy Backend — Render.com

1. Push code lên GitHub
2. Vào https://render.com → New → Web Service
3. Connect GitHub repo → chọn thư mục `backend`
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Thêm Environment Variables từ `.env`

### 6.2 Deploy Frontend — Vercel

```bash
cd frontend
npx vercel --prod
# Theo hướng dẫn, thêm env NEXT_PUBLIC_BACKEND_URL=https://your-backend.onrender.com
```

### 6.3 Database — Neon.tech (PostgreSQL free)

1. Vào https://neon.tech → Tạo project
2. Copy connection string → thay vào `DATABASE_URL` trong Render env vars

---

## 📊 BƯỚC 7: CÁC TRANG CHI TIẾT

### Trang Global Music Map (`/map`)
- Dùng `react-leaflet` + `Leaflet.js`
- Hiển thị bản đồ thế giới
- Mỗi quốc gia tô màu theo cluster gu âm nhạc (từ K-Means)
- Click vào quốc gia → popup Top 5 bài hát kèm SourceBadge

### Trang Trending (`/trends`)
- Bảng bài hát đang viral theo điểm viral_score
- Biểu đồ Recharts: YouTube view growth theo giờ
- Sentiment bar: % positive / negative comments
- Mỗi bài có badge nguồn: YouTube + Reddit

### Trang Hit Prediction (`/predict`)
- Form nhập tên bài hát → tự tìm data qua API
- Hiển thị Hit Probability (0-100%) dạng gauge chart
- Bảng top 10 predicted hits tuần tới

### Trang Daily Briefing (`/briefing`)
- Báo cáo AI sinh tự động mỗi ngày lúc 6:00 AM
- Hiển thị timestamp + sources
- Button "Refresh" gọi lại Claude API

---

## ✅ CHECKLIST HOÀN THIỆN

```
[ ] Đăng ký đủ 5 API keys
[ ] Backend chạy được tại localhost:8000
[ ] Swagger docs hiển thị đúng tại /docs
[ ] Frontend chạy tại localhost:3000
[ ] Global charts load từ Last.fm
[ ] Country charts load đúng (test với "vietnam", "japan")
[ ] Reddit trending hoạt động
[ ] Daily Briefing gọi Claude API thành công
[ ] Hit Prediction trả về probability
[ ] Docker Compose chạy toàn bộ hệ thống
[ ] SourceBadge hiển thị nguồn trên mọi card
[ ] Kaggle notebook EDA hoàn chỉnh
[ ] Model XGBoost đã train và upload vào backend/models/
[ ] Deploy backend lên Render
[ ] Deploy frontend lên Vercel
```

---

## 🔗 TÀI LIỆU THAM KHẢO

| Nguồn | URL | Ghi chú |
|-------|-----|---------|
| Last.fm API | https://www.last.fm/api | Miễn phí, không cần OAuth |
| YouTube Data API | https://developers.google.com/youtube/v3 | 10K units/day free |
| Reddit API | https://www.reddit.com/dev/api | OAuth, 100 req/min |
| Spotify API | https://developer.spotify.com/documentation/web-api | OAuth, Client Credentials |
| MusicBrainz API | https://musicbrainz.org/doc/MusicBrainz_API | Hoàn toàn miễn phí |
| Anthropic Claude | https://docs.anthropic.com | Cần API key trả phí |
| FastAPI | https://fastapi.tiangolo.com | Backend Python |
| Next.js | https://nextjs.org/docs | Frontend React |
| Recharts | https://recharts.org | Charts |
| React Leaflet | https://react-leaflet.js.org | Bản đồ |
| scikit-learn | https://scikit-learn.org | K-Means, Isolation Forest |
| XGBoost | https://xgboost.readthedocs.io | Hit Prediction model |
| VADER Sentiment | https://github.com/cjhutto/vaderSentiment | Sentiment analysis |

---
## VIDEO DEMO
https://youtu.be/KjsEracAcn4
---

*Đồ án: Global Music Intelligence Monitor — Phân tích Dữ liệu Thông minh — Tháng 4, 2026*
