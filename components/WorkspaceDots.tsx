'use client'

import { useEffect, useState } from 'react'
import { measureScatterArea, type ScatterArea } from '@/lib/scatterArea'

/**
 * Dot texture covering the full card scatter area (the same region Mix
 * scatters into and cards can be dragged through). Positioned from the
 * live-measured scatter rect so the texture always matches the draggable
 * region on any screen size. The dot color is theme-aware via
 * --workspace-dot-color. Pointer-events-none and z-0 so it never
 * interferes with cards or chrome.
 */
export function WorkspaceDots() {
  const [area, setArea] = useState<ScatterArea | null>(null)

  useEffect(() => {
    const update = () => setArea(measureScatterArea())
    update()
    window.addEventListener('resize', update)
    // Header collapse and font loading change layout without a resize.
    const observer = new ResizeObserver(update)
    observer.observe(document.documentElement)
    return () => {
      window.removeEventListener('resize', update)
      observer.disconnect()
    }
  }, [])

  if (!area) return null

  return (
    <div
      aria-hidden="true"
      className="workspace-dots pointer-events-none fixed z-0"
      style={{
        left: area.x,
        top: area.y,
        width: area.width,
        height: area.height,
      }}
    />
  )
}
