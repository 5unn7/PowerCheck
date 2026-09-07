import { interp, span } from "../../engine/interp.js";
import { fmt } from "../../engine/format.js";

/* ============ read a torquemeter pressure, compare what was made ============

   BHT-205A1-FM-1/2/3, MAXIMUM POWER (TORQUEMETER PRESSURE) CHECK. One carpet,
   read the way the manual states it:

     "Enter chart at pressure altitude (Point A), proceed horizontally to
      ambient air temperature (Point B), and then proceed vertically down and
      read chart torquemeter pressure (Point C)."

   and judged the way the manual states that:

     "Since the observed maximum torquemeter pressure of the example (44.5 PSI)
      is no less than the chart maximum torquemeter pressure (43.1 PSI) the
      maximum torquemeter pressure available is satisfactory."

   So the chart figure is a floor even though the manual calls it a maximum,
   and the margin is observed less chart, in PSI. Positive is the engine in
   credit, the same direction as every other margin in the app.

   A chart is:

     oat[]      the ambient temperature each curve is drawn for
     paPsi[]    one curve each, [pressure altitude ft, torquemeter PSI]

   The coldest entry is -54 and duplicates the -20 curve, because the sheet
   draws one line for the whole band and labels it "OAT -20 TO -54 °C".

   Each curve is stored only over the altitude Bell drew it, and that is the
   whole of the gate. It is not a rectangle: the warm curves stop partway up
   where they meet the OAT OPERATING LIMIT, and the cold ones do not reach low
   altitude at all because they run off the right-hand side at the
   TRANSMISSION TORQUE LIMIT. Both edges fall out of the drawn extents, so
   neither is written down anywhere here.                                    */


/* The curves drawn at this pressure altitude, paired with their OAT. */
function drawnAt(curves, oats, pa) {
  const out = [];
  for (let i = 0; i < curves.length; i++) {
    const c = curves[i];
    if (pa >= c[0][0] && pa <= c[c.length - 1][0]) out.push([oats[i], interp(c, pa)]);
  }
  return out;
}

/* The stats this check reports, in order. Declared rather than discovered,
   so an empty form can be drawn without running the chart at all. */
export const statLabels = ["Chart PSI", "Observed PSI"];

export function compute({ chart: d, aircraft, oat, pa, psi }) {
  const at = drawnAt(d.paPsi, d.oat, pa);
  /* offChart refuses before this runs; an empty carpet means a caller skipped
     the gate, so answer NaN rather than reading off the end of nothing. */
  const chartPsi = at.length ? interp(at, oat) : NaN;

  return {
    chartPsi, margin: psi - chartPsi,
    stats: statLabels.map((label, i) => ({ label, value: fmt([chartPsi, psi][i], 1) })),
    notes: [],
  };
}


/* ------------------------------ what fits ------------------------------- */

const AXES = new WeakMap();
export function axes(d) {
  if (AXES.has(d)) return AXES.get(d);
  const a = {
    pa: [Math.min(...d.paPsi.map((c) => c[0][0])),
         Math.max(...d.paPsi.map((c) => c[c.length - 1][0]))],
    oat: span(d.oat),
    psi: [Math.min(...d.paPsi.map((c) => Math.min(...c.map((p) => p[1])))),
          Math.max(...d.paPsi.map((c) => Math.max(...c.map((p) => p[1]))))],
  };
  AXES.set(d, a);
  return a;
}

/* Torquemeter pressure is the measurement being judged, not a lookup, so it
   bounds nothing — the guard only catches a mistyped reading. A pressure that
   is merely under the chart figure is a real failed check and gets its
   negative margin. 54.0 PSI is the flight manual's power limitation and the
   check is flown below it, so a reading far above that is a typo. */
const PSI_SLACK = 8;

export function offChart({ chart: d, oat, pa, psi }) {
  const ax = axes(d);
  const out = [];

  if (Number.isFinite(pa) && (pa < ax.pa[0] || pa > ax.pa[1])) {
    out.push(`Pressure altitude ${fmt(pa, 0)} ft is off the chart — it runs ${fmt(ax.pa[0], 0)} to ${fmt(ax.pa[1], 0)} ft.`);
    return out;
  }

  if (Number.isFinite(pa) && Number.isFinite(oat)) {
    const at = drawnAt(d.paPsi, d.oat, pa);
    if (!at.length) {
      out.push(`No temperature curve is drawn at ${fmt(pa, 0)} ft.`);
      return out;
    }
    const lo = at[0][0], hi = at[at.length - 1][0];
    if (oat > hi)
      out.push(`OAT ${fmt(oat, 0)} °C is past the OAT operating limit at ${fmt(pa, 0)} ft — the curves reach ${fmt(hi, 0)} °C there.`);
    else if (oat < lo)
      out.push(`OAT ${fmt(oat, 0)} °C is off the chart at ${fmt(pa, 0)} ft — the curves start at ${fmt(lo, 0)} °C there, the rest running past the transmission torque limit.`);
  }

  if (Number.isFinite(psi) && (psi < ax.psi[0] - PSI_SLACK || psi > 54 + PSI_SLACK))
    out.push(`Torquemeter pressure ${fmt(psi, 1)} PSI is not a plausible reading — the check is flown below the 54.0 PSI power limitation.`);

  return out;
}
