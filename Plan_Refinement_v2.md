# Plan Tinh Chỉnh v2 — Slides World Music Intelligence Monitor

> **Triết lý:** Chuyển từ "research deck" → **"project showcase deck"**.
> Áp dụng TRIZ #2 (Tách riêng), #15 (Linh động hóa), #35 (Thay đổi thông số): tách sơ đồ cứng → thay ảnh demo thật. Slide trở thành "cửa sổ nhìn vào sản phẩm".

---

## 1. Tổng quan thay đổi

| # | Thay đổi | Nguyên tắc |
|---|----------|------------|
| 1 | **Tông màu sáng hơn** — nền `mlight` cho frametitle | TRIZ #35 — tăng luminance |
| 2 | **Slide 2 (Tổng Quan):** bỏ sơ đồ, thay 2 ảnh Bright & Dark mode | TRIZ #15 |
| 3 | **Thêm Slide "Hồ Sơ Cá Nhân"** sau Bảo Mật | Canva có, LaTeX thiếu |
| 4 | **Slide EDA → "Trực Quan Hóa & Phân Tích"** — bỏ pgfplots, chừa ảnh | TRIZ #2 |
| 5 | **Thêm Slide "Phân Phối Dữ Liệu"** sau Trực Quan Hóa | Canva có slide riêng |
| 6 | **Slide Social Listening:** bỏ sơ đồ TikZ → ảnh thật | TRIZ #15 |
| 7 | **Slide AI Chat:** bỏ sơ đồ ReAct → ảnh chat thật | TRIZ #15 |
| 8 | **Bỏ bớt `accentbox` cam** không cần thiết | Giảm noise thị giác |
| 9 | **Slide Predict, Giải Thích & AI Chat:** thêm ảnh web thay sơ đồ | TRIZ #15 |

---

## 2. Bảng màu mới — "Music Bright"

```latex
\definecolor{mprimary}{HTML}{6C3FC0}   % Violet sáng hơn
\definecolor{maccent}{HTML}{FF9F1C}    % Amber ấm
\definecolor{mgood}{HTML}{2EC4B6}      % Teal sáng
\definecolor{mbad}{HTML}{E5484D}       % Coral (giữ)
\definecolor{mgray}{HTML}{8E8E9A}      % Neutral gray
\definecolor{mdark}{HTML}{2D2640}      % Aubergine nhạt hơn
\definecolor{mlight}{HTML}{F5F0FF}     % Lavender nhạt — nền frametitle MỚI
\definecolor{mlightgold}{HTML}{FFF4E0}
\definecolor{mlightsage}{HTML}{E6F8F5}
\definecolor{mlightred}{HTML}{FDE8E8}
```

**Đổi beamercolor (tùy chọn):**
```latex
\setbeamercolor{frametitle}{bg=mlight, fg=mprimary}  % Nền sáng, chữ violet
```

> Nếu đổi frametitle sáng thì cần verify contrast toàn bộ. Giữ `mdark` nếu bạn prefer.

---

## 3. Cấu trúc slide mới (20 slide)

```
Slide 0   [plain]   Title
Slide 1             Outline — 5 chặng
─── §1  TỔNG QUAN & KIẾN TRÚC ──────────────────────
Slide 2             Tổng Quan (2 ảnh Bright+Dark)        ← ĐỔI
Slide 3             Kiến Trúc Hệ Thống (giữ TikZ)
Slide 4             Data Pipeline (giữ TikZ)
Slide 5             Bảo Mật & Định Danh (giữ)
Slide 6             Hồ Sơ Cá Nhân (MỚI)                 ← MỚI
─── §2  THU THẬP & TRỰC QUAN HÓA ───────────────────
Slide 7             Dashboard (giữ — screenshot)
Slide 8             Daily Briefing & Cảm Xúc (giữ)
Slide 9             Trực Quan Hóa & Phân Tích (ĐỔI)     ← ĐỔI
Slide 10            Phân Phối Dữ Liệu (MỚI)             ← MỚI
─── §3  PHÂN TÍCH THÔNG MINH ───────────────────────
Slide 11            World Map — Phân Cụm K-Means (giữ)
Slide 12            Trending — Phát Hiện Viral (giữ)
Slide 13            Social Listening (ĐỔI — ảnh)         ← ĐỔI
─── §4  DỰ ĐOÁN & AI AGENT ─────────────────────────
Slide 14            Hit Prediction (ĐỔI — ảnh)           ← ĐỔI
Slide 15            Giải Thích Dự Đoán (ĐỔI — ảnh)      ← ĐỔI
Slide 16            AI Chat (ĐỔI — ảnh)                  ← ĐỔI
─── §5  ĐÁNH GIÁ & KẾT LUẬN ───────────────────────
Slide 17            Điểm Mạnh & Hạn Chế (giữ)
Slide 18            Hướng Phát Triển (giữ)
Slide 19  [plain]   Cảm Ơn — QA & Demo (giữ)
```

**Tổng: 20 slide** (+2 mới: Hồ Sơ Cá Nhân + Phân Phối Dữ Liệu).

---

## 4. Chi tiết từng slide thay đổi

### 4.1 Slide 2 — Tổng Quan (ĐỔI HOÀN TOÀN)

**Bỏ:** sơ đồ TikZ before→after, badbox, goodbox.

**Thay bằng:**
- **Trái (~50%):** 4 bullet mô tả (theo Canva):
  - Global Music Intelligence: phân tích realtime
  - Đa tính năng: Dashboard, World Map, Prediction
  - Đa nguồn: YouTube, Spotify, Last.fm, Reddit
  - AI đích thực: Gemini tích hợp hệ thống
- **Phải (~48%):** 2 `\imgplaceholder` xếp dọc
  - `% [IMG] overview-bright.png`
  - `% [IMG] overview-dark.png`
  - Caption: "Bright & Dark Mode"
- Takeaway giữ, rút gọn.

### 4.2 Slide 6 — Hồ Sơ Cá Nhân (MỚI)

**Layout:** 2 cột.
- **Trái (~48%):** `\imgplaceholder` ảnh Profile page
  - `% [IMG] profile-page.png`
- **Phải (~48%):** 3 bullet:
  - Quản trị hồ sơ toàn diện (User Management Portal)
  - Quản lý định danh liên kết (Connected Accounts)
  - Mở rộng phân quyền RBAC (Future-proof)
- Takeaway: "Nền móng người dùng sẵn sàng mở rộng — từ đăng nhập đến phân quyền."

### 4.3 Slide 9 — Trực Quan Hóa & Phân Tích (ĐỔI TỪ EDA)

**Bỏ:** toàn bộ pgfplots code, accentbox.

**Thay bằng:**
- **Trái (~48%):** `\imgplaceholder`
  - `% [IMG] visualization-analysis.png`
- **Phải (~48%):** Bullet:
  - Multi-source: Last.fm → Top Tracks & phân phối thể loại
  - YouTube → Time-series View (6 ngày)
  - Deezer TikTok → Viral Ranking Heatmap
  - Hit Prediction \& Giải Thích Dự Đoán: Radar Chart

### 4.4 Slide 10 — Phân Phối Dữ Liệu (MỚI)

- **Trái (~55%):** `\imgplaceholder`
  - `% [IMG] pareto-distribution.png`
- **Phải (~43%):** Bullet:
  - Pareto Distribution (Long-tail): Top 1 áp đảo, quy luật 80/20
  - Cross-platform: YouTube Views & Likes, Reddit Upvotes & Comments
  - Sentiment Bar: Tích cực / Tiêu cực → cảnh báo sớm

### 4.5 Slide 13 — Social Listening (ĐỔI)

**Bỏ:** sơ đồ TikZ, primarybox, goodbox.

**Thay bằng:**
- **Trái (~55%):** `\imgplaceholder`
  - `% [IMG] social-listening.png`
- **Phải (~43%):** Bullet:
  - Multi-subreddit: r/Music, r/kpop, r/hiphopheads
  - VADER NLP → Pos/Neu/Neg + Mentions 24h
  - Gemini Contextual AI Insight (4 mục)

### 4.6 Slide 14 — Hit Prediction (ĐỔI)

**Bỏ:** sơ đồ TikZ pipeline, accentbox.

**Thay bằng:**
- **Trái (~55%):** `\imgplaceholder`
  - `% [IMG] predict-page.png`
- **Phải (~43%):** 4 bullet (Canva):
  - Model Deployment: XGBoost dự đoán realtime
  - Feature Pipeline: Tự động crawl từ 4 API
  - Dự đoán Xác suất: Output % + Risk tier
  - Đa phương tiện: Preview bài hát trên web

### 4.7 Slide 15 — Giải Thích Dự Đoán (ĐỔI)

**Bỏ:** radar TikZ, sơ đồ dọc, primarybox, goodbox.

**Thay bằng:**
- **Trái (~55%):** `\imgplaceholder`
  - `% [IMG] explainable-ai.png`
- **Phải (~43%):** 4 bullet:
  - Chuyển hóa kết quả → phân tích ngữ nghĩa
  - Radar 5 trục: Memeability, Hook, Danceability, Lyrics, Shock
  - AI Phiên dịch: Gemini đọc trọng số XGBoost
  - Đề xuất hành động cho người dùng

### 4.8 Slide 16 — AI Chat (ĐỔI)

**Bỏ:** sơ đồ ReAct TikZ, accentbox.

**Thay bằng:**
- **Trái (~55%):** `\imgplaceholder`
  - `% [IMG] chat-page.png`
- **Phải (~43%):** 3 bullet (Canva):
  - Reasoning + Acting: Agent suy luận + tự gọi tool
  - Graceful Error Handling: tự chuyển Internal Knowledge
  - Truy vấn tự nhiên: tương tác dữ liệu bằng ngôn ngữ

---

## 5. Accentbox cần bỏ

| Slide | Bỏ/Giữ | Lý do |
|-------|---------|-------|
| 2 (Tổng Quan) | BỎ | Thay bằng ảnh |
| 9 (Trực Quan Hóa) | BỎ | Không còn pgfplots |
| 12 (Trending) | GIỮ | "Tại sao viral?" là feature quan trọng |
| 14 (Predict) | BỎ | Đã có ảnh thay thế |
| 16 (AI Chat) | BỎ | Đã có ảnh thay thế |

---

## 6. Danh sách ảnh cần chụp (11 ảnh)

| Slide | Tên file | Nội dung | Bắt buộc |
|-------|----------|----------|----------|
| 2 | `overview-bright.png` | Trang chủ Light mode | ✅ |
| 2 | `overview-dark.png` | Trang chủ Dark mode | ✅ |
| 6 | `profile-page.png` | Trang Clerk User Management | ✅ |
| 7 | `dashboard-fullpage.png` | Full trang /dashboard | ✅ giữ |
| 9 | `visualization-analysis.png` | Giao diện trực quan hóa | ✅ |
| 10 | `pareto-distribution.png` | Biểu đồ Pareto | ✅ |
| 11 | `worldmap-page.png` | Bản đồ Leaflet | ✅ giữ |
| 13 | `social-listening.png` | Trang Social Listening | ✅ |
| 14 | `predict-page.png` | Form predict + kết quả | ✅ |
| 15 | `explain-predict.png` | Radar + giải thích | ✅ |
| 16 | `chat-page.png` | Agent chat với trace | ✅ |

---

## 7. Slide KHÔNG thay đổi

| Slide | Tên | Lý do |
|-------|-----|-------|
| 0 | Title | Đã đẹp |
| 1 | Outline | Cập nhật nếu số chặng đổi |
| 3 | Kiến Trúc | Sơ đồ 4 tầng — cần TikZ |
| 4 | Data Pipeline | Flow dữ liệu — cần TikZ |
| 5 | Bảo Mật | Auth flow — cần TikZ |
| 7 | Dashboard | Đã dùng `\imgplaceholder` |
| 8 | Daily Briefing | Pipeline VADER→Gemini — giữ |
| 11 | World Map | Ảnh + mini-flow — giữ |
| 12 | Trending | Viral score flow — giữ |
| 17 | Điểm Mạnh | 2 cột box — đã tốt |
| 18 | Hướng Phát Triển | Roadmap TikZ — giữ |
| 19 | Cảm Ơn | Plain slide — giữ |

---

## 8. Thứ tự thực hiện (Batch)

| Batch | Nội dung | Phạm vi |
|-------|----------|---------|
| A | Đổi palette "Music Bright" + beamercolor | Preamble |
| B | ĐỔI Slide 2 (Tổng Quan) | Chỉ slide 2 |
| C | THÊM Slide 6 (Hồ Sơ Cá Nhân) | Insert, dịch số |
| D | ĐỔI Slide 9 (EDA→Trực Quan Hóa) + THÊM Slide 10 | Dịch số |
| E | ĐỔI Slide 13, 14, 15, 16 | Nội dung |
| F | Bỏ accentbox thừa | Nhẹ |
| G | Cập nhật Outline (slide 1) | Slide 1 |
| H | Compile + audit cuối | Toàn bộ |

> ⚠️ Batch C và D thêm slide → số slide sau bị dịch. Cần cẩn thận.

---

## 9. Constraint giữ nguyên

- Frame title ≤ 46 ký tự
- Mỗi slide nội dung có 1 takeaway (trừ 0, 1, 19)
- Takeaway ≤ 90 ký tự
- Mọi ảnh: `\imgplaceholder` + comment `% [IMG]`
- Compile: `xelatex` 2 lần, 0 error
- Tiếng Việt: fontspec + DejaVu Sans
