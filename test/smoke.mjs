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

/* A configuration with no approved chart must say so on screen, and must
   not offer a number or a Log button. */
console.log("\na configuration with no chart is refused on screen");
{
  const b407 = AIRCRAFT.find((a) => a.id === "bell-407");
  await selectAircraft(b407);
  await applyConfig(b407, { engine: "c47e4", inlet: "basic", snow: false });
  const why = await page.locator(".missing").innerText().catch(() => "");
  check("the C47E/4 on a basic inlet is refused", /FM-1/.test(why), why.slice(0, 60));
  check("and no result is offered", (await page.locator(".save .btn").count()) === 0);

  await applyConfig(b407, { engine: "c47e4", inlet: "ps", snow: false });
  check("the same engine reads FMS-3 with a particle separator",
        (await page.locator(".missing").count()) === 0
        && (await page.locator(".big span").innerText()).trim() !== "");
}

console.log("\nchart conditions");
await selectAircraft(AIRCRAFT[0]);
await applyConfig(AIRCRAFT[0], {});
const condOpen = () => page.locator(".cond").evaluate((el) => el.open);
if (await condOpen()) await page.locator(".cond summary").click();
check("the conditions fold away", !(await condOpen()));
if (await page.locator(".config .switch").count()) {
  // a different fit is a different chart, and its conditions unfold themselves
  await page.locator(".config .switch").click();
  await page.waitForTimeout(250);
  check("and unfold when the chart changes", await condOpen());
}

console.log("\nthe aircraft page");
await page.locator(".change").click();
await page.waitForSelector(".fleet .card");
check("every registered aircraft is offered",
      (await page.locator(".fleet .card").count()) === AIRCRAFT.length);
check("the one last checked is marked", (await page.locator(".fleet .card em").count()) === 1);
await page.locator(".fleet .card").first().click();
check("picking one shows the check", (await page.locator(".field input").count()) > 0);

// the two pages are two pages: the system back button returns to the first
await page.goBack();
await page.waitForTimeout(300);
check("and the back button returns to it", (await page.locator(".fleet .card").count()) > 0);
await page.locator(".fleet .card").first().click();
await page.waitForSelector(".field input");
await page.locator(".change").click();
await page.waitForTimeout(300);
check("as does the header control", (await page.locator(".fleet .card").count()) > 0);
await page.locator(".fleet .card").first().click();
await page.waitForSelector(".field input");

console.log("\nthe app installs");
check("a manifest is linked", !!(await page.locator("link[rel=manifest]").getAttribute("href")));
check("no JavaScript errors", errors.length === 0, errors.slice(0, 3).join(" | "));

await browser.close();
console.log(failed ? `\n${failed} failed` : "\nall passed");
process.exit(failed ? 1 : 0);
