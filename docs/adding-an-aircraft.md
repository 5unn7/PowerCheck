# Adding an aircraft

Two kinds of aircraft exist here, and they cost very different amounts of work.

An aircraft whose manual walks the **same chart shape** as the 407 — torque and
pressure altitude give a K factor, K and OAT give a maximum MGT — is data. It
needs a `.charts.json` and a definition module, and nothing else changes.

An aircraft whose manual walks a **different shape** — Ng and TOT, a single
combined chart, a table rather than a nomogram — also needs a procedure module.
That is the only place in the app that knows what the walk is. `src/App.jsx`
does not, and must not learn.

## The same shape: charts plus a definition

### 1. Digitise the charts

One JSON file per aircraft, at `src/aircraft/<id>.charts.json`, holding one
entry per configuration the manual publishes a separate chart for:

```json
{
  "basic": {
    "pa":   [-2000, -1000, 0, ...],
    "tqK":  [ [[52.28, -0.08], [54.60, 1.87], ...], ... ],
    "oat":  [-40, -35, ...],
    "mgtK": [ [[409.1, 102.0], [412.7, 99.4], ...], ... ]
  }
}
```

| key | what it is |
|---|---|
| `pa` | pressure altitudes, ascending, one per torque curve |
| `tqK` | for each `pa`, that curve as `[torque %, K]` points, ascending in torque |
| `oat` | outside air temperatures, ascending, one per MGT curve |
| `mgtK` | for each `oat`, that curve as `[max MGT °C, K]` points |

`tqK[i]` is the curve printed for `pa[i]`, so the two arrays must be the same
length. Same for `oat` and `mgtK`. The test suite checks this.

Trace enough points to hold the curvature — the 407 charts use 10 to 22 per
curve, closer together where the curve bends. Where a printed curve stops short
of the axis, stop tracing there and repeat the last point to pad the row: the
app reads the end of a curve as the edge of the chart and refuses to answer
past it, which is the behaviour you want.

### 2. Write the definition

Copy `src/aircraft/bell-407.js` and change what differs: `id`, `label`, the
`inputs` the crew reads off the panel, the `options` that select a chart,
`variantFor` mapping those options to a chart key, the `meta` for each chart,
`kMin` if the engine has an avoid area, and `footer`.

#### Fitted, or per check?

Every option carries a scope, and getting it wrong is the one mistake here
that produces a wrong answer quietly rather than loudly.

| `scope` | Is | Examples |
|---|---|---|
| *(omitted)* — fitted | a property of the airframe, set once and remembered | inlet, snow deflectors, gas producer gage P/N, serial range |
| `"check"` | a property of *this* check, chosen every time | which engine was measured |

They look the same on screen and both can select a chart, but they behave
differently where it counts: **check-scope options partition the trend.** A
trend line may only join the same measurement of the same thing, so engine 1
never joins engine 2. A fitted option changing is a step in one engine's
life, so it does *not* split the line.

```js
{ key: "engine", scope: "check", type: "segmented", label: "Engine", default: "1",
  choices: [{ id: "1", label: "Engine 1" }, { id: "2", label: "Engine 2" }] },
```

**Only put something here that the manual itself distinguishes.** The 407's
chart is headed *hover or level flight* — one check, either way of flying it —
so how it was flown is a condition of the chart, and belongs in `cond`, not in
`options`. The 212's check is run one engine at a time and logged per engine,
so the engine does. If the manual prints one chart, it is one check.

Where a manual *does* print separate sheets for a check flown differently —
the 212's PT6T-3B has hover and in-flight sheets — those are different charts.
If they also come from a different engine model, they are a different aircraft
entry, not a mode on an existing one.

#### When no chart applies

`variantFor` may return `null`, meaning the approved data in hand does not
cover this configuration. Say why in `noChart`, in the crew's terms and
naming the page:

```js
variantFor: ({ inlet, snow, engine }) => {
  if (snow) return "psb";
  if (inlet === "ps") return "ps";
  return engine === "c47e4" ? null : "basic";   // FM-1 does not name the E/4
},
noChart: ({ engine, inlet, snow }) =>
  engine === "c47e4" && inlet === "basic" && !snow
    ? "BHT-407-FM-1 fig 4-1 is titled for the 250-C47B and 250-C47B/8 only…"
    : null,
```

The tool then refuses: no number, no Log button, and the reason on screen.
That is the right outcome — reading a chart that does not name the
installation is how a tool reports a healthier engine than the approved data
does.

`noChart` must be the exact complement of `variantFor` returning `null`, and
`npm test` asserts it across every combination of an aircraft's options
rather than trusting the two to be kept in step by hand. Keeping them
separate is deliberate: the reason belongs in the crew's words, not in a
chart key.

If the printed scale differs from the 407's — a torque axis that runs to 110%,
an MGT axis starting at 300 — add a `frame`:

```js
frame: { tq: [35, 110], mgt: [300, 800], k: [-2, 102], tqTick: 5, mgtTick: 25, kTick: 10 },
```

### 3. Give it its published examples

Every chart in a flight manual prints a worked example beside it. Put each one
in `verify`:

```js
verify: [
  { config: { inlet: "basic", snow: false }, oat: 10, pa: 6000, tq: 70,
    maxMGT: 676, source: "BHT-407-FM-1 fig 4-1" },
],
```

`npm test` walks each one through the digitised chart and fails if the answer
is more than 1 °C from the number printed in the manual. This is the whole
acceptance test for a chart: a digitising slip shows up here, and CI will not
deploy past it.

### 4. Register it

Add it to `AIRCRAFT` in `src/aircraft/index.js`. The picker appears in the UI
by itself once there is more than one.

## A different shape: add a procedure

A procedure is a module exporting four things, and the app needs nothing else:

| export | contract |
|---|---|
| `compute({ chart, aircraft, ...readings })` | `{ margin, stats: [{label, value}], notes: [string] }`, plus whatever else the aircraft wants to log |
| `axes(chart)` | the domain of each axis, read from the chart data |
| `offChart({ chart, ...readings })` | `[]` when every reading is on the chart, else a plain sentence per reading that is not |
| `DEFAULT_FRAME` | the printed scale, if the procedure draws a chart |

Its drawing half lives beside it as `view.jsx`, exporting `Chart` and
`drawCard`, and is registered in `src/views.js`. Keeping the two apart is what
lets `npm test` run the chart maths in plain node with no build step — do not
import React into the computing half.

Register the procedure in `PROCEDURES` in `src/aircraft/index.js` and name it
from the aircraft's `procedure` field.

## `offChart` is not optional

The interpolation in `src/engine/interp.js` fits a line through the two points
bracketing a reading and keeps going past the ends of the curve. It does not
clamp, and past the end it reads **optimistic**: torque entered as 700 instead
of 70 computed a confident +3381 °C margin before the gate existed.

Every procedure is therefore responsible for refusing to answer off its own
grid, and every aircraft gets the off-chart cases in the test suite for free.
Derive the bounds from the chart data rather than writing numbers down, so
re-digitising a chart moves them with it.
