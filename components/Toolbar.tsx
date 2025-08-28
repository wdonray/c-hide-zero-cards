'use client'

import { useHeaderContext } from '@/lib/useHeaderContext'
import { Button } from '@/components/ui/button'
import { CaretUp, CaretDown, DiceSix, ArrowClockwise, Shuffle, X, Eye, EyeSlash } from '@phosphor-icons/react'
import { Layers } from 'lucide-react'
import { RandomNumberPopover } from './RandomNumberPopover'

export function Toolbar() {
  const {
    isHeaderCollapsed,
    toggleHeader,
    handleRandomNumber,
    isDiceRolling,
    handleRandomizeCardPosition,
    handleResetCardPosition,
    inputNumber,
    setInputNumber,
    showZeroCards,
    toggleZeroCards,
    setShowNumberFormsDialog,
    showNumberFormsSection,
    setShowNumberFormsSection,
    cardsMoved,
    focusNumberInput,
  } = useHeaderContext()

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
              <RandomNumberPopover />
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
              onClick={() => {
                setShowNumberFormsSection(!showNumberFormsSection)
                // Scroll to the section after a brief delay to allow for render
                if (!showNumberFormsSection) {
                  setTimeout(() => {
                    const section = document.getElementById('number-forms-section')
                    if (section) {
                      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }, 100)
                }
              }}
              title={
                inputNumber
                  ? `${showNumberFormsSection ? 'Hide' : 'Show'} Number Forms & Representations for ${inputNumber?.toLocaleString()}`
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
