import React, { useMemo } from "react";
import { interp, clamp } from "../../engine/interp.js";
import { fmt } from "../../engine/format.js";

/* The drawing of the torque -> K -> MGT chart: the SVG the app shows and the
   PNG the share button hands to the OS. Both walk the same scales, built
   from the aircraft's printed frame so a type with a different scale draws
   correctly without touching this file. */

// canvas layout, in SVG units — the drawing, not the chart
const CW = 720, CH = 434;
const PL = 34, PM = 372, PR = 700, PT = 48, PB = 392;

const ticks = (from, to, step) => {
  const out = [];
  for (let v = from; v <= to; v += step) out.push(v);
  return out;
};

function scales(frame) {
  const [TQ0, TQ1] = frame.tq, [MG0, MG1] = frame.mgt, [K0, K1] = frame.k;
  const xTq = (t) => PL + ((t - TQ0) / (TQ1 - TQ0)) * (PM - PL);
  const xMg = (m) => PM + ((m - MG0) / (MG1 - MG0)) * (PR - PM);
  const yK = (k) => PB - ((k - K0) / (K1 - K0)) * (PB - PT);
  const polyline = (points, xf) => points
    .filter((p) => p[1] >= K0 - 6 && p[1] <= K1 + 6)
    .map((p, i) => `${i ? "L" : "M"}${xf(p[0]).toFixed(1)},${yK(p[1]).toFixed(1)}`)
    .join(" ");
  return { TQ0, TQ1, MG0, MG1, K0, K1, xTq, xMg, yK, polyline };
}


/* ------------------------------- drawing -------------------------------- */

export function Chart({ chart: d, frame, tq, pa, oat, result }) {
  if (!d) return null;
  const S = scales(frame);
  const live = result && Number.isFinite(result.K);

  const paCurves = d.pa.map((p, i) => ({ p, i })).filter(({ p }) => p % 2000 === 0);
  const paLive = useMemo(() => {
    if (!Number.isFinite(pa)) return null;
    const pts = [];
    for (let t = S.TQ0; t <= S.TQ1; t += 1) {
      pts.push([t, interp(d.pa.map((p, i) => [p, interp(d.tqK[i], t)]), pa)]);
    }
    return pts;
  }, [d, pa]);
  const oatLive = useMemo(() => {
    if (!Number.isFinite(oat)) return null;
    const pts = [];
    for (let k = S.K0; k <= S.K1; k += 2) {
      pts.push([interp(d.oat.map((o, i) => [o, interp(d.mgtK[i], k, 1, 0)]), oat), k]);
    }
    return pts;
  }, [d, oat]);

  const tqTicks = ticks(S.TQ0, S.TQ1, frame.tqTick);
  const mgTicks = ticks(Math.ceil(S.MG0 / frame.mgtTick) * frame.mgtTick, S.MG1 - frame.mgtTick, frame.mgtTick);
  const kGrid = ticks(0, Math.floor(S.K1 / frame.kTick) * frame.kTick, frame.kTick);

  return (
    <svg width={CW} height={CH} viewBox={`0 0 ${CW} ${CH}`} className="chart" role="img"
      aria-label="Power assurance chart with the current check traced through it">
      <defs>
        <clipPath id="clipL"><rect x={PL} y={PT} width={PM - PL} height={PB - PT} /></clipPath>
        <clipPath id="clipR"><rect x={PM} y={PT} width={PR - PM} height={PB - PT} /></clipPath>
        <marker id="arw" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 z" fill="var(--accent)" />
        </marker>
      </defs>

      <text x={PL} y={16} className="c-head">ENGINE TORQUE — PERCENT</text>
      <text x={PR} y={16} className="c-head c-right">MEASURED GAS TEMPERATURE — °C</text>

      {tqTicks.map((t) => (
        <g key={"t" + t}>
          <line x1={S.xTq(t)} y1={PT} x2={S.xTq(t)} y2={PB} className="c-grid" />
          <text x={S.xTq(t)} y={PT - 7} className="c-tick c-mid">{t}</text>
        </g>
      ))}
      {mgTicks.map((m) => (
        <g key={"m" + m}>
          <line x1={S.xMg(m)} y1={PT} x2={S.xMg(m)} y2={PB} className="c-grid" />
          {m % (frame.mgtTick * 2) === 0 && <text x={S.xMg(m)} y={PB + 14} className="c-tick c-mid">{m}</text>}
        </g>
      ))}
      {kGrid.map((k) => (
        <line key={"k" + k} x1={PL} y1={S.yK(k)} x2={PR} y2={S.yK(k)} className="c-grid" />
      ))}

      <g clipPath="url(#clipL)">
        {paCurves.map(({ p, i }) => (
          <path key={"pa" + p} d={S.polyline(d.tqK[i], S.xTq)} className="c-curve" />
        ))}
        {paLive && <path d={S.polyline(paLive, S.xTq)} className="c-live" />}
      </g>
      <g clipPath="url(#clipR)">
        {d.oat.map((o, i) => (
          <path key={"oat" + o} d={S.polyline(d.mgtK[i], S.xMg)} className="c-curve" />
        ))}
        {oatLive && <path d={S.polyline(oatLive, S.xMg)} className="c-live" />}
      </g>

      {paCurves.filter(({ p }) => p % 4000 === 0).map(({ p, i }) => {
        const q = d.tqK[i].find((v) => v[1] >= S.K0 && v[1] <= S.K1);
        if (!q) return null;
        return (
          <text key={"pl" + p} x={clamp(S.xTq(q[0]) + 2, PL + 2, PM - 22)} y={clamp(S.yK(q[1]) + 9, PT + 10, PB - 3)} className="c-lbl">
            {p === 0 ? "S.L." : p / 1000 + "k"}
          </text>
        );
      })}
      {d.oat.map((o, i) => (o % 20 === 0 ? { o, i } : null)).filter(Boolean).map(({ o, i }) => {
        const in_ = d.mgtK[i].filter((v) => v[1] >= S.K0 && v[1] <= S.K1);
        if (!in_.length) return null;
        const q = in_[in_.length - 1];
        return <text key={"ol" + o} x={clamp(S.xMg(q[0]) - 2, PM + 14, PR - 3)} y={clamp(S.yK(q[1]) - 3, PT + 9, PB - 3)} className="c-lbl c-end">{o}</text>;
      })}
      {paLive && Number.isFinite(pa) && (
        <text x={clamp(S.xTq(97), PL, PM - 4)} y={clamp(S.yK(paLive[paLive.length - 4][1]) + 11, PT + 11, PB - 3)} className="c-lbl c-live-lbl c-end">
          {Math.round(pa)} ft
        </text>
      )}
      {oatLive && Number.isFinite(oat) && (
        <text x={clamp(S.xMg(oatLive[oatLive.length - 6][0]) + 3, PM, PR - 4)} y={clamp(S.yK(oatLive[oatLive.length - 6][1]), PT + 9, PB - 3)} className="c-lbl c-live-lbl c-end">
          {Math.round(oat)}°
        </text>
      )}

      {live && (
        <g className="c-trace">
          <line x1={S.xTq(tq)} y1={PT} x2={S.xTq(tq)} y2={S.yK(result.K)} />
          <line x1={S.xTq(tq)} y1={S.yK(result.K)} x2={S.xMg(result.maxMGT)} y2={S.yK(result.K)} />
          <line x1={S.xMg(result.maxMGT)} y1={S.yK(result.K)} x2={S.xMg(result.maxMGT)} y2={PB} markerEnd="url(#arw)" />
          <circle cx={S.xTq(tq)} cy={S.yK(result.K)} r="3.4" />
          <circle cx={S.xMg(result.maxMGT)} cy={S.yK(result.K)} r="3.4" />
          <text x={S.xMg(result.maxMGT)} y={PB + 30} className="c-read c-mid">{fmt(result.maxMGT, 0)}</text>
        </g>
      )}

      <rect x={PL} y={PT} width={PR - PL} height={PB - PT} className="c-frame" />
      <line x1={PM} y1={PT} x2={PM} y2={PB} className="c-frame" />

    </svg>
  );
}


/* ---------- shareable card, drawn on a canvas, nothing fetched ---------- */

const CARD_GREY = "#a3b3b8", CARD_GRID = "#e0e6e8", CARD_INK = "#15272d", CARD_INK3 = "#7b8f95";
const F = (w, sz) => `${w} ${sz}px 'Barlow Semi Condensed', system-ui, -apple-system, sans-serif`;
const FB = (w, sz) => `${w} ${sz}px 'Barlow', system-ui, -apple-system, sans-serif`;

function drawNomogram(x, box, d, frame, tq, pa, oat, res, accent) {
  const S = scales(frame);
  const { L, T, R, B } = box;
  const M = L + (R - L) * 0.475;
  const xT = (t) => L + ((t - 35) / 65) * (M - L);
  const xM = (m) => M + ((m - 390) / 400) * (R - M);
  const yk = (k) => B - ((k + 2) / 104) * (B - T);
  const path = (pts, xf, w, col) => {
    x.beginPath();
    let started = false;
    pts.forEach((p) => {
      if (p[1] < -8 || p[1] > 108) { started = false; return; }
      const px = xf(p[0]), py = yk(p[1]);
      started ? x.lineTo(px, py) : x.moveTo(px, py);
      started = true;
    });
    x.lineWidth = w; x.strokeStyle = col; x.stroke();
  };

  x.strokeStyle = CARD_GRID; x.lineWidth = 0.7;
  x.fillStyle = CARD_INK3; x.font = FB(500, 10); x.textAlign = "center";
  for (let t = 35; t <= 100; t += 5) {
    x.beginPath(); x.moveTo(xT(t), T); x.lineTo(xT(t), B); x.stroke();
    x.fillText(String(t), xT(t), T - 7);
  }
  for (let m = 400; m <= 775; m += 25) {
    x.beginPath(); x.moveTo(xM(m), T); x.lineTo(xM(m), B); x.stroke();
    if (m % 50 === 0) x.fillText(String(m), xM(m), B + 15);
  }
  for (let k = 0; k <= 100; k += 10) {
    x.beginPath(); x.moveTo(L, yk(k)); x.lineTo(R, yk(k)); x.stroke();
  }

  x.save(); x.beginPath(); x.rect(L, T, M - L, B - T); x.clip();
  d.pa.forEach((p, i) => { if (p % 2000 === 0) path(d.tqK[i], xT, 0.8, CARD_GREY); });
  if (Number.isFinite(pa)) {
    const live = [];
    for (let t = 35; t <= 100; t++) live.push([t, interp(d.pa.map((p, i) => [p, interp(d.tqK[i], t)]), pa)]);
    path(live, xT, 2, accent);
  }
  x.restore();

  x.save(); x.beginPath(); x.rect(M, T, R - M, B - T); x.clip();
  d.oat.forEach((o, i) => path(d.mgtK[i], xM, 0.8, CARD_GREY));
  if (Number.isFinite(oat)) {
    const live = [];
    for (let k = -2; k <= 102; k += 2) live.push([interp(d.oat.map((o, i) => [o, interp(d.mgtK[i], k, 1, 0)]), oat), k]);
    path(live, xM, 2, accent);
  }
  x.restore();

  if (res) {
    x.setLineDash([6, 4]); x.strokeStyle = accent; x.lineWidth = 1.6;
    x.beginPath();
    x.moveTo(xT(tq), T); x.lineTo(xT(tq), yk(res.K));
    x.lineTo(xM(res.maxMGT), yk(res.K)); x.lineTo(xM(res.maxMGT), B);
    x.stroke(); x.setLineDash([]);
    x.fillStyle = accent;
    [[xT(tq), yk(res.K)], [xM(res.maxMGT), yk(res.K)]].forEach(([cx, cy]) => {
      x.beginPath(); x.arc(cx, cy, 3.6, 0, 7); x.fill();
    });
    x.font = F(700, 17); x.textAlign = "center";
    x.fillText(fmt(res.maxMGT, 0), xM(res.maxMGT), B + 34);
  }

  x.strokeStyle = "#9aabb1"; x.lineWidth = 1;
  x.strokeRect(L, T, R - L, B - T);
  x.beginPath(); x.moveTo(M, T); x.lineTo(M, B); x.stroke();
  x.fillStyle = CARD_INK3; x.font = F(600, 10.5); x.textAlign = "left";
  x.fillText("ENGINE TORQUE — PERCENT", L, T - 22);
  x.textAlign = "right";
  x.fillText("MEASURED GAS TEMPERATURE — °C", R, T - 22);
}

/* ------------------------------ share card ------------------------------ */

export async function drawCard({ aircraft, chart, frame, meta, title, readings, reg, date, hours, oat, pa, tq, result, accent }) {
  const W = 1000, H = 780, SC = 2;
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

  drawNomogram(x, { L: 46, T: 316, R: W - 46, B: 692 }, chart, frame, tq, pa, oat, result, accent);

  x.fillStyle = CARD_INK; x.font = F(600, 12.5); x.textAlign = "left";
  x.fillText(meta.src, 40, 748);
  x.fillStyle = CARD_INK3; x.font = FB(500, 11);
  x.fillText(meta.cond, 40, 766);

  return new Promise((res) => cv.toBlob(res, "image/png"));
}
