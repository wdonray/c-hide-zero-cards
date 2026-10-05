'use client'

import { useSyncExternalStore, ReactNode } from 'react'

interface HydrationCheckProps {
  children: ReactNode
}

function subscribe() {
  return () => {}
}

export function HydrationCheck({ children }: HydrationCheckProps) {
  // False on the server (and during hydration, matching SSR output), true on
  // the client afterwards. Replaces the setState-in-effect mount flag with
  // identical semantics and no cascading render.
  const isHydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )

  if (!isHydrated) {
    return null // Prevent rendering until hydration is complete
  }

  return <>{children}</>
}
