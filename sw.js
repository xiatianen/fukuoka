/* 福岡行程地圖 — Service Worker（離線可用）
 * app shell：cache-first；地圖磚：cache-first＋runtime 快取；可由前端訊息預存整趟範圍。 */
const VERSION = "fukuoka-v3";
const SHELL = VERSION + "-shell";
const TILES = VERSION + "-tiles";

const APP_SHELL = [
  "./", "./index.html", "./styles.css", "./app.js", "./field.js", "./data.js", "./routes.js",
  "./manifest.webmanifest",
  "./vendor/leaflet/leaflet.css", "./vendor/leaflet/leaflet.js",
  "./vendor/markercluster/MarkerCluster.css", "./vendor/markercluster/MarkerCluster.Default.css",
  "./vendor/markercluster/leaflet.markercluster.js",
  "./assets/icons/icon-192.png", "./assets/icons/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(SHELL).then((c) => Promise.allSettled(APP_SHELL.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const isTile = (u) => /basemaps\.cartocdn\.com/.test(u);

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // 地圖磚：先快取後網路，順手把瀏覽過的磚存起來
  if (isTile(req.url)) {
    e.respondWith(caches.open(TILES).then(async (c) => {
      const hit = await c.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res && res.ok) c.put(req, res.clone());
        return res;
      } catch (err) { return hit || Response.error(); }
    }));
    return;
  }

  // 同源 app shell：先快取後網路；離線且未快取則退回首頁
  if (url.origin === location.origin) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res && res.ok && res.type === "basic") {
        const cl = res.clone();
        caches.open(SHELL).then((c) => c.put(req, cl));
      }
      return res;
    }).catch(() => caches.match("./index.html"))));
  }
});

self.addEventListener("message", (e) => {
  const d = e.data || {};
  if (d.type === "CACHE_TILES" && Array.isArray(d.urls)) e.waitUntil(cacheTiles(d.urls));
});

async function cacheTiles(urls) {
  const c = await caches.open(TILES);
  const total = urls.length || 1;
  let ok = 0, step = Math.max(1, Math.ceil(total / 20));
  for (let i = 0; i < urls.length; i++) {
    try {
      const r = await fetch(urls[i]);          // 預設 cors（CARTO 支援），存下可供 <img crossorigin> 使用
      if (r && r.ok) { await c.put(urls[i], r); ok++; }
    } catch (e2) { /* 跳過失敗磚 */ }
    if (i % step === 0) {
      const pct = Math.round(i / total * 100);
      (await self.clients.matchAll()).forEach((cl) => cl.postMessage({ type: "TILES_PROGRESS", pct }));
    }
  }
  (await self.clients.matchAll()).forEach((cl) => cl.postMessage({ type: "TILES_DONE", ok }));
}
