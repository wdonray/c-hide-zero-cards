import { useDraggable } from '@/lib/useDraggable'
import { CARD_COLORS, CARD_Y_OFFSET } from '@/lib/constants'
import type { ScatterArea } from '@/lib/useHeaderContext'
import { getCardXOffset, getMobileCardMetrics } from '@/lib/cardLayout'
import { useIsMobile } from '@/lib/useIsMobile'
import { useCallback, useMemo, useState } from 'react'

interface DraggableCardProps {
  firstDigit: number
  placeValue: number
  index: number
  totalCards: number
  resetTrigger?: number
  randomizeTrigger?: number
  scatterArea?: ScatterArea | null
  fakeNumbers: string | null
}

export function DraggableCard({
  firstDigit,
  placeValue,
  index,
  totalCards,
  resetTrigger,
  randomizeTrigger,
  scatterArea,
  fakeNumbers,
}: DraggableCardProps) {
  const isMobile = useIsMobile()
  // Below the mobile breakpoint the cards are the hero: they grow to fill
  // the viewport (fewer digits = bigger cards) while the fan keeps the exact
  // desktop peeking character via a proportional offset. Desktop keeps the
  // fixed 36px fan at text-6xl.
  const mobileMetrics = useMemo(
    () => (isMobile && typeof window !== 'undefined' ? getMobileCardMetrics(totalCards, window.innerWidth) : null),
    [isMobile, totalCards]
  )
  const xOffset = useMemo(
    () =>
      mobileMetrics?.xOffset ??
      getCardXOffset(totalCards, isMobile && typeof window !== 'undefined' ? window.innerWidth : Infinity),
    [isMobile, mobileMetrics, totalCards]
  )
  const useDraggableProps = useMemo(
    () => ({
      initialX: index * xOffset,
      initialY: index * CARD_Y_OFFSET,
      resetTrigger,
      randomizeTrigger,
      scatterArea,
    }),
    [index, xOffset, resetTrigger, randomizeTrigger, scatterArea]
  )

  const cardColor = useCallback((placeValue: number) => CARD_COLORS[placeValue], [])
  // The card element, mirrored into state via callback ref so the hook can
  // measure it at scatter time without reading a ref during render.
  const [cardEl, setCardEl] = useState<HTMLDivElement | null>(null)
  const { position, dragRef, handlers } = useDraggable({ ...useDraggableProps, cardEl })
  const setRefs = useCallback(
    (el: HTMLDivElement | null) => {
      dragRef.current = el
      setCardEl(el)
    },
    [dragRef]
  )

  const displayValue = fakeNumbers !== null ? fakeNumbers : (firstDigit * placeValue).toLocaleString()

  return (
    <div
      ref={setRefs}
      tabIndex={0}
      aria-label={`${displayValue} place value card. Use arrow keys to move it.`}
      className={`flex items-center justify-center gap-0 px-1 md:px-2 py-4 md:py-10 text-lg md:text-6xl font-bold cursor-move select-none tracking-[10px] md:tracking-[20px] tabular-nums text-white ${cardColor(placeValue)}`}
      style={{
        position: 'absolute',
        transform: `translate(${position.x}px, ${position.y}px)`,
        userSelect: 'none',
        touchAction: 'none',
        zIndex: totalCards + index,
        // Mobile hero sizing: font size, tracking, and padding scale with the
        // adaptive metrics; the Tailwind text-lg/tracking classes above apply
        // only when no metrics are present (desktop / SSR).
        ...(mobileMetrics
          ? {
              fontSize: `${mobileMetrics.fontSize}px`,
              letterSpacing: `${Math.round(mobileMetrics.fontSize * 0.3)}px`,
              padding: `${Math.round(mobileMetrics.fontSize * 0.35)}px ${Math.round(mobileMetrics.fontSize * 0.15)}px`,
            }
          : {}),
      }}
      {...handlers}
    >
      {fakeNumbers !== null ? <div>{fakeNumbers}</div> : <div>{(firstDigit * placeValue).toLocaleString()}</div>}
    </div>
  )
}
