# Design

The visual system PowerCheck already uses, written down so it stays coherent.
Everything here is read out of `src/css.js` and the two `view.jsx` files — this
document describes what the code does, it does not propose anything new. The
`ui-ux` skill in `.claude/skills/` reads this as the token source before
touching any interface work.

## What the interface is for

A pilot or engineer, on a phone, on a ramp — often in sunlight, sometimes
one-handed, possibly gloved, usually with no signal. They type four numbers and
read one. The whole product is *that number and whether it can be trusted*.

Every rule below follows from that. The margin is enormous because it is the
answer. Color is scarce because when it appears it means something. There are
no shadows, gradients or rounded corners because the thing being imitated is a
flight manual page, and because ornament is one more thing to read past at the
moment when reading past things is expensive.

## Palette

Structural — builds the page, carries no claim:

| Token | Hex | Use | On white |
|---|---|---|---|
| `--paper` | `#fff` | Cards, panels, header, input rows | — |
| `--base` | `#f4f6f7` | Page ground behind the panels | — |
| `--line` | `#dfe5e7` | Every rule and border | 1.27:1 |
| `--line-2` | `#eef1f2` | Interior rules — table rows, field dividers | — |
| `--ink` | `#16272c` | Body text, primary buttons, focus rings | 15.4:1 |
| `--ink-2` | `#4a6067` | Secondary text | 6.7:1 |
| `--ink-3` | `#8b9ba1` | Micro-labels, captions, tick labels | **2.9:1** |

Semantic — each carries exactly one claim, assigned in `statusOf()` in
`src/engine/format.js` and surfaced through the `--accent` custom property set
on `.wrap`:

| Token | Hex | Means | On white |
|---|---|---|---|
| `--green` | `#0d6a4d` | Margin is positive. **Not** "serviceable" | 6.6:1 |
| `--amber` | `#ad5f0b` | Inside an operator's watch band, or off-chart notice | 4.8:1 |
| `--red` | `#9c211a` | Over the chart maximum | 7.9:1 |

One orange ramp exists outside the system, on the snow-deflector switch only
(`#ffa23f → #f95d00`, label `#d1550a`). It is the single skeuomorphic object in
the app — a physical toggle for a physical fitment. Do not spread it.

**Color never carries meaning alone.** The margin's sign is in the digits and
in `statusOf().label`; the accent only reinforces it. This is deliberate — the
app is read in sunlight by people who may be colorblind, and a green number is
still a number.

## Type

Two families, loaded from Google Fonts with a system fallback stack:

- **Barlow** — body, 15px/1.5. Prose, buttons, table cells, notes.
- **Barlow Semi Condensed** — every number and every display element. Condensed
  because a 76px margin has to fit next to its unit on a 390px phone.

The scale in use, largest first:

| px | Where | Family |
|---|---|---|
| 76 | The margin. The answer | Semi Condensed 600 |
| 29 | Page title | Semi Condensed 600 |
| 26 | Aircraft card title, reading inputs | Semi Condensed 600 |
| 25 | Stat values | Semi Condensed 600 |
| 23 | Margin unit (`°C`) | Semi Condensed 600 |
| 17 | Registration field | Semi Condensed 600 |
| 15 | Body, buttons, hero side-label | Barlow |
| 14 | Tabs, switch label, save inputs | Barlow |
| 13 | Table cells, small buttons, card engine | Barlow |
| 11.5 | Conditions text, watch note, footer | Barlow |
| 10 | Uppercase micro-labels | Barlow 600 |

Micro-labels are 10px, weight 600, `letter-spacing: .08em`, uppercase — the
instrument-panel convention, and the letter-spacing is what makes them legible
at that size. Display sizes tighten instead (`-.01em` to `-.03em`).

**Every number gets `font-variant-numeric: tabular-nums`.** A margin that
shifts sideways as it recomputes while someone is typing reads as instability
in the answer.

## Shape, depth and space

- **`border-radius: 0`** everywhere except the switch. This is a document, not
  a card deck.
- **Rules, never shadows.** Regions are separated by `1px solid var(--line)`.
  The only shadows in the app are on the switch knob, because it is pretending
  to be a physical object. Adding elevation anywhere else changes the dialect.
- **Hairline grids** come from `display: grid; gap: 1px; background: var(--line)`
  with opaque children — the gap *is* the rule. See `.fleet`.
- **Full-bleed section rules.** Panels run edge to edge with `20px` interior
  padding; the chart escapes it with `margin: 26px -20px 0`.
- Page is capped at `max-width: 820px`, centred.
- Interior padding sits on a loose 4px rhythm — 20px section padding, 26px
  panel, 14–16px fields, 6px label-to-control.

## Motion

Transitions are 0.18–0.22s on color and border. The one exception is the switch
knob at 0.44s on `cubic-bezier(.34,1.52,.64,1)` — an overshoot that suits a
physical toggle and suits nothing else here.

`prefers-reduced-motion: reduce` kills every transition in `.wrap`.

## Focus

`2px solid var(--ink)` at `outline-offset: 2px`, on `:focus-visible` only so
pointer users do not get rings on click. Underlined inputs, which cannot show
an offset ring cleanly, use `box-shadow: inset 0 -2px 0 -1px var(--ink)`
instead. Field rows show focus on the whole row with an inset 1.5px ring, so
the active reading is obvious at arm's length.

## Language

Covered by the airworthiness rules in `CLAUDE.md`, and they are design rules as
much as copy rules: a positive margin gets **no verdict**, a negative one reads
*"Over the chart maximum"*. Any judgement band names whose figure it is. The
interface must never imply an airworthiness release, so there is no green tick,
no "PASS", and no badge that could be photographed and read as one.

## Accessibility floor

The app is read in sunlight, sometimes through gloves, by someone who has
better things to do than squint. These are checked by measurement rather than
by eye — the script that walks the built page is in the commit that closed
them, and the numbers below are what it reports.

- **Text clears WCAG AA** on the ground it is actually painted on. `--base`
  is the binding constraint, not `--paper`: `--ink-3` is 5.15:1 on paper but
  4.75:1 on the page ground, so the ground is what a new tone must be checked
  against.
- **Every touch target is at least 44×44px.** Where a control is painted
  smaller than that on purpose — the tabs, whose rule is meant to be exactly
  as wide as the label — the target is widened past the paint with a
  pseudo-element rather than by growing the control.
- **Every control shows a focus ring at the first frame after Tab.** Not
  eventually: `transition: all` once animated `outline-width` from zero, so
  the ring faded in over 180ms and never fully drew for anyone tabbing at
  speed. Transitions on interactive elements name their properties.
- **Every control has an accessible name.** The delete button's name was the
  character `×`, which is what a screen reader read out for the one action in
  the app that cannot be undone.

## Known gaps

**Borders on interactive controls are below 3:1.** `--line` `#dfe5e7` is
1.27:1 on paper, and it draws the boundary of the segmented options, the
registration and date fields and the ghost buttons — boundaries WCAG asks to
clear 3:1. It also draws every decorative rule in the app, which is exempt and
is most of its uses. Fixing this properly means splitting the token into a
structural rule and a control boundary rather than darkening every line in the
product, so it is left as a deliberate decision rather than a quiet change.

**The reading placeholders are still hints, not labels.** They are legible now
and cannot be mistaken for a reading, but an example value that vanishes on
focus is a weak place for information about expected precision. If it turns out
to matter, it belongs on the label.
