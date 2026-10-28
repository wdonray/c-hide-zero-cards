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

// A second extension-noise class (GitHub #162, Sentry 7817218313): a
// browser extension's runtime.sendMessage call rejects with
// "Invalid call to runtime.sendMessage(). Tab not found." when the tab
// it targets is gone. The event arrives via onunhandledrejection with no
// stack trace and no in-app frame, and no app code calls runtime
// messaging at all, so the exact message with no frames is extension
// noise, not an app bug. Anchored to the full message, like the class
// above: trailing text would mean something else failed.
const EXTENSION_RUNTIME_SEND_MESSAGE_TAB_NOT_FOUND = /^Invalid call to runtime\.sendMessage\(\)\. Tab not found\.$/

function isExtensionNoiseRejection(value: Exception): boolean {
  return (
    value.type === 'UnhandledRejection' &&
    typeof value.value === 'string' &&
    EXTENSION_OBJECT_NOT_FOUND_REJECTION.test(value.value) &&
    !value.stacktrace?.frames?.length
  )
}

function isExtensionRuntimeSendMessageNoise(value: Exception): boolean {
  return (
    value.type === 'Error' &&
    typeof value.value === 'string' &&
    EXTENSION_RUNTIME_SEND_MESSAGE_TAB_NOT_FOUND.test(value.value) &&
    !value.stacktrace?.frames?.length
  )
}

/**
 * True when a Sentry event is browser-extension noise (the "Object Not
 * Found" rejection or the runtime.sendMessage tab-not-found error
 * described above) and should be dropped in beforeSend.
 */
export function shouldDropSentryEvent(event: ErrorEvent): boolean {
  const values = event.exception?.values ?? []
  return (
    values.length > 0 &&
    values.every((value) => isExtensionNoiseRejection(value) || isExtensionRuntimeSendMessageNoise(value))
  )
}
