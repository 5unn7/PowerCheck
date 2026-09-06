/* Offline shell.

   The whole app is one HTML file, so precaching it is the entire job: once
   installed the aircraft can be out of coverage and the check still works.
   __VERSION__ is replaced at build time with a hash of index.html, so a
   deploy produces a new cache and the old one is dropped on activate. */

const CACHE = "powercheck-__VERSION__";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
];

/* Precache straight from the network.

   GitHub Pages serves the page with max-age=600, so a plain cache.add() is
   answered out of the browser's HTTP cache and precaches the page the worker
   is meant to be replacing — the cache name changes, the content does not, and
   the install looks like it worked. "reload" bypasses that cache, and without
   it an installed app can sit on a stale version indefinitely. */
const fresh = (url) => new Request(url, { cache: "reload" });

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      // one missing file must not fail the whole install
      .then((c) => Promise.allSettled(SHELL.map((u) => c.add(fresh(u)))))
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
