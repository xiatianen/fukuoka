# 交接文件 — 福岡 8/7–8/11 旅遊專案（互動網站 + 簡報，皆已完成並部署）

> 這份文件是**自足的**（self-contained）。讀完即可接手，不需要前面對話的記憶。
> 兩大產出（**互動式網頁地圖** 與 **簡報 PPTX/PDF**）都已做好、驗證、部署。
> **接手後：先讀完本文件，用幾句話回報你的理解，然後待命**，等使用者給你「新飯店」的位置/座標。**先不要動手。** 拿到新飯店後，照 **§A** 的清單做。

---

## 0. 目錄
- **A. ★如何換飯店（下一步任務）— 最重要，先讀**
- 1. 專案現況 ／ 2. 兩大產出 ／ 3. 最終定案行程
- 4. 檔案總覽 ／ 5. 網站技術與資料模型 ／ 6. 簡報建置管線
- 7. 地圖路徑（routes.js）的產生方式 ／ 8. 部署 ／ 9. 配色
- 10. 驗證方法（無頭截圖）／ 11. 環境地雷 ／ 12. Git 速查

---

## A. ★如何換飯店（下一步任務）

**現任飯店**：`Cross Life 博多天神`（クロスライフ博多天神），福岡市中央区春吉、那珂川南岸，**座標 lat 33.5878, lng 130.4066**。四晚都住、不換房；北九州(8/8)當日來回。
**使用者接下來會給你「新飯店」的名稱與位置。** 需要的話請他給 **Google 地圖等級的精確 lat/lng**（沒有就自己用 WebSearch 查證，務必準）；也順手查**新飯店 8 月旺季 2 人 1 室房價區間 + 官方訂房 URL + 到中洲/天神/博多/一蘭屋台的步行或地鐵時間**（估價與文案會用到）。

換飯店要動 **4 個地方 + 重生 2 個產物**。建議照順序：

### A‑1　`data.js`（網站行程資料）
飯店字串目前是「Cross Life 博多天神」，出現在很多處。**最快做法**：先全檔把舊飯店名替換成新名，再逐一改下列「座標/文案/估價」：
1. `META.home = { name, lat, lng }` —— **地圖往返路徑的錨點**，務必改成新座標。
2. `META.hotel`（飯店建議整段文字）。
3. `META.designPoints[]` 裡「省力動線」「住宿亮點」兩條（文字含飯店與所在區域）。
4. `META.budget.rows[]` 的「住宿」那列 label（含飯店名）；若房價不同，也改 val（住宿 ≈ 旺季每室每晚 × 4 晚 ÷ 2 人）。
5. Day1 `summary`（「計程車直達 ___」）。
6. Day1 `stops` 的 `d1-hotel`：**name、lat、lng**、desc、`arrive.legs[].seg`、`arrive.book`、`cost.jpy`（房價）、`cost.book.url`（訂房連結）。
7. Day1 `d1-ichiran.arrive`（飯店→中洲覓食的步行；若新飯店離中洲較遠，改 text/legs 的分鐘或改成地鐵）。
8. Day2 `summary`、`returnNote`（「回 ___」）、`d2-kokura.arrive.text`（「從 ___ 出發」）。
9. Day3 `returnNote`、`d3-tenjin.arrive.text`（「從 ___ 步行/地鐵到天神」，分鐘依新位置）、`d3-yatai.desc`（「過河步行回 ___」）、`bookLinks[]`（訂房 URL）。
10. Day4 `returnNote`、`d4-sbux.arrive`（第一段「___→西鐵福岡(天神)」的方式/分鐘，依新位置可能從步行改地鐵）。
11. Day5 `d5-hotel`：**name、lat、lng**、desc。
> ⚠️ 共有 **3 處座標**要改成新飯店：`META.home`、`d1-hotel`、`d5-hotel`（三者數值相同）。
> ⚠️ 若新飯店**不在中洲旁**（例如在博多站、天神中心、藥院…），請重新評估這些「步行」段是否要改成地鐵/計程車（影響 `arrive.legs`、`fare`、分鐘、以及該段是 `walk` 還是 `rail` mode）。

### A‑2　`routes.js`（地圖真實路徑幾何）— **必須重生**
飯店座標被烤進 10 段路徑（機場↔飯店、飯店↔中洲、飯店↔小倉/太宰府/柳川 往返…）。改飯店後 routes.js **一定要重新產生**：
1. 改 `build/gen_routes_google.py` 與 `build/gen_routes_rail.py` 兩支裡的 **`H = [lat, lng]`** 常數為新飯店座標（兩支都要改）。
2. 依序跑（工作目錄 `C:\fukuoka`、Bash）：
   ```bash
   # ① Google Routes：步行/計程車/地鐵真實路線（需 API key，見下）
   GOOGLE_API_KEY="<key>" PYTHONIOENCODING=utf-8 python build/gen_routes_google.py
   # ② OSM 真實鐵軌覆蓋 JR/西鐵段
   PYTHONIOENCODING=utf-8 python build/gen_routes_rail.py
   ```
   - **Google API key**：使用者上一個聊天室給過一把可用的試用 key（會再給你一次）。**只在本機建置時用、由環境變數傳入，不要寫進任何檔案、不要 commit**。`routes.js` 產物只有 `[lat,lng]` 座標、無 key（可 `grep AIza routes.js` 應為 0）。
   - 為何分兩支：**Google 在日本沒有 JR/西鐵的 transit 路線資料**（只有福岡市地鐵有），所以鐵道段改抓 **OpenStreetMap route=train relation** 的真實鐵軌（見 §7）。
3. **驗證**（§10）：截 `#d1 #d2 #d3 #d4` 圖，確認每天「飯店→各站→回飯店」都連得起來、沒有從新飯店拉出怪線。

### A‑3　`data/planA.json`（簡報資料源）
同樣把飯店相關全部更新：`plan.days[].items[]`（出發/回飯店/check-in 那幾條）、`plan.hotel`、`plan.summary`、`plan.rationale`、`plan.budget`（住宿列）、`plan.designPoints`、`plan.transport[]`（「機場⇄市區」那列提到飯店名）。
> 建議**寫一支 `build/update_planA6.py`**（仿照既有 `build/update_planA5.py`：`json.load → 改欄位 → json.dump(ensure_ascii=False, indent=2)`），比手改大段 JSON 穩。

### A‑4　`build/deckkit.js`（簡報版面，build/ 內、git 不追蹤）
- `buildDeck()` 內「住宿建議」那張 `infoSlide(...)` 的 lead 字串與 `cardTitle`（目前寫「Cross Life 博多天神 / 四晚同一飯店、不換房」）。
- `closingSlide()` 的提醒 #1（目前「…四晚都住 Cross Life 博多天神…」）。

### A‑5　重生簡報 + 推送
```bash
PYTHONIOENCODING=utf-8 python build/update_planA6.py        # 若有寫
taskkill //F //IM soffice.bin 2>/dev/null; taskkill //F //IM soffice.exe 2>/dev/null
PYTHONIOENCODING=utf-8 python build/make_all.py A           # 重建 PPTX
taskkill //F //IM soffice.bin 2>/dev/null; taskkill //F //IM Acrobat.exe 2>/dev/null
PYTHONIOENCODING=utf-8 python -c "import sys,shutil,tempfile;sys.path.insert(0,'build');from render import to_pdf;shutil.copy(to_pdf('decks/方案A_經典均衡.pptx', tempfile.mkdtemp()),'decks/方案A_經典均衡.pdf');print('PDF updated')"
```
- 逐頁截 PDF 驗證（§10）。**git 只會追蹤 `data.js`、`routes.js`、`data/planA.json`**（其餘 build/decks 被忽略）；`git add` 這三個 + 截圖驗證 → `git push origin main`（CF 自動部署）。簡報 PDF 是本機產物，可用 SendUserFile 傳給使用者看。

---

## 1. 專案現況
- **旅程**：福岡 5 天 4 夜，8/7（五）20:00 抵 FUK、8/11（二）11:00 起飛。使用者選 **方案 A**，多次客製。
- **三大必去**：皿倉山纜車夜景、太宰府天滿宮、一蘭總本店 20:00 陽台演舞。
- **演進史（重點）**：
  1. Day2 改小倉、加竈門+柳川、每天 10:00 出發。
  2. Day3/Day4 對調為省力動線、8/9 砍 teamLab、加 shin shin/若松屋/敘敘苑/天開稻荷、糸島整批不納入。
  3. 交通細到「每班車」(`arrive.legs`)＋訂票連結(`book`)＋各停點估價(`cost`)＋預算頁(`budget`)＋簡報「交通・訂票・預算」整頁。
  4. **住宿定案：四晚全住 Cross Life 博多天神、不換房；北九州(8/8) 當日來回**；估價同步。
  5. **地圖路徑大升級**：補齊「飯店↔各站」往返、加 🏨 飯店 marker；路徑改用 **Google Routes API**（步行/計程車/地鐵）＋ **OSM 真實鐵軌**（JR/西鐵）。
- **狀態**：網站＋簡報皆完成、驗證、已推上 GitHub `xiatianen/fukuoka`（CF 自動部署）。

---

## 2. 兩大產出
| 產出 | 位置 | 怎麼看 |
|---|---|---|
| **互動網頁地圖** | repo 根 `index.html`（純靜態） | 線上：使用者的 **Cloudflare Pages** 網址（在他 CF 儀表板；⚠️ `fukuoka.pages.dev` 是**別人**的同名專案）。本機：瀏覽器開 `C:\fukuoka\index.html` |
| **簡報（方案A）** | `C:\fukuoka\decks\方案A_經典均衡.pptx`／`.pdf`（13 頁） | 直接開檔。⚠️ Acrobat 開著舊 PDF 會鎖檔（見 §11） |

---

## 3. 最終定案行程（四晚 Cross Life · 北九州當日來回）
> 權威：網站 `data.js`、簡報 `data\planA.json`，**兩者同步**。每天約 10:00 出發（Day1 晚抵、Day5 08:30 出門趕機例外）。住宿四晚都 Cross Life 博多天神、不換房。

- **Day1 · 8/7（五）抵達**：20:00 機場國際線 → 計程車 → 21:30 **Cross Life 博多天神** → 22:00 過河中洲覓食（一蘭/週五屋台）。
- **Day2 · 8/8（六）北九州（當日來回）**：10:00 從飯店輕裝 → 博多→**小倉**（新幹線~16分；旦過/小倉城/商店街）→ 17:30 **皿倉山**（小倉→八幡 JR+接駁+纜車；日落19:12、新日本三大夜景、¥1,230）→ 下山 JR 回博多~1h → 回飯店。
- **Day3 · 8/9（日）福岡室內悠閒（不排 teamLab）**：睡到自然醒 → **天神購物**（含天神地下街/YOU+MORE!；伴手禮買齊）+ **shin shin 拉麵** → **Canal City 夜噴泉** → 20:00 **一蘭陽台演舞**（免費）→ **中洲屋台** → 過河回飯店。
- **Day4 · 8/10（一）太宰府＋竈門＋柳川（輕裝）**：飯店 →（步行西鐵福岡天神）→ **隈研吾星巴克**→**太宰府天滿宮**（+天開稻荷·彈性）→**竈門神社**（まほろば号 ¥100）→ **柳川川下り**+**若松屋鰻魚**→ 回天神 **敘敘苑燒肉** → 回飯店。
- **Day5 · 8/11（二）回程**：08:25 退房 → 計程車國際線 → 11:00 起飛。

---

## 4. 檔案總覽（`C:\fukuoka`）
```
index.html            ★網站入口（純靜態）— 載入順序：vendor → data.js → routes.js → app.js
app.js                ★地圖邏輯（含飯店往返段 homeNode/addRouteSeg、🏨 marker、popup 交通明細/估價、預算 Modal）
data.js               ★行程資料 window.TRIP_DATA = {META, MODES, DAYS}（見 §5）
routes.js             ★各 segment 真實路徑幾何 window.TRIP_ROUTES（見 §7；自動產生、只有座標、無 key）
styles.css            ★樣式（海軍藍×金；RWD；含 .legs/.cost-box/.book-link/.bud-*/.home-marker）
HANDOFF.md            ← 本文件        NEXT_AGENT_OPENING.md ← 給下個 agent 的開場白
vendor\               Leaflet 1.9.4 + markercluster 1.5.3（本地 vendored、零 CDN）
assets\img\<key>.jpg  景點照片        assets\credits.json  key→中文名（簡報取名用）
data\planA.json       ★簡報資料源（與 data.js 同步）；planB..E.json 已非重點
decks\                簡報 pptx/pdf（git 不追蹤）
build\                簡報＋路徑建置腳本（git 不追蹤）：
  deckkit.js build.js make_all.py            簡報版面/建置/字型/PDF
  gen_routes_google.py                       routes.js：Google Routes（步行/計程車/地鐵）
  gen_routes_rail.py                         routes.js：OSM 真實鐵軌覆蓋 JR/西鐵（見 §7）
  fix_sarakura.py                            （已併入 gen_routes_rail，小倉↔八幡用）
  update_planA2..5.py                        程式化更新 planA.json 的歷次腳本（可仿照寫 6）
  render.py fixcjk.py …                      LibreOffice 轉檔/CJK 字型
```
> **git 只追蹤純靜態網站檔**：`index.html app.js data.js routes.js styles.css vendor/ assets/ data/*.json *.md`。`.gitignore` 排除 `.claude/ node_modules/ build/ decks/ *.pptx *.pdf package.json* .chrometmp* _*.png _*.html`。

---

## 5. 網站技術與資料模型
**技術**：Leaflet 1.9.4（本地 vendored、零 CDN）+ CARTO Voyager 免金鑰底圖；自訂圓形編號 DivIcon；總覽用 markercluster。無外部字型、無建置步驟。

**`data.js` = `window.TRIP_DATA = { META, MODES, DAYS }`**
- `META`：`{ title, subtitle, dateRange, premise, musts[], hotel, home:{name,lat,lng}, designPoints[{label,text}], budget:{note,rows[{label,val}],total} }`。
  - **`META.home`** = 住宿基地座標（地圖每天「飯店↔各站」往返段的錨點）。換飯店必改。
  - `META.budget` → 資訊 Modal 的「預算概估」＋簡報預算頁。
- `MODES`：`start/rail/walk/ferry/bus/taxi/cable`，各 `{label,icon,dash}`；圖例動態只列實際用到的。
- `DAYS[]`：每天
  ```
  { n, date, dow, theme, color, colorText, summary, returnNote?,
    fromHome?, toHome?, bookLinks?:[{label,url}],
    stops: [ {
      id, key, name, type, time, lat, lng, desc, photo,
      arrive: { mode, text, legs?:[{seg,line,type,min,fare}], fare?, freq?, alt?, book?:{label,url} },
      cost?: { jpy, note?, book?:{label,url} }
    } ] }
  ```
  - `color`/`colorText`：當日路線色／加深的文字色（WCAG AA，勿混用）。
  - **`fromHome`/`toHome`**：是否畫「飯店→第一站」「最後一站→飯店」（Day2–4 兩者皆 true；Day1 只 toHome；Day5 都不設，因飯店已是 stop）。
  - **`arrive.legs`** = 每段車（路線/車種/分鐘/車資）；`fare`/`freq`/`alt` = 總車資/班距/省錢替代；`book` = 訂票連結。popup 與側欄都會渲染。
  - **`cost`** = 該停點花費（門票/餐費/房價）＋可選訂位連結。
  - `stop.id` 全域唯一（如 `d3-kamado`）；重複地點（ichiran 出現 D1/D3）不互蓋。

**`app.js` 重點**：分頁 `#d0..#d5` 深連結；列表↔地圖雙向連動（list 點擊 flyTo + 640ms 開 popup，不靠 moveend）；`homeNode()/addRouteSeg()` 畫飯店往返段、`addHomeMarker()` 放 🏨；`segLatLngs(a,b)` 取 `ROUTES[b.id]`（無則退兩點直線）；`transHtml()/costHtml()/budgetHtml()` 渲染交通明細/估價/預算；手機底部抽屜（peek 184/展開 86dvh）+ scrim + iOS 安全區；無障礙（role/tabindex/焦點陷阱/:focus-visible）。

**改行程**：99% 只動 `data.js` 的 `DAYS`。新景點要放 `assets/img/<key>.jpg`。**改了會影響路線幾何的點（座標/順序/飯店）→ 記得重生 routes.js（§7）。**

---

## 6. 簡報建置管線
**源**：`data\planA.json`（與 data.js 同步）。景點 key→中文名靠 `assets\credits.json`；圖片 `assets\img\<key>.jpg`。
- `plan.days[].items[] = {time, act, trans, note}` → 每日條列。`plan.days[].spots[]`（前2）→ 右側大圖＋總覽縮圖。
- `plan.gallery[]`（前12，排除 airport/hakata_st）→ 圖鑑頁。`plan.designPoints[]`（5條）→ 規劃理由頁。
- `plan.summary`/`rationale`/`hotel`/`ichiran` → 文字頁。**`plan.transport[]` + `plan.budget`** → 「交通・訂票・預算」頁（`deckkit.js` 的 `transportSlide`）。
- 版面在 `build/deckkit.js`（pptxgenjs，1920×1080，Microsoft JhengHei 硬編碼）。頁序：封面→規劃理由→五日總覽→圖鑑→Day1–5→**交通預算**→住宿→一蘭→結尾（13 頁）。

**重生（Bash，`C:\fukuoka`）**：見 §A‑5。改大段 JSON 用 `build/update_planA*.py` 程式化最穩。

---

## 7. 地圖路徑（`routes.js`）的產生方式
`window.TRIP_ROUTES = { "<stopId>": [[lat,lng],…], … }`；app.js 依「到站」stopId 取用、無則退兩點直線。**只含座標、無 API key。** 由兩支腳本依序產生（見 §A‑2 指令）：
1. **`build/gen_routes_google.py`**（需 `GOOGLE_API_KEY` 環境變數）：每段用 Google Routes API computeRoutes 算真實路線——**步行=WALK、計程車=DRIVE、地鐵=TRANSIT**；Google 查不到者退回 OSRM 道路（`router.project-osrm.org`）。
2. **`build/gen_routes_rail.py`**（OpenStreetMap Overpass，免 key）：覆蓋 **JR/西鐵鐵道段**，因為 **Google Routes 在日本沒有 JR/西鐵 transit 資料**。作法：抓 `route=train` relation → 串接成有序折線 → 依車站座標裁切。
   - relation：鹿児島本線 `11533962`（博多⇄小倉⇄八幡）、西鉄天神大牟田線 `11485954`、西鉄太宰府線 `11827541`。
   - **串接方法因線而異**（`METHOD`）：kagoshima 用 **member 順序**（幾何拼接會在折尾分歧斷鏈）、nishitetsu/dazaifu 用 **幾何端點拼接**（其 member 排序不連續）。改線時若幾何怪怪的就換另一種試。
   - 覆蓋的 6 段：`d2-out d2-sarakura d2-back d4-out d4-yanagawa d4-back`。纜車（山麓↔山頂）與無資料短段＝直線短接。
- **換飯店時**：兩支腳本的 `H = [lat,lng]` 常數都要改成新座標，然後依序重跑（Overpass 偶爾 429/504，腳本已有重試/退避）。

---

## 8. 部署：GitHub → Cloudflare Pages
- Repo `https://github.com/xiatianen/fukuoka`（main, public）；`gh` 已登入 `xiatianen`。
- `git push origin main` → CF 自動部署。**純靜態**（已移除 package.json 避免 CF 跑 npm build；Build command 留空、輸出根 `/`）。
- 線上網址在使用者 CF 儀表板。`fukuoka.pages.dev` **不是**這個。

## 9. 配色
ink `#15233F`／primary `#1F3A60`／accent 金 `#C8923A`（文字加深 `#9C6B1E`）／bg `#F6F3EC`／muted `#5E6675`。Day 色：D1 `#C8923A`/`#8A5E14`、D2 `#2C6E9B`/`#235C84`、D3 `#2E8B57`/`#237A48`、D4 `#B0436A`/`#9E3D60`、D5 `#5B6B8C`/`#4A5872`。

---

## 10. 驗證方法（無頭截圖）
本機有 Chrome（`C:\Program Files\Google\Chrome\Application\chrome.exe`）：
```bash
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --no-first-run \
  --run-all-compositor-stages-before-draw --virtual-time-budget=9000 \
  --user-data-dir="/c/fukuoka/.chrometmp_x" --window-size=1440,900 \
  --screenshot="/c/fukuoka/_v_x.png" "file:///C:/fukuoka/index.html#d2"
```
- 手機：`--window-size=390,844`。互動（popup/Modal/抽屜）：複製成 `_test_*.html`、`</body>` 前注入 `setTimeout(...)` 點擊/開 Modal 再截。
- PDF 轉 PNG 驗證：`python -c "import fitz;d=fitz.open('decks/方案A_經典均衡.pdf');[d[i].get_pixmap(dpi=96).save(f'_vp{i+1}.png') for i in range(d.page_count)]"`（MuPDF 那行 structure-tree 警告無害）。
- `_*.png`/`_*.html`/`.chrometmp*` 都被 gitignore，驗完可刪。**換飯店後務必截 #d1–#d4 看飯店往返線正常。**

## 11. 環境地雷
- Windows 11；Bash＋PowerShell 皆可。Node v22、**Python 3.14**、LibreOffice(`soffice`)、Chrome、`gh`。
- **Acrobat 鎖 PDF**：使用者開著舊 PDF 會讓你無法覆寫（PermissionError）→ `Get-Process -Name Acrobat | Stop-Process -Force`（使用者已授權直接關）。
- 轉 PDF 前 `taskkill //F //IM soffice.bin/soffice.exe`；用 `render.to_pdf`（per-file 暫存 profile）才穩，別直接 soffice 批轉（libpng error）。
- **`PYTHONIOENCODING=utf-8`** 跑 Python 印中日文必設（否則 cp950 報錯）。
- Overpass（OSM）偶爾 429/504，需 User-Agent header＋重試（腳本已內建）。Google Routes：日本無 JR/西鐵 transit（故鐵道走 OSM）。
- gitignore 命名：Chrome 暫存一律 `.chrometmp*` 開頭、截圖 `_` 開頭才會被忽略（曾誤 commit 491 個 Chrome 垃圾、已清）。

## 12. Git 速查
- 遠端 `origin = https://github.com/xiatianen/fukuoka`，分支 `main`。最新 commit：`e015a56`（小倉→八幡真實鐵軌）。
- 換網站／路徑：`git add data.js routes.js`（+截圖驗證）→ commit → `git push origin main`（CF 自動部署）。
- 換簡報源：`git add data/planA.json`。**別把 decks/build/_*.png 加進去**（`git status --short` 確認）。
- commit 結尾維持：`Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`。

---
（完）
