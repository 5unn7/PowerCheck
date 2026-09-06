import charts from "./charts.json" with { type: "json" };
import * as check from "./powercheck.js";

/* Bell 407, Rolls-Royce 250-C47B.

   Charts digitised from BHT-407-FM-1 fig 4-1 (basic inlet, also read for the
   AFS), BHT-407-FMS-3 fig 4-1 (particle separator kit) and BHT-407-FMS-4
   fig 4-1 (snow deflector kit). The snow deflector supplement governs
   whatever inlet is fitted underneath it, so it is one chart, not two. */

export default {
  id: "bell-407",
  label: "Bell 407",
  check,
  charts,

  // what the crew reads off the panel
  inputs: [
    { key: "tq", label: "Torque", unit: "%", placeholder: "70.9" },
    { key: "mgt", label: "MGT", unit: "°C", placeholder: "619" },
    { key: "oat", label: "OAT", unit: "°C", placeholder: "12" },
    { key: "pa", label: "Press alt", unit: "ft", placeholder: "4000" },
  ],

  /* What is fitted, and which chart that selects.

     The engine model never changes an answer — one chart serves all three
     models wherever it covers them — but it decides whether a chart applies
     at all. FMS-3 and FMS-4 are titled for the C47B, C47B/8 and C47E/4;
     BHT-407-FM-1 is titled for the C47B and C47B/8 only, so a C47E/4 on a
     basic inlet has no chart here and is refused rather than read off a
     page that does not name it. */
  options: [
    {
      key: "engine", type: "segmented", default: "c47b",
      choices: [
        { id: "c47b", label: "250-C47B" },
        { id: "c47b8", label: "C47B/8" },
        { id: "c47e4", label: "C47E/4" },
      ],
    },
    {
      key: "inlet", type: "segmented", default: "basic",
      choices: [
        { id: "basic", label: "Basic / AFS" },
        { id: "ps", label: "Particle separator" },
      ],
    },
    { key: "snow", type: "switch", label: "Snow deflectors", default: false },
  ],
  variantFor: ({ inlet, snow, engine }) => {
    if (snow) return "psb";                        // FMS-4 covers all three
    if (inlet === "ps") return "ps";               // FMS-3 covers all three
    return engine === "c47e4" ? null : "basic";    // FM-1 does not name the E/4
  },

  /* Why there is no chart, in the crew's terms. Silence here would leave a
     blank screen where an answer belongs. This must stay exactly the
     complement of variantFor — the snow deflector case reads FMS-4, which
     does name the E/4 — and the test suite asserts that across every
     combination rather than trusting the two to be read together. */
  noChart: ({ engine, inlet, snow }) =>
    engine === "c47e4" && inlet === "basic" && !snow
      ? "BHT-407-FM-1 fig 4-1 is titled for the 250-C47B and 250-C47B/8 only, so it is not read for a 250-C47E/4. Use the supplement that covers this installation."
      : null,

  meta: {
    basic: {
      src: "BHT-407-FM-1 fig 4-1 · basic inlet, read for AFS",
      rev: "TC approved · Rev 14, 28 MAR 2014 · page 4-7",
      cond: "Hover or level flight 85–105 KIAS, not above VNE · generator 35 A or less · power turbine 100% · heater, ECS and anti-ice off",
    },
    ps: {
      src: "BHT-407-FMS-3 fig 4-1 · particle separator kit",
      rev: "TC approved · Rev 1, 16 JAN 2018 · page 3",
      cond: "Hover or level flight 85–105 KIAS, not above VNE · separator purge off · generator 35 A or less · power turbine 100% · heater, ECS and anti-ice off",
    },
    psb: {
      src: "BHT-407-FMS-4 fig 4-1 · snow deflector kit",
      rev: "TC approved · Rev 1, 16 JAN 2018 · page 4",
      cond: "Level flight only, 85–105 KIAS, not above VNE · separator purge off · generator 35 A or less · power turbine 100% · heater, ECS and anti-ice off",
    },
  },

  // minimum K below which the chart is not read — the C47B avoid area
  kMin: (oat) => ((oat + 32.5) * 12.25) / 78.5,

  /* The axes BHT-407-FM-1 fig 4-1 is drawn on, and the range the margin
     dial spans. The dial range is presentation, chosen so this aircraft's
     margins sit legibly on it — it is not from the manual, and it is stated
     here rather than shared so no other type inherits a °C scale. */
  frame: { tq: [35, 100], mgt: [390, 790], k: [-2, 102], tqTick: 5, mgtTick: 25, kTick: 10 },
  gauge: [-10, 80],

  marginUnit: "°C",
  marginLabel: "MGT margin",
  footer: "Charts digitised from BHT-407-FM-1 (fig 4-1, 4-2), FMS-3 and FMS-4. Trending aid — the flight manual is the authority.",

  /* Each chart's own published example. These are the acceptance tests: a
     chart that cannot reproduce the number printed beside it is digitised
     wrong, and test/charts.test.mjs fails the build over it. */
  verify: [
    { config: { engine: "c47b", inlet: "basic", snow: false }, oat: 10, pa: 6000, tq: 70, mgt: 600,
      expect: { maxMGT: 676 }, source: "BHT-407-FM-1 fig 4-1" },
    { config: { engine: "c47e4", inlet: "ps", snow: false }, oat: 10, pa: 6000, tq: 70, mgt: 600,
      expect: { maxMGT: 682 }, source: "BHT-407-FMS-3 fig 4-1" },
    { config: { engine: "c47e4", inlet: "basic", snow: true }, oat: 10, pa: 6000, tq: 70, mgt: 600,
      expect: { maxMGT: 722 }, source: "BHT-407-FMS-4 fig 4-1" },
  ],
};
