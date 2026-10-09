/**
 * Unified error-toast system: status-code-specific but generic user-facing
 * messages. Never exposes raw status codes, technical details, or jargon.
 * Inline field validation errors are handled separately and stay as-is.
 */

const NETWORK_ERROR_MESSAGE = "Couldn't reach the server. Check your connection and try again."
const FALLBACK_MESSAGE = 'Something went wrong. Please try again.'

/** Extract an HTTP status code from a Response or Response-like error. */
function getHttpStatus(error: unknown): number | undefined {
  if (error instanceof Response) return error.status
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status: unknown }).status
    return typeof status === 'number' ? status : undefined
  }
  return undefined
}

/**
 * Map an error to the user-facing toast message. Fetch network failures
 * (which throw TypeError) get the connectivity message; Response-like
 * errors map by status code; everything else gets the generic fallback.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof TypeError) return NETWORK_ERROR_MESSAGE
  const status = getHttpStatus(error)
  if (status === undefined) return FALLBACK_MESSAGE
  if (status === 400) return "That didn't work. Please try again."
  if (status === 401) return 'Your session expired. Please sign in again.'
  if (status === 403) return "You don't have permission to do that."
  if (status === 404) return "That wasn't found. It may have been moved or deleted."
  if (status === 409) return 'That already exists.'
  if (status === 429) return 'Too many requests. Please wait a moment and try again.'
  if (status >= 500 && status < 600) return "Something went wrong on our end. We're looking into it."
  return FALLBACK_MESSAGE
}

export interface ErrorToast {
  id: number
  message: string
}

type ToastListener = (toasts: ErrorToast[]) => void

const MAX_TOASTS = 3
let nextId = 1
let toasts: ErrorToast[] = []
const listeners = new Set<ToastListener>()

function emit(): void {
  const snapshot = [...toasts]
  for (const listener of listeners) listener(snapshot)
}

/** Show an error toast. Keeps at most MAX_TOASTS, evicting the oldest. */
export function toastError(message: string): void {
  const toast: ErrorToast = { id: nextId++, message }
  toasts = [...toasts.slice(-(MAX_TOASTS - 1)), toast]
  emit()
}

/** Dismiss a toast by id. */
export function dismissToast(id: number): void {
  const remaining = toasts.filter((t) => t.id !== id)
  if (remaining.length !== toasts.length) {
    toasts = remaining
    emit()
  }
}

/** Subscribe to toast state. Returns an unsubscribe function. */
export function subscribeToasts(listener: ToastListener): () => void {
  listeners.add(listener)
  listener([...toasts])
  return () => {
    listeners.delete(listener)
  }
}
