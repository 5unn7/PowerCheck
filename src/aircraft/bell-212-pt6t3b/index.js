import charts from "./charts.json" with { type: "json" };
import * as check from "./powercheck.js";

/* Bell 212, Pratt & Whitney PT6T-3B Twin-Pac — hover and in-flight power
   assurance checks, from BHT-212VFR-FM-1 fig 4-1.

   A different engine model from the PT6T-3 in the folder next door, and a
   different kind of chart: four nomogram sheets where the -3 gets one printed
   table. It is its own type for both reasons.

   Four sheets reduce to two charts here. The sheets pair off by gas producer
   gage part number — -101 and -113 — and that gage changes the N1 scale and
   nothing else. With the gas producer half out of scope, the -101 hover sheet
   and the -113 hover sheet are two drawings of the same thing, as are the two
   in-flight sheets. That is not an assumption: traced independently they agree
   to a few tenths of a degree, and the agreement is what stands in for the
   worked example this figure does not print. See docs/pending-charts.md. */

export default {
  id: "bell-212-pt6t3b",
  label: "Bell 212 · PT6T-3B",
  powerplant: "Pratt & Whitney PT6T-3B Twin-Pac",
  check,
  charts,

  inputs: [
    { key: "tq", label: "Eng torque", unit: "%", placeholder: "58" },
    { key: "pa", label: "Press alt", unit: "ft", placeholder: "2000" },
    { key: "oat", label: "OAT", unit: "°C", placeholder: "10" },
    { key: "itt", label: "ITT", unit: "°C", placeholder: "700" },
  ],

  /* Both of these are properties of *this* check, not of the aircraft, so both
     are chosen every time and both split the trend.

     Flight state, because §4-2-A says so outright: "Hover check is performed
     prior to takeoff and in-flight check is provided for periodic in-flight
     monitoring of engine performance. Either power assurance check may be
     selected at discretion of pilot." Two checks the pilot picks between,
     drawn from different data — not one check flown two ways, which is what
     the 407's chart is and why that type has no such option.

     Engine, because fig 4-1 says "REPEAT CHECK USING OTHER ENGINE". Two
     engines on one trend line is two engines' deterioration averaged into a
     slope belonging to neither. */
  options: [
    {
      key: "flight", scope: "check", type: "segmented", label: "Check", default: "hover",
      choices: [{ id: "hover", label: "Hover" }, { id: "inflight", label: "In flight" }],
    },
    {
      key: "engine", scope: "check", type: "segmented", label: "Engine", default: "1",
      choices: [{ id: "1", label: "Engine 1" }, { id: "2", label: "Engine 2" }],
    },
  ],
  // the engine chooses nothing on the page; it only labels the log entry
  variantFor: (c) => c.flight,

  meta: {
    hover: {
      src: "BHT-212VFR-FM-1 fig 4-1 · PT6T-3B power assurance check (hover)",
      rev: "FAA approved · Rev 9, 24 MAY 2022 · sheets 1 and 3 of 4, pages 4-7 and 4-9",
      cond: "Hover, other engine at idle · N2 97% · heater/ECU off · test engine throttle full open and frictioned · collective increased to greater than 700 °C ITT, not exceeding 810 °C ITT, 101.8% gas producer or 63.9% engine torque · stabilise power one minute, then record Hp, OAT, torque and ITT · if a limit is exceeded, repeat stabilising four minutes · repeat the check on the other engine · throttles full open before takeoff. §4-2-A: a check should be performed daily, and additionally if unusual operating conditions or indications arise; either check may be selected at the pilot's discretion. §4-1: the data are for the basic helicopter, without optional equipment that would appreciably affect lift, drag or power available.",
    },
    inflight: {
      src: "BHT-212VFR-FM-1 fig 4-1 · PT6T-3B power assurance check (in flight)",
      rev: "FAA approved · Rev 9, 24 MAY 2022 · sheets 2 and 4 of 4, pages 4-8 and 4-10",
      cond: "Level flight above 1000 ft AGL, 100 KIAS or VNE if less · N2 97% · heater/ECU off · test engine throttle full open and frictioned, other engine decreased slowly until the test engine torque is in range, not exceeding 810 °C ITT, 101.8% gas producer or 63.9% engine torque · stabilise power one minute, then record Hp, OAT, torque and ITT · if a limit is exceeded, repeat stabilising four minutes · repeat the check on the other engine. §4-2-A: it is the pilot's responsibility to accomplish the procedure safely, considering passenger load, terrain being overflown, and the qualifications of persons on board to assist in watching for other air traffic and recording power check data. §4-1: the data are for the basic helicopter, without optional equipment that would appreciably affect lift, drag or power available.",
    },
  },

  /* This type's own axes and its own dial range, in °C of ITT margin. The dial
     range is presentation, not manual data, and each type states its own so
     none inherits another's. */
  frame: { tq: [40, 88], carry: [0, 35], itt: [500, 840], tqTick: 10, ittTick: 50 },
  gauge: [-20, 60],

  marginUnit: "°C",
  marginLabel: "ITT margin",

  footer: "Traced from BHT-212VFR-FM-1 fig 4-1. Figure 4-1 prints no worked example, so each chart is built from two independently traced plates that agree to a few tenths of a degree. Gas producer is not read here. Trending aid — the flight manual is the authority.",

  /* Figure 4-1 prints no worked example anywhere in Section 4, so there is
     nothing to put in `verify` — see docs/pending-charts.md for what stands in
     its place. `sample` is simply a reading that lands on the chart, so the
     suite has somewhere to start. */
  verify: [],
  sample: { config: { flight: "hover", engine: "1" }, tq: 58, pa: 2000, oat: 10, itt: 700 },
};
