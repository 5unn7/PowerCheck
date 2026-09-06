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
/* The app is meant to open with no signal. Anything it asks the network for
   is something it cannot have on the day it matters — a web font was doing
   exactly that until this caught it. */
const fetched = [];
page.on("request", (r) => { if (!r.url().startsWith("file:")) fetched.push(r.url()); });
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

const readable = async (where) => {
  const bad = await contrastFailures();
  check(`every word is readable — ${where}`, bad.length === 0, bad.slice(0, 3).join(" | "));
};

/* Every piece of text on the page against WCAG AA, in whatever state the
   page is in when this is called. Colour carries meaning here — green, amber
   and red are the verdict — and a tone chosen to look quiet on a desk is
   read on a phone on a ramp in daylight. Large text is held to 3:1 and
   everything else to 4.5:1, as the standard has it. */
async function contrastFailures() {
  return page.evaluate(() => {
    const lum = (c) => {
      const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const parse = (s) => (s.match(/[\d.]+/g) || []).slice(0, 4).map(Number);
    const bgOf = (el) => {
      for (let n = el; n; n = n.parentElement) {
        const c = parse(getComputedStyle(n).backgroundColor);
        if (c.length >= 3 && (c[3] === undefined || c[3] > 0)) return c;
      }
      return [255, 255, 255];
    };
    const out = [];
    for (const el of document.querySelectorAll(".wrap *")) {
      if (el.closest("svg")) continue;              // the charts set their own fills
      // a control that is off is meant to read as off, and the standard says so
      if (el.disabled || el.closest("button:disabled, input:disabled")) continue;
      const text = [...el.childNodes]
        .filter((n) => n.nodeType === 3 && n.textContent.trim())
        .map((n) => n.textContent.trim()).join(" ");
      const placeholder = el.tagName === "INPUT" ? el.placeholder : "";
      if (!text && !placeholder) continue;
      const cs = getComputedStyle(el);
      const L1 = lum(parse(cs.color)), L2 = lum(bgOf(el));
      const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      const size = parseFloat(cs.fontSize), weight = Number(cs.fontWeight) || 400;
      const need = size >= 24 || (size >= 18.66 && weight >= 700) ? 3 : 4.5;
      if (ratio < need) out.push(`${(text || placeholder).slice(0, 24)} ${ratio.toFixed(2)}:1`);
    }
    return out;
  });
}

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

console.log("\nthe aircraft page");
await readable("the aircraft page");

for (const air of AIRCRAFT) {
  console.log(`\n${air.label}`);
  await selectAircraft(air);

  /* A greyed example sitting in an empty box reads as a reading that was
     taken, and the crew cannot tell which of the five they still owe. */
  const ghosts = await page.locator(".field input").evaluateAll(
    (els) => els.filter((e) => e.value !== "" || (e.placeholder || "") !== "").length);
  check("no example readings stand in the empty boxes", ghosts === 0);

  const v = air.verify[0];
  await applyConfig(air, v.config || {});
  await enter(air, v);

  check("no off-chart notice for a published example", (await page.locator(".offchart").count()) === 0);
  const margin = (await page.locator(".big span").innerText()).trim();
  check("a margin is shown", /\d/.test(margin), margin);
  const stats = await page.locator(".stats div b").allInnerTexts();
  check("every stat is filled", stats.length > 0 && stats.every((s) => s.trim() !== "—"), stats.join(" / "));
  check("the check can be logged", !(await page.locator(".save .log").isDisabled()));

  /* The card is drawn on a canvas by code of its own, which is how it went
     on drawing every card grey after the page stopped being grey. Draw one
     for real: the button hands the OS a file, and here that is a download. */
  const wanted = page.waitForEvent("download", { timeout: 8000 }).catch(() => null);
  await page.locator(".save .ghost").click();
  const card = await wanted;
  check("the check draws as a shareable card", !!card,
        card ? card.suggestedFilename() : "nothing was produced");

  /* The chart is the walk the crew are checking, so all of it has to be on
     the glass. It used to be drawn 720 units wide inside a 430 pt phone,
     which put the answer — the whole right-hand half — off the screen. */
  const fit = await page.evaluate(() => {
    const svg = document.querySelector("svg.chart"), box = document.querySelector(".chartwrap");
    if (!svg || !box) return null;
    return { chart: svg.getBoundingClientRect().width, panel: box.clientWidth,
             page: document.documentElement.scrollWidth, view: window.innerWidth };
  });
  await readable(`${air.label}, a check that passes`);
  check("the whole chart is on the screen", !!fit && fit.chart <= fit.panel + 1,
        fit ? `${fit.chart.toFixed(0)} of ${fit.panel}px` : "no chart");
  check("and nothing pushes the page sideways", !!fit && fit.page <= fit.view,
        fit ? `${fit.page} of ${fit.view}px` : "");

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
        !/\d/.test(await page.locator(".big span").innerText())
        && (await page.locator(".offchart span").count()) > 0);
  check("and the check cannot be logged", await page.locator(".save .log").isDisabled());
  /* The notice says which reading is off. The box it was typed in says so
     too, so it does not have to be found by reading back up the page. */
  const marked = page.locator(".field.bad");
  await readable(`${air.label}, off the chart`);
  check("and the reading it came from is marked where it was typed",
        (await marked.count()) === 1
        && new RegExp(first.label, "i").test(await marked.locator("span").innerText()),
        (await marked.count()) ? await marked.locator("span").innerText() : "nothing marked");
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
    await page.locator(".save .log").click();
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
  /* A caution band belongs to one type's operator, not to the log. The 212
     publishes none, so none is drawn over its ITT margins. */
  await readable("the log");
  /* A colour named but never defined resolves to none, and the line simply
     is not drawn — which is how the log's grid went missing without a
     single error anywhere. */
  const unpainted = await page.evaluate(() => [...document.querySelectorAll(".wrap [stroke], .wrap [fill]")]
    .filter((el) => ["stroke", "fill"].some((k) => (el.getAttribute(k) || "").includes("var(--")
      && getComputedStyle(el)[k] === "none"))
    .map((el) => el.getAttribute("stroke") || el.getAttribute("fill")));
  check("every colour the log names is a colour that exists",
        unpainted.length === 0, [...new Set(unpainted)].join(" | "));
  check("a type that publishes no caution band gets none drawn",
        (await page.locator('.tchart line[stroke="var(--amber)"]').count()) === 0);
  await page.locator(".tabs .tab", { hasText: "Check" }).click();
  await page.waitForTimeout(200);
}

/* The crew fill in the readings and the last thing they should see is the
   answer in words. Both verdicts, driven through the real UI. */
console.log("\nthe check answers in words, not only in colour");
{
  const b407 = AIRCRAFT.find((a) => a.id === "bell-407");
  await selectAircraft(b407);
  const v = b407.verify[0];
  await applyConfig(b407, v.config || {});
  await enter(b407, v);                                  // 619 against 676 — a pass
  const pass = (await page.locator(".verdict.pass").innerText().catch(() => "")).trim();
  check("a passing check states the verdict", /minimum specification/i.test(pass), pass.slice(0, 58));
  check("and no failure notice is shown", (await page.locator(".verdict.fail").count()) === 0);

  await enter(b407, { ...v, mgt: 760 });                 // over the chart maximum
  await readable("a check that fails");
  const fail = (await page.locator(".verdict.fail").innerText().catch(() => "")).trim();
  check("a failing check states it and names the next step",
        /BHT-407-MM/.test(fail), fail.slice(0, 58));
  check("and no pass notice is shown", (await page.locator(".verdict.pass").count()) === 0);
}

/* ...and the type that does state one has it drawn. Same screen, same
   control, opposite answer — which is the whole of the rule. */
console.log("\nthe log draws only the band the type itself states");
{
  const b407 = AIRCRAFT.find((a) => a.id === "bell-407");
  const v = b407.verify[0];
  await enter(b407, v);
  await page.locator(".save .log").click();
  await page.waitForTimeout(300);
  await page.locator(".tabs .tab", { hasText: "Trend" }).click();
  await page.waitForTimeout(300);
  await page.locator(".wrapseg button", { hasText: /^UNREG$/ }).first().click();
  await page.waitForTimeout(400);
  check("the 407's 10 °C band is drawn on the 407's own line",
        (await page.locator('.tchart line[stroke="var(--amber)"]').count()) > 0);
  check("and every line is offered by name",
        (await page.locator(".wrapseg button").count()) === 3);
}

/* The two drawings are one mechanism, so the switch between them is driven
   rather than assumed: a wider screen gets the wider chart, and it fits too. */
console.log("\nthe chart is drawn for the width it is given");
{
  await page.setViewportSize({ width: 1024, height: 1200 });
  await page.waitForTimeout(300);
  for (const air of AIRCRAFT) {
    await selectAircraft(air);
    await enter(air, air.verify[0]);
    const w = await page.evaluate(() => {
      const svg = document.querySelector("svg.chart"), box = document.querySelector(".chartwrap");
      return { vb: svg.getAttribute("viewBox"), chart: svg.getBoundingClientRect().width,
               panel: box.clientWidth, page: document.documentElement.scrollWidth, view: window.innerWidth };
    });
    check(`${air.label}: the wide screen gets the wide drawing`, w.vb.split(" ")[2] === "720", w.vb);
    check(`${air.label}: and it fits there too`,
          w.chart <= w.panel + 1 && w.page <= w.view, `${w.chart.toFixed(0)} of ${w.panel}px`);
  }
  await page.setViewportSize({ width: 430, height: 1200 });
  await page.waitForTimeout(300);
}

console.log("\nthe app installs");
check("a manifest is linked", !!(await page.locator("link[rel=manifest]").getAttribute("href")));
check("no JavaScript errors", errors.length === 0, errors.slice(0, 3).join(" | "));
check("nothing is fetched over the network", fetched.length === 0, fetched.slice(0, 3).join(" | "));

await browser.close();
console.log(failed ? `\n${failed} failed` : "\nall passed");
process.exit(failed ? 1 : 0);
