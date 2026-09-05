# Bell 407 Power Assurance

A power assurance check and engine trend log for the Bell 407, built from the
approved charts:

- BHT-407-FM-1 fig 4-1, basic inlet (also read for AFS)
- BHT-407-FMS-3 fig 4-1, particle separator kit
- BHT-407-FMS-4 fig 4-1, snow deflector kit

Enter torque, MGT, OAT and pressure altitude, and it interpolates the chart the
same way the printed nomogram is walked by hand, then keeps a per-aircraft log
of MGT margin over time.

Verified against each chart's own published example (70% torque, 6000 ft, 10 °C):

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

## Publishing it

`index.html` is the entire site. React, Recharts, the chart data and the app are
all inlined — no build step to run on the server, no CDN, no backend.

`.github/workflows/pages.yml` publishes it: every push to `main` uploads the
repo root and deploys it to GitHub Pages. The first run turns Pages on by
itself, so there is nothing to click in Settings.

Works offline once loaded, apart from the web font, which falls back to the
system face if it can't be fetched.

## Where the log lives

Published copies store checks in the browser's `localStorage`, per browser and
per device. Clearing site data clears the log. Use **Export CSV** on the Trend
tab for anything you need to keep.

Import recomputes every row from its own OAT, pressure altitude, torque and MGT
rather than trusting the `k`, `max_mgt_c` and `margin_c` columns, so a stale or
edited export cannot quietly rewrite the trend. Rows that are off-chart, undated
or unparseable are skipped and counted, and re-importing a file you already
imported adds nothing.

## Rebuilding

```
npm install
npm run build
```

`entry.jsx` is the build entry point and `bell-407-power-check.jsx` is the app.
The entry supplies `window.storage`, the async key/value store the app persists
through, backed by `localStorage` — browsers do not provide one, so building the
component directly produces a page that renders but never saves a log. The build
inlines the bundle into `shell.html` and writes `index.html`.
