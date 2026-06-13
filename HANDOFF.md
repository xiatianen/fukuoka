# 交接文件 — 福岡 8/7–8/11 旅遊專案（互動網站 + 簡報，皆已完成並部署）

> 這份文件是**自足的**（self-contained）。讀完即可接手，不需要前面對話的記憶。
> 目前兩大產出（**互動式網頁地圖** 與 **簡報 PPTX/PDF**）都已做好、驗證過、並部署/更新。
> 接手後：**先讀完本文件 + 關鍵檔，用幾句話回報你的理解，然後待命**，等使用者說下一步。**先不要動手改任何東西。**

---

## 0. 目錄
1. 專案現況（一句話＋狀態）
2. 兩大產出：看哪裡、怎麼看
3. 最終定案行程（Day1–5 逐點）
4. 檔案總覽
5. 網站：技術與資料模型（最重要）
6. 簡報：建置管線與重生方式
7. 部署：GitHub → Cloudflare Pages
8. 設計系統 / 品牌配色
9. 驗證方法（無頭瀏覽器截圖）
10. 環境與已知地雷
11. 已做過的審查與品質把關
12. 可能的下一步（待命時可先想）
13. Git 狀態與指令速查

---

## 1. 專案現況（一句話＋狀態）
- **旅程**：福岡 5 天 4 夜，8/7（五）20:00 抵 FUK、8/11（二）11:00 起飛。使用者最終選 **方案 A**，並做了多次客製。
- **三大硬性需求（必去）**：皿倉山纜車夜景、太宰府天滿宮、一蘭總本店 20:00 陽台演舞。
- **狀態**：
  - ✅ **互動式網頁地圖**：完成 → 多輪審查修正 → 推上 GitHub `xiatianen/fukuoka` → Cloudflare Pages 自動部署。
  - ✅ **簡報 PPTX/PDF**：依「最新行程」重新產生並逐頁驗證（本機 `decks\`）。
  - ✅ 行程已做過兩輪大改（見 §3）：第一輪 Day2 改小倉、加竈門神社+柳川、每天 10:00 出發；**第二輪（最新）Day3／Day4 對調為省力動線、北九州一晚宿小倉、福岡基地改 Hotel Il Palazzo、8/9 砍 teamLab、加 shin shin/若松屋/敘敘苑/天開稻荷、糸島整批不納入**。

---

## 2. 兩大產出：看哪裡、怎麼看
| 產出 | 位置 | 怎麼看 |
|---|---|---|
| **互動網頁地圖** | repo 根目錄 `index.html`（純靜態） | 線上：使用者的 **Cloudflare Pages** 專案網址（在他的 CF 儀表板；⚠️ `fukuoka.pages.dev` 是**別人**的同名專案，不是這個）。本機：直接用瀏覽器開 `C:\fukuoka\index.html`，或 `npx serve .` |
| **簡報（方案A）** | `C:\fukuoka\decks\方案A_經典均衡.pptx`（~11.9MB）／`.pdf`（~4.7MB） | 直接開檔。⚠️ 若 Acrobat 開著舊 PDF 會鎖檔導致無法覆寫（見 §10） |

> 簡報 B–E（其他四方案）的 pptx/pdf 也在 `decks\`，但**已非重點**（使用者選了 A）。

---

## 3. 最終定案行程（Day1–5 逐點）— ★第二輪「省力動線」改版
> 權威：網站資料在 `data.js`、簡報資料在 `data\planA.json`，**兩者已同步**。每天約 **10:00 出發**（Day1 晚間抵達、Day5 趕 11:00 班機需 08:30 出門，這兩天例外）。
> **住宿**：福岡三晚以 **Hotel Il Palazzo（春吉·Aldo Rossi 設計、中洲旁）** 為基地（8/7・8/9・8/10）；**8/8 北九州一晚宿小倉**。全程只用兩間飯店、只為小倉打包一次（**不寄宅急便、不付空房**）。
> **第二輪兩大改**：① **Day3／Day4 對調**成省力動線（見下）；② **8/9 砍掉 teamLab**，更悠閒。**糸島**（芥屋大門/花鹽布丁/糸島海鮮堂）整批不納入。

**Day 1 · 8/7（五）抵達日**
- 20:00 福岡機場國際線（入境、領網卡）→ 計程車 → 21:30 **Hotel Il Palazzo（春吉）** check-in → 22:00 中洲覓食（一蘭總本店／屋台，週五屋台有開、先吃一輪當保險）。

**Day 2 · 8/8（六）北九州輕鬆日｜小倉散策＋皿倉山夜景＋宿小倉**
- 10:00 退房**帶行李**博多→**小倉**（新幹線~16分；先寄放小倉駅周邊飯店）→ 旦過市場、小倉城、有頂棚商店街 → 17:30 **皿倉山**（小倉→八幡 JR~13分＋接駁＋纜車；日落 19:12、新日本三大夜景；來回票 ¥1,230；山頂天宮開到 21:00）→ **宿小倉**（不趕回博多）。
- 〔上一輪已拿掉門司港/唐戶/海響館；本輪改為**看完夜景就睡小倉**。〕

**Day 3 · 8/9（日）福岡市內悠閒日｜天神購物＋一蘭演舞＋中洲屋台壓軸（不排 teamLab）**
- 10:00 小倉→博多（新幹線~16分；博多駅前 **DACOMECCA** 麵包早餐）→ 回 Il Palazzo 放行李 → 13:00 **shin shin 拉麵**（天神本店）→ 14:00 **天神購物**（岩田屋/三越/PARCO＋**天神地下街**＋**YOU+MORE!**；伴手禮今天買齊）→ 17:45 **Canal City**（運河夜噴泉＝「晚上博多運河」）→ 20:00 **一蘭本社陽台演舞**（中洲5-3-2，免費）→ 20:15 **中洲屋台**＋那珂川河畔 → 步行回 Il Palazzo。
- 〔本輪改：原 Day4 內容移到這天、**砍 teamLab**、加 shin shin；屋台壓軸落在週日，部分攤週日休但 8/7 已先吃過。〕

**Day 4 · 8/10（一）太宰府＋竈門神社＋柳川｜古都與水鄉（輕裝）**
- 10:00 從 Il Palazzo **輕裝**出發 → 11:00 **隈研吾星巴克**（太宰府表參道）→ 11:30 **太宰府天滿宮**（＋**天開稻荷神社**·彈性：後山紅鳥居、來回~30分，腳力夠再上）→ 12:15 **宝満宮竈門神社**（まほろば号~10分 ¥100）→ 15:00 **柳川 どんこ舟川下り**＋**若松屋**鰻魚せいろ蒸し（沖端百年名店）→ 17:00 柳川→天神 **敘敘苑燒肉**（岩田屋7F；或薬院「ヤキニク上」）→ 回 Il Palazzo。
- 〔本輪改：原 Day3 內容移到這天、加若松屋/天開稻荷/敘敘苑；行李已在福岡、不帶往南。建議買「太宰府・柳川観光きっぷ」。〕

**Day 5 · 8/11（二）回程日**
- 08:25 Hotel Il Palazzo 退房 → 計程車直達國際線 → 08:55 機場報到 → 11:00 起飛。

---

## 4. 檔案總覽（工作目錄 `C:\fukuoka`）
```
C:\fukuoka\
├─ index.html              ★網站入口（純靜態，repo 根＝網站根）
├─ app.js                  ★網站邏輯（地圖、分頁、互動、手機抽屜、cluster、深連結）
├─ data.js                 ★網站行程資料（window.TRIP_DATA = {META, MODES, DAYS}）
├─ styles.css              ★網站樣式（海軍藍×金；RWD）
├─ README.md
├─ HANDOFF.md              ← 本文件
├─ NEXT_AGENT_OPENING.md   ← 給下一個 agent 的開場白
├─ vendor\
│   ├─ leaflet\            Leaflet 1.9.4（本地 vendored：js/css/images）
│   └─ markercluster\      Leaflet.markercluster 1.5.3（總覽聚合用）
├─ assets\
│   ├─ img\<key>.jpg       景點照片（含新圖 kokura/kamado/yanagawa）
│   ├─ credits.json        ★key→中文名＋來源（簡報靠它取名稱；見 §6）
│   └─ IMAGE_CREDITS.md
├─ data\
│   ├─ planA.json          ★簡報資料源（已與 data.js 同步）
│   └─ planB..E.json, bundle.json, *.csv
├─ decks\                  簡報產出（pptx/pdf）— git 不追蹤
└─ build\                  簡報建置腳本 — git 不追蹤
    ├─ deckkit.js  build.js  make_all.py
    ├─ parse.py  tag_spots.py  attractions.py  design_points.py
    ├─ fixcjk.py  render.py  pdf_export.py  fetch_img.py
    ├─ fetch_new.py         （本輪新增：抓 kokura/kamado/yanagawa 圖）
    └─ update_planA.py      （本輪新增：程式化更新 planA.json Day2/Day3）
```
> **被 git 忽略**（`.gitignore`）：`.claude/`、`node_modules/`、`build/`、`decks/`、`*.pptx/*.pdf`、`package.json/lock`、`.chrometmp*`、`_*.png`、`_*.html`。
> 因此 **repo 只含純靜態網站所需檔**（index/app/data/styles + vendor + assets + data 的 json + md），Cloudflare 直接當靜態站部署。

---

## 5. 網站：技術與資料模型（最重要）
**技術**：Leaflet 1.9.4（**本地 vendored**，零 CDN 依賴）+ **CARTO Voyager** 免金鑰底圖；自訂圓形編號 DivIcon marker；總覽用 **Leaflet.markercluster** 聚合。無外部字型、無建置步驟。

**`data.js` 結構**：`window.TRIP_DATA = { META, MODES, DAYS }`
- `META`：`{ title, subtitle, dateRange, premise, musts[], hotel, designPoints[{label,text}] }` → 餵「資訊 Modal」。
- `MODES`：交通方式定義 `{ start, rail, walk, ferry, bus, taxi, cable }`，各有 `{label, icon, dash}`（dash = Leaflet polyline dashArray；圖例**動態**只列實際用到的）。
- `DAYS[]`：每天
  ```
  { n, date, dow, theme, color, colorText, summary, returnNote?,
    stops: [ { id, key, name, type, time, lat, lng, desc, photo, arrive:{mode,text} } ] }
  ```
  - `color` 是當日路線/marker 色；`colorText` 是「文字用」的加深版（為了 WCAG AA 對比，**勿混用**）。
  - `type` → 小圖示（airport/hotel/food/station/sight/aquarium/night/cafe/museum/nature/shop/show）。
  - `stop.id` **全域唯一**（如 `d3-kamado`）→ marker 以 id 索引，重複地點（如 ichiran 出現 D1/D4）不會互蓋。
  - `arrive` = 抵達此停點的「那一段交通」（mode 決定線型、text 是完整班次/票價說明）。

**`app.js` 重點行為**（已過兩輪審查修正）：
- 分頁：`0=總覽`、`1..5=各日`；切日 `selectDay(n)` 會 `clearView()`→重畫→`fitTo()`。
- **深連結**：網址 `#d0..#d5` 可直接開該天、可分享/重整還原（`history.replaceState` + `hashchange`）。
- 列表↔地圖雙向連動：點停點 `setActiveStop(id,{source:'list'})` → flyTo + **計時 640ms 開 popup**（不依賴 `moveend`，避免「點了沒反應」）；點 marker `{source:'map'}` → 高亮 + 捲動列表。
- 總覽用 `markerClusterGroup`（自訂品牌色 cluster 徽章）解決市中心多點重疊。
- 手機：底部抽屜（peek 184px 露出品牌列+分頁；展開 86dvh）+ scrim 遮罩 + iOS 安全區 `env(safe-area-inset-*)`；桌機是左側欄。
- 無障礙：分頁/卡片 `role=button`+`tabindex`+Enter/Space；Modal 焦點陷阱；`:focus-visible`。
- 載入畫面在底圖 tiles `load` 後收掉，並有 2.2s 硬性 fallback。

**要改行程**：99% 情況**只動 `data.js` 的 `DAYS`**（加/減 stop、改座標/時間/文案/交通）。座標是 WGS84 (lat,lng)。新景點要放對應 `assets/img/<key>.jpg`。

---

## 6. 簡報：建置管線與重生方式
**資料源**：`data\planA.json`（已與 data.js 同步）。**景點 key→中文名稱**靠 `assets\credits.json` 的 `[key].name`；**圖片**走 `assets\img\<key>.jpg`。
- `plan.days[].items[] = {time, act, trans, note}` → 每日行程條列。
- `plan.days[].spots[]`（取前 2 個）→ 該日投影片右側兩張大圖；`spots[0]` 也是「五日總覽」頁該日縮圖。
- `plan.gallery[]`（前 12，排除 airport/hakata_st）→「景點圖鑑」頁。
- `plan.designPoints[]`（5 條）→「規劃理由」頁（page 2 是條列式）。
- `plan.summary` → 規劃理由頁左欄/封面文字。

**新增景點 key 的最小步驟**：① 放 `assets\img\<key>.jpg`；② 在 `assets\credits.json` 加 `{"name":"中文名", ...}`；③ 在 planA.json 的 day.items / spots / spots_all / gallery 用該 key。

**重生「方案 A」簡報指令**（工作目錄 `C:\fukuoka`，Bash）：
```bash
# 1) 改完 planA.json + credits.json 後，重建 A 的 PPTX（含字型修補）
PYTHONIOENCODING=utf-8 python build/make_all.py A      # 只建 A；可接 B C D E

# 2) 轉 PDF（A）— 先清掉殘留 soffice，避免鎖檔
taskkill //F //IM soffice.bin 2>/dev/null; taskkill //F //IM soffice.exe 2>/dev/null
PYTHONIOENCODING=utf-8 python -c "
import sys,shutil,tempfile;sys.path.insert(0,'build')
from render import to_pdf
shutil.copy(to_pdf('decks/方案A_經典均衡.pptx', tempfile.mkdtemp()), 'decks/方案A_經典均衡.pdf')
print('PDF updated')"
```
> 本輪用 `build/update_planA.py`（程式化改 JSON，比手改大段落穩）+ `build/fetch_new.py`（抓新圖）。可參考沿用。
> `build/pdf_export.py` 會一次轉**全部 5 案**；只要 A 用上面的 one-liner 即可。

---

## 7. 部署：GitHub → Cloudflare Pages
- **Repo**：`https://github.com/xiatianen/fukuoka`（main，public）。`gh` 已登入 `xiatianen`（具 repo 權限）。
- **流程**：`git push origin main` → Cloudflare Pages 自動部署。**repo 是純靜態**（已刻意把 `package.json` 移出 repo，避免 CF 誤判為 Node 專案跑 npm build）。Build command 應留空、Output 根目錄 `/`。
- **網址**：在使用者的 **Cloudflare Pages 儀表板**查（會帶後綴或自訂名）。`fukuoka.pages.dev` 是別人的同名專案，**不是**這個。
- **不要**把 `decks/`、`build/`、`node_modules/`、`.chrometmp*`、`_*.png` commit 進去（已在 .gitignore）。

---

## 8. 設計系統 / 品牌配色
| 用途 | 色 |
|---|---|
| ink 深底/標題底 | `#15233F` |
| primary 標題列 | `#1F3A60` |
| accent 金 | `#C8923A`（文字用加深 `--accent-d #9C6B1E`）|
| 背景 bg | `#F6F3EC` ｜ 卡片 `#FFFFFF` ｜ 次要文字 muted `#5E6675` |
| Day 路線色（color / colorText）| D1 `#C8923A`/`#8A5E14`、D2 `#2C6E9B`/`#235C84`、D3 `#2E8B57`/`#237A48`、D4 `#B0436A`/`#9E3D60`、D5 `#5B6B8C`/`#4A5872` |
- 字型：網站用系統字堆疊（微軟正黑體優先、含 emoji fallback，無外部字型）；簡報用 **Microsoft JhengHei**（deckkit.js 硬編碼）。

---

## 9. 驗證方法（無頭瀏覽器截圖）
本機有 **Chrome**（`C:\Program Files\Google\Chrome\Application\chrome.exe`），可無頭截圖驗證網站：
```bash
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --no-first-run \
  --run-all-compositor-stages-before-draw --virtual-time-budget=9000 \
  --user-data-dir="/c/fukuoka/.chrometmp_x" --window-size=1440,900 \
  --screenshot="/c/fukuoka/_v_x.png" "file:///C:/fukuoka/index.html#d3"
```
- 手機尺寸：`--window-size=390,844 --force-device-scale-factor=2`。
- 驗證互動（popup/Modal/圖例/抽屜）：複製 index.html 成 `_test_*.html`、在 `</body>` 前注入 `setTimeout(()=>{ document.querySelectorAll('.tl-stop')[2].click(); },1500)` 之類，再截圖。
- 確認 JS 沒爆：`chrome --headless --dump-dom ... > _dom.html`，grep `tl-stop`/`day-tab` 有無生出來。
- 所有 `_*.png`、`_*.html`、`.chrometmp*` 都已被 gitignore，驗證完可刪。

---

## 10. 環境與已知地雷
- **OS**：Windows 11；Bash 與 PowerShell 皆可。**Node v22**、**Python 3.14**、**LibreOffice**（`soffice.exe`）、Chrome、`gh` 2.88。
- **Acrobat 鎖 PDF**：若使用者用 Adobe Acrobat 開著 `方案A_經典均衡.pdf`，會鎖檔讓你**無法覆寫**（`PermissionError`）。解法：`Get-Process -Name Acrobat | Stop-Process -Force`（本輪使用者授權直接關過）。
- **soffice 殘留**：轉 PDF 前先 `taskkill //F //IM soffice.bin` / `soffice.exe`，否則可能卡住或 `libpng error`。
- **PDF 直接 soffice 批轉**會 `libpng error: Write Error`；用 `render.to_pdf`（per-file 暫存 profile）才穩。
- **PYTHONIOENCODING=utf-8**：跑 Python 印中文/日文時要設，否則 cp950 報錯。
- **bash 工作目錄會殘留**：跨次 `cd` 會累積；用絕對路徑（`/c/fukuoka/...`）最保險。
- **CARTO 底圖 / Leaflet** 都不需金鑰；網路要通才有底圖。
- **gitignore 命名**：暫存 Chrome profile 一律用 `.chrometmp*` 開頭、截圖用 `_` 開頭，才會被忽略（曾因用 `.chrometmp_d1` 沒被忽略而誤 commit 491 個 Chrome 垃圾檔，已用 `--force-with-lease` 清掉）。

---

## 11. 已做過的審查與品質把關
- 網站經 **5 視角對抗式審查**（程式 bug／手機 UX／桌機 UX／資料座標查證／視覺無障礙）+ **2 輪回歸驗證**，全部修正。
- **座標已逐點查證校正**（皿倉山指山頂展望台、一蘭本社、機場國際線等；新加的 kokura/kamado/yanagawa 也用真實座標）。
- 對比（WCAG AA）、鍵盤無障礙、Modal 焦點、iOS 安全區、總覽聚合等都已處理。
- 每個互動都用真實 Chrome 無頭截圖驗證過。

---

## 12. 可能的下一步（待命時可先想，**等使用者開口再做**）
- Day3 一份「**保險時間表**」（精確到幾點搭哪班、川下り幾點的船）→ 貼進簡報 Day3 備註（使用者上一輪有被問到，尚未決定）。
- 行程再微調（竈門神社/柳川/小倉的取捨、時間）。
- 匯出 **GPX / Google My Maps**、列印版、把 B–E 也做成可切換的網頁。
- 行前清單、訂位連結（teamLab/海響館類需事前購票）整理。

---

## 13. Git 狀態與指令速查
- 遠端：`origin = https://github.com/xiatianen/fukuoka`，分支 `main`。最新 commit：`28176c3`（行程改版：Day2 小倉、Day3 竈門+柳川、10:00 出發）。
- 常用：
  ```bash
  git add -A && git status --short          # 確認沒把 decks/build/_*.png 誤加
  git commit -m "..." && git push origin main
  # 改網站 → 改 data.js → 截圖驗證 → push（CF 自動部署）
  # 改簡報 → 改 planA.json(+credits.json) → make_all.py A → 轉 PDF
  ```
- commit message 結尾請維持：`Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`。

---
（完）
