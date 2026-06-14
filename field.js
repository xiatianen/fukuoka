/* =====================================================================
 *  福岡互動地圖 — 現場工具層 field.js
 *  把「規劃稿」升級成「現場跟著走」：8 大功能
 *  F1 離線 PWA / F2 現在視圖 / F3 定位藍點 / F4 一鍵導航·撥號
 *  F5 現金·¥→NT / F6 末班·日落·公休提醒 / F7 持ち物·已訂清單 / F8 日文地址·日語句
 *  以 stop id 對應外掛資料，幾乎不動 data.js；附掛點由 app.js 提供。
 * ===================================================================== */
(function () {
  "use strict";

  const APP = window.TRIP_APP || {};
  const DATA = window.TRIP_DATA || {};
  const DAYS = DATA.DAYS || [];
  const META = DATA.META || {};

  /* ---------------- 小工具 ---------------- */
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const $ = (s, r) => (r || document).querySelector(s);
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };

  /* ---------------- 設定與外掛資料（id 對應） ---------------- */
  const FX = 0.21;                 // ¥1 ≈ NT$0.21（概估）
  const TRIP_YEAR = 2026;
  const dayDate = (n) => TRIP_YEAR + "-08-" + String(6 + n).padStart(2, "0"); // Day1=8/7 … Day5=8/11

  // 日文店名／地址／電話（給司機·店員看、撥號予約）— 由查證結果外掛
  const JA = {
    "d1-hotel":     { name: "COCO Gofukumachi（ココ呉服町）", addr: "福岡県福岡市博多区上呉服町2-24", tel: "080-7144-7896" },
    "d5-hotel":     { name: "COCO Gofukumachi（ココ呉服町）", addr: "福岡県福岡市博多区上呉服町2-24", tel: "080-7144-7896" },
    "d2-brasileiro":{ name: "カフェ ブラジレイロ", addr: "福岡県福岡市博多区店屋町1-20", tel: "092-271-0021" },
    "d1-ichiran":   { name: "一蘭 本社総本店", addr: "福岡県福岡市博多区中洲5-3-2", tel: "092-262-0433" },
    "d3-ichiran":   { name: "一蘭 本社総本店", addr: "福岡県福岡市博多区中洲5-3-2", tel: "092-262-0433" },
    "d3-yatai":     { name: "中洲屋台街（清流公園）", addr: "福岡県福岡市博多区中洲1丁目8 清流公園" },
    "d2-kokura":    { name: "旦過市場", addr: "福岡県北九州市小倉北区魚町4-2-18" },
    "d2-sarakura":  { name: "皿倉山ケーブルカー 山麓駅", addr: "福岡県北九州市八幡東区大字尾倉1481-1" },
    "d3-tenjin":    { name: "博多らーめん Shin-Shin 天神本店", addr: "福岡県福岡市中央区天神3-2-19 久保田ビル1F", tel: "092-732-4006" },
    "d3-canal":     { name: "キャナルシティ博多", addr: "福岡県福岡市博多区住吉1-2" },
    "d4-sbux":      { name: "スターバックス 太宰府天満宮表参道店", addr: "福岡県太宰府市宰府3-2-43" },
    "d4-dazaifu":   { name: "太宰府天満宮", addr: "福岡県太宰府市宰府4-7-1", tel: "092-922-8225" },
    "d4-kamado":    { name: "宝満宮 竈門神社", addr: "福岡県太宰府市内山883", tel: "092-922-4106" },
    "d4-yanagawa":  { name: "うなぎ 若松屋", addr: "福岡県柳川市沖端町26", tel: "0944-72-3163" },
    "d1-airport":   { name: "福岡空港 国際線ターミナル", addr: "福岡県福岡市博多区大字青木739" },
    "d5-airport":   { name: "福岡空港 国際線ターミナル", addr: "福岡県福岡市博多区大字青木739" }
  };
  const CASH = new Set(["d1-ichiran", "d3-yatai", "d2-kokura", "d2-brasileiro", "d4-yanagawa"]);
  const DEADLINE = { "d2-sarakura": { label: "末班", time: "22:15", note: "上り纜車末班 21:20、八幡駅接駁巴士末班 22:15——看完夜景別逗留太久" } };
  const SUN = { "d2-sarakura": "日落 19:12" };
  const WARN = {
    "d2-brasileiro": "週日・假日休（已排在週六）",
    "d3-tenjin":     "shin shin 週三休（8/9 週日營業）",
    "d4-yanagawa":   "若松屋 週三＆每月第1·3週二休、賣完即止",
    "d3-yatai":      "週日部分屋台店休"
  };

  const PHRASES = [
    { jp: "すみません、一人いくらですか？", romaji: "Sumimasen, hitori ikura desu ka?", zh: "不好意思，一個人多少錢？（屋台問價）" },
    { jp: "おすすめは何ですか？これをください。", romaji: "Osusume wa nan desu ka? Kore o kudasai.", zh: "招牌是什麼？請給我這個。" },
    { jp: "お会計をお願いします。", romaji: "Okaikei o onegai shimasu.", zh: "麻煩結帳。" },
    { jp: "クレジットカードは使えますか？", romaji: "Kurejitto kaado wa tsukaemasu ka?", zh: "可以刷卡嗎？" },
    { jp: "現金のみですか？", romaji: "Genkin nomi desu ka?", zh: "只收現金嗎？" },
    { jp: "予約しています。〇〇です。二名です。", romaji: "Yoyaku shite imasu. Marumaru desu. Nimei desu.", zh: "我有預約，我姓〇〇，兩位。" },
    { jp: "一番近い駅はどこですか？", romaji: "Ichiban chikai eki wa doko desu ka?", zh: "最近的車站在哪裡？" },
    { jp: "トイレはどこですか？", romaji: "Toire wa doko desu ka?", zh: "廁所在哪裡？" },
    { jp: "この住所までお願いします。", romaji: "Kono juusho made onegai shimasu.", zh: "（計程車）請載我到這個地址。" },
    { jp: "予約をお願いしたいのですが。", romaji: "Yoyaku o onegai shitai no desu ga.", zh: "我想預約。（電話予約開頭）" },
    { jp: "アレルギーがあります。卵は入っていますか？", romaji: "Arerugii ga arimasu. Tamago wa haitte imasu ka?", zh: "我有過敏，有放蛋嗎？" },
    { jp: "パクチー抜きでお願いします。", romaji: "Pakuchii nuki de onegai shimasu.", zh: "請不要加香菜。" },
    { jp: "チェックアウトをお願いします。荷物を預かってもらえますか？", romaji: "Chekku auto o onegai shimasu. Nimotsu o azukatte moraemasu ka?", zh: "我要退房。可以幫我寄放行李嗎？" },
    { jp: "助けてください。道に迷いました。", romaji: "Tasukete kudasai. Michi ni mayoimashita.", zh: "請幫幫我，我迷路了。" }
  ];

  const PACKING = ["護照 + 入境資料", "機票 / eSIM·網卡", "現金（屋台·市場收現金）", "信用卡 / IC 卡（Suica 等）",
    "雨具 / 陽傘（8 月午後雷陣雨）", "行動電源 + 充電器", "常備藥 / 防曬", "折疊購物袋（伴手禮）"];
  const BOOKINGS = [
    "一蘭演舞：出發前 1–2 週向官方確認當週演出",
    "新幹線 smartEX 預約（博多⇄小倉）",
    "太宰府・柳川観光きっぷ",
    "若松屋 鰻魚（平日可先洽詢、賣完即止）",
    "叙々苑 天神 線上/電話予約",
    "柳川川下り 予約",
    "COCO Gofukumachi 訂房（四晚）"
  ];
  const EMERGENCY = {
    hotel: { name: "COCO Gofukumachi", addr: "福岡県福岡市博多区上呉服町2-24", tel: "080-7144-7896" },
    lines: [["警察", "110"], ["救護車 / 火災", "119"], ["台北駐福岡辦事處", "092-734-2810"], ["辦事處 急難救助", "090-1922-9740"]]
  };

  /* ---------------- 時間 / 今天 ---------------- */
  function nowDate() {
    const q = new URLSearchParams(location.search).get("now");
    const d = q ? new Date(q) : new Date();
    return isNaN(d.getTime()) ? new Date() : d;
  }
  function todayDayN() {
    const d = nowDate();
    const ymd = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    for (let n = 1; n <= 5; n++) if (dayDate(n) === ymd) return n;
    return 0;
  }
  const stopMin = (t) => { const m = /(\d{1,2}):(\d{2})/.exec(t || ""); return m ? +m[1] * 60 + +m[2] : null; };
  const nowMin = () => { const d = nowDate(); return d.getHours() * 60 + d.getMinutes(); };
  const fmtMin = (m) => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");

  /* ---------------- 導航 / 撥號 URL ---------------- */
  function navMode(stop) {
    return ({ walk: "walking", taxi: "driving", bus: "transit", rail: "transit", ferry: "transit", cable: "transit" })[stop.arrive && stop.arrive.mode] || "transit";
  }
  function navUrl(stop) {
    const m = navMode(stop);
    const q = encodeURIComponent((JA[stop.id] && JA[stop.id].name) || stop.name);
    return "https://www.google.com/maps/dir/?api=1&destination=" + stop.lat + "," + stop.lng +
      "&destination_place_id=&travelmode=" + m + "&dir_action=navigate&q=" + q;
  }
  function navLabel(stop) {
    return ({ walking: "🚶 步行帶路", driving: "🚕 叫車路線", transit: "🚉 乗換·帶路" })[navMode(stop)];
  }

  /* =====================================================================
   *  掛點 1：app.js 在 popup / 時間軸卡呼叫 → 回傳 chips / actions 字串
   * ===================================================================== */
  window.FIELD = {};

  FIELD.chips = function (stop) {
    const c = [];
    if (CASH.has(stop.id)) c.push('<span class="fchip f-cash">💵 現金</span>');
    if (DEADLINE[stop.id]) c.push('<span class="fchip f-dl">⏰ 末班 ' + esc(DEADLINE[stop.id].time) + "</span>");
    if (SUN[stop.id]) c.push('<span class="fchip f-sun">🌇 ' + esc(SUN[stop.id]) + "</span>");
    if (WARN[stop.id]) c.push('<span class="fchip f-warn">⚠️ ' + esc(WARN[stop.id]) + "</span>");
    return c.length ? '<div class="fchips">' + c.join("") + "</div>" : "";
  };

  FIELD.actions = function (stop) {
    if (!stop) return "";
    const j = JA[stop.id];
    let h = '<div class="facts">';
    h += '<a class="fbtn fb-nav" href="' + esc(navUrl(stop)) + '" target="_blank" rel="noopener noreferrer">' + navLabel(stop) + "</a>";
    if (j && j.tel) h += '<a class="fbtn fb-call" href="tel:' + esc(j.tel.replace(/[^0-9+]/g, "")) + '">📞 撥號</a>';
    if (j) h += '<button type="button" class="fbtn fb-copy" data-name="' + esc(j.name) + '" data-addr="' + esc(j.addr) + '">📋 日文地址</button>';
    h += "</div>";
    return h;
  };

  /* =====================================================================
   *  掛點 2：app.js 每次 render 後呼叫 → 注入「現在/接下來」卡 + 高亮
   * ===================================================================== */
  const state = { focusStop: null, userPos: null, geoOn: false };

  FIELD.onRender = function (dayN) {
    const old = document.getElementById("nowBar");
    if (old) old.remove();
    const body = document.getElementById("dayBody");
    if (!body || !dayN || dayN < 1) { state.focusStop = null; return; }
    const day = DAYS[dayN - 1];
    if (!day || !day.stops || !day.stops.length) return;

    const isToday = dayN === todayDayN();
    let focus, kicker;
    if (isToday) {
      const nm = nowMin();
      focus = day.stops.find((s) => (stopMin(s.time) == null ? 1e9 : stopMin(s.time)) >= nm) || day.stops[day.stops.length - 1];
      const fm = stopMin(focus.time);
      kicker = (fm != null && fm <= nm + 1) ? "🔴 現在" : "⏭ 接下來";
    } else {
      focus = day.stops[0];
      kicker = "▶ 這天從這裡開始";
    }
    state.focusStop = focus;

    const dl = DEADLINE[focus.id];
    const bar = el("div", "now-bar");
    bar.style.setProperty("--c", day.color);
    bar.innerHTML =
      '<div class="nb-top"><span class="nb-kick">' + kicker + "</span>" +
        '<span class="nb-time">' + esc(focus.time) + "</span></div>" +
      '<div class="nb-name">' + esc(focus.name) + "</div>" +
      '<div class="nb-trans">' + esc((focus.arrive && focus.arrive.text) || "") + "</div>" +
      (dl ? '<div class="nb-dl">⏰ ' + esc(dl.label) + " " + esc(dl.time) + "　" + esc(dl.note) + "</div>" : "") +
      '<div class="nb-geo" id="nbGeo"></div>' +
      FIELD.actions(focus);
    body.insertBefore(bar, body.firstChild);

    body.querySelectorAll(".tl-stop").forEach((n) => n.classList.toggle("now", n.dataset.id === focus.id));
    updateGeoLine();
  };

  /* =====================================================================
   *  F3 定位藍點 + 距離
   * ===================================================================== */
  let geoMarker = null, geoCircle = null, geoWatch = null;
  function haversine(a, b) {
    const R = 6371000, toR = Math.PI / 180;
    const dLat = (b[0] - a[0]) * toR, dLng = (b[1] - a[1]) * toR;
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * toR) * Math.cos(b[0] * toR) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
  }
  function updateGeoLine() {
    const g = document.getElementById("nbGeo");
    if (!g) return;
    if (!state.userPos || !state.focusStop) { g.textContent = ""; return; }
    const d = haversine([state.userPos.lat, state.userPos.lng], [state.focusStop.lat, state.focusStop.lng]);
    const mins = Math.max(1, Math.round(d / 80));
    g.innerHTML = "📍 距「" + esc(state.focusStop.name) + "」約 " +
      (d >= 1000 ? (d / 1000).toFixed(1) + " km" : Math.round(d) + " m") +
      "（步行約 " + mins + " 分）";
  }
  function toggleGeo() {
    const map = APP.getMap && APP.getMap();
    if (!map) return toast("地圖尚未就緒");
    if (!("geolocation" in navigator)) return toast("此裝置不支援定位");
    if (state.geoOn) {
      if (geoWatch != null) navigator.geolocation.clearWatch(geoWatch);
      geoWatch = null; state.geoOn = false;
      if (geoMarker) { map.removeLayer(geoMarker); geoMarker = null; }
      if (geoCircle) { map.removeLayer(geoCircle); geoCircle = null; }
      state.userPos = null; updateGeoLine(); setToolActive("geo", false);
      return toast("已關閉定位");
    }
    toast("定位中…請允許位置權限");
    geoWatch = navigator.geolocation.watchPosition((pos) => {
      const ll = [pos.coords.latitude, pos.coords.longitude];
      state.userPos = { lat: ll[0], lng: ll[1] };
      state.geoOn = true; setToolActive("geo", true);
      const acc = pos.coords.accuracy || 30;
      if (!geoMarker) {
        geoMarker = L.marker(ll, { icon: L.divIcon({ className: "me-marker", html: '<div class="me-dot"></div>', iconSize: [22, 22], iconAnchor: [11, 11] }), zIndexOffset: 2000, keyboard: false }).addTo(map);
        geoCircle = L.circle(ll, { radius: acc, color: "#2E7DF6", weight: 1, fillColor: "#2E7DF6", fillOpacity: 0.12 }).addTo(map);
        map.setView(ll, Math.max(map.getZoom(), 15));
      } else { geoMarker.setLatLng(ll); geoCircle.setLatLng(ll).setRadius(acc); }
      updateGeoLine();
    }, (err) => {
      state.geoOn = false; setToolActive("geo", false);
      toast(err.code === 1 ? "已拒絕定位權限" : "無法取得定位");
    }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 });
  }

  /* =====================================================================
   *  小元件：toast / 一般 modal / 工具面板
   * ===================================================================== */
  let toastTimer = null;
  function toast(msg) {
    let t = document.getElementById("fToast");
    if (!t) { t = el("div", "f-toast"); t.id = "fToast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }
  function openModal(title, html) {
    let m = document.getElementById("fModal");
    if (!m) {
      m = el("div", "modal-mask hidden"); m.id = "fModal";
      m.innerHTML = '<div class="modal" role="dialog" aria-modal="true"><div class="m-head">' +
        '<button type="button" class="m-close" id="fModalClose" aria-label="關閉">×</button>' +
        '<h2 id="fModalT"></h2></div><div class="m-body" id="fModalB"></div></div>';
      document.body.appendChild(m);
      m.addEventListener("click", (e) => { if (e.target === m) closeModal(); });
      $("#fModalClose", m).addEventListener("click", closeModal);
    }
    $("#fModalT", m).textContent = title;
    $("#fModalB", m).innerHTML = html;
    m.classList.remove("hidden");
  }
  function closeModal() { const m = document.getElementById("fModal"); if (m) m.classList.add("hidden"); }

  function setToolActive(key, on) {
    const b = document.querySelector('.tool-item[data-tool="' + key + '"]');
    if (b) b.classList.toggle("on", !!on);
  }

  /* =====================================================================
   *  F5 ¥→NT 換算
   * ===================================================================== */
  function openConverter() {
    openModal("💱 ¥ → NT$ 快速換算", '<div class="fx-wrap"><div class="fx-row">' +
      '<span class="fx-pre">¥</span><input id="fxIn" type="number" inputmode="numeric" placeholder="輸入日圓" />' +
      '</div><div class="fx-eq" id="fxOut">≈ NT$ 0</div>' +
      '<div class="fx-grid" id="fxGrid"></div>' +
      '<div class="fx-note">概估匯率 ¥1 ≈ NT$' + FX + "（會浮動，僅供現場心算；刷卡另有手續費）</div></div>");
    const inp = $("#fxIn"), out = $("#fxOut");
    const calc = () => { const v = parseFloat(inp.value) || 0; out.textContent = "≈ NT$ " + Math.round(v * FX).toLocaleString(); };
    inp.addEventListener("input", calc);
    const grid = $("#fxGrid");
    grid.innerHTML = [100, 500, 1000, 3000, 5000, 10000].map((v) =>
      '<div class="fx-cell"><b>¥' + v.toLocaleString() + "</b><span>≈ NT$" + Math.round(v * FX).toLocaleString() + "</span></div>").join("");
    setTimeout(() => inp.focus(), 60);
  }

  /* =====================================================================
   *  F7 持ち物 + 已訂清單（localStorage）
   * ===================================================================== */
  const CK_KEY = "fukuoka_checklist_v1";
  function ckState() { try { return JSON.parse(localStorage.getItem(CK_KEY) || "{}"); } catch (e) { return {}; } }
  function ckSave(s) { try { localStorage.setItem(CK_KEY, JSON.stringify(s)); } catch (e) {} }
  function openChecklist() {
    const s = ckState();
    const row = (txt, id) => '<label class="ck-row"><input type="checkbox" data-ck="' + esc(id) + '"' + (s[id] ? " checked" : "") + '/><span>' + esc(txt) + "</span></label>";
    const html =
      '<div class="ck-sec"><div class="ck-h">🎒 持ち物</div>' + PACKING.map((t, i) => row(t, "p" + i)).join("") + "</div>" +
      '<div class="ck-sec"><div class="ck-h">🎫 出發前要訂 / 要確認</div>' + BOOKINGS.map((t, i) => row(t, "b" + i)).join("") + "</div>" +
      '<div class="ck-foot"><button type="button" class="fbtn" id="ckReset">清空勾選</button><span id="ckCount"></span></div>';
    openModal("✓ 持ち物・已訂清單", html);
    const upd = () => { const st = ckState(); const all = PACKING.length + BOOKINGS.length; const done = Object.values(st).filter(Boolean).length; const c = $("#ckCount"); if (c) c.textContent = done + " / " + all + " 完成"; };
    upd();
    $("#fModalB").querySelectorAll("input[data-ck]").forEach((cb) =>
      cb.addEventListener("change", () => { const st = ckState(); st[cb.dataset.ck] = cb.checked; ckSave(st); upd(); }));
    $("#ckReset").addEventListener("click", () => { ckSave({}); openChecklist(); });
  }

  /* =====================================================================
   *  F8 日語句 phrasebook
   * ===================================================================== */
  function openPhrases() {
    const items = PHRASES.map((p) =>
      '<div class="ph-item">' +
        '<div class="ph-jp">' + esc(p.jp) + '</div>' +
        '<div class="ph-ro">' + esc(p.romaji) + '</div>' +
        '<div class="ph-zh">' + esc(p.zh) + '</div>' +
        '<button type="button" class="fbtn fb-copy ph-copy" data-addr="' + esc(p.jp) + '">📋 複製日文</button>' +
      '</div>'
    ).join("");
    openModal("💬 日語應急句", '<div class="ph-list">' + items + '</div>');
  }

  /* =====================================================================
   *  SOS 基本資訊
   * ===================================================================== */
  function openSOS() {
    const e = EMERGENCY;
    const html =
      '<div class="sos-card"><div class="sos-h">🏨 飯店（給司機看 / 走失集合點）</div>' +
      '<div class="sos-jp">' + esc(e.hotel.name) + "<br>" + esc(e.hotel.addr) + "</div>" +
      '<div class="facts"><a class="fbtn fb-call" href="tel:' + esc(e.hotel.tel.replace(/[^0-9+]/g, "")) + '">📞 撥飯店</a>' +
      '<button type="button" class="fbtn fb-copy" data-name="' + esc(e.hotel.name) + '" data-addr="' + esc(e.hotel.addr) + '">📋 複製地址</button></div></div>' +
      '<div class="sos-lines">' + e.lines.map((l) =>
        '<a class="sos-line" href="tel:' + esc(l[1].replace(/[^0-9+]/g, "")) + '"><span>' + esc(l[0]) + "</span><b>" + esc(l[1]) + "</b></a>").join("") +
      '</div><div class="m-foot">日本報警 110、救護/火災 119。電話免漫遊也可撥打緊急號碼。</div>';
    openModal("🆘 基本・急難資訊", html);
  }

  /* =====================================================================
   *  F1 PWA：安裝 + 離線地圖預存
   * ===================================================================== */
  let deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferredPrompt = e; setToolActive("install", true); });
  function isStandalone() { return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true; }
  async function doInstall() {
    if (isStandalone()) return toast("已是 App 模式");
    if (deferredPrompt) { deferredPrompt.prompt(); const r = await deferredPrompt.userChoice; deferredPrompt = null; toast(r.outcome === "accepted" ? "已加入主畫面 🎉" : "已取消"); return; }
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    openModal("⬇️ 加到主畫面（離線可用）", '<div class="m-foot" style="text-align:left;font-size:13px;line-height:1.9">' +
      (ios ? "iPhone / iPad（Safari）：<br>1. 點下方<b>「分享」</b>圖示 <span style=\"font-size:16px\">􀈂</span><br>2. 選<b>「加入主畫面」</b><br>3. 完成後從主畫面開啟，就像 App、可離線看。"
           : "桌機/Android Chrome：點網址列的<b>「安裝」</b>圖示，或瀏覽器選單→<b>「安裝應用程式 / 加到主畫面」</b>。") +
      "<br><br>裝好後即使沒網路、地下鐵收訊差，行程與看過的地圖也照樣打得開。</div>");
  }

  // 預存本趟範圍地圖磚（讓離線也有底圖）
  function lon2x(lon, z) { return Math.floor((lon + 180) / 360 * (1 << z)); }
  function lat2y(lat, z) { const r = lat * Math.PI / 180; return Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * (1 << z)); }
  async function cacheTiles() {
    if (!("serviceWorker" in navigator) || !navigator.serviceWorker.controller) return toast("離線功能尚未就緒，請稍候再試");
    // 涵蓋 福岡→北九州→太宰府→柳川
    const BB = { s: 33.10, w: 130.36, n: 33.92, e: 130.90 };
    const urls = [];
    for (let z = 10; z <= 15; z++) {
      const x0 = lon2x(BB.w, z), x1 = lon2x(BB.e, z), y0 = lat2y(BB.n, z), y1 = lat2y(BB.s, z);
      for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) {
        urls.push("https://a.basemaps.cartocdn.com/rastertiles/voyager/" + z + "/" + x + "/" + y + ".png");
        if (urls.length > 2600) break;
      }
    }
    toast("開始預存離線地圖（約 " + urls.length + " 磚）…");
    navigator.serviceWorker.controller.postMessage({ type: "CACHE_TILES", urls });
  }
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", (e) => {
      const d = e.data || {};
      if (d.type === "TILES_DONE") toast("離線地圖已存好 ✅（" + d.ok + " 磚）");
      else if (d.type === "TILES_PROGRESS" && d.pct % 25 === 0) toast("離線地圖 " + d.pct + "%…");
    });
  }

  /* =====================================================================
   *  工具列（FAB）
   * ===================================================================== */
  const TOOLS = [
    { k: "geo", ic: "📍", label: "我的位置", fn: toggleGeo },
    { k: "list", ic: "✓", label: "持ち物清單", fn: openChecklist },
    { k: "phrase", ic: "💬", label: "日語句", fn: openPhrases },
    { k: "fx", ic: "💱", label: "¥→NT 換算", fn: openConverter },
    { k: "sos", ic: "🆘", label: "急難資訊", fn: openSOS },
    { k: "offline", ic: "📥", label: "存離線地圖", fn: cacheTiles },
    { k: "install", ic: "⬇️", label: "加到主畫面", fn: doInstall }
  ];
  function buildToolbar() {
    const btn = el("button", "tool-toggle", "🧰 工具");
    btn.id = "toolToggle"; btn.type = "button"; btn.setAttribute("aria-label", "現場工具");
    const panel = el("div", "tool-panel hidden");
    panel.id = "toolPanel";
    panel.innerHTML = TOOLS.map((t) =>
      '<button type="button" class="tool-item" data-tool="' + t.k + '"><span class="ti-ic">' + t.ic + "</span><span>" + esc(t.label) + "</span></button>").join("");
    document.body.appendChild(btn); document.body.appendChild(panel);
    btn.addEventListener("click", (e) => { e.stopPropagation(); panel.classList.toggle("hidden"); });
    panel.addEventListener("click", (e) => {
      const it = e.target.closest(".tool-item"); if (!it) return;
      const t = TOOLS.find((x) => x.k === it.dataset.tool); if (t) t.fn();
      if (it.dataset.tool !== "geo") panel.classList.add("hidden");
    });
    document.addEventListener("click", (e) => {
      if (!panel.classList.contains("hidden") && !panel.contains(e.target) && e.target !== btn) panel.classList.add("hidden");
    });
    if (isStandalone()) { const ib = panel.querySelector('[data-tool="install"]'); if (ib) ib.style.display = "none"; }
  }

  /* ---------------- 複製按鈕（事件委派） ---------------- */
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".fb-copy"); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const txt = [b.dataset.name, b.dataset.addr].filter(Boolean).join("\n");
    const done = () => toast("已複製：" + (b.dataset.name || b.dataset.addr || ""));
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done).catch(() => fallbackCopy(txt, done));
    else fallbackCopy(txt, done);
  });
  function fallbackCopy(txt, cb) {
    const ta = el("textarea"); ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); cb(); } catch (e) { toast("無法複製"); }
    document.body.removeChild(ta);
  }

  /* ---------------- 啟動 ---------------- */
  function boot() {
    buildToolbar();
    // 自動跳到「今天」（行程期間內、且沒有指定 hash）
    const forced = new URLSearchParams(location.search).get("day");
    const tN = todayDayN();
    if (forced && APP.selectDay) APP.selectDay(parseInt(forced, 10));
    else if (tN && !location.hash && APP.selectDay) APP.selectDay(tN);
    else if (APP.getCurrentDay) FIELD.onRender(APP.getCurrentDay());
    // 註冊 Service Worker（離線）
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
