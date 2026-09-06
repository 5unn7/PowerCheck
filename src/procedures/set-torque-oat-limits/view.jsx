import React from "react";
import { interp } from "../../engine/interp.js";
import { fmt } from "../../engine/format.js";

/* Two limit curves against OAT, with the day's reading walked onto each —
   the table drawn, so the crew can see how close to the edge the engine is
   rather than only reading a number. */

const CW = 720, CH = 300;
const PT = 40, PB = 246;
const GAP = 46;
const L1 = 42, R1 = (CW - GAP) / 2, L2 = R1 + GAP, R2 = CW - 20;

const mk = (lo, hi, a, b) => (v) => a + ((v - lo) / (hi - lo)) * (b - a);
const ticks = (from, to, step) => {
  const out = [];
  for (let v = from; v <= to; v += step) out.push(v);
  return out;
};

function Panel({ x0, x1, head, unit, oats, vals, frameY, oat, observed, limit, d1 }) {
  const X = mk(frameY.oatLo, frameY.oatHi, x0, x1);
  const Y = mk(frameY.lo, frameY.hi, PB, PT);
  const path = oats.map((o, i) => `${i ? "L" : "M"}${X(o).toFixed(1)},${Y(vals[i]).toFixed(1)}`).join(" ");
  // with the margin withheld there is no limit to walk to, so nothing is traced
  const live = Number.isFinite(oat) && oat >= frameY.oatLo && oat <= frameY.oatHi
    && Number.isFinite(limit);

  return (
    <g>
      <text x={x0} y={16} className="c-head">{head}</text>
      <rect x={x0} y={PT} width={x1 - x0} height={PB - PT} className="c-frame" />

      {ticks(frameY.oatLo, frameY.oatHi, 20).map((o) => (
        <g key={"o" + o}>
          <line x1={X(o)} y1={PT} x2={X(o)} y2={PB} className="c-grid" />
          <text x={X(o)} y={PB + 15} className="c-tick c-mid">{o}</text>
        </g>
      ))}
      {ticks(frameY.tickFrom, frameY.hi, frameY.tick).map((v) => (
        <g key={"v" + v}>
          <line x1={x0} y1={Y(v)} x2={x1} y2={Y(v)} className="c-grid" />
          <text x={x0 - 5} y={Y(v) + 3.5} className="c-tick" textAnchor="end">{fmt(v, d1)}</text>
        </g>
      ))}

      <path d={path} className="c-curve" />
      <text x={x1 - 6} y={Y(vals[vals.length - 1]) - 7} className="c-lbl" textAnchor="end">MAX {unit}</text>

      {live && (
        <g>
          <line x1={X(oat)} y1={PB} x2={X(oat)} y2={Y(limit)} className="c-trace" />
          <line x1={X(oat)} y1={Y(limit)} x2={x0} y2={Y(limit)} className="c-trace" />
          <circle cx={X(oat)} cy={Y(limit)} r={3.4} className="c-end" />
          {Number.isFinite(observed) && observed >= frameY.lo && observed <= frameY.hi && (
            <>
              <circle cx={X(oat)} cy={Y(observed)} r={3.4} className="c-live" />
              <text x={X(oat) + 8} y={Y(observed) + 3.5} className="c-live-lbl">{fmt(observed, d1)}</text>
            </>
          )}
        </g>
      )}
      <text x={(x0 + x1) / 2} y={CH - 6} className="c-tick c-mid">OAT — °C</text>
    </g>
  );
}

export function Chart({ chart: d, frame, readings, result }) {
  if (!d) return null;
  const { oat, itt, n1 } = readings;
  const lim = d.limits;
  const f = { oatLo: frame.oat[0], oatHi: frame.oat[1] };

  return (
    <svg width={CW} height={CH} viewBox={`0 0 ${CW} ${CH}`} className="chart" role="img"
      aria-label="Turbine temperature and gas producer limits against outside air temperature">
      <Panel x0={L1} x1={R1} head="MAX ALLOWABLE ITT — °C" unit="ITT" d1={0}
        oats={lim.oat} vals={lim.itt}
        frameY={{ ...f, lo: frame.itt[0], hi: frame.itt[1], tickFrom: 500, tick: 50 }}
        oat={oat} observed={itt} limit={result ? result.maxITT : NaN} />
      <Panel x0={L2} x1={R2} head="MAX ALLOWABLE GAS PROD (N1) — %" unit="N1" d1={1}
        oats={lim.oat} vals={lim.n1}
        frameY={{ ...f, lo: frame.n1[0], hi: frame.n1[1], tickFrom: 84, tick: 4 }}
        oat={oat} observed={n1} limit={result ? result.maxN1 : NaN} />
    </svg>
  );
}

/* ------------------------------ share card ------------------------------ */

const CARD_INK = "#15272d", CARD_INK3 = "#7b8f95";
const F = (w, sz) => `${w} ${sz}px 'Barlow Semi Condensed', system-ui, -apple-system, sans-serif`;
const FB = (w, sz) => `${w} ${sz}px 'Barlow', system-ui, -apple-system, sans-serif`;

export async function drawCard({ aircraft, meta, title, readings, reg, date, hours, result, accent }) {
  const W = 1000, H = 460, SC = 2;
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
  x.font = F(600, 26); x.fillText("°C", 46 + bw, 168);
  x.fillStyle = CARD_INK3; x.font = F(600, 15);
  x.fillText(aircraft.marginLabel.toUpperCase(), 42, 192);

  result.stats.forEach((st, i) => {
    const sx = 470 + i * 178;
    x.fillStyle = CARD_INK3; x.font = FB(600, 10.5); x.fillText(st.label.toUpperCase(), sx, 118);
    x.fillStyle = CARD_INK; x.font = F(600, 30); x.fillText(st.value, sx, 150);
  });

  x.fillStyle = CARD_INK; x.font = FB(500, 14.5);
  x.fillText(readings.join("   ·   "), 40, 232);
  x.strokeStyle = "#d3dbde"; x.lineWidth = 1;
  x.beginPath(); x.moveTo(40, 252); x.lineTo(W - 40, 252); x.stroke();

  x.fillStyle = CARD_INK3; x.font = FB(500, 12.5);
  (result.notes || []).forEach((n, i) => x.fillText(n, 40, 282 + i * 20));

  x.fillStyle = CARD_INK; x.font = F(600, 12.5);
  x.fillText(meta.src, 40, 412);
  x.fillStyle = CARD_INK3; x.font = FB(500, 11);
  x.fillText(meta.cond, 40, 430);

  return new Promise((res) => cv.toBlob(res, "image/png"));
}
