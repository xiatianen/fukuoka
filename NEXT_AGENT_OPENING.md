你好，你要接手一個**進行中、且已大致完成**的專案。請先讀完這段、照最後的指示做。

## 專案一句話
這是「福岡 8/7–8/11 五天四夜」旅遊規劃案（使用者選定 **方案 A** 並多次客製）。目前有**兩個已完成並部署/更新的產出**：
1. **互動式網頁地圖**（手機+電腦友善、逐日路線+所有交通方式）— 已推上 GitHub `xiatianen/fukuoka` → Cloudflare Pages 自動部署。
2. **簡報 PPTX/PDF**（方案 A）— 已依最新行程重新產生（本機 `decks\`）。

工作大多是**繼續微調行程、網站或簡報**，兩邊資料要同步。

## 你的第一步（務必照做）
1. 工作目錄 `C:\fukuoka`。先**完整讀** `C:\fukuoka\HANDOFF.md`（自足，涵蓋最終行程、檔案、網站資料模型、簡報建置、部署、環境地雷、已做的審查、下一步候選）。
2. 接著讀 `C:\fukuoka\data.js`（網站行程資料，權威）與 `C:\fukuoka\data\planA.json`（簡報資料，已與 data.js 同步）。
3. 瞄一眼 `C:\fukuoka\assets\img\` 的景點照片。

## 重點提醒
- **改行程**：網站幾乎只動 `data.js` 的 `DAYS`；簡報動 `data\planA.json`（景點中文名靠 `assets\credits.json`）。**兩邊要一起改、保持同步**。
- **網站部署**：`git push origin main` → Cloudflare 自動部署。repo 是**純靜態**（無 package.json、無建置步驟）。
- **網站驗證**：本機有 Chrome，可用 `--headless --screenshot` 截圖核對（HANDOFF §9 有指令）；改完務必截圖驗證再 push。
- **簡報重生**：`PYTHONIOENCODING=utf-8 python build/make_all.py A` 後轉 PDF（HANDOFF §6）。⚠️ 若使用者用 **Adobe Acrobat** 開著舊 PDF 會鎖檔無法覆寫，需先關掉該程序。
- **最新行程（第二輪省力動線版）**：Day1 抵達→Day2＝小倉+皿倉山夜景**＋宿小倉**→Day3＝**福岡室內悠閒日**（天神購物+shin shin+Canal City+一蘭演舞+中洲屋台，**不排 teamLab**）→Day4＝**太宰府+星巴克+竈門+柳川若松屋鰻魚+敘敘苑燒肉（輕裝）**→Day5 回程。住宿：福岡三晚 Hotel Il Palazzo＋8/8 宿小倉。每天約 10:00 出發（Day1 抵達、Day5 趕機例外）。詳見 HANDOFF §3。
- **線上網址**在使用者的 Cloudflare 儀表板；`fukuoka.pages.dev` 是別人的同名專案、不是這個。

## 然後——待命
讀完後，用 **3–5 句話**回報你已掌握的內容（兩個產出的現況 + 最新行程骨架 + 你知道改網站/改簡報各要動哪些檔），並列出 **1–2 個**你預期需要使用者拍板的決策點（例如：是否要做 Day3 保險時間表、是否要 GPX/列印版、行程還要不要再微調）。

**然後停下來等使用者指示，先不要改任何檔案。** 使用者會說接下來要做什麼。
