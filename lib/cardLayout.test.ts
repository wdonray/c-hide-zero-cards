import { describe, expect, it } from 'vitest'
import { getCardXOffset } from './cardLayout'
import { CARD_X_OFFSET } from './constants'

describe('getCardXOffset', () => {
  it('returns the desktop fan offset on wide viewports regardless of card count', () => {
    expect(getCardXOffset(10, 1280)).toBe(CARD_X_OFFSET)
    expect(getCardXOffset(10, 768)).toBe(CARD_X_OFFSET)
    expect(getCardXOffset(4, 1024)).toBe(CARD_X_OFFSET)
  })

  it('returns the desktop fan offset for a single card', () => {
    expect(getCardXOffset(1, 375)).toBe(CARD_X_OFFSET)
  })

  it('compresses the fan for 10 cards on a 375px viewport', () => {
    // halfAvailable = 375/2 - 40 = 147.5; (147.5 - 16) / 9 = 14.6 -> 14
    expect(getCardXOffset(10, 375)).toBe(14)
  })

  it('keeps the roomy desktop fan for small numbers on mobile', () => {
    // (147.5 - 16) / 3 = 43.8 -> capped at the desktop offset
    expect(getCardXOffset(4, 375)).toBe(CARD_X_OFFSET)
  })

  it('scales the fan between the extremes', () => {
    // (147.5 - 16) / 6 = 21.9 -> 21
    expect(getCardXOffset(7, 375)).toBe(21)
  })

  it('never compresses below the minimum readable offset', () => {
    // 320px viewport, 10 cards: (120 - 16) / 9 = 11.5 -> floored to 11, floored up to 12
    expect(getCardXOffset(10, 320)).toBe(12)
  })
})
