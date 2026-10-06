'use client'

import { Suspense, useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Fires one page-view hit per page per browsing session. Rendered once in
 * the root layout; invisible.
 */
function TrackerInner() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return
    const key = `hzc:${pathname}`
    try {
      if (sessionStorage.getItem(key)) return
      // Set the flag before sending so StrictMode double-effects don't
      // double-count in development.
      sessionStorage.setItem(key, '1')
    } catch {
      return
    }

    const payload = JSON.stringify({ path: pathname })
    // sendBeacon is the most reliable way to get the hit out; fall back
    // to fetch with keepalive.
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const blob = new Blob([payload], { type: 'application/json' })
      if (navigator.sendBeacon('/api/track', blob)) return
    }
    void fetch('/api/track', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {})
  }, [pathname])

  return null
}

export default function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerInner />
    </Suspense>
  )
}
