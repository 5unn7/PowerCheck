/* Build entry point.

   App.jsx talks to `window.storage`, an async key/value store. Browsers do not
   provide one, so the published build supplies it over localStorage. Keeping
   the shim here — and building this file rather than the component — is what
   makes `npm run build` produce a page that actually persists a log.

   Every call is wrapped: Safari private mode and a full quota both throw on
   write, and an async function turns that into a rejected promise, which is
   what App's persist() catches to show "storage unavailable". */

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./src/App.jsx";

const NS = "pc407::";

if (!window.storage) {
  window.storage = {
    async get(key) {
      const value = localStorage.getItem(NS + key);
      if (value === null) throw new Error("not found");
      return { key, value, shared: false };
    },
    async set(key, value) {
      localStorage.setItem(NS + key, value);
      return { key, value, shared: false };
    },
    async delete(key) {
      localStorage.removeItem(NS + key);
      return { key, deleted: true, shared: false };
    },
    async list(prefix = "") {
      const keys = Object.keys(localStorage)
        .filter((k) => k.startsWith(NS + prefix))
        .map((k) => k.slice(NS.length));
      return { keys, prefix, shared: false };
    },
  };
}

createRoot(document.getElementById("root")).render(<App />);

/* Installed to a home screen the app must open with no network at all, so the
   service worker precaches the page and serves it from cache first.

   Serving from cache means a launch always shows the version already on the
   device: a new one installs in the background and takes effect on the next
   launch. Rather than let that happen silently — this app can ship a corrected
   chart — the page says so and offers to restart. It never reloads on its own,
   which would discard a check being typed. */
if ("serviceWorker" in navigator) {
  /* A page already under a worker is running a version; one that is not is
     installing its first, which is not an update to announce. Both are read
     now, at parse time: the replacement can take over before the load event,
     which is delayed by anything slow in the page — the web font, on a bad
     connection — and a listener attached on load would miss it. */
  const hadVersion = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (hadVersion) window.dispatchEvent(new CustomEvent("app-updated"));
  });

  window.addEventListener("load", () => {
    navigator.serviceWorker.register(new URL("sw.js", document.baseURI))
      // Ask on every launch rather than leaving it to the browser's own
      // schedule, which can defer the check for a day. A corrected chart
      // should not wait that long to reach the aircraft.
      .then((reg) => reg.update())
      .catch(() => { /* no service worker, no offline use — the app still runs */ });
  });
}
