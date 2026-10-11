import * as Sentry from '@sentry/nextjs'

export type ReportErrorOptions = {
  /** Where the error happened, e.g. 'VersionInfo.poll' */
  location?: string
  /** Extra structured context */
  extra?: Record<string, unknown>
}

/**
 * Report an error to Sentry with an optional location tag and extra
 * context. Safe to call when Sentry has no DSN (captureException no-ops).
 * Aborted requests are benign user/system behavior, not errors, so they
 * are ignored. The same goes for network failures: browsers throw
 * `TypeError: Failed to fetch` when the device is offline or the network
 * drops mid-request, and that says nothing about the app.
 */
export function reportError(error: unknown, options: ReportErrorOptions = {}): void {
  // Aborted requests are benign user/system behavior, not errors.
  if (error instanceof DOMException && error.name === 'AbortError') return
  // Network failures are the client's network, not the app: a user going
  // offline, a flaky connection, a dropped request. Nothing to fix, so
  // never report them. Every browser throws this as a TypeError.
  if (error instanceof TypeError && error.message === 'Failed to fetch') return
  // Preserve Error and DOMException as-is so Sentry keeps their real names
  // and stacks; normalize anything else into an Error.
  const err = error instanceof Error || error instanceof DOMException ? error : new Error(String(error))
  Sentry.withScope((scope) => {
    if (options.location) scope.setTag('location', options.location)
    if (options.extra) scope.setExtras(options.extra)
    Sentry.captureException(err)
  })
}
