'use client'

import { useMemo, useEffect, useState } from 'react'
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
import { useHeaderContext } from '@/lib/useHeaderContext'
import { NumberFormsDialog } from '@/components/NumberFormsDialog'
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
    showZeroCards,
    showNumberFormsDialog,
    setShowNumberFormsDialog,
    isHeaderCollapsed,
    numberInputRef,
  } = useHeaderContext()

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
          <NumberInput ref={numberInputRef} value={inputNumber} onChange={setInputNumber} />
        </header>

        <main
          className={`w-full ${isHeaderCollapsed ? 'h-128' : 'h-120'} max-md:h-auto max-md:min-h-[280px] max-md:flex-1 transition-[height] duration-300 lg:border-2 lg:border-dashed lg:border-gray-300 rounded-lg flex items-center justify-center relative`}
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
              role="application"
              aria-label="Draggable place value cards"
              className="w-full h-full flex items-center justify-center"
            >
              {cards.map((card, index) => (
                <DraggableCard
                  key={`${card.firstDigit}-${card.placeValue}-${index}`}
                  firstDigit={card.firstDigit}
                  placeValue={card.placeValue}
                  fakeNumbers={card.fakeNumbers}
                  index={index}
                  totalCards={cards.length}
                  resetTrigger={resetTrigger}
                  randomizeTrigger={randomizeTrigger}
                />
              ))}
            </div>
          )}
        </main>
      </section>
    </>
  )
}
