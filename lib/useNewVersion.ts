'use client'

import { useEffect, useRef, useState } from 'react'

/** Poll every 15 minutes. A background tab interval is negligible traffic. */
export const VERSION_POLL_INTERVAL_MS = 15 * 60 * 1000
/**
 * Visibility and focus polls only fire when the last poll was more than 60
 * seconds ago. This avoids a poll storm when tabbing around.
 */
export const VISIBILITY_POLL_MIN_MS = 60 * 1000
/** A hung request never blocks the UI or shows an error. */
export const FETCH_TIMEOUT_MS = 5000

interface VersionPayload {
  version?: unknown
}

/**
 * Fetch the deployed version from /api/version. Returns null on any
 * failure: a network problem just skips that poll, silently.
 */
export async function fetchDeployedVersion(): Promise<string | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch('/api/version', { cache: 'no-store', signal: controller.signal })
    if (!res.ok) return null
    const data: unknown = await res.json()
    if (typeof data !== 'object' || data === null) return null
    const version = (data as VersionPayload).version
    return typeof version === 'string' ? version : null
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * True once a poll sees a deployed version that differs from the one this
 * page loaded with. The loaded version comes from /api/version (the live
 * deploy), never from the page HTML or a build-time value baked into the
 * bundle, which would be the wrong side of the comparison.
 */
export function useNewVersionAvailable(): boolean {
  const loadedVersion = useRef<string | null>(null)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    let cancelled = false
    let lastPoll = 0

    const poll = async () => {
      const now = Date.now()
      if (now - lastPoll < VISIBILITY_POLL_MIN_MS) return
      lastPoll = now
      const deployed = await fetchDeployedVersion()
      if (cancelled || deployed === null) return
      if (loadedVersion.current === null) {
        loadedVersion.current = deployed
      } else if (deployed !== loadedVersion.current) {
        setUpdateAvailable(true)
      }
    }

    void poll()

    const intervalId = setInterval(() => void poll(), VERSION_POLL_INTERVAL_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') void poll()
    }
    const onFocus = () => void poll()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onFocus)

    return () => {
      cancelled = true
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  return updateAvailable
}
