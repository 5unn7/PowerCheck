import { interp, span } from "../../engine/interp.js";
import { fmt } from "../../engine/format.js";

/* ============== torque and altitude in, allowable ITT out ==============

   BHT-212VFR-FM-1 fig 4-1, the PT6T-3B sheets. The walk is printed on each:

     "Enter chart at indicated engine torque, move up to intersect Hp, proceed
      to right to intersect OAT, then move up to read values for maximum
      allowable ITT and gas prod (N1) RPM."

   Two carpets sharing a carry, like the 206L-4's, but entered from the bottom
   rather than the side. Torque and pressure altitude give the carry; the carry
   and OAT give the maximum allowable ITT. Margin is that less the ITT the
   engine actually made, in °C — the same quantity the PT6T-3's ground check
   reports, read off a nomogram instead of a table.

   The gas producer half of the sheet is not carried. The N1 fan is 580 px wide
   for twenty percent of scale, so its curves sit about 29 px apart against a
   tracking tolerance of 4.5 — a quarter of the separation the ITT fan has —
   and two of the four plates come back with it broken by the BLEED VALVE OPENS
   boundary. Ruled out of scope by the operator's licensed engineer rather than
   shipped unproven. It is also what makes the gas producer gage part number
   irrelevant here: that gage changes the N1 scale and nothing else, which is
   why the two −101 sheets and the two −113 sheets reduce to one hover chart
   and one in-flight chart.

   A chart is:

     hp[]        the pressure altitude each bottom-carpet curve is drawn for
     tqCarry[]   one curve each, [indicated torque %, carry]
     oat[]       the ambient temperature each top-carpet curve is drawn for
     carryItt[]  one curve each, [carry, maximum allowable ITT °C]

   The carry is the plot's own vertical axis, unlabelled on the page, in units
   of one torque-scale percent up from the bottom frame. It means nothing on
   its own.

   Every curve is stored only over the extent it was traced, and that is the
   whole of the gate. It is not a rectangle: the altitude curves stop where the
   check's own 63.9% torque ceiling and the BLEED VALVE OPENS boundary cut
   them, and the warm OAT curves exist only over part of the carry because the
   rest would read past the top of the ITT scale.                            */


function drawnAt(curves, keys, x) {
  const out = [];
  for (let i = 0; i < curves.length; i++) {
    const c = curves[i];
    if (x >= c[0][0] && x <= c[c.length - 1][0]) out.push([keys[i], interp(c, x)]);
  }
  return out;
}

/* The stats this check reports, in order. Declared rather than discovered,
   so an empty form can be drawn without running the chart at all. */
export const statLabels = ["Chart max ITT °C", "Actual ITT °C"];

export function compute({ chart: d, aircraft, oat, pa, tq, itt }) {
  const low = drawnAt(d.tqCarry, d.hp, tq);
  /* offChart refuses before this runs; an empty carpet means a caller skipped
     the gate, so answer NaN rather than reading off the end of nothing. */
  const carry = low.length ? interp(low, pa) : NaN;
  const high = Number.isFinite(carry) ? drawnAt(d.carryItt, d.oat, carry) : [];
  const maxITT = high.length ? interp(high, oat) : NaN;

  return {
    carry, maxITT, margin: maxITT - itt,
    stats: statLabels.map((label, i) => ({ label, value: fmt([maxITT, itt][i], 0) })),
    notes: [],
  };
}


/* ------------------------------ what fits ------------------------------- */

const AXES = new WeakMap();
export function axes(d) {
  if (AXES.has(d)) return AXES.get(d);
  const a = {
    tq: [Math.min(...d.tqCarry.map((c) => c[0][0])),
         Math.max(...d.tqCarry.map((c) => c[c.length - 1][0]))],
    hp: span(d.hp),
    oat: span(d.oat),
    itt: [Math.min(...d.carryItt.map((c) => Math.min(...c.map((p) => p[1])))),
          Math.max(...d.carryItt.map((c) => Math.max(...c.map((p) => p[1]))))],
  };
  AXES.set(d, a);
  return a;
}

/* ITT is the measurement being judged, not a lookup, so it bounds nothing —
   the guard only catches a mistyped reading. A reading merely over the chart
   figure is a real failed check and gets its negative margin. The sheet's own
   instruction caps the test at 810 °C ITT, so far above that is a typo. */
const ITT_SLACK = 200;

export function offChart({ chart: d, oat, pa, tq, itt }) {
  const ax = axes(d);
  const out = [];

  if (Number.isFinite(pa) && (pa < ax.hp[0] || pa > ax.hp[1])) {
    out.push(`Pressure altitude ${fmt(pa, 0)} ft is off the chart — it runs ${ax.hp[0]} to ${ax.hp[1]} ft.`);
    return out;
  }

  if (Number.isFinite(tq) && Number.isFinite(pa)) {
    const low = drawnAt(d.tqCarry, d.hp, tq);
    if (!low.length) {
      out.push(`Torque ${fmt(tq, 1)}% is off the chart — the altitude curves run ${fmt(ax.tq[0], 0)} to ${fmt(ax.tq[1], 0)}%.`);
      return out;
    }
    if (pa < low[0][0] || pa > low[low.length - 1][0]) {
      out.push(`At ${fmt(tq, 1)}% torque the chart only carries ${fmt(low[0][0], 0)} to ${fmt(low[low.length - 1][0], 0)} ft, not ${fmt(pa, 0)} ft.`);
      return out;
    }
    const carry = interp(low, pa);
    const high = drawnAt(d.carryItt, d.oat, carry);
    if (!high.length) {
      out.push(`${fmt(tq, 1)}% torque at ${fmt(pa, 0)} ft carries off the temperature curves — no maximum ITT is drawn there.`);
      return out;
    }
    if (Number.isFinite(oat)) {
      const lo = high[0][0], hi = high[high.length - 1][0];
      if (oat > hi)
        out.push(`OAT ${fmt(oat, 0)} °C is off the chart at ${fmt(tq, 1)}% torque and ${fmt(pa, 0)} ft — the curves reach ${fmt(hi, 0)} °C there, the warmer ones reading past the top of the ITT scale.`);
      else if (oat < lo)
        out.push(`OAT ${fmt(oat, 0)} °C is off the chart at ${fmt(tq, 1)}% torque and ${fmt(pa, 0)} ft — the curves start at ${fmt(lo, 0)} °C there.`);
    }
  }

  if (Number.isFinite(itt) && (itt < ax.itt[0] - ITT_SLACK || itt > ax.itt[1] + ITT_SLACK))
    out.push(`ITT ${fmt(itt, 0)} °C is not a plausible reading for this check — the chart's maximums run ${fmt(ax.itt[0], 0)} to ${fmt(ax.itt[1], 0)} °C.`);

  return out;
}
