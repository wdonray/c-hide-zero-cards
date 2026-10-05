'use client'

import { InstructionalGuideDialog } from '@/components/InstructionalGuideDialog'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useIsMobile } from '@/lib/useIsMobile'
import Image from 'next/image'
import Link from 'next/link'
import logo from '@/app/logo.png'
import { useHeaderContext } from '@/lib/useHeaderContext'

export function Header() {
  const { isHeaderCollapsed } = useHeaderContext()
  const isMobile = useIsMobile()
  // On mobile the header is always expanded: the collapse toggle lives in
  // the (desktop-only) toolbar, and the compact mobile header is small enough
  // to keep visible.
  const collapsed = isMobile ? false : isHeaderCollapsed

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ${
        // The top safe-area inset keeps the sticky header clear of the notch /
        // Dynamic Island once viewport-fit=cover lets the page extend under it.
        // env() is 0 on desktop, so this is a no-op there: the calc falls back
        // to exactly h-14 and the padding to 0.
        collapsed ? 'h-0 overflow-hidden' : 'h-[calc(3.5rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)]'
      }`}
    >
      <div
        className={`container m-auto px-4 md:px-8 flex items-center justify-between transition-all duration-300 ${
          collapsed ? 'h-0 opacity-0' : 'h-14 opacity-100'
        }`}
      >
        <Link
          href="/"
          aria-label="Hide Zero Cards home"
          className="flex items-center gap-2 md:gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Image src={logo} alt="Hide Zero Cards Logo" className="h-6 md:h-8 w-auto" />
          <h1 className="text-base md:text-2xl font-bold whitespace-nowrap">Hide Zero Cards</h1>
        </Link>
        {/* On mobile the guide and theme actions live in the bottom bar's
            More menu; the header keeps only the wordmark. Unmounting (rather
            than CSS-hiding) keeps a single instance of each control in the
            accessibility tree. */}
        {!isMobile && (
          <div className="flex items-center gap-1.5 md:gap-2">
            <InstructionalGuideDialog />
            <ThemeToggle />
          </div>
        )}
      </div>
    </header>
  )
}
