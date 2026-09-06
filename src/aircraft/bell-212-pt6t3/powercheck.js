import { interp, span } from "../../engine/interp.js";
import { densityAlt } from "../../engine/atmosphere.js";
import { fmt } from "../../engine/format.js";

/* ===================== set a torque, read two limits =====================

   The ground power assurance check printed as a pair of tables rather than a
   nomogram — BHT-212VFR-FM-1 fig 4-2 for the PT6T-3. Pressure altitude gives
   a torque to stabilise at; OAT gives the gas producer speed and turbine
   temperature that torque must not exceed. Two limits, so two margins.

   A chart is two tables:

     torque  { pa[], tq[] }              pressure altitude -> torque to set
     limits  { oat[], n1[], itt[] }      OAT -> max N1 % RPM and max ITT °C

   ITT margin is the headline: it is in °C, it is what trends as an engine
   deteriorates, and it is the same quantity the 407 reports. N1 is checked
   alongside it, and a gas producer over its limit fails the check on its own
   however much room ITT has.                                              */


export function compute({ chart: d, aircraft, oat, pa, n1, itt }) {
  const setTq = interp(d.torque.pa.map((p, i) => [p, d.torque.tq[i]]), pa);
  const maxN1 = interp(d.limits.oat.map((o, i) => [o, d.limits.n1[i]]), oat);
  const maxITT = interp(d.limits.oat.map((o, i) => [o, d.limits.itt[i]]), oat);

  const margin = maxITT - itt;
  const n1Margin = maxN1 - n1;

  const notes = [];
  if (n1Margin < 0) {
    notes.push(`Gas producer ${fmt(n1, 1)}% is over the ${fmt(maxN1, 1)}% allowed at this OAT — the check fails on N1 whatever the ITT margin.`);
  } else if (n1Margin < 0.5) {
    notes.push(`Gas producer is within ${fmt(n1Margin, 1)}% of the ${fmt(maxN1, 1)}% limit.`);
  }

  return {
    setTq, maxN1, maxITT, margin, n1Margin, da: densityAlt(pa, oat),  // fig 4-3 is this type's own chart
    stats: [
      { label: "Set torque %", value: fmt(setTq, 1) },
      { label: "Max ITT °C", value: fmt(maxITT, 0) },
      { label: "N1 margin %", value: (n1Margin > 0 ? "+" : "") + fmt(n1Margin, 1) },
    ],
    notes,
  };
}

const AXES = new WeakMap();
export function axes(d) {
  if (AXES.has(d)) return AXES.get(d);
  const a = {
    pa: span(d.torque.pa),
    oat: span(d.limits.oat),
    itt: span(d.limits.itt),
    n1: span(d.limits.n1),
  };
  AXES.set(d, a);
  return a;
}

/* Pressure altitude and OAT are read off the tables, so the tables bound them.

   ITT and N1 are measurements compared against those limits, not lookups, so
   they bound nothing — their guards catch a mistyped reading instead. They run
   well below the coldest published limit, because a healthy engine on a cold
   day reads under it, and stop at the hottest published limit, above which a
   reading is either a typo or an exceedance the flight manual governs rather
   than this app. A reading that is merely over the limit for the day is a real
   failed check and still gets its negative margin. */
const OBSERVED_SLACK = { itt: 150, n1: 15 };

export function offChart({ chart: d, oat, pa, n1, itt }) {
  const ax = axes(d);
  const out = [];
  const r0 = (v) => Math.round(v);
  if (Number.isFinite(pa) && (pa < ax.pa[0] || pa > ax.pa[1]))
    out.push(`Pressure altitude ${fmt(pa, 0)} ft is off the table — it runs ${ax.pa[0]} to ${ax.pa[1]} ft.`);
  if (Number.isFinite(oat) && (oat < ax.oat[0] || oat > ax.oat[1]))
    out.push(`OAT ${fmt(oat, 0)} °C is off the table — it runs ${ax.oat[0]} to ${ax.oat[1]} °C.`);
  if (Number.isFinite(itt) && (itt < ax.itt[0] - OBSERVED_SLACK.itt || itt > ax.itt[1]))
    out.push(`ITT ${fmt(itt, 0)} °C is not a plausible reading for this check — the table's limits run ${r0(ax.itt[0])} to ${r0(ax.itt[1])} °C.`);
  if (Number.isFinite(n1) && (n1 < ax.n1[0] - OBSERVED_SLACK.n1 || n1 > ax.n1[1]))
    out.push(`Gas producer ${fmt(n1, 1)}% is not a plausible reading — the table's limits run ${fmt(ax.n1[0], 1)} to ${fmt(ax.n1[1], 1)}%.`);
  return out;
}
