# Kids-Centric Redesign: Figma Build Spec

> Design specification for the Hide Zero Cards kids-centric redesign
> (issue #97). This is the build input for the Figma file. Research
> behind every decision lives in
> [`docs/kids-redesign-research.md`](kids-redesign-research.md).
>
> Figma file: [Hide Zero Cards — Kids-Centric Redesign](https://www.figma.com/design/V0guCzQdLjwJLMwRQrR3O9)
> (file key `V0guCzQdLjwJLMwRQrR3O9`)
>
> Last updated: 2026-10-11

## Figma file plan

Starter plan allows max 3 pages. Use:

1. **00 Cover** — title, subtitle, date, one-line direction summary, card
   color swatches.
2. **01 Brief** — research-backed brief as text sections (audience,
   principles, anti-patterns).
3. **02 Designs** — all screens and components as frames on one canvas:
   Desktop home, Desktop /play, Mobile, Components.

## Design principles (from research)

- Target the 6-9 visual band. Bright but never babyish; never gray
  corporate.
- The cards are the hero. Their colors and digits stay exactly as they
  are. Delight goes _around_ them.
- Touch targets >= 75px. Nothing interactive in the bottom 10% of
  tablet/mobile frames.
- Every action works by tap AND drag. Instant visual/audio feedback on
  every action.
- Minimal text at a child's reading level. Icons must be
  self-explanatory to kids: label them.
- No hover-dependent affordances. No multi-finger gestures. No precise or
  long drags.

## Palette

| Token               | Hex                       | Use                                      |
| ------------------- | ------------------------- | ---------------------------------------- |
| Sky background      | #E8F4FD                   | Page background (desktop home)           |
| Paper background    | #FFFDF7                   | Alternate/page background (play, mobile) |
| Ink                 | #1F2A37                   | Headlines, body text                     |
| Soft ink            | #5B6B7B                   | Secondary text, captions                 |
| Ones red            | #E53935                   | Cards (ones group). Never recolor.       |
| Thousands yellow    | #FDD835                   | Cards (thousands group). Never recolor.  |
| Millions green      | #43A047                   | Cards (millions group). Never recolor.   |
| Billions blue       | #1E88E5                   | Cards (billions group). Never recolor.   |
| Primary action      | #1E88E5                   | Hide-zeros toggle, primary buttons       |
| Primary action dark | #1565C0                   | Button pressed/hover state               |
| Success/confetti    | #43A047, #FDD835, #E53935 | Micro-celebration accents                |

Chrome frames the card colors; it never competes with them.

## Typography

- Family: **Baloo 2** (confirmed available in Figma). Fallback: Fredoka,
  then system rounded.
- Weights in use: Regular (body), Medium (controls), SemiBold (labels),
  Bold (headlines).
- Scale:
  - Display (card digits): 96px Bold, white on card color. Unchanged
    from the app.
  - H1 (page headline): 40px Bold, ink.
  - H2 (section): 28px SemiBold, ink.
  - Control labels (buttons): 20px Medium.
  - Body: 18px Regular, ink.
  - Caption/helper: 15px Regular, soft ink.

## Components

### Primary button (Hide zeros toggle)

- Pill shape, full radius.
- Min height 64px (aim 72px on desktop). Padding 24px horizontal.
- Fill: primary action #1E88E5. Label: white, 20px Medium, with a leading
  glyph (eye-off style: use text glyph, e.g. "Hide zeros").
- Pressed: fill darkens to #1565C0; scale 0.97.
- Annotation: ">= 64px tall. Icon + short label. The single most
  important control."

### Dice button (random number)

- Same pill spec as primary, secondary style: white fill, 2px ink
  border, ink label.
- Label: "🎲 Surprise me".
- Purpose (annotation): "Young kids who can't type large numbers still
  get the magic loop: type, see."

### Number input

- Pill, min height 64px, white fill, 2px soft-ink border.
- Numeric, centered, 28px SemiBold.
- Full width on mobile.

### Cards (DO NOT RESTYLE)

- Rounded rectangles, existing colors exactly, white Bold digits.
- Annotation: "Learned visual language. Colors, font, and digits stay
  exactly as in the app. Delight goes around them, never on them."
- Example fan for 392,240 uses the app's real grouping: thousands group
  yellow (3, 9, 2,), ones group red (2, 4, 0).

### Micro-celebration (annotated, not drawn)

- When "Hide zeros" is toggled: soft pop sound + gentle confetti burst
  in card colors + optional corner mascot line ("Wow, three zeros
  hiding!").
- Tap card: it wiggles/lifts. Toggle: cards animate in/out.

## Screens

### 02a. Desktop home (1440 x 900) — hybrid landing + tool

Background: sky #E8F4FD.

Top: compact teacher header, centered, max width 900px:

- H1: "Hide Zero Cards"
- 2 sentences, 18px: what it is and who it's for (grades 2-4 place
  value).
- 3 tiny steps, 15px soft ink: "Type a number → Drag the cards → Hide
  the zeros"

Center: number input pill (width ~420px), then a control row: primary
"Hide zeros" button + "🎲 Surprise me" button, 16px gap.

Below: the card fan as hero. 6 overlapping cards for 392,240, centered,
generous whitespace around. Cards are the largest element on screen.

Footer strip (small, soft ink, 15px): "Free for classrooms. No login, no
ads." + link "Open full-screen version for smartboards → /play".

### 02b. Desktop /play (1440 x 900) — chrome-free

Background: paper #FFFDF7.

Minimal top row only: small wordmark "Hide Zero Cards" (20px SemiBold),
number input, Hide zeros toggle. Then cards large and centered, filling
the frame.

Annotation: "/play — share/bookmark/smartboard target. Opens straight
into the working tool. No landing copy, no footer."

### 02c. Mobile (390 x 844) — single column

Background: paper #FFFDF7.

Stack, 16px margins:

1. Compact header (H1 28px + one sentence).
2. Full-width number input (64px).
3. Full-width primary "Hide zeros" button (64px+).
4. "🎲 Surprise me" button (64px).
5. Card fan, reflowed to fit width.

Annotation: "Nothing interactive in the bottom 10% (accidental taps).
Single column. Cards re-flow; never shrink below legibility."

### 02d. Components frame

Spec sheet on paper background:

- Palette swatches with hex labels (all tokens above).
- Type scale samples (Display/H1/H2/control/body/caption).
- Button anatomy: 64px min-height annotation, pill radius, icon+label,
  primary vs secondary.
- Card swatch row with "DO NOT RESTYLE" note.
- Spacing notes: 16px base unit, 24px section gaps, generous whitespace
  around the fan.

## Anti-patterns (must not appear in any screen)

1. Small or bottom-edge controls.
2. Text-heavy instructions or unlabeled cryptic icons.
3. Precise/long drag requirements or multi-step flows without instant
   feedback.
4. Splash screens, ads, pop-ups, or anything that looks clickable but
   isn't.
5. Babyish look (bouncy cartoon fonts everywhere, cartoon overload) or
   adult-clean gray minimalism.
6. A landing page that buries the tool below the fold or behind a
   "Launch the tool" button.
7. Forced onboarding tours, email gates, accounts.

## Build status

- 2026-10-11: spec written. Figma file created but canvas work is blocked:
  the Figma MCP tool-call allowance on the Starter plan is exhausted.
  Build resumes when the allowance resets (or after a plan upgrade).
