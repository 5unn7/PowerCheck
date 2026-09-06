import { interp, span } from "../../engine/interp.js";
import { fmt } from "../../engine/format.js";

/* ========== read a minimum torque, compare what the engine made ==========

   BHT-206L4-FM-1 fig 4-1 runs the opposite way round from the 407's. It does
   not hand back a temperature the engine must stay under; it hands back a
   torque the engine must reach.

   OAT and the indicated TOT pick a point on the left carpet. Carry that
   across to the right carpet, meet the day's pressure altitude, and read
   MINIMUM TORQUE AVAILABLE off the bottom. If the engine made that much
   torque or more, it has the power the flight manual promises. So the margin
   here is in percent of torque, and it is what the engine made *less* what
   the chart asks for — positive is the engine in credit, the same direction
   as every other margin in the app, but a different quantity.

   The axis between the two carpets is unlabelled on the printed page. It
   carries a number from one half to the other and means nothing on its own;
   stored here in units of one minor grid square up from the bottom of the
   frame, which is only a choice of units for that carry.

   A chart is:

     tot[]        the indicated TOT each left-carpet curve is drawn for
     oatCarry[]   one curve each, [oat, carry] along the drawn extent
     hp[]         the pressure altitude each right-carpet curve is drawn for
     carryTq[]    one curve each, [carry, minimum torque %]

   Every curve is stored only over the extent Bell actually drew it, and that
   is what bounds the check — nothing here is hardcoded. The two carpets are
   not rectangles: which TOT curves exist at all depends on the OAT, because
   the carpet is cut off above by its own top edge and below by the printed
   AVOID THIS AREA (POSSIBLE BLEED VALVE OPEN AREA). A reading that falls past
   the cool end of the curves at that OAT is inside that area, and is refused
   by name rather than extrapolated into.                                   */


/* The curves of a carpet that are drawn at x, paired with what they are drawn
   for. Reading across a curve that does not reach x is reading off the page. */
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
export const statLabels = ["Chart min torque %", "Actual torque %"];

export function compute({ chart: d, aircraft, oat, pa, tot, tq }) {
  const left = drawnAt(d.oatCarry, d.tot, oat);
  /* offChart refuses before it gets here, so an empty carpet means a caller
     skipped the gate. Answer NaN rather than reading off the end of nothing. */
  const carry = left.length ? interp(left, tot) : NaN;
  const right = Number.isFinite(carry) ? drawnAt(d.carryTq, d.hp, carry) : [];
  const minTq = right.length ? interp(right, pa) : NaN;

  return {
    carry, minTq, margin: tq - minTq,
    stats: statLabels.map((label, i) => ({ label, value: fmt([minTq, tq][i], 1) })),
    notes: [],
  };
}


/* ------------------------------ what fits ------------------------------- */

const AXES = new WeakMap();
export function axes(d) {
  if (AXES.has(d)) return AXES.get(d);
  const ends = (curves) => [
    Math.min(...curves.map((c) => c[0][0])),
    Math.max(...curves.map((c) => c[c.length - 1][0])),
  ];
  const a = {
    oat: ends(d.oatCarry),
    carry: ends(d.carryTq),
    tot: span(d.tot),
    hp: span(d.hp),
    tq: [
      Math.min(...d.carryTq.map((c) => Math.min(...c.map((p) => p[1])))),
      Math.max(...d.carryTq.map((c) => Math.max(...c.map((p) => p[1])))),
    ],
  };
  AXES.set(d, a);
  return a;
}

/* Torque is the measurement being judged, not a lookup, so it bounds nothing —
   its guard only catches a mistyped reading. A torque that is merely under the
   chart's minimum is a real failed check and gets its negative margin. */
const TQ_SLACK = 25;

export function offChart({ chart: d, oat, pa, tot, tq }) {
  const ax = axes(d);
  const out = [];

  if (Number.isFinite(pa) && (pa < ax.hp[0] || pa > ax.hp[1]))
    out.push(`Pressure altitude ${fmt(pa, 0)} ft is off the chart — it runs ${ax.hp[0]} to ${ax.hp[1]} ft.`);

  if (Number.isFinite(oat) && (oat < ax.oat[0] || oat > ax.oat[1])) {
    out.push(`OAT ${fmt(oat, 0)} °C is off the chart — it runs ${fmt(ax.oat[0], 0)} to ${fmt(ax.oat[1], 0)} °C.`);
    return out;                       // nothing below can be judged without it
  }

  if (Number.isFinite(oat) && Number.isFinite(tot)) {
    const left = drawnAt(d.oatCarry, d.tot, oat);
    if (!left.length) {
      out.push(`No TOT curve is drawn at OAT ${fmt(oat, 0)} °C.`);
      return out;
    }
    const lo = left[0][0], hi = left[left.length - 1][0];
    if (tot < lo)
      out.push(`TOT ${fmt(tot, 0)} °C at OAT ${fmt(oat, 0)} °C falls in the chart's AVOID THIS AREA — possible bleed valve open. The chart is not read there; the curves start at ${fmt(lo, 0)} °C for this OAT.`);
    else if (tot > hi)
      out.push(`TOT ${fmt(tot, 0)} °C is above the top of the chart at OAT ${fmt(oat, 0)} °C — the curves reach ${fmt(hi, 0)} °C there.`);
    else {
      // the carry has to land somewhere the altitude curves are drawn
      const carry = interp(left, tot);
      const right = drawnAt(d.carryTq, d.hp, carry);
      if (!right.length)
        out.push(`OAT ${fmt(oat, 0)} °C with TOT ${fmt(tot, 0)} °C carries past the altitude curves — this combination is off the right-hand side of the chart.`);
      else if (Number.isFinite(pa) && (pa < right[0][0] || pa > right[right.length - 1][0]))
        out.push(`At OAT ${fmt(oat, 0)} °C and TOT ${fmt(tot, 0)} °C the chart only reaches ${fmt(right[0][0], 0)} to ${fmt(right[right.length - 1][0], 0)} ft, not ${fmt(pa, 0)} ft.`);
    }
  }

  if (Number.isFinite(tq) && (tq < ax.tq[0] - TQ_SLACK || tq > ax.tq[1] + TQ_SLACK))
    out.push(`Torque ${fmt(tq, 1)}% is not a plausible reading for this check — the chart's minimums run ${fmt(ax.tq[0], 0)} to ${fmt(ax.tq[1], 0)}%.`);

  return out;
}
