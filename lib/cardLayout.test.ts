import { describe, expect, it } from 'vitest'
import { getCardXOffset, getFanExtent, getMobileCardMetrics } from './cardLayout'
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

describe('getMobileCardMetrics', () => {
  it('grows cards for few digits: a 3-digit fan is much larger than the old fixed mobile size', () => {
    const { fontSize, xOffset } = getMobileCardMetrics(3, 375)
    // Exact value comes from the fan-fit loop; what matters is that it is
    // far larger than the old fixed mobile text-lg (18px).
    expect(fontSize).toBeGreaterThan(40)
    expect(fontSize).toBeLessThanOrEqual(60)
    expect(xOffset).toBe(Math.max(CARD_X_OFFSET_MOBILE_MIN, Math.round(fontSize * 0.6)))
  })

  it('keeps the desktop peeking ratio between offset and font size', () => {
    for (const n of [2, 4, 6, 8, 10]) {
      const { fontSize, xOffset } = getMobileCardMetrics(n, 375)
      // Desktop uses 36px offset at 60px text: a 0.6 ratio.
      expect(xOffset / fontSize).toBeCloseTo(0.6, 1)
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

  it('shrinks cards monotonically as digit count grows', () => {
    const sizes = [2, 4, 6, 8, 10].map((n) => getMobileCardMetrics(n, 375).fontSize)
    for (let i = 1; i < sizes.length; i++) {
      expect(sizes[i]).toBeLessThanOrEqual(sizes[i - 1])
    }
  })
})

describe('getFanExtent', () => {
  it('returns 0 for an empty fan', () => {
    expect(getFanExtent([], CARD_X_OFFSET)).toBe(0)
  })

  it('returns the single card width for a one-card fan', () => {
    expect(getFanExtent([70], CARD_X_OFFSET)).toBe(70)
  })

  it('takes the max of index * xOffset + width across cards', () => {
    // 940,934 zero-hidden on desktop: the 900,000 back card decides.
    expect(getFanExtent([379, 325, 179, 125, 70], 36)).toBe(379)
    // A later card can win when it is wide relative to its index.
    expect(getFanExtent([100, 200, 200], 36)).toBe(2 * 36 + 200)
  })
})
