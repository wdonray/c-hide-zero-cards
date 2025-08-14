'use client'

import { useMemo, useEffect, useState } from 'react'
import { NumberInput } from '@/components/NumberInput'
import { DraggableCard } from '@/components/DraggableCard'
import { MobileAlertDialog } from '@/components/MobileAlertDialog'
import {
  FAKE_ZERO_NUMBERS,
  PLACE_VALUES,
  LOCAL_STORAGE_KEYS,
  FIRST_TIME_TOAST_DURATION,
  FIRST_TIME_TOAST_STYLE,
} from '@/lib/constants'
import { useHeaderContext } from '@/lib/useHeaderContext'
import { ExpandDialog } from '@/components/ExpandDialog'
import { BuyMeACoffeeWidget } from '@/components/BuyMeACoffeeWidget'
import { toast } from 'sonner'
import { FirstTimeToast } from '@/components/FirstTimeToast'
import { ArrowFatUpIcon } from '@phosphor-icons/react'

export function HomePageClient() {
  const {
    inputNumber,
    setInputNumber,
    setResetTrigger,
    setRandomizeTrigger,
    resetTrigger,
    randomizeTrigger,
    showZeroCards,
    showExpandDialog,
    setShowExpandDialog,
  } = useHeaderContext()

  const [hasShownFirstTimeToast, setHasShownFirstTimeToast] = useState(() => {
    if (typeof window === 'undefined') return false
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.HAS_SEEN_FIRST_TIME_TOAST)
    return saved !== null ? JSON.parse(saved) : false
  })

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
    if (inputNumber === null) {
      setResetTrigger(0)
      setRandomizeTrigger(0)
    }
  }, [inputNumber, setResetTrigger, setRandomizeTrigger])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (cards.length > 1 && !hasShownFirstTimeToast) {
      setHasShownFirstTimeToast(true)
      localStorage.setItem(LOCAL_STORAGE_KEYS.HAS_SEEN_FIRST_TIME_TOAST, JSON.stringify(true))
      toast(<FirstTimeToast />, { duration: FIRST_TIME_TOAST_DURATION, style: FIRST_TIME_TOAST_STYLE })
    }
  }, [cards, hasShownFirstTimeToast])

  return (
    <>
      <MobileAlertDialog />
      <ExpandDialog open={showExpandDialog} onOpenChange={setShowExpandDialog} number={inputNumber} />
      <BuyMeACoffeeWidget />

      <section className="flex flex-col items-center gap-8" aria-label="Interactive Place Value Cards">
        <header className="flex flex-col items-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Interactive Place Value Cards
          </h1>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mb-6">
            Enter any number below to see it broken down into place value cards. Drag and manipulate the cards to
            understand how place values work together.
          </p>
          <NumberInput value={inputNumber} onChange={setInputNumber} />
        </header>

        <main
          className="w-full h-128 lg:border-2 lg:border-dashed lg:border-gray-300 rounded-lg flex items-center justify-center"
          aria-label="Place value cards workspace"
        >
          {cards.length === 0 ? (
            <div className="flex flex-col items-center gap-2" role="img" aria-label="Instructions to start">
              <ArrowFatUpIcon className="h-12 w-12 animate-bounce text-muted-foreground" aria-hidden="true" />
              <span className="text-2xl text-muted-foreground text-center">Type a number above to see your cards!</span>
              <span className="text-sm text-muted-foreground text-center">
                Try numbers like 123, 1,000, or even 1,000,000!
              </span>
            </div>
          ) : (
            <div
              className="flex flex-wrap justify-center gap-4"
              role="application"
              aria-label="Draggable place value cards"
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
