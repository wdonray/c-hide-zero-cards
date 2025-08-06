'use client'

import { useMemo, useState, useEffect } from 'react'
import { NumberInput } from '@/components/NumberInput'
import { Button } from '@/components/ui/button'
import { DraggableCard } from '@/components/DraggableCard'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { MobileAlert } from '@/components/MobileAlert'
import { FAKE_ZERO_NUMBERS, PLACE_VALUES, DEFAULT_MAX_RANDOM_NUMBER } from '@/lib/constants'
import { DiceSix, Shuffle, ArrowClockwise, Target, CaretDown } from '@phosphor-icons/react'

export default function Home() {
  const [inputNumber, setInputNumber] = useState<number | null>(null)
  const [resetTrigger, setResetTrigger] = useState(0)
  const [randomizeTrigger, setRandomizeTrigger] = useState(0)
  const [randomNumberRange, setRandomNumberRange] = useState<[number, number]>([1, DEFAULT_MAX_RANDOM_NUMBER])
  const [showRandomRange, setShowRandomRange] = useState(false)
  const [isDiceRolling, setIsDiceRolling] = useState(false)

  function handleRandomNumber() {
    const randomNumber =
      Math.floor(Math.random() * (randomNumberRange[1] - randomNumberRange[0] + 1)) + randomNumberRange[0]
    setIsDiceRolling(true)
    setTimeout(() => {
      setInputNumber(randomNumber)
      handleResetCardPosition()
      setIsDiceRolling(false)
    }, 200)
  }

  function handleRandomNumberRange(value: number[]) {
    setRandomNumberRange([value[0], value[1]])
  }

  function handleResetRandomNumberRange() {
    setRandomNumberRange([1, DEFAULT_MAX_RANDOM_NUMBER])
  }

  function handleResetCardPosition() {
    setResetTrigger((prev) => prev + 1)
    setRandomizeTrigger(0)
  }

  function handleRandomizeCardPosition() {
    setRandomizeTrigger((prev) => prev + 1)
  }

  const randomNumberRangeKeys = Object.values(PLACE_VALUES).filter(
    (value) => value !== PLACE_VALUES[0] && value !== PLACE_VALUES[1]
  )

  const cards = useMemo(() => {
    if (!inputNumber) return []
    const numberString = inputNumber.toString()
    const digits = numberString.split('')
    const cards = digits.toReversed().map((digit, index) => ({
      firstDigit: parseInt(digit) || 0,
      placeValue: PLACE_VALUES[index],
      fakeNumbers: digit === '0' ? FAKE_ZERO_NUMBERS[index] : null,
    }))
    return cards.toReversed()
  }, [inputNumber])

  useEffect(() => {
    if (inputNumber === null) {
      setResetTrigger(0)
      setRandomizeTrigger(0)
    }
  }, [inputNumber])

  return (
    <>
      <MobileAlert />

      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-col gap-4">
          <NumberInput value={inputNumber} onChange={setInputNumber} />

          <div className="flex w-full flex-wrap items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="flex rounded-md shadow-sm" role="group">
                <Button
                  size="sm"
                  onClick={handleRandomNumber}
                  disabled={isDiceRolling}
                  className="rounded-r-none border-r-1"
                >
                  <DiceSix className={`h-4 w-4 ${isDiceRolling ? 'animate-dice-roll' : ''}`} />
                  Roll a number
                </Button>
                <Popover open={showRandomRange} onOpenChange={setShowRandomRange}>
                  <PopoverTrigger asChild>
                    <Button size="sm" className="rounded-l-none text-sm px-2">
                      <CaretDown className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Random Number Range</h4>
                        <p className="text-sm text-muted-foreground">
                          Set the maximum value for random number generation.
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <div className="grid grid-cols-2 gap-2">
                          {randomNumberRangeKeys.map((value) => (
                            <Button
                              key={value}
                              size="sm"
                              variant={randomNumberRange[1] === value ? 'outline' : 'ghost'}
                              onClick={() => handleRandomNumberRange([randomNumberRange[0], value])}
                            >
                              {value.toLocaleString()}
                            </Button>
                          ))}
                        </div>
                        <Button size="sm" variant="ghost" onClick={handleResetRandomNumberRange} className="mt-2">
                          <ArrowClockwise className="h-4 w-4 mr-2" />
                          Reset to default
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <Button size="sm" disabled={!inputNumber} variant="outline" onClick={handleRandomizeCardPosition}>
              <Shuffle className="h-4 w-4" />
              Mix up cards
            </Button>
            <Button variant="destructive" disabled={!inputNumber} size="sm" onClick={handleResetCardPosition}>
              <ArrowClockwise className="h-4 w-4" />
              Put cards back
            </Button>
          </div>
        </div>

        <div className="w-full h-96 lg:border-2 lg:border-dashed lg:border-gray-300 rounded-lg flex items-center justify-center">
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
