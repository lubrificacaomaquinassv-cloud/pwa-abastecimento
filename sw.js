const CACHE_NAME = "comboio-posto-v17";
const ASSET_VER = "17";
const APP_SHELL = [
  "./index.html",
  `./config.js?v=${ASSET_VER}`,
  "./styles.css",
  `./app.js?v=${ASSET_VER}`,
  "./manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : Promise.resolve())))
    )
  );
  self.clients.claim();
});

function isHtmlNavigation(request) {
  if (request.mode === "navigate") return true;
  const accept = request.headers.get("accept") || "";
  if (accept.includes("text/html")) return true;
  try { if (new URL(request.url).pathname.endsWith(".html")) return true; } catch {}
  return false;
}

function shouldBypassCache(request) {
  try {
    const p = new URL(request.url).pathname;
    return p.endsWith("/config.js") || p.endsWith("/app.js");
  } catch { return false; }
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (isHtmlNavigation(event.request)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) caches.open(CACHE_NAME).then((c) => c.put(event.request, response.clone()));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  if (shouldBypassCache(event.request)) {
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then((response) => {
          if (response.ok) caches.open(CACHE_NAME).then((c) => c.put(event.request, response.clone()));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(
      (cached) => cached || fetch(event.request).then((response) => {
        if (response.ok) caches.open(CACHE_NAME).then((c) => c.put(event.request, response.clone()));
        return response;
      })
    )
  );
});
