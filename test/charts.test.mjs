/* Every chart must reproduce the example printed beside it in the manual, and
   must refuse to answer off its own grid. Run with `npm test`. */

import { AIRCRAFT, byId, checkFor, chartFor, defaultConfig, frameFor,
  checkOptions, seriesKey, seriesLabel } from "../src/aircraft/index.js";
import { statusOf } from "../src/engine/format.js";

// how close a digitised chart has to sit to the manual's own printed answer
/* How close a digitised chart has to sit to the manual's own printed answer.
   chartPsi is the loosest and the reason is the paper: on all three 205A-1
   sheets Bell's own construction line disagrees with Bell's own printed
   number by up to 0.24 PSI. See the note on bell-205a1's verify list. */
const TOLERANCE = { maxMGT: 1, maxITT: 1, setTq: 0.1, maxN1: 0.1, minTq: 0.5, chartPsi: 0.35, default: 1 };

let failed = 0, ran = 0;
const check = (name, ok, detail = "") => {
  ran++;
  if (!ok) { failed++; console.log(`  FAIL  ${name}${detail ? " — " + detail : ""}`); }
  else console.log(`  ok    ${name}${detail ? " — " + detail : ""}`);
};

// an aircraft's readings for a verify case, defaulting anything the case does
// not name (an observed value the expectation does not depend on) to zero
const readingsOf = (aircraft, v) =>
  Object.fromEntries(aircraft.inputs.map((i) => [i.key, v[i.key] ?? 0]));

for (const aircraft of AIRCRAFT) {
  const proc = checkFor(aircraft);
  console.log(`\n${aircraft.label}`);

  console.log(" published examples");
  for (const v of aircraft.verify) {
    const { chart } = chartFor(aircraft, { ...defaultConfig(aircraft), ...v.config });
    const r = proc.compute({ chart, aircraft, ...readingsOf(aircraft, v) });
    for (const [key, want] of Object.entries(v.expect)) {
      const tol = TOLERANCE[key] ?? TOLERANCE.default;
      const got = r[key];
      check(`${v.source} · ${key}`, Math.abs(got - want) <= tol,
            `manual ${want}, app ${got.toFixed(1)}`);
    }
  }

  console.log(" chart data is well formed");
  const asc = (xs) => xs.every((v, i) => i === 0 || xs[i - 1] <= v);
  for (const [variant, d] of Object.entries(aircraft.charts)) {
    if (d.tqK) {
      check(`${variant}: a torque curve per pressure altitude`, d.pa.length === d.tqK.length);
      check(`${variant}: an MGT curve per OAT`, d.oat.length === d.mgtK.length);
      check(`${variant}: pressure altitudes ascend`, asc(d.pa));
      check(`${variant}: OATs ascend`, asc(d.oat));
    }
    if (d.tqCarry) {
      check(`${variant}: a torque curve per pressure altitude`, d.hp.length === d.tqCarry.length);
      check(`${variant}: an ITT curve per OAT`, d.oat.length === d.carryItt.length);
      check(`${variant}: pressure altitudes ascend`, asc(d.hp));
      check(`${variant}: OATs ascend`, asc(d.oat));
      check(`${variant}: every curve ascends in its own x`,
            [...d.tqCarry, ...d.carryItt].every((c) => asc(c.map((p) => p[0]))));
    }
    if (d.paPsi) {
      check(`${variant}: an altitude curve per OAT`, d.oat.length === d.paPsi.length);
      check(`${variant}: OATs ascend`, asc(d.oat));
      check(`${variant}: every curve ascends in altitude`,
            d.paPsi.every((c) => asc(c.map((p) => p[0]))));
      check(`${variant}: the -54 entry repeats the -20 curve, as the sheet draws it`,
            JSON.stringify(d.paPsi[0]) === JSON.stringify(d.paPsi[1]));
      /* Colder air, more power, so a higher pressure is demanded — at every
         altitude where two neighbouring curves are both drawn. */
      check(`${variant}: chart pressure rises as OAT falls`,
            d.paPsi.every((c, i) => {
              if (i < 2) return true;
              const p = d.paPsi[i - 1];
              const lo = Math.max(c[0][0], p[0][0]), hi = Math.min(c[c.length - 1][0], p[p.length - 1][0]);
              if (lo >= hi) return true;
              const at = (cv, x) => cv.reduce((a, q) => (q[0] <= x ? q : a), cv[0])[1];
              return at(c, (lo + hi) / 2) < at(p, (lo + hi) / 2);
            }));
    }
    if (d.oatCarry) {
      check(`${variant}: an OAT curve per TOT`, d.tot.length === d.oatCarry.length);
      check(`${variant}: a torque curve per pressure altitude`, d.hp.length === d.carryTq.length);
      check(`${variant}: TOTs ascend`, asc(d.tot));
      check(`${variant}: pressure altitudes ascend`, asc(d.hp));
      check(`${variant}: every curve ascends in its own x`,
            [...d.oatCarry, ...d.carryTq].every((c) => asc(c.map((p) => p[0]))));
      /* Both carpets have to run the same way for every curve, or an
         interpolation between two of them crosses a third. */
      check(`${variant}: carry rises with TOT at a shared OAT`,
            d.oatCarry.every((c, i) => {
              if (i === 0) return true;
              const p = d.oatCarry[i - 1];
              const lo = Math.max(c[0][0], p[0][0]), hi = Math.min(c[c.length - 1][0], p[p.length - 1][0]);
              if (lo >= hi) return true;
              const at = (cv, x) => cv.reduce((a, q) => (q[0] <= x ? q : a), cv[0])[1];
              return at(c, (lo + hi) / 2) > at(p, (lo + hi) / 2);
            }));
      check(`${variant}: minimum torque falls as altitude rises`,
            d.carryTq.every((c, i) => {
              if (i === 0) return true;
              const p = d.carryTq[i - 1];
              const lo = Math.max(c[0][0], p[0][0]), hi = Math.min(c[c.length - 1][0], p[p.length - 1][0]);
              if (lo >= hi) return true;
              const at = (cv, x) => cv.reduce((a, q) => (q[0] <= x ? q : a), cv[0])[1];
              return at(c, (lo + hi) / 2) < at(p, (lo + hi) / 2);
            }));
    }
    if (d.torque) {
      check(`${variant}: a torque for every pressure altitude`, d.torque.pa.length === d.torque.tq.length);
      check(`${variant}: an N1 and an ITT for every OAT`,
            d.limits.oat.length === d.limits.n1.length && d.limits.oat.length === d.limits.itt.length);
      check(`${variant}: pressure altitudes ascend`, asc(d.torque.pa));
      check(`${variant}: OATs ascend`, asc(d.limits.oat));
    }
  }

  console.log(" refuses to answer off the chart");
  const base = aircraft.verify[0] || aircraft.sample;
  const { chart } = chartFor(aircraft, { ...defaultConfig(aircraft), ...(base.config || {}) });
  const on = readingsOf(aircraft, base);
  check("a reading on the chart is accepted", proc.offChart({ chart, ...on }).length === 0);
  for (const i of aircraft.inputs) {
    for (const bad of [1e6, -1e6]) {
      check(`${i.key} = ${bad > 0 ? "far high" : "far low"}`,
            proc.offChart({ chart, ...on, [i.key]: bad }).length > 0);
    }
  }
}

/* The bug the gate was built for: the 407's interpolation ran off the end of
   the torque curve and read generous, not conservative. */
{
  const air = AIRCRAFT.find((a) => a.id === "bell-407");
  const proc = checkFor(air);
  const { chart } = chartFor(air, defaultConfig(air));
  const wild = proc.compute({ chart, aircraft: air, oat: 10, pa: 6000, tq: 700, mgt: 600 });
  console.log("\nthe reason the gate exists");
  check("extrapolating torque would have read generous", wild.margin > 1000,
        `withheld margin would have been +${wild.margin.toFixed(0)} °C`);
}

/* A trend line may only join the same measurement of the same thing. The
   212's check is run one engine at a time and logged per engine, and the
   failure is silent, so it is asserted rather than trusted. */
console.log("\nthe log never joins two different checks");
{
  const at = (aircraftId, config, reg = "9M-ABC") => ({ aircraft: aircraftId, reg, config });

  check("engine 1 and engine 2 are different lines",
        seriesKey(at("bell-212-pt6t3", { engine: "1" }))
          !== seriesKey(at("bell-212-pt6t3", { engine: "2" })));
  check("two checks on the same engine are one line",
        seriesKey(at("bell-212-pt6t3", { engine: "1" }))
          === seriesKey(at("bell-212-pt6t3", { engine: "1" })));
  check("a different tail is a different line",
        seriesKey(at("bell-212-pt6t3", { engine: "1" }, "9M-XYZ"))
          !== seriesKey(at("bell-212-pt6t3", { engine: "1" })));

  // a fitted change is a step in one engine's life, not a different engine
  check("changing what is fitted does not split the line",
        seriesKey(at("bell-407", { inlet: "basic", snow: false }))
          === seriesKey(at("bell-407", { inlet: "ps", snow: true })));

  // logged before the option existed: its own group, not merged into a guess
  check("a check missing a check-scope value stands apart",
        seriesKey(at("bell-212-pt6t3", {})) !== seriesKey(at("bell-212-pt6t3", { engine: "1" })));
  check("and says so", seriesLabel(at("bell-212-pt6t3", {})).includes("not recorded"));

  check("the label names the tail and what was measured",
        seriesLabel(at("bell-212-pt6t3", { engine: "2" })) === "9M-ABC · Engine 2");

  /* Only what a manual itself distinguishes may be a check-scope option.
     The 407's chart is headed "hover or level flight" — one check, either
     way of flying it — so nothing about the 407 splits its trend. */
  console.log("\nonly what the manual distinguishes");
  check("the 407 has no check-scope option — its chart covers hover and level flight",
        checkOptions(byId("bell-407")).length === 0);
  for (const a of AIRCRAFT) {
    check(`${a.label}: every check-scope option has a legal default`,
          checkOptions(a).every((o) =>
            o.type !== "segmented" || o.choices.some((c) => c.id === o.default)));
  }
}

/* One aircraft's data must never reach another's screen. Scales, dials and
   thresholds are per type — a margin in °C of MGT off a 407 nomogram and a
   margin in °C of ITT off a 212 table are not the same quantity, and a
   shared default is how one silently gets drawn on the other's axes. */
console.log("\nnothing is shared between types");
{
  const seen = new Map();
  for (const a of AIRCRAFT) {
    check(`${a.label}: states its own chart axes`, !!frameFor(a));
    check(`${a.label}: states its own dial range`,
          Array.isArray(a.gauge) && a.gauge.length === 2 && a.gauge[0] < 0 && a.gauge[1] > 0);
    check(`${a.label}: names its own margin unit and label`,
          !!a.marginLabel && !!a.marginUnit);

    for (const [k, v] of [["frame", frameFor(a)], ["gauge", a.gauge]]) {
      const other = seen.get(k);
      check(`${a.label}: its ${k} is its own object, not another type's`,
            !other || other.obj !== v, other ? `also held by ${other.label}` : "");
      if (!other) seen.set(k, { obj: v, label: a.label });
    }

    // every chart must say which revision it was digitised from, or say it cannot
    for (const [variant, m] of Object.entries(a.meta)) {
      check(`${a.label} · ${variant}: records the manual revision, or records that it does not`,
            "rev" in m, m.rev || "not recorded");
    }
  }

  /* The check answers one question and answers it with a number.

     An engineer reading fig 4-1 by hand draws two lines, takes a figure off
     the axis and compares it to the gauge. They do not get a paragraph with
     it. So no aircraft may carry verdict prose, advice on what to do next, or
     a band that turns "met the chart" into something softer — and no type may
     grow one later without this failing. */
  for (const a of AIRCRAFT) {
    for (const k of ["passNote", "failNote", "watchNote", "watchBelow"]) {
      check(`${a.label}: carries no ${k}`, a[k] === undefined);
    }
    const { chart } = chartFor(a, defaultConfig(a));
    const r = checkFor(a).compute({ chart, aircraft: a, ...readingsOf(a, a.verify[0] || a.sample) });
    check(`${a.label}: its check says nothing in words either`,
          Array.isArray(r.notes) && r.notes.length === 0);
  }
  check("meeting the chart figure exactly is green", statusOf(0).key === "ok");
  check("over it is green", statusOf(50).key === "ok");
  check("under it is red", statusOf(-0.1).key === "fail");
  check("there is no third state between them",
        [0, 0.1, 5, 50].every((m) => statusOf(m).key === "ok"));
  check("no reading at all is neither", statusOf(NaN).key === "none");
  check("and the status is a colour with nothing to read",
        [NaN, -5, 0, 50].every((m) => Object.keys(statusOf(m)).join() === "key,color,hex"));
}

/* Two of the 206L4's three charts print no worked example, so they are proved
   a different way: against each other, and against physics the manual states.
   Every kit bolted to the inlet costs power, so at the same OAT, TOT and
   pressure altitude the torque a healthy engine must demonstrate can only
   fall as more is fitted. Three charts traced independently, from three
   separate plates, agreeing on that ordering everywhere is not something a
   mis-identified curve survives. */
console.log("\nthe 206L4 inlet kits cost power, in the right order");
{
  const air = byId("bell-206l4");
  const proc = checkFor(air);
  const at = (kit, oat, tot, pa) => {
    const { chart } = chartFor(air, { kit });
    if (proc.offChart({ chart, oat, tot, pa, tq: 70 }).length) return null;
    return proc.compute({ chart, aircraft: air, oat, tot, pa, tq: 70 }).minTq;
  };
  const cases = [[25, 720, 12000], [20, 740, 8000], [10, 680, 4000], [0, 700, 6000],
                 [30, 740, 10000], [-10, 660, 8000], [15, 700, 2000]];
  let compared = 0, ordered = 0;
  for (const [oat, tot, pa] of cases) {
    const b = at("basic", oat, tot, pa), s1 = at("snow", oat, tot, pa), s2 = at("snowps", oat, tot, pa);
    if (b !== null && s1 !== null) { compared++; if (s1 < b) ordered++; }
    if (s1 !== null && s2 !== null) { compared++; if (s2 < s1) ordered++; }
  }
  check("every comparable point is ordered basic > snow deflector > snow + particle separator",
        compared >= 8 && ordered === compared, `${ordered}/${compared} ordered`);
  const b = at("basic", 25, 720, 12000), s1 = at("snow", 25, 720, 12000), s2 = at("snowps", 25, 720, 12000);
  check("and the steps are the size a kit costs, not a mislabelled curve",
        b - s1 > 2 && b - s1 < 15 && s1 - s2 > 0.5 && s1 - s2 < 8,
        `basic ${b.toFixed(1)} -> snow ${s1.toFixed(1)} -> snow+PS ${s2.toFixed(1)}`);
  /* The hot end of the TOT family is 760 and 768 -- eight degrees apart where
     every other step is twenty. That tight last pair is what fixes the whole
     ladder on a sheet with no printed answer: count in from it and every
     label is forced. */
  for (const v of ["snow", "snowps"]) {
    const d = air.charts[v];
    const n = d.tot.length;
    check(`${v}: the TOT ladder ends on the 760/768 pair`,
          d.tot[n - 1] === 768 && d.tot[n - 2] === 760 && d.tot[n - 3] === 740);
    const mid = (c) => c[Math.floor(c.length / 2)][0];
    const gaps = d.oatCarry.map(mid).map((v2, i, a) => (i ? v2 - a[i - 1] : null)).slice(1);
    const last = gaps[gaps.length - 1], typical = gaps[Math.floor(gaps.length / 2)];
    check(`${v}: and that pair sits closer than a twenty-degree step`,
          last < typical * 0.7, `last ${last.toFixed(2)} vs typical ${typical.toFixed(2)} °C`);
  }
}

/* Figure 4-1 prints no worked example anywhere in Section 4, so the PT6T-3B
   charts are held to what the drawing itself has to be true of. Both signatures
   below are the ones that fixed a misreading during tracing, so both are worth
   keeping: a label set that does not satisfy them is a label set that was read
   wrong. */
console.log("\nthe PT6T-3B fans are shaped the way the sheet draws them");
{
  const air = byId("bell-212-pt6t3b");
  const proc = checkFor(air);
  for (const v of ["hover", "inflight"]) {
    const d = air.charts[v];
    const at = (c, x) => c.reduce((a, q) => (q[0] <= x ? q : a), c[0])[1];

    /* The altitude fan is labelled −1000, 0, 2000, 4000, 6000, 8000, 10,000 —
       the first step is 1000 ft where every other is 2000, and it took a crop
       at magnification to see the minus sign. So the first gap must come out
       roughly half the rest, and if it ever does not, the labels are wrong. */
    check(`${v}: the altitude fan starts below sea level`,
          d.hp[0] === -1000 && d.hp[1] === 0 && d.hp[2] === 2000 && d.hp.length === 7);
    const carr = d.tqCarry.map((c) => at(c, 50));
    const gaps = carr.map((x, i) => (i ? carr[i - 1] - x : null)).slice(1);
    check(`${v}: and its first step is about half the others, as 1000 ft to 2000 ft must be`,
          gaps[0] > 0.3 * gaps[1] && gaps[0] < 0.75 * gaps[1],
          `first ${gaps[0].toFixed(2)} vs next ${gaps[1].toFixed(2)}`);
    check(`${v}: carry falls as altitude rises`, gaps.every((g) => g > 0));

    /* The OAT fan is ten curves at 10 °C, of which nine are solid ink and the
       hottest is dashed; the nine that are here must step evenly in ITT. */
    check(`${v}: nine OAT curves, −50 through +30`,
          d.oat.length === 9 && d.oat[0] === -50 && d.oat[8] === 30);
    const itts = d.carryItt.filter((c) => c[0][0] <= 20 && c[c.length - 1][0] >= 20).map((c) => at(c, 20));
    const steps = itts.map((x, i) => (i ? x - itts[i - 1] : null)).slice(1);
    check(`${v}: allowable ITT rises with OAT, evenly`,
          steps.length >= 6 && steps.every((t) => t > 20 && t < 42),
          steps.map((t) => t.toFixed(0)).join(" "));
  }
  /* More torque is more power, so the chart must allow more heat for it. */
  const itt = (v, tq, pa, oat) => {
    const { chart } = chartFor(air, { flight: v, engine: "1" });
    if (proc.offChart({ chart, tq, pa, oat, itt: 700 }).length) return null;
    return proc.compute({ chart, aircraft: air, tq, pa, oat, itt: 700 }).maxITT;
  };
  const rising = [50, 55, 60].map((t) => itt("hover", t, 0, -20));
  check("more torque allows more ITT", rising.every((x, i) => i === 0 || x > rising[i - 1]),
        rising.map((x) => x && x.toFixed(0)).join(" -> "));
  const warmer = [-20, -10, 0].map((o) => itt("hover", 55, 0, o));
  check("and so does a warmer day", warmer.every((x, i) => i === 0 || x > warmer[i - 1]),
        warmer.map((x) => x && x.toFixed(0)).join(" -> "));
  /* Hover and in-flight are different data, and must not have been traced onto
     each other. */
  const h = itt("hover", 58, 2000, 10), f = itt("inflight", 58, 2000, 10);
  check("hover and in-flight are different charts", h !== f && Math.abs(h - f) < 25,
        `${h.toFixed(0)} vs ${f.toFixed(0)}`);
}

/* The 407 avoid area came from the source template, not from this app, and
   the template holds a cached value to check against. */
console.log("\nthe avoid area is recorded, and inert");
{
  const air = byId("bell-407");
  // Powercheck_407_v2.2.xlsx, sheet "Tq-pA" cell A72, with OAT 12 on the
  // Powercheck sheet: TREND through (-32.5, 0) and (46, 12.25)
  check("kMin at OAT 12 reproduces the workbook to the digit",
        Math.abs(air.kMin(12) - 6.944267515923567) < 1e-12, String(air.kMin(12)));
  check("it withholds nothing — a reading below it still gets its number",
        Number.isFinite(checkFor(air).compute({
          chart: chartFor(air, defaultConfig(air)).chart, aircraft: air,
          oat: 19, pa: 2000, tq: 60, mgt: 692,
        }).margin));
  check("and says nothing about itself to the crew",
        AIRCRAFT.every((a) => a.kMinNote === undefined));
  check("the two points it is drawn through are recorded on the aircraft",
        JSON.stringify(air.avoidArea) === JSON.stringify([[-32.5, 0], [46, 12.25]]));
  check("it passes through both of them",
        Math.abs(air.kMin(-32.5) - 0) < 1e-12 && Math.abs(air.kMin(46) - 12.25) < 1e-12);
  check("and it rises with OAT, so a hot day needs more torque to be readable",
        air.kMin(40) > air.kMin(0) && air.kMin(0) > air.kMin(-30));
}

/* What reaches the crew's eyes must be something a manual uses. K is the
   normalised ordinate of the nomogram and appears in none of them. */
console.log("\nthe screen shows only what a manual would recognise");
{
  for (const a of AIRCRAFT) {
    const { chart } = chartFor(a, defaultConfig(a));
    const v = a.verify[0] || a.sample;
    const r = checkFor(a).compute({ chart, aircraft: a, ...readingsOf(a, v) });
    const labels = r.stats.map((s) => s.label);
    check(`${a.label}: no digitising artefact on screen — ${labels.join(", ")}`,
          !labels.some((l) => /\bK\b|k factor|ordinate/i.test(l)));
    check(`${a.label}: every stat carries its unit`,
          r.stats.every((s) => /°C|%|ft|PSI/.test(s.label)));
  }
  const b407 = byId("bell-407");
  const { chart } = chartFor(b407, defaultConfig(b407));
  const r = checkFor(b407).compute({ chart, aircraft: b407, oat: 10, pa: 6000, tq: 70, mgt: 600 });
  check("the 407 shows the two numbers 4-2 compares",
        r.stats.map((s) => s.label).join(" | ") === "Chart MGT °C | Actual MGT °C");
  check("and K is still computed, because the chart is drawn from it",
        Number.isFinite(r.K));
}

console.log(`\n${ran - failed}/${ran} passed`);
process.exit(failed ? 1 : 0);
