# AGENTS.md

Operating notes for AI agents working in this repo. Donray is the owner;
he decides, you execute. He verifies your work as a habit — be precise.

This is a **live classroom tool** (hidezerocards.org), not a portfolio piece.
Teachers use it with students. Stability is the top priority: **no
regressions, ever.** If a change would alter app behavior for teachers or
students, stop and get Donray's explicit approval first — do not "improve"
behavior on your own.

## Workflow

- **One PR per task.** Small, focused PRs. Merge once CI is green — no
  extra review pass needed from Donray.
- **Run formatting before the first push:** `npx prettier --write` on
  changed files (this repo formats with Prettier, not oxfmt).
- **PR bodies must follow `.github/pull_request_template.md`** (What / Why /
  How). The API does not auto-apply the template the way the web UI does,
  so include it by hand when creating a PR programmatically.
- **PR titles follow conventional commits.** CI rejects anything else
  (`validate-pr-title.yml`).
- **Screenshots gate UI-visible PRs but are never committed.** Capture a
  local Playwright screenshot and review it yourself before opening the PR.
  Do not show screenshots in chat. Keep them out of the repo.
- **Release flow:** pushes to `main` run `version-bump.yml`, which bumps the
  version and pushes a `chore: bump version to X [deploy]` commit plus tag.
  The `[deploy]` marker is what triggers the Amplify build — never remove it
  from release commits. Docs-only pushes skip the bump/deploy.
- **Accessibility is a CI gate.** axe-core scans against WCAG 2.2 AA in
  `e2e/a11y.spec.ts` (light and dark mode, empty and with cards). Fix real
  violations; don't suppress them. New interactive elements must be
  keyboard-operable. Drag cards support arrow-key movement as a purely
  additive interaction — keep it that way.
- **Security headers live in `next.config.ts`.** If you add an external
  fetch (API, font, script), update the CSP `connect-src`/`script-src`
  accordingly or CI's e2e tests will catch it.

## Stack

- Next.js 16.3.8 (App Router, static-first), React 19.3, TypeScript 5.9.3
- Tailwind CSS v4, shadcn/ui, Phosphor + Lucide icons
- oxlint for linting, Prettier for formatting
- Vitest + Testing Library for unit tests, Playwright for e2e
- Hosting: AWS Amplify (us-east-1) via the `[deploy]` commit marker

## Conventions

- **Mobile is responsive, portrait-first.** No mobile warning dialog, no
  rotation lock (iOS Safari cannot lock orientation, so a rotate nag would just
  replace one annoyance with another).
- **Card fan stays a fan.** `useIsMobile()` (matchMedia, SSR-safe) plus
  `getCardXOffset()` in `lib/cardLayout.ts` drive the layout: desktop keeps the
  fixed 36px cascading overlap; below 768px the _same_ fan compresses so all
  10 cards fit a 375px viewport. Never reflow into a grid or plain row.
- **44px touch targets are coarse-pointer-gated.** Use
  `COARSE_POINTER_TOUCH_TARGET` (`pointer-coarse:min-h-11 min-w-11`) so the
  desktop mouse layout is untouched.
- **Card colors pass 4.5:1.** The place-value palette was darkened per the
  owner's 2026-10-05 decision (darker shades, white digits kept): red-600/700/800,
  yellow-700/800/900, green-700/800/900, blue-600. Same hue families and the same
  light-to-dark gradation per period. The Roll button is blue-600 for the same
  reason. No contrast filters remain in `e2e/a11y.spec.ts`.
- **Mobile action bar (2026-10-05 redesign).** Below 768px the desktop
  `Toolbar` unmounts (via `useIsMobile`, not CSS hiding, so each control
  exists exactly once in the DOM) and `MobileActionBar` takes over: a
  bottom-anchored nav with icon + text labels (Roll, Zero, Mix, Reset, Clear,
  Forms, More). Labels are mandatory because icon-only buttons have no hover
  tooltips on touch. Secondary actions (range, teacher's guide, theme,
  version link) live in the `MobileMoreMenu` bottom sheet (Radix Dialog:
  focus trap + Escape come free). The bar is a flex-column sibling of the
  footer, never `position: fixed`, so no overlap math is needed.
- **Hero card sizing.** `getMobileCardMetrics()` in `lib/cardLayout.ts`
  scales the fan up on mobile (fewer digits = bigger cards, capped at the
  desktop 60px) while keeping the exact cascading-overlap peeking ratio
  (offset = 0.6 x font size, min 12px). The fan is vertically centered via a
  mobile-only flex-column chain (body > main > section > workspace). The
  cards anchor on evenly spaced left edges (`index * xOffset`) inside a
  wrapper sized to `(n-1) * xOffset + naturalWidth(last card)` (`getFanExtent()`
  in `lib/cardLayout.ts`) that the flex workspace centers via `justify-content`,
  so the visible fan is centered even though card widths vary with place value.
  Card text is left-aligned with `overflow: hidden` at fan home, so every peek
  shows its leading digit and each card's right edge lands flush at
  `extent - index * xOffset`; the extent is driven by the last (top, narrowest)
  card alone, never by a wide back card (max-ing over all cards once inflated
  the top card to ~3x its natural width). A card away from its fan home
  (dragged, Mix-scattered, keyboard-moved) renders at its natural width with
  visible overflow so the full place value shows, and the Mix scatter clamp
  uses that natural width. Widths are
  measured in a layout effect, so the first paint already has the correct
  size (no flash, and spawned numbers are centered from the first frame).

- **No em dashes in user-facing copy.** Use commas, colons, or split the
  sentence instead.
- **Copy must stay truthful.** Don't invent metrics, testimonials, or
  features — use only what exists in the repo. Structured data (JSON-LD)
  follows the same rule: no claiming features the app doesn't have.
- **SEO is app-scoped.** Correct titles, meta descriptions, and functional
  markup only. Marketing-style SEO (growth, discovery, ranking) is out of
  scope.
- **Coverage grows; thresholds follow.** `vitest run --coverage` runs in CI
  with 100% thresholds (statements/branches/functions/lines) — CI fails if
  coverage drops. Thresholds only go up; never lower them. New lib code
  needs unit tests; component files are not loaded by unit tests, so
  changes there do not affect coverage.

## Gotchas

- `useDraggable`'s `randomizeTrigger !== 0` check treats `undefined` as
  "randomize": always pass both triggers explicitly (production passes `0`).
- The welcome dialog and the mobile alert can both be open at once on narrow
  screens; Radix then hides each from the accessibility tree. E2E tests that
  target the mobile alert seed `hzc-has-seen-welcome-dialog` in localStorage
  first.
- Playwright's `baseURL` is hardcoded to `http://localhost:3000`. With
  `CI=true`, `reuseExistingServer` is false, so Playwright starts its own
  `next start` on :3000 — a stray personal server on :3217 or elsewhere is
  ignored. Do not be surprised when local measurement servers go unused by
  the suite.
- Never `pkill -f` with a pattern that can match your own command line
  (e.g. `pkill -f next-server` from a shell whose command contains it).
  Kill test servers by exact PID from `ps aux | grep "[n]ext-server"`.

## Testing

- `npm run test:unit` — Vitest (`*.test.ts(x)` next to source)
- `npm run test:e2e` — Playwright against a production build
- `npm test` — both
- Add tests for new behavior; capture current behavior as E2E before
  changing anything user-visible.
