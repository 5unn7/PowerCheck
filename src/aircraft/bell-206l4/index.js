import charts from "./charts.json" with { type: "json" };
import * as check from "./powercheck.js";

/* Bell 206L-4 (and 206L-1+ / 206L-3+ with the IGW upgrade kit), Rolls-Royce
   250-C30P — level flight power assurance check.

   Traced from BHT-206L4-FM-1 fig 4-1, a two-carpet nomogram. Unlike the 407
   and the 212, this chart answers with a *torque*: the minimum the engine
   must be making at the observed TOT, OAT and pressure altitude. The crew
   compares that against the torque on the gauge.

   Only the basic aircraft is here. BHT-206L4-FMS-3 and BHT-206L4-FMS-7 carry
   their own charts for the inlet kits and those are not traced yet, so no
   option offers them — see docs/pending-charts.md. */

export default {
  id: "bell-206l4",
  label: "Bell 206L-4 · 250-C30P",
  powerplant: "Rolls-Royce 250-C30P",
  check,
  charts,

  inputs: [
    { key: "pa", label: "Press alt", unit: "ft", placeholder: "12000" },
    { key: "oat", label: "OAT", unit: "°C", placeholder: "25" },
    { key: "tot", label: "TOT", unit: "°C", placeholder: "720" },
    { key: "tq", label: "Torque", unit: "%", placeholder: "68" },
  ],

  /* Nothing about this airframe changes which chart is read, and the check is
     not run per engine, so there is nothing to choose and nothing to split
     the trend on. */
  options: [],
  variantFor: () => "basic",

  meta: {
    basic: {
      src: "BHT-206L4-FM-1 fig 4-1 · 206L-4 power assurance check",
      rev: "TC approved · Rev 2, 22 AUG 2008 · page 4-7",
      cond: "Level flight, 85 to 105 KIAS (not to exceed VNE) · power turbine (N2) 100% RPM · DC load 17.5% · engine anti-ice off · heater / ECS off",
    },
  },

  /* This type's own axes and its own dial range, in % of torque. See the note
     in bell-407/index.js: the dial range is presentation, not manual data, and
     each type states its own so none inherits another's. */
  frame: { oat: [-50, 50], carry: [0, 76], tq: [40, 100], oatTick: 10, tqTick: 10 },
  gauge: [-15, 25],

  /* The margin here is torque, not temperature. Positive means the engine made
     more than the chart's minimum. */
  marginUnit: "%",
  marginLabel: "Torque margin",

  /* Both verdicts restate the chart's own bottom axis — MINIMUM TORQUE
     AVAILABLE — and nothing more. Fig 4-1 prints no procedure on the chart
     page, and the Section 4 text around it has not been read, so unlike the
     407 and the 212 there is no next step here to hand the crew. Recorded in
     docs/pending-charts.md. */
  passNote: "Torque made is at or above the minimum the chart gives for these conditions.",
  failNote: "Torque made is below the minimum the chart gives for these conditions. Fig 4-1 prints no next step on the chart page — refer to the flight manual.",

  footer: "Traced from BHT-206L4-FM-1 fig 4-1. The chart's own worked example reads 64.9% against its printed 65%. Trending aid — the flight manual is the authority.",

  /* The example printed on the chart: OAT 25 °C, TOT 720 °C, Hp 12,000 ft,
     arrows drawn to 65% minimum torque available. */
  verify: [
    { config: {}, oat: 25, tot: 720, pa: 12000, tq: 68,
      expect: { minTq: 65 },
      source: "BHT-206L4-FM-1 fig 4-1, the example drawn on the chart" },
  ],
};
