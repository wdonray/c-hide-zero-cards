import { describe, expect, it } from 'vitest'
import { getCardXOffset, getFanExtent, getMobileCardMetrics, mobilePeekForFontSize } from './cardLayout'
import { CARD_X_OFFSET, CARD_X_OFFSET_MOBILE_MIN } from './constants'

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
    // (147.5 - 16) / 3 = 43.8 -> 43, just under the 46px desktop offset
    expect(getCardXOffset(4, 375)).toBe(43)
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

describe('mobilePeekForFontSize', () => {
  it('fits the card left padding plus one full digit advance', () => {
    // 34px hero text (6-digit fan on a 390px phone): 5px padding + 22px digit.
    expect(mobilePeekForFontSize(34)).toBe(Math.round(34 * 0.15) + Math.ceil(0.62 * 34))
    expect(mobilePeekForFontSize(34)).toBe(27)
    // 60px desktop-size text: 9px padding + 38px digit.
    expect(mobilePeekForFontSize(60)).toBe(47)
  })

  it('grows monotonically with the font size', () => {
    let prev = mobilePeekForFontSize(10)
    for (let f = 11; f <= 60; f++) {
      const cur = mobilePeekForFontSize(f)
      expect(cur).toBeGreaterThanOrEqual(prev)
      prev = cur
    }
  })
})

describe('getMobileCardMetrics', () => {
  it('grows cards for few digits: a 3-digit fan is much larger than the old fixed mobile size', () => {
    const { fontSize, xOffset } = getMobileCardMetrics(3, 375)
    // Exact value comes from the fan-fit loop; what matters is that it is
    // far larger than the old fixed mobile text-lg (18px).
    expect(fontSize).toBeGreaterThan(40)
    expect(fontSize).toBeLessThanOrEqual(60)
    expect(xOffset).toBe(Math.max(CARD_X_OFFSET_MOBILE_MIN, Math.min(CARD_X_OFFSET, mobilePeekForFontSize(fontSize))))
  })

  it('sizes every peek to fit the left padding plus one full digit advance', () => {
    for (const n of [2, 4, 6, 8, 10]) {
      const { fontSize, xOffset } = getMobileCardMetrics(n, 375)
      // The peek is never narrower than padLeft + one digit advance, so no
      // leading digit is clipped under the next card (unless the 12px
      // minimum offset binds on very narrow viewports).
      const need = Math.round(fontSize * 0.15) + Math.ceil(0.62 * fontSize)
      expect(xOffset).toBe(Math.max(CARD_X_OFFSET_MOBILE_MIN, Math.min(CARD_X_OFFSET, need)))
    }
  })

  it('never exceeds the desktop font size', () => {
    expect(getMobileCardMetrics(1, 375).fontSize).toBe(60)
    expect(getMobileCardMetrics(2, 1024).fontSize).toBe(60)
  })

  it('fits the whole 10-card fan inside a 375px viewport', () => {
    const { fontSize, xOffset } = getMobileCardMetrics(10, 375)
    // Fan model: 9 peeks + one full 12-char card at 0.92 * fontSize per char.
    const fanWidth = 9 * xOffset + 12 * 0.92 * fontSize
    expect(fanWidth).toBeLessThanOrEqual(375 - 32)
    expect(xOffset).toBeGreaterThanOrEqual(CARD_X_OFFSET_MOBILE_MIN)
  })

  it('fits the fan on a narrow 320px viewport too', () => {
    const { fontSize, xOffset } = getMobileCardMetrics(10, 320)
    const fanWidth = 9 * xOffset + 12 * 0.92 * fontSize
    expect(fanWidth).toBeLessThanOrEqual(320 - 32)
  })

  it('shrinks further when the minimum offset binds on very narrow viewports', () => {
    // 208px viewport, 4 cards: the initial font-size guess overshoots
    // because the 12px offset floor binds, so the fit loop decrements
    // until the real fan fits.
    const { fontSize, xOffset } = getMobileCardMetrics(4, 208)
    expect(fontSize).toBeLessThan(18)
    const fanWidth = 3 * xOffset + 8 * 0.92 * fontSize
    expect(fanWidth).toBeLessThanOrEqual(208 - 32)
  })

  it('shrinks cards monotonically as digit count grows', () => {
    const sizes = [2, 4, 6, 8, 10].map((n) => getMobileCardMetrics(n, 375).fontSize)
    for (let i = 1; i < sizes.length; i++) {
      expect(sizes[i]).toBeLessThanOrEqual(sizes[i - 1])
    }
  })
})

describe('getFanExtent', () => {
  it('returns 0 for an empty fan', () => {
    expect(getFanExtent(0, 0, CARD_X_OFFSET)).toBe(0)
  })

  it('returns the single card width for a one-card fan', () => {
    expect(getFanExtent(70, 1, CARD_X_OFFSET)).toBe(70)
  })

  it('drives the extent from the last card only, never a wide back card', () => {
    // 763,285 on desktop: the "700,000" back card is ~379px wide, but the
    // extent is 5 peeks plus the "5" card's natural width, so the top card
    // keeps its natural width instead of becoming a giant block.
    // (xOffset is just a parameter here; the desktop constant is 46px.)
    expect(getFanExtent(70, 6, 36)).toBe(5 * 36 + 70)
    expect(getFanExtent(39, 6, 26)).toBe(5 * 26 + 39)
  })
})
