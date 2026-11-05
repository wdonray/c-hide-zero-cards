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

// Browsers report a dropped request as a TypeError, but the message
// differs per browser: Chrome/Edge use "Failed to fetch", Safari uses
// "Load failed", Firefox uses "NetworkError when attempting to fetch
// resource.". Sentry's fetch instrumentation (enhanceFetchErrorMessages,
// on by default) rewrites the message before re-throwing, appending the
// request host in parentheses: "Failed to fetch (hidezerocards.org)".
// Match the base message with that optional suffix, so a network
// failure is never reported no matter which browser threw it or what
// the SDK did to the message (Sentry HIDE-ZERO-CARDS-7, GitHub #165).
const NETWORK_FAILURE_MESSAGE =
  /^(Failed to fetch|Load failed|NetworkError when attempting to fetch resource\.)( \([^)]+\))?$/

function isNetworkFailure(error: unknown): boolean {
  return error instanceof TypeError && NETWORK_FAILURE_MESSAGE.test(error.message)
}

export function reportError(error: unknown, options: ReportErrorOptions = {}): void {
  // Aborted requests are benign user/system behavior, not errors.
  if (error instanceof DOMException && error.name === 'AbortError') return
  // Network failures are the client's network, not the app: a user going
  // offline, a flaky connection, a dropped request. Nothing to fix, so
  // never report them.
  if (isNetworkFailure(error)) return
  // Preserve Error and DOMException as-is so Sentry keeps their real names
  // and stacks; normalize anything else into an Error.
  const err = error instanceof Error || error instanceof DOMException ? error : new Error(String(error))
  Sentry.withScope((scope) => {
    if (options.location) scope.setTag('location', options.location)
    if (options.extra) scope.setExtras(options.extra)
    Sentry.captureException(err)
  })
}
