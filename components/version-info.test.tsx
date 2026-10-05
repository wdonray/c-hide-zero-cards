import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import VersionInfo, {
  POLL_INTERVAL_MS,
  compareVersions,
  fetchReleases,
  formatCheckedAgo,
  formatDate,
  parseVersion,
  summarizeRelease,
  timeAgo,
  toRelease,
  type Release,
} from './version-info'

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

describe('parseVersion', () => {
  it('parses semver parts', () => {
    expect(parseVersion('0.19.0')).toEqual([0, 19, 0])
  })

  it('strips a leading v', () => {
    expect(parseVersion('v0.19.11')).toEqual([0, 19, 11])
  })

  it('treats non-numeric parts as 0', () => {
    expect(parseVersion('1.2.x')).toEqual([1, 2, 0])
  })
})

describe('compareVersions', () => {
  it('returns 0 for equal versions', () => {
    expect(compareVersions('0.19.0', '0.19.0')).toBe(0)
    expect(compareVersions('v0.19.0', '0.19.0')).toBe(0)
  })

  it('returns 1 when a is newer', () => {
    expect(compareVersions('0.19.1', '0.19.0')).toBe(1)
    expect(compareVersions('0.20.0', '0.19.0')).toBe(1)
    expect(compareVersions('1.0.0', '0.99.99')).toBe(1)
  })

  it('returns -1 when a is older', () => {
    expect(compareVersions('0.18.20', '0.19.0')).toBe(-1)
  })

  it('compares versions of different lengths', () => {
    expect(compareVersions('1.2', '1.2.0')).toBe(0)
    expect(compareVersions('1.2.1', '1.2')).toBe(1)
  })
})

describe('summarizeRelease', () => {
  it('returns null for null input', () => {
    expect(summarizeRelease(null)).toBeNull()
  })

  it('extracts the first PR title', () => {
    expect(
      summarizeRelease('### ✅ Tests\n\n  - Fix project card locators (80946f4)\n  - Simplify assertions (2816486)\n')
    ).toBe('Fix project card locators')
  })

  it('returns null when no PR line is present', () => {
    expect(summarizeRelease('### ❤️ Contributors\n\n- Wdonray')).toBeNull()
  })

  it('ignores contributor lines without a sha', () => {
    expect(summarizeRelease('- Just a line\n- Another (nothex!)')).toBeNull()
  })
})

describe('formatDate', () => {
  it('formats an ISO date for display', () => {
    expect(formatDate('2026-10-01T12:00:00Z')).toBe('Oct 1, 2026')
  })

  it('returns null for null input', () => {
    expect(formatDate(null)).toBeNull()
  })
})

describe('timeAgo', () => {
  it('returns null for null input', () => {
    expect(timeAgo(null, NOW)).toBeNull()
  })

  it('says just now for under a minute', () => {
    expect(timeAgo(new Date(NOW - 30_000).toISOString(), NOW)).toBe('just now')
  })

  it('clamps future dates to just now', () => {
    expect(timeAgo(new Date(NOW + 60_000).toISOString(), NOW)).toBe('just now')
  })

  it('shows minutes', () => {
    expect(timeAgo(new Date(NOW - 5 * 60_000).toISOString(), NOW)).toBe('5m ago')
  })

  it('shows hours', () => {
    expect(timeAgo(new Date(NOW - 3 * 3_600_000).toISOString(), NOW)).toBe('3h ago')
  })

  it('shows days', () => {
    expect(timeAgo(new Date(NOW - 2 * 86_400_000).toISOString(), NOW)).toBe('2d ago')
  })

  it('returns null past a week', () => {
    expect(timeAgo(new Date(NOW - 10 * 86_400_000).toISOString(), NOW)).toBeNull()
  })
})

describe('formatCheckedAgo', () => {
  it('shows a relative age', () => {
    expect(formatCheckedAgo(NOW - 2 * 60_000, NOW)).toBe('2m ago')
  })

  it('falls back to just now for stale timestamps', () => {
    expect(formatCheckedAgo(NOW - 10 * 86_400_000, NOW)).toBe('just now')
  })
})

describe('toRelease', () => {
  it('normalizes a full payload', () => {
    expect(toRelease(releasePayload('v0.19.11'))).toEqual({
      version: '0.19.11',
      url: 'https://github.com/wdonray/c-hide-zero-cards/releases/tag/v0.19.11',
      publishedAt: '2026-10-03T11:00:00Z',
      summary: 'Some change',
    })
  })

  it('handles missing fields', () => {
    expect(toRelease({})).toEqual({
      version: '',
      url: 'https://github.com/wdonray/c-hide-zero-cards/releases',
      publishedAt: null,
      summary: null,
    })
  })

  it('handles wrongly typed fields', () => {
    expect(
      toRelease({
        tag_name: 'v1.0.0',
        html_url: '',
        published_at: 123,
        body: 456,
      })
    ).toEqual({
      version: '1.0.0',
      url: 'https://github.com/wdonray/c-hide-zero-cards/releases',
      publishedAt: null,
      summary: null,
    })
  })
})

describe('fetchReleases', () => {
  it('fetches and normalizes releases', async () => {
    vi.stubGlobal('fetch', mockFetchResponse([releasePayload('v0.19.11')]))
    const releases = await fetchReleases()
    expect(releases).toHaveLength(1)
    expect(releases[0]?.version).toBe('0.19.11')
    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/wdonray/c-hide-zero-cards/releases?per_page=5',
      expect.objectContaining({ cache: 'no-store' })
    )
  })

  it('throws when GitHub responds non-OK', async () => {
    vi.stubGlobal('fetch', mockFetchResponse(null, false))
    await expect(fetchReleases()).rejects.toThrow('GitHub responded 403')
  })

  it('throws when the response is not a list', async () => {
    vi.stubGlobal('fetch', mockFetchResponse({ tag_name: 'v1.0.0' }))
    await expect(fetchReleases()).rejects.toThrow('Unexpected GitHub response')
  })

  it('tolerates null items in the list', async () => {
    vi.stubGlobal('fetch', mockFetchResponse([null]))
    const releases = await fetchReleases()
    expect(releases).toHaveLength(1)
    expect(releases[0]?.version).toBe('')
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
})
