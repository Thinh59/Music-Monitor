# Plan chi tiết — Slides thuyết trình **World Music Intelligence Monitor**

> **Môn:** Phân tích Dữ liệu Thông minh (SmartDA) · Nhóm **SonicT2All**
> **Đề tài:** Web app phân tích & cập nhật bản tin âm nhạc toàn cầu theo thời gian thực.
> **File template:** `slides_main.tex` (Beamer + Metropolis + TikZ, 16:9, 9pt) — **đổi tông màu** sang bảng "Music Vibrant" (xem §B.1).
> **File đích:** `slides_music_monitor.tex` — compile bằng **xelatex** (2 lần).
>
> Tài liệu này KHÔNG chứa code LaTeX hoàn chỉnh; nó mô tả thiết kế, layout, nội dung, số liệu của từng slide — đủ chi tiết để agent (Gemini 3 Antigravity) tự ráp bằng beamer/TikZ/pgfplots mà **không cần đọc lại** `understand_music_monitor.md`. Toàn bộ số liệu cần dùng nằm ở **§E — Kho dữ liệu nội dung**.

---

## PHẦN A — Triết lý & nguyên tắc trình bày

### A.1 Bối cảnh

Đây là đồ án web app, KHÔNG phải báo cáo paper nghiên cứu. Vì vậy slide phải:
- **Trông như một sản phẩm công nghệ**, không như một bài lecture. Tông màu sống động (violet + cam), bố cục thoáng, nhiều ảnh chụp giao diện thật.
- **Lấy sơ đồ + ảnh làm trung tâm.** Mỗi slide nội dung có 1 visual anchor (sơ đồ TikZ HOẶC ảnh screenshot HOẶC pgfplots).
- **Ít chữ.** Chữ chỉ để chú thích cho hình. Slide là "tấm bảng chỉ đường", không phải "trang tài liệu".

Bài thuyết trình ~20 phút, **18 slide** (1 title + 1 outline + 15 nội dung + 1 cảm ơn), chia **5 chặng**.

### A.2 Tinh thần thiết kế — 5 nguyên tắc

1. **Một-ý-một-slide.** Mỗi slide trả lời đúng 1 câu hỏi. Mỗi slide nội dung kết bằng 1 dòng `\takeaway{}` (≤ 90 ký tự) — câu khẳng định ngắn.
2. **Hình > Chữ.** Mọi slide nội dung (2–16) có ít nhất 1 visual anchor. Chữ phục vụ hình, không ngược lại.
3. **Nhịp sản phẩm.** Slide kể chuyện theo luồng người dùng thật: *Tổng quan → Thu thập & trực quan hóa → Phân tích thông minh → Dự đoán & Agent → Đánh giá*. Người nghe cảm giác đang được "tour" qua sản phẩm.
4. **Phân lớp màu nhất quán theo vai trò** (xem A.3).
5. **Ảnh thật, không bịa.** Mọi screenshot của web app được chèn bằng macro `\imgplaceholder{...}` (§B.4) — agent KHÔNG tự "vẽ lại" UI bằng TikZ. Người làm slide sẽ thay ảnh thật sau.

### A.3 Phối màu theo vai trò ("Music Vibrant")

| Màu | Vai trò ngữ nghĩa | Ví dụ dùng ở đâu |
|---|---|---|
| `mprimary` (violet) | Định nghĩa, nền tảng, kiến trúc — "đây là gì / hệ thống ra sao" | tiêu đề box định nghĩa, node sơ đồ kiến trúc |
| `maccent` (cam) | Điểm nhấn, tính năng AI nổi bật, con số ấn tượng — "đây là điểm hay" | banner số liệu, node AI/Gemini, mũi tên chính |
| `mgood` (teal) | Kết quả tốt, ưu điểm, "thắng lợi" | điểm mạnh, output đúng, kết quả ML |
| `mbad` (coral) | Vấn đề, hạn chế, rủi ro kỹ thuật | technical debt, giả định, lỗi |
| `mgray` | Ghi chú, footnote, nhãn phụ | caption, chú thích nhỏ |

**Quy tắc:** mỗi slide tối đa 3 màu vai trò (không kể mgray). Đừng để 1 slide "cầu vồng".

### A.4 Tổng quan 18 slide

```
Slide 0   [plain]   Title — World Music Intelligence Monitor
Slide 1             Outline — 5 chặng (roadmap sản phẩm)
─── §1  TỔNG QUAN & KIẾN TRÚC ──────────────────────────
Slide 2             Bài toán & Giải pháp
Slide 3             Kiến trúc hệ thống 3-tier + AI layer   (anchor lớn)
Slide 4             Data Pipeline — đa nguồn & realtime
Slide 5             Bảo mật & Định danh (Clerk)
─── §2  THU THẬP & TRỰC QUAN HÓA ───────────────────────
Slide 6             Dashboard — Giám sát tổng quan          (screenshot)
Slide 7             Daily Briefing & Phân tích cảm xúc
Slide 8             EDA — Phân phối dữ liệu                 (pgfplots)
─── §3  PHÂN TÍCH THÔNG MINH ───────────────────────────
Slide 9             World Map — Phân cụm K-Means            (screenshot + flow)
Slide 10            Trending — Phát hiện viral
Slide 11            Social Listening — Lắng nghe cộng đồng
─── §4  DỰ ĐOÁN & AI AGENT ─────────────────────────────
Slide 12            Hit Prediction — XGBoost
Slide 13            Giải thích dự đoán — Explainable AI
Slide 14            AI Chat — ReAct Agent                   (sơ đồ vòng lặp)
─── §5  ĐÁNH GIÁ & KẾT LUẬN ────────────────────────────
Slide 15            Điểm mạnh & Hạn chế
Slide 16            Hướng phát triển
Slide 17  [plain]   Cảm ơn — QA & Demo
```

### A.5 Phân bổ thời gian (~20 phút)

| Chặng | Slide | Thời gian | Lưu ý nhịp |
|---|---|---|---|
| Mở đầu | 0–1 | 0:45 | Đọc nhanh, gây ấn tượng |
| §1 Tổng quan | 2–5 | 4:00 | Slide 3 (kiến trúc) chậm ~70s |
| §2 Trực quan hóa | 6–8 | 4:00 | Slide 6 demo screenshot ~80s |
| §3 Phân tích | 9–11 | 5:00 | Trọng tâm môn học — slide 9, 10 chậm |
| §4 Dự đoán & Agent | 12–14 | 4:30 | Slide 13, 14 ấn tượng AI |
| §5 Kết luận | 15–17 | 1:45 | Chốt nhanh, chuyển sang Demo |

---

## PHẦN B — Style guide

### B.1 Preamble — ĐỔI PALETTE (bắt buộc)

Giữ NGUYÊN toàn bộ preamble của `slides_main.tex` (documentclass, theme metropolis, packages, mdframed boxes, tikzset, takeaway, glossary…), **chỉ thay khối `\definecolor`** bằng bảng dưới đây. Tên biến màu giữ y nguyên để mọi box/tikzset cũ vẫn chạy:

```latex
%% ─── Color Palette: "Music Vibrant" (violet + amber) ───────────────
\definecolor{mprimary}{HTML}{5B2C9D}   % Deep violet — định nghĩa, kiến trúc
\definecolor{maccent}{HTML}{FF8A00}    % Vivid amber — điểm nhấn, AI
\definecolor{mgood}{HTML}{1FA98F}      % Teal — kết quả tốt
\definecolor{mbad}{HTML}{E5484D}       % Coral — vấn đề, hạn chế
\definecolor{mgray}{HTML}{7A7A8C}      % Cool gray — ghi chú
\definecolor{mdark}{HTML}{221B33}      % Deep aubergine — nền frametitle
\definecolor{mlight}{HTML}{F1ECFA}     % Light violet tint
\definecolor{mlightgold}{HTML}{FFF1DD} % Light amber tint
\definecolor{mlightsage}{HTML}{E2F5F1} % Light teal tint
\definecolor{mlightred}{HTML}{FBE7E7}  % Light coral tint
```

Các dòng `\setbeamercolor{...}` giữ nguyên (frametitle vẫn `bg=mdark, fg=white`; progress bar / structure / title separator vẫn trỏ tới `mprimary` / `maccent`).

**Đổi metadata title** ở cuối preamble:
```latex
\title{\textbf{World Music Intelligence Monitor}}
\subtitle{Phân tích \& cập nhật bản tin âm nhạc toàn cầu theo thời gian thực}
\author{Nhóm SonicT2All --- Phân tích Dữ liệu Thông minh}
\date{}
```

### B.2 Bộ box (giữ nguyên từ template)

| Box | Vai trò trong deck này | Tần suất |
|---|---|---|
| `primarybox` | Định nghĩa, mô tả thành phần hệ thống, "đây là gì" | ~7 lần |
| `accentbox` | Insight, câu chốt, tính năng AI nổi bật | ~6 lần |
| `goodbox` | Ưu điểm, kết quả, "làm được gì" | ~6 lần |
| `badbox` | Hạn chế, technical debt, rủi ro | ~4 lần |

Mỗi slide tối đa **3 box màu**.

### B.3 TikZ styles (tái dùng + thêm 2 style mới)

Tái dùng nguyên: `pbox` (module/dữ liệu thường), `gbox` (output tốt), `rbox` (thành phần có vấn đề), `abox` (điểm nhấn), `darkbox` (khối tính toán quan trọng — encoder, model, agent), `arr` (mũi tên chính), `darr` (mũi tên phụ/dashed).

**Thêm 2 tikzset style mới** (append vào khối `\tikzset{...}`, KHÔNG sửa style cũ):

```latex
  srcbox/.style={draw=maccent!70, fill=mlightgold, rounded corners=3pt,
                 minimum height=0.62cm, font=\scriptsize, inner sep=4pt},
  aibox/.style={draw=maccent, fill=maccent!90, text=white, rounded corners=4pt,
                minimum height=0.7cm, font=\small\bfseries, inner sep=6pt},
```

- `srcbox` → các **nguồn dữ liệu ngoài** (Last.fm, YouTube, Reddit, Deezer, Spotify) — luôn dùng style này để 5 nguồn nhìn đồng nhất.
- `aibox` → các **khối AI** (Gemini, XGBoost, K-Means, VADER, ReAct Agent) — cam đậm, nổi bật, để khán giả nhận ra ngay "đây là phần thông minh".

Idiom thị giác cốt lõi của deck: **nguồn dữ liệu = cam nhạt (`srcbox`)**, **xử lý AI = cam đậm (`aibox`)**, **hạ tầng/web = violet (`pbox`/`darkbox`)**.

### B.4 Macro mới — `\imgplaceholder` (bắt buộc)

Vì deck cần ảnh chụp giao diện thật mà agent không có sẵn, agent **không vẽ lại UI bằng TikZ**. Thay vào đó thêm macro này vào preamble (sau khối `\takeaway`):

```latex
%% ─── Image placeholder (thay bằng screenshot thật sau) ───────────────
\newcommand{\imgplaceholder}[2][0.9\textwidth]{%
  \begin{tikzpicture}
    \node[draw=mprimary!50, fill=mlight, rounded corners=4pt,
          dashed, line width=1pt, minimum width=#1, minimum height=0.58\textheight,
          align=center, font=\footnotesize\color{mprimary!80}] {%
      \faImage~\textbf{[ẢNH CẦN CHÈN]}\\[4pt]#2};
  \end{tikzpicture}%
}
```

- Mọi chỗ cần screenshot thật → gọi `\imgplaceholder[<width>]{<mô tả ảnh>}` và thêm 1 comment LaTeX ngay phía trên:
  `% [IMG] dashboard-fullpage.png — chụp full trang /dashboard`
- Khi người làm slide có ảnh thật, chỉ cần đổi `\imgplaceholder{...}` thành `\includegraphics`.
- `\faImage` cần package `fontawesome5`. Nếu template chưa có, thêm `\usepackage{fontawesome5}` vào preamble (nó cũng cho ta `\faSpotify`, `\faYoutube`, `\faReddit`, `\faRobot`, `\faMapMarkedAlt`… dùng rải rác cho sinh động).

### B.5 (Tùy chọn) Decoration "sóng nhạc" cho slide divider & title

Để deck "có chất nhạc", có thể thêm 1 dải **equalizer bars** nhỏ ở title slide và section divider. Đây là tùy chọn — nếu thêm thì dùng TikZ đơn giản:
```latex
\newcommand{\eqbars}[1]{% #1 = màu
  \begin{tikzpicture}[baseline]
    \foreach \h in {0.18,0.42,0.28,0.55,0.34,0.48,0.22}{
      \fill[#1] (0,0) rectangle (0.12,\h); \pgftransformxshift{6mm}}
  \end{tikzpicture}}
```
Dùng ở góc dưới title slide hoặc cạnh số chương trong divider. **Không lạm dụng** — tối đa 1 chỗ/slide.

### B.6 Quy ước "mở" và "kết" mỗi slide nội dung (slide 2–16)

```
[FRAME TITLE]              ← bar tối phía trên (mdark), 1 dòng
                           ← vùng nội dung: visual anchor + box/chú thích
\takeaway{<câu chốt>}      ← 1 dòng cuối, nền amber nhạt
```
- Slide 0, 1, 17: KHÔNG có takeaway.
- Slide 3, 9, 14 (có anchor lớn chiếm chỗ): takeaway vẫn có nhưng đặt sát đáy, không để anchor đè.

---

## PHẦN C — Ngân sách hiển thị (Display Budget)

> Mục đích: đặt giới hạn đo đếm được để slide không quá tải. Agent dùng §C.5 để **audit từng slide** trước khi đóng. Vượt budget mà không có lý do chính đáng → cắt chữ hoặc chia slide.

### C.1 Font & line-height (Beamer 9pt, 16:9 → vùng nội dung ≈ 12.8cm × 7.2cm)

| Element | Font | Cao 1 dòng |
|---|---|---|
| `\frametitle` | Metropolis tự đặt (đậm) | ~0.7cm |
| Mini-header trong slide | `\small\bfseries` tô màu vai trò | ~0.4cm |
| Box header | `\footnotesize\bfseries` | ~0.35cm |
| Body text trong box | `\footnotesize` | ~0.35cm |
| Bullet item | `\footnotesize` | ~0.35cm |
| Caption / footnote / callback | `\tiny` italic mgray | ~0.25cm |
| Nhãn TikZ | `\scriptsize` hoặc `\tiny` | ~0.3cm |
| `\takeaway` | `\small\bfseries` | ~0.4cm |

Tổng số "block dọc" tối đa per slide (kể cả frametitle + takeaway): **5**.

### C.2 Giới hạn độ dài per element

| Element | Max ký tự/dòng | Max từ | Max dòng |
|---|---|---|---|
| Frame title | 46 | 7 | 1 |
| Section title (`\section{}`) | 28 | 4 | 1 |
| Takeaway | 90 | 14 | 1 |
| Box header | 30 | 5 | 1 |
| Box body (tổng) | — | 32 | 4 |
| Bullet item | 55 | 9 | 1 |
| Caption italic dưới hình | 80 | 14 | 2 |
| Nhãn TikZ | 24 | 4 | 1 |

**Quy tắc cứng:** element vượt giới hạn "ký tự/dòng" → KHÔNG thu nhỏ font để vừa, mà **rút gọn ý** hoặc tách 2 element.

### C.3 Giới hạn số element per slide

| Element | Khuyến nghị | Cứng (max) |
|---|---|---|
| Box màu | 2 | **3** |
| Ảnh `\imgplaceholder` / `\includegraphics` | 1 | **2** (chỉ khi 2 ảnh nhỏ cạnh nhau) |
| Sơ đồ TikZ trung tâm | 1 | **1** |
| pgfplots chart | 0 | **1** (không kèm TikZ trung tâm khác) |
| Bảng | 0 | **1** (≤ 6 hàng) |
| Bullet items (cộng dồn) | 5 | **8** |
| Mũi tên trong sơ đồ TikZ | ≤ 7 | **9** (slide 3, 14 ngoại lệ) |
| Module/box trong sơ đồ | ≤ 8 | **11** (slide 3 ngoại lệ — dùng `\resizebox`) |
| Tổng số từ trên slide | 55 | **85** (slide 15 ngoại lệ) |
| Icon FontAwesome | 5 | **9** |

**Loại trừ lẫn nhau:** có pgfplots ≠ có TikZ trung tâm khác · có ảnh lớn ≠ có sơ đồ TikZ lớn (chọn 1 anchor).

### C.4 Quy tắc layout — 7 luật cho mọi slide nội dung

1. **White-space ≥ 25%** — slide phải có ≥ ¼ diện tích "thở".
2. **Single-focus** — đúng 1 visual anchor (to nhất, đậm nhất). Nếu thấy 2 anchor "đua nhau" → thu nhỏ 1 cái xuống < 60%.
3. **Pyramid** — thứ tự kích thước: frame title > anchor > box header > body > caption.
4. **Two-column balance** — nếu chia 2 cột, cả 2 cột đầy ≥ 60% chiều cao.
5. **No-paragraph** — không đoạn text ≥ 3 dòng liên tục. Chia bullet hoặc box.
6. **Line-break** — không bullet/dòng nào tràn > 1 dòng.
7. **Anchor proportion** — visual anchor chiếm 50–70% chiều cao; box phụ + chữ 15–25%; takeaway 5–10%.

### C.5 Bảng audit per-slide (pre-filled)

| # | Slide | Title ký tự | #Box | Anchor | pgfplot | #Bullet | Từ ước tính | Ghi chú |
|---|---|--:|--:|---|--:|--:|--:|---|
| 0 | Title | — | 0 | eqbars (nhỏ) | 0 | 0 | ~25 | `[plain]`, không takeaway |
| 1 | Outline | 18 | 1 | 1 TikZ (5 step) | 0 | 0 | ~35 | accentbox 1 dòng |
| 2 | Bài toán & Giải pháp | 24 | 2 | 1 TikZ "before→after" | 0 | 4 | ~70 | 2 cột |
| 3 | Kiến trúc hệ thống | 22 | 1 | 1 TikZ lớn `\resizebox` | 0 | 0 | ~30 | min text — sơ đồ 75% |
| 4 | Data Pipeline | 20 | 1 | 1 TikZ flow | 0 | 3 | ~60 | 5 srcbox + scheduler |
| 5 | Bảo mật & Định danh | 22 | 2 | 1 TikZ flow auth | 0 | 4 | ~65 | 2 cột |
| 6 | Dashboard | 26 | 2 | 1 ảnh screenshot lớn | 0 | 4 | ~60 | ảnh trái, chú thích phải |
| 7 | Daily Briefing & Cảm xúc | 30 | 2 | 1 TikZ pipeline | 0 | 4 | ~70 | VADER + Gemini flow |
| 8 | EDA — Phân phối dữ liệu | 28 | 1 | 1 pgfplots (Pareto) | 1 | 3 | ~55 | bar/line chart |
| 9 | World Map — K-Means | 26 | 2 | 1 ảnh + 1 mini-flow | 0 | 3 | ~65 | 2 cột: flow trái, ảnh phải |
| 10 | Trending — Viral | 24 | 2 | 1 TikZ + công thức | 0 | 4 | ~70 | viral score formula |
| 11 | Social Listening | 28 | 2 | 1 TikZ flow | 0 | 4 | ~65 | multi-subreddit + Gemini |
| 12 | Hit Prediction — XGBoost | 28 | 2 | 1 TikZ pipeline | 0 | 4 | ~70 | feature pipeline |
| 13 | Giải thích dự đoán | 28 | 2 | 1 TikZ + 1 radar mini | 0 | 4 | ~70 | XGBoost→Gemini→radar |
| 14 | AI Chat — ReAct Agent | 24 | 1 | 1 TikZ vòng lặp lớn | 0 | 0 | ~40 | sơ đồ là chính |
| 15 | Điểm mạnh & Hạn chế | 22 | 2 | — | 0 | 10 | ~95 | **NGOẠI LỆ** 5+5 bullet 2 cột |
| 16 | Hướng phát triển | 20 | 1 | 1 TikZ roadmap | 0 | 5 | ~70 | 5 hướng |
| 17 | Cảm ơn — QA & Demo | — | 0 | eqbars (nhỏ) | 0 | 0 | ~20 | `[plain]`, không takeaway |

**Ngoại lệ duy nhất:** Slide 15 vượt từ 85→95 vì cấu trúc 5 mạnh + 5 yếu đối xứng. Bù lại: chia 2 cột rõ (goodbox/badbox), mỗi bullet ≤ 1 dòng cứng, KHÔNG anchor TikZ.

### C.6 Closing-the-door check (làm trước khi đánh dấu 1 slide "xong")

- [ ] Đếm từ (không kể caption/footnote/math) → ≤ ngân sách §C.5.
- [ ] Đếm box màu → ≤ 3.
- [ ] Frame title đếm ký tự → ≤ 46.
- [ ] Takeaway ≤ 90 ký tự, vừa 1 dòng.
- [ ] Mỗi bullet ≤ 1 dòng cứng (compile xem PDF để chắc).
- [ ] Có đúng 1 visual anchor.
- [ ] Có ≥ 1 vùng trống ≥ 1cm cao.
- [ ] 5 nguồn dữ liệu (nếu xuất hiện) đều dùng `srcbox`; khối AI đều dùng `aibox`.
- [ ] Mọi chỗ cần ảnh thật đều dùng `\imgplaceholder` + có comment `% [IMG] ...`.

---

## PHẦN D — Thiết kế từng slide

> Ký hiệu: **[A]** = anchor (visual chính). Số liệu cụ thể lấy ở §E.

### Slide 0 — Title `[plain]`

**Vai trò:** Gây ấn tượng đầu tiên — đây là một sản phẩm web, không phải bài lecture.

**Layout:** 2 cột.
- **Cột trái (~52%):** căn giữa.
  - Tên đề tài lớn: **World Music Intelligence Monitor** (`\Huge\bfseries\color{mprimary}`).
  - Dòng phụ italic violet nhạt: *"Phân tích & cập nhật bản tin âm nhạc toàn cầu — realtime"*.
  - Cách 1 khoảng → tên nhóm **SonicT2All** (`\large\bfseries`).
  - Dòng nhỏ mgray: *"Phân tích Dữ liệu Thông minh"*.
  - GVHD + danh sách 5 thành viên (font `\scriptsize`, mgray) — xem §E.0.
  - Dưới cùng: `\eqbars{maccent}` nhỏ (tùy chọn).
- **Cột phải (~48%): [A]** — sơ đồ TikZ "hệ sinh thái" thu nhỏ, mang tính trang trí:
  - 1 node tròn trung tâm `aibox` ghi "🎵 Monitor" (hoặc `\faChartLine`).
  - 5 node `srcbox` nhỏ tỏa quanh: Last.fm, YouTube, Reddit, Deezer, Spotify — mỗi node có icon FontAwesome tương ứng nếu có (`\faSpotify`, `\faYoutube`, `\faReddit`…).
  - Mũi tên `arr` từ 5 nguồn → node trung tâm.
  - 3 node nhỏ `pbox` ở dưới tỏa ra từ trung tâm: "Dashboard", "World Map", "AI Chat" — gợi đầu ra.

**Không takeaway.** Tối đa ~25 từ.

---

### Slide 1 — Outline (roadmap sản phẩm)

**Vai trò:** Cho khán giả bản đồ 5 chặng.

**Layout:** 1 sơ đồ TikZ trung tâm — **5 stepbox ngang** nối bằng đường tiến trình (giống slide "Nội Dung Trình Bày" của template, nhưng 5 step).

**[A]** 5 stepbox, mỗi cái có 1 số tròn phía trên + tiêu đề + 1 dòng `\scriptsize` mô tả:
1. **TỔNG QUAN** — *Kiến trúc & data pipeline* — viền `mprimary`
2. **TRỰC QUAN HÓA** — *Dashboard & cảm xúc* — viền `mprimary`
3. **PHÂN TÍCH** — *Phân cụm & phát hiện viral* — viền `maccent` (chặng trọng tâm — viền dày 1.4pt + dấu `\faStar`)
4. **DỰ ĐOÁN** — *XGBoost & AI Agent* — viền `maccent`
5. **ĐÁNH GIÁ** — *Điểm mạnh & hướng phát triển* — viền `mgood`

**Box dưới:** 1 `accentbox` full-width 1 dòng italic căn giữa:
> *"Từ dữ liệu thô đa nền tảng → bản tin âm nhạc thông minh, realtime."*

**Không takeaway.** ~35 từ.

---

### Slide 2 — Bài Toán & Giải Pháp

**Vai trò:** Đặt vấn đề + giới thiệu giải pháp trong 1 slide. Tại sao cần hệ thống này?

**Layout:** 2 cột (T-aligned), **[A]** là 1 sơ đồ TikZ "before → after" chạy ngang đầu slide.

**[A] Sơ đồ before→after** (chiếm ~40% chiều cao, ngang):
- Bên trái: cụm 5 icon nguồn rời rạc, lộn xộn (Last.fm/YouTube/Reddit/Deezer/Spotify) — nhãn mbad: *"dữ liệu phân mảnh, thủ công"*.
- Mũi tên `arr` to maccent ở giữa, nhãn trên: *"Music Monitor"*.
- Bên phải: 1 node `aibox` "Bản tin thông minh" — nhãn mgood: *"realtime · tự động · 1 màn hình"*.

**Cột trái (~48%) — Vấn đề:** 1 `badbox`, mini-header mbad *"Trước đây"*, 2 bullet `\faTimes`:
- *"Theo dõi xu hướng nhạc = mở 5 tab, đọc tay, không realtime."*
- *"Số liệu thô, không có insight — không biết vì sao 1 bài viral."*

**Cột phải (~48%) — Giải pháp:** 1 `goodbox`, mini-header mgood *"Music Monitor"*, 2 bullet `\faCheck`:
- *"Gộp 5+ nguồn, polling realtime, cache thông minh."*
- *"AI sinh bản tin + phân cụm + dự đoán hit + chat hỏi đáp."*

**Takeaway:** *"Một nền tảng — gom dữ liệu phân mảnh thành bản tin âm nhạc realtime."*

---

### Slide 3 — Kiến Trúc Hệ Thống

**Vai trò:** Slide kiến trúc — anchor lớn nhất deck. Khán giả phải thấy ngay 3 tầng + AI layer.

**Layout:** Toàn slide là **1 sơ đồ TikZ lớn**, bọc trong `\resizebox{\textwidth}{!}{...}`. Text rất ít.

**[A] Sơ đồ 4 tầng dọc** (từ trên xuống), mỗi tầng là 1 dải ngang:
1. **FRONTEND** (`pbox` violet nhạt, full-width) — "Next.js 14 · App Router · TypeScript" — trong dải có 3 chip nhỏ: Dashboard · World Map · AI Chat. Nhãn cạnh phải: *"Vercel · port 3000"*.
2. **BACKEND** (`darkbox` violet đậm, full-width) — "FastAPI · Python 3.11 · Uvicorn" — trong dải 4 chip: Routers · Services · AI/ML · Scheduler. Nhãn cạnh phải: *"Render.com · port 8000"*.
3. **AI / EXTERNAL** — chia 2 cụm cạnh nhau:
   - Cụm trái: 5 `srcbox` (Last.fm, YouTube, Reddit, Deezer, Spotify).
   - Cụm phải: 3 `aibox` (Gemini · K-Means/XGBoost · ReAct Agent).
4. **DATA LAYER** (`pbox`, full-width) — 3 chip: Firebase Firestore · map_cache.json · In-memory cache.

Mũi tên `arr` nối tầng 1↔2 (HTTP REST + SSE), 2↔3 (HTTP calls), 2↔4 (cache). Tổng ≤ 9 mũi tên, ≤ 11 box (slide này là ngoại lệ §C.3).

**Footer 1 dòng** `\tiny` mgray italic: *"Kiến trúc 3-tier + lớp AI — mỗi tầng deploy độc lập."*

**Takeaway:** *"3 tầng tách biệt + lớp AI — dữ liệu chảy một chiều, dễ mở rộng."*

---

### Slide 4 — Data Pipeline: Đa Nguồn & Realtime

**Vai trò:** Giải thích dữ liệu vào hệ thống thế nào — polling, cache, fallback.

**Layout:** **[A]** 1 sơ đồ TikZ flow ngang ở nửa trên + 3 bullet + 1 box ở nửa dưới.

**[A] Sơ đồ flow:**
- Trái: 5 `srcbox` xếp dọc (Last.fm, YouTube, Reddit, Deezer, Spotify) — ghi chú `\tiny` dưới Deezer: *"miễn phí, không cần key"*.
- Giữa: node `darkbox` "Scheduler (APScheduler)" — nhãn trên: *"poll mỗi 6 giờ"*.
- Phải: node `pbox` "Firebase Firestore" (cache). Dưới nó node nhỏ `pbox` "map_cache.json".
- Mũi tên: 5 nguồn → Scheduler (chỉ Last.fm là `arr` liền; 4 nguồn còn lại `darr` ghi *"on-demand"*) → Firestore. Mũi tên vòng từ Firestore về "Router → JSON".

**3 bullet** (`\footnotesize`) phía dưới:
- *"Polling 6h cho Last.fm — tối ưu quota Firebase free tier."*
- *"4 nguồn còn lại fetch on-demand, song song bằng `asyncio.gather`."*
- *"Cache 3 lớp: Firestore (cloud) · file JSON · in-memory."*

**1 `primarybox`** mini-header *"Vì sao polling, không webhook?"*: *"Các nền tảng nhạc không cung cấp webhook — polling + cache là lựa chọn thực tế."*

**Takeaway:** *"5+ nguồn, polling 6h + on-demand, cache 3 lớp — luôn có dữ liệu để hiển thị."*

---

### Slide 5 — Bảo Mật & Định Danh

**Vai trò:** Trình bày lớp auth (Clerk) — tính "doanh nghiệp" của sản phẩm.

**Layout:** 2 cột. **[A]** sơ đồ flow auth ở cột trái.

**[A] Cột trái (~50%) — sơ đồ flow:**
- Node `pbox` "Người dùng" → `darkbox` "Clerk Middleware" → nhánh đôi:
  - Nếu route public (`/`, `/sign-in`) → `gbox` "Cho qua".
  - Nếu route protected → `darkbox` "auth().protect()" → `gbox` "Vào Dashboard".
- Mũi tên đứt `darr` từ "auth().protect()" vòng về "Sign-in" (chưa login).

**Cột phải (~48%):**
- 1 `primarybox`, mini-header *"Clerk — Identity Platform"*, 2 bullet `\faCheck`:
  - *"SSO: đăng nhập qua Google / Email-Password."*
  - *"Quản lý session, connected accounts minh bạch."*
- 1 `goodbox`, mini-header *"Bảo vệ được gì"*, 2 bullet:
  - *"Chặn truy cập trái phép vào Data Pipeline & AI Chat."*
  - *"Nền móng sẵn sàng cho RBAC (Admin / Viewer)."*

**Takeaway:** *"Clerk lo định danh & phân quyền — nhóm tập trung vào phần phân tích."*

---

### Slide 6 — Dashboard: Giám Sát Tổng Quan

**Vai trò:** Demo tính năng trung tâm. Đây là slide "wow" đầu tiên — phải có ảnh thật.

**Layout:** 2 cột — ảnh trái lớn, chú thích phải.

**[A] Cột trái (~58%):** `\imgplaceholder[\linewidth]{Trang /dashboard — Global Top 50 + MIS + AI Briefing}`
`% [IMG] dashboard-fullpage.png — chụp full trang /dashboard ở light mode`

**Cột phải (~40%):** 4 bullet ngắn `\footnotesize`, mỗi bullet 1 icon:
- `\faBell` *"Live Anomaly Alert — phát hiện spike realtime."*
- `\faChartBar` *"Global Top 50 kèm điểm MIS."*
- 1 `accentbox` mini chứa định nghĩa MIS (xem §E.6): *"MIS = Plays + Listeners + trọng số xu hướng."*
- `\faFilter` *"Bộ lọc động: Today / This Week / This Month."*
- `\faThLarge` *"Unified UI — số liệu thô + AI Briefing trên cùng 1 màn hình."*

**Takeaway:** *"Một màn hình — số liệu realtime và bản tin AI cạnh nhau."*

---

### Slide 7 — Daily Briefing & Phân Tích Cảm Xúc

**Vai trò:** Giải thích AI sinh bản tin thế nào — pipeline VADER + Gemini.

**Layout:** **[A]** sơ đồ pipeline ngang ở nửa trên + 2 box ở nửa dưới.

**[A] Sơ đồ pipeline:**
- Trái: 3 `srcbox` nhỏ (Last.fm Top Charts · Reddit Posts · Deezer TikTok).
- Reddit Posts → `aibox` "VADER NLP" → nhãn `\tiny`: *"Neg / Neu / Pos"*.
- Tất cả gộp thành 1 node `pbox` "JSON tổng hợp" → `aibox` lớn "Gemini 3.1 Flash-Lite" → `gbox` "Bản tin có cấu trúc".
- Mũi tên `arr` xuyên suốt.

**Nửa dưới — 2 box:**
- 1 `primarybox`, mini-header *"Đầu vào"*: *"Top Charts + Reddit mentions + điểm sentiment → đóng gói JSON."*
- 1 `goodbox`, mini-header *"Đầu ra (5 mục)"*, 3 bullet ngắn: *"Tổng quan thị trường · TikTok Viral Alert · Dự báo tuần tới"* + dòng `\tiny`: *"Có fallback khi Gemini hết quota."*

**Takeaway:** *"VADER chấm cảm xúc, Gemini viết bản tin — raw data thành insight tự động."*

---

### Slide 8 — EDA: Phân Phối Dữ Liệu

**Vai trò:** Phần "phân tích dữ liệu" theo đúng tên môn — cho thấy nhóm hiểu dữ liệu.

**Layout:** **[A]** 1 biểu đồ pgfplots lớn (chiếm ~60%) + 3 bullet + 1 box.

**[A] pgfplots — biểu đồ Pareto / long-tail:** bar chart giảm dần (top tracks theo playcount) — bar đầu cao vượt trội, đuôi dài thấp dần. Trục x: rank bài hát (1–15), trục y: playcount (đơn vị triệu). Highlight bar #1 màu `maccent`, còn lại `mprimary!60`. Có 1 đường cong cumulative `mgood` (line plot, trục y phải) chạm ~80% quanh rank 3–4 để minh họa quy luật 80/20. Số liệu minh họa hợp lý (xem §E.8).

**3 bullet** `\footnotesize`:
- *"Phân phối long-tail rõ rệt — Top 1 áp đảo, quy luật 80/20."*
- *"Cross-platform: YouTube views/likes · Reddit upvotes/comments."*
- *"Sentiment bar: tích cực (teal) / tiêu cực (coral) — cảnh báo khủng hoảng sớm."*

**1 `accentbox`** mini: *"EDA + huấn luyện XGBoost thực hiện trong Kaggle notebook."*

**Takeaway:** *"Dữ liệu nhạc có dạng long-tail — vài bài hút phần lớn lượt nghe."*

---

### Slide 9 — World Map: Phân Cụm Thị Hiếu (K-Means)

**Vai trò:** Tính năng phân tích lõi #1 — phân cụm không gian. Trọng tâm môn học.

**Layout:** 2 cột — flow trái, ảnh phải.

**[A] Cột trái (~46%) — mini-flow dọc K-Means:**
- `srcbox` "Deezer chart + Last.fm tags (89 quốc gia)" →
- `pbox` "Vector 16 thể loại / quốc gia" →
- `aibox` "K-Means (k=6)" →
- `pbox` "PCA → toạ độ 2D" →
- `gbox` "Nhãn cụm: POP-dominant…"
- Mũi tên `arr` nối dọc. Dưới cùng `\tiny`: *"Cache map_cache.json — lần đầu ~60–90s, sau đó tức thì."*

**Cột phải (~50%):** `\imgplaceholder[\linewidth]{Trang /map — bản đồ Leaflet tô màu theo cụm}`
`% [IMG] worldmap-page.png — chụp /map có popup 1 quốc gia`
- Caption `\tiny` italic: *"Click quốc gia → AI Cultural Insight (Gemini) giải thích nguyên nhân văn hóa."*

**1 `accentbox`** mini (đặt dưới, full-width): *"Phát hiện dị biệt: Việt Nam rơi vào cụm Latin-dominant — Gemini lý giải."*

**Takeaway:** *"K-Means gom 89 quốc gia theo gu nhạc — bản đồ kể chuyện văn hóa."*

---

### Slide 10 — Trending: Phát Hiện Viral

**Vai trò:** Tính năng phân tích lõi #2 — phát hiện bất thường + viral score.

**Layout:** 2 cột. **[A]** cột trái: công thức viral score + mini-sơ đồ.

**[A] Cột trái (~50%):**
- Mini-sơ đồ: 3 `srcbox` (YouTube growth · Reddit mentions · YouTube comments) → `aibox` "Viral Score" → `gbox` "0–100".
- Ngay dưới: 1 `primarybox` chứa công thức trọng số (xem §E.10):
  *"Viral = 50%·YouTube + 30%·Reddit + 20%·Comments"*

**Cột phải (~48%):** 4 bullet `\footnotesize`:
- *"Z-score trên chuỗi tăng view — phát hiện spike (ngưỡng 2.5)."*
- *"Isolation Forest — đánh dấu bài bất thường trong batch."*
- *"Xếp hạng theo Velocity (vận tốc tăng), không chỉ tổng view."*
- 1 `accentbox` mini: `\faQuestionCircle` *"Nút \"Tại sao viral?\" — Gemini tổng hợp sự kiện / trend TikTok."*

**Takeaway:** *"Z-score + Isolation Forest + Gemini — phát hiện và giải thích viral."*

---

### Slide 11 — Social Listening: Lắng Nghe Cộng Đồng

**Vai trò:** Tính năng phân tích lõi #3 — sentiment đa subreddit + AI insight.

**Layout:** **[A]** sơ đồ flow ngang nửa trên + 2 box nửa dưới.

**[A] Sơ đồ flow:**
- Trái: 3 chip `srcbox` (r/Music · r/kpop · r/hiphopheads).
- → `aibox` "VADER NLP" → nhãn `\tiny`: *"Pos / Neu / Neg · Mentions 24h"*.
- → `aibox` "Gemini Contextual Insight" → `gbox` "Góc nhìn cộng đồng".

**Nửa dưới — 2 box:**
- 1 `primarybox`, mini-header *"VADER chấm gì"*: *"Phân tích tiêu đề mỗi post → compound score → phân loại Pos/Neu/Neg."*
- 1 `goodbox`, mini-header *"Gemini phân tích gì"*, 4 bullet ngắn (2×2): *"Chủ đề chính · Mức độ quan tâm · Góc nhìn cộng đồng · Tác động truyền thông."*

**Takeaway:** *"Đa subreddit + VADER + Gemini — đo nhiệt cộng đồng theo thời gian thực."*

---

### Slide 12 — Hit Prediction: XGBoost

**Vai trò:** Tính năng dự đoán — mô hình ML chính.

**Layout:** **[A]** sơ đồ pipeline ngang nửa trên + 4 bullet/box nửa dưới.

**[A] Sơ đồ pipeline "quick predict":**
- `pbox` "Người dùng nhập tên bài" →
- 4 `srcbox` song song (Deezer validate · YouTube stats · Reddit mentions · Last.fm tags) →
- `pbox` "11 features" →
- `aibox` "XGBoost" →
- `gbox` "Xác suất Hit (%) + phân loại rủi ro"
- Mũi tên `arr`.

**Nửa dưới:**
- 1 `primarybox`, mini-header *"11 đặc trưng"*: *"Tăng trưởng view 24h/48h/7d · Reddit mentions · comments · playcount · listeners · genre popularity · mùa vụ…"*
- 2 bullet `\footnotesize`:
  - *"Decay factor theo tuổi MV — bài cũ nhiều view không bị coi là đang hot."*
  - *"Output là **xác suất (%)** + nhãn rủi ro, không chỉ Hit/Not-Hit."*
- 1 `accentbox` mini: *"Có preview 30s ngay trên web (Deezer)."*

**Takeaway:** *"XGBoost + 11 đặc trưng đa nguồn — dự đoán xác suất hit theo thời gian thực."*

---

### Slide 13 — Giải Thích Dự Đoán: Explainable AI

**Vai trò:** Cho thấy nhóm không chỉ "dự đoán" mà còn "giải thích" — chiều sâu phân tích.

**Layout:** 2 cột — sơ đồ trái, radar + box phải.

**[A] Cột trái (~52%) — sơ đồ "giải mã hộp đen":**
- `pbox` "XGBoost output (vd 44.9%)" → 3 nhánh `pbox` nhỏ: "SHAP weights" · "Feature rank" · "Score split (+/−)".
- 3 nhánh gộp → `aibox` "Gemini phiên dịch" → `gbox` "Lời văn dễ hiểu: vì sao đạt %?".
- Tiếp → `srcbox` "Risk tier (Watch / Low confidence)" → `gbox` "Đề xuất hành động".

**Cột phải (~44%):**
- 1 **radar chart mini** (TikZ hoặc pgfplots, ngũ giác): 5 trục — Memeability · Emotional Hook · Danceability · Lyrics · Shock Value. Vẽ 1 đa giác `maccent` mờ.
- 1 `primarybox` mini: *"Gemini đọc trọng số XGBoost → trả lời \"vì sao bài này đạt xác suất đó\"."*

**Takeaway:** *"Không chỉ dự đoán — Gemini phiên dịch mô hình thành đề xuất hành động."*

---

### Slide 14 — AI Chat: ReAct Agent

**Vai trò:** Tính năng AI ấn tượng nhất — agent tự suy luận + gọi tool.

**Layout:** **[A]** 1 sơ đồ vòng lặp ReAct lớn (chiếm ~75%), text tối thiểu.

**[A] Sơ đồ vòng lặp dọc** (giống slide 22 của bản tham khảo, dựng lại bằng TikZ):
- `gbox` "Người dùng" (câu hỏi) →
- Khung lớn bao quanh nhãn `\tiny` "ReAct loop" (dùng `fit` + dashed) chứa:
  - `abox` "Thought — lên kế hoạch" →
  - `pbox` "Action — gọi tool" (nhãn cạnh: web_search / get_country_top / viral_score…) →
  - `rbox` "Observation — kết quả / lỗi" →
  - `srcbox` "Thought 2 — tự phục hồi" (nhãn cạnh `\tiny`: *"Graceful fallback → Internal Knowledge"*) →
  - mũi tên vòng lại Action (tối đa 6 vòng).
- Khung → `gbox` "Final answer".

**Footer 1 dòng** `\tiny` mgray: *"7 tool nội bộ + DuckDuckGo · streaming SSE · tối đa 6 vòng."*

**Takeaway:** *"Agent ReAct: suy luận → gọi tool → tự phục hồi khi lỗi."*

---

### Slide 15 — Điểm Mạnh & Hạn Chế

**Vai trò:** Đánh giá khách quan — cho thấy nhóm hiểu rõ sản phẩm mình.

**Layout:** 2 cột bằng nhau. **NGOẠI LỆ** §C.5 — 10 bullet (5+5).

**Cột trái (~48%) — 1 `goodbox` lớn** "ĐIỂM MẠNH", 5 bullet `\faCheck` teal:
- *"Tích hợp 5+ nguồn dữ liệu trong 1 nền tảng."*
- *"AI thật: Gemini briefing + ReAct agent, không chỉ gọi API."*
- *"3 mô hình ML: K-Means · XGBoost · Isolation Forest."*
- *"Explainable AI — giải thích dự đoán bằng lời."*
- *"Realtime + cache 3 lớp — phản hồi nhanh."*

**Cột phải (~48%) — 1 `badbox` lớn** "HẠN CHẾ / GIẢ ĐỊNH", 5 bullet `\faTimes` coral:
- *"Spike detection dùng lịch sử giả (thiếu dữ liệu lịch sử thật)."*
- *"YouTube growth là ước tính từ tổng view, không phải growth thật."*
- *"Rate limiter Gemini chỉ an toàn với 1 worker."*
- *"map_cache.json — chưa tự hết hạn, phải xóa thủ công."*
- *"Còn code legacy (SQLAlchemy, claude_narrative) chưa dọn."*

**1 `primarybox`** full-width 1 dòng kết: *"Sản phẩm hoàn chỉnh end-to-end — phần dữ liệu lịch sử là hướng cải thiện rõ nhất."*

**Takeaway:** *"Mạnh về tích hợp & AI — điểm yếu nằm ở dữ liệu lịch sử & vận hành."*

---

### Slide 16 — Hướng Phát Triển

**Vai trò:** Chốt bằng tầm nhìn — sản phẩm đi tiếp thế nào.

**Layout:** **[A]** 1 sơ đồ roadmap ngang (5 mốc) + chú thích.

**[A] Sơ đồ roadmap** — 5 node trên 1 đường thời gian, mỗi node 1 icon + 1 dòng ngắn:
1. `\faDatabase` **Dữ liệu lịch sử thật** — ghi snapshot YouTube/chart theo thời gian.
2. `\faServer` **Tách worker** — Celery + Redis cho scheduler & rate limit.
3. `\faClock` **Cache TTL** — Redis thay file JSON, tự hết hạn.
4. `\faUsersCog` **RBAC** — phân quyền Admin / Viewer.
5. `\faBroom` **Dọn code** — bỏ legacy, gộp kết nối Gemini.

Node 1 highlight `maccent` (ưu tiên cao nhất), còn lại `mprimary`.

**1 `accentbox`** mini full-width: *"Ưu tiên #1: thay dữ liệu giả bằng lịch sử thật → mở khóa trend detection chính xác."*

**Takeaway:** *"Hướng đi rõ ràng: dữ liệu lịch sử thật + hạ tầng tách lớp."*

---

### Slide 17 — Cảm Ơn — QA & Demo `[plain]`

**Vai trò:** Đóng + mời demo.

**Layout:** căn giữa.
- Lớn: **CẢM ƠN ĐÃ LẮNG NGHE** (`\Huge\bfseries\color{mprimary}`).
- Dưới: **World Music Intelligence Monitor — SonicT2All** (`\large`).
- 1 dòng mgray: GVHD (xem §E.0).
- 1 `accentbox` nhỏ căn giữa: **QA & DEMO** (`\large\bfseries`).
- Dưới cùng: `\eqbars{maccent}` (tùy chọn).

**Không takeaway.** ~20 từ.

---

## PHẦN E — Kho dữ liệu nội dung (Content Bank)

> Toàn bộ số liệu/sự kiện cần dùng. Agent **chỉ lấy từ đây**, không bịa thêm con số.

### E.0 — Thông tin nhóm
- **Đề tài:** World Music Intelligence Monitor (tên hệ thống trong code: *Global Music Intelligence Monitor*).
- **Nhóm:** SonicT2All. **Môn:** Phân tích Dữ liệu Thông minh.
- **GVHD:** TS. Nguyễn Tiến Huy, ThS. Nguyễn Thanh Tình.
- **Thành viên:** Bàng Mỹ Linh (23122009) · Lại Nguyễn Hồng Thanh (23122018) · Phan Huỳnh Châu Thịnh (23122019) · Nguyễn Gia Bảo (23122015) · Nguyễn Ngọc Như Quỳnh (23120080).

### E.1 — Tổng quan hệ thống
- Web app phân tích & dự đoán xu hướng âm nhạc toàn cầu **realtime**.
- 6 tính năng: Dashboard · World Map · Trending · Hit Prediction · Daily Briefing · AI Chat.
- Hoàn thành 4/2026. Hỗ trợ Light & Dark mode.

### E.2 — Kiến trúc & tech stack
- **3-tier + AI layer.** Frontend: Next.js 14 (App Router, TypeScript, Tailwind), deploy Vercel, port 3000. Backend: FastAPI, Python 3.11, Uvicorn, deploy Render.com, port 8000.
- Backend folders: `routers/` (7 module) · `services/` (5 nguồn) · `ai/` (ML + Gemini) · `scheduler.py`.
- **Data layer:** Firebase Firestore (cache chính) · `map_cache.json` (file, kết quả clustering ~17KB) · in-memory dict (briefing & insight cache, mất khi restart).
- Frontend libs đáng nhắc: recharts (charts), leaflet (map), framer-motion (chat animation), swr (fetch+cache), Clerk (auth).
- Lưu ý: docker-compose có Postgres + Redis nhưng backend **không dùng** (legacy).

### E.3 — Nguồn dữ liệu (5)
- **Last.fm** — global top tracks, top theo quốc gia, artist tags. Chỉ cần API key.
- **Deezer** ⭐ — miễn phí, không cần key. Country chart (fallback 3 lớp), TikTok viral, search track.
- **YouTube Data API v3** — search MV, view/like/comment count.
- **Reddit** — Public JSON API (không OAuth). Hot posts, artist mentions.
- **Spotify** — global/viral top; editorial playlist cần Premium → fallback New Releases.

### E.4 — Polling & scheduler
- APScheduler `AsyncIOScheduler`, **1 job duy nhất:** poll Last.fm global top 50 **mỗi 6 giờ** → ghi Firestore `cache/global_top`.
- 4 nguồn còn lại fetch **on-demand**, song song bằng `asyncio.gather`.
- 6 giờ là để tối ưu quota Firebase free tier (50K reads / 20K writes mỗi ngày).

### E.5 — Bảo mật
- **Clerk** (identity platform) ở frontend. SSO: Google + Email/Password.
- `middleware.ts`: route public = `/`, `/sign-in`, `/sign-up`; còn lại `auth().protect()`.
- Backend không có auth API-level; CORS chỉ cho localhost (cần đổi khi deploy).
- RBAC (Admin/Viewer) là *future-proof* — chưa triển khai.

### E.6 — Dashboard
- Global Top 50 + **MIS score**. MIS = Plays + Listeners + trọng số xu hướng.
- Live Anomaly Alert (Isolation Forest phát hiện spike). Bộ lọc Today/This Week/This Month.
- Unified UI: số liệu thô + AI Briefing trên cùng màn hình.

### E.7 — Daily Briefing & Sentiment
- **VADER** chấm cảm xúc tiêu đề Reddit posts: compound > 0.05 → Positive; < −0.05 → Negative; giữa → Neutral.
- **Gemini 3.1 Flash-Lite** nhận JSON (Top Charts + Mentions + Score) → sinh bản tin có cấu trúc **5 mục:** overview · top_charts · tiktok · community · forecast.
- Có `_fallback_briefing()` khi Gemini lỗi/hết quota.

### E.8 — EDA (dùng cho slide 8, số minh họa)
- Phân phối **long-tail / Pareto** — Top 1 áp đảo, quy luật 80/20.
- Số minh họa cho pgfplots (playcount triệu, rank 1→15): 158, 60, 60, 58, 57, 51, 44, 39, 35, 30, 27, 24, 21, 19, 17. Đường cumulative chạm ~80% quanh rank 4.
- EDA + train XGBoost làm trong Kaggle notebook `music-monitor-eda-training.ipynb`.

### E.9 — World Map / K-Means
- **K-Means**, `n_clusters = 6`, `random_state = 42`. **89 quốc gia** (tài liệu code ghi "80+", bản tham khảo ghi 89 — dùng **89**).
- Vector đặc trưng: tần suất **16 thể loại** mỗi quốc gia (pop, hip-hop, k-pop, rock, electronic, indie, r&b, latin, jazz, classical, metal, country, reggae, folk, dance, alternative).
- **PCA(2)** để visualize. Nhãn cụm = thể loại trội: "POP-dominant", "LATIN-dominant"…
- Dữ liệu: Deezer chart + Last.fm tags. Cache `map_cache.json` — lần đầu ~60–90s.
- Insight nổi bật: **Việt Nam → LATIN-dominant** (cụm dị biệt) — Gemini giải thích nguyên nhân văn hóa.

### E.10 — Trending / Viral
- **Z-score** trên chuỗi tăng view, ngưỡng spike = **2.5** (cần ≥ 5 điểm dữ liệu).
- **Isolation Forest**, `contamination = 0.1` — đánh dấu bài bất thường.
- **Viral Score (0–100)** = 50%·YouTube growth + 30%·Reddit mentions + 20%·YouTube comments.
- Xếp hạng theo **Velocity** (vận tốc tăng). Nút "Tại sao viral?" → Gemini tổng hợp.

### E.11 — Social Listening
- Đa subreddit: r/Music, r/kpop, r/hiphopheads. VADER → Pos/Neu/Neg + Mentions 24h.
- Gemini Contextual Insight: Chủ đề chính · Mức độ quan tâm · Góc nhìn cộng đồng · Tác động truyền thông.

### E.12 — Hit Prediction
- **XGBoost**, model `hit_predictor.joblib` (~240KB), lazy-load.
- **11 features:** youtube_growth_24h/48h/7d, reddit_mentions_24h, youtube_comments, lastfm_playcount, lastfm_listeners, genre_popularity, artist_playcount, month, holiday_season_flag.
- Pipeline `/predict/quick`: Deezer validate → YouTube stats → **decay_factor** theo tuổi MV → Reddit mentions → Last.fm tags → XGBoost `predict_proba`.
- Output: `hit_probability (%)`, `prediction` (label), `confidence`, `model_used`. Có preview 30s từ Deezer.

### E.13 — Explainable AI
- XGBoost output → SHAP weights / Feature rank / Score split → **Gemini phiên dịch** thành lời văn.
- **Risk tier:** Watch · Low confidence.
- **Radar 5 trục:** Memeability · Emotional Hook · Danceability · Lyrics · Shock Value.
- Hệ thống đưa **đề xuất hành động** (vd: TikTok/Shorts push, remix hook, playlist pitch).

### E.14 — AI Chat / ReAct Agent
- Agent **ReAct** (Reasoning + Acting). Mỗi bước output JSON: `{thought, action, input}` hoặc `{thought, final_answer}`.
- **Tối đa 6 vòng** tool. Streaming **SSE** (`data: {json}\n\n`).
- **Tools (7 nội bộ + web):** web_search/web_news (DuckDuckGo), get_global_charts, get_country_top, get_tiktok_trends, get_reddit_buzz, get_youtube_for_track, viral_score, artist_tags.
- **Graceful fallback:** tool lỗi → agent không crash, chuyển sang Internal Knowledge / thử tool khác.

### E.15 — Hạn chế / Technical debt (slide 15)
- Spike detection dùng `fake_history` 4 điểm → luôn trả `is_spike: False` (cần ≥ 5 điểm).
- `mock_growth_24h` ước tính từ tổng view — bài cũ nhiều view dễ bị coi là đang hot (decay_factor chỉ fix một phần).
- Gemini rate limiter (`asyncio.Lock`) chỉ an toàn 1 worker; multi-worker → vượt quota.
- `map_cache.json` không tự hết hạn — phải `DELETE /api/map/clusters/cache` thủ công.
- Code legacy: SQLAlchemy models, `claude_narrative.py`, `praw`, `sse-starlette` (cài nhưng không dùng); 2 route `/distribution/genre` trùng nhau.
- API keys & `firebase-cert.json` đã commit vào git — cần rotate + `.gitignore`.

### E.16 — Hướng phát triển (slide 16)
- Ghi snapshot lịch sử thật (YouTube view, chart) → trend detection chính xác.
- Tách scheduler thành service riêng (Celery + Redis).
- Map cache dùng Redis TTL (auto expire 24h) thay file JSON.
- Triển khai RBAC Admin/Viewer.
- Dọn dead code, gộp 2 kết nối Gemini làm 1.

---

## PHẦN F — Danh sách tài sản hình ảnh (Image Assets)

> Agent dùng `\imgplaceholder` cho mọi mục dưới đây + thêm comment `% [IMG] <tên file> — <mô tả>` ngay trên dòng đó. Người làm slide sẽ chụp ảnh thật và thay vào sau.

| Slide | Tên file gợi ý | Nội dung ảnh cần chụp | Bắt buộc? |
|---|---|---|---|
| 6 | `dashboard-fullpage.png` | Full trang `/dashboard` — Global Top 50 + MIS + AI Briefing panel | ✅ Bắt buộc |
| 9 | `worldmap-page.png` | Trang `/map` — bản đồ Leaflet tô màu cụm, có popup 1 quốc gia | ✅ Bắt buộc |
| 7 | `briefing-page.png` | Trang `/briefing` — các KPI card + AI Daily Briefing | ⭕ Tùy chọn (nếu dư chỗ thay 1 box bằng ảnh nhỏ) |
| 8 | `eda-pareto.png` | Biểu đồ Pareto từ Kaggle notebook | ⭕ Tùy chọn — mặc định **vẽ bằng pgfplots**, chỉ thay ảnh nếu có sẵn |
| 10 | `trending-page.png` | Trang `/trends` — viral ranking + heatmap | ⭕ Tùy chọn |
| 12 | `predict-page.png` | Trang `/predict` — form + kết quả xác suất + radar | ⭕ Tùy chọn |
| 14 | `chat-page.png` | Trang `/chat` — agent chat với trace thought/tool | ⭕ Tùy chọn |

**Quy tắc:** mặc định chỉ slide 6 và 9 dùng ảnh thật (2 ảnh "wow"). Các slide còn lại ưu tiên TikZ/pgfplots tự vẽ để deck compile được ngay mà không phụ thuộc ảnh. Nếu agent thấy 1 slide quá trống, có thể thêm `\imgplaceholder` tùy chọn theo bảng trên.

---

## PHẦN G — Checklist triển khai

### G.1 Trước khi viết LaTeX
- [ ] Copy preamble từ `slides_main.tex`, **thay khối `\definecolor`** bằng §B.1.
- [ ] Thêm 2 tikzset style `srcbox`, `aibox` (§B.3).
- [ ] Thêm macro `\imgplaceholder` (§B.4) + `\usepackage{fontawesome5}` nếu thiếu.
- [ ] (Tùy chọn) thêm `\eqbars` (§B.5).
- [ ] Đổi `\title/\subtitle/\author` (§B.1).
- [ ] Xóa các frame mẫu của template (LeJEPA): title slide cũ, outline cũ, toàn bộ slide nội dung cũ, glossary, references. Giữ lại khung `\begin{document}…\end{document}` + preamble.
- [ ] Đặt 5 `\section{}` đúng tên 5 chặng.

### G.2 Khi vẽ TikZ
- [ ] 5 nguồn dữ liệu luôn dùng `srcbox`; khối AI luôn dùng `aibox`; hạ tầng web dùng `pbox`/`darkbox`.
- [ ] Slide 3: bọc `\resizebox{\textwidth}{!}{...}` để vừa khít.
- [ ] Slide 14: vòng lặp ReAct dùng `fit` + dashed để bao "ReAct loop"; mũi tên vòng lại không cắt chéo.
- [ ] Mọi sơ đồ flow: mũi tên cùng độ dày, không chéo nhau (dùng góc cố định `out=/in=`).

### G.3 Khi vẽ pgfplots (slide 8)
- [ ] Bar chart giảm dần, bar #1 `maccent`, còn lại `mprimary!60`.
- [ ] Đường cumulative `mgood` trên trục y phải, chạm ~80%.
- [ ] Font tick/label `\tiny`.

### G.4 Sau khi compile (xelatex 2 lần)
- [ ] PDF đúng **18 trang**.
- [ ] Log: KHÔNG có error; overfull/underfull ≤ 5pt thì chấp nhận.
- [ ] Xem từng slide ở zoom 100% — chữ đọc được từ ~3m.
- [ ] Mỗi slide nội dung (2–16) có **đúng 1 takeaway**; slide 0,1,17 không có.
- [ ] Diacritics tiếng Việt hiển thị đúng (xelatex + metropolis xử lý — nếu lỗi, xem §H).
- [ ] Mỗi slide pass §C.6.

---

## PHẦN H — Bẫy thường gặp & cách tránh

### H.1 Lỗi compile
| Bẫy | Cách tránh |
|---|---|
| `Missing $ inserted` | Ký hiệu math (`_`, `^`, `\theta`…) chưa bọc `$...$` |
| `Undefined control sequence \mxxx` | Typo tên màu — chỉ có `mprimary/maccent/mgood/mbad/mgray/mdark/mlight*` |
| `\faXxx undefined` | Thiếu `\usepackage{fontawesome5}` hoặc tên icon sai |
| Tiếng Việt mất dấu | Phải compile bằng **xelatex** (không pdflatex). Metropolis tự nạp fontspec. Nếu vẫn lỗi, thêm `\usepackage{fontspec}` và đặt main font có dấu tiếng Việt (vd `\setsansfont{Latin Modern Sans}` hoặc font hệ thống sẵn có) |
| `Dimension too large` trong TikZ | Toạ độ quá lớn — bọc `\resizebox` (slide 3) |
| Compile được nhưng sai số trang | Đếm lại `\begin{frame}` — phải đúng 18 |

### H.2 Lỗi thiết kế
| Bẫy | Cách tránh |
|---|---|
| Slide 3 quá dày | `\resizebox`, nhãn `\scriptsize`, mũi tên cùng độ dày |
| Slide 14 vòng lặp rối | Dùng `fit` cho khung, mũi tên vòng đi vòng ngoài, không cắt qua box |
| Slide 15 chữ quá nhỏ | `\footnotesize` cho bullet, mỗi bullet ≤ 1 dòng, 2 cột rõ ràng |
| Quá nhiều màu 1 slide | Tối đa 3 màu vai trò/slide |
| Ảnh placeholder làm deck xấu | `\imgplaceholder` đã có viền dashed + icon — chấp nhận được; nhắc người làm thay ảnh thật |

### H.3 Lỗi nội dung
| Bẫy | Cách tránh |
|---|---|
| Bịa số liệu | Chỉ dùng số ở §E. Không có trong §E → không ghi số |
| Nhầm "80+" vs "89 quốc gia" | Dùng thống nhất **89** (§E.9) |
| Quên fallback của Gemini/Agent | Slide 7 ghi rõ có fallback; slide 14 ghi rõ graceful fallback |
| Slide 15 chỉ khen, không chê | Phải đủ 5 hạn chế thật từ §E.15 |
| Trộn vai trò màu | nguồn dữ liệu = `srcbox`, AI = `aibox` — không đổi chỗ |

---

*Hết Plan. Khi đồng ý, agent triển khai theo `prompts_gemini_music_monitor.md` — 7 batch, mỗi batch tự compile + kiểm lỗi trước khi sang batch sau.*
