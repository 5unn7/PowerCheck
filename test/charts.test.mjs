/* Every chart must reproduce the example printed beside it in the manual, and
   must refuse to answer off its own grid. Run with `npm test`. */

import { AIRCRAFT, byId, checkFor, chartFor, defaultConfig, frameFor,
  checkOptions, seriesKey, seriesLabel } from "../src/aircraft/index.js";
import { statusOf } from "../src/engine/format.js";

// how close a digitised chart has to sit to the manual's own printed answer
const TOLERANCE = { maxMGT: 1, maxITT: 1, setTq: 0.1, maxN1: 0.1, default: 1 };

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
    if (d.torque) {
      check(`${variant}: a torque for every pressure altitude`, d.torque.pa.length === d.torque.tq.length);
      check(`${variant}: an N1 and an ITT for every OAT`,
            d.limits.oat.length === d.limits.n1.length && d.limits.oat.length === d.limits.itt.length);
      check(`${variant}: pressure altitudes ascend`, asc(d.torque.pa));
      check(`${variant}: OATs ascend`, asc(d.limits.oat));
    }
  }

  console.log(" refuses to answer off the chart");
  const { chart } = chartFor(aircraft, defaultConfig(aircraft));
  const on = readingsOf(aircraft, aircraft.verify[0]);
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

/* Which engine is installed never changes an answer — one chart serves all
   three models wherever it covers them — but it decides whether a chart
   applies. A configuration with no chart must say so, never go blank. */
console.log("\nno configuration reads a chart that does not name it");
{
  const air = byId("bell-407");
  const proc = checkFor(air);
  const ENGINES = ["c47b", "c47b8", "c47e4"];
  const reading = { oat: 10, pa: 6000, tq: 70, mgt: 600 };

  for (const engine of ENGINES) {
    for (const inlet of ["basic", "ps"]) {
      for (const snow of [false, true]) {
        const config = { engine, inlet, snow };
        const { chart } = chartFor(air, config);
        const why = air.noChart(config);
        check(`${engine} · ${inlet}${snow ? " · snow" : ""}: a chart, or a reason`,
              !!chart !== !!why, chart ? "chart" : why ? "refused with a reason" : "BLANK");
      }
    }
  }

  check("the C47E/4 is refused on the basic inlet — FM-1 does not name it",
        !chartFor(air, { engine: "c47e4", inlet: "basic", snow: false }).chart);
  check("and the reason names the page",
        /FM-1/.test(air.noChart({ engine: "c47e4", inlet: "basic", snow: false })));
  check("the C47E/4 reads FMS-3 with a particle separator",
        chartFor(air, { engine: "c47e4", inlet: "ps", snow: false }).variant === "ps");
  check("and FMS-4 with snow deflectors",
        chartFor(air, { engine: "c47e4", inlet: "basic", snow: true }).variant === "psb");

  // where a chart does cover the model, the model must not move the number
  for (const inlet of ["ps"]) {
    const mgts = ENGINES.map((engine) => {
      const { chart } = chartFor(air, { engine, inlet, snow: false });
      return proc.compute({ chart, aircraft: air, ...reading }).maxMGT;
    });
    check(`the engine model does not change the ${inlet} answer`,
          mgts.every((m) => Math.abs(m - mgts[0]) < 1e-9), mgts.map((m) => m.toFixed(1)).join(" / "));
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

  /* A judgement band belongs to one manual. Neither of ours publishes one,
     so neither may carry one — and no shared default may fill the gap. */
  for (const a of AIRCRAFT) {
    check(`${a.label}: invents no margin threshold`, a.watchBelow === undefined);
    check(`${a.label}: a positive margin is not called serviceable`,
          statusOf(50, a).label === "");
    check(`${a.label}: a negative margin states the fact`,
          statusOf(-5, a).label === "Over the chart maximum");
  }
}

console.log(`\n${ran - failed}/${ran} passed`);
process.exit(failed ? 1 : 0);
