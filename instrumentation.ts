// Registers Sentry for the Node.js server runtime. Next.js calls register()
// once when the server starts; client-side init lives in
// instrumentation-client.ts.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }
}
