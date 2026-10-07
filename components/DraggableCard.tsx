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
  /** Fan x offset for this card: the cumulative peek width of the previous cards plus gaps. */
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
   * Width of the peek text (first digit, plus comma for group-final cards),
   * measured by the parent with a Range over the rendered text. The parent
   * passes this ONLY when the next card is hidden: at fan home the inner
   * text is then clipped to the peek width via clip-path (which, unlike a
   * width+overflow clip, does not shrink the card's box, so the card keeps
   * its full natural width and true overlap is preserved).
   *
   * The peek itself is NEVER faked: it is real overlap (the next card
   * covers the rest). This is purely a backstop so a card never leaks text
   * through a hidden card's gap: a visibility:hidden zero card paints
   * nothing, so without it the previous card's trailing "0,000" would show
   * through. In every other case the full text paints and the next card
   * covers it, so pulling a covering card away uncovers the full value.
   * Undefined until the parent has measured the fan, or when unneeded.
   */
  textClipWidth?: number
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
  textClipWidth,
  hiddenZero,
  resetTrigger,
  randomizeTrigger,
  scatterArea,
}: DraggableCardProps) {
  const useDraggableProps = useMemo(
    () => ({
      // The fan is overlapping tiles: card i sits at the cumulative peek
      // width of the previous cards, and z-index rises left-to-right, so
      // each card covers the previous card's text past its peek. The
      // parent measures the peeks and centers the fan wrapper, so the
      // visible fan is centered.
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

  // Every card always renders its full place value ("100,000", "80,000",
  // "0,000", "700", "30", "6"): no peeks, no clipping. At fan home the
  // next card overlaps and covers everything past this card's peek, so
  // the visible strip reads as the peek ("3,") while the full text
  // ("3,000") waits underneath. Pulling the tile out uncovers it. A zero
  // card shows the place value with a leading zero so it stays parallel
  // to its siblings instead of a bare "0".
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
      className={`flex items-center justify-start gap-0 rounded-xl px-1 md:px-2 py-4 md:py-10 text-lg md:text-6xl font-bold cursor-move select-none tracking-[10px] md:tracking-[20px] tabular-nums text-white shadow-md ${cardColor(placeValue)}`}
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
      {/* At fan home the text is clipped to the peek width ONLY when the
          next card is hidden (see textClipWidth): a visibility:hidden card
          paints nothing, so without the clip the previous card's trailing
          text would leak through its gap. clip-path does not affect layout,
          so the card keeps its full natural width and the peek stays real
          overlap. scrollWidth still reports the full text width, so the
          parent's measurement is unaffected. Displaced cards show their
          full text unclipped, and uncovering a card (dragging the cover
          away) reveals its full text. */}
      <div
        style={
          atFanHome && textClipWidth !== undefined
            ? { clipPath: `inset(0 calc(100% - ${textClipWidth}px) 0 0)` }
            : undefined
        }
      >
        {displayValue}
      </div>
    </div>
  )
}
