import charts from "./bell-212-pt6t3.charts.json" with { type: "json" };

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
  engine: "Pratt & Whitney PT6T-3 Twin-Pac",
  blurb: "On the ground, one engine at a time. Pressure altitude sets the torque; OAT sets the N1 and ITT it must not exceed.",
  procedure: "set-torque-oat-limits",
  charts,

  inputs: [
    { key: "pa", label: "Press alt", unit: "ft", placeholder: "1500" },
    { key: "oat", label: "OAT", unit: "°C", placeholder: "20" },
    { key: "n1", label: "Gas prod N1", unit: "%", placeholder: "95.2" },
    { key: "itt", label: "ITT", unit: "°C", placeholder: "710" },
  ],

  // the manual's check is run one engine at a time, so which one is logged
  options: [
    {
      key: "engine", type: "segmented", default: "1",
      choices: [{ id: "1", label: "Engine 1" }, { id: "2", label: "Engine 2" }],
    },
  ],
  // one table serves both engines; the choice only labels the log entry
  variantFor: () => "ground",

  meta: {
    ground: {
      src: "BHT-212VFR-FM-1 fig 4-2 · PT6T-3 power assurance check (ground)",
      cond: "On ground, other engine at idle · 97% N2 · stabilise 4 minutes minimum at chart A torque · heater off",
    },
  },

  kMin: () => -Infinity,
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
