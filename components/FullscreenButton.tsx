'use client'

import { useState, useEffect } from 'react'
import { Maximize, Minimize } from 'lucide-react'

export function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen()
      }
    } catch {
      // Fullscreen API not supported or denied; silently ignore
    }
  }

  return (
    <button
      onClick={toggleFullscreen}
      title={isFullscreen ? 'Exit full screen' : 'Full screen'}
      aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
      className="inline-flex h-[42px] items-center gap-2 rounded-full border-2 border-[#2B2118] bg-white px-[18px] text-[15px] font-semibold text-[#2B2118] transition-all hover:-translate-y-px active:translate-y-[2px]"
      style={{
        fontFamily: 'var(--font-baloo), system-ui, sans-serif',
        boxShadow: '0 3px 0 rgba(43, 33, 24, 0.15)',
      }}
    >
      {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
      <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Full screen'}</span>
    </button>
  )
}
