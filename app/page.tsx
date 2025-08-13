'use client'

import { useMemo, useEffect } from 'react'
import { NumberInput } from '@/components/NumberInput'
import { DraggableCard } from '@/components/DraggableCard'
import { MobileAlert } from '@/components/MobileAlert'
import { FAKE_ZERO_NUMBERS, PLACE_VALUES } from '@/lib/constants'
import { Target } from '@phosphor-icons/react'
import { useHeaderContext } from '@/lib/useHeaderContext'

export default function Home() {
  const {
    inputNumber,
    setInputNumber,
    setResetTrigger,
    setRandomizeTrigger,
    resetTrigger,
    randomizeTrigger,
    showZeroCards,
  } = useHeaderContext()

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

  return (
    <>
      <MobileAlert />

      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-col">
          <NumberInput value={inputNumber} onChange={setInputNumber} />
        </div>

        <div className="w-full h-128 lg:border-2 lg:border-dashed lg:border-gray-300 rounded-lg flex items-center justify-center">
          {cards.length === 0 ? (
            <div className="flex flex-col items-center gap-2">
              <Target className="h-16 w-16 text-muted-foreground" />
              <span className="text-2xl text-muted-foreground text-center">Type a number above to see your cards!</span>
              <span className="text-sm text-muted-foreground text-center">
                Try numbers like 123, 1,000, or even 1,000,000!
              </span>
            </div>
          ) : (
            cards.map((card, index) => (
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
            ))
          )}
        </div>
      </div>
    </>
  )
}
