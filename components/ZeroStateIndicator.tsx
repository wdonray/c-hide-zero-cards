'use client'

import { useHeaderContext } from '@/lib/useHeaderContext'
import { cn } from '@/lib/utils'

/**
 * Tiny always-visible readout of the zero-cards toggle state. Rendered above
 * the mobile action bar and under the desktop toolbar so the current state
 * is glanceable. role="status" announces changes to screen readers.
 */
export function ZeroStateIndicator({ className }: { className?: string }) {
  const { showZeroCards } = useHeaderContext()

  return (
    <p role="status" className={cn('text-[11px] leading-none text-muted-foreground', className)}>
      {showZeroCards ? 'Zeros shown' : 'Zeros hidden'}
    </p>
  )
}
