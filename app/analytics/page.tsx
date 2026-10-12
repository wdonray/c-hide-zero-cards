import type { Metadata } from 'next'
import { Eye, Users } from 'lucide-react'
import { getAnalyticsSummary } from '@/lib/analytics'
import EnablePageScroll from '@/components/EnablePageScroll'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Analytics | Hide Zero Cards',
  description: 'Public, privacy-respecting traffic statistics for Hide Zero Cards.',
  alternates: {
    canonical: '/analytics',
  },
}

function formatDate(isoDay: string): string {
  const [y, m, d] = isoDay.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default async function AnalyticsPage() {
  const summary = await getAnalyticsSummary(30)

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 pt-6 md:pt-8 pb-16 space-y-8">
      <EnablePageScroll />
      <div className="space-y-2">
        <div className="h-1.5 w-12 rounded-full bg-[#C14E33]" aria-hidden="true" />
        <h1
          className="text-3xl font-bold tracking-tight text-[#2B2118] dark:text-[#FFF6EC]"
          style={{ fontFamily: 'var(--font-baloo), system-ui, sans-serif' }}
        >
          Analytics
        </h1>
        <p className="text-[#6B5D4F] dark:text-[#C9BBA8]">
          Public, privacy-respecting traffic stats for Hide Zero Cards. No cookies, no raw IP addresses stored. Ever.
        </p>
      </div>

      {!summary ? (
        <Card className="!rounded-3xl !border-2 !border-[#2B2118] !bg-white !shadow-[0_4px_0_rgba(43,33,24,0.1)]">
          <CardContent className="py-12 text-center text-[#6B5D4F]">
            Analytics isn&apos;t configured on this build yet. Check back soon.
          </CardContent>
        </Card>
      ) : summary.totalViews === 0 ? (
        <Card className="!rounded-3xl !border-2 !border-[#2B2118] !bg-white !shadow-[0_4px_0_rgba(43,33,24,0.1)]">
          <CardContent className="py-12 text-center text-[#6B5D4F]">
            No page views recorded yet. Stats appear here once people start visiting.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Headline stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="!rounded-3xl !border-2 !border-[#2B2118] !bg-white !shadow-[0_4px_0_rgba(43,33,24,0.1)]">
              <CardHeader className="pb-2">
                <CardTitle
                  className="flex items-center gap-2 text-sm font-semibold text-[#6B5D4F]"
                  style={{ fontFamily: 'var(--font-baloo), system-ui, sans-serif' }}
                >
                  <Eye className="size-4 text-[#C14E33]" aria-hidden="true" />
                  Page views
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#2B2118]">{summary.totalViews.toLocaleString()}</div>
                <CardDescription className="mt-1 !text-[#6B5D4F]">All time, bots filtered</CardDescription>
              </CardContent>
            </Card>
            <Card className="!rounded-3xl !border-2 !border-[#2B2118] !bg-white !shadow-[0_4px_0_rgba(43,33,24,0.1)]">
              <CardHeader className="pb-2">
                <CardTitle
                  className="flex items-center gap-2 text-sm font-semibold text-[#6B5D4F]"
                  style={{ fontFamily: 'var(--font-baloo), system-ui, sans-serif' }}
                >
                  <Users className="size-4 text-[#C14E33]" aria-hidden="true" />
                  Unique visitors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#2B2118]">{summary.totalUniques.toLocaleString()}</div>
                <CardDescription className="mt-1 !text-[#6B5D4F]">
                  All time, counted once ever, bots filtered
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Daily chart */}
          {summary.dailyTotals.length > 0 && (
            <Card className="!rounded-3xl !border-2 !border-[#2B2118] !bg-white !shadow-[0_4px_0_rgba(43,33,24,0.1)]">
              <CardHeader>
                <CardTitle
                  className="text-base !text-[#2B2118]"
                  style={{ fontFamily: 'var(--font-baloo), system-ui, sans-serif' }}
                >
                  Page views per day
                </CardTitle>
                <CardDescription className="!text-[#6B5D4F]">Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="flex items-end gap-1 h-32"
                  role="img"
                  aria-label={`Bar chart of page views per day for the last ${summary.dailyTotals.length} days`}
                >
                  {(() => {
                    const max = Math.max(...summary.dailyTotals.map((d) => d.views), 1)
                    return summary.dailyTotals.map((d) => (
                      <div
                        key={d.day}
                        className="flex-1 flex flex-col justify-end h-full group relative"
                        title={`${formatDate(d.day)}: ${d.views.toLocaleString()} views`}
                      >
                        <div
                          className="w-full rounded-sm bg-[#C14E33]/70 group-hover:bg-[#C14E33] transition-colors"
                          style={{
                            height: `${Math.max(4, (d.views / max) * 100)}%`,
                          }}
                        />
                      </div>
                    ))
                  })()}
                </div>
                <div className="flex justify-between text-xs text-[#6B5D4F] mt-2">
                  <span>{formatDate(summary.dailyTotals[0].day)}</span>
                  <span>{formatDate(summary.dailyTotals[summary.dailyTotals.length - 1].day)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Per-page breakdown */}
          <Card className="!rounded-3xl !border-2 !border-[#2B2118] !bg-white !shadow-[0_4px_0_rgba(43,33,24,0.1)]">
            <CardHeader>
              <CardTitle
                className="text-base !text-[#2B2118]"
                style={{ fontFamily: 'var(--font-baloo), system-ui, sans-serif' }}
              >
                Page views by page
              </CardTitle>
              <CardDescription className="!text-[#6B5D4F]">All time, most viewed first</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#2B2118]/10 text-left text-[#6B5D4F]">
                      <th scope="col" className="py-2 pr-4 font-medium">
                        Page
                      </th>
                      <th scope="col" className="py-2 pr-4 font-medium text-right">
                        Page views
                      </th>
                      <th scope="col" className="py-2 font-medium text-right">
                        Unique visitors
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[#2B2118]">
                    {summary.pages.map((page) => (
                      <tr key={page.path} className="border-b border-[#2B2118]/10 last:border-0">
                        <td className="py-2 pr-4 font-mono">{page.path}</td>
                        <td className="py-2 pr-4 text-right tabular-nums">{page.totalViews.toLocaleString()}</td>
                        <td className="py-2 text-right tabular-nums">{page.uniques.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Methodology: the honesty section */}
          <Card className="!rounded-3xl !border-2 !border-[#2B2118] !bg-white !shadow-[0_4px_0_rgba(43,33,24,0.1)]">
            <CardHeader>
              <CardTitle
                className="text-base !text-[#2B2118]"
                style={{ fontFamily: 'var(--font-baloo), system-ui, sans-serif' }}
              >
                How it&apos;s measured
              </CardTitle>
              <CardDescription className="!text-[#6B5D4F]">What these numbers are (and aren&apos;t)</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 text-sm text-[#6B5D4F]">
                <li>
                  <strong className="text-[#2B2118]">Page views</strong> are real page loads in a browser, recorded from
                  October 2026. Images, scripts, and stylesheets don&apos;t count. Only the page itself. Known bots and
                  crawlers are filtered out before counting.
                </li>
                <li>
                  <strong className="text-[#2B2118]">Unique visitors</strong> are real people, counted once ever: each
                  visit is hashed (IP plus browser, salted and non-reversible) and the hash is kept in a permanent set.
                  A visitor who returns a year later still counts once, and a visitor who reads several pages counts
                  once. Shared networks (like a school) can undercount; changing IPs can overcount.
                </li>
                <li>No cookies are set and no raw IP addresses are stored. All records are kept permanently.</li>
              </ul>
              <p className="mt-4 text-xs text-[#6B5D4F]">
                Last updated {formatDateTime(summary.fetchedAt)} · Tracking started October 2026
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
