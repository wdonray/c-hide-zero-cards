import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CaretDown, ArrowClockwise } from '@phosphor-icons/react'
import { useHeaderContext } from '@/lib/useHeaderContext'
import { PLACE_VALUES } from '@/lib/constants'
import { RANDOM_NUMBER_TYPE } from '@/lib/constants'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export function RandomNumberPopover() {
  const {
    showRandomRange,
    setShowRandomRange,
    randomNumberRange,
    handleRandomNumberRange,
    handleResetRandomNumberRange,
    setRandomNumberType,
    randomNumberType,
  } = useHeaderContext()

  const onePlaceValue = PLACE_VALUES[0]
  const tenPlaceValue = PLACE_VALUES[1]
  const excludedPlaceValues = [onePlaceValue, tenPlaceValue]
  const randomNumberRangeKeys = Object.values(PLACE_VALUES).filter((value) => !excludedPlaceValues.includes(value))

  return (
    <Popover open={showRandomRange} onOpenChange={setShowRandomRange}>
      <PopoverTrigger asChild>
        <button
          className="cursor-pointer inline-flex h-[64px] items-center justify-center gap-1 rounded-l-none rounded-r-full border-2 border-l-0 border-[#2B2118] bg-white px-4 text-[15px] font-semibold text-[#2B2118] transition-colors hover:bg-[#FFF6EC] active:bg-[#FFEED5]"
          style={{
            boxShadow: '0 3px 0 rgba(43, 33, 24, 0.15)',
            fontFamily: 'var(--font-baloo), system-ui, sans-serif',
          }}
          title="Set random number range"
          aria-label="Set random number range"
        >
          Range
          <CaretDown className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 rounded-3xl border-2 border-[#2B2118] dark:border-[#5a4a3a] bg-[#FFF6EC] dark:bg-[#2a2118] p-5 shadow-[0_6px_0_rgba(43,33,24,0.15)]">
        <div className="grid gap-4">
          <h3
            className="text-center text-[18px] font-bold text-[#2B2118] dark:text-[#FFF6EC]"
            style={{ fontFamily: 'var(--font-baloo), system-ui, sans-serif' }}
          >
            Random Number Range
          </h3>

          <div className="h-0.5 rounded-full bg-[#2B2118]/10 dark:bg-[#FFF6EC]/10" />

          <div className="grid gap-2">
            <div className="grid grid-cols-3 gap-2">
              {randomNumberRangeKeys.map((value) => (
                <button
                  key={value}
                  onClick={() => handleRandomNumberRange([randomNumberRange[0], value])}
                  title={`Set random number range to ${value.toLocaleString()}`}
                  className={`rounded-2xl border-2 px-3 py-2 text-[15px] font-semibold transition-all ${
                    randomNumberRange[1] === value
                      ? 'border-[#2B2118] dark:border-[#5a4a3a] bg-[#2B2118] dark:bg-[#FFF6EC] text-white dark:text-[#2B2118] shadow-[0_3px_0_rgba(43,33,24,0.3)]'
                      : 'border-[#2B2118]/20 dark:border-[#5a4a3a]/30 bg-white dark:bg-[#1a1512] text-[#2B2118] dark:text-[#FFF6EC] hover:border-[#2B2118] dark:hover:border-[#5a4a3a] hover:bg-white dark:hover:bg-[#2a2118]'
                  }`}
                  style={{ fontFamily: 'var(--font-baloo), system-ui, sans-serif' }}
                >
                  {value.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="h-0.5 rounded-full bg-[#2B2118]/10 dark:bg-[#FFF6EC]/10" />

            <div className="grid grid-cols-2 items-center gap-2">
              <div className="flex items-center justify-center gap-2">
                <Switch
                  id="includeZero"
                  checked={randomNumberType === RANDOM_NUMBER_TYPE.ZERO_FOCUS}
                  onCheckedChange={(checked) =>
                    setRandomNumberType(checked ? RANDOM_NUMBER_TYPE.ZERO_FOCUS : RANDOM_NUMBER_TYPE.BASIC)
                  }
                />
                <Label htmlFor="includeZero" className="text-sm font-semibold text-[#2B2118] dark:text-[#FFF6EC]">
                  Zero focus
                </Label>
              </div>

              <button
                onClick={handleResetRandomNumberRange}
                title="Reset random number range"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-transparent px-3 py-2 text-[15px] font-semibold text-[#6B5D4F] dark:text-[#C9BBA8] transition-colors hover:border-[#2B2118]/20 dark:hover:border-[#5a4a3a]/30 hover:bg-white dark:hover:bg-[#1a1512] hover:text-[#2B2118] dark:hover:text-[#FFF6EC]"
                style={{ fontFamily: 'var(--font-baloo), system-ui, sans-serif' }}
              >
                <ArrowClockwise className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
