import charts from "./bell-407.charts.json" with { type: "json" };

/* Bell 407, Rolls-Royce 250-C47B.

   Charts digitised from BHT-407-FM-1 fig 4-1 (basic inlet, also read for the
   AFS), BHT-407-FMS-3 fig 4-1 (particle separator kit) and BHT-407-FMS-4
   fig 4-1 (snow deflector kit). The snow deflector supplement governs
   whatever inlet is fitted underneath it, so it is one chart, not two. */

export default {
  id: "bell-407",
  label: "Bell 407",
  procedure: "torque-k-mgt",
  charts,

  // what the crew reads off the panel
  inputs: [
    { key: "tq", label: "Torque", unit: "%", placeholder: "70.9" },
    { key: "mgt", label: "MGT", unit: "°C", placeholder: "619" },
    { key: "oat", label: "OAT", unit: "°C", placeholder: "12" },
    { key: "pa", label: "Press alt", unit: "ft", placeholder: "4000" },
  ],

  /* What is fitted picks the chart; how it was flown does not, on this
     aircraft — FM-1 and FMS-3 are both read in the hover or in level
     flight. It is still recorded and still partitions the trend: the two
     are different measurements, and a hover reading plotted onto a
     level-flight line moves the slope without the engine having changed.
     FMS-4 is level flight only, so the snow deflectors withdraw hover. */
  options: [
    {
      key: "inlet", type: "segmented", default: "basic",
      choices: [
        { id: "basic", label: "Basic / AFS" },
        { id: "ps", label: "Particle separator" },
      ],
    },
    { key: "snow", type: "switch", label: "Snow deflectors", default: false },
    {
      key: "mode", scope: "check", type: "segmented", label: "Flown", default: "level",
      choices: [
        { id: "hover", label: "Hover", when: ({ snow }) => !snow },
        { id: "level", label: "Level flight" },
      ],
    },
  ],
  variantFor: ({ inlet, snow }) => (snow ? "psb" : inlet),

  meta: {
    basic: {
      src: "BHT-407-FM-1 fig 4-1 · basic inlet, read for AFS",
      cond: ({ mode }) => `${mode === "hover" ? "Hover" : "Level flight 85–105 KIAS"} · generator 35 A or less · power turbine 100% · heater, ECS and anti-ice off`,
    },
    ps: {
      src: "BHT-407-FMS-3 fig 4-1 · particle separator kit",
      cond: ({ mode }) => `${mode === "hover" ? "Hover" : "Level flight 85–105 KIAS"} · separator purge off · generator 35 A or less · power turbine 100% · heater, ECS and anti-ice off`,
    },
    psb: {
      src: "BHT-407-FMS-4 fig 4-1 · snow deflector kit",
      cond: "Level flight only, 85–105 KIAS · separator purge off · generator 35 A or less · power turbine 100% · heater, ECS and anti-ice off",
    },
  },

  // minimum K below which the chart is not read — the C47B avoid area
  kMin: (oat) => ((oat + 32.5) * 12.25) / 78.5,

  marginLabel: "MGT margin",
  footer: "Charts digitised from BHT-407-FM-1 (fig 4-1, 4-2), FMS-3 and FMS-4. Trending aid — the flight manual is the authority.",

  /* Each chart's own published example. These are the acceptance tests: a
     chart that cannot reproduce the number printed beside it is digitised
     wrong, and test/charts.test.mjs fails the build over it. */
  verify: [
    { config: { inlet: "basic", snow: false }, oat: 10, pa: 6000, tq: 70, mgt: 600,
      expect: { maxMGT: 676 }, source: "BHT-407-FM-1 fig 4-1" },
    { config: { inlet: "ps", snow: false }, oat: 10, pa: 6000, tq: 70, mgt: 600,
      expect: { maxMGT: 682 }, source: "BHT-407-FMS-3 fig 4-1" },
    { config: { inlet: "basic", snow: true }, oat: 10, pa: 6000, tq: 70, mgt: 600,
      expect: { maxMGT: 722 }, source: "BHT-407-FMS-4 fig 4-1" },
  ],
};
