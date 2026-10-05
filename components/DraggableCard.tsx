import { useDraggable } from '@/lib/useDraggable'
import { CARD_COLORS, CARD_Y_OFFSET } from '@/lib/constants'
import type { ScatterArea } from '@/lib/useHeaderContext'
import type { MobileCardMetrics } from '@/lib/cardLayout'
import { useCallback, useMemo, useState } from 'react'

interface DraggableCardProps {
  firstDigit: number
  placeValue: number
  index: number
  totalCards: number
  /** Fan offset for this fan, computed by the parent (it also sizes the fan wrapper). */
  xOffset: number
  /** Adaptive mobile metrics for this fan, computed by the parent (null on desktop). */
  mobileMetrics: MobileCardMetrics | null
  /**
   * Explicit card width so the fan's right edge is flush: extent - index *
   * xOffset. Without it, the wide back cards ("900,000") extend past the
   * narrower cards stacked on top and their trailing zeros peek out on the
   * right. Undefined until the parent has measured the fan.
   */
  fanWidth?: number
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
  xOffset,
  mobileMetrics,
  fanWidth,
  resetTrigger,
  randomizeTrigger,
  scatterArea,
  fakeNumbers,
}: DraggableCardProps) {
  const useDraggableProps = useMemo(
    () => ({
      // The fan anchors on evenly spaced LEFT edges (index * xOffset), not
      // on card centers: card widths vary with place value ("900,000" vs
      // "4"), and center anchoring made the back cards' peeks far wider
      // than one offset (a "40" double peek) and the visible fan lopsided.
      // Even left edges keep every peek exactly one xOffset wide; the
      // parent sizes the fan wrapper to the measured extent and centers it,
      // so the visible fan is centered too.
      initialX: index * xOffset,
      initialY: index * CARD_Y_OFFSET,
      // Stable Mix seed on the original fan formula (see useDraggable).
      scatterSeed: index * xOffset,
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
        // Cards anchor on the fan wrapper's left edge: the parent spaces
        // left edges evenly (index * xOffset) and centers the wrapper, so
        // every peek is exactly one offset wide and the visible fan is
        // centered regardless of per-card content widths.
        left: 0,
        transform: `translate(${position.x}px, ${position.y}px)`,
        userSelect: 'none',
        touchAction: 'none',
        zIndex: totalCards + index,
        // Flush right edge (see fanWidth): assigned by the parent from the
        // measured fan extent.
        ...(fanWidth !== undefined ? { width: fanWidth } : {}),
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
