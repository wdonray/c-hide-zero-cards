import { describe, expect, it } from 'vitest'
import {
  CARD_PAINT,
  CARD_PAINT_STYLE,
  CARD_Y_OFFSET,
  DEFAULT_MAX_RANDOM_NUMBER,
  FIRST_TIME_TOAST_DURATION,
  InstructionalGuideDialogTab,
  LOCAL_STORAGE_KEYS,
  MAX_NUMBER,
  MOBILE_WIDTH,
  NumberFormsDialogTab,
  PLACE_VALUE_NAMES,
  PLACE_VALUES,
  RANDOM_NUMBER_TYPE,
} from '@/lib/constants'

describe('place value mappings', () => {
  it('maps digit positions to powers of ten', () => {
    for (let position = 0; position <= 9; position++) {
      expect(PLACE_VALUES[position]).toBe(10 ** position)
    }
  })

  it('gives every place value a name and a card paint gradient', () => {
    for (const placeValue of Object.values(PLACE_VALUES)) {
      expect(PLACE_VALUE_NAMES[placeValue]).toBeTruthy()
      const paint = CARD_PAINT[placeValue]
      expect(paint.from).toMatch(/^#[0-9A-F]{6}$/)
      expect(paint.to).toMatch(/^#[0-9A-F]{6}$/)
      expect(paint.from).not.toBe(paint.to)
    }
  })

  it('keeps white digits at >= 4.5:1 contrast over the whole card gradient', () => {
    // WCAG 2.2 AA: the gradient darkens toward the bottom, so the top stop
    // is the weakest point. Verify it against the relative-luminance
    // formula directly instead of trusting the hex values by eye.
    const luminance = (hex: string): number => {
      const channels = [0, 2, 4].map((i) => {
        const c = parseInt(hex.slice(i + 1, i + 3), 16) / 255
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
      })
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
    }
    const contrast = (bg: string): number => {
      const l = luminance(bg)
      return (1.0 + 0.05) / (l + 0.05)
    }
    for (const placeValue of Object.values(PLACE_VALUES)) {
      const paint = CARD_PAINT[placeValue]
      expect(contrast(paint.from)).toBeGreaterThanOrEqual(4.5)
      expect(contrast(paint.to)).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('defines the shared card paint treatment from the approved prototype', () => {
    expect(CARD_PAINT_STYLE.borderRadius).toBe('16px')
    expect(CARD_PAINT_STYLE.boxShadow).toContain('inset 0 -4px 0')
    expect(CARD_PAINT_STYLE.textShadow).toBeTruthy()
  })
})

describe('game limits', () => {
  it('caps input at one billion', () => {
    expect(MAX_NUMBER).toBe(1_000_000_000)
  })

  it('defaults random rolls to one million', () => {
    expect(DEFAULT_MAX_RANDOM_NUMBER).toBe(1_000_000)
  })
})

describe('ui constants', () => {
  it('defines card layout offsets', () => {
    expect(CARD_Y_OFFSET).toBe(0)
  })

  it('defines the mobile breakpoint', () => {
    expect(MOBILE_WIDTH).toBe(768)
  })

  it('gives the first-time toast a 12-second duration', () => {
    expect(FIRST_TIME_TOAST_DURATION).toBe(12000)
  })

  it('prefixes localStorage keys to avoid collisions', () => {
    for (const key of Object.values(LOCAL_STORAGE_KEYS)) {
      expect(key.startsWith('hzc-')).toBe(true)
    }
  })
})

describe('enums', () => {
  it('defines the random number types', () => {
    expect(RANDOM_NUMBER_TYPE.BASIC).toBe('basic')
    expect(RANDOM_NUMBER_TYPE.ZERO_FOCUS).toBe('zero-focus')
  })

  it('defines the number forms dialog tabs', () => {
    expect(NumberFormsDialogTab.WORD).toBe('word')
    expect(NumberFormsDialogTab.STANDARD).toBe('standard')
    expect(NumberFormsDialogTab.UNIT).toBe('unit')
    expect(NumberFormsDialogTab.EXPANDED).toBe('expanded')
  })

  it('defines the instructional guide dialog tabs', () => {
    expect(InstructionalGuideDialogTab.QUICK_START).toBe('quick-start')
    expect(InstructionalGuideDialogTab.ACTIVITIES).toBe('activities')
    expect(InstructionalGuideDialogTab.ASSESSMENT).toBe('assessment')
  })
})
