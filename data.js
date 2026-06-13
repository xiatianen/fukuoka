/* =====================================================================
 *  福岡 5天4夜 · 方案 A「經典均衡」— 互動地圖資料
 *  資料源：data/planA.json（權威）＋ HANDOFF.md §4/§5（已整理路線與座標）
 *  座標為 WGS84 (lat,lng)，取自公開地圖之最佳估計，已逐點校正。
 *  2026/6/14 第三輪：交通細到「每班車」(arrive.legs)＋訂票連結(book)＋
 *  各停點估價(cost)＋總預算概估(META.budget)；地圖路徑見 routes.js。
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
      n: 1, date: "8/7", dow: "週五",
      theme: "抵達日 · 輕鬆落地",
      color: "#C8923A", colorText: "#8A5E14",
      summary: "晚間 20:00 抵福岡機場，計程車直達中洲川端飯店，落地第一碗拉麵後早早休息——隔天是全程最長的一天。（8/9–8/10 才入住設計旅店 Hotel Il Palazzo。）",
      stops: [
        {
          id: "d1-airport", key: "airport", name: "福岡機場 國際線",
          type: "airport", time: "20:00", lat: 33.5857, lng: 130.4424,
          photo: "assets/img/airport.jpg",
          desc: "入境、領行李、領網卡。晚班通關人潮多時可能拖過 21:00，完全不抓緊。",
          arrive: { mode: "start", text: "✈️ 台北航班抵達國際線航廈" },
          cost: { jpy: "¥0", note: "入境、領取預訂的網卡／eSIM（出國前先網購最便宜）" }
        },
        {
          id: "d1-hotel", key: "nakasu", name: "中洲川端 飯店",
          type: "hotel", time: "21:30", lat: 33.5945, lng: 130.4055,
          photo: "assets/img/nakasu.jpg",
          desc: "check-in、放行李。抵達夜住中洲川端一般飯店（首選：ザ ロイヤルパーク キャンバス 福岡中洲）——夾在博多與天神正中間（空港線各 1 站），步行到一蘭／屋台 2–5 分。8/8 宿小倉，8/9–8/10 改住 Aldo Rossi 設計旅店 Hotel Il Palazzo（春吉）。",
          arrive: {
            mode: "taxi",
            text: "國際線航廈無地鐵站，帶行李夜間建議計程車直達；省錢可走免費接駁＋地下鐵。",
            legs: [{ seg: "國際線→中洲川端飯店", line: "計程車（GO／DiDi 叫車）", type: "計程車", min: 18, fare: 2600 }],
            fare: "約 ¥2,300–2,800（直達，可多人均攤）",
            freq: "",
            alt: "省錢：免費連絡巴士→地下鐵空港線（福岡空港→中洲川端）約 26 分／¥260（每人）。國際線無地鐵、需先接駁到國內線。",
            book: { label: "福岡市地下鐵 路線・運賃案內", url: "https://subway.city.fukuoka.lg.jp/" }
          },
          cost: { jpy: "約 ¥26,000–38,000／晚（2 人 1 室·素泊）", note: "中洲川端 ザ ロイヤルパーク キャンバス；暑假週末偏高、建議早訂比價", book: { label: "官方訂房", url: "https://www.royalparkhotels.co.jp/canvas/fukuokanakasu/" } }
        },
        {
          id: "d1-ichiran", key: "ichiran", name: "中洲覓食（一蘭總本店 / 屋台）",
          type: "food", time: "22:00", lat: 33.5932, lng: 130.4046,
          photo: "assets/img/ichiran.jpg",
          desc: "「落地第一碗」：川端通商店街、那珂川河畔屋台（週五有開），或 24 小時的一蘭總本店。吃完早點休息。（屋台壓軸雖排在 8/9，今晚先吃一輪當保險。）",
          arrive: {
            mode: "walk",
            text: "飯店周邊徒步 2–6 分。",
            legs: [{ seg: "飯店→中洲覓食", line: "步行", type: "徒步", min: 6, fare: 0 }],
            fare: "¥0"
          },
          cost: { jpy: "一蘭 ¥980（22 時後深夜價 ¥1,080）＋替玉 ¥210；屋台一人 ¥2,500–4,000", note: "屋台入店前先問大將『一人いくら？』避免超預算", book: { label: "一蘭 官方", url: "https://ichiran.com/" } }
        }
      ]
    },
    {
      n: 2, date: "8/8", dow: "週六",
      theme: "北九州輕鬆日 · 小倉散步＋皿倉山夜景＋宿小倉",
      color: "#2C6E9B", colorText: "#235C84",
      summary: "不趕的一天：退房帶行李北上小倉（先寄放飯店），旦過市場、小倉城、有頂棚商店街輕鬆逛吃，傍晚轉八幡上皿倉山看日落與「新日本三大夜景」，今晚就住小倉——不必趕最後一班回博多。",
      returnNote: "今晚宿小倉（北九州一晚）：看完夜景不趕回博多，山頂餐廳「天宮」開到 21:00，可邊看夜景邊吃晚餐，或回小倉駅周邊用餐。山頂比平地涼約 5°C。隔天一早再悠閒回福岡放行李、輕裝南下太宰府。",
      stops: [
        {
          id: "d2-kokura", key: "kokura", name: "小倉 · 北九州市中心",
          type: "shop", time: "12:30", lat: 33.8847, lng: 130.8736,
          photo: "assets/img/kokura.jpg",
          desc: "北九州的門戶城市，輕鬆逛吃半天：旦過市場（百年「北九州的廚房」、在地小吃）、小倉城＋庭園、魚町銀天街等有頂棚商店街（冷氣多、避熱）、リバーウォーク北九州。先把行李寄放小倉駅周邊飯店再散策。午餐在旦過或城下町解決。",
          arrive: {
            mode: "rail",
            text: "10:00 退房帶行李，博多→小倉新幹線約 16 分，抵小倉先寄行李再開逛。",
            legs: [{ seg: "博多→小倉", line: "JR 山陽新幹線（のぞみ／みずほ／さくら／こだま）", type: "自由席", min: 16, fare: 2160 }],
            fare: "¥2,160（自由席·免預約）",
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
          desc: "纜車＋スロープカー上山，看日落（8/8 日落 19:12，19:10–19:45 是 magic hour）與「新日本三大夜景」。山頂比平地涼約 5°C；餐廳「天宮」開到 21:00，今晚住小倉、可邊看夜景邊用餐不趕時間。",
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
        },
        {
          id: "d2-hotel", key: "kokura", name: "小倉 宿 · 北九州一晚",
          type: "hotel", time: "21:00", lat: 33.8873, lng: 130.8824,
          photo: "assets/img/kokura.jpg",
          desc: "今晚住小倉（小倉駅周邊飯店）：看完皿倉山夜景不趕回博多，是這趟唯一一晚離開福岡。明早悠閒回福岡 Il Palazzo 放行李、輕裝南下太宰府／柳川——這樣行李不用帶著往南跑，也省下宅急便與空房。",
          arrive: {
            mode: "rail",
            text: "皿倉山下山 → 八幡駅 → JR 鹿兒島本線回小倉約 13 分 → 小倉駅周邊飯店。",
            legs: [{ seg: "皿倉山→八幡→小倉", line: "纜車＋JR 鹿兒島本線", type: "纜車＋普通", min: 30, fare: 340 }],
            fare: "¥340（下山纜車含於往復票）"
          },
          cost: { jpy: "約 ¥12,000–20,000／晚（2 人 1 室）", note: "小倉駅周邊；首選リーガロイヤル小倉，另收宿泊稅 ¥200／人", book: { label: "リーガロイヤル小倉 官方", url: "https://www.rihga.co.jp/kokura/stay/" } }
        }
      ]
    },
    {
      n: 3, date: "8/9", dow: "週日",
      theme: "福岡市內悠閒日 · 天神購物＋一蘭演舞屋台壓軸",
      color: "#B0436A", colorText: "#9E3D60",
      summary: "小倉回福岡、放好行李的悠閒一天（不排 teamLab、步調最慢）：天神購物買齊伴手禮（含天神地下街、YOU+MORE!）、shin shin 拉麵當午餐、巷弄咖啡，Canal City 看夜噴泉，壓軸是一蘭本社陽台演舞與中洲屋台＋那珂川河畔。",
      returnNote: "壓軸動線全在步行圈：Canal City → 一蘭総本店（20:00 演舞）→ 中洲屋台 → Hotel Il Palazzo（春吉，步行幾分鐘）。河畔晚風是 8 月福岡最舒服的時刻。屋台週日部分店休，但 8/7 抵達夜已先吃過一輪，演舞每天都有不受影響。",
      bookLinks: [
        { label: "Hotel Il Palazzo 訂房（8/9–8/10）", url: "https://ilpalazzo.jp/en/?tripla_booking_widget_open=search&locale=en" }
      ],
      stops: [
        {
          id: "d3-tenjin", key: "tenjin", name: "天神購物（岩田屋・三越・PARCO＋天神地下街）",
          type: "shop", time: "13:00", lat: 33.5908, lng: 130.3990,
          photo: "assets/img/tenjin.jpg",
          desc: "百貨＋19 世紀歐風「天神地下街」＋藥妝雜貨，移動全程冷氣、整天避熱不怕曬。順逛天神地下街的療癒雜貨店 YOU+MORE!（西 2 番街）。伴手禮今天買齊（岩田屋 B2 食品館最強）。午餐推薦『shin shin（シンシン）天神本店』博多豚骨拉麵（清爽湯頭＋極細麵，與一蘭不同店，站旁徒步 3 分；週三休）。逛累可轉進大名・今泉巷弄咖啡。",
          arrive: {
            mode: "rail",
            text: "悠閒早晨：小倉→博多 新幹線約 16 分（博多駅前 DACOMECCA 麵包早餐，8:00 開）→ 回 Il Palazzo 放行李 → 地鐵到天神。今天不排 teamLab、純室內購物、步調最慢。",
            legs: [
              { seg: "小倉→博多", line: "JR 山陽新幹線", type: "自由席", min: 16, fare: 2160 },
              { seg: "博多→天神（放行李後）", line: "地下鐵 空港線", type: "普通", min: 5, fare: 260 }
            ],
            fare: "¥2,420（新幹線 ¥2,160＋地鐵 ¥260）",
            freq: "新幹線日中每小時 6–10 班；地鐵約每 5 分",
            book: { label: "JR九州 ネット予約", url: "https://www.jrkyushu-kippu.jp/" }
          },
          cost: { jpy: "shin shin 拉麵 ¥770（套餐約 ¥1,100）／DACOMECCA 麵包 ¥250–500", note: "伴手禮另抓預算（岩田屋 B2 食品館最強）", book: { label: "shin shin 官方", url: "https://www.hakata-shinshin.com/menu_tenjin01" } }
        },
        {
          id: "d3-canal", key: "canalcity", name: "Canal City 博多",
          type: "shop", time: "17:45", lat: 33.5899, lng: 130.4114,
          photo: "assets/img/canalcity.jpg",
          desc: "運河噴泉（17:30 起每半小時一場夜間光雕水舞，看 18:00／19:00 早場）＋晚餐自由。想吃一蘭限定「重箱釜だれとんこつ」就在這裡的 Canal City 店。「晚上博多運河逛逛」說的就是這裡的運河中庭，緊鄰那珂川、與中洲一河之隔。19:25 準時離開前往總本店。",
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
          desc: "清流公園屋台帶宵夜＋那珂川河畔散步，以屋台＋夜河景收尾後步行回 Il Palazzo。週日部分屋台店休，但 8/7（週五）抵達夜已先吃過一輪當保險；想吃中洲屋台天婦羅可找くすしゃん等攤。",
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
      n: 4, date: "8/10", dow: "週一",
      theme: "太宰府＋竈門神社＋柳川川下り · 古都與水鄉（輕裝）",
      color: "#2E8B57", colorText: "#237A48",
      summary: "從福岡輕裝出發的古都與水鄉日：上午太宰府天滿宮、隈研吾星巴克與山中的宝満宮竈門神社（腳力夠可順登後山天開稻荷），午後南下柳川搭どんこ舟遊掘割水道、在百年名店若松屋吃鰻魚せいろ蒸し，傍晚回福岡以敘敘苑燒肉收尾。",
      returnNote: "歸途：西鐵柳川→二日市轉特急回西鐵福岡（天神）約 50 分（¥870，免特急料金）＋ 地鐵回中洲川端 ¥210。晚餐推薦『叙々苑 天神岩田屋本店新館 7F』高級燒肉（每人約 ¥10,000–16,000，人氣店務必先予約；想離飯店近也可選薬院・渡辺通『ヤキニク上』）。餐後回 Hotel Il Palazzo。整段西鐵往返＋柳川川下り用「太宰府・柳川観光きっぷ」最划算。",
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
            text: "10:00 從中洲川端輕裝出發（行李已在福岡飯店）：地鐵→天神＋西鐵急行至二日市轉太宰府線，門到門約 55–60 分。",
            legs: [
              { seg: "中洲川端→天神", line: "地下鐵 空港線", type: "普通", min: 3, fare: 210 },
              { seg: "天神→西鐵福岡（天神）", line: "站間步行連絡", type: "徒步", min: 7, fare: 0 },
              { seg: "西鐵福岡→西鐵二日市", line: "西鐵天神大牟田線", type: "急行", min: 16, fare: null },
              { seg: "二日市→太宰府", line: "西鐵太宰府線", type: "普通", min: 6, fare: null }
            ],
            fare: "西鐵直通票約 ¥420（地鐵另 ¥210）",
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
          id: "d5-hotel", key: "nakasu", name: "Hotel Il Palazzo（退房）",
          type: "hotel", time: "08:25", lat: 33.5887, lng: 130.4030,
          photo: "assets/img/nakasu.jpg",
          desc: "早餐＋退房。行李前一晚整理好；伴手禮已於 8/9 天神買齊，早上零採購壓力。",
          arrive: { mode: "start", text: "🛏️ 最後一晚住設計旅店，從容出發。" },
          cost: { jpy: "—", note: "退房；房費計入 8/10 那晚" }
        },
        {
          id: "d5-airport", key: "airport", name: "福岡機場 國際線",
          type: "airport", time: "08:55", lat: 33.5857, lng: 130.4424,
          photo: "assets/img/airport.jpg",
          desc: "報到、安檢、免稅店最後補貨（漏買的伴手禮在這補齊）。9:00 前抵達櫃檯，距 11:00 起飛非常從容。",
          arrive: {
            mode: "taxi",
            text: "計程車約 15–20 分直達國際線航廈，帶行李最省力。",
            legs: [{ seg: "飯店→福岡空港 國際線", line: "計程車（GO／DiDi）", type: "計程車", min: 18, fare: 2600 }],
            fare: "約 ¥2,300–2,800（直達，可多人均攤）",
            alt: "省錢：地鐵中洲川端→福岡空港（國內線）¥260 ＋ 免費接駁巴士轉國際線",
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
    premise: "20:00 抵 FUK、8/11 11:00 起飛。每天約 10:00 出發、不早起；不趕、大眾運輸、午後與室內為主。Day3／Day4 已對調為最省力動線。",
    musts: ["皿倉山纜車夜景", "太宰府天滿宮", "一蘭總部 20:00 陽台演舞"],
    hotel: "8/7 抵達夜住中洲川端一般飯店（近一蘭／屋台、空港線各 1 站）；8/8 北九州一晚宿小倉；8/9–8/10 入住 Hotel Il Palazzo（春吉·Aldo Rossi 設計名旅店、中洲旁），演舞屋台夜散步回房最近。",
    designPoints: [
      { label: "日序鎖定", text: "皿倉山週六接駁巴士 → 北九州＋宿小倉定 8/8；一蘭演舞＋屋台放在輕鬆的福岡室內日。" },
      { label: "省力動線", text: "8/8 宿小倉，隔天回福岡放行李、過室內輕鬆日；太宰府／柳川挪到再後一天輕裝南下——不寄宅急便、不付空房、不帶行李往南跑。" },
      { label: "步調放慢", text: "每天約 10:00 才出發、不早起；午後與室內為主，8/10 太宰府／柳川後以燒肉晚餐輕鬆收尾。" },
      { label: "住宿亮點", text: "8/7 中洲川端一般飯店、8/8 宿小倉、8/9–8/10 入住 Aldo Rossi 設計名旅店 Hotel Il Palazzo（春吉·中洲旁）——演舞屋台夜走回房最近。" },
      { label: "美食加碼", text: "shin shin 拉麵、柳川若松屋鰻魚、敘敘苑燒肉、博多 DACOMECCA 麵包，串進各天動線、不繞路。" }
    ],
    // 每人概估（2 人同行均攤、不含台北↔福岡機票；旺季實際可能上浮）
    budget: {
      note: "每人概估 · 2 人同行均攤、不含機票；暑假旺季實際可能上浮",
      rows: [
        { label: "交通（5 天）", val: "約 ¥10,000–13,000" },
        { label: "餐食（含若松屋鰻魚、敘敘苑燒肉等）", val: "約 ¥18,000–30,000" },
        { label: "住宿（4 晚 · 2 人 1 室均攤）", val: "約 ¥45,000–60,000" },
        { label: "門票／體驗（皿倉山纜車 ¥1,230、柳川川下り ¥2,000、お守り等）", val: "約 ¥3,000–5,000" }
      ],
      total: "合計約 ¥80,000–105,000／人（≈ NT$17,000–22,000，不含機票）"
    }
  };

  window.TRIP_DATA = { META, MODES, DAYS };
})();
