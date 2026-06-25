你好，你要接手一個**進行中、且已大致完成並部署**的專案。請先讀完這段，照最後指示做。

## 專案一句話
「福岡 8/7–8/11 五天四夜」旅遊規劃（使用者選 **方案 A · 經典均衡**，已多輪客製）。兩個已完成並部署的產出：
① **互動式網頁地圖**（逐日路線＋每段交通＋訂票/訂位＋估價＋真實鐵軌路徑，**外加一層「現場工具」**：離線 PWA、現在視圖、定位、一鍵導航/撥號、費用、雨備、日語句）— 已推上 GitHub `xiatianen/fukuoka` → Cloudflare Pages 自動部署；
② **簡報 PPTX/PDF（13 頁）** — 本機 `C:\fukuoka\decks\`。

## 你接下來的任務：繼續改行程
使用者**還有行程要改**（可能是加/刪/換景點或餐廳、改某天動線、再換飯店、改文案或費用…）。他讀完你的回報後，會給你**具體要改的點**。

## 你的第一步（務必照做）
1. 工作目錄 `C:\fukuoka`。**完整讀** `C:\fukuoka\HANDOFF.md`（自足文件）。**特別精讀**：
   - **§A「如何改行程」** — 一張表告訴你「改什麼 → 牽動 data.js / routes.js / field.js / 簡報 哪幾層」，以及換飯店、重生路徑、重生簡報的精確步驟。
   - **§5.5「現場工具層 field.js」** — 本專案最近新增、最容易忽略的一層：所有現金/雨備/訂位/日文地址/末班等，是用 **stop id 外掛在 field.js 的常數表**裡。**增刪或改名停點時，data.js、routes.js、field.js 三邊都要顧。**
2. 掃一眼 `data.js`（行程權威）、`field.js`（現場工具層）、`data\planA.json`（簡報源）、`routes.js`（路徑幾何）。

## 心裡先有的幾個重點（細節都在 HANDOFF）
- **現任飯店**：COCO Gofukumachi（博多上呉服町、呉服町站旁，座標 33.5976,130.4117）、四晚不換房、北九州當日來回。
- **已填實際購入價**：機票 2 人來回 NT$33,048、住宿 4 晚 2 人 NT$14,605；每人合計約 NT$30,000–34,000。
- **改到座標/停點順序/飯店 → 必重生 `routes.js`**（`build/gen_routes_google.py` 需 Google API key 由 env 傳入 + `gen_routes_rail.py` OSM 鐵軌），改完截 `#d1–#d4` 驗證。
- **改到停點 id / 增刪停點 → 同步 field.js 對應表**（JA/CASH/DEADLINE/SUN/WARN/RESERVE/RAIN）。
- **改到 JS → 先 `node --check`**（field.js 字串多、易出現引號不對稱的語法錯）。
- ⚠️ **repo 是 public**：Google API key 等任何金鑰**絕不可寫進檔案或 commit**，只在本機 env 用。
- git 追蹤的網站檔：`index.html app.js field.js data.js routes.js styles.css sw.js manifest.webmanifest assets/ data/*.json *.md`；`build/`、`decks/`、`_*.png` 不追蹤。push 到 `main` 即自動部署。

## 然後——待命
讀完後，用 **3–5 句話**回報：① 兩個產出的現況、② 你已掌握「改某類東西會牽動哪幾層（data.js／routes.js／field.js／簡報）」、③ 你需要使用者提供什麼（**具體要改的行程點**；若涉及換飯店則要新飯店名稱+精確 lat/lng；若要重生路徑則要那把 **Google API key**）。

**然後停下來等使用者給指令，先不要改任何檔案。**
