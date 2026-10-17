'use client'

import { usePathname } from 'next/navigation'
import { useHeaderContext } from '@/lib/useHeaderContext'
import { useIsMobile } from '@/lib/useIsMobile'
import { NumberInput } from '@/components/NumberInput'
import { DiceSix, ArrowClockwise, Shuffle, X, Eye, EyeSlash } from '@phosphor-icons/react'
import { Layers } from 'lucide-react'
import { RandomNumberPopover } from './RandomNumberPopover'
import { APP_TOOLBAR_ID } from '@/lib/scatterArea'

const pillBase =
  'cursor-pointer inline-flex h-[64px] items-center gap-2 rounded-full border-2 border-[#2B2118] dark:border-[#5a4a3a] bg-white dark:bg-[#2a2118] px-[22px] text-[18px] font-semibold text-[#2B2118] dark:text-[#FFF6EC] transition-all hover:-translate-y-px active:translate-y-[2px] disabled:opacity-40 disabled:pointer-events-none'

const pillShadow = '0 3px 0 rgba(43, 33, 24, 0.15)'

const ghostBase =
  'cursor-pointer inline-flex h-[64px] items-center gap-2 rounded-full border-2 border-transparent bg-transparent px-[22px] text-[18px] font-semibold transition-all hover:-translate-y-px active:translate-y-[2px] disabled:opacity-40 disabled:pointer-events-none'

const baloo = { fontFamily: 'var(--font-baloo), system-ui, sans-serif' } as const

export function Toolbar() {
  const isMobile = useIsMobile()
  const pathname = usePathname()
  const {
    handleRandomNumber,
    isDiceRolling,
    handleRandomizeCardPosition,
    handleResetCardPosition,
    inputNumber,
    setInputNumber,
    showZeroCards,
    toggleZeroCards,
    setShowNumberFormsDialog,
    cardsMoved,
    focusNumberInput,
    numberInputRef,
  } = useHeaderContext()

  function handleClearInput() {
    setInputNumber(null)
    focusNumberInput()
  }

  // The /version, /analytics, /privacy, /terms, and /about pages are informational;
  // the card actions are meaningless there, so the toolbar unmounts
  // entirely (same pattern as the mobile action bar).
  if (
    pathname === '/version' ||
    pathname === '/analytics' ||
    pathname === '/privacy' ||
    pathname === '/terms' ||
    pathname === '/about'
  )
    return null

  // On mobile the top toolbar is superseded by the bottom action bar
  // (MobileActionBar), which carries the same actions with visible labels.
  if (isMobile) return null

  return (
    <div id={APP_TOOLBAR_ID} className="w-full bg-[#FFF6EC] dark:bg-[#1a1512]">
      <div className="flex flex-wrap items-center justify-center gap-3 px-5 py-5" style={baloo}>
        <NumberInput ref={numberInputRef} value={inputNumber} onChange={setInputNumber} />

        {/* Hide zeros is a fan-home-only control (owner decision 2026-10-16,
            issue #141): with cards scattered the toggle would be a visual
            no-op (displacing a zero card reveals it), so it is disabled with
            a tooltip explaining why. The preference itself persists and
            auto-restores when the cards return home. */}
        <button
          onClick={toggleZeroCards}
          disabled={!inputNumber || cardsMoved}
          title={
            cardsMoved && inputNumber
              ? 'Return cards to the fan to hide zeros'
              : showZeroCards
                ? 'Hide zero cards'
                : 'Show zero cards'
          }
          className="inline-flex h-[64px] items-center gap-2 rounded-full border-2 border-[#8F3520] bg-[#C14E33] px-[22px] text-[18px] font-semibold text-white transition-all hover:-translate-y-px active:translate-y-[2px] disabled:opacity-40 disabled:pointer-events-none"
          style={{ ...baloo, boxShadow: '0 4px 0 #8F3520' }}
        >
          {showZeroCards ? <EyeSlash className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
          {/* Both labels share one grid cell, sized to the wider one, so the
              button keeps a constant width across toggles and the centered
              toolbar never reflows (issue #152). The hidden label is invisible
              (not unmounted) so its width still counts. */}
          <span className="grid items-center">
            <span
              aria-hidden={!showZeroCards}
              className={`[grid-area:1/1] whitespace-nowrap ${showZeroCards ? '' : 'invisible'}`}
            >
              Show zeros
            </span>
            <span
              aria-hidden={showZeroCards}
              className={`[grid-area:1/1] whitespace-nowrap ${showZeroCards ? 'invisible' : ''}`}
            >
              Hide zeros
            </span>
          </span>
        </button>

        <div className="inline-flex items-center" role="group" aria-label="Roll random number">
          <button
            onClick={handleRandomNumber}
            disabled={isDiceRolling}
            title="Roll a random number"
            className="inline-flex h-[64px] items-center gap-2 rounded-l-full rounded-r-none border-2 border-r-0 border-[#2B2118] dark:border-[#5a4a3a] bg-white dark:bg-[#2a2118] px-[22px] text-[18px] font-semibold text-[#2B2118] dark:text-[#FFF6EC] transition-colors hover:bg-[#FFF6EC] dark:hover:bg-[#3a2f26] active:bg-[#FFEED5] dark:active:bg-[#4a3a2a] disabled:opacity-40 disabled:pointer-events-none"
            style={{ ...baloo, boxShadow: pillShadow }}
          >
            <DiceSix className={`h-6 w-6 ${isDiceRolling ? 'animate-dice-roll' : ''}`} />
            Roll
          </button>
          <RandomNumberPopover />
        </div>

        <button
          onClick={handleRandomizeCardPosition}
          disabled={!inputNumber}
          title="Randomize card position"
          className={pillBase}
          style={{ ...baloo, boxShadow: pillShadow }}
        >
          <Shuffle className="h-6 w-6" />
          Mix
        </button>

        <button
          onClick={handleResetCardPosition}
          disabled={!inputNumber || !cardsMoved}
          title="Reset cards to original position"
          className={pillBase}
          style={{ ...baloo, boxShadow: pillShadow }}
        >
          <ArrowClockwise className="h-6 w-6" />
          Reset
        </button>

        <button
          onClick={handleClearInput}
          disabled={!inputNumber}
          title="Clear input number and reset cards"
          className={ghostBase}
          style={baloo}
        >
          <X className="h-6 w-6 text-[#C14E33]" />
          <span className="text-[#6B5D4F] dark:text-[#FFF6EC]">Clear</span>
        </button>

        <button
          onClick={() => setShowNumberFormsDialog(true)}
          disabled={!inputNumber}
          title={inputNumber ? `Number Forms for ${inputNumber.toLocaleString()}` : 'Number Forms'}
          className={pillBase}
          style={{ ...baloo, boxShadow: pillShadow }}
        >
          <Layers className="h-6 w-6" />
          Ways to write it
        </button>
      </div>
    </div>
  )
}
