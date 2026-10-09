'use client'

import { useEffect, useRef, useState } from 'react'
import { WarningCircle, X } from '@phosphor-icons/react'
import { dismissToast, subscribeToasts, type ErrorToast } from '@/lib/error-toast'
import { COARSE_POINTER_TOUCH_TARGET } from '@/lib/constants'
import { cn } from '@/lib/utils'

const AUTO_DISMISS_MS = 8000

/**
 * One error toast. Auto-dismisses after AUTO_DISMISS_MS; the timer pauses
 * while hovered or focused so it can be read and dismissed deliberately.
 */
function ErrorToastItem({ toast }: { toast: ErrorToast }) {
  const [paused, setPaused] = useState(false)
  const remainingMs = useRef(AUTO_DISMISS_MS)
  const resumedAt = useRef(0)

  useEffect(() => {
    if (paused) return
    resumedAt.current = Date.now()
    const timer = window.setTimeout(() => dismissToast(toast.id), remainingMs.current)
    return () => window.clearTimeout(timer)
  }, [paused, toast.id])

  function pause() {
    remainingMs.current = Math.max(0, remainingMs.current - (Date.now() - resumedAt.current))
    setPaused(true)
  }

  function resume() {
    setPaused(false)
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') dismissToast(toast.id)
  }

  return (
    <div
      role="alert"
      aria-atomic="true"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      onKeyDown={handleKeyDown}
      className="pointer-events-auto flex w-full items-center gap-3 rounded-xl border border-neutral-700 border-l-4 border-l-red-500 bg-neutral-900 px-4 py-3 text-neutral-50 shadow-lg motion-reduce:transition-none"
    >
      <WarningCircle aria-hidden="true" className="size-5 shrink-0 text-red-500" weight="fill" />
      <p className="min-w-0 flex-1 text-sm leading-snug">{toast.message}</p>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => dismissToast(toast.id)}
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-white/10 hover:text-neutral-100 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-hidden',
          COARSE_POINTER_TOUCH_TARGET
        )}
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </div>
  )
}

/**
 * Global error toaster. Mount once in the root layout. Renders nothing until
 * the first toastError() call. Bottom-center, above the mobile action bar.
 */
export function ErrorToaster() {
  const [toasts, setToasts] = useState<ErrorToast[]>([])

  useEffect(() => subscribeToasts(setToasts), [])

  if (toasts.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed bottom-4 left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 flex-col gap-2 max-md:bottom-28"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      {toasts.map((toast) => (
        <ErrorToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
