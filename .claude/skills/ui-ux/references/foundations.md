# Foundations

The numbers and mechanics behind the pass in SKILL.md. Read the section you
need rather than the whole file.

- [Contrast](#contrast)
- [States](#states)
- [Type](#type)
- [Space](#space)
- [Color roles](#color-roles)
- [Targets and pointers](#targets-and-pointers)
- [Motion](#motion)
- [Forms](#forms)
- [Tables and numbers](#tables-and-numbers)
- [Empty, loading, error](#empty-loading-error)
- [Accessibility checks worth doing by hand](#accessibility-checks-worth-doing-by-hand)

## Contrast

Thresholds (WCAG 2.2 AA):

| What | Ratio |
|---|---|
| Body text | 4.5:1 |
| Large text — ≥24px, or ≥18.66px bold | 3:1 |
| UI component boundaries, icons carrying meaning | 3:1 |
| Disabled controls | exempt |
| Decoration that carries no information | exempt |

Two traps. **Placeholder text** is usually styled at a default light gray
around 1.6:1; if it carries information (an example value, a format hint) it is
body text and needs 4.5:1 — and if it is essential it should not be a
placeholder at all, since it vanishes on focus. **Thin light-gray micro-labels**
at 10–11px are the most common failure in otherwise careful interfaces: small
size makes them *harder* to read, not easier, so they need more contrast than
the body text, not less.

Compute rather than eyeball. Relative luminance per channel `c` in 0..1:

```
f(c) = c/12.92                     if c <= 0.03928
f(c) = ((c + 0.055)/1.055) ** 2.4  otherwise
L    = 0.2126*f(R) + 0.7152*f(G) + 0.0722*f(B)
ratio = (max(L1,L2) + 0.05) / (min(L1,L2) + 0.05)
```

```python
def ratio(hex1, hex2):
    def lum(h):
        h = h.lstrip('#')
        c = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
        f = [x/12.92 if x <= 0.03928 else ((x+0.055)/1.055)**2.4 for x in c]
        return 0.2126*f[0] + 0.7152*f[1] + 0.0722*f[2]
    a, b = lum(hex1), lum(hex2)
    return (max(a, b) + 0.05) / (min(a, b) + 0.05)
```

Dark mode is not the light palette inverted. Light text on dark backgrounds
blooms optically, so pure white on pure black is uncomfortable at length: pull
both ends in (#e8eef0 on #16272c rather than #fff on #000) and re-check every
pair, because a ratio that passed in light mode tells you nothing about its
inverse.

## States

Every interactive element owes five states, and the count of *forgotten* ones
is a good proxy for how finished an interface is.

| State | Notes |
|---|---|
| default | |
| hover | Pointer only — never the sole signal, since touch has no hover |
| active / pressed | Confirms the tap landed; matters most on slow connections |
| focus-visible | Keyboard navigation. Use `:focus-visible`, not `:focus`, so pointer users do not see rings on click |
| disabled | Must not look merely low-priority. Say *why* it is disabled nearby |

Never `outline: none` without a replacement. If the default ring is ugly,
replace it with something at 3:1 against both the element and its surroundings:

```css
.btn:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
```

Selection state (a chosen tab, an active segment) needs to differ from hover by
more than a shade, or a hovered item reads as selected.

## Type

A scale is a small set of sizes used consistently — not a formula. Derive it
from what a project already uses: sort the sizes in the stylesheet, and the
clusters are the scale. Fewer steps read as more deliberate; five to seven
covers most products.

- **Body** 15–17px, line-height 1.4–1.6. Below 14px is uncomfortable for
  sustained reading on any device.
- **Measure** 45–75 characters. Wider and the eye loses the line return; this is
  what `max-width: 65ch` is for.
- **Line-height moves inversely to size.** Display text at 1.0–1.15, body at
  1.5. A 76px number at 1.5 line-height has a hole under it.
- **Letter-spacing** — tighten display sizes slightly (-0.01 to -0.03em);
  open up uppercase micro-labels (+0.06 to +0.12em), which are illegible
  without it.
- **Weight** carries hierarchy more cheaply than size in dense layouts. Two
  weights is usually enough; a third should earn its place.
- Set a real fallback stack. A webfont that fails to load should degrade to a
  metric-similar system font, not to Times.

Reserve italics for genuine emphasis and titles. Do not center long text, do
not justify (browsers cannot hyphenate well enough to avoid rivers), and do not
set body copy in a condensed face.

## Space

Pick a rhythm — 4px or 8px steps — and stay on it. Off-grid values are the
quiet reason a layout feels unsettled.

The relationship that matters is **inside vs between**: space inside a group
must be smaller than space between groups, or the grouping reads wrong no
matter what borders you add. A label 6px above its input, 24px to the next
field, is unambiguous. The reverse is unreadable regardless of styling.

Vertical rhythm between sections should be visibly larger than within them —
usually 1.5–2× — and consistent across the product, so a user's eye learns the
structure once.

## Color roles

Separate **structural** color (ink, paper, rules, surfaces) from **semantic**
color (success, warning, danger, in-progress). Structural color builds the
page; semantic color carries a claim.

Semantic color must mean exactly one thing. If green is both "passed" and the
brand accent, green stops meaning "passed" and the interface has lost a signal
it will need later.

Color is never the sole carrier of meaning — roughly 1 in 12 men has a color
vision deficiency, and red/green is the common axis. Pair color with text, an
icon, a position, or a sign: `+12 °C` in green is readable when green is not.

Saturated color on a large area fights everything on top of it. Accents want
small areas — a rule, a number, an icon — with the field left neutral.

## Targets and pointers

- **44×44px** minimum touch target (Apple HIG; WCAG 2.2 AA sets 24×24 as the
  floor, 44 as the comfortable target). The *visible* control may be smaller
  than its hit area — extend it with padding or a transparent pseudo-element.
- **8px** minimum between adjacent targets, more if a mistap is costly.
- Destructive actions get separation, not just a red tint. On phones, keep them
  out of the thumb arc where the primary action lives.
- On phones, the bottom third is the comfortable reach; the top corners are
  the worst place for a frequent action.
- `-webkit-tap-highlight-color: transparent` only if you have provided your own
  `:active` state — otherwise you have removed the only tap feedback.
- Never rely on hover to reveal a control that a touch user needs.

## Motion

Motion is feedback about causality — what changed, and where it came from.

| Kind | Duration |
|---|---|
| State change (hover, toggle, focus) | 100–200ms |
| Element enter/exit, expand/collapse | 200–300ms |
| Page or view transition | 300–400ms |

Anything longer on a frequently repeated interaction becomes a wait. Ease-out
for things arriving, ease-in for things leaving; a slight overshoot
(`cubic-bezier(.34,1.52,.64,1)`) suits physical-feeling controls like switches
and suits nothing else.

Animate `transform` and `opacity`, which the compositor can handle. Animating
`width`, `height`, `top` or `margin` forces layout on every frame.

Always:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important;
    animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
```

This is a vestibular-disorder accommodation, not a preference — large-area
motion can cause genuine nausea.

## Forms

- Labels are persistent and outside the field. Placeholder-as-label fails the
  moment someone types, and fails permanently for screen readers.
- Wire the label: `<label for>` or wrap the input. A field whose label is an
  unassociated `<span>` is unlabeled to assistive technology.
- Errors go next to the field, in words that say what to do: "Date must be
  YYYY-MM-DD" beats "Invalid input".
- Validate on blur, not on every keystroke — flagging an email as invalid while
  it is still being typed is hostile.
- Units and formats belong in the interface, not in the user's head. A field
  wanting torque as a percentage should say `%`.
- `inputmode="decimal"` on numeric fields gets the right phone keyboard;
  `type="number"` brings spinners and scroll-wheel accidents.
- Preserve typed input across errors, navigation, and resume. Losing a
  half-filled form is the most reliable way to lose the person filling it.
- Disabled submit buttons hide the reason. Prefer an enabled button that
  explains what is missing on click, or list what is outstanding next to it.

## Tables and numbers

- `font-variant-numeric: tabular-nums` on every figure. Proportional digits
  make columns wobble and updating values jitter.
- Right-align numbers, left-align text, align headers with their column.
- Fix decimal places per column. `7.5` above `7.50` reads as different
  precision.
- Attach the unit once, in the header, rather than on every cell.
- Wide tables scroll inside their own `overflow-x: auto` container. The page
  body never scrolls sideways.
- On phones, a wide table usually becomes a stack of labeled rows; decide that
  deliberately rather than letting it squeeze.
- Sortable columns show which column is sorted and in which direction.

## Empty, loading, error

**Empty** is a design surface, not a gap. Distinguish first-run ("no checks
logged yet — log one from the Check tab") from filtered-to-nothing ("no results
for *bell-212*", plus a way to clear the filter). First-run empty is the first
impression of the product.

**Loading**: under ~300ms show nothing — a flashed spinner reads as a glitch.
Beyond that, prefer a skeleton matching the real layout so nothing jumps when
content lands. Reserve the space content will occupy either way.

**Error**: say what happened, whether it is recoverable, and what to do. Keep
the user's input. "Not saved — storage is unavailable" with the typed values
still on screen respects the person; a toast that clears the form does not.

## Accessibility checks worth doing by hand

Quick, catches most of it:

1. **Tab through the whole screen.** Every interactive element reachable, in a
   sensible order, with a visible focus ring at every stop. Nothing focusable
   that is invisible.
2. **Escape and Enter** behave in dialogs and menus. Focus moves into a dialog
   when it opens and returns to the trigger when it closes.
3. **Zoom to 200%.** Nothing clipped, nothing overlapping, no horizontal scroll.
4. **Headings form an outline** — one `<h1>`, no skipped levels. This is the
   structure screen-reader users navigate by.
5. **Images**: meaningful ones have alt text describing the *information*;
   decorative ones have `alt=""`. Icons inside labeled buttons get
   `aria-hidden="true"`.
6. **Real semantics.** A `<div onclick>` is not a button — it is not focusable,
   not keyboard-activatable, and not announced. Use `<button>`.
7. **Live regions** for things that change without interaction: `role="status"`
   for polite updates, `role="alert"` for errors. Otherwise a screen-reader
   user never learns the save succeeded.
8. **Grayscale it.** Anything that becomes ambiguous was relying on color alone.
