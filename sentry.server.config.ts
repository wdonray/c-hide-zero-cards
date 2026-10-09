import * as Sentry from '@sentry/nextjs'

// Error tracking only: no tracing, no session replay (stays inside
// Sentry's free tier). The DSN comes from NEXT_PUBLIC_SENTRY_DSN; when it
// is unset (local dev, CI) the SDK no-ops.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
})
