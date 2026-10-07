import { describe, expect, it } from 'vitest'
import {
  OVERLAP_FUDGE_PX,
  formatCardValue,
  getFanExtent,
  getFanPositions,
  getMobileCardMetrics,
  getPeekText,
  peekCharCount,
  estimatePeekWidthPx,
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

describe('peekCharCount', () => {
  it('measures 2 chars for group-final cards (digit + comma)', () => {
    expect(peekCharCount(1000)).toBe(2)
    expect(peekCharCount(1000000)).toBe(2)
    expect(peekCharCount(1000000000)).toBe(2)
  })

  it('measures 1 char for all other cards', () => {
    expect(peekCharCount(1)).toBe(1)
    expect(peekCharCount(10)).toBe(1)
    expect(peekCharCount(100)).toBe(1)
    expect(peekCharCount(10000)).toBe(1)
    expect(peekCharCount(100000)).toBe(1)
  })
})

describe('estimatePeekWidthPx', () => {
  it('estimates wider for 2-char peeks than 1-char peeks', () => {
    const oneChar = estimatePeekWidthPx(1, 60, 8, 10)
    const twoChar = estimatePeekWidthPx(2, 60, 8, 10)
    expect(twoChar).toBeGreaterThan(oneChar)
  })

  it('scales with font size', () => {
    const small = estimatePeekWidthPx(1, 30, 8, 5)
    const large = estimatePeekWidthPx(1, 60, 8, 10)
    expect(large).toBeGreaterThan(small)
  })

  it('is deterministic (no DOM measurement)', () => {
    const a = estimatePeekWidthPx(2, 60, 8, 10)
    const b = estimatePeekWidthPx(2, 60, 8, 10)
    expect(a).toBe(b)
  })
})

describe('getPeekText', () => {
  it('shows the first digit for ordinary cards', () => {
    expect(getPeekText(7, 100)).toBe('7')
    expect(getPeekText(4, 10)).toBe('4')
    expect(getPeekText(3, 1)).toBe('3')
    expect(getPeekText(8, 10000)).toBe('8')
  })

  it('includes the thousands separator for group-final cards', () => {
    expect(getPeekText(3, 1000)).toBe('3,')
    expect(getPeekText(1, 1000000)).toBe('1,')
    expect(getPeekText(2, 1000000000)).toBe('2,')
  })

  it('shows "0" (or "0,") for zero cards', () => {
    expect(getPeekText(0, 1000)).toBe('0,')
    expect(getPeekText(0, 100)).toBe('0')
    expect(getPeekText(0, 1)).toBe('0')
  })

  it('reads like the formatted number for 3,743 and 180,736', () => {
    const fan3743 = [getPeekText(3, 1000), getPeekText(7, 100), getPeekText(4, 10), getPeekText(3, 1)]
    expect(fan3743.join('')).toBe('3,743')
    const fan180736 = [
      getPeekText(1, 100000),
      getPeekText(8, 10000),
      getPeekText(0, 1000),
      getPeekText(7, 100),
      getPeekText(3, 10),
      getPeekText(6, 1),
    ]
    expect(fan180736.join('')).toBe('180,736')
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
    // 800,502: peek widths plus gaps, last card with no trailing gap.
    expect(getFanExtent([146, 146, 146, 146, 146], 71)).toBe(146 * 5 + 71)
  })

  it('drives the extent from measured widths, never a wide back card', () => {
    // The "700" back card is wide, but the extent uses the peek widths,
    // so no card is ever stretched.
    expect(getFanExtent([379, 146, 146, 146, 146], 71)).toBe(379 + 146 * 4 + 71)
  })
})

describe('getMobileCardMetrics', () => {
  it('returns the desktop font size for an empty fan', () => {
    expect(getMobileCardMetrics([], 375)).toEqual({ fontSize: 60 })
  })

  it('grows cards for few digits: a 3-tile fan is much larger than the old fixed mobile size', () => {
    const { fontSize } = getMobileCardMetrics(['1', '2', '5'], 375)
    // Exact value comes from the fan-fit loop; what matters is that it is
    // far larger than the old fixed mobile text-lg (18px).
    expect(fontSize).toBeGreaterThan(40)
    expect(fontSize).toBeLessThanOrEqual(60)
  })

  it('never exceeds the desktop font size', () => {
    expect(getMobileCardMetrics(['5'], 375).fontSize).toBe(60)
    expect(getMobileCardMetrics(['1', '5'], 1024).fontSize).toBe(60)
  })

  it('fits the 10-tile fan at 25px on a 375px viewport', () => {
    // Peek texts for 9,999,999,999: group-final cards carry the comma.
    const peeks = ['9,', '9', '9', '9,', '9', '9', '9,', '9', '9', '9']
    // Ten narrow tiles with true overlap fit a 375px viewport at 25px.
    // (With the 4px overlap fudge for the arithmetic estimate.)
    expect(getMobileCardMetrics(peeks, 375).fontSize).toBe(25)
  })

  it('fits a 4-tile fan on a 375px viewport', () => {
    // Peek texts for 3,743.
    const peeks = ['3,', '7', '4', '3']
    const { fontSize } = getMobileCardMetrics(peeks, 375)
    const n = peeks.length
    const pad = Math.round(fontSize * 0.15)
    const fanWidth =
      peeks.reduce((sum, t) => sum + 2 * pad + t.length * 0.92 * fontSize, 0) - (n - 1) * OVERLAP_FUDGE_PX
    expect(fanWidth).toBeLessThanOrEqual(375 - 32)
  })

  it('shrinks to fit narrow viewports: 3,743 peeks need 51px at 320px, 32px at 208px', () => {
    // Exact values from the fan-fit loop over peek texts.
    expect(getMobileCardMetrics(['3,', '7', '4', '3'], 320).fontSize).toBe(51)
    expect(getMobileCardMetrics(['3,', '7', '4', '3'], 208).fontSize).toBe(32)
  })

  it('shrinks tiles monotonically as tile count grows', () => {
    const sizes = [
      getMobileCardMetrics(['1', '5'], 375).fontSize,
      getMobileCardMetrics(['3,', '7', '4', '5'], 375).fontSize,
      getMobileCardMetrics(['1', '8', '0,', '7', '3', '6'], 375).fontSize,
    ]
    for (let i = 1; i < sizes.length; i++) {
      expect(sizes[i]).toBeLessThanOrEqual(sizes[i - 1])
    }
  })

  it('accounts for peek widths: the comma tile needs more room', () => {
    // Same tile count, but one fan has a 2-char "0," peek.
    const withComma = getMobileCardMetrics(['1', '8', '0,', '7', '3', '6'], 375).fontSize
    const withoutComma = getMobileCardMetrics(['1', '8', '0', '7', '3', '6'], 375).fontSize
    expect(withComma).toBeLessThanOrEqual(withoutComma)
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
