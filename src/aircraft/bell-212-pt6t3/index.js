import charts from "./charts.json" with { type: "json" };
import * as check from "./powercheck.js";

/* Bell 212, Pratt & Whitney PT6T-3 Twin-Pac — ground power assurance check.

   Transcribed from BHT-212VFR-FM-1 fig 4-2, which publishes the check as two
   numeric tables rather than a nomogram, so the data here is the printed
   numbers rather than a tracing.

   The check is per engine: stabilise No. 1 at 97% N2 and the Chart A torque
   for the day's pressure altitude with No. 2 at idle, read N1 and ITT, then
   repeat with the engines swapped. Log each engine under its own entry. */

export default {
  id: "bell-212-pt6t3",
  label: "Bell 212 · PT6T-3",
  // named on the aircraft page, where the type is chosen
  powerplant: "Pratt & Whitney PT6T-3 Twin-Pac",
  check,
  charts,

  inputs: [
    { key: "pa", label: "Press alt", unit: "ft", placeholder: "1500" },
    { key: "oat", label: "OAT", unit: "°C", placeholder: "20" },
    { key: "n1", label: "Gas prod N1", unit: "%", placeholder: "95.2" },
    { key: "itt", label: "ITT", unit: "°C", placeholder: "710" },
  ],

  /* The manual's check is run one engine at a time, so which one is being
     logged is chosen every check — never remembered, and it splits the
     trend. Two engines on one line is two engines' deterioration averaged
     into a slope belonging to neither.

     The PT6T-3B's fig 4-1 adds hover and in-flight sheets, and those
     belong on their own entry: a different engine model, and a check
     flown a different way. See docs/pending-charts.md. */
  options: [
    {
      key: "engine", scope: "check", type: "segmented", label: "Engine", default: "1",
      choices: [{ id: "1", label: "Engine 1" }, { id: "2", label: "Engine 2" }],
    },
  ],
  // one table serves both engines; the choice only labels the log entry
  variantFor: () => "ground",

  meta: {
    ground: {
      src: "BHT-212VFR-FM-1 fig 4-2 · PT6T-3 power assurance check (ground)",
      rev: "FAA approved · Rev 5, 17 OCT 2011 · page 4-11",
      cond: "On ground, other engine at idle · 97% N2 · stabilise 4 minutes minimum at chart A torque · heater off",
    },
  },

  /* This type's own axes and its own dial range, in °C of ITT margin. See
     the note in bell-407.js: the dial range is presentation, not manual
     data, and each type states its own so none inherits another's. */
  frame: { oat: [-60, 55], itt: [500, 830], n1: [84, 102] },
  gauge: [-20, 60],

  /* BHT-212VFR-FM-1 fig 4-2 step 8: "OBSERVED GAS PROD (N1) RPM AND ITT
     MUST BE LESS THAN CHART GAS PROD (N1) RPM AND ITT FOR OBSERVED OAT." */
  passNote: "Observed gas producer speed and ITT are both below the chart figures for this OAT.",

  /* BHT-212VFR-FM-1 fig 4-2 step 10: "If OBSERVED GAS PROD (N1) RPM AND/OR
     ITT ARE GREATER THAN CHART B ... FOR OBSERVED OAT, STEPS SHOULD BE TAKEN
     TO DETERMINE CAUSE OF POWER LOSS." */
  failNote: "Steps should be taken to determine the cause of power loss.",

  marginUnit: "°C",
  marginLabel: "ITT margin",
  footer: "Tables transcribed from BHT-212VFR-FM-1 fig 4-2. Check each engine in turn, and hover IGE to confirm torque needle split is no greater than 4%. Trending aid — the flight manual is the authority.",

  /* The example printed on the page: Hp 1500 gives 47.0% torque, and at OAT
     20 the limits are 96.3% N1 and 735 °C ITT. */
  verify: [
    { config: { engine: "1" }, pa: 1500, oat: 20, n1: 95.2, itt: 710,
      expect: { setTq: 47.0, maxN1: 96.3, maxITT: 735 },
      source: "BHT-212VFR-FM-1 fig 4-2" },
  ],
};
