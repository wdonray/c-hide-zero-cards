import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import {
  FETCH_TIMEOUT_MS,
  VERSION_POLL_INTERVAL_MS,
  VISIBILITY_POLL_MIN_MS,
  fetchDeployedVersion,
  useNewVersionAvailable,
} from './useNewVersion'

function jsonResponse(body: unknown, ok = true) {
  return { ok, json: () => Promise.resolve(body) } as Response
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('fetchDeployedVersion', () => {
  it('returns the version string from /api/version with no-store caching', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ version: '0.19.12' }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(fetchDeployedVersion()).resolves.toBe('0.19.12')
    expect(fetchMock).toHaveBeenCalledWith('/api/version', expect.objectContaining({ cache: 'no-store' }))
  })

  it('returns null when the response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ version: '0.19.12' }, false))
    )
    await expect(fetchDeployedVersion()).resolves.toBeNull()
  })

  it('returns null when the body is not an object', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse('0.19.12'))
    )
    await expect(fetchDeployedVersion()).resolves.toBeNull()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse(null))
    )
    await expect(fetchDeployedVersion()).resolves.toBeNull()
  })

  it('returns null when version is missing or not a string', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({}))
    )
    await expect(fetchDeployedVersion()).resolves.toBeNull()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ version: 42 }))
    )
    await expect(fetchDeployedVersion()).resolves.toBeNull()
  })

  it('returns null silently on network failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('network down')
      })
    )
    await expect(fetchDeployedVersion()).resolves.toBeNull()
  })

  it('gives up silently when the request hangs past the timeout', async () => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init?: { signal?: AbortSignal }) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
          })
      )
    )
    const pending = fetchDeployedVersion()
    await vi.advanceTimersByTimeAsync(FETCH_TIMEOUT_MS)
    await expect(pending).resolves.toBeNull()
  })
})

describe('useNewVersionAvailable', () => {
  function stubFetch(impl: () => Promise<Response>) {
    const fetchMock = vi.fn(impl)
    vi.stubGlobal('fetch', fetchMock)
    return fetchMock
  }

  async function flush() {
    await act(async () => {})
  }

  async function advance(ms: number) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ms)
    })
  }

  it('starts false and captures the deployed version on mount', async () => {
    vi.useFakeTimers()
    const fetchMock = stubFetch(async () => jsonResponse({ version: '1.0.0' }))
    const { result } = renderHook(() => useNewVersionAvailable())
    await flush()
    expect(result.current).toBe(false)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('becomes true when a poll sees a newer version', async () => {
    vi.useFakeTimers()
    const versions = ['1.0.0', '1.0.1']
    stubFetch(async () => jsonResponse({ version: versions.shift() ?? '1.0.1' }))
    const { result } = renderHook(() => useNewVersionAvailable())
    await flush()
    expect(result.current).toBe(false)
    await advance(VERSION_POLL_INTERVAL_MS)
    expect(result.current).toBe(true)
  })

  it('stays false while the deployed version matches', async () => {
    vi.useFakeTimers()
    const fetchMock = stubFetch(async () => jsonResponse({ version: '1.0.0' }))
    const { result } = renderHook(() => useNewVersionAvailable())
    await flush()
    await advance(VERSION_POLL_INTERVAL_MS)
    await advance(VERSION_POLL_INTERVAL_MS)
    expect(result.current).toBe(false)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('skips failed polls silently and keeps comparing afterwards', async () => {
    vi.useFakeTimers()
    const calls = ['1.0.0', 'throw', '1.0.0', '1.0.1']
    stubFetch(async () => {
      const next = calls.shift()
      if (next === 'throw') throw new TypeError('network down')
      return jsonResponse({ version: next })
    })
    const { result } = renderHook(() => useNewVersionAvailable())
    await flush()
    await advance(VERSION_POLL_INTERVAL_MS)
    expect(result.current).toBe(false)
    await advance(VERSION_POLL_INTERVAL_MS)
    expect(result.current).toBe(false)
    await advance(VERSION_POLL_INTERVAL_MS)
    expect(result.current).toBe(true)
  })

  it('polls on visibilitychange to visible and on focus after the cooldown', async () => {
    vi.useFakeTimers()
    let visibilityState: DocumentVisibilityState = 'hidden'
    const original = Object.getOwnPropertyDescriptor(document, 'visibilityState')
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => visibilityState })
    try {
      const fetchMock = stubFetch(async () => jsonResponse({ version: '1.0.0' }))
      renderHook(() => useNewVersionAvailable())
      await flush()
      expect(fetchMock).toHaveBeenCalledTimes(1)

      // A hidden tab regaining nothing does not poll.
      await act(async () => {
        document.dispatchEvent(new Event('visibilitychange'))
      })
      expect(fetchMock).toHaveBeenCalledTimes(1)

      // Visible again after the cooldown: poll.
      visibilityState = 'visible'
      await advance(VISIBILITY_POLL_MIN_MS + 1)
      await act(async () => {
        document.dispatchEvent(new Event('visibilitychange'))
      })
      expect(fetchMock).toHaveBeenCalledTimes(2)

      // Focus right after a poll is within the cooldown: skipped.
      await act(async () => {
        window.dispatchEvent(new Event('focus'))
      })
      expect(fetchMock).toHaveBeenCalledTimes(2)

      // Focus after the cooldown: poll.
      await advance(VISIBILITY_POLL_MIN_MS + 1)
      await act(async () => {
        window.dispatchEvent(new Event('focus'))
      })
      expect(fetchMock).toHaveBeenCalledTimes(3)
    } finally {
      if (original) Object.defineProperty(document, 'visibilityState', original)
    }
  })

  it('ignores a focus that lands inside the 60 second cooldown', async () => {
    vi.useFakeTimers()
    const fetchMock = stubFetch(async () => jsonResponse({ version: '1.0.0' }))
    renderHook(() => useNewVersionAvailable())
    await flush()
    await act(async () => {
      window.dispatchEvent(new Event('focus'))
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('stops polling and ignores late responses after unmount', async () => {
    vi.useFakeTimers()
    let resolveFetch!: (res: Response) => void
    const fetchMock = stubFetch(() => new Promise<Response>((resolve) => (resolveFetch = resolve)))
    const { unmount } = renderHook(() => useNewVersionAvailable())
    unmount()
    await act(async () => {
      resolveFetch(jsonResponse({ version: '9.9.9' }))
    })
    await advance(VERSION_POLL_INTERVAL_MS * 2)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
