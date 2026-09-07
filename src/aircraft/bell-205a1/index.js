import charts from "./charts.json" with { type: "json" };
import * as check from "./powercheck.js";

/* Bell 205A-1, Lycoming T53 — maximum power (torquemeter pressure) check.

   Traced from the MAXIMUM POWER CHECK CHART on page 5-7 of each of the three
   flight manuals. This is the first type in the app split by **serial number**
   rather than by something bolted to the aircraft: three manuals, three
   approvals, three separately traced charts. They came out agreeing with each
   other everywhere to better than 0.30 PSI, which is inside the tolerance the
   printed page holds itself to — but they stay three data sets, because three
   approvals are three approvals.

   The check answers with a torquemeter pressure the engine must reach, so the
   margin is in PSI. See powercheck.js for the walk and for why the drawn
   extent of each curve is the whole of the gate. */

export default {
  id: "bell-205a1",
  label: "Bell 205A-1 · T53",
  powerplant: "Lycoming T53",
  check,
  charts,

  inputs: [
    { key: "pa", label: "Press alt", unit: "ft", placeholder: "4000" },
    { key: "oat", label: "OAT", unit: "°C", placeholder: "30" },
    { key: "psi", label: "Torque press", unit: "PSI", placeholder: "44.5" },
  ],

  /* Which manual covers this airframe is a property of the airframe — set once
     per tail, remembered, and it does not split the trend. */
  options: [
    {
      key: "serial", scope: "fitted", type: "segmented", label: "Serial", default: "fm3",
      choices: [
        { id: "fm1", label: "30001–30052" },
        { id: "fm2", label: "30053–30127" },
        { id: "fm3", label: "30128 and subs" },
      ],
    },
  ],
  variantFor: (c) => c.serial,

  meta: {
    fm1: {
      src: "BHT-205A1-FM-1 · maximum power check chart · SN 30001 through 30052",
      rev: "FAA approved, 18 OCT 1968 · Rev 11 · page 5-7",
      cond: "Climb at best climb speed, 100% N2 · increase collective, not exceeding 54 PSI, until N2 drops to 98% with the governor RPM switch beeped to full increase · do not exceed 54 PSI torque at any time. To be conclusive the check must be flown where full throttle produces no more than 54.0 PSI. Recorded N1 shall be within ±0.5% of the placarded maximum gas producer speed for takeoff power.",
    },
    fm2: {
      src: "BHT-205A1-FM-2 · maximum power check chart · SN 30053 through 30127",
      rev: "FAA approved, 18 OCT 1968 · Rev 11 · page 5-7",
      cond: "Climb at best climb speed, 100% N2 · increase collective, not exceeding 54 PSI, until N2 drops to 98% with the governor RPM switch beeped to full increase · do not exceed 54 PSI torque at any time. To be conclusive the check must be flown where full throttle produces no more than 54.0 PSI. Recorded N1 shall be within ±0.5% of the placarded maximum gas producer speed for takeoff power.",
    },
    fm3: {
      src: "BHT-205A1-FM-3 · maximum power check chart · SN 30128 and subsequent",
      rev: "FAA approved, 18 OCT 1968 · Rev 13 · page 5-7",
      cond: "Climb at best climb speed, 100% N2 · increase collective, not exceeding 54 PSI, until N2 drops to 98% with the governor RPM switch beeped to full increase · do not exceed 54 PSI torque at any time. To be conclusive the check must be flown where full throttle produces no more than 54.0 PSI. Recorded N1 shall be within ±0.5% of the placarded maximum gas producer speed for takeoff power.",
    },
  },

  /* This type's own axes and its own dial range, in PSI. The dial range is
     presentation, not manual data, and each type states its own so none
     inherits another's. */
  frame: { pa: [0, 21000], psi: [22, 58], paTick: 4000, psiTick: 4 },
  gauge: [-8, 12],

  marginUnit: "PSI",
  marginLabel: "Torque margin",

  footer: "Traced from BHT-205A1-FM-1/2/3 page 5-7. Each sheet reproduces its own drawn example to within 0.03 PSI. Trending aid — the flight manual is the authority.",

  /* Page 5-6 of all three manuals prints the same example: Hp 4000 ft, OAT
     30 °C, observed 44.5 PSI, N1 96.6% -> chart 43.1 PSI.

     The tolerance is 0.35 PSI and it is the paper's, not the tracing's. On
     every sheet Bell's own construction line down from point C sits to the
     right of Bell's own printed number — 43.34, 43.28 and 43.27 PSI against a
     stated 43.1 — so the drawing and the text disagree by up to 0.24 PSI. The
     trace lands within 0.03 PSI of each sheet's drawn line, which is as close
     to right as the page allows. */
  verify: [
    { config: { serial: "fm1" }, pa: 4000, oat: 30, psi: 44.5, expect: { chartPsi: 43.1 },
      source: "BHT-205A1-FM-1 page 5-6" },
    { config: { serial: "fm2" }, pa: 4000, oat: 30, psi: 44.5, expect: { chartPsi: 43.1 },
      source: "BHT-205A1-FM-2 page 5-6" },
    { config: { serial: "fm3" }, pa: 4000, oat: 30, psi: 44.5, expect: { chartPsi: 43.1 },
      source: "BHT-205A1-FM-3 page 5-6" },
  ],
};
