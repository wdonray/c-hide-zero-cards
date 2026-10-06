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
- **Card fan stays a fan.** `useIsMobile()` (matchMedia, SSR-safe) drives the
  layout: each card's peek fits exactly ONE digit (the leading digit),
  measured empirically in place with a Range over the first character (padLeft
  - digit advance + letter-spacing) so the digit is never clipped. Thousands
    separators are separate, non-interactive comma elements (spans, aria-hidden)
    at every 3 digits from the right, participating in fan layout like cards.
    Zero cards are never removed: hiding zeros makes the whole card
    `visibility: hidden` + `aria-hidden` with no tab stop (a blank colored
    card would give away which cards are zero, per owner 2026-10-05,
    superseding PR #58's blank-number approach). Each card's text is clipped
    to its own peek width in an inner wrapper (measured by the parent as the
    first character's Range width, no padding), so a hidden card never leaks
    the text of the cards beneath it. Positions are preserved and toggling
    never shifts the fan (2026-10-05 redesign per owner reference image,
    superseding PR #57's wide significant-prefix peeks and the
    single-digit-peek approach before it). A zero card's value is 0 and it
    displays "0" (FAKE_ZERO_NUMBERS was removed entirely). Card i sits at the
    cumulative sum of the previous items' widths; the last card shows its full
    natural width. Below 768px the _same_ fan compresses via
    `getMobileCardMetrics()` in `lib/cardLayout.ts` so the whole fan fits a
    375px viewport. Never reflow into a grid or plain row.
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
  desktop 60px) and chooses a font size so the modeled fan width fits the
  viewport: (n-1) single-digit peeks + comma elements (0.6em each) + the last
  card's natural width (sum-of-peeks char model + shrink-to-fit loop, 10px
  floor). The fan is vertically centered via a mobile-only flex-column chain
  (body > main > section > workspace). The cards and commas anchor on
  cumulative item widths inside a wrapper sized to the fan extent
  (`getFanExtent(itemWidths, naturalWidth)` in `lib/cardLayout.ts`) that the
  flex workspace centers via `justify-content`, so the visible fan is centered
  even though card widths vary with place value. Card text is left-aligned with
  `overflow: hidden` at fan home, so every peek shows its leading digit and
  each card's right edge lands flush at the extent; the extent is the cumulative
  item widths plus the last (top) card's natural width, never a max over all
  cards (max-ing once inflated the top card to ~3x its natural width). A card away
  from its fan home (dragged, Mix-scattered, keyboard-moved) renders at its
  natural width with visible overflow so the full place value shows, and the
  Mix scatter clamp uses that natural width. Widths are measured in a layout
  effect, so the first paint already has the correct size (no flash, and
  spawned numbers are centered from the first frame). Desktop keeps the
  per-card measured peeks (no fixed offset); `getCardXOffset`,
  `CARD_X_OFFSET`, and the mobile peek char models were removed.

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

- **Analytics (DynamoDB).** `lib/analytics.ts` ports donray.dev's privacy-respecting design: one item per page (`PAGE#<path>`/TOTAL, `DAY#<yyyy-mm-dd>`, UNIQUES string-set) plus `SITE`/`UNIQUES` for deduped site-wide uniques. Visitor identity is a salted SHA-256 of IP + user agent (no raw IPs, no cookies, counted once ever). Env vars: `ANALYTICS_TABLE` (`hide-zero-cards-page-views`, us-east-1), `ANALYTICS_AWS_REGION`, `ANALYTICS_AWS_ACCESS_KEY_ID`, `ANALYTICS_AWS_SECRET_ACCESS_KEY`, `ANALYTICS_SALT` — set in Amplify, all branches. Unconfigured builds (local dev, CI) get a graceful not-configured state: `getConfig()` returns null, `/api/track` no-ops, `/analytics` shows an empty-state card. `POST /api/track` is rate-limited (60/min/IP) and bot-filtered; it never breaks the site. `AnalyticsTracker` fires one hit per page per browsing session (sessionStorage + sendBeacon) and is rendered once in the root layout. `/analytics` is a public dashboard (headline views/uniques, daily chart, per-page table, methodology disclosure) and unmounts the toolbar/mobile action bar like `/version`.
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
