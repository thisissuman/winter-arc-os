/* Only fixed public files belong in this cache. Never add workspace or API URLs. */
const CACHE = "winter-arc-public-v1";
const PUBLIC_FILES = ["/offline.html", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/apple-touch-icon.png"];
self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    for (const path of PUBLIC_FILES) {
      const response = await fetch(new Request(path, { cache: "reload", credentials: "omit", redirect: "error" }));
      if (!response.ok) throw new Error("Public offline asset unavailable");
      await cache.put(path, response);
    }
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys())
      if (key.startsWith("winter-arc-public-") && key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;
  if (!url.search && PUBLIC_FILES.includes(url.pathname)) {
    event.respondWith((async () => (await caches.match(url.pathname, { cacheName: CACHE })) || fetch(request))());
    return;
  }
  if (request.mode === "navigate") {
    event.respondWith(fetch(request, { cache: "no-store" }).catch(async () =>
      (await caches.match("/offline.html", { cacheName: CACHE })) || new Response("Offline. Reconnect to open your workspace.", { status: 503 })
    ));
  }
});
