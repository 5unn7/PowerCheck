import React from "react";
import { fmt } from "../../engine/format.js";

/* One carpet, drawn the way page 5-7 draws it: pressure altitude up the left,
   torquemeter pressure along the bottom, a fan of ambient temperature curves
   between them. The day's reading is walked across it — in from the altitude,
   down to the pressure — with points A, B and C where the manual puts them. */

const CW = 720, CH = 430;
const PL = 54, PR = 700, PT = 26, PB = 386;

const mk = (lo, hi, a, b) => (v) => a + ((v - lo) / (hi - lo)) * (b - a);
const ticks = (from, to, step) => {
  const out = [];
  for (let v = from; v <= to; v += step) out.push(v);
  return out;
};

export function Chart({ chart: d, frame, readings, result }) {
  if (!d) return null;
  const { pa, oat, psi } = readings;
  const X = mk(frame.psi[0], frame.psi[1], PL, PR);
  const Y = mk(frame.pa[0], frame.pa[1], PB, PT);

  const path = (c) => c
    .map((p, i) => `${i ? "L" : "M"}${X(p[1]).toFixed(1)},${Y(p[0]).toFixed(1)}`)
    .join(" ");

  const live = result && Number.isFinite(result.chartPsi) && Number.isFinite(pa);

  return (
    <svg width={CW} height={CH} viewBox={`0 0 ${CW} ${CH}`} className="chart" role="img"
      aria-label="Torquemeter pressure against pressure altitude and ambient temperature">

      <rect x={PL} y={PT} width={PR - PL} height={PB - PT} className="c-frame" />

      {ticks(frame.psi[0], frame.psi[1], frame.psiTick).map((v) => (
        <g key={"p" + v}>
          <line x1={X(v)} y1={PT} x2={X(v)} y2={PB} className="c-grid" />
          <text x={X(v)} y={PB + 15} className="c-tick c-mid">{v}</text>
        </g>
      ))}
      {ticks(frame.pa[0], frame.pa[1], frame.paTick).map((v) => (
        <g key={"a" + v}>
          <line x1={PL} y1={Y(v)} x2={PR} y2={Y(v)} className="c-grid" />
          <text x={PL - 6} y={Y(v) + 3.5} className="c-tick" textAnchor="end">{v ? v / 1000 + "k" : "0"}</text>
        </g>
      ))}

      {/* the -54 entry repeats the -20 curve, so it is not drawn twice */}
      {d.paPsi.map((c, i) => i === 0 ? null : (
        <g key={"o" + d.oat[i]}>
          <path d={path(c)} className="c-curve" />
          <text x={X(c[c.length - 1][1]) - 3} y={Y(c[c.length - 1][0]) - 5}
            className="c-lbl" textAnchor="end">
            {d.oat[i] === -20 ? "−20 to −54" : d.oat[i]}
          </text>
        </g>
      ))}

      {live && (
        <g className="c-trace">
          <line x1={PL} y1={Y(pa)} x2={X(result.chartPsi)} y2={Y(pa)} />
          <line x1={X(result.chartPsi)} y1={Y(pa)} x2={X(result.chartPsi)} y2={PB} />
          <circle cx={PL} cy={Y(pa)} r={3.4} />
          <circle cx={X(result.chartPsi)} cy={Y(pa)} r={3.4} />
          <text x={PL + 7} y={Y(pa) - 6} className="c-live-lbl">A</text>
          <text x={X(result.chartPsi) - 9} y={Y(pa) - 6} className="c-live-lbl" textAnchor="end">B</text>
          <text x={X(result.chartPsi) + 7} y={PB - 6} className="c-live-lbl">C</text>
          {Number.isFinite(psi) && psi >= frame.psi[0] && psi <= frame.psi[1] && (
            <>
              <circle cx={X(psi)} cy={PB} r={3.8} className="c-obs" />
              <text x={X(psi)} y={PB - 20} className="c-live-lbl" textAnchor="middle">{fmt(psi, 1)}</text>
            </>
          )}
        </g>
      )}

      <text x={PL} y={16} className="c-head">PRESSURE ALTITUDE — FEET</text>
      <text x={(PL + PR) / 2} y={CH - 6} className="c-tick c-mid">ENGINE TORQUEMETER PRESSURE — PSI</text>
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
  x.fillText(meta.cond.slice(0, 120) + "…", 40, 430);

  return new Promise((res) => cv.toBlob(res, "image/png"));
}
