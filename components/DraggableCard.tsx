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
  /** Fan x position for this card, computed by the parent (it also sizes the fan wrapper). */
  fanX: number
  /** Adaptive mobile metrics for this fan, computed by the parent (null on desktop). */
  mobileMetrics: MobileCardMetrics | null
  /**
   * Explicit card width so the fan's right edge is flush: extent - fanX.
   * Text is left-aligned with overflow hidden, so the leading digit sits
   * at the left padding (visible in every peek) and the rest clips.
   * Undefined until the parent has measured the fan.
   */
  fanWidth?: number
  /**
   * The card's content-driven natural width, measured by the parent from the
   * text itself. A card away from its fan home (dragged, Mix-scattered,
   * keyboard-moved) renders at this width with visible overflow so the full
   * place value ("700,000") shows, and the Mix scatter clamp uses it so the
   * full card stays inside the scatter area. Undefined until measured.
   */
  naturalWidth?: number
  /**
   * A zero card whose text is hidden (the "hide zeros" toggle is on). The
   * card keeps its color, position, size, and draggability; only its text
   * is invisible, so the fan's place-value structure is preserved and
   * toggling never shifts the layout.
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
  fanWidth,
  naturalWidth,
  hiddenZero,
  resetTrigger,
  randomizeTrigger,
  scatterArea,
}: DraggableCardProps) {
  const useDraggableProps = useMemo(
    () => ({
      // The fan anchors on cumulative peek widths (fanX): each card's peek
      // fits one full digit, so the leading digit is never clipped. The
      // parent measures the peeks and centers the fan wrapper, so the
      // visible fan is centered regardless of per-card content widths.
      initialX: fanX,
      initialY: index * CARD_Y_OFFSET,
      // Stable per-card discriminator for the Mix scatter PRNG: the index
      // alone is stable across renders, so the scatter pattern never
      // reshuffles under a layout change (see useDraggable).
      scatterSeed: index,
      resetTrigger,
      randomizeTrigger,
      scatterArea,
      // Mix scatter clamps with the natural width: at fan home the card
      // renders at its narrower assigned width, but scattered cards show
      // their full text.
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

  // A zero card's value is 0 and it displays "0" (no fake zero numbers).
  const displayValue = (firstDigit * placeValue).toLocaleString()

  // A card away from its fan home (dragged, dropped, Mix-scattered,
  // keyboard-moved) renders at its natural width with visible overflow so
  // the full place value shows. At home it keeps the assigned fan width
  // with overflow hidden: left-aligned text puts the leading digit at the
  // left padding, visible in every peek, and the right edge stays flush.
  const isDisplaced = position.x !== fanX || position.y !== index * CARD_Y_OFFSET
  const atFanHome = fanWidth !== undefined && !isDisplaced

  return (
    <div
      ref={setRefs}
      tabIndex={0}
      aria-label={
        hiddenZero
          ? 'Hidden zero place value card. Use arrow keys to move it.'
          : `${displayValue} place value card. Use arrow keys to move it.`
      }
      className={`flex items-center justify-start gap-0 ${atFanHome ? 'overflow-hidden' : ''} px-1 md:px-2 py-4 md:py-10 text-lg md:text-6xl font-bold cursor-move select-none tracking-[10px] md:tracking-[20px] tabular-nums text-white ${cardColor(placeValue)}`}
      style={{
        position: 'absolute',
        // Cards anchor on the fan wrapper's left edge at their cumulative
        // peek offset (fanX); the parent centers the wrapper, so the
        // visible fan is centered regardless of per-card content widths.
        left: 0,
        transform: `translate(${position.x}px, ${position.y}px)`,
        userSelect: 'none',
        touchAction: 'none',
        zIndex: totalCards + index,
        // Flush right edge at fan home (see fanWidth): assigned by the
        // parent from the measured fan extent. Displaced cards (and the
        // pre-measurement first paint) shrink-wrap their full text.
        ...(atFanHome ? { width: fanWidth } : {}),
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
      {/* visibility:hidden keeps layout (and measurement) intact while
          hiding the text: a hidden zero card keeps its position so the
          fan never shifts when toggling. */}
      <div style={hiddenZero ? { visibility: 'hidden' } : undefined}>{displayValue}</div>
    </div>
  )
}
