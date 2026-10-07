export interface MobileCardMetrics {
  /** Card font size in px, chosen so the whole fan fits the viewport. */
  fontSize: number
}

/** Gap in px between adjacent cards in the fan strip. */
export const FAN_CARD_GAP = 8

/**
 * Extra px each covering card overlaps beyond the measured peek width.
 * The peek width is measured with a Range over the first 1-2 characters,
 * which can under-measure by a pixel or two (subpixel rounding, trailing
 * letter-spacing); without a fudge, slivers of the covered card's text
 * peek through beside the covering card. The fudge eats into the trailing
 * letter-spacing after the peek digit, never into the digit itself.
 */
export const OVERLAP_FUDGE_PX = 4

/**
 * Display text for a place-value card: the full place value, always.
 * A zero card shows the place value with a leading zero ("0,000" for
 * thousands, "000" for hundreds, "00" for tens, "0" for ones) so it stays
 * parallel to its siblings ("80,000", "700") instead of a bare "0".
 *
 * Pure function; unit-testable.
 */
export function formatCardValue(firstDigit: number, placeValue: number): string {
  if (firstDigit === 0) {
    return placeValue.toLocaleString().replace(/^\d/, '0')
  }
  return (firstDigit * placeValue).toLocaleString()
}

/**
 * How many leading characters of the card's rendered text stay visible at
 * fan home: 2 when the peek includes the thousands separator ("3,"), else
 * 1 ("7"). The cards ending a thousands group (thousands, millions,
 * billions) carry the comma in their peek so the fan reads like the
 * formatted number ("3,743", "180,736").
 *
 * Pure function; unit-testable.
 */
export function peekCharCount(placeValue: number): number {
  return placeValue === 1000 || placeValue === 1000000 || placeValue === 1000000000 ? 2 : 1
}

/**
 * Peek text visible for a card at fan home: its first digit, plus the
 * thousands separator when the card ends a thousands group. The card's
 * full text is really rendered underneath; the next card overlaps and
 * covers everything past the peek (true overlap, like physical arrow
 * cards), so pulling a tile out reveals the full value.
 *
 * Pure function; unit-testable.
 */
export function getPeekText(firstDigit: number, placeValue: number): string {
  return peekCharCount(placeValue) === 2 ? `${firstDigit},` : `${firstDigit}`
}

/**
 * Left-edge x positions for a fan with per-card measured widths.
 * Card 0 starts at 0; each subsequent card starts where the previous
 * card's width ends, so it overlaps the previous card's full text and
 * covers everything past its peek (true overlap, like physical arrow
 * cards). `cardWidths` has one entry per card (each entry already
 * includes its trailing gap except the last); the returned array has one
 * entry per card.
 *
 * Pure function; unit-testable.
 */
export function getFanPositions(cardWidths: number[]): number[] {
  const positions: number[] = [0]
  for (let i = 0; i < cardWidths.length; i++) {
    positions.push(positions[i] + cardWidths[i])
  }
  return positions
}

/**
 * Visible horizontal extent of the fan: the cumulative card widths plus
 * the last card's full natural width. The last card is fully visible (the
 * ones place is a single digit, so its peek is its full width). `cardWidths`
 * holds the widths of all cards except the last (each including its
 * trailing gap); `lastCardWidth` is the last card's width with no trailing
 * gap. Driven by measured widths, never by a max over cards.
 *
 * Pure function; unit-testable.
 */
export function getFanExtent(cardWidths: number[], lastCardWidth: number): number {
  return cardWidths.reduce((sum, w) => sum + w, 0) + lastCardWidth
}

/**
 * Scale a font size so a measured fan extent fits an available width.
 * Text scales linearly with font size, so the corrected size is
 * currentFontSize * (availableWidth / measuredExtent), floored at
 * minFontSize (24px) for readability; below that the caller should let
 * the strip scroll horizontally instead of shrinking further. Returns
 * null when the fan already fits or the inputs are invalid — the caller
 * should not adjust.
 *
 * This is the fully-dynamic correction: the model in
 * getMobileCardMetrics is only a first guess, and real devices (fonts,
 * letter-spacing, padding) can render wider than modeled. Measuring the
 * actual extent and scaling empirically guarantees the fan fits.
 *
 * Pure function; unit-testable.
 */
export function scaleFontSizeToFit(
  measuredExtent: number,
  currentFontSize: number,
  availableWidth: number,
  minFontSize = 24
): number | null {
  if (measuredExtent <= availableWidth || availableWidth <= 0 || currentFontSize <= 0) {
    return null
  }
  const scaled = Math.floor((currentFontSize * availableWidth) / measuredExtent)
  const clamped = Math.max(minFontSize, scaled)
  return clamped < currentFontSize ? clamped : null
}

export function getMobileCardMetrics(peekTexts: string[], viewportWidth: number, minFontSize = 24): MobileCardMetrics {
  // Page padding on mobile (px-4 = 16px per side).
  const available = viewportWidth - 32
  if (peekTexts.length === 0) return { fontSize: 60 }

  const n = peekTexts.length

  // Fan width model at font size fs. Each card contributes its peek (first
  // digit, plus comma for group-final cards): both horizontal paddings
  // plus 0.92em per character (0.62 digit advance + 0.3 letter-spacing,
  // tabular-nums), plus the inter-card gap. The last card is fully visible
  // but the ones place is a single digit, so the peek model covers it.
  const fanWidthAt = (fs: number) => {
    const pad = Math.round(fs * 0.15)
    return peekTexts.reduce((sum, t) => sum + 2 * pad + t.length * 0.92 * fs, 0) + (n - 1) * FAN_CARD_GAP
  }

  // Shrink-to-fit: start at the desktop 60px and decrement until the modeled
  // fan fits. Terminates: fanWidthAt strictly decreases as fs decreases.
  // The minFontSize floor keeps text readable; below it the strip scrolls
  // horizontally instead of shrinking further.
  let fontSize = 60
  while (fontSize > minFontSize && fanWidthAt(fontSize) > available) {
    fontSize -= 1
  }
  return { fontSize }
}
