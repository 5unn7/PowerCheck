# Engineering review pack

**This is a self-audit, not an engineering assessment.** It was written by
the tool's author against the flight manual pages in hand, to the questions
an engine and airframe engineer would ask. It is not a certification, it is
not signed, and nothing in it releases anything to service.

It exists so that a reviewer can spend their time deciding, not discovering.
Each finding names the file, the source page, and what would close it.

Reviewer, please work top down. Items 1–4 are open questions about the
approved data itself and should be settled before this reaches a pilot.

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

## 1 · The app renders an airworthiness verdict

`src/engine/format.js` → `statusOf()`

A margin of 10 °C or more is labelled **"Serviceable"**. A negative margin is
labelled **"Over the limit"**.

Two problems. *Serviceable* is release-to-service language, and this tool has
no business using it — a power assurance margin is one input to that decision,
not the decision. And the 10 °C amber threshold cites nothing: it is not on
any of the three 407 pages, and it silently applies to the 212 as well, where
the margin is in a different quantity read off a different chart.

**To close:** replace the verdict with a neutral statement of the number, or
supply the source for a threshold and scope it per aircraft.

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

## 3 · Engine model — **partly closed, one question still open**

Read the titles:

| Page | Engines covered |
|---|---|
| BHT-407-FM-1 fig 4-1 (basic inlet) | 250-C47B **or** 250-C47B/8 |
| BHT-407-FMS-3 fig 4-1 (particle separator) | 250-C47B, 250-C47B/8 **or 250-C47E/4** |
| BHT-407-FMS-4 fig 4-1 (snow deflector) | 250-C47B, 250-C47B/8 **or 250-C47E/4** |

The basic inlet chart does not cover the **250-C47E/4**.

**Done:** the tool now asks the engine model as a fitted option, and a
250-C47E/4 on a basic inlet is **refused** — it names BHT-407-FM-1, says the
page is titled for the C47B and C47B/8 only, and offers no number and no way
to log a check. The same engine reads FMS-3 with a particle separator and
FMS-4 with snow deflectors, both of which do name it.

The model never changes an answer — one chart serves all three wherever it
covers them — so this gates coverage only. The test suite asserts both: that
every engine × inlet × deflector combination yields either a chart or a
stated reason and never a blank screen, and that the model does not move the
computed maximum MGT where a chart applies.

**Still open, and needs a reviewer:** *is there a basic-inlet power assurance
chart for the 250-C47E/4?* If one exists it is a fourth chart and the refusal
should become a fourth entry. If none exists, confirm the refusal is the
correct behaviour rather than there being some other approved means.

## 4 · The AFS is read off the basic inlet chart, uncited

`src/aircraft/bell-407.js` labels the first option **"Basic / AFS"** and its
`meta.src` reads *"basic inlet, read for AFS"*.

No source is given for treating an inlet barrier filter installation as
equivalent to a basic inlet. The pack's own BHT-206L4 IBF supplement
(AFS-BH206L3L4-IBF-KIT-FMS) applies a **−3% torque** correction, which is
direct evidence that IBF installations carry corrections rather than reading
the base chart unchanged.

If the 407 AFS supplement carries a correction or its own chart, reading the
basic chart is **non-conservative** — it would report a healthier engine than
the approved data does.

**To close:** the 407 AFS supplement page. Until then this option should not
claim AFS coverage.

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
3. **A ruling on AFS** (item 4), and **whether a basic-inlet chart exists for
   the C47E/4** (item 3). Both are questions about which approved chart
   applies, and neither can be answered from the pages in hand.
4. **The 250-C47B family operating limits** (item 7).
