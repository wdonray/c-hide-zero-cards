import { describe, expect, it } from 'vitest'
import { getCommaCount, getFanExtent, getFanPositions, getMobileCardMetrics, singleDigitPeekWidth } from './cardLayout'

describe('getCommaCount', () => {
  it('places no comma for 3 or fewer cards', () => {
    expect(getCommaCount(1)).toBe(0)
    expect(getCommaCount(3)).toBe(0)
  })

  it('places one comma after every 3 digits from the right', () => {
    expect(getCommaCount(4)).toBe(1) // 1,000
    expect(getCommaCount(6)).toBe(1) // 800,502
    expect(getCommaCount(7)).toBe(2) // 1,234,567
    expect(getCommaCount(10)).toBe(3) // 9,000,000,000
  })
})

describe('singleDigitPeekWidth', () => {
  it('fits the card padding plus one digit advance plus letter-spacing', () => {
    // padLeft (15% of font size, rounded) + 0.92em (0.62 digit advance +
    // 0.3 letter-spacing, matching the empirical Range measurement).
    expect(singleDigitPeekWidth(60)).toBe(Math.round(60 * 0.15) + Math.ceil(0.92 * 60))
    expect(singleDigitPeekWidth(34)).toBe(Math.round(34 * 0.15) + Math.ceil(0.92 * 34))
  })
})

describe('getFanPositions', () => {
  it('starts the first item at 0 and stacks each item on the previous width', () => {
    expect(getFanPositions([])).toEqual([0])
    expect(getFanPositions([100])).toEqual([0, 100])
    expect(getFanPositions([100, 60, 40])).toEqual([0, 100, 160, 200])
  })

  it('handles uneven item widths (peeks and commas)', () => {
    const positions = getFanPositions([46, 46, 20, 46])
    expect(positions).toEqual([0, 46, 92, 112, 158])
  })
})

describe('getFanExtent', () => {
  it('returns the last card width for a one-card fan', () => {
    expect(getFanExtent([], 70)).toBe(70)
  })

  it('sums the item widths plus the last card natural width', () => {
    // 800,502 on desktop: single-digit peeks plus one comma plus the "2"
    // card's natural width.
    expect(getFanExtent([46, 46, 20, 46, 46], 71)).toBe(46 * 4 + 20 + 71)
  })

  it('drives the extent from measured widths, never a wide back card', () => {
    // The "700,000" back card is ~379px wide, but the extent is the peeks
    // plus the "5" card's natural width, so the top card keeps its natural
    // width instead of becoming a giant block.
    expect(getFanExtent([46, 46, 46, 46, 46], 71)).toBe(46 * 5 + 71)
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

  it('fits the whole 10-card fan inside a 375px viewport', () => {
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
    const { fontSize } = getMobileCardMetrics(texts, 375)
    // Fan model: single-digit peeks plus commas plus the last card's full
    // width. Recompute the model here to assert the fit.
    const n = texts.length
    const commas = Math.floor((n - 1) / 3)
    const pad = Math.round(fontSize * 0.15)
    const fanWidth =
      (n - 1) * (pad + Math.ceil(0.62 * fontSize)) +
      commas * 0.6 * fontSize +
      2 * pad +
      texts[n - 1].length * 0.92 * fontSize
    expect(fanWidth).toBeLessThanOrEqual(375 - 32)
  })

  it('fits the fan on a narrow 320px viewport too', () => {
    const texts = ['1,000', '200', '30', '4']
    const { fontSize } = getMobileCardMetrics(texts, 320)
    const n = texts.length
    const commas = Math.floor((n - 1) / 3)
    const pad = Math.round(fontSize * 0.15)
    const fanWidth =
      (n - 1) * (pad + Math.ceil(0.62 * fontSize)) +
      commas * 0.6 * fontSize +
      2 * pad +
      texts[n - 1].length * 0.92 * fontSize
    expect(fanWidth).toBeLessThanOrEqual(320 - 32)
  })

  it('shrinks until the fan fits on very narrow viewports', () => {
    // 208px viewport, 4 cards: the 60px starting guess overshoots, so the
    // fit loop decrements until the modeled fan fits.
    const { fontSize } = getMobileCardMetrics(['1,000', '200', '30', '4'], 208)
    expect(fontSize).toBeLessThan(60)
    const n = 4
    const commas = Math.floor((n - 1) / 3)
    const pad = Math.round(fontSize * 0.15)
    const fanWidth =
      (n - 1) * (pad + Math.ceil(0.62 * fontSize)) + commas * 0.6 * fontSize + 2 * pad + 1 * 0.92 * fontSize
    expect(fanWidth).toBeLessThanOrEqual(208 - 32)
  })

  it('floors the font size at 10px to keep text readable', () => {
    // Absurdly narrow viewport: the loop must terminate instead of
    // shrinking forever.
    const { fontSize } = getMobileCardMetrics(['9,000,000,000', '900,000,000', '90,000,000', '9,000,000'], 100)
    expect(fontSize).toBe(10)
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

  it('accounts for commas: more digits need a smaller font', () => {
    // 800,502 (6 cards, 1 comma) needs room for the comma element.
    const withComma = getMobileCardMetrics(['800,000', '0', '0', '500', '0', '2'], 375).fontSize
    const withoutComma = getMobileCardMetrics(['800', '50', '2'], 375).fontSize
    expect(withComma).toBeLessThanOrEqual(withoutComma)
  })
})
