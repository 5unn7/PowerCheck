/* Every chart must reproduce the example printed beside it in the manual,
   and must refuse to answer off its own grid. Run with `npm test`. */

import { AIRCRAFT, procedureFor, chartFor, defaultConfig } from "../src/aircraft/index.js";

let failed = 0, ran = 0;
const check = (name, ok, detail = "") => {
  ran++;
  if (!ok) { failed++; console.log(`  FAIL  ${name}${detail ? " — " + detail : ""}`); }
  else console.log(`  ok    ${name}${detail ? " — " + detail : ""}`);
};

for (const aircraft of AIRCRAFT) {
  const proc = procedureFor(aircraft);
  console.log(`\n${aircraft.label} (${aircraft.procedure})`);

  console.log(" published examples");
  for (const v of aircraft.verify) {
    const { chart } = chartFor(aircraft, { ...defaultConfig(aircraft), ...v.config });
    const r = proc.compute({ chart, aircraft, oat: v.oat, pa: v.pa, tq: v.tq, mgt: 0 });
    const off = Math.abs(r.maxMGT - v.maxMGT);
    check(v.source, off <= 1, `manual ${v.maxMGT}, app ${r.maxMGT.toFixed(1)} (${off.toFixed(1)} off)`);
  }

  console.log(" chart data is well formed");
  for (const [variant, d] of Object.entries(aircraft.charts)) {
    check(`${variant}: a torque curve per pressure altitude`, d.pa.length === d.tqK.length);
    check(`${variant}: an MGT curve per OAT`, d.oat.length === d.mgtK.length);
    const asc = (xs) => xs.every((v, i) => i === 0 || xs[i - 1] <= v);
    check(`${variant}: pressure altitudes ascend`, asc(d.pa));
    check(`${variant}: OATs ascend`, asc(d.oat));
  }

  console.log(" refuses to answer off the chart");
  const { chart } = chartFor(aircraft, defaultConfig(aircraft));
  const ax = proc.axes(chart);
  const on = { oat: 10, pa: 6000, tq: 70, mgt: 600 };
  check("a reading on the chart is accepted", proc.offChart({ chart, ...on }).length === 0);
  const cases = [
    ["torque far high", { ...on, tq: 700 }],
    ["torque far low", { ...on, tq: 7 }],
    ["MGT far low", { ...on, mgt: 60 }],
    ["OAT above the grid", { ...on, oat: ax.oat[1] + 1 }],
    ["OAT below the grid", { ...on, oat: ax.oat[0] - 1 }],
    ["pressure altitude above the grid", { ...on, pa: ax.pa[1] + 1 }],
    ["pressure altitude below the grid", { ...on, pa: ax.pa[0] - 1 }],
  ];
  for (const [name, inputs] of cases) check(name, proc.offChart({ chart, ...inputs }).length > 0);

  // the reason the gate exists: extrapolation reads generous, not conservative
  const wild = proc.compute({ chart, aircraft, ...on, tq: 700 });
  check("extrapolation would have read generous", wild.margin > 1000,
        `withheld margin would have been +${wild.margin.toFixed(0)} °C`);
}

console.log(`\n${ran - failed}/${ran} passed`);
process.exit(failed ? 1 : 0);
