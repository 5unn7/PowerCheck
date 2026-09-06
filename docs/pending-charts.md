# Charts received, not yet digitised

The rules below are transcribed from the pages as sent — they are exact, and
they are the part that gets lost. What is missing in every case is the curve
data, which a scan of a nomogram does not give up. See **What is actually
blocking** at the end.

## Done

| Chart | Status |
|---|---|
| BHT-407-FM-1 / FMS-3 / FMS-4 fig 4-1 | digitised, verified against all three published examples |
| BHT-212VFR-FM-1 fig 4-2 · PT6T-3 ground | transcribed from the printed tables, verified against the page's example |
| BHT-212VFR-FM-1 fig 4-3 · density altitude | no data needed — computed analytically, and it reproduces the page's example (−15 °C at 6000 ft → 3847 ft against a chart read to the nearest 1000) |

## Bell 212 · PT6T-3B — BHT-212VFR-FM-1 fig 4-1, four sheets

A nomogram, unlike the PT6T-3's tables. Four sheets, and they are **not
interchangeable** — the gas producer gage part number changes the N1 scale:

| Sheet | Check | Gas producer gage P/N | N1 scale | N1 ceiling |
|---|---|---|---|---|
| 1 of 4 | hover | 212-075-037-101 | 85–105 | 100.8% |
| 2 of 4 | in-flight | 212-075-037-101 | 85–105 | 100.8% |
| 3 of 4 | hover | 212-075-037-113 | 86–106 | 101.8% |
| 4 of 4 | in-flight | 212-075-037-113 | 86–106 | 101.8% |

Walk: enter at indicated engine torque, up to Hp, right to OAT, up to read
maximum allowable ITT and maximum allowable N1.

Common to all four: N2 97%, heater/ECU off, do not exceed 810 °C ITT or 63.9%
engine torque. Hover sheets run the other engine at idle and call for
collective increase past 700 °C ITT; in-flight sheets want level flight above
1000 ft AGL at 100 KIAS or Vne, test engine throttle full open. Stabilise one
minute, and four minutes if a limit is exceeded before repeating.

These are a separate aircraft entry from the PT6T-3 already shipped — a
different engine model — with `mode` as a check-scope option (hover /
in-flight) and the gage part number as a fitted one. Two axes, four sheets.
See **Fitted, or per check?** in `docs/adding-an-aircraft.md`.

Procedure shape: **torque + Hp + OAT → (max ITT, max N1)**. A third shape —
neither the 407's nor the PT6T-3's. Chart bounds visible: torque 40–90%,
ITT 500–800, plus "bleed valve opens" boundaries and MAXIMUM FOR TAKEOFF /
MAXIMUM CONTINUOUS cutoffs that the gate will need to respect.

No worked example is printed — the sheets carry trace arrows but no numbers,
so there is nothing to verify a digitising against. **Send one worked set of
numbers per sheet** (any torque/Hp/OAT and the ITT and N1 it reads) or these
cannot be accepted under the rule that every chart proves itself.

## Bell 206L4 · Rolls-Royce 250-C30P

Three charts, and the walk is **inverted from the 407**: the chart yields a
*minimum torque available*, and the engine passes when the actual torque
indication is equal to or greater than it. The margin is in percent torque,
not °C.

| Chart | Configuration |
|---|---|
| BHT-206L4-FM-1 fig 4-1 | base, no kit |
| BHT-206L4-FMS-7 fig 4-1 sheet 1 of 2 | snow deflector |
| BHT-206L4-FMS-7 fig 4-1 sheet 2 of 2 | snow deflector + particle separator, purge on |

Walk: enter OAT, up to indicated TOT, right across, down to Hp, read minimum
torque available. Level flight, N2 100%, DC load 17.5%, anti-ice and heater
off. 85–105 KIAS on FM-1; 90–100 KIAS on the FMS-7 sheets.

**Constant torque offsets**, applied to the figure read off the chart. These
are exact and already captured here:

| Kit | Offset | Source |
|---|---|---|
| Particle separator (purge on) | **−5%** torque | BHT-206L4-FMS-3 §4-6 |
| Inlet Barrier Filter (IBF) | **−3%** torque | AFS supplement AFS-BH206L3L4-IBF-KIT-FMS |

FMS-3 example: 65% read, −5% → 60% minimum torque available with purge on.
IBF example: 76% read, −3% → 73%.

Two rules that must not be lost when this is built:

- With **snow deflectors** fitted, an IBF aircraft uses the *basic inlet with
  snow deflector* PAC chart from FMS-7, not the base chart.
- IBF operators otherwise use the latest **"particle separator purge off"**
  charts from FMS-3. The IBF and the particle separator are alternatives, not
  additive — do not let the UI offer both offsets at once.

Chart bounds: OAT −50 to 100 °C, TOT curves 460–768, Hp sea level to 16,000 ft,
torque 40–100%. There is an **"avoid this area (possible bleed valve open
area)"** region the gate must refuse inside, the same way the 407 refuses under
its K minimum.

Published example, on FM-1 only: OAT 25 °C, TOT 720 °C, Hp 12,000 ft →
**65% minimum torque available**. The two FMS-7 sheets carry no example, so
they need one each.

## Bell 205A-1 · Lycoming T53

Maximum power (torquemeter pressure) check. Three charts, split by **serial
number** — the app will need serial range as the configuration that picks the
chart, which no aircraft has needed so far:

| Chart | Serial numbers |
|---|---|
| BHT-205A1-FM-1 | 30001 through 30052 |
| BHT-205A1-FM-2 | 30053 through 30127 |
| BHT-205A1-FM-3 | 30128 and subsequent |

Walk: pressure altitude and OAT give an engine torquemeter pressure in PSI.
Separately, recorded N1 must be within ±0.5% of the placarded maximum gas
producer speed for takeoff power (N1 topping) — a second, independent pass
condition rather than a margin.

Chart bounds: torquemeter pressure 22–54 PSI, pressure altitude 0–20,000 ft,
OAT curves 53 °C down to −20/−54 °C, with an **OAT operating limit** boundary
and a **transmission torque limit** boundary, both of which the gate must
respect.

Points A, B and C are marked on all three sheets but carry no numbers, so
again: **one worked set per chart** before these can be accepted.

## What is actually blocking

Not the rules, and not the procedures — those are a day's work each once the
data exists. It is the curve coordinates.

The 407 data in this repo is precise to three decimals (`52.281, -0.078`).
That did not come from looking at a scan; the interpolation in
`src/engine/interp.js` still carries a comment matching it to a spreadsheet's
`FORECAST(x, OFFSET(knownY, MATCH(x, knownX, 1) - 1, 0, 2), ...)`. **Wherever
those points came from is the fastest path for these charts too** — send that
workbook, or the traced points in any form, and each of these becomes a
`.charts.json` plus a definition module.

Tracing curves off a 2550×1650 scan by eye is the alternative, and it is not
one I will do for flight data: the grid lines, the labels lying across the
curves and the crossing families all bias a tracing, and with no published
example on most of these sheets there would be nothing to catch the error.
A chart that cannot prove itself against a printed answer does not go in.
