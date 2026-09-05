/* Reading a printed chart.

   interp fits a line through the two points bracketing x — the same walk as
   the workbook's FORECAST(x, OFFSET(knownY, MATCH(x,knownX,1)-1,0,2), ...) —
   and bracket exposes which pair that was, so callers can ask what the chart
   actually covers there. Neither clamps: staying inside the printed grid is
   the caller's job, and every procedure is expected to do it. */

export function interp(pts, x, xi = 0, yi = 1) {
  const n = pts.length;
  let idx = 0;
  for (let i = 0; i < n; i++) if (pts[i][xi] <= x) idx = i;
  if (idx >= n - 1) idx = n - 2;
  let a = pts[idx], b = pts[idx + 1], j = idx;
  while (a[xi] === b[xi] && j > 0) { j--; a = pts[j]; b = pts[j + 1]; }
  j = idx;
  while (a[xi] === b[xi] && j + 2 < n) { j++; a = pts[j]; b = pts[j + 1]; }
  if (a[xi] === b[xi]) return a[yi];
  return a[yi] + ((x - a[xi]) * (b[yi] - a[yi])) / (b[xi] - a[xi]);
}

export function bracket(xs, x) {
  const n = xs.length;
  let idx = 0;
  for (let i = 0; i < n; i++) if (xs[i] <= x) idx = i;
  if (idx >= n - 1) idx = n - 2;
  return [idx, idx + 1];
}

export const span = (xs) => [Math.min(...xs), Math.max(...xs)];
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
