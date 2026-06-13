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
    shop: "🛍️", show: "🎏"
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

  /* ---------------- 狀態 ---------------- */
  let map;
  let currentDay = 1;                 // 0 = 總覽；1..5 = 各日
  let viewLayer = null;               // 當前圖層（markers + routes）
  const markerIndex = {};             // stopId -> L.marker
  let activeStopId = null;

  /* ---------------- 地圖初始化 ---------------- */
  function initMap() {
    map = L.map("map", {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
      tap: true,
      minZoom: 8,
      maxZoom: 18,
      zoomSnap: 0.25
    });
    L.control.zoom({ position: "topleft" }).addTo(map);
    map.zoomControl.setPosition("topleft");

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        subdomains: "abcd",
        maxZoom: 19,
        detectRetina: false,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
      }
    ).addTo(map);

    // 預設視野：福岡都會圈
    map.setView([33.62, 130.5], 9);
  }

  /* ---------------- 繪製：marker 與路線 ---------------- */
  function makeMarker(stop, color, num) {
    const html =
      '<div class="dm-pin" style="background:' + color + '">' +
      '<span class="dm-num">' + num + "</span></div>";
    const icon = L.divIcon({
      className: "day-marker",
      html: html,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -17]
    });
    const m = L.marker([stop.lat, stop.lng], { icon: icon, riseOnHover: true, keyboard: false });
    m.bindPopup(popupHtml(stop, color), {
      maxWidth: 260, minWidth: 248, closeButton: true, autoPanPadding: [30, 30]
    });
    m.on("click", () => setActiveStop(stop.id, { fromMap: true }));
    m.on("popupopen", () => setActiveStop(stop.id, { fromMap: true, noFly: true }));
    return m;
  }

  function popupHtml(stop, color) {
    const ti = TYPE_ICON[stop.type] || "📍";
    const mode = MODES[stop.arrive.mode] || MODES.start;
    const photo = stop.photo
      ? '<div class="pp-photo"><img src="' + stop.photo + '" alt="' + esc(stop.name) +
        '" loading="lazy" onerror="this.parentNode.style.display=\'none\'"></div>'
      : "";
    return (
      '<div class="pp" style="--c:' + color + '">' +
      photo +
      '<div class="pp-body">' +
        '<span class="pp-time">' + esc(stop.time) + "</span>" +
        '<div class="pp-name">' + ti + " " + esc(stop.name) + "</div>" +
        '<div class="pp-desc">' + esc(stop.desc) + "</div>" +
        '<div class="pp-trans"><span class="t-ic">' + mode.icon + "</span>" +
          "<span>" + esc(stop.arrive.text) + "</span></div>" +
      "</div></div>"
    );
  }

  function drawDay(day) {
    const group = L.layerGroup();
    const pts = day.stops.map((s) => [s.lat, s.lng]);

    // 路線（兩兩相連，依交通方式上線型）
    for (let i = 1; i < day.stops.length; i++) {
      const a = day.stops[i - 1], b = day.stops[i];
      const mode = MODES[b.arrive.mode] || MODES.rail;
      const latlngs = [[a.lat, a.lng], [b.lat, b.lng]];
      // 白色外襯，提升於底圖上的辨識度
      L.polyline(latlngs, { color: "#ffffff", weight: 7, opacity: 0.6, lineCap: "round" }).addTo(group);
      const line = L.polyline(latlngs, {
        color: day.color,
        weight: 4.5,
        opacity: 0.9,
        dashArray: mode.dash || null,
        lineCap: "round",
        lineJoin: "round"
      }).addTo(group);
      line.bindPopup(routePopupHtml(day, a, b, mode), { maxWidth: 250 });
      line.bindTooltip(mode.icon + " " + mode.label, { sticky: true, direction: "top", opacity: 0.95 });
      line.on("mouseover", () => line.setStyle({ weight: 6.5 }));
      line.on("mouseout", () => line.setStyle({ weight: 4.5 }));
    }

    // markers
    day.stops.forEach((s, i) => {
      const m = makeMarker(s, day.color, i + 1);
      m.addTo(group);
      markerIndex[s.id] = m;
    });

    group.addTo(map);
    viewLayer = group;
    fitTo(pts);
  }

  function drawOverview() {
    const group = L.layerGroup();
    const all = [];
    DAYS.forEach((day) => {
      const pts = day.stops.map((s) => [s.lat, s.lng]);
      // 路線（總覽用較細、半透明，避免雜亂）
      for (let i = 1; i < day.stops.length; i++) {
        const a = day.stops[i - 1], b = day.stops[i];
        const mode = MODES[b.arrive.mode] || MODES.rail;
        L.polyline([[a.lat, a.lng], [b.lat, b.lng]], {
          color: day.color, weight: 3, opacity: 0.7, dashArray: mode.dash || null, lineCap: "round"
        }).addTo(group);
      }
      day.stops.forEach((s, i) => {
        const m = makeMarker(s, day.color, i + 1);
        m.addTo(group);
        markerIndex[s.id] = m;
        all.push([s.lat, s.lng]);
      });
    });
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
        '<div class="rp-day" style="color:' + day.color + '">● Day ' + day.n + " · " + esc(day.theme) + "</div>" +
      "</div>"
    );
  }

  function fitTo(points) {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView(points[0], 14, { animate: true });
      return;
    }
    const bounds = L.latLngBounds(points);
    const mob = isMobile();
    map.fitBounds(bounds, {
      paddingTopLeft: [mob ? 30 : 60, mob ? 70 : 60],
      paddingBottomRight: [mob ? 30 : 60, mob ? 170 : 60],
      maxZoom: 15,
      animate: true
    });
  }

  function clearView() {
    if (viewLayer) { map.removeLayer(viewLayer); viewLayer = null; }
    for (const k in markerIndex) delete markerIndex[k];
    activeStopId = null;
  }

  /* ---------------- 互動：選定停點 ---------------- */
  function setActiveStop(stopId, opts) {
    opts = opts || {};
    activeStopId = stopId;

    // 列表高亮
    document.querySelectorAll(".tl-stop").forEach((n) => {
      n.classList.toggle("active", n.dataset.id === stopId);
    });

    const stop = findStop(stopId);
    if (!stop) return;
    const m = markerIndex[stopId];

    if (!opts.fromMap && m) {
      // 由列表觸發：飛到 marker 並開 popup
      const targetZoom = Math.max(map.getZoom(), 14);
      map.flyTo([stop.lat, stop.lng], targetZoom, { duration: 0.6 });
      map.once("moveend", () => m.openPopup());
      if (isMobile()) collapseSheet();   // 手機：收起抽屜以看地圖
    } else if (opts.fromMap) {
      // 由地圖觸發：捲動列表至該卡片
      const card = document.querySelector('.tl-stop[data-id="' + cssEsc(stopId) + '"]');
      if (card && !isMobile()) card.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    document.querySelectorAll(".day-marker").forEach((n) => n.classList.remove("active"));
    if (m && m._icon) m._icon.classList.add("active");
  }

  function cssEsc(s) { return String(s).replace(/"/g, '\\"'); }
  function findStop(id) {
    for (const d of DAYS) for (const s of d.stops) if (s.id === id) return s;
    return null;
  }

  /* ---------------- 側欄渲染 ---------------- */
  function renderTabs() {
    const tabs = $("#dayTabs");
    tabs.innerHTML = "";

    const all = el("div", "day-tab all" + (currentDay === 0 ? " active" : ""));
    all.style.setProperty("--c", "var(--accent)");
    all.innerHTML = '<div class="dt-day">全程</div><div class="dt-date">總覽</div><div class="dt-dot"></div>';
    all.addEventListener("click", () => selectDay(0));
    tabs.appendChild(all);

    DAYS.forEach((d) => {
      const t = el("div", "day-tab" + (currentDay === d.n ? " active" : ""));
      t.style.setProperty("--c", d.color);
      t.innerHTML =
        '<div class="dt-day">Day ' + d.n + "</div>" +
        '<div class="dt-date">' + esc(d.date) + "</div>" +
        '<div class="dt-dot"></div>';
      t.addEventListener("click", () => selectDay(d.n));
      tabs.appendChild(t);
    });
  }

  function renderBody() {
    const body = $("#dayBody");
    body.innerHTML = "";

    if (currentDay === 0) { renderOverviewBody(body); return; }

    const day = DAYS[currentDay - 1];
    body.style.setProperty("--c", day.color);

    const head = el("div", "day-head");
    head.style.setProperty("--c", day.color);
    head.innerHTML =
      '<div class="dh-theme">' + esc(day.theme) + "</div>" +
      '<div class="dh-sum">' + esc(day.summary) + "</div>";
    body.appendChild(head);

    const tl = el("div", "timeline");
    day.stops.forEach((s, i) => {
      // 交通段（抵達此停點）
      const mode = MODES[s.arrive.mode] || MODES.start;
      const leg = el("div", "tl-leg");
      leg.style.setProperty("--c", day.color);
      leg.innerHTML =
        '<div class="leg-ic">' + mode.icon + "</div>" +
        '<div class="leg-tx">' + esc(s.arrive.text) + "</div>";
      tl.appendChild(leg);

      // 停點卡片
      const ti = TYPE_ICON[s.type] || "📍";
      const stop = el("div", "tl-stop");
      stop.dataset.id = s.id;
      stop.style.setProperty("--c", day.color);
      stop.innerHTML =
        '<div class="stop-rail"><div class="stop-num">' + (i + 1) + "</div></div>" +
        '<div class="stop-card">' +
          '<div class="sc-top">' +
            '<span class="sc-time">' + esc(s.time) + "</span>" +
            '<span class="sc-type">' + ti + "</span>" +
            '<span class="sc-name">' + esc(s.name) + "</span>" +
          "</div>" +
          '<div class="sc-desc">' + esc(s.desc) + "</div>" +
          (s.photo
            ? '<div class="sc-photo"><img src="' + s.photo + '" alt="' + esc(s.name) +
              '" loading="lazy" onerror="this.parentNode.style.display=\'none\'"></div>'
            : "") +
        "</div>";
      stop.addEventListener("click", () => setActiveStop(s.id, { fromList: true }));
      tl.appendChild(stop);
    });
    body.appendChild(tl);

    if (day.returnNote) {
      const rn = el("div", "return-note", "<b>↩ 歸途 / 收尾</b><br>" + esc(day.returnNote));
      body.appendChild(rn);
    }
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
      const spotNames = d.stops.map((s) => s.name).join("・");
      card.innerHTML =
        '<div class="stop-rail"><div class="stop-num">' + d.n + "</div></div>" +
        '<div class="stop-card">' +
          '<div class="sc-top">' +
            '<span class="sc-time">' + esc(d.date) + " " + esc(d.dow) + "</span>" +
            '<span class="sc-name">' + esc(d.theme) + "</span>" +
          "</div>" +
          '<div class="sc-desc" style="-webkit-line-clamp:2">' + esc(d.summary) + "</div>" +
          '<div style="margin-top:7px;font-size:10.5px;color:#8A93A3;line-height:1.5">📍 ' +
            esc(spotNames) + "</div>" +
        "</div>";
      card.addEventListener("click", () => selectDay(d.n));
      wrap.appendChild(card);
    });
    body.appendChild(wrap);
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
  }

  /* ---------------- 手機底部抽屜 ---------------- */
  function expandSheet() { if (isMobile()) $("#sidebar").classList.add("expanded"); }
  function collapseSheet() { $("#sidebar").classList.remove("expanded"); }
  function toggleSheet() { $("#sidebar").classList.toggle("expanded"); }

  function initSheet() {
    const handle = $("#sheetHandle");
    handle.addEventListener("click", toggleSheet);

    // 觸控拖曳（增強，非必要；點擊把手永遠可用）
    let startY = null, startExpanded = false;
    handle.addEventListener("touchstart", (e) => {
      startY = e.touches[0].clientY;
      startExpanded = $("#sidebar").classList.contains("expanded");
    }, { passive: true });
    handle.addEventListener("touchmove", (e) => {
      if (startY == null) return;
      const dy = e.touches[0].clientY - startY;
      if (!startExpanded && dy < -34) { expandSheet(); startY = null; }
      else if (startExpanded && dy > 34) { collapseSheet(); startY = null; }
    }, { passive: true });
    handle.addEventListener("touchend", () => { startY = null; });
  }

  /* ---------------- 圖例 ---------------- */
  function initLegend() {
    const panel = $("#legendPanel");
    let html = '<h4>各日路線（顏色）</h4>';
    DAYS.forEach((d) => {
      html += '<div class="legend-row"><span class="lg-day-dot" style="background:' + d.color +
        '"></span><span class="lg-tx">Day ' + d.n + " · " + esc(d.date) + " " + esc(d.dow) + "</span></div>";
    });
    html += "<h4>交通方式（線型）</h4>";
    ["rail", "walk", "ferry", "bus", "taxi"].forEach((k) => {
      const m = MODES[k];
      const dash = m.dash ? "border-top-style:dashed" : "border-top-style:solid";
      html += '<div class="legend-row"><span class="lg-line" style="border-top-color:#5A6373;' + dash +
        '"></span><span class="lg-ic">' + m.icon + '</span><span class="lg-tx">' + esc(m.label) + "</span></div>";
    });
    panel.innerHTML = html;

    $("#legendToggle").addEventListener("click", (e) => {
      e.stopPropagation();
      panel.classList.toggle("hidden");
    });
    document.addEventListener("click", (e) => {
      if (!panel.classList.contains("hidden") &&
          !panel.contains(e.target) && e.target.id !== "legendToggle") {
        panel.classList.add("hidden");
      }
    });
  }

  /* ---------------- 資訊 Modal ---------------- */
  function initModal() {
    const mask = $("#infoModal");
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
      '<div class="m-foot">本地圖依「方案 A · 經典均衡」整理 · 交通班次／票價請出發前以乘換案內再次確認<br>' +
        '圖片來源：Wikimedia Commons（自由授權）</div>';

    const open = () => mask.classList.remove("hidden");
    const close = () => mask.classList.add("hidden");
    $("#infoBtn").addEventListener("click", open);
    $("#modalClose").addEventListener("click", close);
    mask.addEventListener("click", (e) => { if (e.target === mask) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  /* ---------------- 啟動 ---------------- */
  function boot() {
    // 填入品牌列
    $("#brandTitle").innerHTML =
      esc(META.title) + ' <span class="plan">' + esc(META.subtitle) + "</span>";
    $("#brandDates").textContent = META.dateRange;
    $("#brandMusts").innerHTML = META.musts
      .map((m) => '<span class="must-chip">' + esc(m) + "</span>").join("");

    initMap();
    initSheet();
    initLegend();
    initModal();
    selectDay(1);

    // 隱藏載入畫面
    setTimeout(() => { $("#loader").classList.add("hidden"); }, 350);

    // 視窗尺寸改變：重算地圖
    let rz;
    window.addEventListener("resize", () => {
      clearTimeout(rz);
      rz = setTimeout(() => { map.invalidateSize(); }, 200);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
