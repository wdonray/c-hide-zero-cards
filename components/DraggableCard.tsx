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
   * Width available for this card's text: the first character's rendered
   * width (no padding). The inner text wrapper starts after the card's
   * left padding, so this excludes padLeft. The text is clipped to this
   * width so visible peeks never depend on the next card occluding them;
   * that keeps hidden cards (which paint nothing) from leaking the text
   * of the cards beneath. Undefined until the parent has measured the fan.
   */
  textClipWidth?: number
  /**
   * A zero card hidden by the "hide zeros" toggle. The whole card is
   * invisible (visibility:hidden), so a hidden zero card reads as a gap
   * in the fan: nothing gives away which cards are zero. The card keeps
   * its position, size, and measurability, so the fan's place-value
   * structure is preserved and toggling never shifts the layout. Text
   * clipping (see textClipWidth) means hidden cards never leak the text
   * of the cards beneath them.
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
  textClipWidth,
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
        // Hide zeros: the whole card is invisible (not just its number),
        // so a hidden zero card reads as a gap in the fan and nothing
        // gives away which cards are zero. visibility:hidden keeps the
        // card in flow and measurable (scrollWidth and Range measurements
        // are unaffected), so the fan's cumulative peek layout never
        // shifts when toggling. The text is clipped to the peek (see the
        // inner wrapper), so a hidden card never leaks the text of the
        // cards beneath it. Displaced cards are never hidden: moving a
        // card reveals it immediately.
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
      {/* The text is clipped to the peek width at fan home, so a peek
          never depends on the next card occluding it: hidden cards (which
          paint nothing) cannot leak the text of the cards beneath them.
          scrollWidth still reports the full text width, so the parent's
          measurement is unaffected. Displaced cards show their full text
          unclipped. */}
      <div
        style={
          atFanHome && textClipWidth !== undefined
            ? { width: textClipWidth, overflow: 'hidden', flexShrink: 0 }
            : undefined
        }
      >
        {displayValue}
      </div>
    </div>
  )
}
