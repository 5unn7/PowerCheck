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

/* `color` is for the page, `hex` for the shared card: canvas cannot resolve a
   CSS variable and silently keeps the last fill, which drew every card grey. */
export function statusOf(margin) {
  if (!Number.isFinite(margin)) return { key: "none", label: "", color: "var(--ink-3)", hex: "#8b9ba1" };
  if (margin < 0) return { key: "fail", label: "Over the limit", color: "var(--red)", hex: "#9c211a" };
  if (margin < 10) return { key: "watch", label: "Low margin", color: "var(--amber)", hex: "#ad5f0b" };
  return { key: "ok", label: "Serviceable", color: "var(--green)", hex: "#0d6a4d" };
}
