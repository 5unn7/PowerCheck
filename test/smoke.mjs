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
// the app opens on the aircraft page, so the check is reached through it
await page.waitForSelector(".fleet .card", { timeout: 15000 });

let failed = 0;
const check = (name, ok, detail = "") => {
  if (!ok) failed++;
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
};

async function selectAircraft(air) {
  // already on a check — the header badge goes back to the aircraft page
  if (await page.locator(".change").count()) {
    await page.locator(".change").click();
    await page.waitForSelector(".fleet .card");
  }
  await page.locator(".fleet .card", { hasText: air.label }).first().click();
  await page.waitForSelector(".field input");
  await page.waitForTimeout(250);
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
  const v = air.verify[0] || air.sample;
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
  for (const [key, want] of Object.entries(v.expect || {})) {
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

/* The crew fill in the readings and the last thing they see is the number,
   green or red. Nothing else, and nothing to read. */
console.log("\nthe check answers with a number and a colour");
{
  const b407 = AIRCRAFT.find((a) => a.id === "bell-407");
  await selectAircraft(b407);
  const v = b407.verify[0];
  await applyConfig(b407, v.config || {});
  await enter(b407, v);                                  // 600 against 676 — a pass
  const big = () => page.locator(".hero .big span").innerText();
  const colour = () => page.locator(".hero .big").evaluate((e) => getComputedStyle(e).color);
  const green = await colour();
  check("a passing check shows a positive number", (await big()).startsWith("+"), await big());
  check("and no verdict paragraph anywhere", (await page.locator(".verdict").count()) === 0);

  await enter(b407, { ...v, mgt: 760 });                 // over the chart maximum
  const red = await colour();
  check("a failing check shows a negative number", (await big()).startsWith("-"), await big());
  check("in a different colour from the passing one", red !== green, `${green} -> ${red}`);
  check("and still no verdict paragraph", (await page.locator(".verdict").count()) === 0);
}

/* A slope through two points is not a trend. Logged through the real UI. */
console.log("\nno rate until there are enough checks");
{
  const b212 = AIRCRAFT.find((a) => a.id === "bell-212-pt6t3");
  const v = b212.verify[0];
  await selectAircraft(b212);
  await page.locator(".config .seg button", { hasText: "Engine 1" }).first().click();
  // its own tail number, so this block's records are the only ones on the line
  await page.locator("input.reg").fill("C-TREND");
  const rate = async () => (await page.locator(".tstats div b").nth(2).innerText()).trim();
  const goTrend = async () => {
    await page.locator(".tabs .tab", { hasText: "Trend" }).click(); await page.waitForTimeout(250); };
  const goCheck = async () => {
    await page.locator(".tabs .tab", { hasText: "Check" }).click(); await page.waitForTimeout(200); };

  // checks logged on the same day have no spread in time, so log against
  // engine hours the way an operator would
  const hoursBox = page.locator(".field input").nth(b212.inputs.length);
  const log = async (itt, hrs) => {
    await enter(b212, { ...v, itt });
    await hoursBox.fill(String(hrs));
    await page.waitForTimeout(150);
    await page.locator(".save .btn").click(); await page.waitForTimeout(250);
  };
  for (let i = 0; i < 4; i++) await log(700 + i, 1200 + i * 25);
  await goTrend();
  await page.locator(".panel .wrapseg button", { hasText: "C-TREND" }).first().click();
  await page.waitForTimeout(200);
  check("four checks give no rate", await rate() === "—", `rate=${await rate()}`);
  const tile = (await page.locator(".tstats div span").nth(2).innerText()).trim();
  check("and the tile says how many are needed", /5 checks/i.test(tile), tile);
  await goCheck();

  await log(704, 1300);
  await goTrend();
  await page.locator(".panel .wrapseg button", { hasText: "C-TREND" }).first().click();
  await page.waitForTimeout(200);
  check("the fifth gives one", await rate() !== "—", `rate=${await rate()}`);
  check("with its scatter stated", (await page.locator(".scatter").count()) === 1,
        (await page.locator(".scatter").innerText().catch(() => "")).trim());
  await goCheck();
}

console.log("\nthe app installs");
check("a manifest is linked", !!(await page.locator("link[rel=manifest]").getAttribute("href")));
check("no JavaScript errors", errors.length === 0, errors.slice(0, 3).join(" | "));

/* The install offer, driven through a browser that has no install API — which
   is the case it exists for. Chromium here never fires beforeinstallprompt, so
   pretending to be Safari is also the only way to see the sheet at all. */
{
  const url = new URL("../index.html", import.meta.url).href;
  const iphone = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 "
    + "(KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
  const ctx = await browser.newContext({ userAgent: iphone, viewport: { width: 390, height: 844 } });
  const ip = await ctx.newPage();
  const errs = [];
  ip.on("pageerror", (e) => errs.push(String(e.message)));
  await ip.goto(url);
  await ip.waitForSelector(".fleet .card", { timeout: 15000 });

  await ip.waitForSelector(".install", { timeout: 12000 });
  const how = (await ip.locator(".install-how").innerText()).trim();
  check("an iPhone is told where its own button is", /Add to Home Screen/i.test(how), how);
  check("and Safari is not told to open Safari", !/Open in Safari/i.test(how), how);
  check("and is not shown an Install button it cannot use",
        (await ip.locator(".install-go").count()) === 0);

  await ip.locator(".install-x").click();
  await ip.waitForTimeout(200);
  check("dismissing it closes it", (await ip.locator(".install").count()) === 0);

  const again = await ctx.newPage();
  await again.goto(url);
  await again.waitForSelector(".fleet .card", { timeout: 15000 });
  await again.waitForTimeout(6000);
  check("and it stays dismissed on the next visit", (await again.locator(".install").count()) === 0);
  check("no JavaScript errors on the way", errs.length === 0, errs.slice(0, 2).join(" | "));
  await ctx.close();

  /* A Chrome or Firefox on iOS is Safari underneath with the install path
     withheld, so the only useful thing to say is which browser to open. */
  const crios = iphone.replace("Version/17.5 ", "CriOS/126.0.6478.54 ");
  const ctx2 = await browser.newContext({ userAgent: crios, viewport: { width: 390, height: 844 } });
  const cp = await ctx2.newPage();
  await cp.goto(url);
  await cp.waitForSelector(".install", { timeout: 15000 });
  const t2 = (await cp.locator(".install-how").innerText()).trim();
  check("iPhone Chrome is sent to Safari", /Open in Safari/i.test(t2), t2);
  await ctx2.close();
}

await browser.close();
console.log(failed ? `\n${failed} failed` : "\nall passed");
process.exit(failed ? 1 : 0);
