/* Loads the built page in a real browser and drives it.

   This exists because two separate bugs shipped a page that parsed fine and
   rendered nothing — a truncated bundle, and a free variable that only threw
   at render. Neither was visible to the unit tests. Run with `npm run smoke`. */

import { chromium } from "playwright";
import { AIRCRAFT, chartFor, defaultConfig, procedureFor } from "../src/aircraft/index.js";

let browser;
try {
  browser = await chromium.launch(
    process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
} catch (e) {
  console.error("No browser to run in. Either `npx playwright install chromium`,");
  console.error("or point CHROMIUM_PATH at one you already have.");
  process.exit(1);
}
const page = await browser.newPage({ viewport: { width: 430, height: 1200 } });

const errors = [];
page.on("pageerror", (e) => errors.push(String(e.message)));
page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });

await page.goto(new URL("../index.html", import.meta.url).href);
await page.waitForSelector(".field input", { timeout: 15000 });

let failed = 0;
const check = (name, ok, detail = "") => {
  if (!ok) failed++;
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
};

const inputs = page.locator(".field input");
async function enter({ tq, mgt, oat, pa }) {
  for (const [i, v] of [tq, mgt, oat, pa].entries()) await inputs.nth(i).fill(String(v));
  await page.waitForTimeout(250);
}

console.log("the page mounts and computes");
check("root is not empty", (await page.locator("#root > *").count()) > 0);

// the first aircraft's published examples, driven through the real UI
const air = AIRCRAFT[0];
for (const v of air.verify) {
  for (const opt of air.options) {
    const want = v.config[opt.key] ?? defaultConfig(air)[opt.key];
    if (opt.type === "switch") {
      const on = (await page.locator(".switch").getAttribute("aria-checked")) === "true";
      if (on !== !!want) await page.locator(".switch").click();
    } else {
      const label = opt.choices.find((c) => c.id === want).label;
      await page.locator(".seg button", { hasText: label }).first().click();
    }
  }
  await page.waitForTimeout(200);
  await enter({ tq: v.tq, mgt: 600, oat: v.oat, pa: v.pa });
  const shown = Number(await page.locator(".stats div").first().locator("b").innerText());
  check(v.source, Math.abs(shown - v.maxMGT) <= 1, `manual ${v.maxMGT}, screen ${shown}`);
}

console.log("off the chart, the screen withholds the number");
await enter({ tq: 700, mgt: 600, oat: 10, pa: 6000 });
check("no margin is shown", (await page.locator(".big span").innerText()).trim() === "––");
check("the reason is on screen", (await page.locator(".offchart span").count()) > 0);
check("the check cannot be logged", await page.locator(".save .btn").isDisabled());

console.log("the app installs");
const manifest = await page.locator('link[rel=manifest]').getAttribute("href");
check("a manifest is linked", !!manifest, manifest || "");

check("no JavaScript errors", errors.length === 0, errors.slice(0, 3).join(" | "));
await browser.close();

console.log(failed ? `\n${failed} failed` : "\nall passed");
process.exit(failed ? 1 : 0);
