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

## 2 · The avoid-area gate cites no source

`src/aircraft/bell-407.js` → `kMin`

```js
kMin: (oat) => ((oat + 32.5) * 12.25) / 78.5,
```

When the computed chart ordinate falls below this line the tool refuses to
report a margin and tells the crew *"avoid area, repeat at higher torque."*
The formula was carried in from the project's first commit with no comment
and no citation, and nothing on BHT-407-FM-1 fig 4-1 marks an avoid area.

This is not idle: the BHT-206L4 chart in the same pack *does* print
**"avoid this area (possible bleed valve open area)"** explicitly, which
shows what a sourced version of this looks like — and shows that its absence
from the 407 page is meaningful.

**To close:** identify the source (a section 4 note? the original digitising
workbook?), or remove the gate. A blocking rule with no provenance is worse
than no rule.

## 3 · Engine model is never asked, and the charts differ on it

Read the titles:

| Page | Engines covered |
|---|---|
| BHT-407-FM-1 fig 4-1 (basic inlet) | 250-C47B **or** 250-C47B/8 |
| BHT-407-FMS-3 fig 4-1 (particle separator) | 250-C47B, 250-C47B/8 **or 250-C47E/4** |
| BHT-407-FMS-4 fig 4-1 (snow deflector) | 250-C47B, 250-C47B/8 **or 250-C47E/4** |

The basic inlet chart does not cover the **250-C47E/4**. The tool never asks
which engine is installed, so a C47E/4 on a basic inlet reads FM-1 — a chart
that, on its own title, does not apply to it.

**To close:** confirm whether a separate basic-inlet chart exists for the
C47E/4. If it does, it is a fourth chart. If it does not, the tool must ask
the engine model and refuse the combination.

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

## 5 · Each chart is proved at exactly one point

`test/charts.test.mjs`

Every chart reproduces the worked example printed beside it, to within 1 °C.
That is the right test and it is genuinely load-bearing — but the 407 charts
are proved only at **70% torque, 6000 ft, 10 °C**, one point near the middle
of a nomogram spanning −2000 to 20,000 ft and −40 to +50 °C.

A tracing can match at one point and drift at the corners, which is exactly
where the curves crowd together and where a digitising is least reliable.

**To close:** a second and third read per chart, chosen at the extremes — a
high, cold, low-torque corner and a low, hot, high-torque one. A reviewer
reading three values off each page would close this in about ten minutes and
it is the single highest-value thing anyone can contribute.

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
2. **The source of the `kMin` avoid-area rule** (item 2), or permission to
   delete it.
3. **A ruling on AFS and on the C47E/4** (items 3 and 4) — both are questions
   about which approved chart applies, and neither can be answered from the
   pages in hand.
4. **The 250-C47B family operating limits** (item 7).
