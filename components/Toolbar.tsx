'use client'

import { useHeaderContext } from '@/lib/useHeaderContext'
import { Button } from '@/components/ui/button'
import { CaretUp, CaretDown, DiceSix, ArrowClockwise, Shuffle, X, Eye, EyeSlash } from '@phosphor-icons/react'
import { Layers } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { PLACE_VALUES } from '@/lib/constants'

export function Toolbar() {
  const {
    isHeaderCollapsed,
    toggleHeader,
    handleRandomNumber,
    isDiceRolling,
    showRandomRange,
    setShowRandomRange,
    randomNumberRange,
    handleRandomNumberRange,
    handleResetRandomNumberRange,
    handleRandomizeCardPosition,
    handleResetCardPosition,
    inputNumber,
    setInputNumber,
    showZeroCards,
    toggleZeroCards,
    setShowNumberFormsDialog,
    cardsMoved,
    focusNumberInput,
  } = useHeaderContext()

  const randomNumberRangeKeys = Object.values(PLACE_VALUES).filter(
    (value) => value !== PLACE_VALUES[0] && value !== PLACE_VALUES[1]
  )

  function handleClearInput() {
    setInputNumber(null)
    focusNumberInput()
  }

  return (
    <>
      <div
        className={`sticky z-40 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/50 transition-all duration-300 ${
          isHeaderCollapsed ? 'top-0' : 'top-14'
        }`}
      >
        <div className="container m-auto px-8 flex h-12 items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex rounded-md shadow-sm" role="group">
              <Button
                size="sm"
                onClick={handleRandomNumber}
                disabled={isDiceRolling}
                className="md:hidden"
                title="Roll a random number"
              >
                <DiceSix className={`h-4 w-4 ${isDiceRolling ? 'animate-dice-roll' : ''}`} />
              </Button>

              <Button
                size="sm"
                onClick={handleRandomNumber}
                disabled={isDiceRolling}
                className="hidden md:flex rounded-r-none"
                title="Roll a random number"
              >
                <DiceSix className={`h-4 w-4 ${isDiceRolling ? 'animate-dice-roll' : ''}`} />
                <span className="hidden md:block">Roll</span>
              </Button>
              <Popover open={showRandomRange} onOpenChange={setShowRandomRange}>
                <PopoverTrigger asChild>
                  <Button
                    size="sm"
                    className="rounded-l-none text-sm px-2 hidden md:block"
                    title="Set random number range"
                  >
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
                            title={`Set random number range to ${value.toLocaleString()}`}
                          >
                            {value.toLocaleString()}
                          </Button>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleResetRandomNumberRange}
                        className="mt-2"
                        title="Reset random number range"
                      >
                        <ArrowClockwise className="h-4 w-4 mr-2 text-blue-600" />
                        Reset to default
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <Button
              variant="outline"
              disabled={!inputNumber}
              size="sm"
              onClick={handleClearInput}
              title="Clear input number and reset cards"
            >
              <X className="h-4 w-4 text-red-600" />
              <span className="hidden md:block">Clear</span>
            </Button>

            <Button
              variant="outline"
              disabled={!inputNumber}
              size="sm"
              onClick={toggleZeroCards}
              title={showZeroCards ? 'Hide zero cards' : 'Show zero cards'}
            >
              {showZeroCards ? (
                <EyeSlash className="h-4 w-4 text-slate-600" />
              ) : (
                <Eye className="h-4 w-4 text-slate-600" />
              )}
              <span className="hidden md:block">Zero</span>
            </Button>

            <Button
              size="sm"
              disabled={!inputNumber}
              variant="outline"
              onClick={handleRandomizeCardPosition}
              title="Randomize card position"
            >
              <Shuffle className="h-4 w-4 text-purple-600" />
              <span className="hidden md:block">Mix</span>
            </Button>

            <Button
              variant="outline"
              disabled={!inputNumber || !cardsMoved}
              size="sm"
              onClick={handleResetCardPosition}
              title="Reset cards to original position"
            >
              <ArrowClockwise className="h-4 w-4 text-green-600" />
              <span className="hidden md:block">Reset</span>
            </Button>

            <Button
              variant="outline"
              disabled={!inputNumber}
              size="sm"
              onClick={() => setShowNumberFormsDialog(true)}
              title={
                inputNumber
                  ? `Number Forms & Representations for ${inputNumber?.toLocaleString()}`
                  : 'Number Forms & Representations'
              }
            >
              <Layers className="h-4 w-4 text-blue-600" />
              <span className="hidden md:block">Number Forms</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleHeader}
            title={isHeaderCollapsed ? 'Expand header' : 'Collapse header'}
          >
            {isHeaderCollapsed ? <CaretDown className="h-4 w-4" /> : <CaretUp className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </>
  )
}
