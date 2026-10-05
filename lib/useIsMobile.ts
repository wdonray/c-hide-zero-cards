import { useSyncExternalStore } from 'react'
import { MOBILE_WIDTH } from './constants'

const QUERY = `(max-width: ${MOBILE_WIDTH - 1}px)`

function hasMatchMedia() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
}

function subscribe(onChange: () => void) {
  if (!hasMatchMedia()) return () => {}
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

function getSnapshot() {
  if (!hasMatchMedia()) return false
  return window.matchMedia(QUERY).matches
}

// Used for the server render (and any environment without matchMedia):
// assume non-mobile so the server HTML matches the first client render
// and hydration stays clean. After hydration the real value applies.
function getServerSnapshot() {
  return false
}

/**
 * True when the viewport is below the mobile breakpoint (< 768px).
 * SSR-safe via the sanctioned useSyncExternalStore pattern: the server
 * renders non-mobile, the client re-renders with the real value after
 * hydration (no hydration errors).
 */
export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
