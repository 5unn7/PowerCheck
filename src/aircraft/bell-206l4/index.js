import charts from "./charts.json" with { type: "json" };
import * as check from "./powercheck.js";

/* Bell 206L-4 (and 206L-1+ / 206L-3+ with the IGW upgrade kit), Rolls-Royce
   250-C30P — level flight power assurance check.

   Traced from BHT-206L4-FM-1 fig 4-1, a two-carpet nomogram. Unlike the 407
   and the 212, this chart answers with a *torque*: the minimum the engine
   must be making at the observed TOT, OAT and pressure altitude. The crew
   compares that against the torque on the gauge.

   Three charts: the basic aircraft from BHT-206L4-FM-1, and the two sheets of
   BHT-206L4-FMS-7 fig 4-1 for the snow deflector, with and without a particle
   separator. BHT-206L4-FMS-3 carries no chart of its own — it gives a torque
   correction instead, which is a different thing and is not applied here. */

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

  /* What is fitted to the inlet is a property of the airframe: set once per
     tail, remembered, and it does not split the trend. FMS-7 §4-2 makes the
     three-way split explicit — "The first chart is to be used for helicopters
     equipped with snow deflectors. The second chart is to be used for
     helicopters equipped with snow deflectors and particle separator."

     The particle separator purge switch is deliberately not offered. §4-2:
     "PARTICLE SEP PRG switch (if installed) shall be ON when performing a
     power assurance check." That makes it a condition of the check, not a
     choice, so it belongs in the conditions block and nowhere else. */
  options: [
    {
      key: "kit", scope: "fitted", type: "segmented", label: "Inlet", default: "basic",
      choices: [
        { id: "basic", label: "Basic" },
        { id: "snow", label: "Snow deflector" },
        { id: "snowps", label: "Snow + particle sep" },
      ],
    },
  ],
  variantFor: (c) => c.kit,

  meta: {
    basic: {
      src: "BHT-206L4-FM-1 fig 4-1 · 206L-4 power assurance check",
      rev: "TC approved · Rev 2, 22 AUG 2008 · page 4-7",
      cond: "Level flight, 85 to 105 KIAS (not to exceed VNE) · power turbine (N2) 100% RPM · DC load 17.5% · engine anti-ice off · heater / ECS off",
    },
    snow: {
      src: "BHT-206L4-FMS-7 fig 4-1 sheet 1 of 2 · with snow deflector",
      rev: "TC approved · 19 OCT 2011 · page 4",
      cond: "Level flight, 90 to 100 KIAS (not to exceed VNE) · power turbine (N2) 100% RPM · DC load 17.5% · engine anti-ice off · heater / ECS off. §4-1: due to reduced performance at higher temperatures it is recommended that snow deflectors be removed above 20 °C (68 °F).",
    },
    snowps: {
      src: "BHT-206L4-FMS-7 fig 4-1 sheet 2 of 2 · with snow deflector and particle separator",
      rev: "TC approved · 19 OCT 2011 · page 5",
      cond: "Level flight, 90 to 100 KIAS (not to exceed VNE) · power turbine (N2) 100% RPM · DC load 17.5% · engine anti-ice off · heater / ECS off · particle separator purge ON — §4-2: the PARTICLE SEP PRG switch, if installed, shall be ON when performing a power assurance check. §4-1: due to reduced performance at higher temperatures it is recommended that snow deflectors be removed above 20 °C (68 °F).",
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


  footer: "Traced from BHT-206L4-FM-1 fig 4-1 and BHT-206L4-FMS-7 fig 4-1. FM-1's own worked example reads 64.9% against its printed 65%. Trending aid — the flight manual is the authority.",

  /* The example printed on the chart: OAT 25 °C, TOT 720 °C, Hp 12,000 ft,
     arrows drawn to 65% minimum torque available. */
  verify: [
    { config: { kit: "basic" }, oat: 25, tot: 720, pa: 12000, tq: 68,
      expect: { minTq: 65 },
      source: "BHT-206L4-FM-1 fig 4-1, the example drawn on the chart" },
  ],
};
