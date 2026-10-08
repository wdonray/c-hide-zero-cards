'use client'

import { useEffect, useState } from 'react'
import { X } from '@phosphor-icons/react'
import { useNewVersionAvailable } from '@/lib/useNewVersion'
import { COARSE_POINTER_TOUCH_TARGET } from '@/lib/constants'
import { cn } from '@/lib/utils'

/**
 * Small toast shown when a newer deploy is detected. Mounted once in the
 * root layout so it is active on every page. Dismissing hides it for the
 * current page session only. It reappears on the next page load while the
 * app is still stale.
 */
export function VersionReloadToast() {
  const updateAvailable = useNewVersionAvailable()
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!updateAvailable || dismissed) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDismissed(true)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [updateAvailable, dismissed])

  if (!updateAvailable || dismissed) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 bottom-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg max-md:right-4 max-md:bottom-28 max-md:left-4"
      style={{ background: 'var(--toast-bg)', color: 'var(--toast-text)', borderColor: 'var(--toast-border)' }}
    >
      <p className="leading-snug">A new version is available. Reload to get the latest.</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className={cn(
          'shrink-0 rounded-md bg-blue-600 px-3 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-white/70 focus:outline-hidden',
          COARSE_POINTER_TOUCH_TARGET
        )}
      >
        Reload
      </button>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setDismissed(true)}
        className="flex size-9 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-black/5 focus:ring-2 focus:ring-current focus:outline-hidden pointer-coarse:size-11 dark:hover:bg-white/10"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  )
}
