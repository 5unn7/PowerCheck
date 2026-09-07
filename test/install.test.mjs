/* The install prompt has to be right about the browser it is talking to, and
   the cost of being wrong is telling a crew to tap a button that is not there.
   Run with `npm test`. */
import { installTarget, canOffer } from "../src/install.js";

let failed = 0, ran = 0;
const check = (name, ok, detail = "") => {
  ran++;
  if (!ok) { failed++; console.log(`  FAIL  ${name}${detail ? " — " + detail : ""}`); }
  else console.log(`  ok    ${name}${detail ? " — " + detail : ""}`);
};

const UA = {
  iphoneSafari: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  iphoneChrome: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.6478.54 Mobile/15E148 Safari/604.1",
  iphoneFirefox: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/127.0 Mobile/15E148 Safari/605.1.15",
  iphoneEdge: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 EdgiOS/126.0 Mobile/15E148 Safari/604.1",
  ipadOS: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
  macSafari: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
  macChrome: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  androidChrome: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
  androidFirefox: "Mozilla/5.0 (Android 14; Mobile; rv:127.0) Gecko/127.0 Firefox/127.0",
  winFirefox: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0",
  winEdge: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
};

console.log("already installed, or the browser has offered");
check("running standalone offers nothing",
      installTarget({ ua: UA.androidChrome, standalone: true }).kind === "installed");
check("standalone wins even when the browser has also offered",
      installTarget({ ua: UA.androidChrome, standalone: true, canPrompt: true }).kind === "installed");
check("a live beforeinstallprompt is taken on any platform",
      installTarget({ ua: UA.androidChrome, canPrompt: true }).kind === "prompt");

console.log("\niOS, where there is no API and the button must be described");
check("iPhone Safari is told where Add to Home Screen is",
      installTarget({ ua: UA.iphoneSafari }).kind === "ios-safari");
for (const [name, ua, brand] of [["Chrome", UA.iphoneChrome, "Chrome"],
                                 ["Firefox", UA.iphoneFirefox, "Firefox"],
                                 ["Edge", UA.iphoneEdge, "Edge"]]) {
  const t = installTarget({ ua });
  check(`iPhone ${name} is sent to Safari, by name`,
        t.kind === "ios-other" && t.browser === brand, `${t.kind} ${t.browser || ""}`);
}
/* iPadOS 13+ reports itself as a Mac. Only the touch points give it away, and
   getting this wrong sends an iPad user to Add to Dock, which it does not have. */
check("an iPad is an iPad even though it claims to be a Mac",
      installTarget({ ua: UA.ipadOS, platform: "MacIntel", maxTouchPoints: 5 }).kind === "ios-safari");
check("and a real Mac on the same string is not",
      installTarget({ ua: UA.macSafari, platform: "MacIntel", maxTouchPoints: 0 }).kind === "mac-safari");

console.log("\neverything else");
check("desktop Safari is told Add to Dock",
      installTarget({ ua: UA.macSafari }).kind === "mac-safari");
check("Chrome on a Mac is not mistaken for Safari",
      installTarget({ ua: UA.macChrome }).kind === "none");
check("Android Firefox is told where its menu item is",
      installTarget({ ua: UA.androidFirefox }).kind === "android-firefox");
check("desktop Firefox is offered nothing, because it has nothing",
      installTarget({ ua: UA.winFirefox }).kind === "none");
check("Chromium that has not offered yet says nothing rather than guessing",
      installTarget({ ua: UA.winEdge }).kind === "none");

console.log("\nwhat reaches the screen");
check("only the kinds with something to say are shown",
      ["prompt", "ios-safari", "ios-other", "mac-safari", "android-firefox"].every((k) => canOffer({ kind: k })));
check("and neither installed nor none is",
      !canOffer({ kind: "installed" }) && !canOffer({ kind: "none" }));

console.log(`\n${ran - failed}/${ran} passed`);
process.exit(failed ? 1 : 0);
