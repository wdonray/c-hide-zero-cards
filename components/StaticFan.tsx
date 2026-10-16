'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { CARD_PAINT, CARD_PAINT_STYLE } from '@/lib/constants'
import { estimatePeekWidthPx, formatCardValue, getRightAlignedFanPositions, peekCharCount } from '@/lib/cardLayout'

/**
 * Static, non-interactive rendering of the card fan for the /about page.
 * Ports the real fan: the exact card visual from DraggableCard (paint,
 * typography, letter-spacing) and the real measured layout math from
 * HomePageClient (natural widths via scrollWidth, right-aligned positions
 * via getRightAlignedFanPositions). No drag, no keyboard, no interactivity:
 * it is a decorative illustration (aria-hidden).
 */
const CARDS = [
  { firstDigit: 3, placeValue: 1000 },
  { firstDigit: 7, placeValue: 100 },
  { firstDigit: 4, placeValue: 10 },
  { firstDigit: 3, placeValue: 1 },
]

export function StaticFan() {
  const fanRef = useRef<HTMLDivElement>(null)
  const [positions, setPositions] = useState<number[] | null>(null)
  const [extent, setExtent] = useState<number>(0)
  const [height, setHeight] = useState<number>(0)

  useLayoutEffect(() => {
    const fanEl = fanRef.current
    if (!fanEl) return

    const measure = () => {
      const children = Array.from(fanEl.children) as HTMLElement[]
      if (children.length !== CARDS.length) return
      const naturals = children.map((child) => child.scrollWidth)
      const fontSize = parseFloat(getComputedStyle(children[0]).fontSize) || 60
      // Mirror HomePageClient's peek estimation (desktop metrics; the
      // Tailwind classes below render text-lg/tracking-[10px] below md
      // and text-6xl/tracking-[20px] at md+, so derive from computed style).
      const letterSpacing = parseFloat(getComputedStyle(children[0]).letterSpacing) || 20
      const padLeft = parseFloat(getComputedStyle(children[0]).paddingLeft) || 8
      const desiredPeeks = CARDS.slice(0, -1).map((card) =>
        estimatePeekWidthPx(peekCharCount(card.placeValue), fontSize, padLeft, letterSpacing)
      )
      setPositions(getRightAlignedFanPositions(naturals, desiredPeeks))
      setExtent(Math.max(...naturals))
      setHeight(Math.max(...children.map((child) => child.offsetHeight)))
    }

    measure()
    let rafId = 0
    let cancelled = false
    if (document.fonts) {
      document.fonts.ready
        .then(() => {
          if (!cancelled) rafId = requestAnimationFrame(() => !cancelled && measure())
        })
        .catch(() => {})
    }
    window.addEventListener('resize', measure)
    return () => {
      cancelled = true
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('resize', measure)
    }
  }, [])

  return (
    <div className="flex items-center justify-center overflow-hidden py-6" aria-hidden="true">
      <div
        ref={fanRef}
        className="relative shrink-0"
        style={positions ? { width: extent, height, overflowX: 'visible' } : { visibility: 'hidden' }}
      >
        {CARDS.map((card, i) => {
          const paint = CARD_PAINT[card.placeValue]
          return (
            <div
              key={`${card.firstDigit}-${card.placeValue}`}
              className="flex items-center justify-start gap-0 px-1 md:px-2 py-4 md:py-10 text-lg md:text-6xl font-bold select-none tracking-[10px] md:tracking-[20px] tabular-nums text-white"
              style={{
                position: 'absolute',
                background: `linear-gradient(180deg, ${paint.from} 0%, ${paint.to} 100%)`,
                borderRadius: CARD_PAINT_STYLE.borderRadius,
                boxShadow: CARD_PAINT_STYLE.boxShadow,
                textShadow: CARD_PAINT_STYLE.textShadow,
                left: 0,
                transform: `translate(${positions ? positions[i] : 0}px, 0px)`,
                userSelect: 'none',
                zIndex: CARDS.length + i,
              }}
            >
              {formatCardValue(card.firstDigit, card.placeValue)}
            </div>
          )
        })}
      </div>
    </div>
  )
}
