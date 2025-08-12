'use client'

import { useState, useEffect, ReactNode } from 'react'

interface HydrationCheckProps {
  children: ReactNode
}

export function HydrationCheck({ children }: HydrationCheckProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return null // Prevent rendering until hydration is complete
  }

  return <>{children}</>
}
