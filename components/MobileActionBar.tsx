'use client'

import { type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { DiceSix, Shuffle, ArrowClockwise, X, Eye, EyeSlash } from '@phosphor-icons/react'
import { Layers } from 'lucide-react'
import { useHeaderContext } from '@/lib/useHeaderContext'
import { useIsMobile } from '@/lib/useIsMobile'
import { MobileMoreMenu } from './MobileMoreMenu'
import { ZeroStateIndicator } from './ZeroStateIndicator'
import { MOBILE_ACTION_BAR_ID } from '@/lib/scatterArea'
import { cn } from '@/lib/utils'

function BarButton({
  label,
  title,
  onClick,
  disabled,
  primary,
  ghost,
  children,
}: {
  label: string
  title: string
  onClick?: () => void
  disabled?: boolean
  primary?: boolean
  ghost?: boolean
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
        'flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-transparent px-1 transition-all hover:text-[#2B2118] dark:hover:text-[#FFF6EC] disabled:pointer-events-none disabled:opacity-40',
        // Muted label color only when not primary: the primary button keeps
        // white text in both themes (dark: would otherwise override it).
        !primary && 'text-[#6B5D4F] dark:text-[#C9BBA8]',
        primary && 'border-[#8F3520] bg-[#C14E33] text-white hover:text-white',
        ghost && 'text-[#6B5D4F] dark:text-[#C9BBA8]'
      )}
      style={
        primary
          ? { boxShadow: '0 3px 0 #8F3520', fontFamily: 'var(--font-baloo), system-ui, sans-serif' }
          : { fontFamily: 'var(--font-baloo), system-ui, sans-serif' }
      }
    >
      {children}
      <span className="text-[11px] font-semibold leading-tight text-center">{label}</span>
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
  const pathname = usePathname()
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

  // The /version, /analytics, /privacy, /terms, and /about pages are informational;
  // the card actions are meaningless there, so the bar stays out of the way.
  if (
    pathname === '/version' ||
    pathname === '/analytics' ||
    pathname === '/privacy' ||
    pathname === '/terms' ||
    pathname === '/about'
  )
    return null

  function handleClearInput() {
    setInputNumber(null)
    focusNumberInput()
  }

  return (
    <>
      <ZeroStateIndicator className="sr-only" />
      <nav
        id={MOBILE_ACTION_BAR_ID}
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
          {/* Fan-home-only control (owner decision 2026-10-16, issue #141):
              disabled while cards are scattered, when the toggle would be a
              visual no-op. */}
          <BarButton
            label={showZeroCards ? 'Show zeros' : 'Hide zeros'}
            title={
              cardsMoved && inputNumber
                ? 'Return cards to the fan to hide zeros'
                : showZeroCards
                  ? 'Hide zero cards'
                  : 'Show zero cards'
            }
            onClick={toggleZeroCards}
            disabled={!inputNumber || cardsMoved}
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
            ghost
          >
            <X className={cn(ICON_CLASS, 'text-[#C14E33]')} aria-hidden="true" />
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
            triggerClassName="flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-muted-foreground transition-colors hover:text-foreground"
            iconClassName={ICON_CLASS}
          />
        </div>
      </nav>
    </>
  )
}
