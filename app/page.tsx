'use client'

import { useMemo, useState, useEffect } from 'react'
import { NumberInput } from '@/components/NumberInput'
import { Button } from '@/components/ui/button'
import { DraggableCard } from '@/components/DraggableCard'
import { Separator } from '@/components/ui/separator'

export default function Home() {
  const [inputNumber, setInputNumber] = useState<number | null>(null)
  const [resetTrigger, setResetTrigger] = useState(0)
  const [randomizeTrigger, setRandomizeTrigger] = useState(0)
  const [randomNumberRange, setRandomNumberRange] = useState<[number, number]>([1, 1_000_000_000])
  const [showRandomRange, setShowRandomRange] = useState(false)

  function handleRandomNumber() {
    setInputNumber(Math.floor(Math.random() * (randomNumberRange[1] - randomNumberRange[0] + 1)) + randomNumberRange[0])
    handleResetCardPosition()
  }

  function handleRandomNumberRange(value: number[]) {
    setRandomNumberRange([value[0], value[1]])
  }

  function handleResetRandomNumberRange() {
    setRandomNumberRange([1, 1_000_000_000])
  }

  function handleResetCardPosition() {
    setResetTrigger((prev) => prev + 1)
    setRandomizeTrigger(0)
  }

  function handleRandomizeCardPosition() {
    setRandomizeTrigger((prev) => prev + 1)
  }

  const placeValue: Record<number, number> = useMemo(
    () => ({
      0: 1,
      1: 10,
      2: 100,
      3: 1000,
      4: 10000,
      5: 100000,
      6: 1000000,
      7: 10000000,
      8: 100000000,
      9: 1000000000,
    }),
    []
  )

  const fakeNumbers: Record<number, string | null> = useMemo(
    () => ({
      0: '0',
      1: '00',
      2: '000',
      3: '0,000',
      4: '00,000',
      5: '000,000',
      6: '0,000,000',
      7: '00,000,000',
      8: '000,000,000',
      9: '0,000,000,000',
    }),
    []
  )

  const placeValueKeys = useMemo(
    () => Object.values(placeValue).filter((value) => value !== 1 && value !== 10),
    [placeValue]
  )

  const cards = useMemo(() => {
    if (!inputNumber) return []
    const numberString = inputNumber.toString()
    const digits = numberString.split('')
    const cards = digits.toReversed().map((digit, index) => ({
      firstDigit: parseInt(digit) || 0,
      placeValue: placeValue[index],
      fakeNumbers: digit === '0' ? fakeNumbers[index] : null,
    }))
    return cards.toReversed()
  }, [inputNumber, placeValue, fakeNumbers])

  useEffect(() => {
    if (inputNumber === null) {
      setResetTrigger(0)
      setRandomizeTrigger(0)
    }
  }, [inputNumber])

  return (
    <div className="bg-background h-screen w-screen">
      <div className="flex flex-col items-center h-screen max-w-4xl mx-auto gap-8 pt-16">
        <h1 className="text-5xl font-bold">Hide Zero Cards</h1>
        <Separator />
        <div className="flex flex-col gap-4">
          <NumberInput value={inputNumber} onChange={setInputNumber} />
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => setShowRandomRange(!showRandomRange)}>
                {showRandomRange ? '🔼' : '🔽'}
              </Button>
              <Button size="sm" onClick={handleRandomNumber}>
                🎲 Randomize number
              </Button>
            </div>
            <Button size="sm" disabled={!inputNumber} variant="outline" onClick={handleRandomizeCardPosition}>
              🔀 Randomize positions
            </Button>
            <Button variant="destructive" disabled={!inputNumber} size="sm" onClick={handleResetCardPosition}>
              🔄 Reset cards
            </Button>
          </div>
          {showRandomRange && (
            <div className="flex flex-col gap-2">
              <Separator />
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="flex items-start gap-8 justify-between w-full">
                  <div className="grid grid-cols-3 items-center gap-2 w-full">
                    {placeValueKeys.map((value) => (
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
          )}
        </div>
        <div className="w-full h-96 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
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
    </div>
  )
}
