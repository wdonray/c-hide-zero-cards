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
import {
  OVERLAP_FUDGE_PX,
  getFanExtent,
  getFanPositions,
  getMobileCardMetrics,
  getPeekText,
  peekCharCount,
  scaleFontSizeToFit,
} from '@/lib/cardLayout'
import { useHeaderContext } from '@/lib/useHeaderContext'
import { useIsMobile } from '@/lib/useIsMobile'
import { NumberFormsDialog } from '@/components/NumberFormsDialog'
import { ZeroStateIndicator } from '@/components/ZeroStateIndicator'
// import { BuyMeACoffeeWidget } from '@/components/BuyMeACoffeeWidget'
import { toast } from 'sonner'
import { FirstTimeToast } from '@/components/FirstTimeToast'

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
    cardsMoved,
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
  // place-value structure); the whole zero card goes invisible instead
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

  // Peek text per card: the visible strip at fan home ("3,", "7", "4",
  // "3"). The full text is really rendered underneath; the next card
  // overlaps and covers everything past the peek, so pulling a tile out
  // reveals the full value. The font-size model uses peeks because the
  // fan's visible width is the sum of the peeks.
  const peekTexts = useMemo(() => cards.map((card) => getPeekText(card.firstDigit, card.placeValue)), [cards])

  // Card sizing: the fan's visible width is the sum of the peeks, so the
  // model gives a synchronous first guess from the peek texts (so the font
  // size is correct on the very first paint after the number changes).
  // After the fan is measured empirically, if it overflows the available
  // width the correction scales the font down proportionally
  // (scaleFontSizeToFit) and the fan is re-measured. This guarantees fit
  // on any device, regardless of how its fonts, letter-spacing, or padding
  // render relative to the model. The correction is keyed by the inputs
  // that produced it, so the layout effect never applies a stale
  // correction. Runs on mobile and desktop.
  const baseFontSize = useMemo(
    () =>
      typeof window !== 'undefined' && peekTexts.length > 0
        ? isMobile
          ? getMobileCardMetrics(peekTexts, window.innerWidth).fontSize
          : 60
        : null,
    [isMobile, peekTexts]
  )
  const [sizingCorrection, setSizingCorrection] = useState<{ key: string; delta: number } | null>(null)
  const sizingKey = `${isMobile}|${peekTexts.join(',')}`
  const mobileMetrics = useMemo(() => {
    if (baseFontSize === null) return null
    const delta = sizingCorrection && sizingCorrection.key === sizingKey ? sizingCorrection.delta : 0
    const fontSize = Math.max(24, baseFontSize - delta)
    // On desktop, keep the Tailwind text-6xl rendering untouched unless the
    // empirical correction actually shrank the font.
    if (!isMobile && fontSize >= baseFontSize) return null
    return { fontSize }
  }, [baseFontSize, sizingCorrection, sizingKey, isMobile])
  // Available width for the strip on mobile (viewport minus page padding).
  // Desktop measures the workspace element directly in the layout effect.
  const mobileAvailableWidth = isMobile && typeof window !== 'undefined' ? window.innerWidth - 32 : 0

  // Fan layout: true overlapping tiles, like physical arrow cards. Every
  // card renders its FULL text at its natural width; each card is
  // positioned at the cumulative peek width of the cards before it, and
  // z-index rises left-to-right, so card i+1 physically covers card i's
  // text past its peek. The visible "3," is really "3,000" with ",000"
  // tucked behind the next card: the zeros are there, just folded over.
  // Pulling a tile out uncovers the full value that was always rendered.
  //
  // Peek width per card (except the last, which is fully visible): the
  // card's left padding plus the rendered width of the peek text (first
  // digit, plus comma for group-final cards), measured in place with a
  // Range over the first 1-2 characters of the text node (exact font,
  // tracking, and letter-spacing). The parent centers the wrapper via
  // justify-content, so the visible fan is centered.
  //
  // Natural widths are the cards' own offsetWidths: absolutely-positioned
  // cards shrink-wrap their full text, so this is the content-driven width
  // on every pass (first paint, font swap, resize) with no drift.
  // visibility:hidden on a hidden zero card keeps it painting (so it still
  // has layout) while preserving the fan, so measurement works identically
  // whether zeros are shown or hidden. Measured in a layout effect so the
  // first paint already has the correct size (no flash).
  const fanRef = useRef<HTMLDivElement>(null)
  const [fanLayout, setFanLayout] = useState<{
    key: string
    extent: number
    height: number
    naturals: number[]
    itemX: number[]
  } | null>(null)
  const [measureTick, setMeasureTick] = useState(0)
  // Note: showZeroCards is intentionally absent: hiding a zero card does
  // not change any measured width, so the layout is toggle-invariant.
  const measureKey = `${inputNumber}|${mobileMetrics?.fontSize ?? 'd'}`

  useLayoutEffect(() => {
    const fanEl = fanRef.current
    if (!fanEl || cards.length === 0) return
    const children = Array.from(fanEl.children) as HTMLElement[]
    if (children.length !== cards.length) return

    const naturals: number[] = new Array(cards.length)
    // Peek width per card: left padding + rendered width of the peek text
    // (first digit, plus comma for group-final cards), measured in place
    // with a Range over the first 1-2 characters of the text node (exact
    // font, tracking, and letter-spacing). The last card is fully visible
    // (the ones place is a single digit), so it contributes its natural
    // width.
    const peekWidths = children.map((child, i) => {
      const style = getComputedStyle(child)
      // Natural width: the absolutely-positioned card shrink-wraps its full
      // text, so scrollWidth is the content-driven width.
      naturals[i] = child.scrollWidth
      if (i === children.length - 1) {
        return naturals[i]
      }
      const padLeft = parseFloat(style.paddingLeft)
      const textNode = Array.from(child.childNodes).find(
        (n): n is Text => n.nodeType === Node.TEXT_NODE && !!n.textContent?.trim()
      )
      const chars = peekCharCount(cards[i].placeValue)
      if (!textNode || textNode.length === 0) {
        return padLeft
      }
      const range = document.createRange()
      range.setStart(textNode, 0)
      range.setEnd(textNode, Math.min(chars, textNode.length))
      const charWidth = range.getBoundingClientRect().width
      return padLeft + charWidth
    })
    // True overlap: the covering card starts OVERLAP_FUDGE_PX before the
    // measured peek boundary, guaranteeing the covered text is fully hidden
    // with no slivers. Empirical finding (2026-10-07): the Range measurement
    // over the peek chars over-measures vs. where the next glyph visually
    // starts by ~20px at 60px font (letter-spacing and font metrics interact;
    // caret hit-testing shows the glyph ~20px left of the Range right edge).
    // The 28px fudge compensates with margin. Validated by
    // e2e/no-overlap-slivers.spec.ts, not by eye.
    const cardWidths = peekWidths.map((w, i) => (i < naturals.length - 1 ? w - OVERLAP_FUDGE_PX : w))

    const itemX = getFanPositions(cardWidths)
    const extent = getFanExtent(cardWidths.slice(0, -1), naturals[naturals.length - 1])
    const height = Math.max(...children.map((child) => child.offsetHeight))

    // Fully dynamic sizing: if the measured strip overflows the available
    // width, increase the correction delta so the font scales down
    // proportionally, then re-measure. The delta strictly increases (and
    // the font is floored at 24px), so this terminates; the state update
    // re-renders and re-runs this effect via the measureKey (which includes
    // the font size). Below the 24px floor the strip keeps its size and
    // scrolls horizontally instead of shrinking further. The correction is
    // keyed, so a stale delta from a previous number never applies.
    const workspaceEl = fanEl.parentElement as HTMLElement | null
    const availableWidth = isMobile ? mobileAvailableWidth : (workspaceEl?.clientWidth ?? 0)
    const base = baseFontSize ?? 60
    if (availableWidth > 0 && peekTexts.length > 0) {
      const currentFontSize = mobileMetrics?.fontSize ?? base
      const corrected = scaleFontSizeToFit(extent, currentFontSize, availableWidth)
      if (corrected !== null) {
        const newDelta = base - corrected
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
      prev.itemX.every((x, i) => x === itemX[i])
        ? prev
        : { key: measureKey, extent, height, naturals, itemX }
    )
  }, [
    measureKey,
    cards,
    cards.length,
    measureTick,
    sizingKey,
    sizingCorrection,
    baseFontSize,
    isMobile,
    mobileAvailableWidth,
    peekTexts,
    mobileMetrics,
  ])

  // Re-measure once web fonts arrive (card widths are text-driven) and on
  // resize/zoom (the fan metrics depend on the viewport width).
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
          <div
            ref={fanRef}
            role="application"
            aria-label="Draggable place value cards"
            className="relative shrink-0"
            style={
              layout
                ? {
                    width: layout.extent,
                    height: layout.height,
                    maxWidth: '100%',
                    // While every card is at fan home the strip may scroll
                    // horizontally if it overflows; once a card is moved
                    // (dragged, Mix-scattered, keyboard-moved) the overflow
                    // is lifted so displaced cards are never clipped.
                    overflowX: cardsMoved ? 'visible' : 'auto',
                  }
                : undefined
            }
          >
            {cards.map((card, i) => (
              <DraggableCard
                key={`${card.firstDigit}-${card.placeValue}-${i}`}
                firstDigit={card.firstDigit}
                placeValue={card.placeValue}
                index={i}
                totalCards={cards.length}
                fanX={layout ? layout.itemX[i] : 0}
                mobileMetrics={mobileMetrics}
                naturalWidth={layout ? layout.naturals[i] : undefined}
                hiddenZero={card.firstDigit === 0 && !showZeroCards}
                resetTrigger={resetTrigger}
                randomizeTrigger={randomizeTrigger}
                scatterArea={scatterArea}
              />
            ))}
          </div>
        </main>
      </section>
    </>
  )
}
