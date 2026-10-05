/**
 * Significant prefix of a card's display text: the part shown in the card's
 * peek. Up to and including the first comma if present, so the thousands
 * separator stays visible ("800,000" -> "800,", "40,000" -> "40,",
 * "1,000,000" -> "1,"); otherwise the full text ("500" -> "500",
 * "90" -> "90", "5" -> "5", "0" -> "0"). Each remaining card's place value
 * stays readable when zeros are hidden: 800,502 reads "800," / "500" / "2",
 * never "852".
 *
 * Pure function of the display text; unit-testable.
 */
export function getPeekText(displayText: string): string {
  const commaIndex = displayText.indexOf(',')
  return commaIndex === -1 ? displayText : displayText.slice(0, commaIndex + 1)
}

export interface MobileCardMetrics {
  /** Card font size in px, chosen so the whole fan fits the viewport. */
  fontSize: number
}

/**
 * Left-edge x positions for a fan with per-card measured peek widths.
 * Card 0 starts at 0; each subsequent card starts where the previous
 * card's peek ends. `peekWidths` has one entry per card except the last
 * (the last card shows its full natural width, so it has no peek);
 * the returned array has one entry per card.
 *
 * Pure function; unit-testable.
 */
export function getFanPositions(peekWidths: number[]): number[] {
  const positions: number[] = [0]
  for (let i = 0; i < peekWidths.length; i++) {
    positions.push(positions[i] + peekWidths[i])
  }
  return positions
}

/**
 * Visible horizontal extent of the fan: the cumulative peek widths plus
 * the last (top) card's full natural width. Driven by measured widths,
 * never by a max over cards (max-ing once inflated the top card to ~3x
 * its natural width).
 *
 * Pure function; unit-testable.
 */
export function getFanExtent(peekWidths: number[], lastCardWidth: number): number {
  return peekWidths.reduce((sum, w) => sum + w, 0) + lastCardWidth
}

/**
 * Adaptive card metrics for narrow viewports: the cards are the hero of the
 * app, so instead of the fixed small mobile size they grow to fill the
 * available width — fewer digits means bigger cards. The fan width model
 * sums the per-card peek widths (each peek fits its significant prefix)
 * plus the last card's full width, then shrinks the font until the modeled
 * fan fits the viewport.
 *
 * Pure function of (displayTexts, viewportWidth); unit-testable.
 */
export function getMobileCardMetrics(displayTexts: string[], viewportWidth: number): MobileCardMetrics {
  // Page padding on mobile (px-4 = 16px per side).
  const available = viewportWidth - 32
  if (displayTexts.length === 0) return { fontSize: 60 }

  const peekChars = displayTexts.slice(0, -1).map((t) => getPeekText(t).length)
  const lastChars = displayTexts[displayTexts.length - 1].length

  // Fan width model at font size fs. Each peek is the card's left padding
  // plus its significant prefix (0.62 digit advance + 0.3 letter-spacing
  // per char, matching the card's tabular-nums + tracking); the last card
  // contributes its full natural width (both paddings). pad(fs) matches the
  // card's mobile padding override (fontSize * 0.15 horizontal). The model
  // is conservative (a comma is narrower than 0.92em), so the real fan fits
  // with room to spare.
  const fanWidthAt = (fs: number) => {
    const pad = Math.round(fs * 0.15)
    let width = 2 * pad + lastChars * 0.92 * fs
    for (const chars of peekChars) {
      width += pad + chars * 0.92 * fs
    }
    return width
  }

  // Shrink-to-fit: start at the desktop 60px and decrement until the modeled
  // fan fits. Terminates: fanWidthAt strictly decreases as fs decreases.
  // The 10px floor keeps text readable (it replaces the old 12px offset
  // floor now that peeks are per-card measured rather than even).
  let fontSize = 60
  while (fontSize > 10 && fanWidthAt(fontSize) > available) {
    fontSize -= 1
  }
  return { fontSize }
}
