import { describe, expect, it } from 'vitest'
import {
  FAN_CARD_GAP,
  formatCardValue,
  getFanExtent,
  getFanPositions,
  getMobileCardMetrics,
  scaleFontSizeToFit,
} from './cardLayout'

describe('formatCardValue', () => {
  it('shows the full place value for non-zero cards', () => {
    expect(formatCardValue(1, 100000)).toBe('100,000')
    expect(formatCardValue(8, 10000)).toBe('80,000')
    expect(formatCardValue(7, 100)).toBe('700')
    expect(formatCardValue(3, 10)).toBe('30')
    expect(formatCardValue(6, 1)).toBe('6')
  })

  it('shows the place value with a leading zero for zero cards', () => {
    // Thousands zero: "0,000", not "0".
    expect(formatCardValue(0, 1000)).toBe('0,000')
    expect(formatCardValue(0, 100)).toBe('000')
    expect(formatCardValue(0, 10)).toBe('00')
    expect(formatCardValue(0, 1)).toBe('0')
  })

  it('keeps zero cards parallel to their siblings at larger places', () => {
    expect(formatCardValue(0, 100000)).toBe('000,000')
    expect(formatCardValue(0, 1000000)).toBe('0,000,000')
  })
})

describe('getFanPositions', () => {
  it('starts the first card at 0 and stacks each card on the previous width', () => {
    expect(getFanPositions([])).toEqual([0])
    expect(getFanPositions([100])).toEqual([0, 100])
    expect(getFanPositions([100, 60, 40])).toEqual([0, 100, 160, 200])
  })

  it('handles uneven card widths', () => {
    const positions = getFanPositions([146, 146, 120, 146])
    expect(positions).toEqual([0, 146, 292, 412, 558])
  })
})

describe('getFanExtent', () => {
  it('returns the last card width for a one-card fan', () => {
    expect(getFanExtent([], 70)).toBe(70)
  })

  it('sums the card widths plus the last card natural width', () => {
    // 800,502 on desktop: full card widths plus gaps, last card with no
    // trailing gap.
    expect(getFanExtent([146, 146, 146, 146, 146], 71)).toBe(146 * 5 + 71)
  })

  it('drives the extent from measured widths, never a wide back card', () => {
    // The "700,000" back card is wide, but the extent is the measured
    // widths, so no card is ever stretched.
    expect(getFanExtent([379, 146, 146, 146, 146], 71)).toBe(379 + 146 * 4 + 71)
  })
})

describe('getMobileCardMetrics', () => {
  it('returns the desktop font size for an empty fan', () => {
    expect(getMobileCardMetrics([], 375)).toEqual({ fontSize: 60 })
  })

  it('grows cards for few digits: a 3-digit fan is much larger than the old fixed mobile size', () => {
    const { fontSize } = getMobileCardMetrics(['100', '20', '5'], 375)
    // Exact value comes from the fan-fit loop; what matters is that it is
    // far larger than the old fixed mobile text-lg (18px).
    expect(fontSize).toBeGreaterThan(40)
    expect(fontSize).toBeLessThanOrEqual(60)
  })

  it('never exceeds the desktop font size', () => {
    expect(getMobileCardMetrics(['5'], 375).fontSize).toBe(60)
    expect(getMobileCardMetrics(['10', '5'], 1024).fontSize).toBe(60)
  })

  it('floors at 24px and lets the strip scroll when the 10-card fan cannot fit', () => {
    const texts = [
      '9,000,000,000',
      '900,000,000',
      '90,000,000',
      '9,000,000',
      '900,000',
      '90,000',
      '9,000',
      '900',
      '90',
      '9',
    ]
    // Ten full-value cards cannot fit a 375px viewport at a readable size:
    // the model stops at the 24px floor and the strip scrolls horizontally.
    expect(getMobileCardMetrics(texts, 375).fontSize).toBe(24)
  })

  it('fits a 4-card fan on a 375px viewport', () => {
    const texts = ['1,000', '200', '30', '4']
    const { fontSize } = getMobileCardMetrics(texts, 375)
    const n = texts.length
    const pad = Math.round(fontSize * 0.15)
    const fanWidth = texts.reduce((sum, t) => sum + 2 * pad + t.length * 0.92 * fontSize, 0) + (n - 1) * FAN_CARD_GAP
    expect(fanWidth).toBeLessThanOrEqual(375 - 32)
  })

  it('floors at 24px on narrow viewports instead of shrinking forever', () => {
    // 320px and 208px viewports, 4 cards: the 60px starting guess
    // overshoots, the fit loop decrements to the 24px floor, and the strip
    // scrolls instead of shrinking further.
    expect(getMobileCardMetrics(['1,000', '200', '30', '4'], 320).fontSize).toBe(24)
    expect(getMobileCardMetrics(['1,000', '200', '30', '4'], 208).fontSize).toBe(24)
  })

  it('shrinks cards monotonically as digit count grows', () => {
    const sizes = [
      getMobileCardMetrics(['10', '5'], 375).fontSize,
      getMobileCardMetrics(['1,000', '200', '30', '5'], 375).fontSize,
      getMobileCardMetrics(['100,000', '20,000', '3,000', '400', '50', '6'], 375).fontSize,
    ]
    for (let i = 1; i < sizes.length; i++) {
      expect(sizes[i]).toBeLessThanOrEqual(sizes[i - 1])
    }
  })

  it('accounts for full card widths: more digits need a smaller font', () => {
    // 800,502 (6 cards) needs more room than a 3-card fan.
    const sixCards = getMobileCardMetrics(['800,000', '00,000', '0,000', '500', '00', '2'], 375).fontSize
    const threeCards = getMobileCardMetrics(['800', '50', '2'], 375).fontSize
    expect(sixCards).toBeLessThanOrEqual(threeCards)
  })
})

describe('scaleFontSizeToFit', () => {
  it('returns null when the fan already fits', () => {
    expect(scaleFontSizeToFit(300, 47, 343)).toBeNull()
    expect(scaleFontSizeToFit(343, 47, 343)).toBeNull()
  })

  it('scales proportionally to the overflow ratio', () => {
    // 500px fan in 250px of space at 40px font -> 20px font would be below
    // the 24px floor, so it clamps to 24.
    expect(scaleFontSizeToFit(500, 40, 250)).toBe(24)
    // 600px fan in 300px of space at 60px font -> 30px font.
    expect(scaleFontSizeToFit(600, 60, 300)).toBe(30)
  })

  it('floors at 24px for readability', () => {
    expect(scaleFontSizeToFit(2000, 60, 100)).toBe(24)
  })

  it('returns null for invalid inputs', () => {
    expect(scaleFontSizeToFit(500, 40, 0)).toBeNull()
    expect(scaleFontSizeToFit(500, 0, 250)).toBeNull()
  })

  it('returns null when scaling would not shrink', () => {
    // Already at the floor: clamping keeps it at 24, which is not smaller.
    expect(scaleFontSizeToFit(500, 24, 250)).toBeNull()
  })
})
