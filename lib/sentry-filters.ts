import type { ErrorEvent, Exception } from '@sentry/nextjs'

// Browser extensions (password managers, anti-fingerprint tools, Outlook
// Safe Links scanners, ...) inject content scripts whose promises can
// reject with a bare string like:
//   "Object Not Found Matching Id:2, MethodName:update, ParamCount:4"
// The rejection bubbles to window.onunhandledrejection, so Sentry reports
// it as an app error even though no app code is involved: there is no
// stack trace and no in-app frame, just the extension's RPC-layer wording.
// Drop that noise class at the source. The match is deliberately narrow:
// other non-Error rejections still report.
const EXTENSION_OBJECT_NOT_FOUND_REJECTION =
  /^(?:Non-Error promise rejection captured with value: )?Object Not Found Matching Id:\d+, MethodName:update, ParamCount:\d+$/

function isExtensionNoiseRejection(value: Exception): boolean {
  return (
    value.type === 'UnhandledRejection' &&
    typeof value.value === 'string' &&
    EXTENSION_OBJECT_NOT_FOUND_REJECTION.test(value.value) &&
    !value.stacktrace?.frames?.length
  )
}

/**
 * True when a Sentry event is the browser-extension "Object Not Found"
 * rejection noise described above and should be dropped in beforeSend.
 */
export function shouldDropSentryEvent(event: ErrorEvent): boolean {
  const values = event.exception?.values ?? []
  return values.length > 0 && values.every(isExtensionNoiseRejection)
}
