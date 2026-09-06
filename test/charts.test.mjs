/* Every chart must reproduce the example printed beside it in the manual, and
   must refuse to answer off its own grid. Run with `npm test`. */

import { AIRCRAFT, byId, procedureFor, chartFor, defaultConfig,
  checkOptions, seriesKey, seriesLabel } from "../src/aircraft/index.js";

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
  const proc = procedureFor(aircraft);
  console.log(`\n${aircraft.label} (${aircraft.procedure})`);

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
  const proc = procedureFor(air);
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

console.log(`\n${ran - failed}/${ran} passed`);
process.exit(failed ? 1 : 0);
