import * as Sentry from '@sentry/nextjs'
import { shouldDropSentryEvent } from './lib/sentry-filters'

// Error tracking only: no tracing, no session replay (stays inside
// Sentry's free tier). The DSN comes from NEXT_PUBLIC_SENTRY_DSN; when it
// is unset (local dev, CI) the SDK no-ops.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Browser extensions inject content scripts whose promises can reject
  // with the "Object Not Found Matching Id:N, MethodName:update,
  // ParamCount:N" bare string. That noise is not an app bug, so drop it
  // before it reaches Sentry.
  beforeSend(event) {
    return shouldDropSentryEvent(event) ? null : event
  },
})
