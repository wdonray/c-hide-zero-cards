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
  'inline-flex h-[52px] items-center gap-2 rounded-full border-2 border-[#2B2118] bg-white px-[22px] text-[17px] font-semibold text-[#2B2118] transition-all hover:-translate-y-px active:translate-y-[2px] disabled:opacity-40 disabled:pointer-events-none'

const pillShadow = '0 3px 0 rgba(43, 33, 24, 0.15)'

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

  // The /version, /analytics, /privacy, and /terms pages are informational;
  // the card actions are meaningless there, so the toolbar unmounts
  // entirely (same pattern as the mobile action bar).
  if (pathname === '/version' || pathname === '/analytics' || pathname === '/privacy' || pathname === '/terms')
    return null

  // On mobile the top toolbar is superseded by the bottom action bar
  // (MobileActionBar), which carries the same actions with visible labels.
  if (isMobile) return null

  return (
    <div id={APP_TOOLBAR_ID} className="w-full" style={{ background: '#FFF6EC' }}>
      <div className="flex flex-wrap items-center justify-center gap-3 px-5 py-[18px]" style={baloo}>
        <NumberInput ref={numberInputRef} value={inputNumber} onChange={setInputNumber} />

        <button
          onClick={toggleZeroCards}
          disabled={!inputNumber}
          title={showZeroCards ? 'Hide zero cards' : 'Show zero cards'}
          className="inline-flex h-[52px] items-center gap-2 rounded-full border-2 border-[#C14E33] bg-[#E76F51] px-[22px] text-[17px] font-semibold text-white transition-all hover:-translate-y-px active:translate-y-[2px] disabled:opacity-40 disabled:pointer-events-none"
          style={{ ...baloo, boxShadow: '0 3px 0 #C14E33' }}
        >
          {showZeroCards ? <EyeSlash className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          {showZeroCards ? 'Show zeros' : 'Hide zeros'}
        </button>

        <div className="inline-flex items-center" role="group" aria-label="Roll random number">
          <button
            onClick={handleRandomNumber}
            disabled={isDiceRolling}
            title="Roll a random number"
            className="inline-flex h-[52px] items-center gap-2 rounded-l-full rounded-r-none border-2 border-r-0 border-[#2B2118] bg-white px-[22px] text-[17px] font-semibold text-[#2B2118] transition-all hover:-translate-y-px active:translate-y-[2px] disabled:opacity-40 disabled:pointer-events-none"
            style={{ ...baloo, boxShadow: pillShadow }}
          >
            <DiceSix className={`h-5 w-5 ${isDiceRolling ? 'animate-dice-roll' : ''}`} />
            Roll
          </button>
          <RandomNumberPopover />
        </div>

        <button
          onClick={handleRandomizeCardPosition}
          disabled={!inputNumber}
          title="Mix: scatter cards to random positions"
          className={pillBase}
          style={{ ...baloo, boxShadow: pillShadow }}
        >
          <Shuffle className="h-5 w-5" />
          Mix
        </button>

        <button
          onClick={handleResetCardPosition}
          disabled={!inputNumber || !cardsMoved}
          title="Reset cards to fan position"
          className={pillBase}
          style={{ ...baloo, boxShadow: pillShadow }}
        >
          <ArrowClockwise className="h-5 w-5" />
          Reset
        </button>

        <button
          onClick={handleClearInput}
          disabled={!inputNumber}
          title="Clear input number and reset cards"
          className={pillBase}
          style={{ ...baloo, boxShadow: pillShadow }}
        >
          <X className="h-5 w-5" />
          Clear
        </button>

        <button
          onClick={() => setShowNumberFormsDialog(true)}
          disabled={!inputNumber}
          title={inputNumber ? `Number Forms for ${inputNumber.toLocaleString()}` : 'Number Forms'}
          className={pillBase}
          style={{ ...baloo, boxShadow: pillShadow }}
        >
          <Layers className="h-5 w-5" />
          Forms
        </button>
      </div>
    </div>
  )
}
