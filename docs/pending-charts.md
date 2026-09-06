# The pages received, and what each one still needs

Eighteen manual pages across four types, re-read page by page. Revisions,
conditions and rules below are transcribed exactly — they are the part that
gets lost. What is missing in almost every case is the curve coordinates,
which a scan of a nomogram does not give up. See **What is blocking** at the
end.

## Inventory

| # | Page | Type | Status |
|---|---|---|---|
| 1 | BHT-407-FM-1 fig 4-1 · basic inlet · TC · Rev 14, 28 MAR 2014 · p 4-7 | 407 | **in**, verified 676 °C |
| 2 | BHT-407-FMS-3 fig 4-1 · particle separator · TC · Rev 1, 16 JAN 2018 · p 3 | 407 | **in**, verified 682 °C |
| 3 | BHT-407-FMS-4 fig 4-1 · snow deflector · TC · Rev 1, 16 JAN 2018 · p 4 | 407 | **in**, verified 722 °C |
| 4 | BHT-212VFR-FM-1 fig 4-2 · PT6T-3 ground · FAA · Rev 5, 17 OCT 2011 · p 4-11 | 212 | **in**, all 49 printed values re-verified |
| 5 | BHT-212VFR-FM-1 fig 4-3 · density altitude · FAA · p 4-12 | 212 | **in**, computed; reproduces the page's example |
| 6 | BHT-212VFR-FM-1 fig 4-1 sh 1/4 · PT6T-3B hover · gage −101 · FAA · Rev 9, 24 MAY 2022 · p 4-7 | 212 | curves needed, **no printed answer** |
| 7 | fig 4-1 sh 2/4 · PT6T-3B in-flight · gage −101 · p 4-8 | 212 | curves needed, **no printed answer** |
| 8 | fig 4-1 sh 3/4 · PT6T-3B hover · gage −113 · p 4-9 | 212 | curves needed, **no printed answer** |
| 9 | fig 4-1 sh 4/4 · PT6T-3B in-flight · gage −113 · p 4-10 | 212 | curves needed, **no printed answer** |
| 10 | BHT-206L4-FM-1 fig 4-1 · base · TC · Rev 2, 22 AUG 2008 · p 4-7 | 206L4 | curves needed — **answer now established, see below** |
| 11 | BHT-206L4-FMS-7 fig 4-1 sh 1/2 · snow deflector · TC · 19 OCT 2011 · p 4 | 206L4 | curves needed, **no printed answer** |
| 12 | BHT-206L4-FMS-7 fig 4-1 sh 2/2 · snow deflector + particle separator, purge on · TC · 19 OCT 2011 · p 5 | 206L4 | curves needed, **no printed answer** |
| 13 | BHT-206L4-FMS-3 §4-6 · TC · 26 AUG 2011 · p 4 | 206L4 | **rule captured** — see below |
| 14 | BHT-205A1-FM-1 · SN 30001–30052 · FAA · Rev 11 · p 5-7 | 205A-1 | curves needed, **no printed answer** |
| 15 | BHT-205A1-FM-2 · SN 30053–30127 · FAA · Rev 11 · p 5-7 | 205A-1 | curves needed, **no printed answer** |
| 16 | BHT-205A1-FM-3 · SN 30128 and subs · FAA · Rev 13 · p 5-7 | 205A-1 | curves needed, **no printed answer** |
| 17–18 | AFS-BH206L3L4-IBF-KIT-FMS §4 pp 9–10 of 11 · FAA · Rev C, 04 NOV 2008 | 206L series | **rules captured** — see below |

Pages 17 and 18 arrived as one image, which is why there are seventeen files
and eighteen pages.

## Bell 206L4 — the one chart whose answer is now established

BHT-206L4-FM-1 fig 4-1 prints an example box giving only the **inputs**:

> OAT 25 °C · TOT 720 °C · Hp 12,000 feet

The **answer** is printed in a different document. BHT-206L4-FMS-3 §4-6 opens
its own worked example with:

> Minimum torque available (as read from Power Assurance Check chart example)
> **65%**

Together those are a complete published example, so this chart *can* prove
itself once digitised. It is the only one of the eleven outstanding sheets
that can. It is now blocked on curve coordinates alone.

Walk: enter OAT, up to indicated TOT, right across, down to Hp, read minimum
torque available. The check **passes when actual torque is equal to or
greater** than the figure read — inverted from the 407 — so the margin is in
percent torque, not °C.

Conditions, FM-1: level flight · N2 100% · DC load 17.5% · 85 to 105 KIAS not
above VNE · engine anti-ice off · heater/ECS off.
The FMS-7 sheets are the same except **90 to 100 KIAS**, and sheet 2 of 2 adds
**particle separator purge on**.

All three sheets cover **Model 206L4, or 206L1+ and 206L3+ with the IGW
upgrade kit**, and all three print **"avoid this area (possible bleed valve
open area)"** as a marked region the gate must refuse inside.

Chart bounds: OAT −50 to 100 °C · indicated TOT curves 460 to 768 · Hp sea
level to 16,000 ft · minimum torque available 40 to 100%.

### The torque corrections, and that they are alternatives

| Kit | Correction | Source |
|---|---|---|
| Particle separator, purge on | **−5%** torque | BHT-206L4-FMS-3 §4-6, worked: 65% → 60% |
| Inlet Barrier Filter | **−3%** torque | AFS-BH206L3L4-IBF-KIT-FMS, worked: 76% → 73% |

Rules from the IBF supplement, verbatim in substance:

- With **snow deflectors** fitted, an IBF aircraft uses the *basic inlet with
  snow deflector* PAC chart — BHT-206L4-FMS-7 for the 206L-4.
- Otherwise IBF operators use the latest **"particle separator purge off"**
  charts from BHT-206L4-FMS-3.
- The IBF and the particle separator are **alternatives, not additive**. The
  UI must never offer both corrections at once.
- Pass condition, IBF: *actual torque indication after the 3% deduction is the
  same or greater than the required chart torque.*

The IBF supplement covers **Bell 206L-1, 206L-3 and 206L-4 only**. It says
nothing about any other type.

## Bell 212 · PT6T-3B — BHT-212VFR-FM-1 fig 4-1, four sheets

A nomogram, unlike the PT6T-3's tables, and a different engine model from the
ground check already implemented. Four sheets, **not interchangeable** — the
gas producer gage part number changes the N1 scale:

| Sheet | Check | Gage P/N | N1 scale | N1 ceiling |
|---|---|---|---|---|
| 1 of 4 | hover | 212-075-037-101 | 85–105 | 100.8% |
| 2 of 4 | in-flight | 212-075-037-101 | 85–105 | 100.8% |
| 3 of 4 | hover | 212-075-037-113 | 86–106 | 101.8% |
| 4 of 4 | in-flight | 212-075-037-113 | 86–106 | 101.8% |

Walk: enter at indicated engine torque, up to Hp, right to OAT, up to read
maximum allowable ITT **and** maximum allowable N1.

Common to all four: N2 97% · heater/ECU off · test engine throttle full open,
frictioned · do not exceed 810 °C ITT or 63.9% engine torque · stabilise power
one minute, then record Hp, OAT, torque, ITT and N1 · if a limit is exceeded,
repeat stabilising **four** minutes · repeat the check on the other engine.

Hover sheets: other engine at idle · collective increased to greater than
700 °C ITT · throttles full open before takeoff.
In-flight sheets: level flight above 1000 ft AGL · 100 KIAS or VNE if less ·
other engine decreased slowly until the test engine torque is in range.

Chart bounds: torque 40–90% · ITT 500–800 · N1 per the table above, with
**"bleed valve opens"** boundaries at both ends and **maximum for takeoff** /
**maximum continuous** cutoffs the gate must respect.

Each sheet carries trace arrows but **no numbers on them**, so there is
nothing to check a digitising against. One worked set per sheet — any
torque/Hp/OAT and the ITT and N1 it reads — or these cannot be accepted.

## Bell 205A-1 · Lycoming T53

Maximum power (torquemeter pressure) check. Three charts, split by **serial
number**, which no aircraft in the app has needed yet:

| Chart | Serial numbers | Revision | Worked example |
|---|---|---|---|
| BHT-205A1-FM-1 | 30001 through 30052 | Rev 11 | **yes — see below** |
| BHT-205A1-FM-2 | 30053 through 30127 | Rev 11 | page 5-6 not yet received |
| BHT-205A1-FM-3 | 30128 and subsequent | Rev 13 | page 5-6 not yet received |

### BHT-205A1-FM-1 — the published example, from page 5-6

The chart page (5-7) prints only the lettered construction. **Page 5-6 prints
the numbers**, and this is the acceptance test for the digitising:

| Read and record | Example |
|---|---|
| Pressure altitude | **4000 ft** |
| Ambient air temperature (OAT) | **30 °C** |
| Torquemeter pressure (observed) | 44.5 PSI |
| Gas producer speed (N1) | 96.6% |

> Enter chart at pressure altitude (Point A), proceed horizontally to ambient
> air temperature (Point B), and then proceed vertically down and read chart
> torquemeter pressure (Point C). **Example: 43.1 PSI**

So: **PA 4000 ft, OAT 30 °C → 43.1 PSI.**

The pass rule is printed in the same words that must reach the crew:

> …example (44.5 PSI) is no less than the chart maximum torquemeter pressure
> (43.1 PSI) the maximum torquemeter pressure available is satisfactory.

**Observed ≥ chart** passes. The margin is in PSI, and its sign is the answer.

### The procedure and the limits, from page 5-6

- The minimum specification engine delivers 1400 shp; as installed it is
  derated to **1250 shp**, so the power limitation is **54.0 PSI torquemeter
  pressure** and the check must be flown where full throttle produces no more
  than that.
- **Do not exceed 54 PSI torque at any time.**
- Initiate a climb at best climb speed and 100% N2.
- Maintain the climb and increase collective, not exceeding 54 PSI, until N2
  drops to **98%** with the governor RPM switch beeped to full increase.
- **Recorded N1 must be within ±0.5% of the placarded maximum gas producer
  speed for takeoff power** (N1 topping) — a second, independent pass
  condition, not a margin.

> If this check is satisfactory, it can be concluded that the installed engine
> is at least as good as a minimum specification engine and that full power
> can be obtained.

### Chart bounds and boundaries

Torquemeter pressure 22–54 PSI · pressure altitude 0–20,000 ft · OAT curves
53 °C, 50, 40, 30, 20, 10, 0, −10 and a single **−20 to −54 °C** curve, with an
**OAT operating limit** boundary and a **transmission torque limit** boundary,
both of which the gate must respect. Hotter air sits to the left: at any
altitude the curves run 53 °C leftmost to −20/−54 °C rightmost.

### Tracing these charts — tested against the printed answer

The method is measurement, not eyeballing: the axis is calibrated from the
chart's own gridlines, horizontal and vertical line structure is removed by
run length, what remains is segmented into fragments, and fragments are
chained end to end into curves. It was tested against the one number the
manual prints.

| Source | PSI at PA 4000 ft, OAT 30 °C |
|---|---|
| **BHT-205A1-FM-1 page 5-6, printed** | **43.1** |
| The A–B–C construction line drawn on the chart, measured | 43.35 |
| Trace of FM-1 | **43.36** |
| Trace of FM-2 | 43.48 |
| Trace of FM-3 | 43.44 |

The trace reproduces the line the draughtsman actually drew to **0.01 PSI**.
The remaining **0.25 PSI** is the gap between the manual's own drawing and
its own printed number, and no tracing can do better than that — it is the
accuracy floor of the document, not of the method.

Calibration was verified independently: on FM-1 the vertical gridlines read
40.08, 42.06, 46.04, 50.08, 52.06 and 54.05 against printed 40, 42, 46, 50,
52 and 54 — within **0.06 PSI**.

**Worth weighing:** in the manual's own example the margin is 44.5 − 43.1 =
1.4 PSI, so 0.25 PSI is about a sixth of it.

### The three sheets appear to be the same chart

Traced on their own calibrations, all three agree to **0.12 PSI** across the
altitude range. An earlier note here said FM-1 and FM-2 were "genuinely
different charts" on the strength of a raw pixel comparison — that was wrong.
The difference was scan registration: FM-2's plot origin sits 21 px higher
than FM-1's. Corrected, they read the same.

That is a statement about this method's accuracy, not a finding about the
type certificate. Three serial ranges have three manuals for reasons that may
have nothing to do with this chart, and whether one chart may serve all three
is an engineering judgement, not a measurement.

### What is still missing from the trace

Seven objects come out where there should be about ten — the nine OAT curves
plus the OAT operating limit. The **53 °C and 50 °C stubs** at the bottom of
the chart are short and are not being picked up, and the two boundaries
(**OAT operating limit**, **transmission torque limit**) are not yet extracted
as gates. Curve identity is assigned by left-to-right order, corroborated at
the single example point.

Scan quality, measured: FM-3 is 1275×1651 with every gridline detectable;
FM-1 and FM-2 are 825×1275 at 108 ppi with fainter grid. It made little
difference to the result — the three traces agree — so resolution is not
what is limiting here.

## What is blocking

Not the rules, and not the procedures — those are a day's work each once the
data exists. It is the curve coordinates.

The 407 data in this repo is precise to three decimals (`52.281, -0.078`).
That did not come from looking at a scan; the interpolation in
`src/engine/interp.js` still carries a comment matching it to a spreadsheet's
`FORECAST(x, OFFSET(knownY, MATCH(x, knownX, 1) - 1, 0, 2), ...)`. **Wherever
those points came from is the fastest path for these charts too** — send that
workbook, or the traced points in any form, and each of these becomes a
`charts.json` plus a definition module in its own folder.

Tracing curves off a 2550×1650 scan by eye is the alternative, and it is not
one to take for flight data: the grid lines, the labels lying across the
curves and the crossing families all bias a tracing, and with no published
answer on most of these sheets there would be nothing to catch the error.
A chart that cannot prove itself against a printed answer does not go in.

The 206L4 base chart is now the exception on verifiability only — its answer
is established. Its curves are still a tracing, and still need to come from
the same place the 407's did.
