import { useDraggable } from '@/lib/useDraggable'
import { CARD_COLORS, CARD_Y_OFFSET } from '@/lib/constants'
import type { ScatterArea } from '@/lib/useHeaderContext'
import type { MobileCardMetrics } from '@/lib/cardLayout'
import { formatCardValue } from '@/lib/cardLayout'
import { useCallback, useMemo, useState } from 'react'

interface DraggableCardProps {
  firstDigit: number
  placeValue: number
  index: number
  totalCards: number
  /** Fan x offset for this card: the cumulative width of the previous cards plus gaps. */
  fanX: number
  /** Adaptive mobile metrics for this fan, computed by the parent (null on desktop). */
  mobileMetrics: MobileCardMetrics | null
  /**
   * The card's content-driven natural width, measured by the parent from the
   * text itself. The Mix scatter clamp uses it so the full card stays inside
   * the scatter area. Undefined until measured.
   */
  naturalWidth?: number
  /**
   * A zero card hidden by the "hide zeros" toggle. The whole card is
   * invisible (visibility:hidden), so a hidden zero card reads as a gap
   * in the fan: nothing gives away which cards are zero. The card keeps
   * its position and size, so the fan's place-value structure is
   * preserved and toggling never shifts the layout.
   */
  hiddenZero: boolean
  resetTrigger?: number
  randomizeTrigger?: number
  scatterArea?: ScatterArea | null
}

export function DraggableCard({
  firstDigit,
  placeValue,
  index,
  totalCards,
  fanX,
  mobileMetrics,
  naturalWidth,
  hiddenZero,
  resetTrigger,
  randomizeTrigger,
  scatterArea,
}: DraggableCardProps) {
  const useDraggableProps = useMemo(
    () => ({
      // The fan is a sequential strip: card i sits at the cumulative width
      // of the previous cards. The parent measures the cards and centers
      // the fan wrapper, so the visible fan is centered.
      initialX: fanX,
      initialY: index * CARD_Y_OFFSET,
      // Stable per-card discriminator for the Mix scatter PRNG: the index
      // alone is stable across renders, so the scatter pattern never
      // reshuffles under a layout change (see useDraggable).
      scatterSeed: index,
      resetTrigger,
      randomizeTrigger,
      scatterArea,
      // Mix scatter clamps with the natural width so the full card stays
      // inside the scatter area.
      naturalCardWidth: naturalWidth,
    }),
    [index, fanX, resetTrigger, randomizeTrigger, scatterArea, naturalWidth]
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

  // Every card always shows its full place value ("100,000", "80,000",
  // "0,000", "700", "30", "6"): no peeks, no reveal-on-drag. A zero card
  // shows the place value with a leading zero so it stays parallel to its
  // siblings instead of a bare "0".
  const displayValue = formatCardValue(firstDigit, placeValue)

  const isDisplaced = position.x !== fanX || position.y !== index * CARD_Y_OFFSET
  const atFanHome = !isDisplaced

  // A zero card is hidden only at fan home. Once displaced (dragged, Mix-
  // scattered, keyboard-moved), it is revealed immediately: the user moved
  // it to inspect it, so it must show its value. Only cards whose first
  // digit is zero are ever hidden; a card like "50" (first digit 5) is
  // never hidden.
  const isHidden = hiddenZero && atFanHome

  return (
    <div
      ref={setRefs}
      tabIndex={isHidden ? undefined : 0}
      aria-hidden={isHidden || undefined}
      aria-label={`${displayValue} place value card. Use arrow keys to move it.`}
      className={`flex items-center justify-start gap-0 px-1 md:px-2 py-4 md:py-10 text-lg md:text-6xl font-bold cursor-move select-none tracking-[10px] md:tracking-[20px] tabular-nums text-white ${cardColor(placeValue)}`}
      style={{
        position: 'absolute',
        // Cards anchor on the fan wrapper's left edge at their cumulative
        // offset (fanX); the parent centers the wrapper, so the visible
        // fan is centered.
        left: 0,
        transform: `translate(${position.x}px, ${position.y}px)`,
        userSelect: 'none',
        touchAction: 'none',
        zIndex: totalCards + index,
        // Hide zeros: the whole card is invisible (not just its number),
        // so a hidden zero card reads as a gap in the fan and nothing
        // gives away which cards are zero. visibility:hidden keeps the
        // card in flow and measurable, so the fan layout never shifts when
        // toggling. Displaced cards are never hidden: moving a card
        // reveals it immediately.
        ...(isHidden ? { visibility: 'hidden' as const } : {}),
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
      {displayValue}
    </div>
  )
}
