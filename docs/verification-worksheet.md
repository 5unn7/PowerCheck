# Reading the charts by hand

Two jobs, on two different aircraft, for the same reason: a digitised chart is
a measurement, and a measurement with nothing to check it against is a number
nobody should sign against.

- **Part 1 — Bell 407.** Three charts already in the app, each proved at one
  middling point. Two corner readings each would prove the edges.
- **Part 2 — Bell 212 PT6T-3B.** Four charts *not* in the app, and they cannot
  go in, because Section 4 turned out to carry no worked example for figure 4-1
  at all. One reading per sheet unblocks them.

## Please read the answer off the paper before looking at any number here

There is deliberately no expected value anywhere in this file. If you read the
chart already knowing what the app says, the check is worth nothing — the eye
finds what it is told to find. Read it, write it down, then compare.

---

# Part 1 — Bell 407, the corners

The digitised curves are proved at **one point per chart**, and all three of
those points are the same middling one the manual prints — 70% torque, 6000 ft,
10 °C. That is the centre of a chart running −2000 to 20,000 ft and −40 to
+50 °C. A tracing can be exact in the middle and drift at the edges.

Both points sit on **labelled** lines on all three sheets, so nothing has to be
interpolated by eye.

| | Torque | Pressure altitude | OAT |
|---|---|---|---|
| **A** — cold, low, low power | **50%** | **sea level** | **−40 °C** |
| **B** — hot, high, high power | **75%** | **12,000 ft** | **+50 °C** |

Where they fall vertically on the chart, against the published example:

```
     bottom                    middle                        top
        A                   (published)                       B
```

A sits near the bottom edge of the plotted area and B in the upper part, so
between them they exercise the whole height of both panels — the torque/
pressure-altitude family on the left, and the OAT family on the right.

If A is awkward to read that close to the edge, move it in a little (60%
torque, or −30 °C) and note what you actually used. A slightly-inside point
still tells us far more than the centre does.

### Record

| Chart | Point | Torque | Hp | OAT | Max allowable MGT read |
|---|---|---|---|---|---|
| BHT-407-FM-1 fig 4-1 (basic) | A | 50% | SL | −40 | |
| BHT-407-FM-1 fig 4-1 (basic) | B | 75% | 12,000 | +50 | |
| BHT-407-FMS-3 fig 4-1 (particle separator) | A | 50% | SL | −40 | |
| BHT-407-FMS-3 fig 4-1 (particle separator) | B | 75% | 12,000 | +50 | |
| BHT-407-FMS-4 fig 4-1 (snow deflector) | A | 50% | SL | −40 | |
| BHT-407-FMS-4 fig 4-1 (snow deflector) | B | 75% | 12,000 | +50 | |

---

# Part 2 — Bell 212 PT6T-3B, figure 4-1

**This is now the higher-value one.** Everything else about these four sheets
is complete — the walk, the conditions, the gage split, the verdict wording
from §4-2-A. The only thing missing is a single number to check a tracing
against, and Section 4 does not print one. The sample performance problem at
§4-11 is a payload problem, not a power check. The arrows drawn on each sheet
carry no values.

So unlike the 407, where a hand reading would *improve* confidence, here a hand
reading is the difference between the charts going in and not going in.

### Why every sheet needs its own

They are four different charts, not one chart in four presentations:

| Sheet | Check | Gas producer gage P/N |
|---|---|---|
| 1 of 4 | hover | 212-075-037-101 |
| 2 of 4 | in-flight | 212-075-037-101 |
| 3 of 4 | hover | 212-075-037-113 |
| 4 of 4 | in-flight | 212-075-037-113 |

Hover and in-flight are drawn from different data. The two gage part numbers
put a different N1 scale on the right-hand panel (85–105 against 86–106). A
reading off one proves nothing about any of the others.

### The walk, as the sheet states it

> Enter chart at indicated engine torque, move up to intersect Hp, proceed to
> right to intersect OAT, then move up to read values for maximum allowable ITT
> and gas prod (N1) RPM.

So one entry gives **two** answers, and both are worth recording — the ITT
panel and the N1 panel are separate families and a tracing can be right on one
and wrong on the other.

### The points

| | Torque | Pressure altitude | OAT |
|---|---|---|---|
| **A** — cold, low, low power | **50%** | **sea level** | **−40 °C** |
| **B** — hot, high, high power | **80%** | **10,000 ft** | **+30 °C** |

Both are on labelled lines. If either runs past a boundary the sheet draws —
the **bleed valve opens** line at either end, or the **maximum for takeoff** /
**maximum continuous** cutoffs — move it in until it reads cleanly and write
down what you actually used. Where a point *stops* being readable is itself
useful: that boundary is what the app's off-chart gate has to reproduce.

**If time is short, point A alone on each of the four sheets is enough.** One
point per sheet catches a systematic error, which is the failure that matters.
The second point only catches drift at the far corner.

### Record

| Sheet | Point | Torque | Hp | OAT | Max allowable ITT | Max allowable N1 |
|---|---|---|---|---|---|---|
| 1 of 4 — hover, gage −101 | A | 50% | SL | −40 | | |
| 1 of 4 — hover, gage −101 | B | 80% | 10,000 | +30 | | |
| 2 of 4 — in-flight, gage −101 | A | 50% | SL | −40 | | |
| 2 of 4 — in-flight, gage −101 | B | 80% | 10,000 | +30 | | |
| 3 of 4 — hover, gage −113 | A | 50% | SL | −40 | | |
| 3 of 4 — hover, gage −113 | B | 80% | 10,000 | +30 | | |
| 4 of 4 — in-flight, gage −113 | A | 50% | SL | −40 | | |
| 4 of 4 — in-flight, gage −113 | B | 80% | 10,000 | +30 | | |

---

## Still outstanding, and possibly cheaper than reading by hand

For these, the facing page in the manual may already carry a worked example,
which would be better than a hand reading because it is the manufacturer's own:

| Sheet | What to look for |
|---|---|
| 206L4 FMS-7 fig 4-1, sheets 1–2 | **checked 06 SEP 2026 — page 3 carries no example.** §4-2 points at BHT-206L4-FM-1 Section 4 instead, which is still wanted. Corner readings needed. |
| 205A-1 FM-2 and FM-3 | **received 06 SEP 2026 — both carry the example.** Nothing further needed. |

One page is still worth more than any hand reading: **the beginning of Section
4 of BHT-206L4-FM-1**. Both FMS-7 sheets defer to it for the procedure, and
the 206L4 chart already shipped is missing its pass and fail wording for want
of it.

## What happens to each reading

It becomes an entry in that chart's `verify` list, checked on every build the
same way the published examples are. If a chart is ever re-digitised and drifts
at the corners, the build fails rather than the app quietly reporting a wrong
margin.

If a reading disagrees with the app by more than a couple of degrees, that is
the finding: the tracing is good in the middle and off at the edge, and the
curve needs redoing. That is worth knowing.
