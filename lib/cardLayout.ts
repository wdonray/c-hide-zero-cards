export interface MobileCardMetrics {
  /** Card font size in px, chosen so the whole fan fits the viewport. */
  fontSize: number
}

/**
 * Left-edge x positions for a fan with per-item measured widths.
 * Item 0 starts at 0; each subsequent item starts where the previous
 * item's width ends. `itemWidths` has one entry per fan item except the
 * last (the last card shows its full natural width, so it contributes no
 * peek/offset); the returned array has one entry per fan item.
 *
 * Pure function; unit-testable.
 */
export function getFanPositions(itemWidths: number[]): number[] {
  const positions: number[] = [0]
  for (let i = 0; i < itemWidths.length; i++) {
    positions.push(positions[i] + itemWidths[i])
  }
  return positions
}

/**
 * Visible horizontal extent of the fan: the cumulative item widths plus
 * the last (top) card's full natural width. Driven by measured widths,
 * never by a max over cards (max-ing once inflated the top card to ~3x
 * its natural width).
 *
 * Pure function; unit-testable.
 */
export function getFanExtent(itemWidths: number[], lastCardWidth: number): number {
  return itemWidths.reduce((sum, w) => sum + w, 0) + lastCardWidth
}

/**
 * Number of thousands-separator commas in a fan of n digit cards: one
 * after every 3 digits from the right, never after the last card.
 * Commas are separate fan items (measured like cards, not draggable,
 * always visible).
 *
 * Pure function; unit-testable.
 */
export function getCommaCount(cardCount: number): number {
  return Math.floor((cardCount - 1) / 3)
}

/**
 * Width of a single-digit peek at the given font size: the card's left
 * padding plus one digit advance (0.62em, tabular-nums) plus the
 * letter-spacing (0.3em). The empirical Range measurement includes the
 * trailing letter-spacing, so the model must too — otherwise the modeled
 * fan is narrower than the real one and the font comes out too big. Used
 * only by the mobile font-size model; actual peeks are measured
 * empirically.
 *
 * Pure function; unit-testable.
 */
export function singleDigitPeekWidth(fontSize: number): number {
  return Math.round(fontSize * 0.15) + Math.ceil(0.92 * fontSize)
}

/**
 * Adaptive card metrics for narrow viewports: the cards are the hero of the
 * app, so instead of the fixed small mobile size they grow to fill the
 * available width — fewer digits means bigger cards. The fan width model
 * sums the per-card single-digit peeks plus the thousands-separator commas
 * plus the last card's full width, then shrinks the font until the modeled
 * fan fits the viewport.
 *
 * Pure function of (displayTexts, viewportWidth); unit-testable.
 */
export function getMobileCardMetrics(displayTexts: string[], viewportWidth: number): MobileCardMetrics {
  // Page padding on mobile (px-4 = 16px per side).
  const available = viewportWidth - 32
  if (displayTexts.length === 0) return { fontSize: 60 }

  const n = displayTexts.length
  const commas = getCommaCount(n)
  const lastChars = displayTexts[n - 1].length

  // Fan width model at font size fs. Each peek is the card's left padding
  // plus one digit advance; each comma is ~0.6em (glyph + tracking,
  // conservative); the last card contributes its full natural width (both
  // paddings + 0.92em per char: 0.62 digit advance + 0.3 letter spacing).
  const fanWidthAt = (fs: number) => {
    const pad = Math.round(fs * 0.15)
    return (n - 1) * singleDigitPeekWidth(fs) + commas * 0.6 * fs + 2 * pad + lastChars * 0.92 * fs
  }

  // Shrink-to-fit: start at the desktop 60px and decrement until the modeled
  // fan fits. Terminates: fanWidthAt strictly decreases as fs decreases.
  // The 10px floor keeps text readable.
  let fontSize = 60
  while (fontSize > 10 && fanWidthAt(fontSize) > available) {
    fontSize -= 1
  }
  return { fontSize }
}
