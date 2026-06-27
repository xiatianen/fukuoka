/* =====================================================================
 *  福岡互動地圖 — 主程式
 * ===================================================================== */
(function () {
  "use strict";

  const { META, MODES, DAYS } = window.TRIP_DATA;

  /* 停點類型 → 圖示 */
  const TYPE_ICON = {
    airport: "✈️", hotel: "🏨", food: "🍜", station: "🚉", sight: "⛩️",
    aquarium: "🐟", night: "🌃", cafe: "☕", museum: "🖼️", nature: "🌳",
    shop: "🛍️", show: "🎏", salon: "✂️", yakiniku: "🍖"
  };

  const isMobile = () => window.matchMedia("(max-width: 880px)").matches;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const cssEsc = (s) =>
    (window.CSS && CSS.escape) ? CSS.escape(s) : String(s).replace(/["\\]/g, "\\$&");

  /* 讓任意元素可點擊 + 鍵盤可操作（Enter/Space） */
  function clickable(node, handler, aria) {
    node.tabIndex = 0;
    node.setAttribute("role", "button");
    if (aria) node.setAttribute("aria-label", aria);
    node.addEventListener("click", handler);
    node.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        handler(e);
      }
    });
  }

  /* 真實路徑幾何（routes.js）：以「到站」stopId 取用，無則退回兩點直線 */
  const ROUTES = window.TRIP_ROUTES || {};
  function segLatLngs(a, b) {
    const r = ROUTES[b.id];
    return (r && r.length >= 2) ? r : [[a.lat, a.lng], [b.lat, b.lng]];
  }

  const yen = (n) => "¥" + Number(n).toLocaleString("ja-JP");

  /* 訂票/預約連結 */
  function bookLink(book) {
    if (!book || !book.url) return "";
    return '<a class="book-link" href="' + esc(book.url) +
      '" target="_blank" rel="noopener noreferrer">🎫 ' +
      esc(book.label || "官方訂票 / 預約") + " ↗</a>";
  }

  /* 交通明細：每段車（line/車種/時間/車資）＋總車資＋班距＋替代＋訂票 */
  function transHtml(arrive) {
    if (!arrive) return "";
    let h = "";
    if (arrive.legs && arrive.legs.length) {
      h += '<div class="legs">';
      arrive.legs.forEach((l) => {
        const right = [];
        if (l.min != null) right.push(l.min + "分");
        if (l.fare != null && l.fare !== "")
          right.push(typeof l.fare === "number" ? yen(l.fare) : esc(l.fare));
        h += '<div class="lg-row">' +
               '<span class="lg-seg">' + esc(l.seg) + "</span>" +
               '<span class="lg-line">' + esc(l.line) +
                 (l.type ? " · " + esc(l.type) : "") + "</span>" +
               '<span class="lg-rt">' + esc(right.join(" / ")) + "</span>" +
             "</div>";
      });
      h += "</div>";
    }
    const meta = [];
    if (arrive.fare) meta.push("💴 " + esc(arrive.fare));
    if (arrive.freq) meta.push("🕒 " + esc(arrive.freq));
    if (meta.length) h += '<div class="fare-line">' + meta.join("　") + "</div>";
    if (arrive.alt) h += '<div class="alt-line">↺ ' + esc(arrive.alt) + "</div>";
    if (arrive.book) h += bookLink(arrive.book);
    return h;
  }

  /* 停點估價 */
  function costHtml(stop) {
    if (!stop.cost) return "";
    const c = stop.cost;
    return '<div class="cost-box">' +
             '<span class="cost-jpy">💰 ' + esc(c.jpy) + "</span>" +
             (c.note ? '<span class="cost-note">' + esc(c.note) + "</span>" : "") +
             (c.book ? bookLink(c.book) : "") +
           "</div>";
  }

  /* 預算概估（資訊 Modal 用） */
  function budgetHtml(b) {
    if (!b) return "";
    return '<div class="m-section"><div class="ms-label">💰 預算概估</div>' +
      '<div class="bud-note">' + esc(b.note) + "</div>" +
      '<div class="bud-list">' +
        b.rows.map((r) =>
          '<div class="bud-row"><span>' + esc(r.label) + "</span><b>" + esc(r.val) + "</b></div>"
        ).join("") +
      "</div>" +
      '<div class="bud-total">' + esc(b.total) + "</div></div>";
  }

  /* ---------------- 狀態 ---------------- */
  let map;
  let currentDay = 1;                 // 0 = 總覽；1..5 = 各日
  let viewLayer = null;               // 當前圖層（markers + routes）
  const markerIndex = {};             // stopId -> L.marker
  let activeStopId = null;
  let lastFitPoints = null;           // resize 時重算視野用
  let popupTimer = null;              // 由列表觸發飛行後開 popup 的計時器

  /* ---------------- 地圖初始化 ---------------- */
  function initMap() {
    map = L.map("map", {
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: true,
      tap: true,
      minZoom: 8,
      maxZoom: 18,
      zoomSnap: 0.25
    });
    L.control.zoom({ position: "topleft" }).addTo(map);

    const tiles = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        subdomains: "abcd",
        maxZoom: 19,
        detectRetina: false,
        crossOrigin: true,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
      }
    ).addTo(map);

    // 底圖出現即收掉載入畫面（含後備計時，避免某些情況不觸發）
    let loaderHidden = false;
    const hideLoader = () => {
      if (loaderHidden) return;
      loaderHidden = true;
      $("#loader").classList.add("hidden");
    };
    tiles.on("load", hideLoader);
    map.whenReady(() => setTimeout(hideLoader, 400));
    setTimeout(hideLoader, 2200);

    map.setView([33.62, 130.5], 9);
  }

  /* ---------------- 繪製：marker 與路線 ---------------- */
  function makeMarker(stop, day, num) {
    const html =
      '<div class="dm-pin" style="background:' + day.color + '">' +
      '<span class="dm-num">' + num + "</span></div>";
    const icon = L.divIcon({
      className: "day-marker",
      html: html,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -17]
    });
    const m = L.marker([stop.lat, stop.lng], { icon: icon, riseOnHover: true, keyboard: false });
    m.bindPopup(popupHtml(stop, day, num), {
      maxWidth: 300, minWidth: 252, maxHeight: 360, closeButton: true, autoPanPadding: [28, 28]
    });
    m.on("click", () => setActiveStop(stop.id, { source: "map" }));
    return m;
  }

  function popupHtml(stop, day, num) {
    const ti = TYPE_ICON[stop.type] || "📍";
    const mode = MODES[stop.arrive.mode] || MODES.start;
    const photo = stop.photo
      ? '<div class="pp-photo"><img src="' + stop.photo + '" alt="' + esc(stop.name) +
        ' 照片" loading="lazy" onerror="this.parentNode.style.display=\'none\'"></div>'
      : "";
    return (
      '<div class="pp" style="--c:' + day.color + ';--ct:' + (day.colorText || day.color) + '">' +
      photo +
      '<div class="pp-body">' +
        '<div class="pp-meta">' +
          '<span class="pp-time">' + esc(stop.time) + "</span>" +
          '<span class="pp-day" style="color:' + (day.colorText || day.color) +
            '">● Day ' + day.n + " · " + esc(day.date) + "</span>" +
        "</div>" +
        '<div class="pp-name">' + ti + " " + esc(stop.name) + "</div>" +
        (window.FIELD ? FIELD.chips(stop) : "") +
        '<div class="pp-desc">' + esc(stop.desc) + "</div>" +
        '<div class="pp-trans"><span class="t-ic">' + mode.icon + "</span>" +
          "<span>" + esc(stop.arrive.text) + "</span></div>" +
        transHtml(stop.arrive) +
        costHtml(stop) +
        (window.FIELD ? FIELD.actions(stop) : "") +
      "</div></div>"
    );
  }

  /* 住宿基地（四晚同一飯店）作為每天出發/回程的錨點 */
  function homeNode() {
    const h = META.home;
    return h ? { id: "home", name: h.name, lat: h.lat, lng: h.lng, type: "hotel" } : null;
  }
  function isHomeStop(day, home) {
    return day.stops.some((s) => Math.abs(s.lat - home.lat) < 1e-4 && Math.abs(s.lng - home.lng) < 1e-4);
  }

  /* 畫一段路線（白底襯線＋彩色線＋popup＋tooltip＋hover）*/
  function addRouteSeg(group, day, latlngs, mode, popup, tooltip, weight) {
    const w = weight || 4.5;
    L.polyline(latlngs, { color: "#ffffff", weight: w + 2.5, opacity: 0.6, lineCap: "round", lineJoin: "round" }).addTo(group);
    const line = L.polyline(latlngs, {
      color: day.color, weight: w, opacity: 0.9,
      dashArray: mode.dash || null, lineCap: "round", lineJoin: "round"
    }).addTo(group);
    if (popup) line.bindPopup(popup, { maxWidth: 290, maxHeight: 340 });
    if (tooltip) line.bindTooltip(tooltip, { sticky: true, direction: "top", opacity: 0.95 });
    line.on("mouseover", () => line.setStyle({ weight: w + 2 }));
    line.on("mouseout", () => line.setStyle({ weight: w }));
    return line;
  }

  function backPopupHtml(day, a, home) {
    return (
      '<div class="route-pp">' +
        '<div class="rp-head"><span class="rp-ic">↩</span>' +
          esc(a.name) + " → " + esc(home.name) + "（回飯店）</div>" +
        '<div class="rp-text">' + esc(day.returnNote || "回飯店休息。") + "</div>" +
        '<div class="rp-day" style="color:' + (day.colorText || day.color) +
          '">● Day ' + day.n + " · 回程</div>" +
      "</div>"
    );
  }

  function addHomeMarker(group, home) {
    const m = L.marker([home.lat, home.lng], {
      icon: L.divIcon({ className: "home-marker", html: '<div class="hm-pin">🏨</div>',
        iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -15] }),
      riseOnHover: true, keyboard: false
    });
    m.bindPopup(
      '<div class="route-pp"><div class="rp-head"><span class="rp-ic">🏨</span>' +
        esc(home.name) + "（住宿·四晚）</div>" +
        '<div class="rp-text">博多区上呉服町·呉服町站旁（地下鐵箱崎線，步行 3 分）。步行到 Canal City 約 11 分、中洲／一蘭約 12 分；博多·天神搭地鐵 2 站。公寓式、四晚不換房。</div></div>',
      { maxWidth: 262 });
    m.addTo(group);
    return m;
  }

  function drawDay(day) {
    const group = L.layerGroup();
    const home = homeNode();
    const pts = day.stops.map((s) => [s.lat, s.lng]);

    // 出發：飯店 → 第一站（用第一站的 arrive 資訊）
    if (home && day.fromHome) {
      const b = day.stops[0];
      const mode = MODES[b.arrive.mode] || MODES.rail;
      const ll = ROUTES["d" + day.n + "-out"] || [[home.lat, home.lng], [b.lat, b.lng]];
      addRouteSeg(group, day, ll, mode, routePopupHtml(day, home, b, mode), mode.icon + " 出發 · " + mode.label);
      pts.push([home.lat, home.lng]);
    }

    // 景點之間
    for (let i = 1; i < day.stops.length; i++) {
      const a = day.stops[i - 1], b = day.stops[i];
      const mode = MODES[b.arrive.mode] || MODES.rail;
      addRouteSeg(group, day, segLatLngs(a, b), mode, routePopupHtml(day, a, b, mode), mode.icon + " " + mode.label);
    }

    // 回程：最後一站 → 飯店
    if (home && day.toHome) {
      const a = day.stops[day.stops.length - 1];
      const ll = ROUTES["d" + day.n + "-back"] || [[a.lat, a.lng], [home.lat, home.lng]];
      addRouteSeg(group, day, ll, MODES.rail, backPopupHtml(day, a, home), "↩ 回飯店 · " + home.name);
      pts.push([home.lat, home.lng]);
    }

    // 停點 marker
    day.stops.forEach((s, i) => {
      const m = makeMarker(s, day, i + 1);
      m.addTo(group);
      markerIndex[s.id] = m;
    });
    // 飯店 marker（當天若飯店不是編號停點才加，例如 Day2–4）
    if (home && (day.fromHome || day.toHome) && !isHomeStop(day, home)) {
      addHomeMarker(group, home);
    }

    group.addTo(map);
    viewLayer = group;
    fitTo(pts);
  }

  function clusterIcon(cluster) {
    const n = cluster.getChildCount();
    const size = n < 5 ? 34 : (n < 10 ? 40 : 46);
    return L.divIcon({
      html: '<div class="ci" style="width:' + size + "px;height:" + size + 'px">' + n + "</div>",
      className: "cluster-icon",
      iconSize: [size, size]
    });
  }

  function drawOverview() {
    const group = L.layerGroup();
    const cluster = L.markerClusterGroup
      ? L.markerClusterGroup({
          maxClusterRadius: 46,
          showCoverageOnHover: false,
          spiderfyOnMaxZoom: true,
          disableClusteringAtZoom: 14,
          iconCreateFunction: clusterIcon
        })
      : L.layerGroup();
    const all = [];
    const home = homeNode();
    DAYS.forEach((day) => {
      // 出發：飯店 → 第一站
      if (home && day.fromHome) {
        const b = day.stops[0];
        const mode = MODES[b.arrive.mode] || MODES.rail;
        const ll = ROUTES["d" + day.n + "-out"] || [[home.lat, home.lng], [b.lat, b.lng]];
        L.polyline(ll, { color: day.color, weight: 3, opacity: 0.6, dashArray: mode.dash || null, lineCap: "round", lineJoin: "round" }).addTo(group);
      }
      for (let i = 1; i < day.stops.length; i++) {
        const a = day.stops[i - 1], b = day.stops[i];
        const mode = MODES[b.arrive.mode] || MODES.rail;
        L.polyline(segLatLngs(a, b), {
          color: day.color, weight: 3, opacity: 0.65, dashArray: mode.dash || null, lineCap: "round", lineJoin: "round"
        }).addTo(group);
      }
      // 回程：最後一站 → 飯店
      if (home && day.toHome) {
        const a = day.stops[day.stops.length - 1];
        const ll = ROUTES["d" + day.n + "-back"] || [[a.lat, a.lng], [home.lat, home.lng]];
        L.polyline(ll, { color: day.color, weight: 3, opacity: 0.45, dashArray: "3,8", lineCap: "round", lineJoin: "round" }).addTo(group);
      }
      day.stops.forEach((s, i) => {
        const m = L.marker([s.lat, s.lng], {
          icon: L.divIcon({
            className: "day-marker",
            html: '<div class="dm-pin" style="background:' + day.color + '"><span class="dm-num">' +
              (i + 1) + "</span></div>",
            iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -17]
          }),
          riseOnHover: true, keyboard: false
        });
        m.bindPopup(popupHtml(s, day, i + 1), { maxWidth: 300, minWidth: 252, maxHeight: 360, autoPanPadding: [28, 28] });
        m.on("click", () => setActiveStop(s.id, { source: "map" }));
        cluster.addLayer(m);
        markerIndex[s.id] = m;
        all.push([s.lat, s.lng]);
      });
    });
    group.addLayer(cluster);
    if (home) { addHomeMarker(group, home); all.push([home.lat, home.lng]); }
    group.addTo(map);
    viewLayer = group;
    fitTo(all);
  }

  function routePopupHtml(day, a, b, mode) {
    return (
      '<div class="route-pp">' +
        '<div class="rp-head"><span class="rp-ic">' + mode.icon + "</span>" +
          esc(a.name) + " → " + esc(b.name) + "</div>" +
        '<div class="rp-text">' + esc(b.arrive.text) + "</div>" +
        transHtml(b.arrive) +
        (window.FIELD ? FIELD.actions(b) : "") +
        '<div class="rp-day" style="color:' + (day.colorText || day.color) +
          '">● Day ' + day.n + " · " + esc(day.theme) + "</div>" +
      "</div>"
    );
  }

  function fitTo(points) {
    if (!points || !points.length) return;
    lastFitPoints = points;
    const mob = isMobile();
    if (points.length === 1) {
      map.setView(points[0], 14, { animate: true });
      if (mob) map.panBy([0, 90], { animate: false }); // 把目標上移，避開底部抽屜
      return;
    }
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, {
      paddingTopLeft: [mob ? 30 : 60, mob ? 74 : 60],
      paddingBottomRight: [mob ? 30 : 60, mob ? 196 : 60],
      maxZoom: 15,
      animate: true
    });
  }

  function clearView() {
    if (popupTimer) { clearTimeout(popupTimer); popupTimer = null; }
    if (viewLayer) { map.removeLayer(viewLayer); viewLayer = null; }
    for (const k in markerIndex) delete markerIndex[k];
    activeStopId = null;
  }

  /* ---------------- 互動：選定停點 ---------------- */
  function findStop(id) {
    for (const d of DAYS) for (const s of d.stops) if (s.id === id) return s;
    return null;
  }

  function focusStop(stop, m) {
    const targetZoom = Math.max(map.getZoom(), 14);
    map.flyTo([stop.lat, stop.lng], targetZoom, { duration: 0.6 });
    if (popupTimer) clearTimeout(popupTimer);
    popupTimer = m ? setTimeout(() => m.openPopup(), 640) : null; // 不依賴 moveend，必定開啟
  }

  function setActiveStop(stopId, opts) {
    opts = opts || {};
    if (popupTimer) { clearTimeout(popupTimer); popupTimer = null; }  // 取消前一個待開 popup
    const stop = findStop(stopId);
    if (!stop) return;
    const m = markerIndex[stopId];
    const already = activeStopId === stopId;
    activeStopId = stopId;

    // 列表卡片高亮
    document.querySelectorAll(".tl-stop").forEach((n) =>
      n.classList.toggle("active", n.dataset.id === stopId));
    // marker 高亮
    document.querySelectorAll(".day-marker").forEach((n) => n.classList.remove("active"));
    if (m && m._icon) m._icon.classList.add("active");

    if (opts.source === "list") {
      focusStop(stop, m);
      if (isMobile()) collapseSheet();
    } else if (opts.source === "map") {
      // marker 點擊：Leaflet 會自行開 popup，這裡只同步列表
      if (popupTimer) { clearTimeout(popupTimer); popupTimer = null; }
      if (!already && !isMobile()) {
        const card = document.querySelector('.tl-stop[data-id="' + cssEsc(stopId) + '"]');
        if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }

  /* ---------------- 側欄渲染 ---------------- */
  function renderTabs() {
    const tabs = $("#dayTabs");
    tabs.innerHTML = "";

    const all = el("div", "day-tab all" + (currentDay === 0 ? " active" : ""));
    all.style.setProperty("--c", "var(--accent)");
    all.style.setProperty("--ct", "var(--accent-d)");
    all.innerHTML = '<div class="dt-day">全程</div><div class="dt-date">總覽</div><div class="dt-dot"></div>';
    clickable(all, () => selectDay(0), "全程總覽");
    tabs.appendChild(all);

    DAYS.forEach((d) => {
      const t = el("div", "day-tab" + (currentDay === d.n ? " active" : ""));
      t.style.setProperty("--c", d.color);
      t.style.setProperty("--ct", d.colorText || d.color);
      t.innerHTML =
        '<div class="dt-day">Day ' + d.n + "</div>" +
        '<div class="dt-date">' + esc(d.date) + "</div>" +
        '<div class="dt-dot"></div>';
      clickable(t, () => selectDay(d.n), "Day " + d.n + " " + d.date + " " + d.dow);
      tabs.appendChild(t);
    });

    // 讓目前選取的分頁置中（手機橫向捲動提示）
    const active = tabs.querySelector(".day-tab.active");
    if (active && active.scrollIntoView) {
      try { active.scrollIntoView({ inline: "center", block: "nearest" }); } catch (e) {}
    }
  }

  function renderBody() {
    const body = $("#dayBody");
    body.innerHTML = "";

    if (currentDay === 0) { renderOverviewBody(body); return; }

    const day = DAYS[currentDay - 1];
    body.style.setProperty("--c", day.color);
    body.style.setProperty("--ct", day.colorText || day.color);

    const head = el("div", "day-head");
    head.style.setProperty("--c", day.color);
    head.innerHTML =
      '<div class="dh-theme">' + esc(day.theme) + "</div>" +
      '<div class="dh-sum">' + esc(day.summary) + "</div>";
    body.appendChild(head);

    const tl = el("div", "timeline");
    day.stops.forEach((s, i) => {
      const mode = MODES[s.arrive.mode] || MODES.start;
      const leg = el("div", "tl-leg");
      leg.style.setProperty("--c", day.color);
      leg.innerHTML =
        '<div class="leg-ic">' + mode.icon + "</div>" +
        '<div class="leg-tx">' + esc(s.arrive.text) + transHtml(s.arrive) + "</div>";
      tl.appendChild(leg);

      const ti = TYPE_ICON[s.type] || "📍";
      const stop = el("div", "tl-stop");
      stop.dataset.id = s.id;
      stop.style.setProperty("--c", day.color);
      stop.style.setProperty("--ct", day.colorText || day.color);
      stop.innerHTML =
        '<div class="stop-rail"><div class="stop-num">' + (i + 1) + "</div></div>" +
        '<div class="stop-card">' +
          '<div class="sc-top">' +
            '<span class="sc-time">' + esc(s.time) + "</span>" +
            '<span class="sc-type">' + ti + "</span>" +
            '<span class="sc-name">' + esc(s.name) + "</span>" +
          "</div>" +
          (window.FIELD ? FIELD.chips(s) : "") +
          '<div class="sc-desc">' + esc(s.desc) + "</div>" +
          costHtml(s) +
          (window.FIELD ? FIELD.actions(s) : "") +
          (s.photo
            ? '<div class="sc-photo"><img src="' + s.photo + '" alt="' + esc(s.name) +
              ' 照片" loading="lazy" onerror="this.parentNode.style.display=\'none\'"></div>'
            : "") +
        "</div>";
      clickable(stop, () => setActiveStop(s.id, { source: "list" }),
        s.time + " " + s.name);
      tl.appendChild(stop);
    });
    body.appendChild(tl);

    if (day.returnNote) {
      const rn = el("div", "return-note", "<b>↩ 歸途 / 收尾</b><br>" + esc(day.returnNote));
      body.appendChild(rn);
    }
    if (day.bookLinks && day.bookLinks.length) {
      const bl = el("div", "book-row");
      bl.innerHTML = '<span class="br-label">🎫 訂票 / 預約</span>' +
        day.bookLinks.map(bookLink).join("");
      body.appendChild(bl);
    }
    appendFooter(body);
    if (window.FIELD && FIELD.onRender) FIELD.onRender(currentDay);
  }

  function appendFooter(body) {
    const f = el("div", "side-foot");
    f.innerHTML =
      "福岡 5天4夜 · 方案 A 經典均衡<br>" +
      "交通班次／票價請出發前以乘換案內再次確認<br>" +
      "景點照片：Wikimedia Commons（自由授權）";
    body.appendChild(f);
  }

  function renderOverviewBody(body) {
    const intro = el("div", "day-head");
    intro.innerHTML =
      '<div class="dh-theme" style="border-color:var(--accent)">五日全程總覽</div>' +
      '<div class="dh-sum">點任一天卡片可放大檢視當日路線與交通。地圖上的顏色＝各日；線型＝交通方式（見右上「圖例」）。</div>';
    body.appendChild(intro);

    const wrap = el("div", "timeline");
    DAYS.forEach((d) => {
      const card = el("div", "tl-stop");
      card.style.setProperty("--c", d.color);
      card.style.setProperty("--ct", d.colorText || d.color);
      const spotNames = d.stops.map((s) => s.name).join("・");
      card.innerHTML =
        '<div class="stop-rail"><div class="stop-num">' + d.n + "</div></div>" +
        '<div class="stop-card">' +
          '<div class="sc-top">' +
            '<span class="sc-time">' + esc(d.date) + " " + esc(d.dow) + "</span>" +
            '<span class="sc-name">' + esc(d.theme) + "</span>" +
          "</div>" +
          '<div class="sc-desc" style="-webkit-line-clamp:2">' + esc(d.summary) + "</div>" +
          '<div class="sc-spots">📍 ' + esc(spotNames) + "</div>" +
        "</div>";
      clickable(card, () => selectDay(d.n), "Day " + d.n + " " + d.theme);
      wrap.appendChild(card);
    });
    body.appendChild(wrap);
    appendFooter(body);
    if (window.FIELD && FIELD.onRender) FIELD.onRender(0);
  }

  /* ---------------- 切換日 ---------------- */
  function selectDay(n) {
    currentDay = n;
    clearView();
    renderTabs();
    renderBody();
    if (n === 0) drawOverview();
    else drawDay(DAYS[n - 1]);
    $("#dayBody").scrollTop = 0;
    try {
      const hash = "#d" + n;
      if (location.hash !== hash) history.replaceState(null, "", hash);
    } catch (e) { /* file:// 受限，忽略 */ }
  }

  function dayFromHash() {
    const m = /^#d([0-5])$/.exec(location.hash || "");
    return m ? parseInt(m[1], 10) : null;
  }

  /* ---------------- 手機底部抽屜 ---------------- */
  function setScrim(on) {
    const s = $("#sheetScrim");
    if (s) s.classList.toggle("show", !!on && isMobile());
  }
  function expandSheet() {
    if (!isMobile()) return;
    $("#sidebar").classList.add("expanded");
    document.body.classList.add("sheet-open");
    setScrim(true);
  }
  function collapseSheet() {
    $("#sidebar").classList.remove("expanded");
    document.body.classList.remove("sheet-open");
    setScrim(false);
  }
  function toggleSheet() {
    if ($("#sidebar").classList.contains("expanded")) collapseSheet();
    else expandSheet();
  }

  function initSheet() {
    const handle = $("#sheetHandle");
    let movedGesture = false, suppressClickUntil = 0;

    handle.addEventListener("click", () => {
      if (Date.now() < suppressClickUntil) return; // 拖曳後抑制合成 click
      toggleSheet();
    });

    let startY = null, startExpanded = false;
    handle.addEventListener("touchstart", (e) => {
      startY = e.touches[0].clientY;
      startExpanded = $("#sidebar").classList.contains("expanded");
      movedGesture = false;
    }, { passive: true });
    handle.addEventListener("touchmove", (e) => {
      if (startY == null) return;
      const dy = e.touches[0].clientY - startY;
      if (!startExpanded && dy < -34) { expandSheet(); movedGesture = true; startY = null; }
      else if (startExpanded && dy > 34) { collapseSheet(); movedGesture = true; startY = null; }
    }, { passive: true });
    handle.addEventListener("touchend", () => {
      startY = null;
      if (movedGesture) suppressClickUntil = Date.now() + 400;
    });

    const scrim = $("#sheetScrim");
    if (scrim) scrim.addEventListener("click", collapseSheet);
  }

  /* ---------------- 圖例（動態列出實際用到的交通方式）---------------- */
  function initLegend() {
    const panel = $("#legendPanel");
    let html = '<h4>各日路線（顏色）</h4>';
    DAYS.forEach((d) => {
      html += '<div class="legend-row"><span class="lg-day-dot" style="background:' + d.color +
        '"></span><span class="lg-tx"><b>D' + d.n + "</b> · " + esc(d.date) + " " + esc(d.dow) + "</span></div>";
    });

    // 收集 DAYS 中實際出現的交通模式（排除 start）
    const order = ["rail", "walk", "ferry", "bus", "taxi", "cable"];
    const used = {};
    DAYS.forEach((d) => d.stops.forEach((s) => {
      const mk = s.arrive && s.arrive.mode;
      if (mk && mk !== "start") used[mk] = true;
    }));
    html += "<h4>交通方式（線型）</h4>";
    order.filter((k) => used[k]).forEach((k) => {
      const m = MODES[k];
      const dash = m.dash ? "border-top-style:dashed" : "border-top-style:solid";
      html += '<div class="legend-row"><span class="lg-line" style="border-top-color:#5A6373;' + dash +
        '"></span><span class="lg-ic">' + m.icon + '</span><span class="lg-tx">' + esc(m.label) + "</span></div>";
    });
    panel.innerHTML = html;

    const toggle = $("#legendToggle");
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      panel.classList.toggle("hidden");
    });
    document.addEventListener("click", (e) => {
      if (!panel.classList.contains("hidden") &&
          !panel.contains(e.target) && !e.target.closest("#legendToggle")) {
        panel.classList.add("hidden");
      }
    });
  }

  /* ---------------- 資訊 Modal（含焦點管理）---------------- */
  function initModal() {
    const mask = $("#infoModal");
    const modal = mask.querySelector(".modal");
    const body = $("#modalBody");
    body.innerHTML =
      '<div class="m-section"><div class="ms-label">🎯 三大必去</div>' +
        '<div class="m-musts">' + META.musts.map((m) => "<span>" + esc(m) + "</span>").join("") + "</div></div>" +
      '<div class="m-section"><div class="ms-label">🧭 前提</div><p>' + esc(META.premise) + "</p></div>" +
      '<div class="m-section"><div class="ms-label">🏨 住宿</div><p>' + esc(META.hotel) + "</p></div>" +
      '<div class="m-section"><div class="ms-label">💡 規劃邏輯（5 大重點）</div>' +
        '<div class="dp-list">' +
          META.designPoints.map((d, i) =>
            '<div class="dp-item"><div class="dp-no">' + (i + 1) + "</div>" +
            '<div class="dp-tx"><b>' + esc(d.label) + "</b>" + esc(d.text) + "</div></div>"
          ).join("") +
        "</div></div>" +
      budgetHtml(META.budget) +
      '<div class="m-foot">本地圖依「方案 A · 經典均衡」整理 · 交通班次／票價／房價為概估，出發前請以官方／乘換案內再次確認<br>' +
        '圖片來源：Wikimedia Commons（自由授權）</div>';

    let lastFocus = null;
    const open = () => {
      lastFocus = document.activeElement;
      mask.classList.remove("hidden");
      const close = $("#modalClose");
      if (close) close.focus();
    };
    const close = () => {
      mask.classList.add("hidden");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    $("#infoBtn").addEventListener("click", open);
    $("#modalClose").addEventListener("click", close);
    mask.addEventListener("click", (e) => { if (e.target === mask) close(); });

    // 簡易焦點陷阱
    modal.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      const f = modal.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (!mask.classList.contains("hidden")) { close(); return; }
      const panel = $("#legendPanel");
      if (panel && !panel.classList.contains("hidden")) panel.classList.add("hidden");
    });
  }

  /* ---------------- 啟動 ---------------- */
  function boot() {
    $("#brandTitle").innerHTML =
      esc(META.title) + ' <span class="plan">' + esc(META.subtitle) + "</span>";
    $("#brandDates").textContent = META.dateRange;
    $("#brandMusts").innerHTML = META.musts
      .map((m) => '<span class="must-chip">' + esc(m) + "</span>").join("");

    initMap();
    initSheet();
    initLegend();
    initModal();

    const startDay = dayFromHash();
    selectDay(startDay == null ? 1 : startDay);

    window.addEventListener("hashchange", () => {
      const h = dayFromHash();
      if (h != null && h !== currentDay) selectDay(h);
    });

    let rz;
    window.addEventListener("resize", () => {
      clearTimeout(rz);
      rz = setTimeout(() => {
        map.invalidateSize();
        if (!isMobile()) collapseSheet();   // 回到桌機版時清掉抽屜展開殘留
        if (lastFitPoints) fitTo(lastFitPoints);
      }, 200);
    });
  }

  // 對外 API：供 field.js（現場工具層）取用地圖/行程/切換
  window.TRIP_APP = {
    DAYS: DAYS, META: META,
    getMap: function () { return map; },
    getCurrentDay: function () { return currentDay; },
    selectDay: function (n) { selectDay(n); },
    setActiveStop: function (id, o) { setActiveStop(id, o); },
    findStop: function (id) { return findStop(id); },
    focusStop: function (s, m) { focusStop(s, m); },
    markerFor: function (id) { return markerIndex[id]; }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
