import bell407 from "./bell-407.js";
import * as torqueKMgt from "../procedures/torque-k-mgt/index.js";

/* Adding an aircraft is two steps: digitise its charts into a .charts.json,
   and add a definition module next to bell-407.js describing its inputs,
   its fitted options and its published examples. Register both here.

   An aircraft whose flight manual walks a different chart — Ng and TOT
   rather than torque and MGT — also needs a procedure module, which is the
   only place that knows the shape of the walk. Nothing in the app does. */

export const PROCEDURES = {
  "torque-k-mgt": torqueKMgt,
};

export const AIRCRAFT = [bell407];

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
