'use client'

import { useLayoutEffect, useMemo, useEffect, useRef, useState } from 'react'
import { NumberInput } from '@/components/NumberInput'
import { DraggableCard } from '@/components/DraggableCard'
import {
  PLACE_VALUES,
  LOCAL_STORAGE_KEYS,
  FIRST_TIME_TOAST_DURATION,
  FIRST_TIME_TOAST_STYLE,
  NumberFormsDialogTab,
} from '@/lib/constants'
import { getFanExtent, getFanPositions, getMobileCardMetrics, scaleFontSizeToFit } from '@/lib/cardLayout'
import { useHeaderContext } from '@/lib/useHeaderContext'
import { useIsMobile } from '@/lib/useIsMobile'
import { NumberFormsDialog } from '@/components/NumberFormsDialog'
import { ZeroStateIndicator } from '@/components/ZeroStateIndicator'
// import { BuyMeACoffeeWidget } from '@/components/BuyMeACoffeeWidget'
import { toast } from 'sonner'
import { FirstTimeToast } from '@/components/FirstTimeToast'

/** A fan item: a place-value card, or a thousands-separator comma. */
type FanItem = { kind: 'card'; cardIndex: number } | { kind: 'comma' }

export function HomePageClient() {
  const {
    inputNumber,
    setInputNumber,
    resetTrigger,
    randomizeTrigger,
    scatterArea,
    showZeroCards,
    showNumberFormsDialog,
    setShowNumberFormsDialog,
    isHeaderCollapsed,
    numberInputRef,
  } = useHeaderContext()
  const isMobile = useIsMobile()

  // On first load, if no number is set, roll a randomized example so the
  // page is never empty. The user sees cards immediately instead of
  // instructions telling them what to do. Synchronous (no dice-roll delay)
  // so the example is present on the first paint.
  useEffect(() => {
    if (inputNumber === null) {
      const min = 1
      const max = 9999
      const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min
      setInputNumber(randomNumber)
    }
    // Mount-only: the user clearing the input afterwards is intentional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [selectedTab, setSelectedTab] = useState<NumberFormsDialogTab>(NumberFormsDialogTab.WORD)

  // All cards are always rendered, highest place value first. Hiding zeros
  // never removes cards (that collapsed 800,502 to "852" and destroyed
  // place-value structure); the whole zero card goes transparent instead
  // (a blank colored card would give away the zero cards), so toggling
  // never shifts the layout.
  const cards = useMemo(() => {
    if (!inputNumber) return []
    const numberString = inputNumber.toString()
    const digits = numberString.split('')
    return digits
      .toReversed()
      .map((digit, index) => ({
        firstDigit: parseInt(digit) || 0,
        placeValue: PLACE_VALUES[index],
      }))
      .toReversed()
  }, [inputNumber])

  // Display text per card ("800,000", "0", "500", "2"). A zero card's value
  // is 0 and it displays "0" (no fake zero numbers). The mobile fan metrics
  // need these to model the fan width.
  const displayTexts = useMemo(() => cards.map((card) => (card.firstDigit * card.placeValue).toLocaleString()), [cards])

  // Fan items: cards interleaved with thousands-separator commas (one after
  // every 3 digits from the right, never after the last card). Commas are
  // non-interactive, always visible, and participate in layout like cards.
  const items = useMemo(() => {
    const result: FanItem[] = []
    cards.forEach((_, i) => {
      result.push({ kind: 'card', cardIndex: i })
      if (i < cards.length - 1 && (cards.length - 1 - i) % 3 === 0) {
        result.push({ kind: 'comma' })
      }
    })
    return result
  }, [cards])

  // Fan metrics, lifted from DraggableCard: the parent needs the font size
  // to size the fan wrapper, and every card shares the same fan.
  // Below the mobile breakpoint the cards are the hero: they grow to fill
  // the viewport (fewer digits = bigger cards). Desktop keeps text-6xl.
  //
  // Fully dynamic sizing: the model gives a synchronous first guess (so the
  // font size is correct on the very first paint after the number changes).
  // After the fan is measured empirically, if it overflows the viewport the
  // correction scales the font down proportionally (scaleFontSizeToFit) and
  // the fan is re-measured. This guarantees fit on any device, regardless
  // of how its fonts, letter-spacing, or padding render relative to the
  // model. The correction is keyed by the inputs that produced it, so the
  // layout effect never applies a stale correction.
  const modelFontSize = useMemo(
    () =>
      isMobile && typeof window !== 'undefined' && displayTexts.length > 0
        ? getMobileCardMetrics(displayTexts, window.innerWidth).fontSize
        : null,
    [isMobile, displayTexts]
  )
  const [sizingCorrection, setSizingCorrection] = useState<{ key: string; delta: number } | null>(null)
  const sizingKey = `${isMobile}|${displayTexts.join(',')}`
  const mobileMetrics = useMemo(() => {
    if (modelFontSize === null) return null
    const delta = sizingCorrection && sizingCorrection.key === sizingKey ? sizingCorrection.delta : 0
    return { fontSize: Math.max(10, modelFontSize - delta) }
  }, [modelFontSize, sizingCorrection, sizingKey])
  // Available width for the fan on mobile (viewport minus page padding).
  const mobileAvailableWidth = isMobile && typeof window !== 'undefined' ? window.innerWidth - 32 : 0

  // Fan layout: each item anchors on its cumulative offset (the sum of the
  // previous items' widths) inside a wrapper sized to the fan extent. The
  // wrapper is a flex item of the workspace (which centers it via
  // justify-content), so the visible fan is centered. shrink-0 keeps an
  // oversized fan from being flex-shrunk (the one-card mobile fan can
  // exceed the viewport; it then overflows centered, as the cards did
  // before this change).
  //
  // Each card's peek fits exactly one digit (padLeft + one full digit
  // advance, measured empirically in place with a Range over the first
  // character, so the leading digit is never clipped). Commas contribute
  // their measured width. The last card shows its full natural width.
  //
  // The extent is the cumulative widths plus the LAST (top) card's natural
  // width, never a max over all cards: max-ing let a wide back card
  // ("700,000") inflate the top card ("5") to ~3x its natural width. Each
  // card gets an assigned width (extent - fanX) with its text left-aligned
  // and overflow hidden, so every peek shows its leading digit and the
  // fan's right edge is flush. A card away from its fan home (dragged,
  // Mix-scattered, keyboard-moved) renders at its natural width instead, so
  // the full place value stays readable.
  //
  // Natural widths are derived from the text itself (inner.scrollWidth +
  // the card's horizontal padding), not the card's offsetWidth: the inner
  // div shrink-fits its text, so this is the content-driven width on every
  // pass (first paint, font swap, resize) with no drift. opacity:0 on a
  // hidden zero card keeps it painting (so it still occludes the cards
  // beneath it) while preserving layout, so measurement works identically
  // whether zeros are shown or hidden. Measured in a layout
  // effect so the first paint already has the correct size (no flash).
  const fanRef = useRef<HTMLDivElement>(null)
  const [fanLayout, setFanLayout] = useState<{
    key: string
    extent: number
    height: number
    naturals: number[]
    itemX: number[]
    /** Width contribution per fan item (single-digit peek for cards,
     * measured width for commas). Cards clip their text to this width so
     * peeks never depend on occlusion. */
    itemWidths: number[]
    /** Text clip width per card (the first character's rendered width, no
     * padding). The inner text wrapper starts after the card's left
     * padding, so this excludes padLeft. */
    textClipWidths: number[]
  } | null>(null)
  const [measureTick, setMeasureTick] = useState(0)
  // Note: showZeroCards is intentionally absent: blanking a zero card does
  // not change any measured width, so the layout is toggle-invariant.
  const measureKey = `${inputNumber}|${mobileMetrics?.fontSize ?? 'd'}`

  useLayoutEffect(() => {
    const fanEl = fanRef.current
    if (!fanEl || cards.length === 0) return
    const children = Array.from(fanEl.children) as HTMLElement[]
    if (children.length !== items.length) return

    const naturals: number[] = new Array(cards.length)
    // Text clip width per card: the first character's rendered width
    // (no padding). The inner text wrapper starts after the card's left
    // padding, so the clip must not include padLeft, or a sliver of the
    // next character would show.
    const textClipWidths: number[] = new Array(cards.length)
    // Width contribution per fan item: single-digit peek for cards (except
    // the last, which shows its full natural width), measured width for
    // commas.
    const itemWidths: number[] = children.map((child, itemIdx) => {
      const item = items[itemIdx]
      if (item.kind === 'comma') return child.scrollWidth
      const style = getComputedStyle(child)
      const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
      const natural = (child.firstElementChild?.scrollWidth ?? 0) + padX
      naturals[item.cardIndex] = natural
      if (item.cardIndex === cards.length - 1) {
        textClipWidths[item.cardIndex] = natural - padX
        return natural
      }
      // Single-digit peek: left padding plus the rendered width of the
      // first character, measured in place with a Range (exact font,
      // tracking, and letter-spacing).
      const padLeft = parseFloat(style.paddingLeft)
      const inner = child.firstElementChild as HTMLElement | null
      const textNode = inner?.firstChild as Text | null
      if (!textNode || textNode.length === 0) {
        textClipWidths[item.cardIndex] = 0
        return padLeft
      }
      const range = document.createRange()
      range.setStart(textNode, 0)
      range.setEnd(textNode, 1)
      const charWidth = range.getBoundingClientRect().width
      textClipWidths[item.cardIndex] = charWidth
      return padLeft + charWidth
    })

    const itemX = getFanPositions(itemWidths)
    const extent = getFanExtent(itemWidths, naturals[naturals.length - 1])
    const height = Math.max(...children.map((child) => child.offsetHeight))

    // Fully dynamic mobile sizing: if the measured fan overflows the
    // available width, increase the correction delta so the font scales down
    // proportionally, then re-measure. The delta strictly increases (and the
    // font is floored at 10px), so this terminates; the state update
    // re-renders and re-runs this effect via the measureKey (which includes
    // mobileMetrics.fontSize). The correction is keyed, so a stale delta
    // from a previous number never applies.
    if (isMobile && modelFontSize !== null && mobileAvailableWidth > 0 && displayTexts.length > 0) {
      const currentFontSize = mobileMetrics?.fontSize ?? modelFontSize
      const corrected = scaleFontSizeToFit(extent, currentFontSize, mobileAvailableWidth)
      if (corrected !== null) {
        const newDelta = modelFontSize - corrected
        const prevDelta = sizingCorrection && sizingCorrection.key === sizingKey ? sizingCorrection.delta : 0
        if (newDelta > prevDelta) {
          setSizingCorrection({ key: sizingKey, delta: newDelta })
          return
        }
      }
    }

    setFanLayout((prev) =>
      prev?.key === measureKey &&
      prev.extent === extent &&
      prev.height === height &&
      prev.naturals.length === naturals.length &&
      prev.naturals.every((w, i) => w === naturals[i]) &&
      prev.itemX.length === itemX.length &&
      prev.itemX.every((x, i) => x === itemX[i]) &&
      prev.itemWidths.length === itemWidths.length &&
      prev.itemWidths.every((w, i) => w === itemWidths[i]) &&
      prev.textClipWidths.length === textClipWidths.length &&
      prev.textClipWidths.every((w, i) => w === textClipWidths[i])
        ? prev
        : { key: measureKey, extent, height, naturals, itemX, itemWidths, textClipWidths }
    )
  }, [
    measureKey,
    cards.length,
    items,
    measureTick,
    sizingKey,
    sizingCorrection,
    modelFontSize,
    isMobile,
    mobileAvailableWidth,
    displayTexts,
  ])

  // Re-measure once web fonts arrive (card widths are text-driven) and on
  // resize/zoom (the mobile fan metrics depend on the viewport width).
  useEffect(() => {
    const bump = () => setMeasureTick((t) => t + 1)
    if (document.fonts) {
      document.fonts.ready.then(bump).catch(() => {})
    }
    window.addEventListener('resize', bump)
    return () => window.removeEventListener('resize', bump)
  }, [])

  const layout = fanLayout?.key === measureKey ? fanLayout : null

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // One-time toast: guarded by localStorage directly, so the effect only
  // touches external systems (storage + the toast library) and never state.
  useEffect(() => {
    if (cards.length > 1 && localStorage.getItem(LOCAL_STORAGE_KEYS.HAS_SEEN_FIRST_TIME_TOAST) === null) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.HAS_SEEN_FIRST_TIME_TOAST, JSON.stringify(true))
      toast(<FirstTimeToast />, { duration: FIRST_TIME_TOAST_DURATION, style: FIRST_TIME_TOAST_STYLE })
    }
  }, [cards])

  const commaClassName =
    'flex items-center select-none tabular-nums font-bold text-white text-lg md:text-6xl tracking-[10px] md:tracking-[20px] py-4 md:py-10 pointer-events-none'
  const commaStyle = (x: number): React.CSSProperties => ({
    position: 'absolute',
    left: 0,
    top: 0,
    transform: `translate(${x}px, 0)`,
    // Commas sit above the card backgrounds they overlap (each card's
    // assigned width extends under the following items).
    zIndex: 2 * cards.length,
    // Mobile hero sizing matches the cards (font size, tracking, vertical
    // padding); the Tailwind text/tracking/py classes above apply on
    // desktop. Horizontal padding stays 0: the comma is just its glyph.
    ...(mobileMetrics
      ? {
          fontSize: `${mobileMetrics.fontSize}px`,
          letterSpacing: `${Math.round(mobileMetrics.fontSize * 0.3)}px`,
          padding: `${Math.round(mobileMetrics.fontSize * 0.35)}px 0`,
        }
      : {}),
  })

  return (
    <>
      <NumberFormsDialog
        open={showNumberFormsDialog}
        onOpenChange={setShowNumberFormsDialog}
        number={inputNumber}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />
      {/* <BuyMeACoffeeWidget /> */}

      <section
        className="flex flex-col items-center gap-8 max-md:w-full max-md:flex-1 max-md:gap-3"
        aria-label="Interactive Place Value Cards"
      >
        <header className="flex flex-col items-center max-md:w-full">
          {/* Desktop: the zero-state readout lives here, above the number
              input and below the toolbar's bottom border. Mobile renders its
              own instance above the bottom action bar instead. */}
          {!isMobile && <ZeroStateIndicator className="mb-1.5" />}
          <NumberInput ref={numberInputRef} value={inputNumber} onChange={setInputNumber} />
        </header>

        <main
          className={`w-full ${isHeaderCollapsed ? 'h-128' : 'h-120'} max-md:h-auto max-md:min-h-[280px] max-md:flex-1 transition-[height] duration-300 flex items-center justify-center relative`}
          aria-label="Place value cards workspace"
        >
          <div
            ref={fanRef}
            role="application"
            aria-label="Draggable place value cards"
            className="relative shrink-0"
            style={layout ? { width: layout.extent, height: layout.height } : undefined}
          >
            {items.map((item, itemIdx) => {
              if (item.kind === 'comma') {
                return (
                  <span
                    key={`comma-${itemIdx}`}
                    data-testid="fan-comma"
                    aria-hidden="true"
                    className={commaClassName}
                    style={commaStyle(layout ? layout.itemX[itemIdx] : 0)}
                  >
                    ,
                  </span>
                )
              }
              const card = cards[item.cardIndex]
              const fanX = layout ? layout.itemX[itemIdx] : 0
              return (
                <DraggableCard
                  key={`${card.firstDigit}-${card.placeValue}-${item.cardIndex}`}
                  firstDigit={card.firstDigit}
                  placeValue={card.placeValue}
                  index={item.cardIndex}
                  totalCards={cards.length}
                  fanX={fanX}
                  mobileMetrics={mobileMetrics}
                  fanWidth={layout ? layout.extent - fanX : undefined}
                  naturalWidth={layout ? layout.naturals[item.cardIndex] : undefined}
                  textClipWidth={layout ? layout.textClipWidths[item.cardIndex] : undefined}
                  hiddenZero={card.firstDigit === 0 && !showZeroCards}
                  resetTrigger={resetTrigger}
                  randomizeTrigger={randomizeTrigger}
                  scatterArea={scatterArea}
                />
              )
            })}
          </div>
        </main>
      </section>
    </>
  )
}
