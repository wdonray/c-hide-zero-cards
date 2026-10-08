export interface MobileCardMetrics {
  /** Card font size in px, chosen so the whole fan fits the viewport. */
  fontSize: number
}

/** Gap in px between adjacent cards in the fan strip. */
export const FAN_CARD_GAP = 8

/**
 * Extra px each covering card overlaps beyond the estimated peek width.
 * The peek width is estimated arithmetically via estimatePeekWidthPx
 * (stable, no DOM measurement), so only a small overlap is needed to
 * guarantee coverage against subpixel rounding. Validated by
 * e2e/no-overlap-slivers.spec.ts.
 */
export const OVERLAP_FUDGE_PX = 20

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
 * Estimate the peek width in px WITHOUT measuring text.
 *
 * The old approach used a Range over the first 1-2 characters, but Range
 * measurements are font-loading-timing-sensitive and vary across browsers
 * (notably iOS Safari), causing cramped or gapped fans on load. This
 * function computes the width arithmetically from stable inputs:
 *
 * - `chars`: 1 for "7", 2 for "7," (from peekCharCount)
 * - `fontSizePx`: the card's font size (from mobileMetrics or default)
 * - `padLeftPx`: the card's left padding (from computed style, stable)
 * - `letterSpacingPx`: the card's letter-spacing (from computed style, stable)
 *
 * 1ch is the width of "0"; with tabular-nums all digits match. Geist's
 * ch ratio is ~0.62 (empirical). The comma is ~0.35ch. These are stable
 * estimates, not measurements, so they don't vary with font loading timing.
 *
 * Pure function; unit-testable.
 */
export function estimatePeekWidthPx(
  chars: number,
  fontSizePx: number,
  padLeftPx: number,
  letterSpacingPx: number
): number {
  const CH_RATIO = 0.61
  const COMMA_CH = 0.4
  const chPx = fontSizePx * CH_RATIO
  const textCh = chars === 2 ? 1 + COMMA_CH : 1
  return padLeftPx + textCh * chPx + letterSpacingPx * chars
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
 * Right-aligned fan positions: every card's right edge aligns with the
 * rightmost card's right edge, so no back card ever peeks out on the
 * right side. (Owner 2026-10-08.)
 *
 * `naturalWidths` are the measured full widths of each card, left to
 * right (index 0 is the leftmost/back card). Returns the left-edge x
 * position for each card, with the leftmost card at 0.
 *
 * The visible peek for card i (except the last) is
 * naturalWidths[i] - naturalWidths[i+1]: the part not covered by the
 * card in front. For the peek to show exactly the desired text (e.g.
 * "8,"), the width difference must match; the caller adjusts
 * letter-spacing/padding dynamically if it does not (see Donray's
 * 2026-10-08 spec).
 *
 * Pure function; unit-testable.
 */
export function getRightAlignedFanPositions(naturalWidths: number[]): number[] {
  const n = naturalWidths.length
  if (n === 0) return []
  // Work right to left, aligning right edges.
  const positions = new Array<number>(n)
  positions[n - 1] = 0
  for (let i = n - 2; i >= 0; i--) {
    positions[i] = positions[i + 1] + naturalWidths[i + 1] - naturalWidths[i]
  }
  // Shift so the leftmost card sits at 0.
  const minPos = Math.min(...positions)
  return positions.map((p) => p - minPos)
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
  // Owner 2026-10-08: no shrink-to-fit. Cards render at their natural size
  // always; compacting the fan to fit the viewport causes cards to reveal
  // their real size on drag. The viewportWidth and minFontSize params are
  // kept for API compatibility but no longer affect the result.
  void peekTexts
  void viewportWidth
  void minFontSize
  return { fontSize: 60 }
}
