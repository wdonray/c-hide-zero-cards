import { describe, expect, it } from 'vitest'
import { getFanExtent, getFanPositions, getMobileCardMetrics, getPeekText } from './cardLayout'

describe('getPeekText', () => {
  it('keeps the significant prefix up to and including the first comma', () => {
    expect(getPeekText('800,000')).toBe('800,')
    expect(getPeekText('40,000')).toBe('40,')
    expect(getPeekText('1,000,000')).toBe('1,')
    expect(getPeekText('1,000')).toBe('1,')
    expect(getPeekText('00,000')).toBe('00,')
  })

  it('keeps the full text when there is no comma', () => {
    expect(getPeekText('500')).toBe('500')
    expect(getPeekText('90')).toBe('90')
    expect(getPeekText('5')).toBe('5')
    expect(getPeekText('0')).toBe('0')
  })

  it('keeps place values readable when zeros are hidden', () => {
    // 800,502 with zeros hidden is "800,000" / "500" / "2": the fan must
    // read "800," / "500" / "2", never collapse to "852".
    expect([getPeekText('800,000'), getPeekText('500'), getPeekText('2')]).toEqual(['800,', '500', '2'])
  })
})

describe('getFanPositions', () => {
  it('starts the first card at 0 and stacks each card on the previous peek', () => {
    expect(getFanPositions([])).toEqual([0])
    expect(getFanPositions([100])).toEqual([0, 100])
    expect(getFanPositions([100, 60, 40])).toEqual([0, 100, 160, 200])
  })

  it('handles uneven peek widths', () => {
    const positions = getFanPositions([228, 173, 118])
    expect(positions).toEqual([0, 228, 401, 519])
  })
})

describe('getFanExtent', () => {
  it('returns the last card width for a one-card fan', () => {
    expect(getFanExtent([], 70)).toBe(70)
  })

  it('sums the peeks plus the last card natural width', () => {
    // 800,502 hidden on desktop: peeks "800," (~228px) and "500" (~173px)
    // plus the "2" card's natural width (~71px).
    expect(getFanExtent([228, 173], 71)).toBe(228 + 173 + 71)
  })

  it('drives the extent from measured widths, never a wide back card', () => {
    // The "700,000" back card is ~379px wide, but the extent is the peeks
    // plus the "5" card's natural width, so the top card keeps its natural
    // width instead of becoming a giant block.
    expect(getFanExtent([63, 63, 63, 63, 118], 71)).toBe(63 * 4 + 118 + 71)
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
    // Fan model: sum of peek widths (pad + peek chars at 0.92em) plus the
    // last card's full width. Recompute the model here to assert the fit.
    const pad = Math.round(fontSize * 0.15)
    const peekChars = texts.slice(0, -1).map((t) => getPeekText(t).length)
    const fanWidth =
      peekChars.reduce((sum, c) => sum + pad + c * 0.92 * fontSize, 0) +
      2 * pad +
      texts[texts.length - 1].length * 0.92 * fontSize
    expect(fanWidth).toBeLessThanOrEqual(375 - 32)
  })

  it('fits the fan on a narrow 320px viewport too', () => {
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
    const { fontSize } = getMobileCardMetrics(texts, 320)
    const pad = Math.round(fontSize * 0.15)
    const peekChars = texts.slice(0, -1).map((t) => getPeekText(t).length)
    const fanWidth =
      peekChars.reduce((sum, c) => sum + pad + c * 0.92 * fontSize, 0) +
      2 * pad +
      texts[texts.length - 1].length * 0.92 * fontSize
    expect(fanWidth).toBeLessThanOrEqual(320 - 32)
  })

  it('shrinks until the wide-peek fan fits on very narrow viewports', () => {
    // 208px viewport, 4 cards with wide peeks: the 60px starting guess
    // overshoots, so the fit loop decrements until the modeled fan fits.
    const { fontSize } = getMobileCardMetrics(['1,000', '200', '30', '4'], 208)
    expect(fontSize).toBeLessThan(60)
    const pad = Math.round(fontSize * 0.15)
    const fanWidth =
      pad + 2 * 0.92 * fontSize + pad + 3 * 0.92 * fontSize + pad + 2 * 0.92 * fontSize + 2 * pad + 1 * 0.92 * fontSize
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

  it('accounts for wide peeks: 800,502 hidden needs room for "800,"', () => {
    // The significant-prefix peeks ("800,", "500") are much wider than
    // single digits, so the font must shrink more than the old model did.
    const wide = getMobileCardMetrics(['800,000', '500', '2'], 375).fontSize
    const narrow = getMobileCardMetrics(['800', '500', '2'], 375).fontSize
    expect(wide).toBeLessThanOrEqual(narrow)
  })
})
