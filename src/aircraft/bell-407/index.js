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
  // named on the aircraft page, where the type is chosen
  powerplant: "Rolls-Royce 250-C47 series",
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

     The AFS inlet barrier filter reads the basic inlet chart unchanged —
     ruled by the operator's licensed engineer, 2026. It is not the 206L
     arrangement, where the IBF supplement takes 3% off the torque.

     No engine model is asked. FM-1 is titled for the 250-C47B and C47B/8,
     and FMS-3 and FMS-4 add the 250-C47E/4; this operator has no C47E/4,
     so the app does not carry it and every model it does carry is covered
     by every chart here. If a C47E/4 ever joins the fleet, note that FM-1
     does not name it — see docs/engineering-review.md item 3. */
  options: [
    {
      key: "inlet", type: "segmented", default: "basic",
      choices: [
        { id: "basic", label: "Basic / AFS" },
        { id: "ps", label: "Particle separator" },
      ],
    },
    { key: "snow", type: "switch", label: "Snow deflectors", default: false },
  ],
  variantFor: ({ inlet, snow }) => (snow ? "psb" : inlet),

  meta: {
    basic: {
      src: "BHT-407-FM-1 fig 4-1 · basic inlet, read for AFS",
      rev: "TC approved · Rev 14, 28 MAR 2014 · page 4-7",
      cond: "Hover or level flight 85–105 KIAS, not above VNE · all sources of bleed air off, including engine anti-icing · generator 35 A or less · power turbine 100% · heater and ECS off",
    },
    ps: {
      src: "BHT-407-FMS-3 fig 4-1 · particle separator kit",
      rev: "TC approved · Rev 1, 16 JAN 2018 · page 3",
      cond: "Hover or level flight 85–105 KIAS, not above VNE · separator purge off · all sources of bleed air off, including engine anti-icing · generator 35 A or less · power turbine 100% · heater and ECS off",
    },
    psb: {
      src: "BHT-407-FMS-4 fig 4-1 · snow deflector kit",
      rev: "TC approved · Rev 1, 16 JAN 2018 · page 4",
      cond: "Level flight only, 85–105 KIAS, not above VNE · separator purge off · all sources of bleed air off, including engine anti-icing · generator 35 A or less · power turbine 100% · heater and ECS off",
    },
  },

  /* A low-torque cut-off, below which no margin is reported.

     Traced as far as it goes: the source workbook, sheet "Tq-pA" rows 68-72,
     labels it "Avoid Area" and draws a straight line through two points in
     (OAT, K) with TREND, which on two points is plain linear interpolation:

         OAT -32.5 °C  ->  K 0
         OAT  46.0 °C  ->  K 12.25

     The app reproduces the workbook to the digit — 6.9442675 at OAT 12.

     WHERE THOSE TWO POINTS CAME FROM IS NOT KNOWN. They are not marked on
     BHT-407-FM-1 fig 4-1; BHT-407-FM-1 4-2, which describes the whole check
     over a full page, does not mention an avoid area, a minimum torque or a
     cut-off of any kind; and the operator's licensed engineer does not know
     either. The workbook they come from was a sample test file, not a
     controlled document.

     It is kept because it only ever withholds an answer and never produces
     one, so keeping it errs conservative while its provenance is open. What
     it must not do is speak in the flight manual's voice, which is why the
     wording below says plainly whose rule it is. See
     docs/engineering-review.md item 2. */
  avoidArea: [[-32.5, 0], [46, 12.25]],
  kMinNote: "This cut-off is inherited from the operator's spreadsheet and has no source in the flight manual — repeat at higher torque, or read fig 4-1 directly.",
  kMin: (oat) => {
    const [[o0, k0], [o1, k1]] = [[-32.5, 0], [46, 12.25]];
    return k0 + ((k1 - k0) * (oat - o0)) / (o1 - o0);
  },

  /* The axes BHT-407-FM-1 fig 4-1 is drawn on, and the range the margin
     dial spans. The dial range is presentation, chosen so this aircraft's
     margins sit legibly on it — it is not from the manual, and it is stated
     here rather than shared so no other type inherits a °C scale. */
  frame: { tq: [35, 100], mgt: [390, 790], k: [-2, 102], tqTick: 5, mgtTick: 25, kTick: 10 },
  gauge: [-10, 80],

  /* Shop practice, not a flight manual figure — ruled by the operator's
     licensed engineer, 2026. The source workbook colours the margin red
     below zero and nothing else; this band was added by the operator on
     top of that, so the app shows it and says whose it is. */
  /* BHT-407-FM-1 4-2: "If actual MGT is greater than chart MGT, engine
     performance is less than minimum specification and all performance data
     contained in this manual cannot be achieved. Refer to BHT-407-MM to
     determine cause of low power (high MGT)." The app was reporting the
     failure without passing on what the manual says to do about it. */
  failNote: "Engine performance is below minimum specification and the performance data in the flight manual cannot be achieved. Refer to BHT-407-MM to determine the cause of low power (high MGT).",

  watchBelow: 10,
  watchNote: "10 °C is this operator's practice, not a flight manual figure.",

  marginUnit: "°C",
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
