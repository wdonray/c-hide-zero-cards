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

- Next.js 15 (App Router, static-first), React 19, TypeScript
- Tailwind CSS v4, shadcn/ui, Phosphor + Lucide icons
- oxlint for linting, Prettier for formatting
- Vitest + Testing Library for unit tests, Playwright for e2e
- Hosting: AWS Amplify (us-east-1) via the `[deploy]` commit marker

## Conventions

- **No em dashes in user-facing copy.** Use commas, colons, or split the
  sentence instead.
- **Copy must stay truthful.** Don't invent metrics, testimonials, or
  features — use only what exists in the repo. Structured data (JSON-LD)
  follows the same rule: no claiming features the app doesn't have.
- **SEO is app-scoped.** Correct titles, meta descriptions, and functional
  markup only. Marketing-style SEO (growth, discovery, ranking) is out of
  scope.
- **Coverage grows; thresholds follow.** `vitest run --coverage` runs in CI.
  There are no coverage thresholds yet — add them once the suite covers the
  app, and only ever raise them.

## Gotchas

- `useDraggable`'s `randomizeTrigger !== 0` check treats `undefined` as
  "randomize": always pass both triggers explicitly (production passes `0`).
- The welcome dialog and the mobile alert can both be open at once on narrow
  screens; Radix then hides each from the accessibility tree. E2E tests that
  target the mobile alert seed `hzc-has-seen-welcome-dialog` in localStorage
  first.

## Testing

- `npm run test:unit` — Vitest (`*.test.ts(x)` next to source)
- `npm run test:e2e` — Playwright against a production build
- `npm test` — both
- Add tests for new behavior; capture current behavior as E2E before
  changing anything user-visible.
