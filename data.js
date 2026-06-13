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
      color: "#C8923A",
      summary: "晚間 20:00 抵福岡機場，計程車直達中洲川端飯店，落地第一碗拉麵後早早休息——隔天是全程最長的一天。",
      stops: [
        {
          id: "d1-airport", key: "airport", name: "福岡機場 國際線",
          type: "airport", time: "20:00", lat: 33.5857, lng: 130.4483,
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
          type: "food", time: "22:00", lat: 33.5912, lng: 130.4073,
          photo: "assets/img/ichiran.jpg",
          desc: "「落地第一碗」：川端通商店街、那珂川河畔屋台（週五有開），或 24 小時的一蘭總本店。吃完早點休息。",
          arrive: { mode: "walk", text: "飯店周邊徒步 2–8 分。" }
        }
      ]
    },
    {
      n: 2, date: "8/8", dow: "週六",
      theme: "北九州跨海日 · 門司港＋唐戶＋皿倉山夜景",
      color: "#2C6E9B",
      summary: "全程最長、最重的一天：JR 直奔門司港懷舊街，渡船跨關門海峽吃唐戶壽司、海響館避正午熱，傍晚轉戰皿倉山看日落與「新日本三大夜景」。",
      returnNote: "歸途：20:40 纜車下山 → 21:15 山麓接駁 → 21:25 八幡駅 → JR 区間快速約 55 分，22:35 前後抵博多 → 地鐵／計程車回飯店。切勿誤搭 22:43 福間行（到不了博多）。",
      stops: [
        {
          id: "d2-hakata", key: "hakata_st", name: "博多駅",
          type: "station", time: "08:05", lat: 33.5897, lng: 130.4206,
          photo: "assets/img/hakata_st.jpg",
          desc: "早餐在飯店或博多駅內輕食解決。今天最長，提早出門不趕。",
          arrive: { mode: "rail", text: "飯店 → 博多駅：地鐵空港線 中洲川端→博多 約 3 分 ＋ 站內步行至 JR 月台約 10 分。" }
        },
        {
          id: "d2-mojiko", key: "mojiko", name: "門司港駅 · 建築巡禮",
          type: "sight", time: "09:50", lat: 33.9477, lng: 130.9627,
          photo: "assets/img/mojiko.jpg",
          desc: "1914 年木造、國家重要文化財現役車站。站內舊三等候車室改裝的星巴克可先吹冷氣。",
          arrive: { mode: "rail", text: "博多 → 門司港：JR 鹿兒島本線快速 直達約 1 小時 36 分（¥1,500）；求快可特急ソニック至小倉轉普通約 1 小時 15 分。班次出發前以乘換案內鎖定。" }
        },
        {
          id: "d2-karato", key: "karato", name: "唐戶市場「活きいき馬関街」",
          type: "food", time: "10:40", lat: 33.9575, lng: 130.9428,
          photo: "assets/img/karato.jpg",
          desc: "壽司攤午餐（週六 10:00–15:00、各攤賣完就收，11:30 前到貨最齊）。買好上 2F 室內座位吹冷氣吃。",
          arrive: { mode: "ferry", text: "關門汽船渡船 跨關門海峽 門司港→唐戶 約 5 分（¥400），門司港發每時 10/30/50 分，免預約。" }
        },
        {
          id: "d2-kaikyokan", key: "kaikyokan", name: "海響館 水族館",
          type: "aquarium", time: "12:00", lat: 33.9560, lng: 130.9468,
          photo: "assets/img/kaikyokan.jpg",
          desc: "2025/8 全面改裝重開。用冷氣館內跨過正午最熱時段——企鵝村、關門海峽潮流水槽、河豚展區。建議 WEB 事前購票免排隊（大人 ¥2,500）。",
          arrive: { mode: "walk", text: "唐戶市場旁徒步 2–3 分。" }
        },
        {
          id: "d2-mojiretro", key: "mitsui", name: "門司港レトロ（藍翼吊橋・三井俱樂部）",
          type: "sight", time: "14:30", lat: 33.9483, lng: 130.9626,
          photo: "assets/img/mitsui.jpg",
          desc: "藍翼吊橋開橋（每日 10/11/13/14/15/16 時，各約 20 分）、舊門司三井俱樂部 2F 愛因斯坦紀念房（¥150）、海峽プラザ＋燒咖哩下午茶（BEAR FRUITS／こがねむし）。室內外交錯，隨時有冷氣店可躲。",
          arrive: { mode: "ferry", text: "渡船回門司港 唐戶→門司港 約 5 分，唐戶發每時 00/20/40 分。" }
        },
        {
          id: "d2-sarakura", key: "sarakura", name: "皿倉山 · 山頂展望台",
          type: "night", time: "17:45", lat: 33.8527, lng: 130.7864,
          photo: "assets/img/sarakura.jpg",
          desc: "纜車＋スロープカー上山，看日落（8/8 日落 19:12，19:10–19:45 是 magic hour）與「新日本三大夜景」。山頂比平地涼約 5°C；餐廳「天宮」開到 21:00 可邊看夜景邊用餐。來回套票 ¥1,230。",
          arrive: { mode: "rail", text: "JR 門司港→八幡 快速約 30 分 → 八幡駅免費接駁巴士約 10 分（週六全天行駛）→ 纜車＋坡道車約 10 分上山。" }
        }
      ]
    },
    {
      n: 3, date: "8/9", dow: "週日",
      theme: "太宰府晨光＋午後市區美術館 · 傍晚早歸",
      color: "#2E8B57",
      summary: "趁涼晨遊太宰府天滿宮與隈研吾星巴克，上午躲進九州國立博物館吹冷氣看展；午後回市區看福岡市美術館（草間彌生《南瓜》），大濠湖畔散步後早歸泡大浴場。",
      returnNote: "週日中洲屋台多數公休 → 今晚定調早歸：晚餐在飯店周邊或川端通商店街解決，回房泡大浴場恢復體力。",
      stops: [
        {
          id: "d3-sbux", key: "kuma_sbux", name: "隈研吾星巴克 · 太宰府表參道",
          type: "cafe", time: "08:30", lat: 33.5188, lng: 130.5337,
          photo: "assets/img/kuma_sbux.jpg",
          desc: "2,000 根杉木木組隧道，早晨斜光最好拍，可坐下吹冷氣（8:00 已開）。かさの家 9:00 開門吃現烤梅ヶ枝餅（約 ¥150）。",
          arrive: { mode: "rail", text: "飯店 → 太宰府：地鐵中洲川端→天神 ＋ 天神地下街步行至西鉄福岡 ＋ 西鐵急行至二日市轉太宰府線，門到門約 55–60 分（西鐵段 ¥480；可買太宰府散策きっぷ）。" }
        },
        {
          id: "d3-dazaifu", key: "dazaifu", name: "太宰府天滿宮",
          type: "sight", time: "09:00", lat: 33.5213, lng: 130.5347,
          photo: "assets/img/dazaifu.jpg",
          desc: "124 年大改修後的新檜皮本殿今年 5 月剛開放，低興趣 30 分速覽即可。9 點後參道開始熱、10 點後人潮湧入——早到是避熱也是避人。",
          arrive: { mode: "walk", text: "沿表參道徒步約 5 分（全程平路，沿途梅ヶ枝餅）。" }
        },
        {
          id: "d3-kyuhaku", key: "kyuhaku", name: "九州國立博物館",
          type: "museum", time: "09:30", lat: 33.5180, lng: 130.5413,
          photo: "assets/img/kyuhaku.jpg",
          desc: "夏特展「氷河期展」＋常設展。9:30 開館即進場躲冷氣（當日券 ¥2,000 含常設）。菊竹清訓的雙曲面玻璃巨構本身就是建築看點，館內有咖啡可歇腿。",
          arrive: { mode: "walk", text: "天滿宮後方「虹のトンネル」電扶梯＋動步道，全程室內約 5 分，不曬太陽。" }
        },
        {
          id: "d3-art", key: "fukuoka_art", name: "福岡市美術館",
          type: "museum", time: "15:00", lat: 33.5854, lng: 130.3793,
          photo: "assets/img/fukuoka_art.jpg",
          desc: "達利・米羅・Warhol ＋ 草間彌生《南瓜》。此館週一休 → 只能排今天。常設展僅 ¥200；《南瓜》在 2 樓戶外平台面向大濠公園免費可看。",
          arrive: { mode: "rail", text: "太宰府 → 天神：「旅人」觀光列車區間車 13:51 發至二日市轉急行，全程約 40 分（免預約不加價）→ 地鐵空港線天神→大濠公園約 5 分 ＋ 徒步 10 分。" }
        },
        {
          id: "d3-ohori", key: "ohori", name: "大濠公園",
          type: "nature", time: "17:15", lat: 33.5866, lng: 130.3784,
          photo: "assets/img/ohori.jpg",
          desc: "湖畔傍晚散步（17 時後日照轉斜、湖風較涼）＋ 星巴克大濠公園店／大濠テラス（八女茶茶屋）。走一小段配湖景喝茶即可，不必環湖 2km。",
          arrive: { mode: "walk", text: "福岡市美術館出來即公園。" }
        },
        {
          id: "d3-back", key: "nakasu", name: "回中洲川端 飯店",
          type: "hotel", time: "18:30", lat: 33.5945, lng: 130.4055,
          photo: "assets/img/nakasu.jpg",
          desc: "晚間自由。週日中洲屋台多休，今晚早歸：晚餐在飯店周邊或川端通商店街，回房泡大浴場。",
          arrive: { mode: "rail", text: "地鐵大濠公園→中洲川端約 6 分。" }
        }
      ]
    },
    {
      n: 4, date: "8/10", dow: "週一",
      theme: "全室內購物日＋teamLab · 一蘭演舞＋屋台壓軸",
      color: "#B0436A",
      summary: "連兩天早起後刻意放慢：teamLab Forest 蓋掉最熱時段，天神購物買齊伴手禮，Canal City 看噴泉，壓軸是一蘭本社陽台演舞與週一限定的中洲屋台宵夜。",
      returnNote: "壓軸動線全在步行圈：Canal City → 一蘭総本店 → 中洲屋台 → 飯店。河畔晚風是 8 月福岡最舒服的時刻。",
      stops: [
        {
          id: "d4-teamlab", key: "teamlab", name: "teamLab Forest · BOSS E・ZO",
          type: "museum", time: "11:00", lat: 33.5955, lng: 130.3626,
          photo: "assets/img/teamlab.jpg",
          desc: "捕獲與收集之森＋運動森林，全室內冷氣常設展，正好蓋掉一天最熱的時段（PayPayドーム旁）。浮動票價 ¥2,400 起，務必事前線上購票。",
          arrive: { mode: "taxi", text: "飯店 → E・ZO：計程車約 10–15 分（約 ¥1,500）；替代：西鐵巴士至「九州医療センター」徒步 3 分。" }
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
          type: "show", time: "20:00", lat: 33.5912, lng: 130.4073,
          photo: "assets/img/ichiran.jpg",
          desc: "員工著和風華服在本社大樓陽台配原創樂曲演舞（約 15 分，站街上免費觀賞、不需消費）。19:40 前到位視野較好。出發前 1–2 週再向官方確認照常演出。",
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
      color: "#5B6B8C",
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
          type: "airport", time: "08:55", lat: 33.5857, lng: 130.4483,
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
    premise: "20:00 抵 FUK、8/11 11:00 起飛。不趕・大眾運輸・避熱室內為主。",
    musts: ["皿倉山纜車夜景", "太宰府天滿宮", "一蘭總部 20:00 陽台演舞"],
    hotel: "中洲川端（首選：ザ ロイヤルパーク キャンバス 福岡中洲）。四晚不換飯店。",
    designPoints: [
      { label: "日序鎖定", text: "唐戶壽司限六日、皿倉山週六接駁 → 北九州定 8/8；美術館週一休 → 看展排 8/9。" },
      { label: "動線安排", text: "一天一主軸；JR 門司港→八幡直達 30 分，動線零回頭。" },
      { label: "避熱策略", text: "11–16 時躲海響館、九博、teamLab；戶外只排 9 點前、17 點後。" },
      { label: "節奏張弛", text: "8/8 最重、8/9 早歸、8/10 睡到自然醒，張弛交錯不趕路。" },
      { label: "壓軸收尾", text: "8/10 純室內購物日，一蘭演舞＋週一屋台壓軸，順補伴手禮。" }
    ]
  };

  window.TRIP_DATA = { META, MODES, DAYS };
})();
