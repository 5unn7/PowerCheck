# Reading a chart by hand — optional, not a gate

**Status, 07 SEP 2026: this is a nice-to-have.** It was written as a blocker
and the operator's licensed engineer overruled that, correctly:

> Talking about the edge or the corner of every chart — if the lines are
> traced properly, you have to check it against the image that was given. As
> engineers we also just put a point, draw a line, draw a line, and come to a
> number. So pretty much what we are doing… I'm sure we are much more accurate
> than the naked eye.

That is right, and it is worth being precise about *why* it is right, because
the reasoning decides what still has to be true before a chart ships.

## What a hand reading actually catches, and what it does not

A hand reading is **not** a precision check. A trace resolves the printed line
to about a tenth of a pixel of its centre; an eye and a straightedge resolve it
to roughly half a grid square. On the 206L4 the trace lands 0.09% from the
manual's own printed answer, and on the 205A-1 the manual's own drawn arrow and
the manual's own printed number disagree with each other by more than the trace
disagrees with either. The paper is the limiting factor, not the method.

What a hand reading catches is a different failure: **a curve identified as the
wrong one.** If the family is traced perfectly but the 720 °C curve is labelled
740, every answer is smooth, plausible and wrong. That is not an eye-versus-
machine question, and it is the fault that actually occurred during the 205A-1
pass on 06 SEP 2026.

## What replaces it

Two checks, both automatic, both run on every build:

1. **The published example**, where the sheet has one. This catches a
   mis-identified curve outright, because a wrong label lands the answer a
   whole curve-spacing away from the printed number. Every chart in the app
   has one and reproduces it.
2. **Ladder consistency**, which needs no example at all. The curves in a
   family are strictly ordered, near-evenly spaced, and never cross. So: read
   every traced curve at one common row, sort, and require the spacing to be
   regular and the labelled values to run end to end with no leftover curve
   and no missing one. A gap of twice the spacing is a curve the trace missed.
   A curve with no label to take is a trace that hopped.

Check 2 is what got the four **212 PT6T-3B** sheets in, alongside a third:
where a chart exists on two plates, tracing both and requiring them to agree is
a stronger check than either alone, and stronger than a single hand reading.
Method in `docs/tracing-a-chart.md`.

## The 212 PT6T-3B readings — no longer needed

These were asked for when the four sheets could not be proved. They since were,
by a different route: dropping the gas producer half made the gage part number
irrelevant, which turned four sheets into two charts with **two independent
tracings each**, and the tracings agree to a few tenths of a degree. Nothing is
outstanding.

## Everything below is a spot-check

Useful, never required. Read the answer off the paper *before* looking at any
number the app gives, or the check is worth nothing — the eye finds what it is
told to find.

Two points per chart, both on labelled lines so nothing is interpolated by eye:

| Bell 407 fig 4-1 (all three sheets) | Torque | Pressure altitude | OAT |
|---|---|---|---|
| **A** — cold, low, low power | 50% | sea level | −40 °C |
| **B** — hot, high, high power | 75% | 12,000 ft | +50 °C |

| Bell 212 PT6T-3B fig 4-1 (all four sheets) | Torque | Pressure altitude | OAT |
|---|---|---|---|
| **A** | 50% | sea level | −40 °C |
| **B** | 80% | 10,000 ft | +30 °C |

The 212 sheets give two answers per entry — maximum allowable ITT *and*
maximum allowable N1 — and both are worth writing down, because the two panels
are separate families and a trace can be right on one and wrong on the other.

If a point runs past a boundary the sheet draws (**bleed valve opens**, or the
**maximum for takeoff** / **maximum continuous** cutoffs), move it in until it
reads cleanly and note what you used. Where a point stops being readable is
itself useful — that boundary is what the off-chart gate has to reproduce.

Any reading sent back becomes another entry in that chart's `verify` list,
checked on every build alongside the published examples.
