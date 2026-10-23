/**
 * Release data shared by the /version page.
 *
 * This module must stay server-safe: it is imported by the server-rendered
 * `app/version/page.tsx`. Importing values from a `'use client'` module into
 * a server component gives you Next.js's throwing client-reference proxy,
 * not the value (Sentry HIDE-ZERO-CARDS-5: "Failed to parse URL from
 * function(){throw Error(\"Attempted to call RELEASES_API()...\")}").
 * Keep constants, types, and pure helpers here; keep React/hooks in
 * `components/version-info.tsx`.
 */

export const RELEASES_API = 'https://api.github.com/repos/wdonray/c-hide-zero-cards/releases?per_page=5'
export const RELEASES_URL = 'https://github.com/wdonray/c-hide-zero-cards/releases'

/** How often the page silently re-checks GitHub for new releases. */
export const POLL_INTERVAL_MS = 120_000
/** How often the relative timestamps ("3h ago") re-render. */
export const TICK_INTERVAL_MS = 15_000

export interface Release {
  version: string
  url: string
  publishedAt: string | null
  summary: string | null
}

export interface GitHubReleasePayload {
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
