import { CARD_X_OFFSET, CARD_X_OFFSET_MOBILE_MIN, MOBILE_WIDTH } from './constants'

/**
 * Horizontal fan offset between place-value cards.
 *
 * Desktop keeps the fixed 36px fan. On narrow viewports the fan is
 * compressed so every card stays inside the viewport: each card is
 * centered in the workspace and shifted right by `index * offset`, so the
 * rightmost card's far edge must fit in half the viewport width.
 *
 * Pure function of (totalCards, viewportWidth) so it is unit-testable and
 * behaves identically on server and client for the same inputs.
 */
export function getCardXOffset(totalCards: number, viewportWidth: number): number {
  if (totalCards <= 1 || viewportWidth >= MOBILE_WIDTH) {
    return CARD_X_OFFSET
  }
  // Half the workspace width, minus the page padding (p-8 = 32px per side)
  // and a small safety margin.
  const halfAvailable = viewportWidth / 2 - 40
  // Reserve ~16px for half of the ones-card width (the narrowest card).
  const maxOffset = Math.floor((halfAvailable - 16) / (totalCards - 1))
  return Math.min(CARD_X_OFFSET, Math.max(CARD_X_OFFSET_MOBILE_MIN, maxOffset))
}

/** Conservative longest card-content length (chars) for a fan of n cards. */
function maxCardChars(totalCards: number): number {
  if (totalCards >= 10) return 12 // e.g. "0,000,000,000"
  if (totalCards >= 7) return 11 // e.g. "0,000,000"
  if (totalCards >= 4) return 8
  return 6
}

export interface MobileCardMetrics {
  /** Card font size in px, chosen so the whole fan fits the viewport. */
  fontSize: number
  /** Horizontal fan offset in px, kept proportional to the font size so the
   *  peeking character matches the desktop fan. */
  xOffset: number
}

/**
 * Adaptive card metrics for narrow viewports: the cards are the hero of the
 * app, so instead of the fixed small mobile size they grow to fill the
 * available width — fewer digits means bigger cards. The fan keeps the exact
 * desktop peeking character because the offset stays proportional to the
 * font size (desktop uses 36px offset at 60px text, a 0.6 ratio).
 *
 * Pure function of (totalCards, viewportWidth); unit-testable.
 */
export function getMobileCardMetrics(totalCards: number, viewportWidth: number): MobileCardMetrics {
  // Page padding on mobile (px-4 = 16px per side).
  const available = viewportWidth - 32
  const chars = maxCardChars(totalCards)
  // Fan width model: (n-1) peeks at 0.6 * fontSize plus one full card at
  // ~0.92 * fontSize per char (0.62 digit advance + 0.3 letter spacing).
  let fontSize = Math.min(60, Math.floor(available / ((totalCards - 1) * 0.6 + chars * 0.92)))
  // The offset floor (12px) breaks the proportional model on very narrow
  // viewports, so shrink until the real fan (with the real clamped offset)
  // fits. Terminates: each step strictly reduces the fan width.
  for (;;) {
    const xOffset = Math.min(CARD_X_OFFSET, Math.max(CARD_X_OFFSET_MOBILE_MIN, Math.round(fontSize * 0.6)))
    if ((totalCards - 1) * xOffset + chars * 0.92 * fontSize <= available || fontSize <= 10) break
    fontSize -= 1
  }
  const xOffset = Math.min(CARD_X_OFFSET, Math.max(CARD_X_OFFSET_MOBILE_MIN, Math.round(fontSize * 0.6)))
  return { fontSize, xOffset }
}
