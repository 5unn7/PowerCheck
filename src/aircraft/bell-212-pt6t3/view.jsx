import React from "react";
import { interp } from "../../engine/interp.js";
import { fmt } from "../../engine/format.js";
import { CARD_INK, CARD_INK3, F, wrapText, drawVerdicts } from "../../engine/card.js";

/* Two limit curves against OAT, with the day's reading walked onto each —
   the table drawn, so the crew can see how close to the edge the engine is
   rather than only reading a number. */

/* Two layouts. Side by side is the way the limits are read together on a
   screen wide enough to hold both; on a phone they stack, because half a
   chart off the edge of the glass is not a chart. */
const WIDE = (() => {
  const CW = 720, CH = 300, GAP = 46, top = 40, bot = 246;
  const R1 = (CW - GAP) / 2;
  return { CW, CH, oatTick: 20,
    panels: [{ x0: 42, x1: R1, yTop: top, yBot: bot }, { x0: R1 + GAP, x1: CW - 20, yTop: top, yBot: bot }],
    caption: { x: CW / 2, y: CH - 6 } };
})();
const NARROW = (() => {
  const CW = 420, x0 = 46, x1 = 406;
  return { CW, CH: 452, oatTick: 20,
    panels: [{ x0, x1, yTop: 26, yBot: 182 }, { x0, x1, yTop: 268, yBot: 424 }],
    caption: { x: CW / 2, y: 448 } };
})();

const mk = (lo, hi, a, b) => (v) => a + ((v - lo) / (hi - lo)) * (b - a);
const ticks = (from, to, step) => {
  const out = [];
  for (let v = from; v <= to; v += step) out.push(v);
  return out;
};

function Panel({ box, oatTick, head, unit, oats, vals, frameY, oat, observed, limit, d1 }) {
  const { x0, x1, yTop, yBot } = box;
  const X = mk(frameY.oatLo, frameY.oatHi, x0, x1);
  const Y = mk(frameY.lo, frameY.hi, yBot, yTop);
  const path = oats.map((o, i) => `${i ? "L" : "M"}${X(o).toFixed(1)},${Y(vals[i]).toFixed(1)}`).join(" ");
  // with the margin withheld there is no limit to walk to, so nothing is traced
  const live = Number.isFinite(oat) && oat >= frameY.oatLo && oat <= frameY.oatHi
    && Number.isFinite(limit);

  return (
    <g>
      <text x={x0} y={yTop - 14} className="c-head">{head}</text>
      <rect x={x0} y={yTop} width={x1 - x0} height={yBot - yTop} className="c-frame" />

      {ticks(frameY.oatLo, frameY.oatHi, oatTick).map((o) => (
        <g key={"o" + o}>
          <line x1={X(o)} y1={yTop} x2={X(o)} y2={yBot} className="c-grid" />
          <text x={X(o)} y={yBot + 15} className="c-tick c-mid">{o}</text>
        </g>
      ))}
      {ticks(frameY.tickFrom, frameY.hi, frameY.tick).map((v) => (
        <g key={"v" + v}>
          <line x1={x0} y1={Y(v)} x2={x1} y2={Y(v)} className="c-grid" />
          <text x={x0 - 5} y={Y(v) + 3.5} className="c-tick c-end">{fmt(v, d1)}</text>
        </g>
      ))}

      <path d={path} className="c-curve" />
      <text x={x1 - 6} y={Y(vals[vals.length - 1]) + 13} className="c-lbl c-end">MAX {unit}</text>

      {/* the walk, drawn the way the 407's nomogram draws it: up from the
          day's OAT to the limit curve, then across to the scale. The filled
          dot is the limit, the ring is what the engine actually made. */}
      {live && (
        <g className="c-trace">
          <line x1={X(oat)} y1={yBot} x2={X(oat)} y2={Y(limit)} />
          <line x1={X(oat)} y1={Y(limit)} x2={x0} y2={Y(limit)} />
          <circle cx={X(oat)} cy={Y(limit)} r={3.4} />
          {Number.isFinite(observed) && observed >= frameY.lo && observed <= frameY.hi && (
            <>
              <circle cx={X(oat)} cy={Y(observed)} r={3.8} className="c-obs" />
              <text x={X(oat) + 9} y={Y(observed) + 3.5} className="c-live-lbl">{fmt(observed, d1)}</text>
            </>
          )}
        </g>
      )}
    </g>
  );
}

export function Chart({ chart: d, frame, readings, result, narrow }) {
  if (!d) return null;
  const { oat, itt, n1 } = readings;
  const lim = d.limits;
  const L = narrow ? NARROW : WIDE;
  const f = { oatLo: frame.oat[0], oatHi: frame.oat[1] };

  return (
    <svg viewBox={`0 0 ${L.CW} ${L.CH}`} className="chart" role="img"
      aria-label="Turbine temperature and gas producer limits against outside air temperature">
      <Panel box={L.panels[0]} oatTick={L.oatTick} head="MAX ALLOWABLE ITT — °C" unit="ITT" d1={0}
        oats={lim.oat} vals={lim.itt}
        frameY={{ ...f, lo: frame.itt[0], hi: frame.itt[1], tickFrom: 500, tick: 50 }}
        oat={oat} observed={itt} limit={result ? result.maxITT : NaN} />
      <Panel box={L.panels[1]} oatTick={L.oatTick} head="MAX ALLOWABLE GAS PROD (N1) — %" unit="N1" d1={1}
        oats={lim.oat} vals={lim.n1}
        frameY={{ ...f, lo: frame.n1[0], hi: frame.n1[1], tickFrom: 84, tick: 4 }}
        oat={oat} observed={n1} limit={result ? result.maxN1 : NaN} />
      <text x={L.caption.x} y={L.caption.y} className="c-tick c-mid">OAT — °C</text>
    </svg>
  );
}

/* ------------------------------ share card ------------------------------ */

const FB = F;

export async function drawCard({ aircraft, meta, title, readings, reg, date, hours, result, accent, says }) {
  const W = 1000, H = 440, SC = 2;
  const cv = document.createElement("canvas");
  cv.width = W * SC; cv.height = H * SC;
  const x = cv.getContext("2d");
  x.scale(SC, SC);
  x.fillStyle = "#ffffff"; x.fillRect(0, 0, W, H);
  x.fillStyle = CARD_INK; x.fillRect(0, 0, W, 6);

  x.textAlign = "left"; x.fillStyle = CARD_INK; x.font = F(700, 13);
  x.fillText(title, 40, 46);
  x.textAlign = "right"; x.font = F(700, 30);
  x.fillText(reg || "—", W - 40, 52);
  x.font = FB(500, 13); x.fillStyle = CARD_INK3;
  x.fillText(date + (Number.isFinite(hours) ? `   ·   ${fmt(hours, 0)} hrs` : ""), W - 40, 74);

  x.textAlign = "left"; x.fillStyle = accent; x.font = F(700, 92);
  const big = (result.margin > 0 ? "+" : "") + fmt(result.margin);
  x.fillText(big, 40, 168);
  const bw = x.measureText(big).width;
  x.font = F(600, 26); x.fillText(aircraft.marginUnit, 46 + bw, 168);
  x.fillStyle = CARD_INK3; x.font = FB(700, 10.5);
  x.fillText(aircraft.marginLabel.toUpperCase(), 40, 196);

  result.stats.forEach((st, i) => {
    const sx = 470 + i * 178;
    x.fillStyle = CARD_INK3; x.font = FB(600, 10.5); x.fillText(st.label.toUpperCase(), sx, 118);
    x.fillStyle = CARD_INK; x.font = F(600, 30); x.fillText(st.value, sx, 150);
  });

  x.fillStyle = CARD_INK; x.font = FB(500, 14.5);
  x.fillText(readings.join("   ·   "), 40, 232);
  x.strokeStyle = "#d3dbde"; x.lineWidth = 1;
  x.beginPath(); x.moveTo(40, 252); x.lineTo(W - 40, 252); x.stroke();

  // what the check says, in the same words and the same order as the screen
  let y = drawVerdicts(x, says, 40, 282, W - 80);

  // and what it said alongside — the gas producer, which fails on its own
  x.fillStyle = CARD_INK3; x.font = FB(500, 12.5);
  for (const n of result.notes || []) {
    for (const line of wrapText(x, n, W - 80)) { x.fillText(line, 40, y); y += 17; }
  }

  x.fillStyle = CARD_INK; x.font = F(600, 12.5);
  x.fillText(meta.src, 40, 400);
  x.fillStyle = CARD_INK3; x.font = FB(500, 11);
  x.fillText(meta.cond, 40, 418);

  return new Promise((res) => cv.toBlob(res, "image/png"));
}
