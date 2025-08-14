'use client'

import { InstructionalGuideDialog } from '@/components/InstructionalGuideDialog'
import { ThemeToggle } from '@/components/ThemeToggle'
import Image from 'next/image'
import logo from '@/app/logo.png'
import { useHeaderContext } from '@/lib/useHeaderContext'

export function Header() {
  const { isHeaderCollapsed } = useHeaderContext()

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ${
        isHeaderCollapsed ? 'h-0 overflow-hidden' : 'h-14'
      }`}
    >
      <div
        className={`container m-auto px-8 flex items-center justify-between transition-all duration-300 ${
          isHeaderCollapsed ? 'h-0 opacity-0' : 'h-14 opacity-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <Image src={logo} alt="Hide Zero Cards Logo" className="h-6 md:h-8 w-auto" priority />
          <h1 className="text-lg md:text-2xl font-bold">Hide Zero Cards</h1>
        </div>
        <div className="flex items-center gap-2">
          <InstructionalGuideDialog />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
