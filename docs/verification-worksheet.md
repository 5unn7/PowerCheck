# Corner check — 407 charts

Six readings, two points on each of the three charts. Purpose: the digitised
curves are currently proved at **one point per chart**, and all three of those
points are the same middling one the manual prints — 70% torque, 6000 ft,
10 °C. That is the centre of a chart running −2000 to 20,000 ft and −40 to
+50 °C. A tracing can be exact in the middle and drift at the edges.

## Please read the answer off the paper before looking at any number here

There is deliberately no expected value in this file. If you read the chart
already knowing what the app says, the check is worth nothing — the eye finds
what it is told to find. Read it, write it down, then compare.

## The two points

Both sit on **labelled** lines on all three sheets, so nothing has to be
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

## Record

| Chart | Point | Torque | Hp | OAT | Max allowable MGT read |
|---|---|---|---|---|---|
| BHT-407-FM-1 fig 4-1 (basic) | A | 50% | SL | −40 | |
| BHT-407-FM-1 fig 4-1 (basic) | B | 75% | 12,000 | +50 | |
| BHT-407-FMS-3 fig 4-1 (particle separator) | A | 50% | SL | −40 | |
| BHT-407-FMS-3 fig 4-1 (particle separator) | B | 75% | 12,000 | +50 | |
| BHT-407-FMS-4 fig 4-1 (snow deflector) | A | 50% | SL | −40 | |
| BHT-407-FMS-4 fig 4-1 (snow deflector) | B | 75% | 12,000 | +50 | |

## What happens next

Each reading becomes another entry in that chart's `verify` list, checked on
every build the same way the published examples are — so if a chart is ever
re-digitised and drifts at the corners, the build fails rather than the app
quietly reporting a wrong margin.

If a reading disagrees with the app by more than a couple of degrees, that is
the finding: it means the tracing is good in the middle and off at the edge,
and the curve needs redoing. That is worth knowing.
