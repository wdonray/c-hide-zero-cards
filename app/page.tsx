'use client'

import { useMemo, useState, useEffect } from 'react'
import { NumberInput } from '@/components/NumberInput'
import { Button } from '@/components/ui/button'
import { DraggableCard } from '@/components/DraggableCard'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { FAKE_ZERO_NUMBERS, PLACE_VALUES, MAX_NUMBER } from '@/lib/constants'

export default function Home() {
  const [inputNumber, setInputNumber] = useState<number | null>(null)
  const [resetTrigger, setResetTrigger] = useState(0)
  const [randomizeTrigger, setRandomizeTrigger] = useState(0)
  const [randomNumberRange, setRandomNumberRange] = useState<[number, number]>([1, MAX_NUMBER])
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
    setRandomNumberRange([1, MAX_NUMBER])
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
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-col gap-4">
        <NumberInput value={inputNumber} onChange={setInputNumber} />
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Collapsible open={showRandomRange} onOpenChange={setShowRandomRange}>
              <CollapsibleTrigger asChild>
                <Button size="sm" variant="ghost">
                  {showRandomRange ? '🔼' : '🔽'}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
            <Button size="sm" onClick={handleRandomNumber} disabled={isDiceRolling}>
              <span className={isDiceRolling ? 'animate-dice-roll inline-block' : 'inline-block'}>🎲</span> Randomize
              number
            </Button>
          </div>
          <Button size="sm" disabled={!inputNumber} variant="outline" onClick={handleRandomizeCardPosition}>
            🔀 Randomize positions
          </Button>
          <Button variant="destructive" disabled={!inputNumber} size="sm" onClick={handleResetCardPosition}>
            🔄 Reset cards
          </Button>
        </div>
        <Collapsible open={showRandomRange} onOpenChange={setShowRandomRange}>
          <CollapsibleContent>
            <div className="flex flex-col gap-2">
              <Separator />
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="flex items-start gap-8 justify-between w-full">
                  <div className="grid grid-cols-3 items-center gap-2 w-full">
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
                  <Button size="sm" variant="ghost" onClick={handleResetRandomNumberRange}>
                    🔄 Reset
                  </Button>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
      <div className="w-full h-96 lg:border-2 lg:border-dashed lg:border-gray-300 rounded-lg flex items-center justify-center">
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
    </div>
  )
}
