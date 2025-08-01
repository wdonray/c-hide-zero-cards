# Hide Zero Cards - Place Value Teaching Tool

A digital educational tool designed by Donray Williams for his wife, a fourth-grade teacher, to help students understand place values through interactive, draggable number cards.

## 🎯 Purpose

This application helps fourth-grade students learn and practice place value concepts by:

- **Visualizing Numbers**: Breaking down large numbers into their individual place value components
- **Interactive Learning**: Allowing students to drag and rearrange number cards
- **Zero Place Value Understanding**: Teaching students that zeros in different positions have different values
- **Hands-on Practice**: Providing a tactile digital experience for number manipulation

## ✨ Features

### 🎲 Number Generation

- **Manual Input**: Enter any number from 1 to 1,000,000,000
- **Random Generation**: Generate random numbers for practice
- **Customizable Range**: Set upper limits for random number generation (1,000 to 1,000,000,000)

### 🃏 Interactive Cards

- **Color-Coded Place Values**: Each place value has a distinct color for easy identification
  - Ones/Tens: Red shades
  - Hundreds/Thousands: Orange shades
  - Ten Thousands/Hundred Thousands: Yellow shades
  - Millions: Green shades
  - Billions: Blue shades
- **Draggable Interface**: Students can drag cards around the workspace
- **Zero Representation**: Zero digits are shown as placeholder zeros (0, 00, 000, etc.)
- **Formatted Display**: Numbers are displayed with proper comma formatting

### 🎮 Interactive Controls

- **Reset Cards**: Return all cards to their original positions
- **Randomize Positions**: Scatter cards randomly for a challenge
- **Randomize Number**: Generate a new random number for practice

## 🎓 Educational Benefits

### For Students:

- **Visual Learning**: See how large numbers are composed of smaller parts
- **Kinesthetic Learning**: Physical interaction with number components
- **Place Value Mastery**: Understand the difference between 100, 1,000, and 10,000
- **Zero Understanding**: Learn that zeros have different values in different positions

### For Teachers:

- **Classroom Demonstration**: Use on interactive whiteboards or projectors
- **Individual Practice**: Students can practice independently
- **Assessment Tool**: Observe how students manipulate and understand number components
- **Differentiated Learning**: Adjust number ranges for different skill levels

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd c-hide-zero-cards
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn/ui (built on Radix UI primitives)
- **Language**: TypeScript
- **Development**: ESLint, Prettier, Husky for code quality

## 📱 Usage Instructions

### Basic Usage:

1. **Enter a Number**: Type any number from 1 to 1,000,000,000 in the input field
2. **Observe Cards**: Each digit appears as a separate, color-coded card
3. **Drag Cards**: Click and drag cards to rearrange them
4. **Practice**: Try dragging cards to different positions and see how the number changes

### Advanced Features:

- **Random Number**: Click "🎲 Randomize number" to generate a random number
- **Adjust Range**: Click "🔽" to show range controls and set maximum values
- **Scatter Cards**: Click "🔀 Randomize positions" to scatter cards randomly
- **Reset**: Click "🔄 Reset cards" to return cards to original positions

## 🎨 Design Philosophy

The application uses a clean, educational design with:

- **Large, readable fonts** for classroom visibility
- **Color-coded place values** for easy identification
- **Intuitive drag-and-drop** interface
- **Responsive design** that works on various screen sizes
- **Accessible controls** suitable for young learners

## 🤝 Contributing

This is a personal project created for educational purposes. If you find bugs or have suggestions for improvements, feel free to open an issue or submit a pull request.

## 📄 License

This project is created for educational use. Please respect the educational purpose and use appropriately in classroom settings.

---

**Created with ❤️ by Donray Williams for his wife's fourth-grade classroom**
