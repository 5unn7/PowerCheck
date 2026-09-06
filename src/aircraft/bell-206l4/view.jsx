import React from "react";
import { interp } from "../../engine/interp.js";
import { fmt } from "../../engine/format.js";

/* The two-carpet nomogram drawn: OAT and TOT on the left, pressure altitude
   and minimum torque on the right, sharing the unlabelled carry axis down the
   middle exactly as the printed page does. The day's reading is walked across
   it — up, across, down — so the crew can see where on the chart they are
   rather than only reading the number out. */

const CW = 720, CH = 322;
const PT = 44, PB = 262;
const L0 = 40, L1 = 330, R0 = 378, R1 = 700;

const mk = (lo, hi, a, b) => (v) => a + ((v - lo) / (hi - lo)) * (b - a);
const ticks = (from, to, step) => {
  const out = [];
  for (let v = from; v <= to; v += step) out.push(v);
  return out;
};

export function Chart({ chart: d, frame, readings, result }) {
  if (!d) return null;
  const { oat, tot, pa, tq } = readings;

  const X1 = mk(frame.oat[0], frame.oat[1], L0, L1);
  const X2 = mk(frame.tq[0], frame.tq[1], R0, R1);
  const Y = mk(frame.carry[0], frame.carry[1], PB, PT);

  const path = (pts, xf) => pts
    .map((p, i) => `${i ? "L" : "M"}${xf(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`)
    .join(" ");

  const live = result && Number.isFinite(result.carry) && Number.isFinite(result.minTq);
  const cy = live ? Y(result.carry) : 0;

  // every fourth TOT curve and every second altitude gets a label, so the
  // drawing stays readable at the size a phone gives it
  const totLbl = (t, i) => i % 3 === 0 || t === d.tot[d.tot.length - 1];

  return (
    <svg width={CW} height={CH} viewBox={`0 0 ${CW} ${CH}`} className="chart" role="img"
      aria-label="Outside air temperature and turbine outlet temperature against pressure altitude and minimum torque available">

      <text x={L0} y={16} className="c-head">INDICATED TOT — °C</text>
      <text x={R0} y={16} className="c-head">MINIMUM TORQUE AVAILABLE — %</text>

      <rect x={L0} y={PT} width={L1 - L0} height={PB - PT} className="c-frame" />
      <rect x={R0} y={PT} width={R1 - R0} height={PB - PT} className="c-frame" />

      {ticks(frame.oat[0], frame.oat[1], frame.oatTick * 2).map((o) => (
        <g key={"o" + o}>
          <line x1={X1(o)} y1={PT} x2={X1(o)} y2={PB} className="c-grid" />
          <text x={X1(o)} y={PB + 15} className="c-tick c-mid">{o}</text>
        </g>
      ))}
      {ticks(frame.tq[0], frame.tq[1], frame.tqTick).map((t) => (
        <g key={"t" + t}>
          <line x1={X2(t)} y1={PT} x2={X2(t)} y2={PB} className="c-grid" />
          <text x={X2(t)} y={PB + 15} className="c-tick c-mid">{t}</text>
        </g>
      ))}

      {d.oatCarry.map((c, i) => (
        <g key={"tot" + d.tot[i]}>
          <path d={path(c, X1)} className="c-curve" />
          {totLbl(d.tot[i], i) && (
            <text x={X1(c[0][0]) + 3} y={Y(c[0][1]) - 4} className="c-lbl">{d.tot[i]}</text>
          )}
        </g>
      ))}
      {d.carryTq.map((c, i) => (
        <g key={"hp" + d.hp[i]}>
          <path d={path(c.map((p) => [p[1], p[0]]), X2)} className="c-curve" />
          {i % 2 === 0 && (
            <text x={X2(c[c.length - 1][1]) - 3} y={Y(c[c.length - 1][0]) - 4}
              className="c-lbl" textAnchor="end">{d.hp[i] === 0 ? "SL" : d.hp[i] / 1000 + "k"}</text>
          )}
        </g>
      ))}

      {/* the walk: up from OAT to the TOT curve, straight across both carpets
          to the altitude curve, then down to the torque scale. The ring on the
          torque axis is what the engine actually made. */}
      {live && (
        <g className="c-trace">
          <line x1={X1(oat)} y1={PB} x2={X1(oat)} y2={cy} />
          <line x1={X1(oat)} y1={cy} x2={L1} y2={cy} />
          <line x1={R0} y1={cy} x2={X2(result.minTq)} y2={cy} />
          <line x1={X2(result.minTq)} y1={cy} x2={X2(result.minTq)} y2={PB} />
          <circle cx={X1(oat)} cy={cy} r={3.4} />
          <circle cx={X2(result.minTq)} cy={cy} r={3.4} />
          {Number.isFinite(tq) && tq >= frame.tq[0] && tq <= frame.tq[1] && (
            <>
              <circle cx={X2(tq)} cy={PB} r={3.8} className="c-obs" />
              <text x={X2(tq)} y={PB - 8} className="c-live-lbl" textAnchor="middle">{fmt(tq, 1)}</text>
            </>
          )}
        </g>
      )}

      <text x={(L0 + L1) / 2} y={CH - 6} className="c-tick c-mid">OAT — °C</text>
      <text x={(R0 + R1) / 2} y={CH - 6} className="c-tick c-mid">TORQUE — %</text>
    </svg>
  );
}


/* ------------------------------ share card ------------------------------ */

const CARD_INK = "#15272d", CARD_INK3 = "#7b8f95";
const F = (w, sz) => `${w} ${sz}px 'Barlow Semi Condensed', system-ui, -apple-system, sans-serif`;
const FB = (w, sz) => `${w} ${sz}px 'Barlow', system-ui, -apple-system, sans-serif`;

export async function drawCard({ aircraft, meta, title, readings, reg, date, hours, result, accent, status }) {
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
  x.font = F(600, 26); x.fillText(aircraft.marginUnit, 46 + bw, 168);
  x.fillStyle = accent; x.font = F(600, 15);
  x.fillText((status || "").toUpperCase(), 42, 192);
  x.fillStyle = CARD_INK3; x.font = FB(600, 10.5);
  x.fillText(aircraft.marginLabel.toUpperCase(), 42, 210);

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
