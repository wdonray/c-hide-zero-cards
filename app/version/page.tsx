import type { Metadata } from 'next'
import { VERSION } from '@/lib/version'
import VersionInfo, { RELEASES_API, toRelease, type Release } from '@/components/version-info'

export const metadata: Metadata = {
  title: 'Version | Hide Zero Cards',
  description: 'Every release of Hide Zero Cards, most recent first.',
}

async function getRecentReleases(): Promise<Release[]> {
  try {
    // Cache for five minutes: the GitHub API allows only 60 unauthenticated
    // requests/hour per IP, and shared hosting egress IPs exhaust that fast.
    // An optional GITHUB_TOKEN raises the limit to 5,000/hour.
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
    }
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
    }
    const res = await fetch(RELEASES_API, {
      headers,
      next: { revalidate: 300 },
      // Fail fast: on timeout the client component retries from the
      // visitor's browser, so the page still renders without waiting.
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return []
    const data: unknown = await res.json()
    if (!Array.isArray(data)) return []
    return data.map((item) => toRelease((item ?? {}) as Parameters<typeof toRelease>[0]))
  } catch {
    return []
  }
}

export default async function VersionPage() {
  const initialReleases = await getRecentReleases()

  return (
    <div className="flex items-start justify-center px-4 md:px-16 pt-24 pb-16">
      <VersionInfo currentVersion={VERSION} initialReleases={initialReleases} />
    </div>
  )
}
