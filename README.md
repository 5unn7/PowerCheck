# Power Assurance

A power assurance check and engine trend log, read from the approved charts.
Install it to a phone's home screen and it works with no signal.

**Live: https://5unn7.github.io/PowerCheck/**

Currently digitised — **Bell 407** (Rolls-Royce 250-C47B):

- BHT-407-FM-1 fig 4-1, basic inlet (also read for AFS)
- BHT-407-FMS-3 fig 4-1, particle separator kit
- BHT-407-FMS-4 fig 4-1, snow deflector kit

Enter torque, MGT, OAT and pressure altitude, and it interpolates the chart the
same way the printed nomogram is walked by hand, then keeps a per-aircraft log
of MGT margin over time.

Each chart is checked against its own published example on every build
(70% torque, 6000 ft, 10 °C):

| Chart | Manual | This app |
|---|---|---|
| FM-1 basic | 676 °C | 675.6 |
| FMS-3 separator | 682 °C | 681.8 |
| FMS-4 snow deflector | 722 °C | 721.5 |

**This is a trending aid. The flight manual is the authority for any release.**

## Staying on the chart

The digitised charts cover the printed grid and nothing beyond it. A reading
outside that grid gets no margin: the number is withheld, the notice says which
reading is off and what the chart actually covers, and the check cannot be
logged or shared until it is corrected.

This matters because the interpolation extrapolates in the generous direction.
Torque entered as `700` instead of `70` would otherwise read a confident
+3381 °C margin, in green. The bounds are read from the chart data itself, so
re-digitising a chart moves them with it — including the torque span, which
narrows at high pressure altitude where the printed curves stop short of 100%.

## Installing it on a phone

There is no app store build. It installs as a PWA, which on both platforms
gives a home screen icon, its own window with no browser chrome, and full
offline use once installed.

- **Android / Chrome** — open the link, then *Install app* from the ⋮ menu.
- **iOS / Safari** — open the link, then Share → *Add to Home Screen*.
  It has to be Safari; iOS does not let other browsers install a PWA.

The service worker precaches the whole app on first load, so after that it
opens and computes with no network at all. A new version is picked up the next
time it is opened with signal.

## Where the log lives

Checks are stored in the browser's `localStorage`, per browser and per device —
installing to the home screen does not share the log with the browser tab it was
installed from. Clearing site data clears the log. Use **Export CSV** on the
Trend tab for anything you need to keep.

Import recomputes every row from its own readings rather than trusting the
`k`, `max_mgt` and `margin` columns, so a stale or edited export cannot quietly
rewrite the trend. Rows that are off-chart, undated or unparseable are skipped
and counted, re-importing a file you already imported adds nothing, and exports
written by earlier versions still read correctly.

## Adding an aircraft

See [docs/adding-an-aircraft.md](docs/adding-an-aircraft.md). An aircraft whose
manual walks the same chart shape as the 407 is a JSON file and a definition
module. One that walks a different shape — Ng and TOT, say — also needs a
procedure module, which is the only place that knows the shape of the walk.

Send the power assurance page from the manual and it gets digitised, with its
own published example wired in as the acceptance test.

## Working on it

```
npm install
npm run check      # build, verify the charts, then drive the page in a browser
```

| | |
|---|---|
| `npm run build` | bundles `entry.jsx` into `index.html` and writes `sw.js` |
| `npm test` | every chart against its published example, plus the off-chart gate |
| `npm run smoke` | loads the built page in Chromium and drives it |
| `npm run icons` | re-renders the PNG icons from `icons/icon.svg` |

`index.html` is the whole site — React, Recharts, the chart data and the app all
inlined, no CDN and no server. `entry.jsx` is the build entry: it supplies
`window.storage`, the async key/value store the app persists through, backed by
`localStorage`. Browsers do not provide one, so building `src/App.jsx` directly
gives a page that renders but never saves a log.

The build is reproducible, and CI fails if the committed `index.html` does not
match a fresh build — so a source change without a rebuild cannot reach the
site.

### Layout

```
src/engine/       interpolation, atmosphere, formatting — no aircraft in here
src/procedures/   one per chart shape; index.js reads, view.jsx draws
src/aircraft/     one per type: digitised charts and what is fitted
src/App.jsx       the UI, which knows about none of the above specifically
```
