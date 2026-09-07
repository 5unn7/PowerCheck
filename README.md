# Power Assurance

A power assurance check and engine trend log, read from the approved charts.
Install it to a phone's home screen and it works with no signal.

**Live: https://5unn7.github.io/PowerCheck/**

The app opens on the aircraft page: pick the type, and the check that follows
is read from its charts. The header badge names the type and goes back to
change it.

Currently carried:

**Bell 407** — Rolls-Royce 250-C47B. Torque, MGT, OAT and pressure altitude are
walked through the printed nomogram the same way they are by hand, giving an
MGT margin in °C.

- BHT-407-FM-1 fig 4-1, basic inlet (also read for AFS)
- BHT-407-FMS-3 fig 4-1, particle separator kit
- BHT-407-FMS-4 fig 4-1, snow deflector kit

**Bell 212 · PT6T-3** — ground check, one engine at a time. Pressure altitude
gives the torque to stabilise at; OAT gives the gas producer speed and turbine
temperature that torque must not exceed. Two limits, so ITT margin is the
headline and N1 is checked alongside it — a gas producer over its limit fails
the check however much room ITT has.

- BHT-212VFR-FM-1 fig 4-2, PT6T-3 power assurance check (ground)

**Bell 206L-4 · 250-C30P** — level flight check, and the one that runs the
other way round: the chart does not give a temperature to stay under, it gives
the *minimum torque* the engine must be making at the observed TOT, OAT and
pressure altitude. So the margin is in percent of torque. The chart's printed
AVOID THIS AREA (possible bleed valve open) is the lower edge of the curves
themselves, so a check flown too cool is refused by name rather than answered.

- BHT-206L4-FM-1 fig 4-1, base aircraft
- BHT-206L4-FMS-7 fig 4-1 sheet 1, snow deflector
- BHT-206L4-FMS-7 fig 4-1 sheet 2, snow deflector and particle separator

**Bell 205A-1 · Lycoming T53** — maximum power (torquemeter pressure) check,
flown in a climb. The chart answers with a torquemeter pressure the engine must
reach, so the margin is in PSI. Split by **serial number**: three manuals,
three approvals, three separately traced charts.

- BHT-205A1-FM-1 page 5-7, SN 30001 through 30052
- BHT-205A1-FM-2 page 5-7, SN 30053 through 30127
- BHT-205A1-FM-3 page 5-7, SN 30128 and subsequent

Every chart is checked against its own published example on every build:

| Chart | Manual | This app |
|---|---|---|
| 407 FM-1 basic | 676 °C | 675.6 |
| 407 FMS-3 separator | 682 °C | 681.8 |
| 407 FMS-4 snow deflector | 722 °C | 721.5 |
| 212 fig 4-2 · torque at 1500 ft | 47.0% | 47.0 |
| 212 fig 4-2 · limits at OAT 20 | 96.3% / 735 °C | 96.3 / 735 |
| 206L4 FM-1 · min torque | 65% | 64.9 |
| 205A-1 FM-1 · chart PSI | 43.1 PSI | 43.4 |
| 205A-1 FM-2 · chart PSI | 43.1 PSI | 43.3 |
| 205A-1 FM-3 · chart PSI | 43.1 PSI | 43.3 |

Two charts print no example — the 206L-4's snow deflector sheets — and those
are held to a different test: every kit bolted to the inlet costs power, so the
torque a healthy engine must demonstrate can only fall as more is fitted. Three
plates traced independently agree on that ordering at every comparable point.

Four more charts have been received and are not in yet — the 212's PT6T-3B
sheets. Every one of them is
Each is three carpets sharing a carry rather than one, and their axes are
already pinned — see [docs/pending-charts.md](docs/pending-charts.md). The
method is in [docs/tracing-a-chart.md](docs/tracing-a-chart.md).

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
opens and computes with no network at all.

Updates work like this. A launch always runs the version already on the device —
that is what makes it work with no signal. If there is a connection, the app
checks for a new version in the background on every launch; when one installs,
a bar appears offering **Restart now**, and if it is ignored the new version is
used the next time the app is opened. It never reloads on its own, which would
throw away a check being typed. The footer carries a build id, so a version can
be read back off a phone.

Precaching deliberately bypasses the browser's HTTP cache. GitHub Pages serves
the page with `max-age=600`, and without that bypass the new worker re-caches
the page it was meant to replace: the cache name changes, the content does not,
and an installed app can sit on a stale version indefinitely. That is not
theoretical — it is what this app did until it was tested.

## What a trend line may join

A trend is only meaningful across checks that are the same measurement of the
same thing, so the log splits on the tail number and on anything the flight
manual itself treats as a separate check. The 212's power assurance is run one
engine at a time and logged per engine, so engine 1 and engine 2 are separate
lines — plotting both as one averages two engines' deterioration into a slope
belonging to neither.

What is *fitted* — the inlet, snow deflectors — does not split the line. That
is a step in one engine's life, not a different engine.

The 407 splits on nothing but the tail. Its chart is headed *hover or level
flight*, so both are the same check read off the same chart, and the app does
not invent a distinction the manual does not make.

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
src/pick.jsx      the aircraft page the app opens on
```
