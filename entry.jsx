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
import App from "./bell-407-power-check.jsx";

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
