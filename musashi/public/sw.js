/* Musashi · service worker: app instalable, pantalla sin conexión y notificaciones push.
   No guarda datos del negocio en el teléfono: sólo la pantalla de "sin conexión". */
const CACHE = "musashi-v1";
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["/offline.html", "/icon-192.png"])).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });

// Sólo las páginas: si no hay red, la pantalla de sin conexión. Lo demás pasa directo a la red.
self.addEventListener("fetch", (e) => {
  if (e.request.mode !== "navigate") return;
  e.respondWith(fetch(e.request).catch(() => caches.match("/offline.html")));
});

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { cuerpo: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.titulo || "Musashi", {
    body: d.cuerpo || "", icon: "/icon-192.png", badge: "/badge-96.png", tag: d.tag || undefined, renotify: Boolean(d.tag),
    data: { url: d.url || "/" }, lang: "es-MX",
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "/", self.location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((ws) => {
    const w = ws.find((x) => x.url.startsWith(self.location.origin));
    if (w) return w.focus().then(() => w.navigate(url)).catch(() => self.clients.openWindow(url));
    return self.clients.openWindow(url);
  }));
});
