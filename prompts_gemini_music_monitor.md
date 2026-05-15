# Prompts cho Gemini 3 (Antigravity) — Triển khai `slides_music_monitor.tex` theo 7 batch

> **Mục đích:** chia plan thành 7 prompt nhỏ. Mỗi prompt chỉ yêu cầu agent đọc 1–2 phần của plan, viết LaTeX, **tự compile bằng xelatex (hoặc pdflatex nếu cần), tự đọc log, tự sửa lỗi** đến khi sạch, rồi mới dừng. Sau mỗi batch bạn review PDF rồi chạy batch tiếp.
>
> **Agent đích:** Gemini 3 Pro trong Antigravity — môi trường agentic có terminal. Agent **tự chạy lệnh compile** và **tự fix** — bạn không cần copy log thủ công như với chatbot thường.

## Cách dùng

1. Đảm bảo agent có quyền đọc 3 file trong thư mục dự án:
   - `slides_main.tex` — template gốc (tham chiếu preamble/style).
   - `Plan_Slides_Music_Monitor.md` — plan thiết kế chi tiết.
   - `slides_music_monitor.tex` — file đang xây (tạo ở Batch 1).
2. Copy nguyên 1 prompt batch → paste vào Antigravity.
3. Agent tự làm + tự compile + tự fix. Khi agent báo xong → mở PDF review.
4. Nếu chưa ưng → mô tả chỗ cần sửa, hoặc chạy lại prompt batch kèm ghi chú. Nếu ưng → sang batch tiếp.

## Lệnh compile chuẩn (agent dùng trong mọi batch)

```bash
xelatex -interaction=nonstopmode -halt-on-error slides_music_monitor.tex
xelatex -interaction=nonstopmode -halt-on-error slides_music_monitor.tex
```
Chạy **2 lần** (để Metropolis + section ổn định). Sau đó đếm số trang PDF (`pdfinfo slides_music_monitor.tex.pdf` hoặc `pdfinfo slides_music_monitor.pdf`).

## Tổng quan 7 batch

| # | Phạm vi | Slide tạo | Sau khi xong |
|---|---|---|---|
| 1 | Preamble (đổi palette) + Title + Outline | 0, 1 | 2 trang PDF |
| 2 | §1 Tổng quan & Kiến trúc | 2, 3, 4, 5 | 6 trang |
| 3 | §2 Thu thập & Trực quan hóa | 6, 7, 8 | 9 trang |
| 4 | §3 Phân tích thông minh | 9, 10, 11 | 12 trang |
| 5 | §4 Dự đoán & AI Agent | 12, 13, 14 | 15 trang |
| 6 | §5 Đánh giá & Kết luận | 15, 16, 17 | 18 trang |
| 7 | Audit cuối + fix nhỏ | — | bản final |

## Quy tắc CHUNG cho mọi batch (agent phải luôn tuân thủ)

- **Ngôn ngữ slide:** tiếng Việt. **Compile:** `xelatex` (KHÔNG pdflatex).
- **Chỉ APPEND**, không sửa phần đã duyệt ở batch trước (trừ Batch 7).
- Sau khi viết: **tự compile 2 lần, tự đọc log, tự sửa** mọi error đến khi compile sạch. Chỉ báo "xong" khi PDF ra đúng số trang.
- **Số liệu chỉ lấy từ §E của plan.** Không bịa con số.
- **Ảnh:** mọi screenshot dùng macro `\imgplaceholder{...}` + thêm comment `% [IMG] <tên file> — <mô tả>` ngay trên. KHÔNG vẽ lại UI bằng TikZ.
- **Màu theo vai trò:** nguồn dữ liệu = `srcbox`, khối AI = `aibox`, hạ tầng web = `pbox`/`darkbox`. Tối đa 3 box màu & 3 màu vai trò mỗi slide.
- **Output:** chỉ raw LaTeX trong file, KHÔNG bọc markdown, KHÔNG giải thích dài dòng — chỉ cần báo ngắn gọn kết quả compile + số trang.

---

## BATCH 1 — Preamble (đổi palette) + Slides 0–1

```
Bạn là chuyên gia LaTeX Beamer + TikZ. Tôi đang làm slide thuyết trình môn "Phân tích Dữ liệu Thông minh" cho đề tài web app "World Music Intelligence Monitor" — một trang web phân tích & cập nhật bản tin âm nhạc toàn cầu realtime. Nhóm: SonicT2All.

NHIỆM VỤ BATCH 1 — TẠO FILE `slides_music_monitor.tex` gồm:
(a) Toàn bộ preamble — copy từ `slides_main.tex` NHƯNG đổi palette + thêm style mới.
(b) Slide 0 — Title [plain].
(c) Slide 1 — Outline 5 chặng.
(d) Khung \begin{document}...\end{document} đầy đủ, compile được.

ĐỌC:
1. `slides_main.tex` từ dòng 1 đến trước \begin{document} — copy NGUYÊN preamble (documentclass, theme metropolis, packages, mdframed boxes, tikzset, \takeaway, \setbeamercolor...).
2. `Plan_Slides_Music_Monitor.md` các phần: §B.1 (đổi palette + metadata), §B.3 (2 tikzset style mới), §B.4 (macro \imgplaceholder), §B.5 (\eqbars tùy chọn), §A.4 (tổng quan 18 slide), §D Slide 0 và Slide 1, §C.5 (ngân sách slide 0, 1), §E.0 và §E.1 (thông tin nhóm & tổng quan).

THAY ĐỔI Ở PREAMBLE (so với template):
- Thay NGUYÊN khối \definecolor bằng bảng "Music Vibrant" trong §B.1 (giữ y nguyên TÊN biến màu để box/tikzset cũ vẫn chạy).
- Thêm 2 style `srcbox` và `aibox` vào khối \tikzset (§B.3) — KHÔNG sửa style cũ.
- Thêm macro `\imgplaceholder` (§B.4). Thêm `\usepackage{fontawesome5}` nếu preamble chưa có.
- (Tùy chọn) thêm macro `\eqbars` (§B.5).
- Đổi \title / \subtitle / \author theo §B.1.
- XÓA mọi nội dung mẫu của template (LeJEPA): title slide cũ, các slide nội dung, glossary, references. CHỈ giữ preamble + khung document rỗng.

VIẾT SLIDE:
- Slide 0 [plain]: 2 cột. Trái: tên đề tài lớn (mprimary), dòng phụ italic, tên nhóm, môn học, GVHD + 5 thành viên (§E.0). Phải: sơ đồ TikZ "hệ sinh thái" — 1 node aibox trung tâm, 5 srcbox nguồn tỏa quanh (Last.fm/YouTube/Reddit/Deezer/Spotify, có icon FontAwesome nếu có), 3 pbox đầu ra dưới. KHÔNG takeaway.
- Slide 1: tiêu đề "Lộ Trình Trình Bày". Sơ đồ 5 stepbox ngang (TỔNG QUAN / TRỰC QUAN HÓA / PHÂN TÍCH / DỰ ĐOÁN / ĐÁNH GIÁ) — step 3 highlight maccent + \faStar. Dưới: 1 accentbox 1 dòng italic. KHÔNG takeaway.

CONSTRAINT: slide 0 ≤ 25 từ, slide 1 ≤ 35 từ. Frame title slide 1 ≤ 46 ký tự.

TỰ KIỂM TRA:
- Chạy: xelatex -interaction=nonstopmode -halt-on-error slides_music_monitor.tex (2 lần).
- Tự đọc log, tự fix mọi error đến khi compile sạch.
- Kiểm tra PDF đúng 2 trang. Kiểm tra tiếng Việt hiển thị đúng dấu (nếu sai dấu — xem §H.1 của plan).
- Báo cáo: số trang PDF + "compile sạch" + danh sách lỗi đã fix (nếu có).

OUTPUT: chỉ raw LaTeX trong file. Không viết slide khác.
```

---

## BATCH 2 — §1 Tổng Quan & Kiến Trúc (Slides 2–5)

```
Tiếp tục `slides_music_monitor.tex`. File hiện có preamble + slide 0–1. Bây giờ thêm \section{Tổng Quan \& Kiến Trúc} và 4 slide nội dung.

ĐỌC `Plan_Slides_Music_Monitor.md`:
- §D Slide 2, 3, 4, 5 (thiết kế chi tiết).
- §C.5 hàng slide 2–5 (ngân sách số từ / box / bullet).
- §C.4 (7 quy tắc layout — đặc biệt single-focus + white-space ≥ 25%).
- §E.1, E.2, E.3, E.4, E.5 (số liệu: tổng quan, kiến trúc, 5 nguồn, polling, bảo mật).
- §B.3 (nhắc lại: srcbox cho nguồn, aibox cho AI, pbox/darkbox cho hạ tầng).

NHIỆM VỤ:
- Thêm \section{Tổng Quan \& Kiến Trúc} trước slide 2.
- Slide 2 "Bài Toán & Giải Pháp": 2 cột + 1 sơ đồ TikZ "before→after" ngang đầu slide. Cột trái badbox "Trước đây" (2 bullet), cột phải goodbox "Music Monitor" (2 bullet). Takeaway theo plan.
- Slide 3 "Kiến Trúc Hệ Thống": TOÀN slide là 1 sơ đồ TikZ lớn bọc \resizebox{\textwidth}{!}{...} — 4 tầng dọc (Frontend / Backend / AI+External / Data Layer). Tầng 3 chia 2 cụm: 5 srcbox + 3 aibox. Mũi tên nối các tầng. Footer 1 dòng tiny. Text rất ít (≤ 30 từ).
- Slide 4 "Data Pipeline": sơ đồ flow ngang (5 srcbox → Scheduler → Firestore) + 3 bullet + 1 primarybox. Last.fm dùng arr liền, 4 nguồn kia darr "on-demand".
- Slide 5 "Bảo Mật & Định Danh": 2 cột. Trái sơ đồ flow auth (Người dùng → Clerk Middleware → nhánh public/protected). Phải 1 primarybox + 1 goodbox, mỗi box 2 bullet.

CONSTRAINT:
- Slide 2 ≤ 70 từ, 2 box. Slide 3 ≤ 30 từ, 1 box, ≤ 11 module + ≤ 9 mũi tên (ngoại lệ cho slide kiến trúc). Slide 4 ≤ 60 từ. Slide 5 ≤ 65 từ, 2 box.
- Mỗi bullet ≤ 55 ký tự, 1 dòng. Frame title ≤ 46 ký tự. Mỗi slide đúng 1 takeaway.

TỰ KIỂM TRA: compile xelatex 2 lần, tự fix đến sạch, PDF đúng 6 trang. Báo cáo số trang + lỗi đã fix.

OUTPUT: chỉ APPEND code mới, KHÔNG sửa preamble + slide 0–1. Chỉ raw LaTeX.
```

---

## BATCH 3 — §2 Thu Thập & Trực Quan Hóa (Slides 6–8)

```
Tiếp tục `slides_music_monitor.tex`. File hiện có 6 slide. Thêm \section{Thu Thập \& Trực Quan Hóa} và 3 slide.

ĐỌC `Plan_Slides_Music_Monitor.md`:
- §D Slide 6, 7, 8.
- §C.5 hàng slide 6–8.
- §B.4 (cách dùng \imgplaceholder + comment % [IMG]).
- §F (danh sách ảnh — slide 6 bắt buộc ảnh thật).
- §E.6, E.7, E.8 (số liệu: Dashboard, Daily Briefing & VADER, EDA).

NHIỆM VỤ:
- Thêm \section{Thu Thập \& Trực Quan Hóa} trước slide 6.
- Slide 6 "Dashboard": 2 cột. Trái (~58%): \imgplaceholder[\linewidth]{...} cho screenshot trang /dashboard + comment "% [IMG] dashboard-fullpage.png — ...". Phải (~40%): 4 bullet có icon + 1 accentbox mini chứa định nghĩa MIS.
- Slide 7 "Daily Briefing & Phân Tích Cảm Xúc": sơ đồ pipeline ngang (3 srcbox → VADER aibox → JSON pbox → Gemini aibox → goodbox bản tin) + 2 box dưới (primarybox "Đầu vào", goodbox "Đầu ra 5 mục").
- Slide 8 "EDA — Phân Phối Dữ Liệu": 1 biểu đồ pgfplots LỚN — bar chart giảm dần (Pareto, dùng số minh họa ở §E.8: 158,60,60,58,57,51,44,39,35,30,27,24,21,19,17) + đường cumulative mgood chạm ~80%. Bar #1 maccent, còn lại mprimary!60. Kèm 3 bullet + 1 accentbox mini.

CONSTRAINT:
- Slide 6 ≤ 60 từ, 2 box, 1 ảnh. Slide 7 ≤ 70 từ, 2 box. Slide 8 ≤ 55 từ, 1 box, 1 pgfplot (KHÔNG kèm TikZ trung tâm khác).
- Frame title ≤ 46 ký tự. Mỗi slide đúng 1 takeaway. Font tick/label pgfplots = \tiny.

TỰ KIỂM TRA: compile xelatex 2 lần, tự fix đến sạch, PDF đúng 9 trang. Kiểm tra pgfplots render đúng (không tràn khung). Báo cáo số trang + lỗi đã fix.

OUTPUT: chỉ APPEND. Chỉ raw LaTeX.
```

---

## BATCH 4 — §3 Phân Tích Thông Minh (Slides 9–11)

```
Tiếp tục `slides_music_monitor.tex`. File hiện có 9 slide. ĐÂY LÀ CHẶNG TRỌNG TÂM của môn học (phân tích dữ liệu). Thêm \section{Phân Tích Thông Minh} và 3 slide.

ĐỌC `Plan_Slides_Music_Monitor.md`:
- §D Slide 9, 10, 11.
- §C.5 hàng slide 9–11.
- §E.9, E.10, E.11 (số liệu: K-Means/89 quốc gia, Z-score/Isolation Forest/Viral Score, Social Listening).
- §F (slide 9 bắt buộc ảnh thật worldmap-page.png).

NHIỆM VỤ:
- Thêm \section{Phân Tích Thông Minh} trước slide 9.
- Slide 9 "World Map — Phân Cụm K-Means": 2 cột. Trái (~46%): mini-flow dọc K-Means (srcbox 89 quốc gia → pbox vector 16 thể loại → aibox K-Means k=6 → pbox PCA 2D → goodbox nhãn cụm). Phải (~50%): \imgplaceholder cho ảnh /map + comment % [IMG]. Dưới: 1 accentbox mini về dị biệt Việt Nam → Latin-dominant.
- Slide 10 "Trending — Phát Hiện Viral": 2 cột. Trái: mini-sơ đồ (3 srcbox → aibox Viral Score → goodbox 0–100) + 1 primarybox chứa công thức "Viral = 50%·YouTube + 30%·Reddit + 20%·Comments". Phải: 4 bullet (Z-score ngưỡng 2.5, Isolation Forest, Velocity, accentbox "Tại sao viral?").
- Slide 11 "Social Listening": sơ đồ flow ngang (3 chip srcbox subreddit → VADER aibox → Gemini aibox → goodbox) + 2 box dưới (primarybox "VADER chấm gì", goodbox "Gemini phân tích gì" 4 bullet 2x2).

CONSTRAINT:
- Slide 9 ≤ 65 từ, 2 box, 1 ảnh + 1 mini-flow. Slide 10 ≤ 70 từ, 2 box. Slide 11 ≤ 65 từ, 2 box.
- DÙNG THỐNG NHẤT "89 quốc gia" (không phải "80+"). Frame title ≤ 46 ký tự. Mỗi slide đúng 1 takeaway.

TỰ KIỂM TRA: compile xelatex 2 lần, tự fix đến sạch, PDF đúng 12 trang. Báo cáo số trang + lỗi đã fix.

OUTPUT: chỉ APPEND. Chỉ raw LaTeX.
```

---

## BATCH 5 — §4 Dự Đoán & AI Agent (Slides 12–14)

```
Tiếp tục `slides_music_monitor.tex`. File hiện có 12 slide. Thêm \section{Dự Đoán \& AI Agent} và 3 slide.

ĐỌC `Plan_Slides_Music_Monitor.md`:
- §D Slide 12, 13, 14.
- §C.5 hàng slide 12–14.
- §C.3 (giới hạn mũi tên — slide 14 ngoại lệ).
- §E.12, E.13, E.14 (số liệu: XGBoost/11 features, Explainable AI/radar, ReAct Agent/7 tools).

NHIỆM VỤ:
- Thêm \section{Dự Đoán \& AI Agent} trước slide 12.
- Slide 12 "Hit Prediction — XGBoost": sơ đồ pipeline ngang (pbox người dùng nhập → 4 srcbox song song Deezer/YouTube/Reddit/Last.fm → pbox 11 features → aibox XGBoost → goodbox xác suất Hit) + nửa dưới: 1 primarybox "11 đặc trưng" + 2 bullet + 1 accentbox mini.
- Slide 13 "Giải Thích Dự Đoán — Explainable AI": 2 cột. Trái (~52%): sơ đồ "giải mã hộp đen" (pbox XGBoost output → 3 nhánh SHAP/Feature rank/Score split → aibox Gemini phiên dịch → goodbox lời văn → srcbox Risk tier → goodbox đề xuất). Phải (~44%): 1 radar chart mini ngũ giác (5 trục: Memeability/Emotional Hook/Danceability/Lyrics/Shock Value, đa giác maccent mờ) + 1 primarybox mini.
- Slide 14 "AI Chat — ReAct Agent": TOÀN slide là 1 sơ đồ vòng lặp ReAct dọc LỚN (chiếm ~75%). gbox Người dùng → khung dashed "ReAct loop" (dùng fit) chứa: abox Thought → pbox Action → rbox Observation → srcbox Thought 2 tự phục hồi → mũi tên vòng lại Action (tối đa 6 vòng) → khung → gbox Final answer. Footer 1 dòng tiny "7 tool nội bộ + DuckDuckGo · SSE · tối đa 6 vòng". Text tối thiểu (≤ 40 từ).

CONSTRAINT:
- Slide 12 ≤ 70 từ, 2 box. Slide 13 ≤ 70 từ, 2 box. Slide 14 ≤ 40 từ, 1 box, mũi tên có thể tới 9 (ngoại lệ).
- Frame title ≤ 46 ký tự. Mỗi slide đúng 1 takeaway. Slide 14 vòng lặp KHÔNG để mũi tên cắt chéo qua box.

TỰ KIỂM TRA: compile xelatex 2 lần, tự fix đến sạch, PDF đúng 15 trang. Kiểm tra sơ đồ ReAct slide 14 không tràn khung. Báo cáo số trang + lỗi đã fix.

OUTPUT: chỉ APPEND. Chỉ raw LaTeX.
```

---

## BATCH 6 — §5 Đánh Giá & Kết Luận (Slides 15–17)

```
Tiếp tục `slides_music_monitor.tex`. File hiện có 15 slide. Thêm \section{Đánh Giá \& Kết Luận}, 3 slide cuối, và đảm bảo có \end{document}.

ĐỌC `Plan_Slides_Music_Monitor.md`:
- §D Slide 15, 16, 17.
- §C.5 hàng slide 15–17 (slide 15 là NGOẠI LỆ 10 bullet).
- §E.15, E.16 (số liệu: hạn chế/technical debt, hướng phát triển).

NHIỆM VỤ:
- Thêm \section{Đánh Giá \& Kết Luận} trước slide 15.
- Slide 15 "Điểm Mạnh & Hạn Chế": 2 cột bằng nhau. Trái: goodbox lớn "ĐIỂM MẠNH" 5 bullet \faCheck. Phải: badbox lớn "HẠN CHẾ / GIẢ ĐỊNH" 5 bullet \faTimes. Dưới: 1 primarybox full-width 1 dòng kết. Lấy đúng 5 hạn chế thật từ §E.15.
- Slide 16 "Hướng Phát Triển": 1 sơ đồ TikZ roadmap ngang 5 mốc (mỗi mốc 1 icon FontAwesome + 1 dòng ngắn), mốc 1 "Dữ liệu lịch sử thật" highlight maccent. Dưới: 1 accentbox mini full-width.
- Slide 17 "Cảm Ơn — QA & Demo" [plain]: căn giữa. "CẢM ƠN ĐÃ LẮNG NGHE" lớn (mprimary), tên đề tài + nhóm, dòng GVHD, 1 accentbox nhỏ "QA & DEMO". KHÔNG takeaway. (Tùy chọn \eqbars cuối).
- Thêm \end{document} nếu chưa có.

CONSTRAINT:
- Slide 15 ≤ 95 từ (NGOẠI LỆ), 3 box, 10 bullet (5+5), KHÔNG anchor TikZ — mỗi bullet ≤ 1 dòng cứng.
- Slide 16 ≤ 70 từ, 1 box. Slide 17 ≤ 20 từ, không takeaway.
- Frame title ≤ 46 ký tự. Slide 15, 16 có takeaway; slide 17 không.

TỰ KIỂM TRA: compile xelatex 2 lần, tự fix đến sạch, PDF đúng 18 trang. Báo cáo số trang + lỗi đã fix.

OUTPUT: chỉ APPEND + \end{document}. Chỉ raw LaTeX.
```

---

## BATCH 7 — Audit cuối & fix

```
File `slides_music_monitor.tex` đã đủ 18 slide. Batch cuối: AUDIT toàn bộ + fix lỗi nhỏ.

ĐỌC `Plan_Slides_Music_Monitor.md`: §C.5 (bảng audit per-slide), §C.6 (closing-the-door check), §G.4 (audit sau compile), §H (toàn bộ bẫy thường gặp).

NHIỆM VỤ — KIỂM TRA TỪNG SLIDE (0→17), với mỗi slide verify:
1. [ ] Đếm số từ (không kể caption/footnote) ≤ ngân sách §C.5.
2. [ ] Số box màu ≤ 3 (slide 15 = 3).
3. [ ] Frame title ≤ 46 ký tự.
4. [ ] Takeaway ≤ 90 ký tự, vừa 1 dòng — slide 2–16 CÓ takeaway, slide 0/1/17 KHÔNG.
5. [ ] Mỗi bullet ≤ 1 dòng cứng (không wrap).
6. [ ] Đúng 1 visual anchor mỗi slide nội dung.
7. [ ] Nguồn dữ liệu dùng srcbox, khối AI dùng aibox (không lẫn vai trò).
8. [ ] Mọi ảnh dùng \imgplaceholder + có comment % [IMG].
9. [ ] Không bịa số liệu — mọi con số khớp §E. Dùng "89 quốc gia" thống nhất.
10. [ ] Tiếng Việt hiển thị đúng dấu ở mọi slide.

NẾU CÓ VI PHẠM:
- In danh sách lỗi (slide nào, vi phạm gì).
- Sửa từng lỗi bằng cách edit đúng phần liên quan — KHÔNG viết lại toàn file.
- Báo cáo trước/sau.

KIỂM TRA COMPILE CUỐI:
- xelatex 2 lần. Log: 0 error; overfull/underfull > 5pt thì liệt kê và sửa nếu dễ.
- PDF đúng 18 trang. Xem thử vài slide ở zoom 100% — chữ đọc được, không tràn khung.

NẾU KHÔNG VI PHẠM: báo "All audits pass" + bảng 18 hàng × 10 cột (slide × check).

OUTPUT:
- Đầu: bảng audit.
- Giữa: danh sách lỗi + fix.
- Cuối: log compile cuối + xác nhận 18 trang.
KHÔNG viết lại toàn file — chỉ edit phần lỗi.
```

---

## Tip dùng prompts

### Khi agent ra sai
Antigravity tự compile & tự fix error rồi, nên lỗi còn lại thường là **lỗi thiết kế** (bố cục xấu, tràn khung, sơ đồ rối). Cách xử lý:
1. Chụp screenshot slide bị xấu.
2. Quote phần plan tương ứng (vd "§D Slide 14 nói khung ReAct loop phải dùng `fit`").
3. Paste cả 2 + "fix slide N theo plan, chỉ edit slide đó".

### Khi agent vượt ngân sách
```
Slide N vượt §C.5: [cụ thể vượt gì — vd 95 từ / 4 box]. Rút gọn về đúng ngân sách:
- Box tối đa 3, từ tối đa <số ở §C.5>, frame title tối đa 46 ký tự.
Đừng đổi thông điệp slide — chỉ gộp box / cắt chữ.
```

### Khi 1 slide quá phức tạp (vd slide 3 kiến trúc, slide 14 ReAct)
Chia làm 2 lượt:
1. Lượt A: dựng khung sơ đồ (các box + nhãn), chưa cần mũi tên.
2. Lượt B: thêm mũi tên + `\resizebox`/`fit` cho vừa khung.

### Khi tiếng Việt mất dấu
Nhắc agent: "Phải compile bằng **xelatex**, không pdflatex. Nếu vẫn mất dấu, thêm `\usepackage{fontspec}` và set một sans font có hỗ trợ tiếng Việt." (Xem §H.1 của plan.)

### Khi muốn thay ảnh thật
Sau khi có screenshot, đổi `\imgplaceholder[\linewidth]{...}` thành `\includegraphics[width=\linewidth]{ten_file.png}` — giữ nguyên width. Các file ảnh đặt cùng thư mục `.tex`.

---

*Hết. 7 batch đủ để hoàn thành `slides_music_monitor.tex` từ preamble đến PDF 18 trang final.*
