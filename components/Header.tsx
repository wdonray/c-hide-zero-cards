import { InstructionalGuide } from '@/components/InstructionalGuide'
import { ThemeToggle } from '@/components/ThemeToggle'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container m-auto px-8 flex h-14 items-center justify-between">
        <h1 className="text-2xl font-bold">Hide Zero Cards</h1>
        <div className="flex items-center gap-2">
          <InstructionalGuide />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
