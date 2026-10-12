'use client'

import { APP_HEADER_ID } from '@/lib/scatterArea'
import { FullscreenButton } from '@/components/FullscreenButton'
import { InstructionalGuideDialog } from '@/components/InstructionalGuideDialog'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useIsMobile } from '@/lib/useIsMobile'
import Image from 'next/image'
import Link from 'next/link'
import logo from '@/app/logo.png'

export function Header() {
  const isMobile = useIsMobile()

  return (
    <header
      id={APP_HEADER_ID}
      // The top safe-area inset keeps the sticky header clear of the notch /
      // Dynamic Island once viewport-fit=cover lets the page extend under it.
      // env() is 0 on desktop, so this is a no-op there: the calc falls back
      // to exactly 60px and the padding to 0.
      className="sticky top-0 z-50 h-[calc(60px+env(safe-area-inset-top))] w-full bg-white pt-[env(safe-area-inset-top)]"
      style={{
        boxShadow: '0 2px 12px rgba(43, 33, 24, 0.06)',
        fontFamily: 'var(--font-baloo), system-ui, sans-serif',
      }}
    >
      <div className="flex h-full items-center justify-between px-7">
        <Link
          href="/"
          aria-label="Hide Zero Cards home"
          className="flex items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <Image src={logo} alt="Hide Zero Cards Logo" className="h-9 w-auto" />
          <span className="text-2xl font-extrabold tracking-tight text-[#2B2118]">
            Hide <span className="text-[#C14E33]">Zero</span> Cards
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {/* Desktop: guide and theme live in the header. On mobile they
              live in the bottom bar's More menu (single instance per
              platform in the accessibility tree). */}
          {!isMobile && (
            <>
              <InstructionalGuideDialog />
              <ThemeToggle />
              <FullscreenButton />
            </>
          )}
        </div>
      </div>
    </header>
  )
}
