# 交接文件 — 福岡 8/7–8/11 旅遊專案（互動網站 + 簡報，皆已完成並部署）

> 這份文件是**自足的**（self-contained）。讀完即可接手，不需要前面對話的記憶。
> 兩大產出（**互動式網頁地圖** 與 **簡報 PPTX/PDF**）都已做好、驗證、部署。網站還多了一層
> **「現場工具」(field.js)**：離線 PWA、現在視圖、定位、一鍵導航/撥號/訂位、費用、雨備、日語句。
>
> **接手後請先做**：讀完本文件 → 用幾句話回報你的理解 → **待命**，等使用者給你「**下一個行程要改的點**」（可能是加/刪景點、改某天、再換飯店、改文案…）。先不要動手。拿到指令後，照 **§A** 的對應流程做。
>
> ⚠️ **這個 GitHub repo 是 public。** 任何金鑰（Google API key）**絕對不可**寫進檔案或 commit；只在本機建置時用環境變數傳入。

---

## 0. 目錄
- **A. ★如何改行程（下一步任務）— 最重要，先讀**
- 1. 專案現況／演進史　2. 兩大產出　3. 最終定案行程
- 4. 檔案總覽　5. 網站資料模型（data.js）　**5.5 現場工具層 field.js（本 session 新增、務必讀）**
- 6. 簡報建置管線　7. 地圖路徑 routes.js　8. 部署　9. 配色
- 10. 驗證方法（無頭截圖＋?now 測試）　11. 環境地雷　12. Git 速查

---

## A. ★如何改行程（下一步任務）

使用者會給你一個「要改的點」。先判斷它**牽動到哪幾層**，再動工。三層的因果關係：

| 改了什麼 | data.js | routes.js（重生） | field.js（id 對應表） | planA.json＋簡報 |
|---|---|---|---|---|
| 純文字/估價（不動座標/順序/id） | ✅ | — | 視內容 | ✅（同步） |
| 加/刪/換停點、改座標、改順序 | ✅ | ✅ 必重生 | ✅ 對 id 同步（見 §5.5） | ✅ |
| 換飯店 | ✅（見 A‑1） | ✅（改 `H` 重生） | ✅（飯店 id 的 JA/文案） | ✅ |

> 黃金守則：**改了「會影響路線幾何」的東西（座標、停點順序、飯店、Day2 的 Brasileiro）→ 一定要重生 routes.js（§7）並截 #d1–#d4 驗證**。改了停點 **id / 增刪停點 → 一定要同步 field.js 的對應表（§5.5），否則該停點的現金/雨備/訂位/日文地址/末班會錯位或漏掉。**

### A‑1　換飯店（最常見的大改）
**現任飯店**：`COCO Gofukumachi`（クロスライフ→現任；福岡市博多区上呉服町2-24、地下鐵**箱崎線「呉服町」站**步行 3 分／210m），**座標 lat 33.5976, lng 130.4117**（日本國土地理院 GSI 門牌定位）。公寓式 21 室、**無大浴場/早餐、有投幣洗衣**、無官網（Booking/Agoda/楽天 訂）。四晚都住、不換房；北九州(8/8)當日來回。
拿到新飯店：要 **Google 地圖等級精確 lat/lng**（沒有就用 WebSearch 或 GSI geocoder 查證，務必準）；順手查**新飯店 8 月旺季房價、官方/訂房 URL、到中洲/天神/博多/Canal City 的步行或地鐵時間**。

要動的座標/文案（`data.js`，飯店名目前 = `COCO Gofukumachi`，全檔搜尋取代再逐處改）：
1. `META.home = {name,lat,lng}` —— **地圖往返錨點，必改**。
2. `META.hotel`（整段飯店建議）、`META.designPoints[]` 的「省力動線」「住宿亮點」兩條。
3. `META.budget`：住宿列（目前是實際價 `NT$7,303／人`，見 §3）＋ note 內飯店相關字。
4. Day1 `summary`；`d1-hotel`（**name/lat/lng**、desc、`arrive.legs[].seg`、`arrive.alt`、`cost.jpy`房價、`cost.book.url`訂房連結）；`d1-ichiran.arrive`（飯店→中洲的步行分鐘/方式）。
5. Day2 `summary`/`returnNote`、`d2-kokura.arrive.text`（「從 ___ 出發」）、**`d2-brasileiro.arrive`**（飯店→Brasileiro 步行 3 分；若新飯店離店屋町遠，這段要改）。
6. Day3 `returnNote`、`d3-tenjin.arrive`（飯店→天神 方式/分鐘）、`d3-yatai.desc`（步行回 ___）、`bookLinks[]`。
7. Day4 `returnNote`、`d4-sbux.arrive`（首段「___→西鐵福岡(天神)」）。
8. Day5 `d5-hotel`（**name/lat/lng**、desc）。
> ⚠️ **3 處座標**要同步：`META.home`、`d1-hotel`、`d5-hotel`（數值相同）。
> ⚠️ **app.js 內有一段「硬編碼」的 🏨 飯店 popup 文字**（`addHomeMarker()`，約 250 行，目前寫「博多区上呉服町·呉服町站旁…」）→ 換飯店要一起改，且 **app.js 是 git 追蹤檔、要一起 push**。
> ⚠️ **field.js 的 `JA["d1-hotel"]/["d5-hotel"]`**（日文店名/地址/電話，給司機看）→ 換飯店要改（見 §5.5）。

### A‑2　重生 `routes.js`（座標/停點/飯店有動就必做）
飯店與停點座標被烤進 18 段路徑。步驟（工作目錄 `C:\fukuoka`、用 Bash）：
1. 換飯店：改 `build/gen_routes_google.py` 與 `build/gen_routes_rail.py` 兩支的 **`H = [lat,lng]`** 為新座標（兩支都改）。（`gen_routes_rail.py` 另有 `BRASILEIRO=[33.5966,130.4101]` 常數＝Brasileiro 餐廳，**不是**飯店、換飯店時不要動它。）
2. 依序跑：
   ```bash
   GOOGLE_API_KEY="<向使用者要的試用 key>" PYTHONIOENCODING=utf-8 python build/gen_routes_google.py
   PYTHONIOENCODING=utf-8 python build/gen_routes_rail.py
   ```
   - **Google API key**：使用者有一把可用試用 key，會給你；**只在本機 env 傳入、絕不寫檔/commit（repo 是 public）**。產物 `routes.js` 只有 `[lat,lng]`、無 key（`grep -c AIza routes.js` 應為 0）。
   - 兩支分工：**Google Routes 在日本查不到 JR/西鐵 transit**（只有福岡市地鐵有），所以鐵道段改用 **OSM `route=train` relation 真實鐵軌**（見 §7）；步行/計程車/地鐵走 Google。
3. **驗證**（§10）：截 `#d1 #d2 #d3 #d4`，確認飯店往返線、各段都連得起來、無怪線。`python` 檢查端點落在新座標。

### A‑3　`data/planA.json`（簡報資料源，與 data.js 同步）
更新 `plan.days[].items[]`、`plan.hotel`、`plan.summary`、`plan.rationale`、`plan.budget`、`plan.designPoints`、`plan.transport[]`（機場列）。**用程式化腳本最穩**：仿 `build/update_planA6.py`／`update_brasileiro.py`／`update_actuals.py`（都是 `json.load → 改欄位 → json.dump(ensure_ascii=False, indent=2)`），寫一支 `update_planA7.py` 之類。

### A‑4　`build/deckkit.js`（簡報版面，build/ 內、git 不追蹤）
- 住宿那張 `infoSlide(...)`：lead（目前「COCO Gofukumachi / 四晚同一飯店、不換房」）與 `cardTitle`（「博多上呉服町、呉服町站旁（箱崎線）」）。
- `closingSlide()` 提醒 #1（目前「…四晚都住 COCO Gofukumachi…」）。
- `transportSlide()` 的預算卡列高已改**自適應**（`browH=Math.min(0.8,(rh-1.32-1.05)/rows)`），可容 5–6 列不溢出。

### A‑5　重生簡報 + 推送
```bash
PYTHONIOENCODING=utf-8 python build/update_planA7.py    # 你新寫的（若有）
taskkill //F //IM soffice.bin //T 2>/dev/null; taskkill //F //IM soffice.exe //T 2>/dev/null
PYTHONIOENCODING=utf-8 python build/make_all.py A        # 重建 PPTX（node build.js A → fixcjk → render 預覽）
taskkill //F //IM soffice.bin //T 2>/dev/null; taskkill //F //IM Acrobat.exe //T 2>/dev/null
PYTHONIOENCODING=utf-8 python -c "import sys,shutil,tempfile;sys.path.insert(0,'build');from render import to_pdf;shutil.copy(to_pdf('decks/方案A_經典均衡.pptx', tempfile.mkdtemp()),'decks/方案A_經典均衡.pdf');print('PDF updated')"
```
逐頁截 PDF 驗證（§10）。**git 追蹤的網站檔才 push**（見 §12）；簡報 PDF 是本機產物，可用 SendUserFile 傳給使用者。

---

## 1. 專案現況／演進史
- **旅程**：福岡 5 天 4 夜，8/7（五）20:00 抵 FUK、8/11（二）11:00 起飛。2 人同行。使用者選 **方案 A「經典均衡」**，多輪客製。
- **三大必去**：皿倉山纜車夜景、太宰府天滿宮、一蘭總本店 20:00 陽台演舞。
- **演進史**：
  1. Day2 改小倉、加竈門+柳川、每天約 10:00 出發。
  2. Day3/Day4 對調為省力動線、8/9 砍 teamLab、加 shin shin/若松屋/敘敘苑/天開稻荷；糸島整批（含手工花鹽布丁、芥屋大門、糸島海鮮堂）依使用者「刪糸島」規則不納入。
  3. 交通細到「每班車」(`arrive.legs`)＋訂票連結＋各停點估價＋預算頁＋簡報「交通・訂票・預算」整頁。
  4. **住宿定案：四晚同一飯店、不換房；北九州(8/8) 當日來回。** 飯店歷經 Cross Life 博多天神 → **COCO Gofukumachi（博多上呉服町、現任）**。
  5. **地圖路徑升級**：補齊「飯店↔各站」往返＋🏨 marker；路徑改 **Google Routes（步行/計程車/地鐵）＋ OSM 真實鐵軌（JR/西鐵）**。
  6. **（前一 session）**①換飯店 COCO；②加 **Cafe Brasileiro** 為 8/8 午餐（飯店旁老咖啡館、補回想吃的「布丁」）；③**機票/房費填實際購入價**（機票 2人 NT$33,048、住宿 4晚2人 NT$14,605）；④**整個 `field.js` 現場工具層**（8 大功能，見 §5.5）＋**PWA 離線**（sw.js/manifest/icons）；⑤餐廳**線上訂位連結**（一蘭優先入座、敘敘苑）＋**雨天雨備**＋網頁全面「講費用」。
  7. **（本輪）**①8/9（日）加 **博多剪髮 OFF.HAIRSHOP**（10:00、博多駅前4-10-1 エサキビル4F、週一休/週日10:00開、¥5,500、座標 33.5866,130.4183）為 Day3 首站；②8/10（一）**柳川 → 宮地嶽神社「風凛（風鈴）まつり」**（福津、奧之宮約5,000風鈴、日落19:11、夜間點燈 20:00–22:00、座標 33.7798,130.4852；JR博多→福間¥560＋西鐵巴士1-1 ¥210）；③**敘敘苑燒肉移到 8/9（日）天神**（早一點晚餐、原 Day4 取消）；④`data.js`/`field.js`/`routes.js`（新增 `d3-haircut`/`d3-tenjin`/`d4-miyajidake`、已重生）/`planA.json`/簡報全層同步；⑤`app.js` 加 `salon ✂️` 類型、`sw.js` v2→v3。**查證重點**：8/10 是平日（山之日是 8/11）→ 用平日巴士；『光の道』只 2・10 月、8 月無，8 月主秀是夜間風鈴點燈；松ヶ枝餅/夜市攤週一沒有。
- **狀態**：網站＋簡報皆完成、驗證、已推 GitHub `xiatianen/fukuoka`（Cloudflare Pages 自動部署）。`git status` 乾淨，本輪行程更新 commit `e1ac932`（之後若再 push 以 `git log` 為準）。

---

## 2. 兩大產出
| 產出 | 位置 | 怎麼看 |
|---|---|---|
| **互動網頁地圖** | repo 根 `index.html`（純靜態，可離線 PWA） | 線上：使用者的 **Cloudflare Pages** 網址（在他 CF 儀表板；⚠️ `fukuoka.pages.dev` 是**別人**的同名專案）。本機：瀏覽器開 `C:\fukuoka\index.html`（`file://` 下 SW/離線不會啟用，屬正常） |
| **簡報（方案A）** | `C:\fukuoka\decks\方案A_經典均衡.pptx`／`.pdf`（13 頁） | 直接開檔。⚠️ Acrobat 開著舊 PDF 會鎖檔（§11） |

---

## 3. 最終定案行程（四晚 COCO Gofukumachi · 北九州當日來回）
> 權威：網站 `data.js`、簡報 `data\planA.json`，**兩者同步**。每天約 10:00 出發（Day1 晚抵、Day5 08:30 趕機例外）。

- **Day1 · 8/7（五）抵達**：20:00 機場國際線 → 計程車 → 21:30 **COCO Gofukumachi** → 22:00 中洲覓食（步行約 12 分；一蘭/週五屋台）。
- **Day2 · 8/8（六）北九州（當日來回）**：悠閒早晨 → **11:00 Cafe Brasileiro 復古洋食午餐**（飯店旁 3 分）→ 博多→**小倉**（新幹線~16分；旦過/小倉城/商店街）→ 17:30 **皿倉山**（小倉→八幡 JR+接駁+纜車；日落 19:12、新日本三大夜景、¥1,230）→ JR 回博多 → 回飯店。
- **Day3 · 8/9（日）福岡室內悠閒（不排 teamLab）**：睡到自然醒 → **天神購物**（天神地下街/YOU+MORE!；伴手禮買齊）+ **shin shin 拉麵** → **Canal City 夜噴泉** → 20:00 **一蘭陽台演舞**（免費）→ **中洲屋台** → 步行回飯店。
- **Day4 · 8/10（一）太宰府＋竈門＋柳川（輕裝）**：飯店 →（呉服町站 地鐵 至天神 → 西鐵福岡）→ **隈研吾星巴克**→**太宰府天滿宮**（+天開稻荷·彈性）→**竈門神社**（まほろば号 ¥100）→ **柳川川下り**+**若松屋鰻魚**→ 回天神 **敘敘苑燒肉** → 回飯店。
- **Day5 · 8/11（二）回程**：08:25 退房 → 計程車國際線 → 11:00 起飛。

**費用（每人，2 人均攤；已併入實際購入價）**：機票 NT$16,524（2人 NT$33,048）＋住宿 NT$7,303（4晚2人 NT$14,605 ≈¥69,500）＋交通約¥9,000–12,000＋餐食¥18,000–30,000＋門票/體驗¥3,000–5,000 → **合計約 NT$30,000–34,000／人**。機票與住宿是實際價、其餘旺季概估。

---

## 4. 檔案總覽（`C:\fukuoka`）
```
index.html            ★網站入口；載入順序：vendor → data.js → routes.js → app.js → field.js（+ manifest/icons/SW 註冊）
app.js                ★地圖邏輯（飯店往返段、🏨 marker、popup/側欄、預算 Modal）；尾端 export window.TRIP_APP，
                       並在 popup/時間軸/路線 popup 呼叫 window.FIELD.chips()/actions()、render 後呼叫 FIELD.onRender()
field.js              ★【本 session 新增】現場工具層（見 §5.5）。以 stop id 外掛 JA/CASH/DEADLINE/SUN/WARN/RESERVE/RAIN
data.js               ★行程資料 window.TRIP_DATA = {META, MODES, DAYS}（見 §5）
routes.js             ★18 段真實路徑幾何 window.TRIP_ROUTES（§7；自動產生、只有座標、無 key）
styles.css            ★樣式（海軍藍×金；RWD）；本 session 末段加 .now-bar/.fchip/.fbtn/.tool-*/.rain-tip/.bud-actual…
sw.js                 ★【新增】Service Worker：app shell cache-first + 地圖磚 runtime/預存（離線）
manifest.webmanifest  ★【新增】PWA manifest（standalone、主題色、icons）
assets/icons/*.png    ★【新增】PWA 圖示 192/512/apple-touch（build/gen_icons.py 產）
HANDOFF.md            ← 本文件        NEXT_AGENT_OPENING.md ← 給下個 agent 的開場白
vendor\               Leaflet 1.9.4 + markercluster 1.5.3（本地 vendored、零 CDN）
assets\img\<key>.jpg  景點照片        assets\credits.json  key→中文名（簡報取名用）
data\planA.json       ★簡報資料源（與 data.js 同步）；planB..E.json 已非重點
decks\                簡報 pptx/pdf（git 不追蹤）
build\                建置腳本（git 不追蹤）：
  deckkit.js build.js make_all.py          簡報版面/建置/字型/PDF
  gen_routes_google.py                     routes.js：Google Routes（步行/計程車/地鐵）
  gen_routes_rail.py                       routes.js：OSM 真實鐵軌覆蓋 JR/西鐵（§7；含 H 與 BRASILEIRO 常數）
  gen_icons.py                             產 PWA 圖示（Pillow）
  update_planA2..6.py / update_brasileiro.py / update_actuals.py   程式化更新 planA.json 的歷次腳本（仿照寫新的）
  render.py fixcjk.py …                    LibreOffice 轉檔/CJK 字型
```
> **git 追蹤的網站檔**：`index.html app.js field.js data.js routes.js styles.css sw.js manifest.webmanifest vendor/ assets/ data/*.json *.md`。`.gitignore` 排除 `.claude/ node_modules/ build/ decks/ *.pptx *.pdf package.json* .chrometmp* _*.png _*.html`。

---

## 5. 網站資料模型（data.js）
**技術**：Leaflet 1.9.4（vendored、零 CDN）+ CARTO Voyager 免金鑰底圖；自訂圓形編號 DivIcon；總覽用 markercluster。無外部字型、無建置步驟。

**`window.TRIP_DATA = { META, MODES, DAYS }`**
- `META`：`{title, subtitle, dateRange, premise, musts[], hotel, home:{name,lat,lng}, designPoints[{label,text}], budget:{note,rows[{label,val}],total}}`。`META.home` = 地圖每天「飯店↔各站」往返錨點，換飯店必改。`META.budget` → 資訊 Modal 預算＋簡報預算頁＋field.js 的「💰 費用一覽」。
- `MODES`：`start/rail/walk/ferry/bus/taxi/cable`，各 `{label,icon,dash}`；圖例動態只列實際用到的。
- `DAYS[]`：`{n,date,dow,theme,color,colorText,summary,returnNote?,fromHome?,toHome?,bookLinks?,stops:[{id,key,name,type,time,lat,lng,desc,photo?,arrive:{mode,text,legs?,fare?,freq?,alt?,book?},cost?:{jpy,note?,book?}}]}`。
  - `fromHome`/`toHome`：是否畫「飯店→首站」「末站→飯店」。Day1 只 toHome；Day2–4 皆 true；Day5 不設（飯店即 stop）。
  - **停點 id 是全域唯一鍵**，同時被 routes.js（路徑）與 **field.js（§5.5 的對應表）** 引用。**增刪/改名停點時，兩邊都要顧。**
  - 目前各 Day 的停點 id：D1 `d1-airport/d1-hotel/d1-ichiran`；D2 `d2-brasileiro/d2-kokura/d2-sarakura`；D3 `d3-haircut/d3-tenjin/d3-canal/d3-ichiran/d3-yatai`；D4 `d4-sbux/d4-dazaifu/d4-kamado/d4-miyajidake`；D5 `d5-hotel/d5-airport`。（本輪：D3 新增 `d3-haircut`；D4 `d4-yanagawa`→`d4-miyajidake`。）
- **改行程**：99% 動 `DAYS`。新景點圖放 `assets/img/<key>.jpg`。動到座標/順序/飯店 → 重生 routes.js（§7）。動到 id/增刪停點 → 同步 field.js（§5.5）。

---

## 5.5 現場工具層 field.js（本 session 新增 — 務必讀）
把「規劃稿」變成「現場跟著走的工具」。**設計重點：所有現場資料用 stop id 外掛在 field.js 的常數表裡，幾乎不動 data.js。** app.js 只提供「掛點」：

**app.js ↔ field.js 介面**
- `window.TRIP_APP`（app.js 尾端 export）：`{DAYS, META, getMap(), getCurrentDay(), selectDay(n), setActiveStop(id,opts), findStop(id), focusStop(s,m), markerFor(id)}`。field.js 用它操作地圖/切日。
- app.js 在三處插入 field 內容（都用 `window.FIELD ? FIELD.xxx(stop) : ""` 包著，缺 field.js 也不壞）：popupHtml（名稱後 `FIELD.chips`、cost 後 `FIELD.actions`）、時間軸卡（sc-top 後 chips、cost 後 actions）、routePopupHtml（`FIELD.actions(b)`）。
- app.js 在 `renderBody()` 末呼叫 `FIELD.onRender(currentDay)`、`renderOverviewBody()` 末呼叫 `FIELD.onRender(0)`。

**field.js 的 id 對應表（改行程時對照同步）**
- `JA[id] = {name, addr, tel?}`：日文店名/地址/電話（📋 複製給司機、📞 撥號）。含 `d1-hotel/d5-hotel`（換飯店要改）、各餐廳/景點/機場。
- `CASH`（Set）：標「💵 現金」的停點（屋台/市場/Brasileiro/若松屋）。
- `DEADLINE[id] = {label,time,note}`：末班/截止（目前只有 `d2-sarakura` 皿倉 22:15）。
- `SUN[id]`：日落字串（`d2-sarakura` 19:12）。
- `WARN[id]`：公休/注意（Brasileiro 週日休、shin shin 週三、若松屋賣完即止…）。
- `RESERVE[id] = {url,label}`：**線上訂位**鈕。目前 `d1-ichiran/d3-ichiran` = 一蘭官方「優先入座（付費免排隊）」TableCheck。（敘敘苑線上訂位在 Day4 `bookLinks`；shin shin/若松屋/Brasileiro 只能電話→用 📞 撥號。）
- `RAIN[id]`：**雨備**（藍框 🌧️）。目前 `d2-sarakura/d4-yanagawa/d4-kamado/d4-dazaifu/d1-ichiran/d3-yatai`。
- 其它常數：`FX=0.21`（¥→NT）、`TRIP_YEAR=2026`＋`dayDate(n)`（Day n→2026-08-0(6+n)，給「今天」判斷）、`PACKING`/`BOOKINGS`（持ち物/已訂清單）、`EMERGENCY`（SOS：飯店日文地址+電話、110/119、台北駐福岡辦事處）、`PHRASES`（14 句日語）。

**8 大功能**（工具列 🧰 在左下；手機浮在抽屜上方）
1. **離線 PWA**：`sw.js` 快取 app shell（cache-first）＋地圖磚（瀏覽過的 runtime 快取；🧰→「存離線地圖」可一次預存福岡→北九州→太宰府→柳川範圍）；「加到主畫面」變 App。**改了 app shell 檔案要把 `sw.js` 的 `VERSION` 加版號**（目前 `fukuoka-v2`）才會讓使用者端更新快取。
2. **現在視圖**：依真實日期自動跳「今天」、依時間在時間軸頂部釘「現在/接下來」卡並高亮當下停點；非行程期間顯示「這天從這裡開始」。
3. **定位藍點**：`navigator.geolocation` 藍點＋精度圈＋到下一站距離/步行分鐘。
4. **一鍵導航/撥號/訂位**：每站 🚶/🚉/🚕「帶路」（Google Maps，依 mode 自動 walk/transit/drive）＋ 📞 撥號（`JA.tel`）＋ 📅 訂位（`RESERVE`）。
5. **費用**：每站 cost 內聯；🧰→「💰 費用一覽」開每人預算明細＋已訂實際價。
6. **末班/日落/公休**：`DEADLINE`/`SUN`/`WARN` 做成 chip。
7. **持ち物/已訂清單**：勾選存 `localStorage`（key `fukuoka_checklist_v1`）。
8. **日文地址/日語句**：📋 複製日文店名地址；🧰→「💬 日語句」14 句可逐句複製；「🆘 急難資訊」。

**測試小撇步**：網址加 `?now=2026-08-08T17:00` 可模擬「行程當天當下」看現在視圖；`?day=2` 強制某天。`file://` 下 SW/離線不啟用（需 https，即線上 CF），其餘功能都能本機測。

---

## 6. 簡報建置管線
**源**：`data\planA.json`（與 data.js 同步）。key→中文名靠 `assets\credits.json`；圖片 `assets\img\<key>.jpg`。
- `plan.days[].items[]={time,act,trans,note}` → 每日條列；`plan.days[].spots[]`（前2）→ 右側大圖；`plan.gallery[]`（前12，排除 airport/hakata_st）→ 圖鑑；`plan.designPoints[]`（5條）→ 規劃理由；`plan.summary/rationale/hotel/ichiran` → 文字頁；**`plan.transport[]`+`plan.budget`** → 「交通・訂票・預算」頁。
- 版面：`build/deckkit.js`（pptxgenjs，1920×1080，Microsoft JhengHei 硬編碼）。頁序：封面→規劃理由→五日總覽→圖鑑→Day1–5→交通預算→住宿→一蘭→結尾（13 頁）。
- 重生見 §A‑5。改大段 JSON 一律用 `build/update_planA*.py` 程式化。

---

## 7. 地圖路徑 routes.js（18 段）
`window.TRIP_ROUTES = {"<segId>":[[lat,lng],…]}`；app.js 依「到站」段 id 取用，無則退兩點直線。**只含座標、無 key。** 兩支腳本依序產生（§A‑2）：
1. **`gen_routes_google.py`**（需 `GOOGLE_API_KEY` env）：步行=WALK、計程車=DRIVE、地鐵=TRANSIT；查不到退回 OSRM 道路。
2. **`gen_routes_rail.py`**（OSM Overpass，免 key）：覆蓋 **JR/西鐵鐵道段**（Google 在日本無此資料）。抓 `route=train` relation → 串接折線 → 依車站座標裁切。
   - relation：鹿児島本線 `11533962`（博多⇄小倉⇄八幡）、西鉄天神大牟田線 `11485954`、西鉄太宰府線 `11827541`。
   - **串接法（`METHOD`）**：kagoshima 用 **member 順序**（幾何拼接會在折尾分歧斷鏈）；nishitetsu/dazaifu 用 **幾何端點拼接**（member 排序不連續）。改線若幾何怪就換另一種試。
   - **rail 覆蓋的 6 段**：`d2-kokura`（Brasileiro→博多→小倉）、`d2-sarakura`（小倉→八幡→皿倉）、`d2-back`（皿倉→博多→飯店）、`d4-out`（飯店→天神→二日市→太宰府）、`d4-miyajidake`（竈門→太宰府→二日市→天神→[地鐵直線]→博多→[JR鹿児島本線]→福間→[巴士直線]→宮地嶽）、`d4-back`（宮地嶽→福間→博多→飯店）。**注意**：`gen_routes_rail.py` 的 `S["fukuma"]=[33.7636,130.4875]`＋常數 `MIYAJIDAKE=[33.7798,130.4852]`；博多→福間用 kagoshima relation（11533962，福間在博多⇄門司港之間）。
   - **本輪 Day3**：`d3-out`（飯店→博多剪髮）與新段 `d3-tenjin`（博多剪髮→天神）皆為地鐵/步行，走 Google／OSRM、**不在** rail 6 段內。
   - **Day2 的特殊結構**（本 session 因加 Brasileiro 改的）：`d2-out` 現在是 **Google WALK 飯店→Brasileiro**（短）；`d2-kokura` 才是 **Brasileiro→小倉 真實鐵軌**。連接短段（飯店↔站、纜車山麓↔山頂）＝直線短接。
- 換飯店：兩支 `H` 都改、重跑（Overpass 偶 429/504，已內建重試/退避）。`BRASILEIRO` 常數是餐廳、不要動。

---

## 8. 部署：GitHub → Cloudflare Pages
- Repo `https://github.com/xiatianen/fukuoka`（main, **public**）；`gh` 已登入 `xiatianen`。
- `git push origin main` → CF 自動部署。**純靜態**（無 package.json，Build command 留空、輸出根 `/`）。
- 線上網址在使用者 CF 儀表板。`fukuoka.pages.dev` **不是**這個。偶爾 push 遇 DNS（Could not resolve host）重試即可。

## 9. 配色
ink `#15233F`／primary `#1F3A60`／accent 金 `#C8923A`（文字加深 `#9C6B1E`）／bg `#F6F3EC`／muted `#5E6675`。Day 色：D1 `#C8923A`/`#8A5E14`、D2 `#2C6E9B`/`#235C84`、D3 `#B0436A`/`#9E3D60`、D4 `#2E8B57`/`#237A48`、D5 `#5B6B8C`/`#4A5872`。

---

## 10. 驗證方法
**無頭截圖**（本機 Chrome `C:\Program Files\Google\Chrome\Application\chrome.exe`）：
```bash
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=9000 \
  --window-size=1460,1000 --screenshot="C:\\fukuoka\\_v.png" "file:///C:/fukuoka/index.html#d2"
```
- 手機：`--window-size=430,920`。看現場工具：加 `?now=2026-08-08T17:00`（現在視圖）。側欄細節太小→用 Pillow 裁左側放大讀（本 session 常用）。
- 改了 JS：先 `node --check field.js && node --check app.js && node --check sw.js`（**field.js 字串多、易發生「`'` 開頭卻 `"` 收尾」的引號不對稱**，務必 node 檢查）。
- PDF→PNG：`python -c "import fitz;d=fitz.open('decks/方案A_經典均衡.pdf');[d[i].get_pixmap(dpi=120).save(f'_vp{i+1}.png') for i in range(d.page_count)]"`（structure-tree 警告無害）。
- `_*.png`/`_*.html`/`.chrometmp*` 都被 gitignore，驗完可刪。**動座標/飯店後務必截 #d1–#d4 看往返線正常。**

## 11. 環境地雷
- Windows 11；Bash＋PowerShell 皆可。Node v22、**Python 3.14**（有 Pillow/PyMuPDF）、Chrome、`gh`。
- ⚠️ **LibreOffice 已不在本機**（`C:\Program Files\LibreOffice\program\` 約 6/23 後被清空、只剩 `logs/`）→ `render.py`／`make_all.py` 的 PDF/預覽步驟會 `WinError 2`（make_all 仍會印出 PPTX，因 `build.js` 走 node/pptxgenjs、**不需** LibreOffice）。**PPTX→PDF 改用 PowerPoint COM**（Office16 已裝、已驗證）：PowerShell `New-Object -ComObject PowerPoint.Application` → `Presentations.Open(pptx,-1,0,0)` → `SaveAs(pdf,32)` → `Quit()`（先 `Stop-Process POWERPNT,Acrobat`）。或重裝 LibreOffice 還原 `render.py` 的 `SOFFICE` 路徑。
- **`PYTHONIOENCODING=utf-8`** 跑 Python 印中日文必設（否則 cp950 報錯）。
- 轉 PDF 前 `taskkill //F //IM soffice.bin/soffice.exe`；用 `render.to_pdf`（per-file 暫存 profile）才穩。**Acrobat 開著舊 PDF 會鎖檔**→ `taskkill //F //IM Acrobat.exe`（使用者已授權直接關）。
- Overpass 偶 429/504（已重試）。Google Routes 日本無 JR/西鐵 transit（故鐵道走 OSM）。Google **Geocoding API** 那把試用 key 沒開（REQUEST_DENIED）；要地理編碼用 **GSI**（`https://msearch.gsi.go.jp/address-search/AddressSearch?q=...`，日本門牌最準）或 Nominatim。
- gitignore：Chrome 暫存一律 `.chrometmp*`、截圖 `_` 開頭才會被忽略。

## 12. Git 速查
- 遠端 `origin = https://github.com/xiatianen/fukuoka`，分支 `main`。最新 commit `a56077e`。
- 改網站／路徑／現場工具：`git add` 變動到的這些之中者 → `index.html app.js field.js data.js routes.js styles.css sw.js manifest.webmanifest assets/icons`（+截圖驗證）→ commit → `git push origin main`。
- 改簡報源：`git add data/planA.json`。**別把 decks/build/_*.png 加進去**（先 `git status --short` 確認）。
- commit 結尾維持：`Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`。

---
（完）
