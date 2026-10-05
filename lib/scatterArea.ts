/**
 * The Mix scatter region: the full visible strip between the bottom of the
 * sticky header (app header + toolbar) and the top of the footer (desktop)
 * or the bottom action bar (mobile), full viewport width. Measured live from
 * the DOM at Mix press time (and re-measured on re-scatter), so the scatter
 * tracks the real layout on any screen size instead of a fixed box.
 */

/** Bounding rect of the scatter region in viewport coordinates. */
export interface ScatterArea {
  x: number
  y: number
  width: number
  height: number
}

/** Stable ids on the sticky chrome framing the card area. */
export const APP_HEADER_ID = 'app-header'
export const APP_TOOLBAR_ID = 'app-toolbar'
export const APP_FOOTER_ID = 'app-footer'
export const MOBILE_ACTION_BAR_ID = 'mobile-action-bar'

/**
 * Measure the scatter region from the visible chrome. The header side takes
 * the lowest visible bottom of the app header and toolbar (the toolbar
 * unmounts on mobile; a collapsed header measures zero height and drops
 * out); the footer side takes the highest visible top of the footer
 * (desktop; display:none on mobile) and the mobile action bar (unmounted on
 * desktop). Returns null when the region cannot be measured (SSR, or no
 * visible chrome).
 */
export function measureScatterArea(): ScatterArea | null {
  if (typeof document === 'undefined' || typeof window === 'undefined') return null
  const rectOf = (id: string): DOMRect | null => {
    const el = document.getElementById(id)
    if (!el) return null
    const rect = el.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0 ? rect : null
  }
  const topRects = [rectOf(APP_HEADER_ID), rectOf(APP_TOOLBAR_ID)].filter((rect): rect is DOMRect => rect !== null)
  const bottomRects = [rectOf(APP_FOOTER_ID), rectOf(MOBILE_ACTION_BAR_ID)].filter(
    (rect): rect is DOMRect => rect !== null
  )
  if (topRects.length === 0 || bottomRects.length === 0) return null
  const y = Math.max(...topRects.map((rect) => rect.bottom))
  const bottom = Math.min(...bottomRects.map((rect) => rect.top))
  const height = bottom - y
  const width = window.innerWidth
  if (height <= 0 || width <= 0) return null
  return { x: 0, y, width, height }
}
