'use client'

import { type ReactNode } from 'react'
import { DiceSix, Shuffle, ArrowClockwise, X, Eye, EyeSlash } from '@phosphor-icons/react'
import { Layers } from 'lucide-react'
import { useHeaderContext } from '@/lib/useHeaderContext'
import { useIsMobile } from '@/lib/useIsMobile'
import { MobileMoreMenu } from './MobileMoreMenu'
import { cn } from '@/lib/utils'

function BarButton({
  label,
  title,
  onClick,
  disabled,
  primary,
  children,
}: {
  label: string
  title: string
  onClick?: () => void
  disabled?: boolean
  primary?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40',
        primary && 'bg-blue-600 text-white hover:bg-blue-700 hover:text-white'
      )}
    >
      {children}
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </button>
  )
}

const ICON_CLASS = 'h-5 w-5'

/**
 * Bottom-anchored action bar for mobile (< 768px): thumb-reachable, with
 * icon + text labels (icon-only buttons have no hover tooltips on touch, so
 * labels carry the meaning). Carries the same actions as the desktop
 * toolbar, which is unmounted on mobile to keep a single instance of each
 * control in the DOM.
 */
export function MobileActionBar() {
  const isMobile = useIsMobile()
  const {
    handleRandomNumber,
    isDiceRolling,
    toggleZeroCards,
    showZeroCards,
    handleRandomizeCardPosition,
    handleResetCardPosition,
    cardsMoved,
    inputNumber,
    setInputNumber,
    focusNumberInput,
    setShowNumberFormsDialog,
  } = useHeaderContext()

  // Unmounted (not CSS-hidden) off-mobile so the desktop toolbar remains the
  // only instance of these controls in the DOM and accessibility tree.
  if (!isMobile) return null

  function handleClearInput() {
    setInputNumber(null)
    focusNumberInput()
  }

  return (
    <nav
      aria-label="Quick actions"
      className="z-50 w-full shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden"
    >
      <div className="grid grid-cols-7 gap-0.5 px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom),0.375rem)]">
        <BarButton
          label="Roll"
          title="Roll a random number"
          onClick={handleRandomNumber}
          disabled={isDiceRolling}
          primary
        >
          <DiceSix className={cn(ICON_CLASS, isDiceRolling && 'animate-dice-roll')} aria-hidden="true" />
        </BarButton>
        <BarButton
          label="Zero"
          title={showZeroCards ? 'Hide zero cards' : 'Show zero cards'}
          onClick={toggleZeroCards}
          disabled={!inputNumber}
        >
          {showZeroCards ? (
            <EyeSlash className={ICON_CLASS} aria-hidden="true" />
          ) : (
            <Eye className={ICON_CLASS} aria-hidden="true" />
          )}
        </BarButton>
        <BarButton
          label="Mix"
          title="Randomize card position"
          onClick={handleRandomizeCardPosition}
          disabled={!inputNumber}
        >
          <Shuffle className={ICON_CLASS} aria-hidden="true" />
        </BarButton>
        <BarButton
          label="Reset"
          title="Reset cards to original position"
          onClick={handleResetCardPosition}
          disabled={!inputNumber || !cardsMoved}
        >
          <ArrowClockwise className={ICON_CLASS} aria-hidden="true" />
        </BarButton>
        <BarButton
          label="Clear"
          title="Clear input number and reset cards"
          onClick={handleClearInput}
          disabled={!inputNumber}
        >
          <X className={ICON_CLASS} aria-hidden="true" />
        </BarButton>
        <BarButton
          label="Forms"
          title={
            inputNumber
              ? `Number Forms & Representations for ${inputNumber?.toLocaleString()}`
              : 'Number Forms & Representations'
          }
          onClick={() => setShowNumberFormsDialog(true)}
          disabled={!inputNumber}
        >
          <Layers className={ICON_CLASS} aria-hidden="true" />
        </BarButton>
        <MobileMoreMenu
          triggerClassName="flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-muted-foreground transition-colors hover:text-foreground"
          iconClassName={ICON_CLASS}
        />
      </div>
    </nav>
  )
}
