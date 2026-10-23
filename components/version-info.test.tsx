import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import VersionInfo, * as versionInfoModule from './version-info'
import { POLL_INTERVAL_MS, type Release } from '@/lib/releases'

const NOW = Date.parse('2026-10-03T12:00:00Z')

const releasePayload = (tag: string, overrides: Record<string, unknown> = {}) => ({
  tag_name: tag,
  html_url: `https://github.com/wdonray/c-hide-zero-cards/releases/tag/${tag}`,
  published_at: '2026-10-03T11:00:00Z',
  body: '### ✅ Tests\n\n  - Some change (abc1234)\n',
  ...overrides,
})

const release = (version: string, overrides: Partial<Release> = {}): Release => ({
  version,
  url: 'https://github.com/wdonray/c-hide-zero-cards/releases',
  publishedAt: '2026-10-03T11:00:00Z',
  summary: 'Some change',
  ...overrides,
})

function mockFetchResponse(payload: unknown, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 403,
    json: async () => payload,
  })
}

function useFakeTimers() {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(NOW))
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('server boundary', () => {
  it('does not export server-needed values from the client module', () => {
    // Regression (Sentry HIDE-ZERO-CARDS-5, issue #159): the server-rendered
    // app/version/page.tsx imported RELEASES_API and toRelease from this
    // 'use client' module. Next.js replaces non-component exports of client
    // modules with throwing proxies in the server bundle, so fetch()
    // received the proxy's source text and threw "Failed to parse URL from
    // function(){throw Error(...)}". Server-needed values live in
    // @/lib/releases now; this module must not grow them back.
    for (const name of [
      'RELEASES_API',
      'RELEASES_URL',
      'toRelease',
      'parseVersion',
      'compareVersions',
      'summarizeRelease',
      'formatDate',
      'timeAgo',
      'formatCheckedAgo',
      'fetchReleases',
    ]) {
      expect(versionInfoModule).not.toHaveProperty(name)
    }
  })
})

describe('VersionInfo', () => {
  it('renders the heading, live indicator, and current build', async () => {
    useFakeTimers()
    vi.stubGlobal('fetch', mockFetchResponse([releasePayload('v0.19.10')]))
    render(<VersionInfo currentVersion="0.19.10" initialReleases={[]} />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.getByRole('heading', { name: 'Version' })).toBeInTheDocument()
    expect(screen.getAllByText('This build')).toHaveLength(2)
    expect(screen.getAllByText('v0.19.10')).toHaveLength(2)
    expect(screen.getByText(/Live/)).toBeInTheDocument()
    expect(screen.getByText(/updated just now/)).toBeInTheDocument()
  })

  it('marks the newest release with Latest and the running build', async () => {
    useFakeTimers()
    vi.stubGlobal(
      'fetch',
      mockFetchResponse([
        releasePayload('v0.19.11'),
        releasePayload('v0.19.10', { published_at: '2026-10-02T12:00:00Z' }),
      ])
    )
    render(
      <VersionInfo
        currentVersion="0.19.10"
        initialReleases={[release('0.19.11'), release('0.19.10', { publishedAt: '2026-10-02T12:00:00Z' })]}
      />
    )
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.getByText('Latest')).toBeInTheDocument()
    expect(screen.getAllByText('This build')).toHaveLength(2)
    expect(screen.getAllByText('v0.19.10')).toHaveLength(2)
    expect(screen.getAllByText('Some change')).toHaveLength(2)
    expect(screen.getByText('Oct 3, 2026 · 1h ago')).toBeInTheDocument()
    expect(screen.getByText('Oct 2, 2026 · 1d ago')).toBeInTheDocument()
  })

  it('omits the summary and date when a release lacks them', async () => {
    useFakeTimers()
    vi.stubGlobal('fetch', mockFetchResponse([]))
    render(
      <VersionInfo
        currentVersion="0.19.10"
        initialReleases={[release('0.19.10', { summary: null, publishedAt: null })]}
      />
    )
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.queryByText('Some change')).not.toBeInTheDocument()
    expect(screen.queryByText(/Oct 3, 2026/)).not.toBeInTheDocument()
  })

  it('shows only the absolute date for releases older than a week', async () => {
    useFakeTimers()
    vi.stubGlobal('fetch', mockFetchResponse([releasePayload('v0.19.10', { published_at: '2026-09-20T12:00:00Z' })]))
    render(
      <VersionInfo
        currentVersion="0.19.10"
        initialReleases={[release('0.19.10', { publishedAt: '2026-09-20T12:00:00Z' })]}
      />
    )
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.getByText('Sep 20, 2026')).toBeInTheDocument()
  })

  it('shows a quiet empty state when no releases exist', async () => {
    useFakeTimers()
    vi.stubGlobal('fetch', mockFetchResponse([]))
    render(<VersionInfo currentVersion="0.19.10" initialReleases={[]} />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.getByText('No releases found.')).toBeInTheDocument()
  })

  it('fetches fresh releases on mount', async () => {
    useFakeTimers()
    const fetchMock = mockFetchResponse([releasePayload('v0.19.11')])
    vi.stubGlobal('fetch', fetchMock)
    render(<VersionInfo currentVersion="0.19.10" initialReleases={[]} />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.github.com/repos/wdonray/c-hide-zero-cards/releases?per_page=5',
      expect.objectContaining({ cache: 'no-store' })
    )
    expect(screen.getByText('v0.19.11')).toBeInTheDocument()
    expect(screen.queryByText("Couldn't reach GitHub")).not.toBeInTheDocument()
  })

  it('polls for new releases on the interval and updates the list', async () => {
    useFakeTimers()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [releasePayload('v0.19.11')],
      })
      .mockResolvedValue({
        ok: true,
        json: async () => [releasePayload('v0.19.12'), releasePayload('v0.19.11')],
      })
    vi.stubGlobal('fetch', fetchMock)
    render(<VersionInfo currentVersion="0.19.10" initialReleases={[]} />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(screen.getByText('v0.19.11')).toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(90_000)
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Live · updated 1m ago')).toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000)
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(screen.getByText('v0.19.12')).toBeInTheDocument()
    expect(screen.getByText('Live · updated just now')).toBeInTheDocument()
  })

  it('shows offline in the live indicator but keeps last-known releases when polling fails', async () => {
    useFakeTimers()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    render(<VersionInfo currentVersion="0.19.10" initialReleases={[release('0.19.10')]} />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.getByText('Offline · showing last known releases')).toBeInTheDocument()
    expect(screen.getAllByText('v0.19.10')).toHaveLength(2)
  })

  it('shows an empty-state message when GitHub is unreachable and no releases exist', async () => {
    useFakeTimers()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    render(<VersionInfo currentVersion="0.19.10" initialReleases={[]} />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.getByText("Couldn't reach GitHub to load releases.")).toBeInTheDocument()
  })

  it(`polls on the documented ${POLL_INTERVAL_MS}ms interval`, () => {
    expect(POLL_INTERVAL_MS).toBe(120_000)
  })

  it('ignores a late successful poll after unmount', async () => {
    useFakeTimers()
    let resolveFetch!: (value: unknown) => void
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve
    })
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(fetchPromise))
    const { unmount } = render(<VersionInfo currentVersion="0.19.10" initialReleases={[]} />)
    unmount()
    await act(async () => {
      resolveFetch({ ok: true, json: async () => [] })
      await fetchPromise
    })
    // The poll's `if (cancelled) return` early-exit runs: no state updates
    // fire after unmount, so no React warnings are produced.
  })

  it('does not mark offline when a failing poll settles after unmount', async () => {
    useFakeTimers()
    let rejectFetch!: (reason: unknown) => void
    const fetchPromise = new Promise((_, reject) => {
      rejectFetch = reject
    })
    // Keep the initial releases visible so the offline indicator would be
    // observable if it were (incorrectly) set.
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(fetchPromise))
    const { unmount } = render(<VersionInfo currentVersion="0.19.10" initialReleases={[release('0.19.10')]} />)
    unmount()
    await act(async () => {
      rejectFetch(new Error('offline'))
      await fetchPromise.catch(() => {})
    })
    // The catch block's `if (!cancelled)` guard skips setUnreachable(true).
  })

  it('falls back to the list index as key for a release without a version', async () => {
    useFakeTimers()
    const payload = releasePayload('', { tag_name: undefined })
    delete (payload as Record<string, unknown>).tag_name
    vi.stubGlobal('fetch', mockFetchResponse([payload]))
    render(<VersionInfo currentVersion="0.19.10" initialReleases={[]} />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    // Renders the version-less release without crashing; the `|| index`
    // fallback supplies the React key.
    expect(screen.getByRole('list', { name: 'Releases' })).toBeInTheDocument()
  })
})
