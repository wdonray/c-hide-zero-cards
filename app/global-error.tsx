'use client'

import { useEffect } from 'react'
import { reportError } from '@/lib/report-error'

/**
 * Last-resort error boundary for the whole app, including the root layout.
 * Reports the error to Sentry, then offers a way back. This replaces the
 * root layout, so it carries its own <html>/<body> and self-contained
 * styling (no theme providers or CSS variables here).
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportError(error, {
      location: 'GlobalError',
      extra: error.digest ? { digest: error.digest } : undefined,
    })
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          fontFamily: 'system-ui, sans-serif',
          background: '#fafafa',
          color: '#171717',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ marginBottom: 24, color: '#525252' }}>
            Hide Zero Cards hit an unexpected error. The problem has been reported; reloading usually fixes it.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              minHeight: 44,
              padding: '12px 24px',
              borderRadius: 12,
              border: 'none',
              background: '#2563eb',
              color: '#fff',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
