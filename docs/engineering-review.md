# Engineering review pack

**This is a self-audit, not an engineering assessment.** It was written by
the tool's author against the flight manual pages in hand, to the questions
an engine and airframe engineer would ask. It is not a certification, it is
not signed, and nothing in it releases anything to service.

It exists so that a reviewer can spend their time deciding, not discovering.
Each finding names the file, the source page, and what would close it.

Items 1, 3 and 4 have since been ruled on by the operator's licensed
engineer and are closed; item 2 is traced to source with one question left.
They are kept here with their answers rather than deleted, because why a
thing is the way it is outlives the decision.

---

## What the tool is

A calculator and a trend log. It reads the same power assurance chart the
crew would read by hand, and stores the result so the margin can be watched
over time. It has no interface to the aircraft, computes nothing the manual
does not print, and is not a maintenance record.

| Type | Charts implemented | Verified against |
|---|---|---|
| Bell 407 · RR 250-C47B | BHT-407-FM-1 fig 4-1, FMS-3 fig 4-1, FMS-4 fig 4-1 | all three published examples |
| Bell 212 · P&W PT6T-3 | BHT-212VFR-FM-1 fig 4-2 (ground) | the page's published example |

Eleven further charts are held but not implemented — see `pending-charts.md`.

---

## 1 · Airworthiness language — **closed**

"Serviceable" is gone, and it has not been replaced with silence. The check
exists to answer one question, so both answers are now stated in words — and
in the manual's words, not this app's:

| | Shown |
|---|---|
| **407 pass** | *Engine performance equals or exceeds minimum specification, and the performance data in the flight manual can be achieved.* — BHT-407-FM-1 §4-2 |
| **407 fail** | *Engine performance is below minimum specification… Refer to BHT-407-MM to determine the cause of low power (high MGT).* — §4-2 |
| **212 pass** | *Observed gas producer speed and ITT are both below the chart figures for this OAT.* — fig 4-2 step 8 |
| **212 fail** | *Steps should be taken to determine the cause of power loss.* — fig 4-2 step 10 |

Note what these are and are not. They state whether the engine meets the
**minimum specification the chart tests**, which is the question the check
asks. None of them is a release to service, and a test rejects any verdict
containing "serviceable", "airworthy", "released" or "fit for".

The 10 °C amber band is **shop practice, ruled by the operator's licensed
engineer**, and is now carried that way: it belongs to the 407 alone, it is
not applied to any other type, and whenever it fires the screen says
*"10 °C is this operator's practice, not a flight manual figure."*

Confirmed against the source: the workbook's only margin rule is
`cellIs lessThan 0` — red below zero and nothing else. The band was added on
top of that by the operator, and the app now reflects exactly that split.

## 2 · The low-torque cut-off — **traced as far as it goes, and that is not far**

`src/aircraft/bell-407/index.js` → `avoidArea`, `kMin`

The rule comes from the source workbook, sheet **"Tq-pA" rows 68–72**,
labelled **"Avoid Area"**: a straight line through **(−32.5 °C, K 0)** and
**(46 °C, K 12.25)**, drawn with `TREND`, which on two points is plain linear
interpolation. That is exactly the constants the app had been carrying with
no comment, and it reproduces the workbook's own cached value to the last
digit — 6.9442675 at OAT 12.

**Where those two points came from is not known**, and the search is now
about as complete as it can be from documents:

- not marked on BHT-407-FM-1 fig 4-1;
- **BHT-407-FM-1 §4-2** (Rev 14, page 4-3) describes the entire power
  assurance check over a full page — conditions, walk, pass and fail, and a
  reverse reading — and mentions **no avoid area, no minimum torque and no
  cut-off of any kind**;
- the operator's licensed engineer does not know;
- the workbook it comes from was a **sample test file**, not a controlled
  document.

**Kept, deliberately.** The rule only ever withholds an answer — it can never
produce one — so keeping it errs conservative while its provenance is open.
Deleting it would make the app answer in a region nobody has vouched for,
which is the wrong direction to be wrong.

**What changed is the voice.** It no longer says "avoid area", which reads as
a flight manual term. It now says:

> *N is below the M cut-off for this OAT — no margin reported. This cut-off is
> inherited from the operator's spreadsheet and has no source in the flight
> manual — repeat at higher torque, or read fig 4-1 directly.*

**To close properly:** find what those two points were read off, and either
cite it or replace the rule. Until then a pilot is being stopped by something
nobody can point to.

## 3 · Engine model — **closed, by removal**

| Page | Engines covered |
|---|---|
| BHT-407-FM-1 fig 4-1 (basic inlet) | 250-C47B **or** 250-C47B/8 |
| BHT-407-FMS-3 fig 4-1 (particle separator) | C47B, C47B/8 **or 250-C47E/4** |
| BHT-407-FMS-4 fig 4-1 (snow deflector) | C47B, C47B/8 **or 250-C47E/4** |

The basic inlet chart does not name the **250-C47E/4**. The operator has no
C47E/4, ruled by their licensed engineer, so the engine picker has been
removed: every model in this fleet is covered by every chart carried here,
and a control that can only ever have one answer is noise.

**Carry forward:** if a C47E/4 ever joins the fleet, FM-1 does not cover it on
a basic inlet, and the app will no longer say so — it would read FM-1 without
comment. Reinstating the picker is a short change; the shape of it is in the
git history at `ae134b3`.

## 4 · AFS inlet barrier filter — **closed**

The app reads the plain basic-inlet chart for AFS-fitted aircraft. **Ruled
correct by the operator's licensed engineer: the 407 AFS is the same as
basic**, with no correction.

Note this is not the 206L arrangement. There, AFS-BH206L3L4-IBF-KIT-FMS takes
**3% off the torque** and the IBF and particle separator are alternatives
rather than additive. That supplement covers the 206L-1, 206L-3 and 206L-4
only and says nothing about the 407 — which is why it could not settle this
one way or the other, and why an engineer had to.

---

## 5 · Chart data — **what is actually established**

`test/charts.test.mjs`

Three separate claims, and only two of them hold.

**The app matches the workbook: exact.** Every digitised point compared —
all three variants, both panels, **126 curves, 3794 numbers, zero
disagreements, every curve the same length**. No transcription error exists
between the workbook and this app.

**The workbook is not a controlled document.** The operator describes it as a
**sample test file**. So the paragraph above establishes internal consistency
and nothing more — it does not make the workbook an authority, and this
review should not have leaned on it as one.

**What does validate the curves: the three published examples.** Each chart
reproduces the answer printed beside it in its own manual to within 1 °C, and
CI fails the build otherwise:

| Chart | Manual prints | App gives |
|---|---|---|
| BHT-407-FM-1 fig 4-1 | 676 °C | 676 |
| BHT-407-FMS-3 fig 4-1 | 682 °C | 682 |
| BHT-407-FMS-4 fig 4-1 | 722 °C | 722 |

That is meaningful evidence, and worth stating plainly: **you cannot hit three
printed answers on three different charts with invented data.** Whatever the
workbook's status, the curves in it are a real tracing of the real charts.

**But it is three points, one per chart, all at 70% torque / 6000 ft / 10 °C**
— the middle of a nomogram spanning −2000 to 20,000 ft and −40 to +50 °C.
Nothing checks the corners, where curves crowd and a tracing is least
reliable, and the sample-file provenance makes that gap matter more, not less.

**To close:** three readings off each 407 page at the extremes — a high, cold,
low-torque corner and a low, hot, high-torque one. About ten minutes with the
pages. This is now the single most valuable outstanding item in this review.

## 6 · The trend line — **fixed**

`src/App.jsx` → `trend`

It fitted a slope from two points and printed it as "°C per 100 hrs" with the
same authority as one drawn from twenty.

- **No rate is reported below five checks.** The tile reads *"Trend at 5
  checks"* until there are enough, rather than showing a number that means
  nothing.
- **The scatter about the fit is shown**: *"Checks sit ±N °C about this
  line."* A noisy line can no longer pass for a clean one.
- Records with no engine hours already fall back to dates, and same-day
  checks correctly produce no slope at all.

Still no outlier rejection — a single mis-keyed reading will bend the line,
though the scatter figure now makes that visible.

## 7 · Operating limits — **closed, not applicable**

Ruled by the operator's licensed engineer: **the certified operating limits
are not part of the power check.**

The reasoning, recorded so it is not re-raised. The chart's maximum allowable
MGT is a **reference to compare a reading against**, not a value anyone flies
to. On the 407 the crew establish the specified flight condition, read
whatever torque and MGT the engine is making, and compare. That the chart runs
to 778 °C at low OAT does not mean anyone is taken there — it means an engine
at minimum specification would be making that much at that torque and
temperature. This review's earlier concern confused a comparison value with a
target.

Where a manual does want a limit inside the check, it puts it in the chart,
and those are already carried: the 212's Chart B caps at **810 °C ITT** and
**100% N1**, and its PT6T-3B sheets add *"do not exceed 810 °C ITT or 63.9%
engine torque"* as a condition of flying the check at all.

Certified limits remain what they always were — flight limits the crew observe
on their own gauges, and outside the scope of this tool.

## 8 · "K factor" on screen — **fixed**

K is the normalised vertical coordinate of the nomogram (0–100), an artefact
of how the chart was digitised. It appears in no manual, and anyone who went
looking for it would not find it.

It is off the crew display. The 407 now shows the two numbers §4-2 actually
compares — **Chart MGT** and **Actual MGT** — and K remains in the computed
result because the chart drawing needs it. A test asserts no stat label
carries a digitising artefact, and that every stat carries its unit.

## 9 · Density altitude on the 407 — **fixed**

The 407 walk is torque → **pressure** altitude → OAT → MGT. Density altitude
plays no part in it, and the value shown came from a standard-atmosphere
model checked against the **212's** fig 4-3 — another type's chart, which is
not evidence about this one. It is off the 407.

It remains on the 212, where fig 4-3 is that type's own published chart and
the model reproduces its printed example.

## 9b · Published capability the app does not offer

`BHT-407-FM-1` §4-2 carries a NOTE describing the chart read **backwards**:

> Chart may also be used to determine minimum specification power for actual
> MGT. Using previous example, enter chart at actual MGT (675 °C), proceed up
> to OAT (10 °C), across to Hp (6000 feet), and up to read minimum torque
> available (70 %). If actual power is equal to or greater than chart torque,
> engine performance equals or exceeds minimum specification…

This is the same walk the 206L4 uses natively — the answer is a **minimum
torque available** and the margin is in percent torque rather than °C. It is
published, not invented, and the app does not offer it.

Worth having: a crew that has an MGT reading and wants to know what torque
the engine should be making is currently doing that walk on paper. Not a
defect; a capability sitting unused.

## 10 · Moderate items

| # | Finding | Where |
|---|---|---|
| 10.1 | Margin displayed to **0.1 °C** from a chart readable to perhaps ±2 °C, and against a test tolerance of ±1 °C. The display is more precise than the data supports. | `src/engine/format.js` |
| 10.2 | **No units guard.** An OAT entered in °F is accepted silently anywhere in the −40…+50 range. −40 is the one value where both scales agree; everything above it reads hot and gives a falsely generous margin. | inputs |
| 10.3 | **Conditions are stated but never confirmed.** The tool prints them and trusts them. Now fuller: §4-2's *"turn off all sources of bleed air, including ENGINE ANTI-ICING"* is broader than the chart header's "anti-ice off" and is what the app now shows. | `meta.cond` |
| 10.7 | **Fixed.** A failed check now passes on what the manual says to do — the 407 sends the crew to `BHT-407-MM` to determine the cause of low power, the 212 to determine the cause of power loss. The app had been reporting the failure and stopping there. | `failNote` |
| 10.4 | **The log is browser storage only** — per device, per browser, wiped by clearing site data, and *not shared between the installed app and the browser tab it was installed from*. Export CSV is the only durable copy. | `README.md` |
| 10.5 | **Future dates are accepted.** Only the format is validated. | `isISODate` |
| 10.6 | **No engine serial or position field on the 407.** A tail number can change engines; the trend would carry straight across the change with nothing marking it. The 212 records which engine, but not which serial. | log record |

---

## What is already sound

Stated so a reviewer knows where not to spend time.

- **Every chart reproduces its own published example, and the build fails if
  it stops doing so.** This is enforced in CI, not by hand.
- **The tool refuses to extrapolate.** Off the printed grid it withholds the
  number entirely rather than reporting a confident wrong one — a torque
  typed as 700 instead of 70 would otherwise read a +3381 °C margin. The
  bounds come from the chart data, so re-digitising moves them automatically.
- **Configuration travels with each logged check,** so a stored entry can
  always be recomputed against the chart it was actually read from. CSV
  import recomputes rather than trusting the stored answer.
- **The 212 check is logged per engine and trended per engine.**
- **Charts are data, not code.** A correction to a digitising is a data
  change with a test beside it.

---

## What would close the most, fastest

1. **Three readings off each 407 page** at the corners (item 5). The source
   workbook is a sample test file, so the three published examples are the
   only real validation the curves have, and there are only three of them.
2. **What the two low-torque cut-off points were read off** (item 2). Nobody
   currently knows, and the documents have been exhausted. Until someone does,
   a pilot is being stopped by a rule with no source.
