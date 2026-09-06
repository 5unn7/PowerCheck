import { interp, bracket, span, clamp } from "../../engine/interp.js";
import { fmt } from "../../engine/format.js";

/* ============================ torque -> K -> MGT ============================

   The chart walk printed in BHT-407-FM-1 fig 4-1 and its supplements, and in
   the equivalent page for other Rolls-Royce 250 powered types: torque and
   pressure altitude give a K factor, K and OAT give the maximum MGT the
   engine should be making, and the margin is that maximum less what it made.

   A chart is four arrays:

     pa    ascending pressure altitudes, one per torque curve
     tqK   for each pa, the curve as [torque %, K] points
     oat   ascending outside air temperatures, one per MGT curve
     mgtK  for each oat, the curve as [max MGT °C, K] points

   An aircraft using a different walk — Ng and TOT, say — is a different
   own powercheck.js, not a variation of this one. It supplies the same four
   exports and the app does not need to know the difference.            */

/* No default frame lives here. The axes a chart is drawn on are that
   chart's, and a second aircraft on this same walk would silently inherit
   the 407's scales if this module carried them. Each aircraft states its
   own, and the test suite requires it. */

/* --------------------------- reading the chart --------------------------- */

/* No density altitude here. BHT-407-FM-1 fig 4-1 is walked on *pressure*
   altitude and does not use it, and the standard-atmosphere model that would
   produce it was checked against the 212's own fig 4-3 — another type's
   chart, which is not evidence about this one. */
/* The stats this check reports, in order. Declared rather than discovered,
   so an empty form can be drawn without running the chart at all. */
export const statLabels = ["Chart MGT °C", "Actual MGT °C"];

export function compute({ chart: d, aircraft, oat, pa, tq, mgt }) {
  const K = interp(d.pa.map((p, i) => [p, interp(d.tqK[i], tq)]), pa);
  const maxMGT = interp(d.oat.map((o, i) => [o, interp(d.mgtK[i], K, 1, 0)]), oat);
  const kMin = aircraft.kMin(oat);
  return {
    K, maxMGT, kMin, margin: maxMGT - mgt,
    /* The two numbers 4-2 compares: "If actual MGT is less than or equal to
       chart MGT…". K is not among them — it is the normalised ordinate of
       the nomogram, an artefact of digitising that appears in no manual, and
       a crew looking for it would not find it. It stays in the result
       because the chart is drawn from it, and off the screen. */
    stats: [
      { label: "Chart MGT °C", value: fmt(maxMGT, 0) },
      { label: "Actual MGT °C", value: fmt(mgt, 0) },
    ],
    /* The aircraft supplies the wording, because it has to say whose rule
       this is, and that differs by type. */
    notes: K < kMin
      ? [`${fmt(K, 1)} is below the ${fmt(kMin, 1)} cut-off for this OAT — no margin reported. `
         + (aircraft.kMinNote || "")]
      : [],
  };
}

/* -------------------------- staying on the chart --------------------------

   interp keeps going past the ends of a curve, and it goes optimistic:
   torque typed as 700 instead of 70 reads a confident +3381 C margin. The
   printed grid is the domain, and it is read from the chart data so that
   re-digitising a chart moves the bounds with it.                        */

const AXES = new WeakMap();
export function axes(d) {
  if (AXES.has(d)) return AXES.get(d);
  const a = {
    oat: [d.oat[0], d.oat[d.oat.length - 1]],
    pa: [d.pa[0], d.pa[d.pa.length - 1]],
    mgt: span(d.mgtK.flat().map((q) => q[0])),
  };
  AXES.set(d, a);
  return a;
}

/* The torque a chart covers depends on pressure altitude — the high curves
   stop well short of 100% — and only the two curves bracketing pa are read,
   so the usable span is the part both of them cover. */
export function tqSpanAt(d, pa) {
  const ax = axes(d);
  const [i, j] = bracket(d.pa, clamp(pa, ax.pa[0], ax.pa[1]));
  const a = span(d.tqK[i].map((q) => q[0])), b = span(d.tqK[j].map((q) => q[0]));
  return [Math.max(a[0], b[0]), Math.min(a[1], b[1])];
}

/* [] when every reading sits on the chart, otherwise one plain sentence
   per reading that does not. */
export function offChart({ chart: d, oat, pa, tq, mgt }) {
  const ax = axes(d);
  const out = [];
  const r0 = (v) => Math.round(v);
  if (Number.isFinite(oat) && (oat < ax.oat[0] || oat > ax.oat[1]))
    out.push(`OAT ${fmt(oat, 0)} °C is off the chart — it is drawn for ${ax.oat[0]} to ${ax.oat[1]} °C.`);
  if (Number.isFinite(pa) && (pa < ax.pa[0] || pa > ax.pa[1]))
    out.push(`Pressure altitude ${fmt(pa, 0)} ft is off the chart — it is drawn for ${ax.pa[0]} to ${ax.pa[1]} ft.`);
  const paOnChart = Number.isFinite(pa) && pa >= ax.pa[0] && pa <= ax.pa[1];
  if (Number.isFinite(tq) && paOnChart) {
    const [lo, hi] = tqSpanAt(d, pa);
    if (tq < lo || tq > hi)
      out.push(`Torque ${fmt(tq, 1)}% is off the chart — at this pressure altitude it is drawn for ${r0(lo)} to ${r0(hi)}%.`);
  }
  if (Number.isFinite(mgt) && (mgt < ax.mgt[0] || mgt > ax.mgt[1]))
    out.push(`MGT ${fmt(mgt, 0)} °C is outside the chart's ${r0(ax.mgt[0])} to ${r0(ax.mgt[1])} °C scale — check the reading.`);
  return out;
}

