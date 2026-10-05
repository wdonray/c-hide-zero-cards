'use client'

import { useEffect } from 'react'

/**
 * The root layout locks document scrolling (`overflow-hidden` on <html>) so
 * the card workspace never rubber-bands while dragging. Pages whose content
 * is taller than the viewport (like /version) render this component to opt
 * out of the lock while mounted; the lock is restored on unmount so the
 * classroom page keeps its exact current behavior.
 */
export default function EnablePageScroll() {
  useEffect(() => {
    const root = document.documentElement
    const hadLock = root.classList.contains('overflow-hidden')
    if (hadLock) root.classList.remove('overflow-hidden')
    return () => {
      if (hadLock) root.classList.add('overflow-hidden')
    }
  }, [])

  return null
}
