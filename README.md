# 🎵 Global Music Intelligence Monitor

Nền tảng web phân tích & dự đoán xu hướng âm nhạc toàn cầu theo real-time.

## Tech Stack
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, Recharts, Leaflet.js
- **Backend:** FastAPI (Python), PostgreSQL, Redis, APScheduler
- **AI:** K-Means Clustering, XGBoost, VADER Sentiment, Claude API
- **Data:** Last.fm, YouTube Data API, Reddit OAuth, MusicBrainz, Spotify

## Chạy nhanh (Docker)

```bash
cp .env.example .env      # Điền API keys
docker-compose up --build