import { describe, expect, it } from 'vitest'
import {
  CARD_COLORS,
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

  it('gives every place value a name and a card color', () => {
    for (const placeValue of Object.values(PLACE_VALUES)) {
      expect(PLACE_VALUE_NAMES[placeValue]).toBeTruthy()
      expect(CARD_COLORS[placeValue]).toMatch(/^bg-(red|yellow|green|blue)-\d{3}$/)
    }
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
