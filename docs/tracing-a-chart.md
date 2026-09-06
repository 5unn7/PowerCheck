# Taking curves off a scanned nomogram

Written after doing it to BHT-206L4-FM-1 fig 4-1, which is now in the app and
reads 64.91% against the manual's printed 65%. It is here so the next one can
be done the same way, and so the result can be argued with.

The Bell PDFs are raster — 108 ppi, zero embedded fonts — so there is no vector
geometry to extract. Everything below works on pixels.


## 1. Find the frame and calibrate the axes

Sum ink down each column and across each row of the whole page. The plot frame
and the major grid lines stand out as spikes. On the 206L4 page (2550 × 1650):

| | pixels |
| --- | --- |
| outer frame | cols 270 and 2445, rows 176 and 1452 |
| plot area | rows 458 (top) to 1293 (bottom) |
| major grid | every 111.2 px, both directions |
| OAT −50 °C | x = 416, at 11.12 px per °C |
| torque 40% | x = 1636, at 11.133 px per % |

Two independent checks that the calibration is right: the major grid spacing
must come out the same in both directions on a chart drawn on square grid
paper, and the tick spacing must divide the labelled range exactly
(1636 + 6 × 111.33 = 2304, which is where the printed 100% sits).

Never calibrate off the axis *labels* — they are set type and sit wherever the
draughtsman put them. Calibrate off the tick marks and grid lines.


## 2. Separate the curves from the grid

On these scans the curves are solid black and the grid is a light dither. Three
passes, in order:

1. **Threshold at 110.** The dither is mostly 160–200 grey and largely vanishes;
   the curves are 0–60.
2. **Delete long runs.** Any pixel inside a horizontal or vertical run of 14 or
   more is grid, frame or a shallow boundary line. A curve steep enough to
   matter never has a run that long.
3. **Delete components under 30 px.** What is left of the dither is isolated
   specks. Curves are hundreds of pixels.

Check the result by eye at this point — render the surviving mask and look at
it. On the 206L4 this left the fifteen TOT curves, the nine altitude curves,
the two carpet boundaries, and the label text, and nothing else.


## 3. Follow each curve

Connected components will not do it: in a carpet the curves touch the
boundaries and each other, and the whole plot comes back as one blob.

Scan row by row instead. For each raster row, list the x of every ink blob.
Then from a seed blob, step one row at a time, predicting the next x by fitting
a line through the last 30 accepted points and accepting the nearest blob
within about 4 px. Allow the prediction to run on through a gap of up to ~30
rows — that is what carries the trace under a label lying across the curve.

Two things make this reliable rather than lucky:

- **Suppress the grid columns explicitly.** A vertical grid line 14 px from a
  curve will capture the trace as soon as a label opens a gap. Drop blobs
  narrower than 3 px that sit within 3 px of a known grid column.
- **Seed every curve from more than one row and merge the point clouds.** A
  single seed can hop; two seeds that agree cannot both have hopped the same
  way. Fit a cubic to the merged cloud, drop points more than 3 px off it,
  refit.

The residual of that final fit is the honest error bar. On the 206L4 every
curve came in at 0.4–1.3 px, which is under a tenth of a degree of OAT.


## 4. Identify which curve is which

This is the step that actually decides whether the data is right, and it is not
done by counting labels — OCR on a 108 ppi scan of type rotated 60° is not
trustworthy.

Do it by **spacing and by the manual's own worked example**:

1. Read every traced curve at one common row. Sort. The spacing should be
   near-uniform; a gap of twice the spacing is a curve the trace missed, and
   you go back and seed it.
2. Take the printed example, convert its answer to pixels, and see which curve
   lands there. On the 206L4 the example (OAT 25 °C, TOT 720 °C, Hp 12,000 ft →
   65%) fixes *two* curves in two different families at once.
3. Step outwards from that anchor in the labelled interval. If the ladder
   reaches both ends of the family without a leftover curve or a missing one,
   the assignment is consistent.

If step 3 does not close, something is wrong — do not patch it. On the 206L4 it
closed at 500 through 768 °C on the left and sea level through 16,000 ft on the
right, with the dashed 768 curve falling 19 px from the 760 as an 8 °C step
should.


## 5. Prove it before shipping

Three tests, all of which the repo now runs on every build:

- **The printed example.** In `verify` on the aircraft, checked by `npm test`.
  This is the only one that can catch a systematic error.
- **Monotonicity across the family.** Carry must rise with TOT at a shared OAT;
  minimum torque must fall as altitude rises. Two curves that cross are two
  curves that were mis-assigned, and interpolating between them is nonsense.
- **Every curve ascends in its own x**, so `interp` can bracket it.

And store each curve **only over the extent it was actually drawn**. That is
not tidiness: on this chart the drawn extent *is* the printed AVOID THIS AREA
boundary and the top of the carpet, so keeping it is what lets the app refuse a
reading Bell refused to answer, without a single hardcoded limit.


## What this does not fix

A tracing with no printed answer to check it against is a measurement with no
witness. The three steps above will happily produce a smooth, monotone,
self-consistent, wrong chart. Ten of the sheets in `pending-charts.md` are in
exactly that position, and that is why they are not in the app.
