/* Which install path this browser actually has.

   There is no one answer. Chromium fires `beforeinstallprompt` and hands over a
   real one-tap install; iOS Safari has no API at all and needs the crew told
   where the button is; a Chrome or Firefox on iOS cannot install anything,
   because they are Safari underneath with the install path withheld, so the
   only useful thing to say is "open it in Safari"; desktop Safari calls it Add
   to Dock; desktop Firefox has nothing, and the honest response there is to say
   nothing rather than print instructions that lead nowhere.

   Kept as one pure function of what the browser reports so it can be checked
   against real user-agent strings without a browser. Nothing here touches the
   DOM; the component decides what to draw. */

export function installTarget({
  ua = "", platform = "", maxTouchPoints = 0, standalone = false, canPrompt = false,
} = {}) {
  if (standalone) return { kind: "installed" };
  // Chromium has offered; take it, whatever the platform underneath
  if (canPrompt) return { kind: "prompt" };

  /* iPadOS 13 and later report themselves as a Mac and only give away the
     touch points, so the user-agent alone will call an iPad a desktop. */
  const iOS = /iPhone|iPad|iPod/.test(ua) || (platform === "MacIntel" && maxTouchPoints > 1);
  if (iOS) {
    const other = [["CriOS", "Chrome"], ["FxiOS", "Firefox"], ["EdgiOS", "Edge"],
                   ["OPiOS", "Opera"], ["OPT/", "Opera"], ["DuckDuckGo", "DuckDuckGo"]]
      .find(([token]) => ua.includes(token));
    return other ? { kind: "ios-other", browser: other[1] } : { kind: "ios-safari" };
  }

  const chromium = /Chrome\/|Chromium\/|Edg\//.test(ua);
  if (/Android/.test(ua) && /Firefox\//.test(ua)) return { kind: "android-firefox" };
  if (/Macintosh/.test(ua) && /Safari\//.test(ua) && !chromium) return { kind: "mac-safari" };

  /* Chromium that has not offered yet, desktop Firefox, anything unknown. The
     event may still arrive, and this is re-evaluated when it does. */
  return { kind: "none" };
}

/* True when there is something worth putting on screen. */
export const canOffer = (t) => t.kind !== "installed" && t.kind !== "none";
