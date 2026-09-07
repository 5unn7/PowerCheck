export const num = (v) => (v === "" || v === null || v === undefined ? NaN : Number(v));
export const fmt = (v, d = 1) => (Number.isFinite(v) ? v.toFixed(d) : "—");
export const uid = () => Math.random().toString(36).slice(2, 10);

/* Local date, not UTC: a check flown at 18:00 in UTC-7 belongs to that day,
   and toISOString() would file it under tomorrow. */
export const todayISO = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
export const isISODate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));

/* Green or red, and nothing else.

   The check answers one question — did the engine meet the chart's figure or
   did it not — and the sign of the margin is the whole answer. An engineer
   reading fig 4-1 by hand draws two lines and takes a number off the axis;
   they do not get a paragraph with it, and neither should this. No verdict
   wording, no advice about what to do next, no third colour for "nearly":
   the number is the answer and the colour says which side of zero it is on.

   `color` is for the page, `hex` for the shared card: canvas cannot resolve a
   CSS variable and silently keeps the last fill, which drew every card grey. */
export function statusOf(margin) {
  if (!Number.isFinite(margin)) return { key: "none", color: "var(--ink-3)", hex: "#8b9ba1" };
  if (margin < 0) return { key: "fail", color: "var(--red)", hex: "#9c211a" };
  return { key: "ok", color: "var(--green)", hex: "#0d6a4d" };
}
