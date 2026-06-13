# 交接文件 — 福岡 8/7–8/11 旅遊專案（方案 A 定案 → 下一步：互動式網頁地圖）

> 給接手的 AI agent：這份文件是自足的（self-contained）。讀完即可掌握整個專案，不需要前一段對話的記憶。
> **下一階段任務 = 把「方案 A」做成一個互動式網頁地圖。但「怎麼畫」由使用者口頭指示，請先讀完、確認理解，然後待命，不要先動手寫地圖程式。**

---

## 0. 目錄
1. 專案背景與現況
2. 檔案總覽（C:\fukuoka）
3. 方案 A 完整行程（逐日逐點）
4. 方案 A 的「可上圖路線」（已整理好，地圖用）
5. 景點登錄表（key → 名稱 → 圖片 → 約略座標）
6. 圖片素材庫
7. 設計系統 / 品牌（方案 A 配色、字型）
8. 既有產出（簡報 PPTX/PDF）
9. 建置流程與腳本（如何重建簡報，地圖階段通常用不到，但列出備查）
10. 環境與已知地雷
11. 下一階段（互動地圖）的建議起手式

---

## 1. 專案背景與現況
- **行程**：福岡 5 天 4 夜，8/7（五）20:00 抵 FUK、8/11（二）11:00 起飛。
- **三大硬性需求（必去）**：皿倉山纜車夜景、太宰府、一蘭總本店 20:00 陽台演舞。
- **偏好**：不趕、大眾運輸、避熱（白天躲室內）、美術設計 / 咖啡甜點 / 購物 / 水族館港灣。
- **來源**：Google 試算表（共 5 個方案 A–E）
  `https://docs.google.com/spreadsheets/d/1tL2u2sfQBmk7SYtyPBHHYNLxwPhxmi_aPeHR-fK6wq4/edit?gid=925871456`
- **現況**：5 個方案的精美簡報（圖文並茂、含景點照片）已全部完成（PPTX + PDF）。
- **決定**：使用者最終**選定「方案 A — 經典均衡」**。
- **下一步**：把方案 A 畫成**互動式網頁地圖**（細節由使用者口述）。

---

## 2. 檔案總覽（工作目錄 `C:\fukuoka`）
```
C:\fukuoka\
├─ HANDOFF.md                 ← 本文件
├─ NEXT_AGENT_OPENING.md      ← 給下一個 agent 的開場白（可直接貼）
├─ sheet_925871456.csv        ← 原始試算表匯出（5 方案全部，233 行）
├─ full.xlsx                  ← 試算表 xlsx 匯出（備份）
├─ data\
│   ├─ bundle.json            ← 5 方案彙整
│   ├─ planA.json             ← ★方案 A 結構化資料（地圖主要資料源，見 §3）
│   ├─ planB.json … planE.json
│   └─ _premise.csv
├─ assets\
│   ├─ img\<key>.jpg          ← 25 張景點照片（見 §6）
│   ├─ credits.json           ← 每張圖的來源/檔名/授權連結/中文名
│   └─ IMAGE_CREDITS.md       ← 圖片來源清單（Wikimedia Commons）
├─ decks\
│   ├─ 方案A_經典均衡.pptx / .pdf   ← ★最終定案的簡報
│   └─ 方案B…E .pptx / .pdf
└─ build\                     ← 產生簡報的所有腳本（見 §9）
    ├─ parse.py  tag_spots.py  design_points.py  attractions.py
    ├─ deckkit.js  build.js  make_all.py
    ├─ fixcjk.py  render.py  pdf_export.py  fetch_img.py
    └─ node_modules\ (pptxgenjs 本地安裝)
```
**地圖階段最重要的兩個檔**：`data\planA.json`（行程資料）與 `assets\img\`（景點照）。

---

## 3. 方案 A 完整行程（逐日逐點）
> 權威資料在 `C:\fukuoka\data\planA.json`（欄位：`plan.days[].items[] = {time, act, trans, note}`）。以下為可讀版摘要。

**名稱**：方案 A — 經典均衡（CLASSIC BALANCE）
**一句話**：把三個硬需求各放進日曆上唯一/最佳可行日；一天一主軸、午間全冷氣、戶外只排晨昏。
**住宿**：建議住「中洲川端」(夾在博多與天神中間、空港線各 1 站、步行到一蘭/屋台 2–5 分)。首選「ザ ロイヤルパーク キャンバス 福岡中洲」。四晚不換飯店。
**一蘭演舞**：排 8/10（一）晚 20:00–20:15，本社陽台免費觀賞，看完接屋台宵夜。

### Day 1 — 8/7（五）抵達日（輕鬆落地）
| 時間 | 安排 | 交通 |
|---|---|---|
| 20:00–21:00 | 福岡機場國際線：入境、領行李、領網卡 | — |
| 21:00–21:30 | 前往中洲川端飯店 | 計程車 15–20 分（¥2,000–3,000） |
| 21:30–22:00 | 飯店 check-in | — |
| 22:00–23:00 | 飯店周邊覓食（川端通商店街 / 那珂川屋台 / 24h 一蘭總本店）| 徒步 2–8 分 |

### Day 2 — 8/8（六）北九州跨海日（全程最長、最重）
| 時間 | 安排 | 交通 |
|---|---|---|
| 07:45–08:05 | 飯店 → 博多駅 | 地鐵空港線 3 分 + 站內步行 |
| 08:10–09:50 | 博多 → 門司港 | JR 鹿兒島本線快速 ~1h36（¥1,500）|
| 09:50–10:25 | 門司港駅建築巡禮（站內星巴克）| 出站即達 |
| 10:30–10:35 | 關門汽船渡船 → 唐戶 | 渡船 5 分（¥400）|
| 10:40–11:50 | 唐戶市場「活きいき馬関街」壽司攤午餐 | 碼頭徒步 3 分 |
| 12:00–14:00 | 海響館水族館（避正午熱）| 市場旁徒步 2–3 分 |
| 14:20–14:25 | 渡船回門司港 | 渡船 5 分 |
| 14:30–16:30 | 門司港レトロ：藍翼吊橋・舊三井俱樂部・海峽プラザ・燒咖哩 | 各點徒步 3–5 分 |
| 16:45–17:20 | JR 門司港 → 八幡 | 快速 ~30 分 |
| 17:25–17:40 | 八幡駅 → 皿倉山山麓駅 | 免費接駁巴士 10 分 |
| 17:45–20:30 | 皿倉山：纜車上山看日落＋新日本三大夜景（日落 19:12）| 纜車+坡道車 10 分 |
| 20:40–22:35 | 下山回博多回飯店 | JR 区間快速 ~55 分 |

### Day 3 — 8/9（日）太宰府晨光 + 午後市區美術館（傍晚早歸）
| 時間 | 安排 | 交通 |
|---|---|---|
| 07:30–08:30 | 飯店 → 太宰府 | 地鐵+西鐵急行，門到門 55–60 分（¥480）|
| 08:30–09:30 | 太宰府參道 + 天滿宮 + 隈研吾星巴克 | 徒步即達 |
| 09:30–12:30 | 九州國立博物館（氷河期展 + 常設）| 虹のトンネル 全室內 5 分 |
| 12:30–13:35 | 回參道午餐（可吃一蘭太宰府店「合格碗」）| — |
| 13:51–14:35 | 太宰府 → 天神（「旅人」觀光列車）| ~40 分 |
| 15:00–17:15 | 福岡市美術館（達利/米羅/Warhol + 草間彌生《南瓜》）| 地鐵天神→大濠公園 5 分 |
| 17:15–18:15 | 大濠公園湖畔散步 + 茶屋 | 美術館即公園 |
| 18:30–19:00 | 回飯店（週日屋台多休，早歸泡大浴場）| 地鐵 6 分 |

### Day 4 — 8/10（一）全室內購物日 + teamLab（壓軸：一蘭演舞 + 屋台）
| 時間 | 安排 | 交通 |
|---|---|---|
| 09:00–10:30 | 悠閒早晨（飯店早餐 / 川端通咖啡）| — |
| 10:45–11:00 | 前往 BOSS E・ZO FUKUOKA（PayPayドーム旁）| 計程車 10–15 分 |
| 11:00–13:00 | teamLab Forest 福岡 | — |
| 13:00–14:00 | 午餐（E・ZO 3F 或回天神）| 計程車/地鐵 |
| 14:00–17:30 | 天神購物（岩田屋・三越・PARCO + 天神地下街）★伴手禮今天買齊 | 全程冷氣 |
| 17:45–19:25 | Canal City 博多：運河噴泉 + 晚餐 | 地鐵 3 分 + 步行 10 分 |
| 19:25–19:40 | 步行至一蘭本社総本店（中洲 5-3-2）卡位 | 徒步 10–15 分 |
| 20:00–20:15 | 一蘭和楽団演舞（本社陽台，免費）| — |
| 20:15–21:30 | 中洲屋台宵夜 + 那珂川河畔散步回飯店 | 沿河徒步 8–10 分 |

### Day 5 — 8/11（二）回程日（早上只做一件事：去機場）
| 時間 | 安排 | 交通 |
|---|---|---|
| 07:30–08:25 | 早餐 + 退房 | — |
| 08:30–08:55 | 前往福岡機場國際線航廈 | 計程車 15–20 分（直達國際線）|
| 09:00–11:00 | 報到、安檢、免稅店補貨；11:00 起飛 | — |

---

## 4. 方案 A 的「可上圖路線」（已整理，地圖直接可用）
> 我已把每天的**可定位停點**依序整理好，並對應到 §5 的景點 key。
> 注意：`planA.json` 裡的 `spots_all` 是自動關鍵字比對的結果，**含少數誤判**（例如 8/8 被標到 `dazaifu`/`kuma_sbux` 其實是因為「門司港站星巴克」「参道」字樣）。**請以下表為準**，不要直接用 `spots_all` 當地圖節點。

| Day | 日期 | 路線（依序，→ 表示移動）| 對應 key |
|---|---|---|---|
| 1 | 8/7 | 福岡機場 → 中洲川端(飯店) → 一蘭/中洲屋台 | airport → nakasu → ichiran, yatai |
| 2 | 8/8 | 博多駅 → 門司港駅 →〔渡船〕唐戶市場 → 海響館 →〔渡船〕門司港レトロ(三井倶樂部/藍翼) →〔JR→八幡〕皿倉山 | hakata_st → mojiko → karato → kaikyokan → mitsui, bluewing → sarakura |
| 3 | 8/9 | 太宰府天満宮 + 隈研吾星巴克 → 九州國立博物館 →〔西鐵→天神〕福岡市美術館 → 大濠公園 → 中洲川端 | dazaifu, kuma_sbux → kyuhaku → fukuoka_art → ohori → nakasu |
| 4 | 8/10 | teamLab/E・ZO → 天神(購物) → Canal City → 一蘭総本店(演舞) → 中洲屋台 | teamlab → tenjin → canalcity → ichiran → yatai |
| 5 | 8/11 | 中洲川端 → 福岡機場 | nakasu → airport |

**地理範圍提醒**：方案 A 橫跨三個區塊，地圖需能處理較大範圍或做「分日縮放」：
- 福岡市中心（中洲/天神/大濠/百道）— 主要住宿與 Day1/3/4/5。
- 北九州・下關（門司港/唐戶/皿倉山）— Day2，距福岡市約 70 km 東北。
- 太宰府（天滿宮/九博）— Day3 上午，距福岡市約 15 km 東南。

---

## 5. 景點登錄表（key → 名稱 → 圖片檔 → 約略座標）
> 座標為**約略值（WGS84，lat,lng）僅供起手用，正式上圖前請以 Google/地圖服務再校正**（尤其機場要用「國際線航廈」、皿倉山要分「山麓駅 vs 山頂展望台」）。圖片在 `assets\img\<key>.jpg`。

| key | 中文名 | 圖片檔 | 約略 lat,lng | 出現日 |
|---|---|---|---|---|
| airport | 福岡機場(國際線) | airport.jpg | 33.5895, 130.4560 | D1, D5 |
| hakata_st | 博多車站 | hakata_st.jpg | 33.5897, 130.4207 | D2 |
| nakasu | 中洲・那珂川(住宿區) | nakasu.jpg | 33.5928, 130.4063 | D1,D3,D5 |
| ichiran | 一蘭總本店(中洲5-3-2) | ichiran.jpg | 33.5917, 130.4078 | D1,D4 |
| yatai | 中洲屋台(清流公園) | yatai.jpg | 33.5905, 130.4040 | D1,D4 |
| mojiko | 門司港レトロ/門司港駅 | mojiko.jpg | 33.9469, 130.9628 | D2 |
| mitsui | 舊門司三井俱樂部 | mitsui.jpg | 33.9460, 130.9610 | D2 |
| bluewing | 藍翼門司吊橋 | bluewing.jpg | 33.9483, 130.9637 | D2 |
| kanmon | 關門海峽渡船 | kanmon.jpg | 33.9492, 130.9645 | D2 |
| karato | 唐戶市場 | karato.jpg | 33.9573, 130.9430 | D2 |
| kaikyokan | 海響館水族館 | kaikyokan.jpg | 33.9560, 130.9418 | D2 |
| sarakura | 皿倉山(山頂展望台) | sarakura.jpg | 33.8519, 130.7857 | D2(封面) |
| dazaifu | 太宰府天滿宮 | dazaifu.jpg | 33.5213, 130.5350 | D3 |
| kuma_sbux | 隈研吾星巴克(太宰府表參道) | kuma_sbux.jpg | 33.5189, 130.5333 | D3 |
| kyuhaku | 九州國立博物館 | kyuhaku.jpg | 33.5180, 130.5410 | D3 |
| fukuoka_art | 福岡市美術館 | fukuoka_art.jpg | 33.5856, 130.3805 | D3 |
| ohori | 大濠公園 | ohori.jpg | 33.5864, 130.3786 | D3 |
| tenjin | 天神商圈(岩田屋) | tenjin.jpg | 33.5912, 130.3986 | D4 |
| teamlab | teamLab/BOSS E・ZO(PayPayドーム) | teamlab.jpg | 33.5953, 130.3626 | D4 |
| canalcity | Canal City 博多 | canalcity.jpg | 33.5897, 130.4113 | D4 |
| asian_art | 福岡亞洲美術館 | asian_art.jpg | 33.5948, 130.4108 | (gallery) |

> `assets\img\` 另有 `hakata_port.jpg / marineworld.jpg / fukuoka_tower.jpg / yakuin.jpg`（其他方案用，方案 A 地圖通常不需要，但可用）。

---

## 6. 圖片素材庫（`assets\img\`，共 25 張）
- 全部取自 **Wikimedia Commons / Wikipedia（自由授權）**，已縮到寬 ≤1400、JPEG。
- 每張的來源/檔名/授權頁連結與中文名在 `assets\credits.json`（程式可直接讀）與 `assets\IMAGE_CREDITS.md`（人讀）。
- 商用前請至各來源頁確認個別授權。

---

## 7. 設計系統 / 品牌（方案 A，建議地圖沿用以保持一致）
方案 A 視覺 = **海軍藍 × 金**（沉穩經典）。色票（hex）：
| 用途 | 色 |
|---|---|
| 主色 ink（深底/標題底）| `#15233F` |
| primary（標題列/節點）| `#1F3A60` |
| accent 金（強調/編號/路線）| `#C8923A` |
| accent2 深金 | `#9C6B1E` |
| 背景 bg | `#F6F3EC` |
| 卡片 card | `#FFFFFF` |
| 次要文字 muted | `#6B7280` |
| 淺分隔 soft | `#EBE3D2` |
- 字型：標題/內文用 **Microsoft JhengHei（微軟正黑體）**；數字/拉丁用 **Georgia**（編輯感）。
- 簡報是 16:9 寬版（13.333×7.5 in）。每天有一個代表色塊與兩張景點照的版型，可作地圖側欄風格參考。

---

## 8. 既有產出
- `decks\方案A_經典均衡.pptx`（~9 MB，12 頁）與 `decks\方案A_經典均衡.pdf`（~4 MB，字型內嵌）。
- 12 頁結構：封面 / 規劃理由(條列5重點) / 五日總覽 / 景點圖鑑 / Day1–5 / 住宿 / 一蘭 / 行前提醒。
- B–E 四案的 pptx/pdf 也都在 `decks\`（已不是當前重點）。

---

## 9. 建置流程與腳本（重建簡報用；地圖階段通常用不到，列此備查）
資料管線：`parse.py`（CSV→planX.json）→ `tag_spots.py`（標景點）→ `design_points.py`（注入條列重點）→ `attractions.py`（景點登錄＋座標關鍵字）→ `fetch_img.py`（抓圖）。
出圖：`deckkit.js`（pptxgenjs 設計系統）+ `build.js` → `fixcjk.py`（補東亞字面）→ `render.py`（soffice→PDF→PNG 預覽）。
一鍵：`python build\make_all.py [A B C D E]`（build+fixcjk+render 全部）。
PDF：`python build\pdf_export.py`（**要用這支**，見 §10 地雷）。
- node 套件：`pptxgenjs@4.0.1` 已在 `build\node_modules`（本地）。

---

## 10. 環境與已知地雷
- **OS**：Windows 11；PowerShell 或 Bash 皆可。**Node v22**、**Python 3.14**、**LibreOffice**（`C:\Program Files\LibreOffice\program\soffice.exe`）。
- **CJK 字型**已裝：msjh.ttc（微軟正黑體）、Yu Gothic、Noto Sans TC、mingliu 等。
- **PDF 轉檔地雷**：直接 `soffice --convert-to pdf decks\*.pptx` 會出現 `libpng error: Write Error` 而失敗；**改用 `python build\pdf_export.py`**（它用 render.py 的 per-file 暫存 profile 轉，已驗證可行）。轉檔前先 `taskkill /F /IM soffice.bin` 清掉殘留實例。
- **pptxgenjs 注意**：顏色不能加 `#`；`transparency` 語意是「透明度%」（0=不透明、100=全透明）——overlay 要壓暗就用小一點的值會更暗，別搞反。
- **主控台中文**：跑 Python 時設 `PYTHONIOENCODING=utf-8` 以免 cp950 印出錯（檔案本身寫的是 UTF-8，沒問題）。
- 背景指令請用 `run_in_background` + 條件式等待，別用前景 `sleep`。

---

## 11. 下一階段（互動式網頁地圖）建議起手式
> **重要：先別動手。** 使用者會親自說明「怎麼畫」（地圖樣式、互動、技術選型等）。以下只是讓你心裡有底、待命時可先想的方向，等使用者開口再做。

可能會用到的素材都已就緒：
- 行程與停點：`data\planA.json` + 本文件 §4 的「可上圖路線」+ §5 座標表。
- 景點照片：`assets\img\<key>.jpg`（可當 marker 彈窗縮圖）。
- 品牌色票與字型：§7。
- 環境可跑 Node（可起本地靜態伺服器）與 Python。

常見技術選項（**待使用者拍板，勿自行假設**）：Leaflet + OpenStreetMap tiles（免金鑰、最快）、Mapbox GL（需 token）、或純前端 SVG 自繪路線圖。資料量小（~20 點、5 天路線），單一 `index.html` + JS 即可。
- 本環境已安裝相關 skills 可選用（**等使用者選定技術再用**）：`mapbox-web-integration-patterns`、`mapbox-data-visualization-patterns`、`mapbox-store-locator-patterns`、`mapbox-style-patterns`、`mapbox-search-integration`、以及 `frontend-design`、`web-artifacts-builder`。若使用者選 Mapbox，先看 `mapbox-token-security`。

**你現在該做的事**：讀完本文件與 `data\planA.json`、瞄一眼 `assets\img\`，用三五句話回報你已掌握（方案 A 路線 + 可用素材），然後**待命**，等使用者說明畫法。
```
（完）
```
