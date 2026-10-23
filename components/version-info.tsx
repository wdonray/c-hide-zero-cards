'use client'

import { useEffect, useState } from 'react'
import { reportError } from '@/lib/report-error'
import {
  POLL_INTERVAL_MS,
  TICK_INTERVAL_MS,
  compareVersions,
  fetchReleases,
  formatCheckedAgo,
  formatDate,
  timeAgo,
  type Release,
} from '@/lib/releases'

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
      } catch (error) {
        reportError(error, { location: 'VersionInfo.pollReleases' })
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
        <div className="h-1.5 w-12 rounded-full bg-[#C14E33]" aria-hidden="true" />
        <h1
          className="text-3xl font-bold tracking-tight text-[#2B2118] dark:text-[#FFF6EC]"
          style={{ fontFamily: 'var(--font-baloo), system-ui, sans-serif' }}
        >
          Version
        </h1>
        <p className="text-[#6B5D4F] dark:text-[#C9BBA8]">Every release of Hide Zero Cards, most recent first.</p>
        <p className="flex items-center gap-2 text-sm text-[#6B5D4F] dark:text-[#C9BBA8]">
          <span className="relative flex size-2" aria-hidden="true">
            {unreachable ? (
              <span className="relative inline-flex size-2 rounded-full bg-[#6B5D4F]" />
            ) : (
              <>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C14E33] opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-[#C14E33]" />
              </>
            )}
          </span>
          <span>{unreachable ? 'Offline · showing last known releases' : `Live · updated ${checkedAgo}`}</span>
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4 rounded-2xl border-2 border-[#2B2118] bg-white px-4 py-3 shadow-[0_4px_0_rgba(43,33,24,0.1)]">
          <span className="text-sm text-[#6B5D4F]">This build</span>
          <span className="font-mono text-lg font-semibold text-[#2B2118]">v{currentVersion}</span>
        </div>
      </div>

      <div>
        {releases.length > 0 ? (
          <ol aria-label="Releases" className="space-y-3">
            {releases.map((release, index) => {
              const relative = timeAgo(release.publishedAt, now)
              const isCurrentBuild = compareVersions(currentVersion, release.version) === 0
              return (
                <li
                  key={release.version || index}
                  className="rounded-2xl border-2 border-[#2B2118] bg-white p-4 shadow-[0_4px_0_rgba(43,33,24,0.1)]"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={release.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xl font-bold tracking-tight text-[#2B2118] transition-colors hover:text-[#C14E33]"
                    >
                      v{release.version}
                    </a>
                    {index === 0 && (
                      <span
                        className="inline-flex items-center rounded-full bg-[#C14E33] px-2.5 py-0.5 text-xs font-semibold text-white"
                        style={{ fontFamily: 'var(--font-baloo), system-ui, sans-serif' }}
                      >
                        Latest
                      </span>
                    )}
                    {isCurrentBuild && (
                      <span className="inline-flex items-center rounded-full border-2 border-[#2B2118]/20 px-2.5 py-0.5 text-xs font-semibold text-[#6B5D4F]">
                        This build
                      </span>
                    )}
                  </div>
                  {release.summary && <p className="mt-1.5 text-sm text-[#6B5D4F]">{release.summary}</p>}
                  {release.publishedAt && (
                    <p className="mt-1.5 text-xs text-[#6B5D4F]">
                      {formatDate(release.publishedAt)}
                      {relative ? ` · ${relative}` : ''}
                    </p>
                  )}
                </li>
              )
            })}
          </ol>
        ) : (
          <p className="rounded-2xl border-2 border-[#2B2118] bg-white px-4 py-6 text-center text-sm text-[#6B5D4F] shadow-[0_4px_0_rgba(43,33,24,0.1)]">
            {unreachable ? "Couldn't reach GitHub to load releases." : 'No releases found.'}
          </p>
        )}
      </div>
    </div>
  )
}
