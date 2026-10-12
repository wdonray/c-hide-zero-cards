'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useHeaderContext } from '@/lib/useHeaderContext'

const PARTICLE_COLORS = ['#E76F51', '#F4A261', '#A16207', '#DC2626', '#2563EB', '#16A34A']
const PARTICLE_COUNT = 14

interface Particle {
  id: number
  color: string
  size: number
  dx: string
  dy: string
  rot: string
  left: string
}

/**
 * Hide-zeros micro-celebration confetti (kids redesign): a small burst of
 * coral/card-colored particles when zero cards are hidden. Fires on the
 * hide action only (not on show). Respects prefers-reduced-motion.
 * Transform/opacity only; the container is pointer-events-none and fixed
 * so it never affects layout.
 */
export function ZeroConfetti() {
  const { zeroCelebrationKey, showZeroCards } = useHeaderContext()
  const [burstKey, setBurstKey] = useState(0)
  const prevKeyRef = useRef(zeroCelebrationKey)
  const prevShowRef = useRef(showZeroCards)

  useEffect(() => {
    if (prevKeyRef.current === zeroCelebrationKey) return
    const wasShowing = prevShowRef.current
    prevKeyRef.current = zeroCelebrationKey
    prevShowRef.current = showZeroCards
    // Celebrate the hide action (zeros were showing, now hidden).
    if (wasShowing && !showZeroCards) {
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      setBurstKey((k) => k + 1)
    }
  }, [zeroCelebrationKey, showZeroCards])

  const particles = useMemo<Particle[]>(() => {
    if (burstKey === 0) return []
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.5
      const distance = 60 + Math.random() * 80
      return {
        id: i,
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        size: 6 + Math.random() * 6,
        dx: `${Math.cos(angle) * distance}px`,
        dy: `${Math.sin(angle) * distance * 0.6 + 60}px`,
        rot: `${(Math.random() - 0.5) * 540}deg`,
        left: `${45 + Math.random() * 10}%`,
      }
    })
  }, [burstKey])

  if (burstKey === 0) return null

  return (
    <div key={burstKey} aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-[25%] z-50 h-0">
      {particles.map((p) => (
        <span
          key={`${burstKey}-${p.id}`}
          className="hzc-confetti-particle absolute rounded-sm"
          style={
            {
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size * 0.6}px`,
              backgroundColor: p.color,
              '--hzc-dx': p.dx,
              '--hzc-dy': p.dy,
              '--hzc-rot': p.rot,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
