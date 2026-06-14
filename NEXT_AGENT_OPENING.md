你好，你要接手一個**進行中、且已大致完成**的專案。請先讀完這段、照最後指示做。

## 專案一句話
這是「福岡 8/7–8/11 五天四夜」旅遊規劃案（使用者選定 **方案 A** 並多次客製）。有**兩個已完成並部署/更新的產出**：① **互動式網頁地圖**（逐日路線＋每段交通＋訂票＋估價＋真實鐵軌路徑）— 已推上 GitHub `xiatianen/fukuoka` → Cloudflare Pages 自動部署；② **簡報 PPTX/PDF（13 頁）** — 本機 `C:\fukuoka\decks\`。

## 你接下來唯一的任務：換飯店
使用者**可能再把飯店換掉**（目前是「COCO Gofukumachi」，博多区上呉服町、座標 33.5976,130.4117，四晚都住、不換房）。若他要換，讀完你的回報後會給你**新飯店的名稱與位置**。

## 你的第一步（務必照做）
1. 工作目錄 `C:\fukuoka`。**完整讀** `C:\fukuoka\HANDOFF.md`（自足文件）。**特別精讀開頭的「§A. 如何換飯店」**——那是一份精確清單，列出換飯店要動的每個檔案與步驟。
2. 接著掃一眼 `C:\fukuoka\data.js`（網站行程／飯店資料，權威）、`C:\fukuoka\data\planA.json`（簡報源）、`C:\fukuoka\routes.js`（地圖真實路徑幾何）。

## 換飯店的重點（細節全在 HANDOFF §A，先有概念即可）
- 要動 **4 個地方**：`data.js`（網站，含 `META.home` 等 **3 處座標**＋飯店文案＋估價）、`routes.js`（**必須重生**，因飯店座標烤進 10 段路徑）、`data/planA.json`（簡報源）、`build/deckkit.js`（簡報住宿/結尾頁），再**重生簡報 PPTX/PDF**。
- **routes.js 重生**：改 `build/gen_routes_google.py` 與 `build/gen_routes_rail.py` 的 `H=[lat,lng]` 為新座標 → 跑 `gen_routes_google.py`（需 **Google API key**，使用者會給你一把可用的試用 key，用環境變數 `GOOGLE_API_KEY` 傳入、**不要寫進檔案或 commit**）→ 跑 `gen_routes_rail.py`（OSM 真實鐵軌、免 key）。
- 改完**務必用無頭 Chrome 截圖 `#d1–#d4` 驗證**飯店往返線正常（HANDOFF §10），再 `git add data.js routes.js data/planA.json` → push（CF 自動部署）；簡報是本機產物、可用 SendUserFile 傳給使用者。
- 若**新飯店不在中洲旁**（例如博多站/天神中心/藥院…），記得重評那些「步行」段是否要改地鐵/計程車（影響 `arrive.legs`/分鐘/mode）。
- 換飯店時順手查**新飯店 8 月旺季 2 人 1 室房價＋官方訂房 URL＋到中洲/天神/博多/屋台的步行或地鐵時間**（估價與文案要用）。

## 然後——待命
讀完後，用 **3–5 句話**回報：① 兩個產出的現況、② 你已掌握換飯店要動哪些檔（data.js／routes.js／planA.json／deckkit.js＋重生簡報）、③ 你需要使用者提供什麼（**新飯店名稱＋精確 lat/lng**，以及那把 **Google API key**）。

**然後停下來等使用者給新飯店的位置，先不要改任何檔案。**
