'use client'

import { useEffect, useState } from 'react'

export const RELEASES_API = 'https://api.github.com/repos/wdonray/c-hide-zero-cards/releases?per_page=5'
export const RELEASES_URL = 'https://github.com/wdonray/c-hide-zero-cards/releases'

/** How often the page silently re-checks GitHub for new releases. */
export const POLL_INTERVAL_MS = 120_000
/** How often the relative timestamps ("3h ago") re-render. */
const TICK_INTERVAL_MS = 15_000

export interface Release {
  version: string
  url: string
  publishedAt: string | null
  summary: string | null
}

interface GitHubReleasePayload {
  tag_name?: unknown
  html_url?: unknown
  published_at?: unknown
  body?: unknown
}

/** Parse a semver-ish string ("v0.19.11" / "0.19.11") into comparable parts. */
export function parseVersion(value: string): number[] {
  return value
    .replace(/^v/i, '')
    .split('.')
    .map((part) => parseInt(part, 10) || 0)
}

/** Returns 1 if a > b, -1 if a < b, 0 if equal. */
export function compareVersions(a: string, b: string): number {
  const pa = parseVersion(a)
  const pb = parseVersion(b)
  const length = Math.max(pa.length, pb.length)
  for (let i = 0; i < length; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0)
    if (diff !== 0) return diff > 0 ? 1 : -1
  }
  return 0
}

/**
 * Pull a one-line summary from a release body: the first PR title, e.g.
 * "  - Fix project card locators (80946f4)" -> "Fix project card locators".
 */
export function summarizeRelease(body: string | null): string | null {
  if (!body) return null
  const match = body.match(/^\s*-\s+(.+?)\s*\([0-9a-f]{7,40}\)\s*$/m)
  const summary = match?.[1]?.trim()
  return summary ? summary : null
}

export function formatDate(value: string | null): string | null {
  if (!value) return null
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Relative age ("just now", "3h ago", "2d ago"). Returns null for null input
 * or ages past a week, where the absolute date is enough.
 */
export function timeAgo(iso: string | null, now: number): string | null {
  if (!iso) return null
  const seconds = Math.max(0, Math.floor((now - Date.parse(iso)) / 1000))
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return null
}

/** Relative age for the "updated …" line; never blank. */
export function formatCheckedAgo(lastChecked: number, now: number): string {
  return timeAgo(new Date(lastChecked).toISOString(), now) ?? 'just now'
}

/** Normalize one GitHub release payload into a Release. */
export function toRelease(data: GitHubReleasePayload): Release {
  return {
    version: String(data.tag_name ?? '').replace(/^v/i, ''),
    url: typeof data.html_url === 'string' && data.html_url ? data.html_url : RELEASES_URL,
    publishedAt: typeof data.published_at === 'string' ? data.published_at : null,
    summary: summarizeRelease(typeof data.body === 'string' ? data.body : null),
  }
}

/** Fetch the most recent releases from the GitHub API. */
export async function fetchReleases(): Promise<Release[]> {
  const res = await fetch(RELEASES_API, {
    headers: { Accept: 'application/vnd.github+json' },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`GitHub responded ${res.status}`)
  const data: unknown = await res.json()
  if (!Array.isArray(data)) throw new Error('Unexpected GitHub response')
  return data.map((item) => toRelease((item ?? {}) as GitHubReleasePayload))
}

export default function VersionInfo({
  currentVersion,
  initialReleases,
}: {
  currentVersion: string
  initialReleases: Release[]
}) {
  const [releases, setReleases] = useState<Release[]>(initialReleases)
  const [lastChecked, setLastChecked] = useState<number>(() => Date.now())
  const [now, setNow] = useState<number>(() => Date.now())
  const [unreachable, setUnreachable] = useState(initialReleases.length === 0)

  useEffect(() => {
    let cancelled = false
    const poll = async () => {
      try {
        const next = await fetchReleases()
        if (cancelled) return
        setReleases(next)
        setLastChecked(Date.now())
        setUnreachable(false)
      } catch {
        if (!cancelled) setUnreachable(true)
      }
    }
    // Always re-check from the browser on mount: an independent network with
    // its own rate-limit quota, and fresher than the server cache.
    poll()
    const id = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  const checkedAgo = formatCheckedAgo(lastChecked, now)

  return (
    <div className="w-full max-w-xl space-y-8">
      <div className="space-y-2">
        <div className="h-1 w-10 rounded-full bg-primary" aria-hidden="true" />
        <h1 className="text-3xl font-bold tracking-tight">Version</h1>
        <p className="text-muted-foreground">Every release of Hide Zero Cards, most recent first.</p>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="relative flex size-2" aria-hidden="true">
            {unreachable ? (
              <span className="relative inline-flex size-2 rounded-full bg-muted-foreground" />
            ) : (
              <>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </>
            )}
          </span>
          <span>{unreachable ? 'Offline · showing last known releases' : `Live · updated ${checkedAgo}`}</span>
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
          <span className="text-sm text-muted-foreground">This build</span>
          <span className="font-mono text-lg font-semibold">v{currentVersion}</span>
        </div>
      </div>

      <div>
        {releases.length > 0 ? (
          <ol aria-label="Releases" className="space-y-3">
            {releases.map((release, index) => {
              const relative = timeAgo(release.publishedAt, now)
              const isCurrentBuild = compareVersions(currentVersion, release.version) === 0
              return (
                <li key={release.version || index} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={release.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xl font-bold tracking-tight transition-colors hover:text-primary"
                    >
                      v{release.version}
                    </a>
                    {index === 0 && (
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-semibold">
                        Latest
                      </span>
                    )}
                    {isCurrentBuild && (
                      <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                        This build
                      </span>
                    )}
                  </div>
                  {release.summary && <p className="mt-1.5 text-sm text-muted-foreground">{release.summary}</p>}
                  {release.publishedAt && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {formatDate(release.publishedAt)}
                      {relative ? ` · ${relative}` : ''}
                    </p>
                  )}
                </li>
              )
            })}
          </ol>
        ) : (
          <p className="rounded-lg border px-4 py-6 text-center text-sm text-muted-foreground">
            {unreachable ? "Couldn't reach GitHub to load releases." : 'No releases found.'}
          </p>
        )}
      </div>
    </div>
  )
}
