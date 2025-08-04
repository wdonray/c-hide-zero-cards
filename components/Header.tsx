'use client'

import { InstructionalGuide } from '@/components/InstructionalGuide'
import { ThemeToggle } from '@/components/ThemeToggle'
import Image from 'next/image'
import logo from '@/app/logo.png'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container m-auto px-8 flex h-14 items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src={logo} alt="Hide Zero Cards Logo" className="h-6 md:h-8 w-auto" />
          <h1 className="text-lg md:text-2xl font-bold">Hide Zero Cards</h1>
        </div>
        <div className="flex items-center gap-2">
          <InstructionalGuide />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
