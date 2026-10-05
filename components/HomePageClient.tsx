'use client'

import { useLayoutEffect, useMemo, useEffect, useRef, useState } from 'react'
import { NumberInput } from '@/components/NumberInput'
import { DraggableCard } from '@/components/DraggableCard'
import {
  FAKE_ZERO_NUMBERS,
  PLACE_VALUES,
  LOCAL_STORAGE_KEYS,
  FIRST_TIME_TOAST_DURATION,
  FIRST_TIME_TOAST_STYLE,
  NumberFormsDialogTab,
} from '@/lib/constants'
import { getFanExtent, getFanPositions, getMobileCardMetrics, getPeekText } from '@/lib/cardLayout'
import { useHeaderContext } from '@/lib/useHeaderContext'
import { useIsMobile } from '@/lib/useIsMobile'
import { NumberFormsDialog } from '@/components/NumberFormsDialog'
import { ZeroStateIndicator } from '@/components/ZeroStateIndicator'
// import { BuyMeACoffeeWidget } from '@/components/BuyMeACoffeeWidget'
import { toast } from 'sonner'
import { FirstTimeToast } from '@/components/FirstTimeToast'
import { ArrowFatUpIcon } from '@phosphor-icons/react'

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

  const [selectedTab, setSelectedTab] = useState<NumberFormsDialogTab>(NumberFormsDialogTab.WORD)

  const cards = useMemo(() => {
    if (!inputNumber) return []
    const numberString = inputNumber.toString()
    const digits = numberString.split('')
    const cards = digits.toReversed().map((digit, index) => ({
      firstDigit: parseInt(digit) || 0,
      placeValue: PLACE_VALUES[index],
      fakeNumbers: digit === '0' ? FAKE_ZERO_NUMBERS[index] : null,
    }))

    // Filter out zero cards if showZeroCards is false
    const filteredCards = showZeroCards ? cards : cards.filter((card) => card.firstDigit !== 0)

    return filteredCards.toReversed()
  }, [inputNumber, showZeroCards])

  // Display text per card ("800,000", "500", "2", or a fake zero like
  // "00,000"). The mobile fan metrics need these to model the wide peeks.
  const displayTexts = useMemo(
    () => cards.map((card) => card.fakeNumbers ?? (card.firstDigit * card.placeValue).toLocaleString()),
    [cards]
  )

  // Fan metrics, lifted from DraggableCard: the parent needs the font size
  // to size the fan wrapper, and every card shares the same fan.
  // Below the mobile breakpoint the cards are the hero: they grow to fill
  // the viewport (fewer digits = bigger cards). Desktop keeps text-6xl.
  const mobileMetrics = useMemo(
    () => (isMobile && typeof window !== 'undefined' ? getMobileCardMetrics(displayTexts, window.innerWidth) : null),
    [isMobile, displayTexts]
  )

  // Fan layout: each card anchors on its cumulative peek offset (the sum of
  // the previous cards' significant-prefix peeks: "800," / "500" / "2")
  // inside a wrapper sized to the fan extent. The wrapper is a flex item of
  // the workspace (which centers it via justify-content), so the visible
  // fan is centered even though card widths vary with place value.
  // shrink-0 keeps an oversized fan from being flex-shrunk (the one-card
  // mobile fan can exceed the viewport; it then overflows centered, as the
  // cards did before this change).
  //
  // Peek widths are measured empirically, never modeled: a Range over each
  // card's significant prefix ("800," in "800,000") gives its exact rendered
  // width in place, with the card's real font, tracking, and letter-spacing.
  // A char-count model is too imprecise with the comma, so it is only used
  // inside getMobileCardMetrics to choose the mobile font size.
  //
  // The extent is the cumulative peeks plus the LAST (top) card's natural
  // width, never a max over all cards: max-ing let a wide back card
  // ("700,000") inflate the top card ("5") to ~3x its natural width. Each
  // card gets an assigned width (extent - fanX) with its text left-aligned
  // and overflow hidden, so every peek shows its significant prefix and the
  // fan's right edge is flush. A card away from its fan home (dragged,
  // Mix-scattered, keyboard-moved) renders at its natural width instead, so
  // the full place value stays readable.
  //
  // Natural widths are derived from the text itself (inner.scrollWidth +
  // the card's horizontal padding), not the card's offsetWidth: the inner
  // div shrink-fits its text, so this is the content-driven width on every
  // pass (first paint, font swap, resize) with no drift. Measured in a
  // layout effect so the first paint already has the correct size (no flash).
  const fanRef = useRef<HTMLDivElement>(null)
  const [fanLayout, setFanLayout] = useState<{
    key: string
    extent: number
    height: number
    naturals: number[]
    positions: number[]
  } | null>(null)
  const [measureTick, setMeasureTick] = useState(0)
  const measureKey = `${inputNumber}|${showZeroCards}|${mobileMetrics?.fontSize ?? 'd'}`

  useLayoutEffect(() => {
    const fanEl = fanRef.current
    if (!fanEl || cards.length === 0) return
    const children = Array.from(fanEl.children) as HTMLElement[]
    if (children.length !== cards.length) return
    const naturals = children.map((child) => {
      const style = getComputedStyle(child)
      const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
      return (child.firstElementChild?.scrollWidth ?? 0) + padX
    })
    // Peek widths: left padding plus the rendered width of the significant
    // prefix, measured in place with a Range (exact font, tracking, and
    // letter-spacing; the comma's trailing spacing is included because the
    // comma is followed by more text in the card). The last card shows its
    // full natural width, so it has no peek.
    const peekWidths = children.map((child, i) => {
      if (i === children.length - 1) return 0
      const padLeft = parseFloat(getComputedStyle(child).paddingLeft)
      const inner = child.firstElementChild as HTMLElement | null
      const textNode = inner?.firstChild as Text | null
      const peekLength = getPeekText(displayTexts[i]).length
      if (!textNode || peekLength === 0) return padLeft
      const range = document.createRange()
      range.setStart(textNode, 0)
      range.setEnd(textNode, Math.min(peekLength, textNode.length))
      return padLeft + range.getBoundingClientRect().width
    })
    const positions = getFanPositions(peekWidths.slice(0, -1))
    const extent = getFanExtent(peekWidths.slice(0, -1), naturals[naturals.length - 1])
    const height = Math.max(...children.map((child) => child.offsetHeight))
    setFanLayout((prev) =>
      prev?.key === measureKey &&
      prev.extent === extent &&
      prev.height === height &&
      prev.naturals.length === naturals.length &&
      prev.naturals.every((w, i) => w === naturals[i]) &&
      prev.positions.length === positions.length &&
      prev.positions.every((x, i) => x === positions[i])
        ? prev
        : { key: measureKey, extent, height, naturals, positions }
    )
  }, [measureKey, cards.length, displayTexts, measureTick])

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
          {cards.length === 0 ? (
            <div className="flex flex-col items-center gap-2" role="img" aria-label="Instructions to start">
              <ArrowFatUpIcon className="h-12 w-12 animate-bounce text-muted-foreground" aria-hidden="true" />
              <span className="text-2xl text-muted-foreground text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Type a number above to see your cards!
              </span>
              <span className="text-sm text-muted-foreground text-center">
                Try numbers like 123, 1,000, or even 1,000,000!
              </span>
            </div>
          ) : (
            <div
              ref={fanRef}
              role="application"
              aria-label="Draggable place value cards"
              className="relative shrink-0"
              style={layout ? { width: layout.extent, height: layout.height } : undefined}
            >
              {cards.map((card, index) => (
                <DraggableCard
                  key={`${card.firstDigit}-${card.placeValue}-${index}`}
                  firstDigit={card.firstDigit}
                  placeValue={card.placeValue}
                  fakeNumbers={card.fakeNumbers}
                  index={index}
                  totalCards={cards.length}
                  fanX={layout ? layout.positions[index] : 0}
                  mobileMetrics={mobileMetrics}
                  fanWidth={layout ? layout.extent - layout.positions[index] : undefined}
                  naturalWidth={layout ? layout.naturals[index] : undefined}
                  resetTrigger={resetTrigger}
                  randomizeTrigger={randomizeTrigger}
                  scatterArea={scatterArea}
                />
              ))}
            </div>
          )}
        </main>
      </section>
    </>
  )
}
