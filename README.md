# 🎵 Global Music Intelligence Monitor

> **Mục tiêu:** Xây dựng nền tảng web phân tích & dự đoán xu hướng âm nhạc toàn cầu theo real-time, tích hợp AI, có nguồn trích dẫn rõ ràng.

[![Video Demo](https://img.youtube.com/vi/KjsEracAcn4/0.jpg)](https://youtu.be/KjsEracAcn4)

**Video Demo:** [https://youtu.be/KjsEracAcn4](https://youtu.be/KjsEracAcn4)

---

## 🌟 TÍNH NĂNG CHÍNH

### 1. Global Music Map (Bản đồ âm nhạc toàn cầu)
- Trực quan hoá dữ liệu bản đồ thế giới bằng `Leaflet.js`.
- Phân cụm (Clustering) gu âm nhạc của các quốc gia bằng thuật toán K-Means.
- Cung cấp cái nhìn tổng quan về top bài hát thịnh hành ở từng vùng lãnh thổ.

### 2. Trending Now (Phân tích xu hướng)
- Phân tích và phát hiện các bài hát đang có tốc độ tăng trưởng cao (Viral).
- Biểu đồ theo dõi lượt xem trên YouTube, phân tích cảm xúc (Sentiment) từ Reddit.
- Tích hợp Isolation Forest để phát hiện các bài hát nổi lên bất thường.

### 3. Hit Prediction (Dự đoán bài hát Hit)
- Ứng dụng mô hình **XGBoost** để đánh giá xác suất một bài hát trở thành Hit.
- Explainable AI (XAI) tích hợp giúp giải thích rõ ràng lý do mô hình đưa ra dự đoán.

### 4. AI Daily Briefing (Bản tin thông minh)
- Tự động tổng hợp và tóm tắt các sự kiện, xu hướng âm nhạc bằng **Google Gemini AI**.
- Nguồn dữ liệu phong phú, minh bạch và có dẫn chứng rõ ràng.

---

## 🛠 CÔNG NGHỆ SỬ DỤNG

- **Frontend:** Next.js 14 (App Router), React, TailwindCSS, Recharts, Leaflet, Clerk (Xác thực).
- **Backend:** FastAPI (Python 3.11), Uvicorn, APScheduler.
- **AI/ML:** XGBoost, Scikit-learn, Google Gemini AI.
- **Database:** Firebase Firestore (Google Cloud).
- **Deployment:** Vercel (Frontend), Render.com (Backend).

---

## 📁 CẤU TRÚC THƯ MỤC

```text
Music-Monitor/
├── backend/
│   ├── app/                 # Mã nguồn FastAPI (routers, services, ai, database)
│   ├── requirements.txt     # Các thư viện Python
│   ├── firebase-cert.json   # (Chứa key Firebase - Gitignored)
│   └── .env                 # (Chứa API keys - Gitignored)
├── frontend/
│   ├── src/app/             # Giao diện Next.js
│   ├── package.json         # Các thư viện Node.js
│   └── .env.local           # (Chứa biến Clerk & Backend URL - Gitignored)
├── docs/                    # Tài liệu yêu cầu đồ án
├── kaggle/                  # Notebook EDA & huấn luyện mô hình
├── report/                  # Báo cáo kỹ thuật (LaTeX)
├── slides/                  # Slide thuyết trình
└── docker-compose.yml       # Cấu hình Docker cho toàn bộ hệ thống
```

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN TẠI LOCAL

### 1. Yêu cầu hệ thống (Prerequisites)
Để hệ thống hoạt động đầy đủ, bạn cần đăng ký các API Keys và đặt vào file môi trường:
- **Clerk:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` và `CLERK_SECRET_KEY` (Cho Frontend).
- **Firebase:** Cấp quyền Service Account và lưu file `firebase-cert.json` (Cho Backend).
- **Các API thu thập dữ liệu (Cho Backend):** `GEMINI_API_KEY`, `LASTFM_API_KEY`, `YOUTUBE_API_KEY`, `REDDIT_CLIENT_ID`, `SPOTIFY_CLIENT_ID`, v.v...

### 2. Cách khởi chạy nhanh bằng Docker Compose (Khuyên dùng)
Cách đơn giản nhất để khởi chạy đồng bộ cả Frontend và Backend.

```bash
# Đảm bảo bạn đã điền đủ .env ở backend và .env.local ở frontend
docker-compose up --build
```
- Frontend truy cập tại: `http://localhost:3000`
- Backend API truy cập tại: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`

### 3. Cách khởi chạy độc lập (Manual)

**Khởi chạy Backend (FastAPI)**
```bash
cd backend
python -m venv venv
source venv/bin/activate          # (Windows: venv\Scripts\activate)
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Khởi chạy Frontend (Next.js)**
```bash
cd frontend
npm install
npm run dev
```

---

## 👨‍💻 THÔNG TIN

*Đồ án môn học: Global Music Intelligence Monitor - Phân tích Dữ liệu Thông minh - Tháng 6, 2026*
