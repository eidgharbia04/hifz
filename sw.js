const C = "abk-v1";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
function swr(r) {
  return caches.open(C).then(c => c.match(r, { ignoreSearch: true }).then(m => {
    const f = fetch(r).then(n => { if (n && n.ok) c.put(r, n.clone()); return n; }).catch(() => m);
    return m || f;
  }));
}
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin === location.origin || u.hostname === "www.gstatic.com") {
    e.respondWith(swr(r).then(x => x || caches.match("./index.html")).catch(() => caches.match("./index.html")));
  }
});
