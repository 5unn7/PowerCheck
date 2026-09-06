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

"Serviceable" is gone. A positive margin now carries no verdict at all, and a
negative one says **"Over the chart maximum"**, which is a statement about the
chart rather than about the aircraft.

The 10 °C amber band is **shop practice, ruled by the operator's licensed
engineer**, and is now carried that way: it belongs to the 407 alone, it is
not applied to any other type, and whenever it fires the screen says
*"10 °C is this operator's practice, not a flight manual figure."*

Confirmed against the source: the workbook's only margin rule is
`cellIs lessThan 0` — red below zero and nothing else. The band was added on
top of that by the operator, and the app now reflects exactly that split.

## 2 · The avoid-area gate — **traced to source, one question left**

`src/aircraft/bell-407/index.js` → `kMin`

**Found.** The rule comes from the project's own source workbook,
`Powercheck_407_v2.2.xlsx`, sheet **"Tq-pA" rows 68–72**, where it is
labelled **"Avoid Area"**:

| | OAT | K |
|---|---|---|
| A69/B69 | −32.5 °C | 0 |
| A70/B70 | 46.0 °C | 12.25 |
| A72 | `=TREND(B69:B70, A69:A70, Powercheck!$B$5)` | |

`TREND` through two points is plain linear interpolation, which is exactly
`(OAT + 32.5) × 12.25 ÷ 78.5`. The app now carries the two points rather
than the collapsed constants, and reproduces the workbook's own cached
value to the last digit — 6.944267515923567 at OAT 12. A test pins it.

**Still open, and it is a short question:** *what were those two points read
off?* They are not marked on BHT-407-FM-1 fig 4-1, and no page held here
shows them. Someone chose (−32.5, 0) and (46, 12.25) years ago. If they came
from the engine manual, a Bell service instruction, or an operator practice,
say which and it can be cited. If they were judgement, the app should say so
where it refuses to answer, because at present it refuses in the manual's
voice rather than in yours.

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

## 5 · Chart data — **verified against source; the manual link is still one point**

`test/charts.test.mjs`

Two different things, worth keeping apart.

**The app against the workbook: exact.** Every digitised point in the repo was
compared against `Powercheck_407_v2.2.xlsx` — all three variants, both panels,
**126 curves and 3794 numbers, zero disagreements, and every curve the same
length**. The app is a faithful copy of the template it came from. That
removes any question of transcription error.

**The workbook against the manual: still one point per chart.** Each chart
reproduces the example printed beside it to within 1 °C, enforced in CI. But
that remains **70% torque, 6000 ft, 10 °C** — one point near the middle of a
nomogram spanning −2000 to 20,000 ft and −40 to +50 °C. Whoever traced the
curves into the workbook did so from the printed chart, and nothing here
checks the corners, where curves crowd and a tracing is least reliable.

**To close:** a second and third read per chart at the extremes — a high,
cold, low-torque corner and a low, hot, high-torque one. Three values off
each page, about ten minutes, and it converts "verified at one point" into
"verified across the sheet". Still the highest-value item on this list.

## 6 · The trend line will fit a slope through two points

`src/App.jsx` → `trend`

Ordinary least squares over the logged margins, reported as **"°C per 100
hrs"** as soon as there are two entries. Two points always produce a slope,
and it is displayed with the same authority as one drawn from twenty. There
is no scatter shown, no confidence, and no outlier handling.

A single mis-keyed reading will visibly bend the trend and nothing marks it.

**To close:** withhold the rate until there are enough points to mean
something, and show the scatter around the fit. Engineer's call on the
minimum — 5 or 6 is the usual convention for this kind of watch item.

## 7 · No cross-check against the engine's own operating limits

The tool reports margin against *the chart's* maximum allowable MGT and
nothing else. At low OAT the 407 chart data runs to **778 °C** maximum
allowable MGT.

The chart limit and the engine's certified operating limits are different
things, and where the chart limit sits above a certified limit the tool will
report a comfortable positive margin at an MGT the engine should never have
been taken to.

Note the 212 implementation does *not* have this gap — its tables cap at
810 °C ITT and 100% N1, which are the manual's own stated ceilings.

**To close:** confirm the 250-C47B/B8/E4 MGT and torque limits, and display
them alongside the check limit so the crew sees both.

## 8 · "K factor" is shown to the crew but appears in no manual

`src/procedures/torque-k-mgt/index.js` reports **K factor** as one of three
headline numbers.

K is not an engineering quantity. It is the normalised vertical coordinate
of the nomogram (0–100), an artefact of how the chart was digitised. It
appears nowhere in BHT-407-FM-1. Anyone who goes looking for it in the
manual will not find it, and may reasonably wonder what else on the screen
is invented.

**To close:** remove it from the crew-facing display, or rename it plainly as
an intermediate.

## 9 · Density altitude is shown on the 407, which does not use it

Same file. The 407 walk is torque → **pressure altitude** → OAT → MGT.
Density altitude plays no part in it. The value shown is computed from a
standard-atmosphere approximation, not from any page in the 407 manual.

**To close:** remove it from the 407, or state that it is advisory and
computed, not read.

---

## 10 · Moderate items

| # | Finding | Where |
|---|---|---|
| 10.1 | Margin displayed to **0.1 °C** from a chart readable to perhaps ±2 °C, and against a test tolerance of ±1 °C. The display is more precise than the data supports. | `src/engine/format.js` |
| 10.2 | **No units guard.** An OAT entered in °F is accepted silently anywhere in the −40…+50 range. −40 is the one value where both scales agree; everything above it reads hot and gives a falsely generous margin. | inputs |
| 10.3 | **Conditions are stated but never confirmed.** Generator ≤35 A, power turbine 100%, heater/ECS/anti-ice off, purge off, 85–105 KIAS not above VNE. The tool prints them and trusts them. | `meta.cond` |
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

1. **Three readings off each 407 page** at the corners (item 5). Ten minutes,
   and it converts "verified at one point" into "verified across the sheet".
2. **What the two avoid-area points were read off** (item 2) — the rule is
   traced to the workbook, but not past it.
3. **The 250-C47B family operating limits** (item 7) — still open.
