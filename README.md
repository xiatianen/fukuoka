# 福岡 5 天 4 夜 · 經典均衡 — 互動行程地圖

一個手機／電腦皆友善的互動式網頁地圖，呈現福岡之旅（方案 A「經典均衡」，2026/8/7–8/11）的**逐日路線、景點與所有交通方式**。

> 線上版本：透過 GitHub → Cloudflare Pages 自動部署。

## 功能
- **逐日切換 + 全程總覽**：Day 1–5 各有專屬主軸色；「總覽」模式一次看完五日地理跨度。
- **交通是一等公民**：每段移動依交通方式（🚆 鐵道 / 🚶 徒步 / ⛴️ 渡船 / 🚌 巴士 / 🚕 計程車）以不同線型呈現，含時間、班次與票價，點線即見詳情。
- **景點資訊卡**：編號 marker ↔ 側欄時間軸雙向連動，含照片、時間、說明與抵達交通。
- **資訊面板**：三大必去、規劃前提、住宿建議、五大規劃邏輯。
- **響應式**：桌機左側欄；手機底部抽屜（可上滑展開、下滑收合）。

## 技術
- [Leaflet 1.9.4](https://leafletjs.com/)（本地 vendored，無 CDN 依賴）+ CARTO Voyager 免金鑰底圖。
- 純前端靜態站：`index.html` + `app.js` + `data.js` + `styles.css`，零建置步驟。

## 檔案
```
index.html        入口
styles.css        樣式（海軍藍 × 金品牌）
data.js           行程資料（停點 / 座標 / 交通段）
app.js            地圖與互動邏輯
vendor/leaflet/   Leaflet 函式庫（本地）
assets/img/       景點照片（Wikimedia Commons，自由授權）
```

## 在本機預覽
直接以瀏覽器開啟 `index.html` 即可；或起一個簡易伺服器：
```bash
npx serve .          # 或 python -m http.server
```

## 部署（Cloudflare Pages）
本 repo 根目錄即為網站根目錄，**無需建置指令**（Build command 留空、Output directory 設為 `/`）。推到 `main` 分支即自動部署。

---
圖片來源：Wikimedia Commons（自由授權），詳見 `assets/IMAGE_CREDITS.md`。
交通班次／票價請於出發前以乘換案內再次確認。
