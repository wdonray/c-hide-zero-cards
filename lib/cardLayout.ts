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
