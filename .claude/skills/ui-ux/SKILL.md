---
name: ui-ux
description: "Design, review, and refine user interfaces - visual hierarchy, type, color, spacing, states, motion, and accessibility - working from the design system a project already has rather than a generic template. Use this whenever work touches how something looks or feels to use - building a screen or component, writing CSS or Tailwind, 'make this look better / more polished / less generic', a design or UX review, layout and spacing decisions, picking colors or type, empty and loading and error states, contrast or touch-target problems, or turning a rough page into something finished. Use it BEFORE starting UI work, not only as a critique afterwards - reading the existing system first is what keeps new work from looking bolted on."
---

# UI/UX

Most interface work fails in one of two ways. Either it does not match the
product it lives in — new colors, new radii, new shadows, a different spacing
rhythm, so the screen reads as pasted in from somewhere else. Or it has no
argument: everything is emphasised, so nothing is, and the eye has nowhere to
land.

Both are avoidable by doing two things before writing any markup: read the
system that already exists, and name who is using this and under what pressure.

## 1. Read the system before you touch it

A project that has shipped any UI already has a design system, whether or not
anyone called it that. Find it. Inventing a token that the project already has
under another name is the single most common way AI-written UI looks foreign.

```bash
# tokens: custom properties, theme config, SCSS variables
grep -rn -- "--[a-z-]*:" --include=*.css --include=*.js --include=*.ts . | head -40
find . -name "tailwind.config.*" -o -name "theme.*" -o -name "tokens.*" \
  -o -name "DESIGN.md" -o -name "*.css" | grep -v node_modules | head -20
```

Read out, and write down, what you find:

- **Palette** — every color and the *role* it plays. Which are structural (ink,
  paper, rule) and which are semantic (success, warning, danger)?
- **Type** — families, the sizes actually in use, weights, letter-spacing on
  small caps. Sort the sizes; that is the scale, even if nobody wrote it down.
- **Space** — the recurring padding and gap values. Usually a 4px or 8px
  rhythm, sometimes something idiosyncratic and deliberate.
- **Shape** — border-radius (a project with `border-radius: 0` everywhere is
  making a statement; do not round one corner of it), border weights.
- **Depth language** — does this product separate regions with *rules* or with
  *shadows*? These are different dialects. Documents and instruments use rules;
  consumer apps use elevation. Mixing them looks like an accident.
- **Motion** — the durations and easings already in use.

If the project has a `DESIGN.md` or equivalent, that is the source of truth and
it outranks your inference. If it does not and you have just reverse-engineered
one, offer to write it down.

**Extend the system; do not fork it.** When you genuinely need a value the
system lacks, derive it from what is there (the next step on the existing
scale, a tint of an existing hue) and say out loud that you are adding to the
system, so it can be accepted or rejected deliberately.

## 2. Name the context

Interface rules are not universal — they are downstream of who is using the
thing, where, and under what pressure. Two minutes on this changes real
decisions:

- **Who** — a first-time visitor, or someone who has used this 400 times? The
  first needs orientation; the second needs speed and stable positions, and is
  insulted by hand-holding.
- **Where** — desk, phone in one hand, sunlight, a moving vehicle, a shop floor
  with gloves on? Sunlight kills low-contrast gray. Gloves kill 32px targets.
  One-handed use puts primary actions in the bottom third.
- **Under what pressure** — bored, or busy, or stressed and possibly reading
  wrong? Under pressure, ambiguity is dangerous rather than merely annoying;
  that is when a number needs a unit attached and a destructive action needs to
  be hard to hit by accident.
- **What is the one thing** they came to this screen for?

That last question is the useful one. A screen should have exactly one primary
element, and you should be able to point at it.

## 3. Do the work

Hierarchy is an argument about what matters. You have four levers — **size,
weight, color, and space** — and using fewer of them at once reads as more
confident. A 7× size ratio between the headline number and its label needs no
help from color. Emphasis is zero-sum: every bold thing borrows attention from
everything near it, so three primary buttons means none.

Space is the lever people under-use. Grouping by proximity is stronger and
quieter than grouping by box, border, or background tint. When a layout feels
cluttered, the fix is usually more space around fewer boxes, not smaller text.

Then work through the pass below. `references/foundations.md` has the numbers,
the state matrix, and the checks worth running — read it when you need the
specifics rather than trying to remember them.

**The pass:**

1. **Hierarchy** — can you point at the primary element? Squint at it: what
   survives is what the screen actually says.
2. **States** — this is where interface work silently fails. Every interactive
   element needs default, hover, active, **focus-visible**, and disabled.
   Focus is the one that gets forgotten, and forgetting it locks out everyone
   navigating by keyboard.
3. **The other states** — empty, loading, error, partial. First-run empty is
   the first impression, and "no data yet" should say what to do next.
4. **Contrast** — body text 4.5:1, large text (≥24px, or ≥19px bold) 3:1, UI
   boundaries and icons 3:1. Placeholder text that carries information is body
   text and must clear 4.5:1, which most default placeholder grays do not.
5. **Targets** — 44×44px minimum for anything tapped. The touch area may exceed
   the visible one via padding or a pseudo-element.
6. **Numbers** — anything that updates in place or stacks in a column gets
   `font-variant-numeric: tabular-nums`, or it jitters.
7. **Motion** — feedback, not decoration. 150–250ms on state changes; anything
   over ~400ms on a frequent interaction becomes a wait. Honor
   `prefers-reduced-motion`.
8. **Language** — labels in the user's vocabulary, not the schema's. Error
   messages that say what to do next. Sentence case unless the system says
   otherwise.
9. **Responsive** — check the real narrow width (360–390px). Wide content
   (tables, charts, code) scrolls inside its own container; the page body never
   scrolls horizontally.

## Reviewing someone else's interface

Same pass, but the output is a report. Rank findings by what they cost a
person, which is more useful than abstract severity:

```markdown
## Blocks someone
Things that make the interface unusable for some people — invisible focus,
contrast below threshold, targets under 44px, a control unreachable by keyboard.

## Costs a beat
Hierarchy that points at the wrong thing, ambiguous state, jitter, a label that
has to be read twice, a destructive action too easy to hit.

## Polish
Rhythm, alignment, consistency with the system.
```

Every finding names the file and line, the specific measured problem, and the
fix in the project's own tokens. The difference between a useful review and a
worthless one is entirely here:

- Worthless: "Consider improving the contrast of secondary text."
- Useful: "`src/css.js:31` — `--ink-3` #8b9ba1 on white is 2.9:1 at 10px, under
  the 4.5:1 needed. `--ink-2` #4a6067 is 6.6:1 and already in the palette."

Measure rather than assert. Compute contrast ratios, read the actual computed
sizes, count the pixels of the target. A review that guesses gets ignored, and
deserves to be.

Be honest about taste. Craft failures (contrast, targets, focus, jitter) are
facts and worth stating flatly. Preferences (this would look better with more
air, this hue feels cold) are opinions — say so, and give the reason rather
than the verdict, so the person can disagree with you cheaply.

## What to be suspicious of in your own output

The house style of generated UI is recognisable, and worth actively avoiding:
gradient headers, a purple-to-blue accent nobody asked for, `shadow-lg` on
everything, `rounded-2xl` in a product with square corners, emoji as section
icons, three cards of equal weight where one thing actually matters, and
"Lorem ipsum" energy in labels — *Dashboard*, *Overview*, *Analytics* — where a
real noun belonged.

If a screen would look at home in any product, it is not designed for this one.

## References

- `references/foundations.md` — contrast math and checks, the full state
  matrix, type scale construction, spacing rhythm, forms, tables, empty
  states, motion, and the accessibility checks worth running by hand.
