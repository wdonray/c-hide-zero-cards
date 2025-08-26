import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CaretDown, ArrowClockwise } from '@phosphor-icons/react'
import { useHeaderContext } from '@/lib/useHeaderContext'
import { PLACE_VALUES } from '@/lib/constants'
import { RANDOM_NUMBER_TYPE } from '@/lib/constants'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

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
        <Button size="sm" className="rounded-l-none text-sm px-2 hidden md:block" title="Set random number range">
          <CaretDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <h3 className="font-medium leading-none text-center">Random Number Range</h3>

          <Separator />

          <div className="grid gap-2">
            <div className="grid grid-cols-3 gap-4">
              {randomNumberRangeKeys.map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={randomNumberRange[1] === value ? 'outline' : 'ghost'}
                  onClick={() => handleRandomNumberRange([randomNumberRange[0], value])}
                  title={`Set random number range to ${value.toLocaleString()}`}
                >
                  {value.toLocaleString()}
                </Button>
              ))}
            </div>

            <Separator />

            <div className="grid grid-cols-2 items-center gap-2">
              <div className="flex items-center justify-center gap-2">
                <Switch
                  id="includeZero"
                  checked={randomNumberType === RANDOM_NUMBER_TYPE.ZERO_FOCUS}
                  onCheckedChange={(checked) =>
                    setRandomNumberType(checked ? RANDOM_NUMBER_TYPE.ZERO_FOCUS : RANDOM_NUMBER_TYPE.BASIC)
                  }
                />
                <Label htmlFor="includeZero" className="text-sm">
                  Zero focus
                </Label>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleResetRandomNumberRange}
                title="Reset random number range"
              >
                <ArrowClockwise className="h-4 w-4 mr-2 text-blue-600" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
