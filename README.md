# Hide Zero Cards

A Next.js application for interactive place value learning through draggable number cards.

## Tech Stack

- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **Theme**: next-themes for light/dark mode
- **Language**: TypeScript
- **Icons**: Phosphor Icons
- **Development**: ESLint, Prettier, Husky

## Features

- **Number Input**: Manual entry (1-1B) or random generation with customizable ranges
- **Draggable Cards**: Color-coded place value cards with drag-and-drop functionality
- **Interactive Controls**: Reset, randomize positions, toggle zero cards, expand dialog
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Theme Support**: Light/dark mode toggle

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
git clone <repository-url>
cd c-hide-zero-cards
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

## Project Structure

```
c-hide-zero-cards/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   ├── DraggableCard.tsx # Main card component
│   ├── Toolbar.tsx       # Control toolbar
│   └── ...
├── lib/                  # Utilities and hooks
│   ├── constants.ts      # App constants
│   ├── useDraggable.ts   # Drag functionality
│   └── ...
└── public/              # Static assets
```

## Key Components

- **DraggableCard**: Individual number cards with drag-and-drop
- **Toolbar**: Control panel with number generation and card manipulation
- **ExpandDialog**: Shows expanded form of numbers
- **InstructionalGuideDialog**: Help system for teachers

## Development

### Code Quality

- ESLint for linting
- Prettier for formatting
- Husky for pre-commit hooks

### Styling

- Tailwind CSS for utility-first styling
- CSS variables for theme colors
- Responsive design with mobile-first approach

### State Management

- React Context for global state (header context)
- Local state for component-specific data
- Custom hooks for reusable logic

## Contributing

Open issues for bugs or feature requests. Pull requests welcome.

## License

Educational use only.
