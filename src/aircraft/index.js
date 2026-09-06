import bell407 from "./bell-407.js";
import bell212 from "./bell-212-pt6t3.js";
import * as torqueKMgt from "../procedures/torque-k-mgt/index.js";
import * as setTorqueOatLimits from "../procedures/set-torque-oat-limits/index.js";

/* Adding an aircraft is two steps: digitise its charts into a .charts.json,
   and add a definition module next to bell-407.js describing its inputs,
   its fitted options and its published examples. Register both here.

   An aircraft whose flight manual walks a different chart — Ng and TOT
   rather than torque and MGT — also needs a procedure module, which is the
   only place that knows the shape of the walk. Nothing in the app does. */

export const PROCEDURES = {
  "torque-k-mgt": torqueKMgt,
  "set-torque-oat-limits": setTorqueOatLimits,
};

export const AIRCRAFT = [bell407, bell212];

export const byId = (id) => AIRCRAFT.find((a) => a.id === id) || AIRCRAFT[0];
export const procedureFor = (aircraft) => PROCEDURES[aircraft.procedure];

/* The chart a set of fitted options selects, plus the frame it is drawn on. */
export function chartFor(aircraft, config) {
  const variant = aircraft.variantFor(config);
  return { variant, chart: aircraft.charts[variant], meta: aircraft.meta[variant] };
}

export function frameFor(aircraft) {
  return aircraft.frame || procedureFor(aircraft).DEFAULT_FRAME;
}

/* Defaults for an aircraft's fitted options. */
export const defaultConfig = (aircraft) =>
  Object.fromEntries(aircraft.options.map((o) => [o.key, o.default]));

/* ---------------------------- option scope ----------------------------

   Two kinds of option select a chart, and they look identical from here —
   but they must not behave the same.

   "fitted"  is a property of the airframe: the inlet, snow deflectors, a
             gage part number, a serial range. It changes once in an
             aircraft's life, so it is remembered per tail and set once.

   "check"   is a property of *this* check: which engine was measured. It
             is chosen every time.

   Only what a flight manual itself distinguishes belongs here. The 407's
   chart is headed "hover or level flight" — one check, either way of
   flying it — so how it was flown is a condition, not an option, and it
   is not recorded. The 212's is run one engine at a time and logged per
   engine, so the engine is.

   The distinction matters in exactly one place, and it is the important
   one: a trend line may only join the same measurement of the same thing.
   Joining engine 1 to engine 2 averages two engines' deterioration into a
   slope belonging to neither. So check-scope options partition the log. */

export const fittedOptions = (a) => a.options.filter((o) => o.scope !== "check");
export const checkOptions = (a) => a.options.filter((o) => o.scope === "check");

/* The trend a record belongs to. Records logged before an aircraft grew a
   check-scope option carry no value for it; they group under their own key
   rather than being merged into one of the new ones, because which one
   they were is not something the log knows. */
export function seriesKey(record) {
  const parts = checkOptions(byId(record.aircraft))
    .map((o) => `${o.key}=${(record.config || {})[o.key] ?? "?"}`);
  return [record.reg, record.aircraft, ...parts].join("|");
}

export function seriesLabel(record) {
  const parts = checkOptions(byId(record.aircraft)).map((o) => {
    const v = (record.config || {})[o.key];
    if (v === undefined || v === null) return "not recorded";
    if (o.type === "switch") return `${o.label} ${v ? "on" : "off"}`;
    const c = o.choices.find((x) => x.id === v);
    return c ? c.label : String(v);
  });
  return [record.reg, ...parts].join(" · ");
}
