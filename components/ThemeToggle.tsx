'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()

  const toggle = () => {
    // If currently dark (or system resolving to dark), go light, else go dark
    const isDark = theme === 'dark' || (theme === 'system' && resolvedTheme === 'dark')
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="cursor-pointer inline-flex h-11 w-11 items-center justify-center rounded-full text-[#2B2118] dark:text-[#FFF6EC] transition-colors hover:bg-[#FFF6EC] dark:hover:bg-[#2a2118] focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{ fontFamily: 'var(--font-baloo), system-ui, sans-serif' }}
      title="Toggle light/dark mode"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
