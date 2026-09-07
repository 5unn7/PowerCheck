import React from "react";
import { fmt } from "../../engine/format.js";

/* Two carpets sharing the carry, drawn side by side the way the 206L-4's are:
   torque and pressure altitude on the left, ambient temperature and maximum
   allowable ITT on the right. The printed page overlays them on one grid with
   two x-scales; separating them loses nothing and makes the walk legible at
   the size a phone gives it — in from the torque, across the carry, up to the
   temperature. */

const CW = 720, CH = 330;
const PT = 46, PB = 268;
const L0 = 40, L1 = 330, R0 = 378, R1 = 700;

const mk = (lo, hi, a, b) => (v) => a + ((v - lo) / (hi - lo)) * (b - a);
const ticks = (from, to, step) => {
  const out = [];
  for (let v = from; v <= to; v += step) out.push(v);
  return out;
};

export function Chart({ chart: d, frame, readings, result }) {
  if (!d) return null;
  const { tq, oat, itt } = readings;
  const X1 = mk(frame.tq[0], frame.tq[1], L0, L1);
  const X2 = mk(frame.itt[0], frame.itt[1], R0, R1);
  const Y = mk(frame.carry[0], frame.carry[1], PB, PT);

  const pathL = (c) => c.map((p, i) => `${i ? "L" : "M"}${X1(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(" ");
  const pathR = (c) => c.map((p, i) => `${i ? "L" : "M"}${X2(p[1]).toFixed(1)},${Y(p[0]).toFixed(1)}`).join(" ");

  const live = result && Number.isFinite(result.carry) && Number.isFinite(result.maxITT);
  const cy = live ? Y(result.carry) : 0;
  const hpLbl = (h) => (h === 0 ? "SL" : h < 0 ? h : h / 1000 + "k");

  return (
    <svg width={CW} height={CH} viewBox={`0 0 ${CW} ${CH}`} className="chart" role="img"
      aria-label="Engine torque and pressure altitude against maximum allowable turbine temperature">

      <text x={L0} y={16} className="c-head">Hp — FEET</text>
      <text x={R0} y={16} className="c-head">MAXIMUM ALLOWABLE ITT — °C</text>

      <rect x={L0} y={PT} width={L1 - L0} height={PB - PT} className="c-frame" />
      <rect x={R0} y={PT} width={R1 - R0} height={PB - PT} className="c-frame" />

      {ticks(frame.tq[0], frame.tq[1], frame.tqTick).map((v) => (
        <g key={"t" + v}>
          <line x1={X1(v)} y1={PT} x2={X1(v)} y2={PB} className="c-grid" />
          <text x={X1(v)} y={PB + 15} className="c-tick c-mid">{v}</text>
        </g>
      ))}
      {ticks(frame.itt[0], frame.itt[1], frame.ittTick).map((v) => (
        <g key={"i" + v}>
          <line x1={X2(v)} y1={PT} x2={X2(v)} y2={PB} className="c-grid" />
          <text x={X2(v)} y={PB + 15} className="c-tick c-mid">{v}</text>
        </g>
      ))}

      {d.tqCarry.map((c, i) => (
        <g key={"h" + d.hp[i]}>
          <path d={pathL(c)} className="c-curve" />
          <text x={X1(c[0][0]) + 3} y={Y(c[0][1]) - 4} className="c-lbl">{hpLbl(d.hp[i])}</text>
        </g>
      ))}
      {d.carryItt.map((c, i) => (
        <g key={"o" + d.oat[i]}>
          <path d={pathR(c)} className="c-curve" />
          {i % 2 === 0 && (
            <text x={X2(c[0][1]) + 3} y={Y(c[0][0]) - 4} className="c-lbl">{d.oat[i]}</text>
          )}
        </g>
      ))}

      {/* up from the torque to the altitude curve, across the carry, then up
          to the temperature scale — the walk the sheet prints. The ring is the
          ITT the engine actually made. */}
      {live && (
        <g className="c-trace">
          <line x1={X1(tq)} y1={PB} x2={X1(tq)} y2={cy} />
          <line x1={X1(tq)} y1={cy} x2={L1} y2={cy} />
          <line x1={R0} y1={cy} x2={X2(result.maxITT)} y2={cy} />
          <line x1={X2(result.maxITT)} y1={cy} x2={X2(result.maxITT)} y2={PT} />
          <circle cx={X1(tq)} cy={cy} r={3.4} />
          <circle cx={X2(result.maxITT)} cy={cy} r={3.4} />
          {Number.isFinite(itt) && itt >= frame.itt[0] && itt <= frame.itt[1] && (
            <>
              <circle cx={X2(itt)} cy={PT} r={3.8} className="c-obs" />
              <text x={X2(itt)} y={PT + 16} className="c-live-lbl" textAnchor="middle">{fmt(itt, 0)}</text>
            </>
          )}
        </g>
      )}

      <text x={(L0 + L1) / 2} y={CH - 6} className="c-tick c-mid">ENGINE TORQUE — % INDICATED</text>
      <text x={(R0 + R1) / 2} y={CH - 6} className="c-tick c-mid">OAT CURVES — °C</text>
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
  x.font = F(600, 26); x.fillText(aircraft.marginUnit, 46 + bw, 168);
  x.fillStyle = CARD_INK3; x.font = FB(600, 10.5);
  x.fillText(aircraft.marginLabel.toUpperCase(), 42, 196);

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
  x.fillText(meta.cond.slice(0, 118) + "…", 40, 430);

  return new Promise((res) => cv.toBlob(res, "image/png"));
}
