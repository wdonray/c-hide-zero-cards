'use client'

import { ArrowClockwise, CaretDown, Check } from '@phosphor-icons/react'
import { useHeaderContext } from '@/lib/useHeaderContext'
import { PLACE_VALUES, RANDOM_NUMBER_TYPE } from '@/lib/constants'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

const onePlaceValue = PLACE_VALUES[0]
const tenPlaceValue = PLACE_VALUES[1]
const excludedPlaceValues = [onePlaceValue, tenPlaceValue]
const randomNumberRangeKeys = Object.values(PLACE_VALUES).filter((value) => !excludedPlaceValues.includes(value))

/**
 * Mobile-only random number range control for the More bottom sheet.
 *
 * The desktop popover opens as a small overlapping card, which is cramped on
 * a phone. Here the options expand inline as a vertical list of full-width
 * 48px rows inside the sheet instead. Desktop (Toolbar + RandomNumberPopover)
 * is untouched; this component only renders inside MobileMoreMenu.
 */
export function MobileRandomRange() {
  const {
    showRandomRange,
    setShowRandomRange,
    randomNumberRange,
    handleRandomNumberRange,
    handleResetRandomNumberRange,
    setRandomNumberType,
    randomNumberType,
  } = useHeaderContext()

  return (
    <div className="border-b">
      <div className="flex min-h-14 items-center justify-between gap-4 py-2">
        <span className="text-sm font-medium" id="mobile-random-range-label">
          Random number range
        </span>
        <button
          type="button"
          aria-labelledby="mobile-random-range-label"
          aria-expanded={showRandomRange}
          aria-controls="mobile-random-range-options"
          onClick={() => setShowRandomRange(!showRandomRange)}
          title="Set random number range"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-md bg-primary px-3 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <CaretDown
            className={`h-4 w-4 transition-transform duration-200 ${showRandomRange ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {showRandomRange && (
        <div id="mobile-random-range-options" className="pb-4">
          <ul className="flex flex-col gap-1" aria-labelledby="mobile-random-range-label">
            {randomNumberRangeKeys.map((value) => {
              const selected = randomNumberRange[1] === value
              return (
                <li key={value}>
                  <button
                    type="button"
                    onClick={() => {
                      handleRandomNumberRange([randomNumberRange[0], value])
                      setShowRandomRange(false)
                    }}
                    aria-pressed={selected}
                    title={`Set random number range to ${value.toLocaleString()}`}
                    className={`flex min-h-12 w-full items-center justify-between gap-4 rounded-lg px-4 py-3 text-left text-base transition-colors ${
                      selected ? 'bg-accent font-semibold' : 'hover:bg-accent/50 active:bg-accent/70'
                    }`}
                  >
                    <span>Up to {value.toLocaleString()}</span>
                    {selected && <Check className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />}
                  </button>
                </li>
              )
            })}
          </ul>

          <Separator className="my-3" />

          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <Switch
                id="mobile-include-zero"
                checked={randomNumberType === RANDOM_NUMBER_TYPE.ZERO_FOCUS}
                onCheckedChange={(checked) =>
                  setRandomNumberType(checked ? RANDOM_NUMBER_TYPE.ZERO_FOCUS : RANDOM_NUMBER_TYPE.BASIC)
                }
              />
              <Label htmlFor="mobile-include-zero" className="text-sm">
                Zero focus
              </Label>
            </div>

            <button
              type="button"
              onClick={handleResetRandomNumberRange}
              title="Reset random number range"
              className="flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent/50"
            >
              <ArrowClockwise className="h-4 w-4 text-blue-600" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
