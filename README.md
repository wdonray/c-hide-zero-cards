# Hide Zero Cards

[![Tests](https://github.com/wdonray/c-hide-zero-cards/actions/workflows/test.yml/badge.svg)](https://github.com/wdonray/c-hide-zero-cards/actions/workflows/test.yml)
[![Release](https://img.shields.io/github/v/release/wdonray/c-hide-zero-cards)](https://github.com/wdonray/c-hide-zero-cards/releases)

An interactive place value learning tool: type a number, get draggable color-coded cards for each digit, hide the zeros to reveal how place value really works.

Live at [hidezerocards.org](https://hidezerocards.org).

## Tech Stack

- **Framework**: Next.js 16.3.8 (App Router) with React 19.3
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Theme**: next-themes for light/dark mode
- **Icons**: Phosphor Icons + Lucide
- **Lint/format**: oxlint + Prettier (ESLint 10 installed for editor integration), `tsc` typecheck

## Features

- **Number input**: manual entry (1–1,000,000,000) or Roll for a random number with customizable ranges
- **Draggable cards**: color-coded place value cards (ones red, thousands yellow, millions green, billions blue) with pointer drag and arrow-key movement
- **Hide zero cards**: toggle the zero cards to teach place value without them
- **Number forms dialog**: word, unit, expanded, and standard forms with a reveal-cards mode
- **Teacher's guide**: built-in instructional guide with classroom activities
- **Responsive**: portrait-first mobile layout (numeric keyboard, touch drag, 44px targets) and desktop
- **Accessible**: axe-core WCAG 2.2 AA scans in CI (light + dark, desktop + mobile)
- **Version page**: `/version` shows the deployed version and release history

## Getting Started

### Prerequisites

- Node.js 22 (see `.nvmrc`)
- npm

### Installation

```bash
git clone https://github.com/wdonray/c-hide-zero-cards.git
cd c-hide-zero-cards
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

## Testing

```bash
npm run test:unit   # Vitest + Testing Library (with coverage)
npm run test:e2e    # Playwright against a production build (desktop + mobile + axe scans)
npm run lint        # oxlint
npm run format:check  # Prettier
npm run typecheck   # tsc --noEmit
```

Every PR runs the full CI gate: **Lint** (oxlint + prettier + tsc), **Unit tests**, **E2E tests**, **Dependency audit**, **Build**, and **semantic-title**. Dependabot updates dependencies weekly. Pushes to `main` auto-bump the version and create a GitHub release (the `[deploy]` commit triggers the Amplify build).

## Project Structure

```
c-hide-zero-cards/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles and theme tokens
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page
│   └── version/           # /version page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── DraggableCard.tsx # Individual place value card
│   ├── Toolbar.tsx       # Roll / Mix / Reset / Clear controls
│   ├── NumberFormsDialog.tsx
│   └── ...
├── e2e/                   # Playwright specs (flows, mobile, a11y, security, version)
├── lib/                   # Utilities, hooks, constants
│   ├── constants.ts      # Card colors, place values, limits
│   ├── useDraggable.ts   # Pointer/keyboard drag logic
│   ├── useHeaderContext.tsx
│   └── ...
└── public/                # Static assets
```

## Key Components

- **DraggableCard**: individual place value card with drag-and-drop and keyboard movement
- **Toolbar**: Roll, Mix, Reset, Clear, zero-card toggle, random-range popover
- **NumberFormsDialog**: word, unit, expanded, and standard forms with reveal-cards mode
- **InstructionalGuideDialog**: teacher's guide with classroom activities

## Contributing

Open issues for bugs or feature requests. Pull requests welcome — one focused PR per change, with the CI gate green before merge.

## License

Educational use only.
