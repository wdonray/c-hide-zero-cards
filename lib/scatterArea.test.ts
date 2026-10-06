import { describe, expect, it, vi, afterEach } from 'vitest'
import {
  measureScatterArea,
  APP_HEADER_ID,
  APP_TOOLBAR_ID,
  NUMBER_INPUT_ID,
  APP_FOOTER_ID,
  MOBILE_ACTION_BAR_ID,
} from './scatterArea'

function domRect(x: number, y: number, width: number, height: number): DOMRect {
  return { x, y, width, height, top: y, left: x, right: x + width, bottom: y + height, toJSON: () => {} } as DOMRect
}

function stubChrome(rects: Partial<Record<string, DOMRect>>) {
  vi.spyOn(document, 'getElementById').mockImplementation((id: string) => {
    const rect = rects[id]
    if (!rect) return null
    return { getBoundingClientRect: () => rect } as unknown as HTMLElement
  })
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('measureScatterArea', () => {
  it('measures the desktop strip: header + toolbar + input bottom to footer top', () => {
    stubChrome({
      [APP_HEADER_ID]: domRect(0, 0, 1024, 56),
      [APP_TOOLBAR_ID]: domRect(0, 56, 1024, 48),
      [NUMBER_INPUT_ID]: domRect(0, 120, 1024, 64),
      [APP_FOOTER_ID]: domRect(0, 700, 1024, 56),
    })
    expect(measureScatterArea()).toEqual({ x: 0, y: 184, width: 1024, height: 516 })
  })

  it('measures the mobile strip: input bottom to action bar top', () => {
    // Toolbar unmounts on mobile (missing); the footer is display:none
    // (zero-size rect on an existing element) and must drop out.
    // The number input sits below the header and bounds the scatter top.
    stubChrome({
      [APP_HEADER_ID]: domRect(0, 0, 375, 56),
      [NUMBER_INPUT_ID]: domRect(16, 72, 343, 56),
      [APP_FOOTER_ID]: domRect(0, 0, 0, 0),
      [MOBILE_ACTION_BAR_ID]: domRect(0, 594, 375, 73),
    })
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(375)
    expect(measureScatterArea()).toEqual({ x: 0, y: 128, width: 375, height: 466 })
  })

  it('returns null when no top chrome is measurable', () => {
    stubChrome({ [APP_FOOTER_ID]: domRect(0, 700, 1024, 56) })
    expect(measureScatterArea()).toBeNull()
  })

  it('returns null when no bottom chrome is measurable', () => {
    stubChrome({ [APP_HEADER_ID]: domRect(0, 0, 1024, 56) })
    expect(measureScatterArea()).toBeNull()
  })

  it('returns null when the footer overlaps the header (degenerate region)', () => {
    stubChrome({
      [APP_HEADER_ID]: domRect(0, 0, 1024, 200),
      [APP_FOOTER_ID]: domRect(0, 100, 1024, 56),
    })
    expect(measureScatterArea()).toBeNull()
  })

  it('returns null when the document is unavailable (SSR)', () => {
    vi.stubGlobal('document', undefined)
    expect(measureScatterArea()).toBeNull()
  })

  it('returns null when the window is unavailable (SSR)', () => {
    vi.stubGlobal('window', undefined)
    expect(measureScatterArea()).toBeNull()
  })
})
