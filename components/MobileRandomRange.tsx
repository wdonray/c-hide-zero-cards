'use client'

import { ArrowClockwise, CaretDown, Check } from '@phosphor-icons/react'
import { useHeaderContext } from '@/lib/useHeaderContext'
import { PLACE_VALUES, RANDOM_NUMBER_TYPE } from '@/lib/constants'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

const baloo = { fontFamily: 'var(--font-baloo), system-ui, sans-serif' } as const

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
        <span
          className="text-sm font-semibold text-[#2B2118] dark:text-[#FFF6EC]"
          id="mobile-random-range-label"
          style={baloo}
        >
          Random number range
        </span>
        <button
          type="button"
          aria-labelledby="mobile-random-range-label"
          aria-expanded={showRandomRange}
          aria-controls="mobile-random-range-options"
          onClick={() => setShowRandomRange(!showRandomRange)}
          title="Set random number range"
          style={baloo}
          className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-2xl bg-[#C14E33] px-3 text-sm text-white shadow-[0_3px_0_rgba(43,33,24,0.25)] transition-colors hover:bg-[#a83f28] active:bg-[#93371f]"
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
                    style={baloo}
                    className={`flex min-h-12 w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border-2 px-4 py-3 text-left text-base font-semibold transition-colors ${
                      selected
                        ? 'border-[#2B2118] dark:border-[#5a4a3a] bg-[#2B2118] dark:bg-[#FFF6EC] text-white dark:text-[#2B2118] shadow-[0_3px_0_rgba(43,33,24,0.25)]'
                        : 'border-transparent text-[#2B2118] dark:text-[#FFF6EC] hover:border-[#2B2118]/20 dark:hover:border-[#5a4a3a]/30 hover:bg-[#2B2118]/5 dark:hover:bg-[#FFF6EC]/5 active:bg-[#2B2118]/10 dark:active:bg-[#FFF6EC]/10'
                    }`}
                  >
                    <span>Up to {value.toLocaleString()}</span>
                    {selected && <Check className="h-5 w-5 shrink-0" aria-hidden="true" weight="bold" />}
                  </button>
                </li>
              )
            })}
          </ul>

          <Separator className="my-3 bg-[#2B2118]/10 dark:bg-[#FFF6EC]/10" />

          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <Switch
                id="mobile-include-zero"
                checked={randomNumberType === RANDOM_NUMBER_TYPE.ZERO_FOCUS}
                onCheckedChange={(checked) =>
                  setRandomNumberType(checked ? RANDOM_NUMBER_TYPE.ZERO_FOCUS : RANDOM_NUMBER_TYPE.BASIC)
                }
              />
              <Label
                htmlFor="mobile-include-zero"
                className="text-sm font-semibold text-[#2B2118] dark:text-[#FFF6EC]"
                style={baloo}
              >
                Zero focus
              </Label>
            </div>

            <button
              type="button"
              onClick={handleResetRandomNumberRange}
              title="Reset random number range"
              style={baloo}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-[#6B5D4F] dark:text-[#C9BBA8] transition-colors hover:bg-[#2B2118]/5 dark:hover:bg-[#FFF6EC]/5 hover:text-[#2B2118] dark:hover:text-[#FFF6EC]"
            >
              <ArrowClockwise className="h-4 w-4 text-[#C14E33]" aria-hidden="true" weight="bold" />
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
