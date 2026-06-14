/* =====================================================================
 *  福岡 5天4夜 · 方案 A「經典均衡」— 互動地圖資料
 *  資料源：data/planA.json（權威）＋ HANDOFF.md §4/§5（已整理路線與座標）
 *  座標為 WGS84 (lat,lng)，取自公開地圖之最佳估計，已逐點校正。
 *  2026/6/14 第五輪：四晚都住「COCO Gofukumachi」(博多区上呉服町、呉服町站旁)、不換房；
 *  北九州(8/8)當日來回、不過夜。新址近呉服町站(箱崎線)＋Canal City，離中洲/天神略遠、
 *  改以地鐵 2 站接駁；交通(arrive.legs)＋訂房(book)＋估價(cost)＋總預算(META.budget)同步更新；
 *  地圖路徑見 routes.js。
 *  ※ 車資/票價/房價為 2025–2026 概估，出發前請以官方/乘換案內再確認。
 * ===================================================================== */
(function () {
  "use strict";

  // --- 交通方式定義（圖例 + 線型 + 圖示）-----------------------------
  const MODES = {
    start: { label: "出發 / 抵達", icon: "📍", dash: null,      weight: 0 },
    rail:  { label: "鐵道（JR・地鐵・西鐵）", icon: "🚆", dash: null,     weight: 4 },
    walk:  { label: "徒步",        icon: "🚶", dash: "2,9",   weight: 4 },
    ferry: { label: "渡船",        icon: "⛴️", dash: "12,9",  weight: 4 },
    bus:   { label: "巴士 / 接駁", icon: "🚌", dash: "16,8,2,8", weight: 4 },
    taxi:  { label: "計程車",      icon: "🚕", dash: "3,7",   weight: 4 },
    cable: { label: "纜車 / 坡道車", icon: "🚠", dash: "10,6", weight: 4 }
  };

  // --- 五天行程（每天一個主軸色）------------------------------------
  const DAYS = [
    {
      n: 1, date: "8/7", dow: "週五", toHome: true,
      theme: "抵達日 · 輕鬆落地",
      color: "#C8923A", colorText: "#8A5E14",
      summary: "晚間 20:00 抵福岡機場，計程車直達 COCO Gofukumachi（博多·上呉服町、呉服町站旁），落地第一碗拉麵後早早休息——隔天是全程最長的一天。四晚都住這間、不換房。",
      stops: [
        {
          id: "d1-airport", key: "airport", name: "福岡機場 國際線",
          type: "airport", time: "20:00", lat: 33.5857, lng: 130.4424,
          photo: "assets/img/airport.jpg",
          desc: "入境、領行李、領網卡。晚班通關人潮多時可能拖過 21:00，完全不抓緊。",
          arrive: { mode: "start", text: "✈️ 台北航班抵達國際線航廈" },
          cost: { jpy: "✈️ 機票 台北⇄福岡 2 人來回 NT$33,048（每人 NT$16,524，已訂）", note: "入境、領取預訂的網卡／eSIM（出國前先網購最便宜）" }
        },
        {
          id: "d1-hotel", key: "nakasu", name: "COCO Gofukumachi",
          type: "hotel", time: "21:30", lat: 33.5976, lng: 130.4117,
          photo: "assets/img/nakasu.jpg",
          desc: "check-in、放行李。這趟四晚都住這間——COCO Gofukumachi（博多区上呉服町、地下鐵箱崎線『呉服町』站步行 3 分／210m）：公寓式小型旅店（21 室、雙人／雙床／家庭套房），房內附衛浴淋浴、免費 Wi-Fi、館內投幣式洗衣機；步行到 Canal City 約 11 分、中洲屋台／一蘭約 12 分，博多駅與天神搭地鐵 2 站。無大浴場、不含早餐，勝在安靜、價格實惠、四晚不換房、行李零搬動。",
          arrive: {
            mode: "taxi",
            text: "國際線航廈無地鐵站，帶行李夜間建議計程車直達；省錢可走免費接駁＋地下鐵。",
            legs: [{ seg: "國際線→COCO Gofukumachi", line: "計程車（GO／DiDi 叫車）", type: "計程車", min: 16, fare: 2400 }],
            fare: "約 ¥2,000–2,600（直達，可多人均攤）",
            freq: "",
            alt: "省錢：免費連絡巴士→地下鐵空港線（福岡空港→中洲川端）再轉箱崎線 1 站到呉服町，約 ¥260（每人）＋步行 3 分。國際線無地鐵、需先接駁到國內線。",
            book: { label: "福岡市地下鐵 路線・運賃案內", url: "https://subway.city.fukuoka.lg.jp/" }
          },
          cost: { jpy: "實際 NT$14,605／2 人 4 晚（≈ ¥69,500、約 ¥17,400／晚）", note: "COCO Gofukumachi（公寓式·無早餐）已訂房總額；機票另計 2 人來回 NT$33,048", book: { label: "COCO Gofukumachi 訂房（Booking.com）", url: "https://www.booking.com/hotel/jp/coco-gofukumachi-fukuoka1.html" } }
        },
        {
          id: "d1-ichiran", key: "ichiran", name: "中洲覓食（一蘭總本店 / 屋台）",
          type: "food", time: "22:00", lat: 33.5932, lng: 130.4046,
          photo: "assets/img/ichiran.jpg",
          desc: "「落地第一碗」：從上呉服町沿大博通り過中洲川端到中洲，川端通商店街、那珂川河畔屋台（週五有開），或 24 小時的一蘭總本店。吃完早點休息。（屋台壓軸雖排在 8/9，今晚先吃一輪當保險。）",
          arrive: {
            mode: "walk",
            text: "從 COCO 步行到中洲約 12 分（經中洲川端）；懶得走可地鐵呉服町→中洲川端 1 站。",
            legs: [{ seg: "COCO→中洲（一蘭／屋台）", line: "步行（經中洲川端）", type: "徒步", min: 12, fare: 0 }],
            fare: "¥0（步行）／地鐵 ¥210"
          },
          cost: { jpy: "一蘭 ¥980（22 時後深夜價 ¥1,080）＋替玉 ¥210；屋台一人 ¥2,500–4,000", note: "屋台入店前先問大將『一人いくら？』避免超預算", book: { label: "一蘭 官方", url: "https://ichiran.com/" } }
        }
      ]
    },
    {
      n: 2, date: "8/8", dow: "週六", fromHome: true, toHome: true,
      theme: "北九州輕鬆日 · 小倉散步＋皿倉山夜景（當日來回）",
      color: "#2C6E9B", colorText: "#235C84",
      summary: "不趕的一天：悠閒早晨先到飯店旁的老咖啡館 Brasileiro 吃復古洋食午餐，再北上小倉（當日來回、不帶行李）逛旦過市場、小倉城、有頂棚商店街，傍晚轉八幡上皿倉山看日落與「新日本三大夜景」，看完夜景搭 JR 回福岡、回 COCO 早點休息。",
      returnNote: "歸途：皿倉山下山 → 八幡駅 → JR 鹿兒島本線回博多約 1 小時（約 ¥860）→ 地鐵回呉服町／步行回 COCO Gofukumachi。山頂比平地涼約 5°C，是 8 月最舒服的避暑點；今天最操，回房早點睡，隔天睡到自然醒。",
      stops: [
        {
          id: "d2-brasileiro", key: "brasileiro", name: "カフェ ブラジレイロ · 復古洋食午餐",
          type: "cafe", time: "11:00", lat: 33.5966, lng: 130.4101,
          desc: "昭和 9 年（1934）創業、福岡現存最古老的喫茶店，就在新飯店旁（呉服町站 2 分、步行 3 分）。自家焙煎珈琲＋手作洋食，名物『ミンチカツレツ』（1 日限定 15 食、要予約）與復古手作布丁——把你想吃的『布丁』用市區版補回來。當 8/8 北上前的悠閒午餐最順；10:00 開、週日・假日（含 8/11 山之日）公休，所以排在週六這天剛好。",
          arrive: {
            mode: "walk",
            text: "悠閒早晨，從 COCO 步行約 3 分到 Brasileiro（店屋町、呉服町站旁）。",
            legs: [{ seg: "COCO→ブラジレイロ", line: "步行", type: "徒步", min: 3, fare: 0 }],
            fare: "¥0"
          },
          cost: { jpy: "洋食套餐約 ¥1,200–1,800／自家焙煎珈琲 ¥600／名物布丁 ¥450", note: "1934 創業·福岡最古喫茶；名物ミンチカツレツ 1 日限定 15 食要予約；10:00 開、週日／假日休", book: { label: "カフェ ブラジレイロ 案內", url: "https://fbrs800.gorp.jp/" } }
        },
        {
          id: "d2-kokura", key: "kokura", name: "小倉 · 北九州市中心",
          type: "shop", time: "13:00", lat: 33.8847, lng: 130.8736,
          photo: "assets/img/kokura.jpg",
          desc: "北九州的門戶城市，輕鬆逛吃半天（當日來回、不帶行李）：旦過市場（百年「北九州的廚房」、在地小吃食べ歩き）、小倉城＋庭園、魚町銀天街等有頂棚商店街（冷氣多、避熱）、リバーウォーク北九州。午餐已在 Brasileiro 吃過，這裡以食べ歩き點心為主。",
          arrive: {
            mode: "rail",
            text: "午餐後從 Brasileiro 步行至呉服町站 → 地下鐵（中洲川端轉空港線）至博多 → 博多→小倉新幹線約 16 分（當日來回、不帶行李）。",
            legs: [{ seg: "博多→小倉", line: "JR 山陽新幹線（のぞみ／みずほ／さくら／こだま）", type: "自由席", min: 16, fare: 2160 }],
            fare: "¥2,160（自由席·免預約）＋地鐵 ¥210",
            freq: "約每 5–15 分一班",
            alt: "省錢：JR 鹿兒島本線『快速』約 65 分／¥1,310（差約 ¥850）",
            book: { label: "スマートEX（新幹線 ネット予約・チケットレス）", url: "https://smart-ex.jp/" }
          },
          cost: { jpy: "午餐約 ¥200–2,000／人", note: "旦過市場食べ歩き ¥200–1,000；坐下定食 ¥1,500–2,000" }
        },
        {
          id: "d2-sarakura", key: "sarakura", name: "皿倉山 · 山頂展望台",
          type: "night", time: "17:30", lat: 33.8468, lng: 130.7971,
          photo: "assets/img/sarakura.jpg",
          desc: "纜車＋スロープカー上山，看日落（8/8 日落 19:12，19:10–19:45 是 magic hour）與「新日本三大夜景」。山頂比平地涼約 5°C；餐廳「天宮」開到 21:00 可邊看夜景邊用餐。纜車＋坡道車來回通票 大人 ¥1,230。看完夜景搭 JR 回福岡。",
          arrive: {
            mode: "rail",
            text: "小倉→八幡 JR 約 13 分 → 八幡駅免費接駁巴士約 10 分（土曜全天）→ 纜車＋坡道車上山。",
            legs: [
              { seg: "小倉→八幡", line: "JR 鹿兒島本線", type: "普通", min: 15, fare: 340 },
              { seg: "八幡駅→皿倉山麓", line: "皿倉山 免費接駁巴士", type: "シャトル（免費）", min: 10, fare: 0 },
              { seg: "山麓→山頂", line: "ケーブルカー＋スロープカー", type: "纜車＋坡道車", min: 10, fare: 1230 }
            ],
            fare: "JR ¥340 ＋ 纜車往復 ¥1,230",
            freq: "接駁巴士每 20 分（每時 05／25 分發；土曜 9:45 始發、山麓末班 22:15）",
            alt: "趕不上接駁 → 計程車約 ¥770 直達山麓（約 6 分）",
            book: { label: "皿倉山纜車 公式（運賃·接駁時刻）", url: "https://www.sarakurayama-cablecar.co.jp/fare/" }
          },
          cost: { jpy: "纜車＋坡道車 往復 ¥1,230／人", note: "夏季運行至 22:00、上り末班 21:20；山頂餐廳『天宮』餐費另計", book: { label: "皿倉山纜車 官方", url: "https://www.sarakurayama-cablecar.co.jp/fare/" } }
        }
      ]
    },
    {
      n: 3, date: "8/9", dow: "週日", fromHome: true, toHome: true,
      theme: "福岡市內悠閒日 · 天神購物＋一蘭演舞屋台壓軸",
      color: "#B0436A", colorText: "#9E3D60",
      summary: "睡到自然醒、放空逛街的悠閒一天（不排 teamLab、步調最慢）：天神購物買齊伴手禮（含天神地下街、YOU+MORE!）、shin shin 拉麵當午餐、巷弄咖啡，Canal City 看夜噴泉，壓軸是一蘭本社陽台演舞與中洲屋台＋那珂川河畔。",
      returnNote: "壓軸動線都在地鐵／步行圈：Canal City → 一蘭総本店（20:00 演舞）→ 中洲屋台 → 步行約 12 分回 COCO Gofukumachi（上呉服町；或地鐵中洲川端→呉服町 1 站）。河畔晚風是 8 月福岡最舒服的時刻。屋台週日部分店休，但 8/7 抵達夜已先吃過一輪，演舞每天都有不受影響。",
      bookLinks: [
        { label: "COCO Gofukumachi 訂房（四晚）", url: "https://www.booking.com/hotel/jp/coco-gofukumachi-fukuoka1.html" }
      ],
      stops: [
        {
          id: "d3-tenjin", key: "tenjin", name: "天神購物（岩田屋・三越・PARCO＋天神地下街）",
          type: "shop", time: "13:00", lat: 33.5908, lng: 130.3990,
          photo: "assets/img/tenjin.jpg",
          desc: "百貨＋19 世紀歐風「天神地下街」＋藥妝雜貨，移動全程冷氣、整天避熱不怕曬。順逛天神地下街的療癒雜貨店 YOU+MORE!（西 2 番街）。伴手禮今天買齊（岩田屋 B2 食品館最強）。午餐推薦『shin shin（シンシン）天神本店』博多豚骨拉麵（清爽湯頭＋極細麵，與一蘭不同店，站旁徒步 3 分；週三休）。逛累可轉進大名・今泉巷弄咖啡。",
          arrive: {
            mode: "rail",
            text: "悠閒早晨：從 COCO 步行 3 分至呉服町站 → 地下鐵（中洲川端轉空港線）至天神約 8 分 ¥210（想吃早餐可順到博多駅前 DACOMECCA 麵包，8:00 開）。今天不排 teamLab、純室內購物、步調最慢。",
            legs: [{ seg: "COCO→天神", line: "地下鐵 箱崎線→空港線（中洲川端轉）", type: "地鐵 2 站", min: 8, fare: 210 }],
            fare: "¥210",
            freq: "地鐵約每 5 分"
          },
          cost: { jpy: "shin shin 拉麵 ¥770（套餐約 ¥1,100）／DACOMECCA 麵包 ¥250–500", note: "伴手禮另抓預算（岩田屋 B2 食品館最強）", book: { label: "shin shin 官方", url: "https://www.hakata-shinshin.com/menu_tenjin01" } }
        },
        {
          id: "d3-canal", key: "canalcity", name: "Canal City 博多",
          type: "shop", time: "17:45", lat: 33.5899, lng: 130.4114,
          photo: "assets/img/canalcity.jpg",
          desc: "運河噴泉（17:30 起每半小時一場夜間光雕水舞，看 18:00／19:00 早場）＋晚餐自由。想吃一蘭限定「重箱釜だれとんこつ」就在這裡的 Canal City 店。「晚上博多運河逛逛」說的就是這裡的運河中庭，緊鄰那珂川、與中洲一河之隔（離 COCO 步行僅約 11 分）。19:25 準時離開前往總本店。",
          arrive: {
            mode: "rail",
            text: "地鐵天神→中洲川端約 3 分 ＋ 川端通商店街（有頂棚）徒步 10 分。",
            legs: [
              { seg: "天神→中洲川端", line: "地下鐵 空港線", type: "普通", min: 3, fare: 210 },
              { seg: "中洲川端→Canal City", line: "步行（川端通商店街）", type: "徒步", min: 10, fare: 0 }
            ],
            fare: "¥210",
            freq: "地鐵約每 5 分"
          },
          cost: { jpy: "¥0（入場免費）", note: "運河噴泉光雕免費；晚餐自由（Canal City 店一蘭限定『重箱釜だれとんこつ』另計）" }
        },
        {
          id: "d3-ichiran", key: "ichiran", name: "一蘭本社総本店 · 和楽団演舞",
          type: "show", time: "20:00", lat: 33.5932, lng: 130.4046,
          photo: "assets/img/ichiran.jpg",
          desc: "一蘭本社総本店（中洲 5-3-2）。員工著和風華服在本社大樓陽台配原創樂曲演舞（約 15 分，站街上免費觀賞、不需消費）。19:40 前到位視野較好。演舞每天 20:00 都有；出發前 1–2 週再向官方確認照常演出。",
          arrive: {
            mode: "walk",
            text: "Canal City → 一蘭総本店：徒步約 10–15 分（經川端通商店街，中洲川端駅 2 號出口旁）。",
            legs: [{ seg: "Canal City→一蘭総本店", line: "步行", type: "徒步", min: 12, fare: 0 }],
            fare: "¥0"
          },
          cost: { jpy: "演舞 ¥0（免費觀賞、不需消費）", note: "想順便吃一蘭約 ¥980–1,310（深夜價＋替玉）" }
        },
        {
          id: "d3-yatai", key: "yatai", name: "中洲屋台 · 那珂川河畔",
          type: "food", time: "20:15", lat: 33.5907, lng: 130.4045,
          photo: "assets/img/yatai.jpg",
          desc: "清流公園屋台帶宵夜＋那珂川河畔散步，以屋台＋夜河景收尾後步行約 12 分回 COCO（或地鐵中洲川端→呉服町 1 站）。週日部分屋台店休，但 8/7（週五）抵達夜已先吃過一輪當保險；想吃中洲屋台天婦羅可找くすしゃん等攤。",
          arrive: {
            mode: "walk",
            text: "沿那珂川徒步 8–10 分至清流公園屋台帶。",
            legs: [{ seg: "一蘭→中洲屋台", line: "步行（那珂川河畔）", type: "徒步", min: 9, fare: 0 }],
            fare: "¥0"
          },
          cost: { jpy: "屋台一人 ¥2,500–4,000", note: "お通し約 ¥500＋飲料 2 杯＋料理 2–3 品；屋台拉麵約 ¥700" }
        }
      ]
    },
    {
      n: 4, date: "8/10", dow: "週一", fromHome: true, toHome: true,
      theme: "太宰府＋竈門神社＋柳川川下り · 古都與水鄉（輕裝）",
      color: "#2E8B57", colorText: "#237A48",
      summary: "從飯店輕裝出發的古都與水鄉日：上午太宰府天滿宮、隈研吾星巴克與山中的宝満宮竈門神社（腳力夠可順登後山天開稻荷），午後南下柳川搭どんこ舟遊掘割水道、在百年名店若松屋吃鰻魚せいろ蒸し，傍晚回天神以敘敘苑燒肉收尾。",
      returnNote: "歸途：西鐵柳川→二日市轉特急回西鐵福岡（天神）約 50 分（¥870，免特急料金），再地鐵回呉服町／回 COCO。晚餐推薦『叙々苑 天神岩田屋本店新館 7F』高級燒肉（每人約 ¥10,000–16,000，人氣店務必先予約；想離飯店近也可選薬院・渡辺通『ヤキニク上』）。整段西鐵往返＋柳川川下り用「太宰府・柳川観光きっぷ」最划算。",
      bookLinks: [
        { label: "叙々苑 線上予約", url: "https://booking.resty.jp/webrsv/search/s014005101/28004" },
        { label: "西鐵『太宰府・柳川観光きっぷ』", url: "https://www.nishitetsu.jp/train/digitalkippu/" }
      ],
      stops: [
        {
          id: "d4-sbux", key: "kuma_sbux", name: "隈研吾星巴克 · 太宰府表參道",
          type: "cafe", time: "11:00", lat: 33.5196, lng: 130.5334,
          photo: "assets/img/kuma_sbux.jpg",
          desc: "2,000 根杉木木組隧道，建築迷必拍，可坐下吹冷氣。かさの家現烤梅ヶ枝餅（約 ¥150）就在參道上，邊走邊吃。",
          arrive: {
            mode: "rail",
            text: "10:00 從 COCO 輕裝出發：步行 3 分至呉服町站 → 地鐵至天神 → 步行至西鐵福岡（天神）→ 西鐵急行至二日市轉太宰府線，門到門約 60–70 分。",
            legs: [
              { seg: "COCO→西鐵福岡（天神）", line: "地下鐵（呉服町→天神）＋步行", type: "地鐵＋徒步", min: 18, fare: 210 },
              { seg: "西鐵福岡→西鐵二日市", line: "西鐵天神大牟田線", type: "急行", min: 16, fare: null },
              { seg: "二日市→太宰府", line: "西鐵太宰府線", type: "普通", min: 6, fare: null }
            ],
            fare: "地鐵 ¥210 ＋ 西鐵直通約 ¥420",
            freq: "西鐵急行約每 15 分；太宰府線約每 10–20 分",
            alt: "強烈建議買『太宰府・柳川観光きっぷ』¥3,620（含西鐵往復＋柳川川下り＋太宰府/柳川折扣，2 日有效）",
            book: { label: "西鐵『太宰府・柳川観光きっぷ』", url: "https://www.nishitetsu.jp/train/digitalkippu/" }
          },
          cost: { jpy: "星巴克咖啡 ¥390–585／梅ヶ枝餅 ¥150／個", note: "邊走邊吃；星巴克可坐下吹冷氣" }
        },
        {
          id: "d4-dazaifu", key: "dazaifu", name: "太宰府天滿宮（含天開稻荷·彈性）",
          type: "sight", time: "11:30", lat: 33.5213, lng: 130.5347,
          photo: "assets/img/dazaifu.jpg",
          desc: "學問之神菅原道真的總本宮，124 年大改修後的新檜皮本殿今年 5 月剛開放。參道平路、兩側名店與梅ヶ枝餅。【彈性備案】腳力夠可順登本殿後山的「天開稻荷神社」——九州最古老稻荷、紅鳥居拾級而上的絕景，本殿步行 5–10 分、連奧之院石室來回約 30 分，不用多搭車；太累就跳過。",
          arrive: {
            mode: "walk",
            text: "沿表參道徒步約 5 分（全程平路）。",
            legs: [{ seg: "表參道→天滿宮", line: "步行（表參道）", type: "徒步", min: 5, fare: 0 }],
            fare: "¥0"
          },
          cost: { jpy: "参拝 ¥0（免費）", note: "天滿宮・天開稻荷参拝皆免費；御朱印 ¥300" }
        },
        {
          id: "d4-kamado", key: "kamado", name: "宝満宮竈門神社",
          type: "sight", time: "12:45", lat: 33.5396, lng: 130.5566,
          photo: "assets/img/kamado.jpg",
          desc: "太宰府東北山中的結緣・除厄古社，四季楓紅楓綠很美；現代設計的「お守り授与所」是話題打卡點，也因動漫聯想而知名，境內可俯瞰太宰府。",
          arrive: {
            mode: "bus",
            text: "太宰府駅前搭社區巴士「まほろば号」內山行約 10 分（¥100）直達；或計程車約 10 分。",
            legs: [{ seg: "太宰府駅→竈門神社", line: "コミュニティバス まほろば号（五条・内山線）", type: "社區巴士", min: 10, fare: 100 }],
            fare: "¥100（全程均一）",
            freq: "約每 30 分一班（終發 18:48，回程要留意）",
            alt: "終巴士後／行李多 → 計程車約 ¥800–1,000（約 2km）",
            book: { label: "太宰府市 まほろば号 路線", url: "https://www.city.dazaifu.lg.jp/site/communitybus/" }
          },
          cost: { jpy: "参拝 ¥0／お守り『むすびの糸』¥1,500", note: "参拝免費，只有授与品收費；御朱印 ¥300", book: { label: "竈門神社 お守り", url: "https://kamadojinja.or.jp/amulet/" } }
        },
        {
          id: "d4-yanagawa", key: "yanagawa", name: "柳川 · どんこ舟川下り＋若松屋鰻魚",
          type: "nature", time: "15:00", lat: 33.1607, lng: 130.3997,
          photo: "assets/img/yanagawa.jpg",
          desc: "「水鄉柳川」搭どんこ舟由船夫撐篙遊掘割水道約 70 分，沿岸柳樹、紅磚、舊水門。名物午餐就在終點沖端的百年名店『若松屋』（創業約 1860 年）吃鰻魚せいろ蒸し（蒸籠鰻飯）——就在沖端乗船場正前方；週三及每月第 1・3 週二休、賣完即止，建議先確認。終點沖端另有藩主立花邸「御花」可順遊。",
          arrive: {
            mode: "rail",
            text: "太宰府 → 二日市轉西鐵特急 → 西鐵柳川約 45 分，站前轉乘船場接駁。",
            legs: [
              { seg: "太宰府→西鐵二日市", line: "西鐵太宰府線", type: "普通", min: 6, fare: 170 },
              { seg: "二日市→西鐵柳川", line: "西鐵天神大牟田線", type: "特急（免特急料金）", min: 32, fare: 700 }
            ],
            fare: "¥870（太宰府→柳川；持觀光きっぷ則已含）",
            freq: "特急約每 30 分（二日市同站轉乘）",
            book: { label: "柳川川下り（大東）予約", url: "https://daitoenterprise.com/kawakudari" }
          },
          cost: { jpy: "川下り ¥1,800–2,000／人；若松屋鰻魚せいろ ¥3,900（梅 ¥3,500／上 ¥4,230）", note: "川下り約 70 分；若松屋週末與當日不收訂位、賣完提早收，平日可先洽詢", book: { label: "若松屋 官網", url: "https://wakamatuya.com/" } }
        }
      ]
    },
    {
      n: 5, date: "8/11", dow: "週二",
      theme: "回程日 · 早上只做一件事：去機場",
      color: "#5B6B8C", colorText: "#4A5872",
      summary: "行李前一晚整理好、伴手禮已買齊，早上零採購壓力。退房後計程車直達國際線航廈，從容報到，11:00 起飛返台。",
      stops: [
        {
          id: "d5-hotel", key: "nakasu", name: "COCO Gofukumachi（退房）",
          type: "hotel", time: "08:25", lat: 33.5976, lng: 130.4117,
          photo: "assets/img/nakasu.jpg",
          desc: "退房（COCO 不含早餐，可在博多駅前覓食或前一晚備早餐）。行李前一晚整理好；伴手禮已於 8/9 天神買齊，早上零採購壓力。四晚同一飯店、不換房，最後一早最從容。",
          arrive: { mode: "start", text: "🛏️ 整理好行李，從容出發。" },
          cost: { jpy: "—", note: "退房；房費計入前四晚" }
        },
        {
          id: "d5-airport", key: "airport", name: "福岡機場 國際線",
          type: "airport", time: "08:55", lat: 33.5857, lng: 130.4424,
          photo: "assets/img/airport.jpg",
          desc: "報到、安檢、免稅店最後補貨（漏買的伴手禮在這補齊）。9:00 前抵達櫃檯，距 11:00 起飛非常從容。",
          arrive: {
            mode: "taxi",
            text: "計程車約 15–18 分直達國際線航廈，帶行李最省力。",
            legs: [{ seg: "COCO→福岡空港 國際線", line: "計程車（GO／DiDi）", type: "計程車", min: 16, fare: 2400 }],
            fare: "約 ¥2,000–2,600（直達，可多人均攤）",
            alt: "省錢：地鐵呉服町→中洲川端→福岡空港（國內線）¥260 ＋ 免費接駁巴士轉國際線",
            book: { label: "福岡市地下鐵 案內", url: "https://subway.city.fukuoka.lg.jp/" }
          },
          cost: { jpy: "¥0（伴手禮已買齊）", note: "免稅店最後補貨" }
        }
      ]
    }
  ];

  // --- 行程總體資訊（資訊卡用）--------------------------------------
  const META = {
    title: "福岡 5天4夜",
    subtitle: "方案 A · 經典均衡",
    dateRange: "2026 / 8月7日（五）– 8月11日（二）",
    home: { name: "COCO Gofukumachi", lat: 33.5976, lng: 130.4117 },
    premise: "20:00 抵 FUK、8/11 11:00 起飛。每天約 10:00 出發、不早起；不趕、大眾運輸、午後與室內為主。四晚同一飯店、不換房。",
    musts: ["皿倉山纜車夜景", "太宰府天滿宮", "一蘭總部 20:00 陽台演舞"],
    hotel: "四晚都住『COCO Gofukumachi』（博多区上呉服町、那珂川東側）：公寓式小型旅店，緊鄰地下鐵箱崎線『呉服町』站（步行 3 分／210m），步行到 Canal City 約 11 分、中洲約 12 分；博多駅／天神搭地鐵 2 站即達。房內衛浴淋浴、免費 Wi-Fi、館內投幣洗衣；無大浴場、不含早餐。價格實惠、安靜，四晚不換房、北九州當日來回，行李零搬動。",
    designPoints: [
      { label: "日序鎖定", text: "皿倉山週六接駁巴士 → 北九州當日來回定 8/8；一蘭演舞＋屋台放在輕鬆的福岡室內日。" },
      { label: "省力動線", text: "四晚都住 COCO Gofukumachi（博多·上呉服町）、不換房；緊鄰呉服町站（箱崎線）、博多／天神地鐵 2 站可達，北九州（8/8）當日來回不過夜，行李零搬動。" },
      { label: "步調放慢", text: "每天約 10:00 才出發、不早起；午後與室內為主，8/9 不排 teamLab 最鬆、8/10 太宰府／柳川後以燒肉晚餐收尾。" },
      { label: "住宿亮點", text: "COCO Gofukumachi（上呉服町·呉服町站旁）公寓式四晚同一飯店：步行 Canal City 11 分、中洲 12 分，博多／天神地鐵 2 站；價格實惠、安靜，房內衛浴＋投幣洗衣（無大浴場／早餐）。" },
      { label: "美食加碼", text: "Brasileiro 復古洋食午餐（8/8·飯店旁老咖啡館）、shin shin 拉麵、柳川若松屋鰻魚、敘敘苑燒肉、博多 DACOMECCA 麵包，串進各天動線、不繞路。" }
    ],
    // 每人概估（2 人同行均攤、不含台北↔福岡機票；旺季實際可能上浮）
    budget: {
      note: "每人 · 2 人同行均攤。機票（2 人 NT$33,048）與住宿（4 晚 2 人 NT$14,605 ≈ ¥69,500）為實際購入價；交通／餐食／門票為旺季概估。",
      rows: [
        { label: "機票（台北⇄福岡來回）", val: "NT$16,524／人" },
        { label: "住宿（4 晚 COCO·2 人均攤）", val: "NT$7,303／人" },
        { label: "交通（5 天）", val: "約 ¥9,000–12,000" },
        { label: "餐食（鰻魚·燒肉等）", val: "約 ¥18,000–30,000" },
        { label: "門票／體驗", val: "約 ¥3,000–5,000" }
      ],
      total: "合計約 NT$30,000–34,000／人（含機票＋住宿實際；其餘旺季概估）"
    }
  };

  window.TRIP_DATA = { META, MODES, DAYS };
})();
