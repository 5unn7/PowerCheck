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

## Publishing it

`index.html` is the entire site. React, Recharts, the chart data and the app are
all inlined — no build step, no CDN, no server.

1. Create a repo and drop `index.html` at its root.
2. Settings → Pages → Source: *Deploy from a branch*, branch `main`, folder `/ (root)`.
3. It appears at `https://<user>.github.io/<repo>/` within a minute or two.

Works offline once loaded, apart from the web font, which falls back to the
system face if it can't be fetched.

## Where the log lives

Published copies store checks in the browser's `localStorage`, per browser and
per device. Clearing site data clears the log. Use **Export CSV** on the Trend
tab for anything you need to keep.

## Rebuilding

The source is `bell-407-power-check.jsx`.

```
npm i react@18 react-dom@18 recharts@2 esbuild
esbuild entry.jsx --bundle --minify --format=iife --target=es2019 \
  --define:process.env.NODE_ENV='"production"' --outfile=bundle.js
```

Then inline `bundle.js` into a `<script>` tag in `index.html`.
