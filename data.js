/* =====================================================================
 *  福岡 5天4夜 · 方案 A「經典均衡」— 互動地圖資料
 *  資料源：data/planA.json（權威）＋ HANDOFF.md §4/§5（已整理路線與座標）
 *  座標為 WGS84 (lat,lng)，取自公開地圖之最佳估計，已逐點校正。
 * ===================================================================== */
(function () {
  "use strict";

  // --- 交通方式定義（圖例 + 線型 + 圖示）-----------------------------
  // dash: Leaflet polyline dashArray；null = 實線。
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
      summary: "晚間 20:00 抵福岡機場，計程車直達中洲川端飯店，落地第一碗拉麵後早早休息——隔天是全程最長的一天。",
      stops: [
        {
          id: "d1-airport", key: "airport", name: "福岡機場 國際線",
          type: "airport", time: "20:00", lat: 33.5857, lng: 130.4424,
          photo: "assets/img/airport.jpg",
          desc: "入境、領行李、領網卡。晚班通關人潮多時可能拖過 21:00，完全不抓緊。",
          arrive: { mode: "start", text: "✈️ 台北航班抵達國際線航廈" }
        },
        {
          id: "d1-nakasu", key: "nakasu", name: "中洲川端 飯店",
          type: "hotel", time: "21:30", lat: 33.5945, lng: 130.4055,
          photo: "assets/img/nakasu.jpg",
          desc: "check-in、放行李。住宿選中洲川端——夾在博多與天神正中間（空港線各 1 站），步行到一蘭／屋台 2–5 分。四晚不換飯店。",
          arrive: { mode: "taxi", text: "計程車約 15–20 分（¥2,000–3,000）直達；省錢替代：免費接駁＋地鐵空港線約 8 分。" }
        },
        {
          id: "d1-ichiran", key: "ichiran", name: "中洲覓食（一蘭總本店 / 屋台）",
          type: "food", time: "22:00", lat: 33.5932, lng: 130.4046,
          photo: "assets/img/ichiran.jpg",
          desc: "「落地第一碗」：川端通商店街、那珂川河畔屋台（週五有開），或 24 小時的一蘭總本店。吃完早點休息。",
          arrive: { mode: "walk", text: "飯店周邊徒步 2–8 分。" }
        }
      ]
    },
    {
      n: 2, date: "8/8", dow: "週六",
      theme: "北九州輕鬆日 · 小倉散步＋皿倉山夜景",
      color: "#2C6E9B", colorText: "#235C84",
      summary: "不趕的一天：上午福岡市內悠閒（咖啡、晃晃），午後搭新幹線北上小倉散步吃喝（旦過市場、小倉城、有頂棚商店街），傍晚轉八幡上皿倉山看日落與「新日本三大夜景」。",
      returnNote: "歸途：皿倉山下山後 八幡駅 → JR 鹿兒島本線回博多約 1 小時，回中洲川端飯店。山頂比平地涼約 5°C，是 8 月最舒服的避暑點。",
      stops: [
        {
          id: "d2-kokura", key: "kokura", name: "小倉 · 北九州市中心",
          type: "shop", time: "12:30", lat: 33.8847, lng: 130.8736,
          photo: "assets/img/kokura.jpg",
          desc: "北九州的門戶城市，輕鬆逛吃半天：旦過市場（百年「北九州的廚房」、在地小吃）、小倉城＋庭園、魚町銀天街等有頂棚商店街（冷氣多、避熱）、リバーウォーク北九州。午餐在旦過或城下町解決。",
          arrive: { mode: "rail", text: "10:00 退房後福岡市內悠閒上午（咖啡／散步）→ 午前出發：博多→小倉 JR 新幹線約 16 分（¥2,160 自由席），或在來線快速約 1 小時（¥1,310）。" }
        },
        {
          id: "d2-sarakura", key: "sarakura", name: "皿倉山 · 山頂展望台",
          type: "night", time: "17:30", lat: 33.8468, lng: 130.7971,
          photo: "assets/img/sarakura.jpg",
          desc: "纜車＋スロープカー上山，看日落（8/8 日落 19:12，19:10–19:45 是 magic hour）與「新日本三大夜景」。山頂比平地涼約 5°C；餐廳「天宮」開到 21:00 可邊看夜景邊用餐。纜車＋坡道車來回通票 大人 ¥1,230。",
          arrive: { mode: "rail", text: "小倉 → 八幡 JR 鹿兒島本線約 13 分 → 八幡駅免費接駁巴士約 10 分（週六全天行駛）到山麓駅 → 纜車＋坡道車約 10 分上山。" }
        }
      ]
    },
    {
      n: 3, date: "8/9", dow: "週日",
      theme: "太宰府＋竈門神社＋柳川川下り · 古都與水鄉",
      color: "#2E8B57", colorText: "#237A48",
      summary: "古都與水鄉的一天：上午太宰府天滿宮、隈研吾星巴克與山中的宝満宮竈門神社，午後南下柳川搭どんこ舟遊掘割水道、吃名物鰻魚せいろ蒸し。",
      returnNote: "歸途：柳川 → 西鐵二日市轉急行回西鐵福岡（天神）約 50–60 分，回中洲川端飯店。太宰府－柳川為同一條西鐵線，可買「太宰府・柳川観光きっぷ」較划算。",
      stops: [
        {
          id: "d3-sbux", key: "kuma_sbux", name: "隈研吾星巴克 · 太宰府表參道",
          type: "cafe", time: "11:00", lat: 33.5196, lng: 130.5334,
          photo: "assets/img/kuma_sbux.jpg",
          desc: "2,000 根杉木木組隧道，建築迷必拍，可坐下吹冷氣。かさの家現烤梅ヶ枝餅（約 ¥150）就在參道上，邊走邊吃。",
          arrive: { mode: "rail", text: "10:00 飯店出發：地鐵中洲川端→天神 ＋ 西鐵急行至二日市轉太宰府線，門到門約 55–60 分（西鐵段 ¥480；建議買太宰府・柳川観光きっぷ）。" }
        },
        {
          id: "d3-dazaifu", key: "dazaifu", name: "太宰府天滿宮",
          type: "sight", time: "11:30", lat: 33.5213, lng: 130.5347,
          photo: "assets/img/dazaifu.jpg",
          desc: "學問之神菅原道真的總本宮，124 年大改修後的新檜皮本殿今年 5 月剛開放。參道平路、兩側名店與梅ヶ枝餅。",
          arrive: { mode: "walk", text: "沿表參道徒步約 5 分（全程平路）。" }
        },
        {
          id: "d3-kamado", key: "kamado", name: "宝満宮竈門神社",
          type: "sight", time: "12:30", lat: 33.5396, lng: 130.5566,
          photo: "assets/img/kamado.jpg",
          desc: "太宰府東北山中的結緣・除厄古社，四季楓紅楓綠很美；現代設計的「お守り授与所」是話題打卡點，也因動漫聯想而知名，境內可俯瞰太宰府。",
          arrive: { mode: "bus", text: "太宰府駅前搭社區巴士「まほろば号」內山行約 10 分（¥100）直達；或計程車約 10 分。" }
        },
        {
          id: "d3-yanagawa", key: "yanagawa", name: "柳川 · どんこ舟川下り",
          type: "nature", time: "15:00", lat: 33.1607, lng: 130.3997,
          photo: "assets/img/yanagawa.jpg",
          desc: "「水鄉柳川」搭どんこ舟由船夫撐篙遊掘割水道約 70 分（約 ¥1,800），沿岸柳樹、紅磚、舊水門。名物午餐：鰻魚せいろ蒸し（蒸籠鰻飯）。終點沖端有柳川藩主立花邸「御花」可順遊。",
          arrive: { mode: "rail", text: "太宰府 → 二日市轉西鐵大牟田線特急 → 西鐵柳川約 50–60 分（¥870），站前轉乘船場接駁。" }
        }
      ]
    },
    {
      n: 4, date: "8/10", dow: "週一",
      theme: "全室內購物日＋teamLab · 一蘭演舞＋屋台壓軸",
      color: "#B0436A", colorText: "#9E3D60",
      summary: "步調放慢的一天：teamLab Forest 蓋掉午後最熱時段，天神購物買齊伴手禮，Canal City 看噴泉，壓軸是一蘭本社陽台演舞與週一限定的中洲屋台宵夜。",
      returnNote: "壓軸動線全在步行圈：Canal City → 一蘭総本店 → 中洲屋台 → 飯店。河畔晚風是 8 月福岡最舒服的時刻。",
      stops: [
        {
          id: "d4-teamlab", key: "teamlab", name: "teamLab Forest · BOSS E・ZO",
          type: "museum", time: "11:00", lat: 33.5955, lng: 130.3626,
          photo: "assets/img/teamlab.jpg",
          desc: "捕獲與收集之森＋運動森林，全室內冷氣常設展，正好蓋掉一天最熱的時段（PayPayドーム旁）。浮動票價 ¥2,400 起，務必事前線上購票。",
          arrive: { mode: "taxi", text: "10:00 出發：飯店 → E・ZO 計程車約 10–15 分（約 ¥1,500）；替代：西鐵巴士至「九州医療センター」徒步 3 分。teamLab 平日 11:00 開館。" }
        },
        {
          id: "d4-tenjin", key: "tenjin", name: "天神購物（岩田屋・三越・PARCO）",
          type: "shop", time: "14:00", lat: 33.5908, lng: 130.3990,
          photo: "assets/img/tenjin.jpg",
          desc: "百貨＋天神地下街＋藥妝雜貨，移動全程冷氣。伴手禮務必今天買齊（岩田屋 B2 食品館最強）——明早 8:30 出發、百貨 10 點才開。逛累可轉進大名・今泉巷弄咖啡。",
          arrive: { mode: "taxi", text: "回天神：計程車約 10 分 或 地鐵約 5 分。" }
        },
        {
          id: "d4-canal", key: "canalcity", name: "Canal City 博多",
          type: "shop", time: "17:45", lat: 33.5899, lng: 130.4114,
          photo: "assets/img/canalcity.jpg",
          desc: "運河噴泉（18:00 起夜間噴泉，看 18:00／19:00 早場）＋晚餐自由。想吃一蘭限定「重箱釜だれとんこつ」就在這裡的 Canal City 店。19:25 準時離開前往總本店。",
          arrive: { mode: "rail", text: "地鐵天神→中洲川端約 3 分 ＋ 川端通商店街（有頂棚）徒步 10 分。" }
        },
        {
          id: "d4-ichiran", key: "ichiran", name: "一蘭本社総本店 · 和楽団演舞",
          type: "show", time: "20:00", lat: 33.5932, lng: 130.4046,
          photo: "assets/img/ichiran.jpg",
          desc: "一蘭本社総本店（中洲 5-3-2）。員工著和風華服在本社大樓陽台配原創樂曲演舞（約 15 分，站街上免費觀賞、不需消費）。19:40 前到位視野較好。出發前 1–2 週再向官方確認照常演出。",
          arrive: { mode: "walk", text: "Canal City → 一蘭総本店：徒步約 10–15 分（經川端通商店街，中洲川端駅 2 號出口旁）。" }
        },
        {
          id: "d4-yatai", key: "yatai", name: "中洲屋台 · 那珂川河畔",
          type: "food", time: "20:15", lat: 33.5907, lng: 130.4045,
          photo: "assets/img/yatai.jpg",
          desc: "週一屋台有開（週日多休，所以特地排今晚）。清流公園屋台帶宵夜＋那珂川河畔散步，最後一晚以屋台＋夜河景收尾，步行回飯店。",
          arrive: { mode: "walk", text: "沿那珂川徒步 8–10 分至清流公園屋台帶。" }
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
          id: "d5-hotel", key: "nakasu", name: "中洲川端 飯店（退房）",
          type: "hotel", time: "08:25", lat: 33.5945, lng: 130.4055,
          photo: "assets/img/nakasu.jpg",
          desc: "早餐＋退房。行李前一晚整理好；伴手禮已於 8/10 買齊，早上零採購壓力。",
          arrive: { mode: "start", text: "🛏️ 最後一晚泡完大浴場，從容出發。" }
        },
        {
          id: "d5-airport", key: "airport", name: "福岡機場 國際線",
          type: "airport", time: "08:55", lat: 33.5857, lng: 130.4424,
          photo: "assets/img/airport.jpg",
          desc: "報到、安檢、免稅店最後補貨（漏買的伴手禮在這補齊）。9:00 前抵達櫃檯，距 11:00 起飛非常從容。",
          arrive: { mode: "taxi", text: "計程車約 15–20 分（¥2,000–3,000）直達國際線航廈，帶行李最省力；台北航班在國際線、地鐵只到國內線需轉接駁。" }
        }
      ]
    }
  ];

  // --- 行程總體資訊（資訊卡用）--------------------------------------
  const META = {
    title: "福岡 5天4夜",
    subtitle: "方案 A · 經典均衡",
    dateRange: "2026 / 8月7日（五）– 8月11日（二）",
    premise: "20:00 抵 FUK、8/11 11:00 起飛。每天約 10:00 出發、不早起；不趕、大眾運輸、午後與室內為主。",
    musts: ["皿倉山纜車夜景", "太宰府天滿宮", "一蘭總部 20:00 陽台演舞"],
    hotel: "中洲川端（首選：ザ ロイヤルパーク キャンバス 福岡中洲）。四晚不換飯店。",
    designPoints: [
      { label: "日序鎖定", text: "皿倉山週六接駁巴士 → 北九州定 8/8；太宰府與柳川同屬西鐵線 → 併在 8/9。" },
      { label: "動線安排", text: "一天一區域；太宰府→柳川同一條西鐵線、小倉→八幡僅 13 分，動線順、零回頭。" },
      { label: "步調放慢", text: "每天約 10:00 才出發、不早起；行程精簡，午後與有遮蔭／室內為主。" },
      { label: "水鄉與夜景", text: "Day2 皿倉山新日本三大夜景、Day3 柳川どんこ舟遊水道，動靜各一個壓軸。" },
      { label: "壓軸收尾", text: "8/10 純室內購物日，一蘭演舞＋週一限定中洲屋台壓軸，順補伴手禮。" }
    ]
  };

  window.TRIP_DATA = { META, MODES, DAYS };
})();
