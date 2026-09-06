/* Loads the built page in a real browser and drives every aircraft through it.

   This exists because two separate bugs shipped a page that parsed fine and
   rendered nothing — a truncated bundle, and a free variable that only threw
   at render. Neither was visible to the unit tests. Run with `npm run smoke`. */

import { chromium } from "playwright";
import { AIRCRAFT, defaultConfig } from "../src/aircraft/index.js";

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

async function selectAircraft(air) {
  if (AIRCRAFT.length > 1) {
    await page.locator(".fleet button", { hasText: air.label }).first().click();
    await page.waitForTimeout(250);
  }
}

async function applyConfig(air, config) {
  for (const opt of air.options) {
    const want = config[opt.key] ?? defaultConfig(air)[opt.key];
    if (opt.type === "switch") {
      const sw = page.locator(".config .switch");
      const on = (await sw.getAttribute("aria-checked")) === "true";
      if (on !== !!want) await sw.click();
    } else {
      const label = opt.choices.find((c) => c.id === want).label;
      await page.locator(".config .seg button", { hasText: label }).first().click();
    }
  }
  await page.waitForTimeout(200);
}

async function enter(air, v) {
  const inputs = page.locator(".field input");
  for (const [i, inp] of air.inputs.entries()) {
    await inputs.nth(i).fill(String(v[inp.key] ?? 0));
  }
  await page.waitForTimeout(300);
}

for (const air of AIRCRAFT) {
  console.log(`\n${air.label}`);
  await selectAircraft(air);
  const v = air.verify[0];
  await applyConfig(air, v.config || {});
  await enter(air, v);

  check("no off-chart notice for a published example", (await page.locator(".offchart").count()) === 0);
  const margin = (await page.locator(".big span").innerText()).trim();
  check("a margin is shown", margin !== "––" && margin !== "", margin);
  const stats = await page.locator(".stats div b").allInnerTexts();
  check("every stat is filled", stats.length > 0 && stats.every((s) => s.trim() !== "—"), stats.join(" / "));
  check("the check can be logged", !(await page.locator(".save .btn").isDisabled()));

  // the number the manual prints, read off the screen
  const labels = await page.locator(".stats div span").allInnerTexts();
  for (const [key, want] of Object.entries(v.expect)) {
    const at = labels.findIndex((l) => /max mgt/i.test(l) && key === "maxMGT"
      || /max itt/i.test(l) && key === "maxITT"
      || /set torque/i.test(l) && key === "setTq");
    if (at < 0) continue;
    const got = Number(stats[at]);
    check(`${v.source} · ${key} on screen`, Math.abs(got - want) <= 1, `manual ${want}, screen ${got}`);
  }

  // and the gate, driven through the real inputs
  const first = air.inputs[0];
  await enter(air, { ...v, [first.key]: 1e6 });
  check(`${first.key} far off the chart withholds the number`,
        (await page.locator(".big span").innerText()).trim() === "––"
        && (await page.locator(".offchart span").count()) > 0);
  check("and the check cannot be logged", await page.locator(".save .btn").isDisabled());
}

/* The reason the scopes were separated: the log must not average two
   different checks into one slope. Driven through the real UI, because
   the partition is only as good as what the buttons actually record. */
console.log("\ntwo different checks never share a line");
{
  const b212 = AIRCRAFT.find((a) => a.id === "bell-212-pt6t3");
  const v = b212.verify[0];
  await selectAircraft(b212);
  for (const engine of ["Engine 1", "Engine 2"]) {
    await page.locator(".config .seg button", { hasText: engine }).first().click();
    await enter(b212, v);
    await page.locator(".save .btn").click();
    await page.waitForTimeout(300);
  }
  await page.locator(".tabs .tab", { hasText: "Trend" }).click();
  await page.waitForTimeout(300);
  const lines = await page.locator(".panel .wrapseg button").allInnerTexts();
  check("engine 1 and engine 2 are offered as separate lines",
        lines.some((l) => /Engine 1/.test(l)) && lines.some((l) => /Engine 2/.test(l)),
        lines.join(" | "));
  check("each line holds its own check only",
        (await page.locator(".tstats div b").nth(1).innerText()).trim() === "1");
  await page.locator(".tabs .tab", { hasText: "Check" }).click();
  await page.waitForTimeout(200);
}

console.log("\nthe app installs");
check("a manifest is linked", !!(await page.locator("link[rel=manifest]").getAttribute("href")));
check("no JavaScript errors", errors.length === 0, errors.slice(0, 3).join(" | "));

await browser.close();
console.log(failed ? `\n${failed} failed` : "\nall passed");
process.exit(failed ? 1 : 0);
