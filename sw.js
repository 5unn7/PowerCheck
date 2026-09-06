/* Offline shell.

   The whole app is one HTML file, so precaching it is the entire job: once
   installed the aircraft can be out of coverage and the check still works.
   4ccde2a3edcc is replaced at build time with a hash of index.html, so a
   deploy produces a new cache and the old one is dropped on activate. */

const CACHE = "powercheck-4ccde2a3edcc";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      // one missing file must not fail the whole install
      .then((c) => Promise.allSettled(SHELL.map((u) => c.add(u))))
      .then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  // a navigation always gets the app shell, online or not
  if (request.mode === "navigate") {
    e.respondWith(
      caches.match("./index.html").then((hit) => hit || fetch(request)));
    return;
  }

  e.respondWith(
    caches.match(request).then((hit) => hit || fetch(request).then((res) => {
      // keep whatever else the page asks for, so a second launch is offline too
      if (res.ok && res.type === "basic") {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy));
      }
      return res;
    }).catch(() => hit)));
});
