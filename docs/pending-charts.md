# The pages received, and what each one still needs

Eighteen manual pages across four types, re-read page by page. Revisions,
conditions and rules below are transcribed exactly — they are the part that
gets lost. What is missing in most cases is the curve coordinates. Those can
be recovered from the scans — the 206L4 base chart was, on 06 SEP 2026 — but
only where the sheet prints an answer to check the tracing against. See
**What is blocking** at the end.

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
| 10 | BHT-206L4-FM-1 fig 4-1 · base · TC · Rev 2, 22 AUG 2008 · p 4-7 | 206L4 | **in**, traced; reads 64.9% against the printed 65% |
| 11 | BHT-206L4-FMS-7 fig 4-1 sh 1/2 · snow deflector · TC · 19 OCT 2011 · p 4 | 206L4 | curves needed, **no printed answer** |
| 12 | BHT-206L4-FMS-7 fig 4-1 sh 2/2 · snow deflector + particle separator, purge on · TC · 19 OCT 2011 · p 5 | 206L4 | curves needed, **no printed answer** |
| 13 | BHT-206L4-FMS-3 §4-6 · TC · 26 AUG 2011 · p 4 | 206L4 | **rule captured** — see below; no chart of its own |
| 14 | BHT-205A1-FM-1 · SN 30001–30052 · FAA · Rev 11 · p 5-7 | 205A-1 | curves needed; **answer in hand** (43.1 PSI) |
| 15 | BHT-205A1-FM-2 · SN 30053–30127 · FAA · Rev 11 · p 5-7 | 205A-1 | curves needed; **answer in hand** (43.1 PSI) |
| 16 | BHT-205A1-FM-3 · SN 30128 and subs · FAA · Rev 13 · p 5-7 | 205A-1 | **part traced**, 7 of 9 curves; answer in hand |
| 17–18 | AFS-BH206L3L4-IBF-KIT-FMS §4 pp 9–10 of 11 · FAA · Rev C, 04 NOV 2008 | 206L series | **rules captured** — see below |

Pages 17 and 18 arrived as one image, which is why there are seventeen files
and eighteen pages.

## Bell 206L4 — FM-1 is in

Traced 06 SEP 2026 and shipped as `src/aircraft/bell-206l4/`. Fifteen indicated-TOT
curves on the left carpet (500 through 768 °C) and nine pressure-altitude curves on
the right (sea level through 16,000 ft), every one stored only over the extent Bell
drew it. Cubic fits to the traced pixels sit at sd 0.4–1.3 px, which at this scan's
11.1 px per grid square is under a tenth of a degree of OAT and under a tenth of a
percent of torque.

The chart's own drawn example is the check: OAT 25 °C, TOT 720 °C, Hp 12,000 ft.
The manual's arrows land on 65% minimum torque available; the app reads **64.91%**.
Both anchors fell out of the trace independently — the 720 curve passes through the
example's OAT within 0.6 px, and the 12,000 ft curve crosses the carry row at
x = 1914.3 px against the 1914.3 px the printed 65% demands.

**What FM-1 still needs from a licensed engineer:** the Section 4 text around fig 4-1.
The chart page prints no procedure and no pass/fail wording, so the app states only
what the chart's own bottom axis says — torque made against the chart's minimum — and
offers no next step on a failure. If §4 carries one, it belongs in `failNote`.

## What was established before the trace

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

### FMS-7 Section 4 received 06 SEP 2026 — page 3

§4-2, verbatim:

> This supplement contains two Power Assurance Check charts (Figure 4-1). The
> first chart is to be used for helicopters equipped with snow deflectors. The
> second chart is to be used for helicopters equipped with snow deflectors and
> particle separator. **Both charts are used in the same manner as the Power
> Assurance Check chart in BHT-206L4-FM-1. Instructions for their use can be
> found at the beginning of Section 4 of BHT-206L4-FM-1.** PARTICLE SEP PRG
> switch (if installed) shall be ON when performing a power assurance check.

And the §4-1 note, which is an operating recommendation rather than a chart
rule but belongs on the conditions block:

> Due to reduced performance at higher temperatures, it is recommended that
> snow deflectors be removed above 20 °C (68 °F).

Three things follow:

1. **Sheet 1 is snow deflectors alone; sheet 2 is snow deflectors *and*
   particle separator.** The earlier reading of sheet 2's heading was right,
   and sheet 1 is *not* a purge-off variant of the same fit — it is a
   different fit. So the 206L4's fitted option is a three-way choice: none,
   snow deflectors, snow deflectors + particle separator.
2. **The purge switch is not an option.** It "shall be ON when performing a
   power assurance check", so it is a condition of the check, not something
   the crew chooses. Nothing in the app should offer it.
3. **§4-2 still points at BHT-206L4-FM-1 Section 4 for the procedure** — which
   is the page still outstanding, and the one that would give the shipped
   FM-1 chart its `passNote` and `failNote`. It is now wanted twice over:
   for FM-1 itself and for both FMS-7 sheets.

§4-6 on the same page covers performance variation for hover ceiling and rate
of climb, not the power check, and is not used here.

**Still no worked example for either FMS-7 sheet.** Corner readings remain the
route — see `docs/verification-worksheet.md`.

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

### Section 4 received 06 SEP 2026 — page 4-3, and what it settled

§4-2-A, verbatim:

> Power assurance check charts (figure 4-1) are provided to determine if
> engines can produce installed specification power. A power assurance check
> should be performed daily. Additional checks should be made if unusual
> operating conditions or indications arise. Hover check is performed prior to
> takeoff and in-flight check is provided for periodic in-flight monitoring of
> engine performance. **Either power assurance check may be selected at
> discretion of pilot.** It is pilot responsibility to accomplish procedure
> safely, considering passenger load, terrain being overflown, and
> qualifications of persons on board to assist in watching for other air
> traffic and to record power check data.
>
> If either engine does not meet requirements of hover or in-flight power
> assurance check, published performance may not be achievable. Cause of
> engine power loss, or excessive ITT or GAS PROD RPM (N1) should be
> determined as soon as practical.

Three things fall out of that sentence in bold, and they decide how these four
sheets are built when the data arrives:

1. **Hover and in-flight are two checks the pilot chooses between**, not one
   check flown two ways. So flight state is a **check-scope** option here — it
   is chosen every check and it splits the trend, exactly like the PT6T-3's
   engine selector. It is emphatically *not* how the 407 works: that type's
   chart is headed "HOVER OR LEVEL FLIGHT" as one condition, which is why the
   407 has no such option and must never grow one.
2. **The gage part number is a fitted option** — it is a property of the
   airframe, set once per tail, and it selects between the −101 and −113 pairs.
3. `failNote` for both is the §4-2-A sentence above, which is the same wording
   §4-2-B gives the PT6T-3 and is now carried on that type.

§4-1 also applies to every chart in this section:

> Performance data presented herein are derived from engine manufacturer's
> specification power for engine less installation losses. These data are
> applicable to basic helicopter without any optional equipment that would
> appreciably affect lift, drag, or power available.

**What Section 4 did not carry: a worked example.** §4-1 through §4-3 print
none for figure 4-1, and the sample performance problem at §4-11 (pages
4-5/4-6) is a weight-altitude-temperature payload problem, not a power check.
Each sheet carries trace arrows with **no numbers on them**.

So these four are now the clearest case in the whole set: the rules are
complete, the conditions are complete, the verdict wording is complete, and
there is still nothing to check a tracing against. **Corner readings are the
only route left** — see `docs/verification-worksheet.md`, which now covers
these sheets.

## Bell 205A-1 · Lycoming T53

Maximum power (torquemeter pressure) check. Three charts, split by **serial
number**, which no aircraft in the app has needed yet:

| Chart | Serial numbers | Revision | Worked example |
|---|---|---|---|
| BHT-205A1-FM-1 | 30001 through 30052 | Rev 11 | **yes** |
| BHT-205A1-FM-2 | 30053 through 30127 | Rev 11 | **yes** — page 5-6 received 06 SEP 2026 |
| BHT-205A1-FM-3 | 30128 and subsequent | Rev 13 | **yes** — page 5-6 received 06 SEP 2026 |

**All three now have a published example, and it is the same example on all
three**: PA 4000 ft, OAT 30 °C, observed 44.5 PSI, N1 96.6% → chart 43.1 PSI.
The FM-2 and FM-3 pages carry word-for-word the same text as FM-1, down to the
1400/1250 shp derate and the 54.0 PSI limitation. FM-3 adds one paragraph the
others do not:

> The recorded NI RPM shall be plus or minus 0.5 percent of the placarded
> Maximum Gas Producer Speed for Takeoff Power. (This is NI topping.)
>
> If this check is satisfactory, it can be concluded that the installed engine
> is at least as good as a minimum specification engine and that full power can
> be obtained. If this check is not satisfactory, there is reason to believe
> that the engine has deteriorated to the extent that published performance may
> not be obtained. If this occurs, the cause of the deterioration should be
> determined.

That second paragraph is the `passNote` and `failNote` for this type, in the
manual's own words.

### Tracing status, 06 SEP 2026 — FM-3 part-traced, not shipped

Calibration on the FM-3 scan (1275 × 1651) is confirmed to **±0.04 PSI** and
**±0.04 kft** against all nineteen vertical and all twenty-two horizontal
printed gridlines:

| | value |
| --- | --- |
| x of 22 PSI | 368.0 px |
| PSI scale | 20.078 px/PSI |
| y of 0 ft | 1426.5 px |
| altitude scale | 40.25 px per 1000 ft |

Seven of the nine OAT curves trace cleanly (local median-and-mean smoothing,
residual 1.0–1.3 px = 0.05–0.07 PSI). The **30 °C curve reads 43.21 PSI at
4000 ft.**

**And the manual disagrees with itself there, which sets the tolerance.** The
construction line Bell drew down from point C sits at x = 794–796 px, which is
**43.27 PSI**. Bell's text says **43.1 PSI**. So the printed drawing and the
printed number are 0.17 PSI apart — about 3.4 px on this scan, ordinary
draughting tolerance on a chart drawn in 1968. A trace cannot be more right
than the paper it comes from, so the acceptance band for this type is the
0.2 PSI the manual itself spans, not the 0.09% the 206L4 managed.

**Why it is not in yet — two faults, both known:**

1. Above about 10,000 ft the 40 °C, 30 °C and 20 °C traces merge. They
   converge on the printed page as altitude rises (spacing goes from 4.8 PSI
   at 4500 ft to 1.2 PSI at 17,500 ft) and the follower, which tracks each
   curve independently, hops between them. The fix is a tracker that carries
   the whole family at once and assigns each row's blobs to curves under the
   constraint that the family cannot cross — the curves are strictly ordered,
   so that constraint alone resolves it.
2. The **50 °C and 53 °C** curves are not picked up at all. They are short,
   sit in the bottom-left corner, and bend sharply, so both the minimum-length
   and the slope filters reject them. They need their own anchors.

Neither is a data problem. Both are tracer problems, and the chart is the one
in the whole set with the most independent checks available.

### Still to decide when it is traced

The three sheets cover three serial ranges and carry three separate approvals,
so they stay three chart data sets and serial range becomes a **fitted**
option — the first in the app that is neither an inlet nor a gage. An earlier
pass found the three sheets agreeing to within 0.12 PSI, which is inside the
manual's own 0.17 PSI self-disagreement, so they may well be the same drawing
reprinted. That is not a reason to merge them.

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

Not the rules, and not the procedures. It is not the tracing either, any
more: the 206L4 base chart came off its 2550×1650 scan and lands on the
manual's own printed answer to 0.09 of a percent. The method is in
`docs/tracing-a-chart.md`.

**What is blocking is that ten of the remaining sheets print no answer.**

That is the whole of it. A tracing is a measurement, and a measurement with
nothing to check it against is a number nobody should sign against. The grid
lines, the labels lying across the curves and the crossing families each bias
a trace in a direction that looks entirely plausible on screen; the only thing
that catches that is the manual's own worked example landing where it should.
On the 206L4 two independent anchors landed — the TOT curve and the altitude
curve — and that is what made it safe to ship. A chart that cannot prove
itself against a printed answer does not go in.

So the fastest path for each remaining sheet is **the page before the chart**.
In every one of these manuals the worked example is printed in the Section 4
or FMS text facing the figure, not on the figure itself:

| Sheet | What to send |
| --- | --- |
| 212 PT6T-3B fig 4-1, sheets 1–4 | BHT-212VFR-FM-1 §4 text facing p 4-7 to 4-10 |
| 206L4 FMS-7 fig 4-1, sheets 1–2 | BHT-206L4-FMS-7 §4 text, pp 3–4 |
| 205A-1 FM-2 and FM-3 | page 5-6 of each (FM-1's is already transcribed below) |

One worked example per sheet is enough. Failing that, six readings taken off
the printed chart by hand at the corners — `docs/verification-worksheet.md`
sets out which — do the same job.
