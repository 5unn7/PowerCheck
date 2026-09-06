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

/* The sign of the margin is a fact: the reading was over the chart's maximum
   or it was not. Anything finer is a judgement, and a judgement belongs to
   one aircraft's approved data — never to a shared default applied to types
   whose margins are different quantities read off different charts. So an
   aircraft may supply watchBelow, in its own margin unit, when its manual
   gives such a figure. Neither of ours does, so neither sets one.

   `color` is for the page, `hex` for the shared card: canvas cannot resolve a
   CSS variable and silently keeps the last fill, which drew every card grey. */
export function statusOf(margin, aircraft) {
  if (!Number.isFinite(margin)) return { key: "none", label: "", color: "var(--ink-3)", hex: "#607076" };
  if (margin < 0) return { key: "fail", label: "Over the chart maximum", color: "var(--red)", hex: "#9c211a" };
  const watch = aircraft && aircraft.watchBelow;
  if (Number.isFinite(watch) && margin < watch)
    return { key: "watch", label: "Low margin", color: "var(--amber)", hex: "#ad5f0b" };
  return { key: "ok", label: "", color: "var(--green)", hex: "#0d6a4d" };
}
