import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest'
import {
  __resetClientForTests,
  __resetRateLimitForTests,
  clientIpFromHeaders,
  compareDays,
  dayKey,
  getConfig,
  getPageUniqueViews,
  hashVisitor,
  isBot,
  isRateLimited,
  normalizePath,
  recordPageView,
} from './analytics'

afterEach(() => {
  __resetClientForTests()
  vi.unstubAllEnvs()
})

describe('isBot', () => {
  it('flags common crawlers', () => {
    expect(isBot('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')).toBe(true)
    expect(isBot('facebookexternalhit/1.1')).toBe(true)
    expect(isBot('AhrefsBot/7.0')).toBe(true)
  })

  it('passes real browsers', () => {
    expect(
      isBot(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
      )
    ).toBe(false)
    expect(isBot('')).toBe(false)
    expect(isBot(null)).toBe(false)
    expect(isBot(undefined)).toBe(false)
  })
})

describe('normalizePath', () => {
  it('accepts site-relative paths', () => {
    expect(normalizePath('/')).toBe('/')
    expect(normalizePath('/version')).toBe('/version')
    expect(normalizePath('  /analytics  ')).toBe('/analytics')
  })

  it('rejects junk', () => {
    expect(normalizePath(null)).toBeNull()
    expect(normalizePath('')).toBeNull()
    expect(normalizePath('   ')).toBeNull()
    expect(normalizePath('https://evil.com')).toBeNull()
    expect(normalizePath('/page?x=1')).toBeNull()
    expect(normalizePath('/page#frag')).toBeNull()
    expect(normalizePath('/<script>')).toBeNull()
    expect(normalizePath(`/${'a'.repeat(300)}`)).toBeNull()
  })
})

describe('dayKey', () => {
  it('formats as yyyy-mm-dd UTC', () => {
    expect(dayKey(new Date('2026-10-02T23:30:00Z'))).toBe('2026-10-02')
  })
})

describe('hashVisitor', () => {
  it('is deterministic for the same inputs', () => {
    const a = hashVisitor('salt', '1.2.3.4', 'ua')
    const b = hashVisitor('salt', '1.2.3.4', 'ua')
    expect(a).toBe(b)
    expect(a).toHaveLength(64)
  })

  it('changes with salt, ip, or ua', () => {
    const base = hashVisitor('salt', '1.2.3.4', 'ua')
    expect(hashVisitor('other', '1.2.3.4', 'ua')).not.toBe(base)
    expect(hashVisitor('salt', '5.6.7.8', 'ua')).not.toBe(base)
    expect(hashVisitor('salt', '1.2.3.4', 'other')).not.toBe(base)
  })

  it('is stable across days so returning visitors count once', () => {
    // The day is deliberately NOT part of the hash.
    expect(hashVisitor('salt', '1.2.3.4', 'ua')).toBe(hashVisitor('salt', '1.2.3.4', 'ua'))
  })

  it('does not leak the ip', () => {
    const hash = hashVisitor('salt', '1.2.3.4', 'ua')
    expect(hash).not.toContain('1.2.3.4')
  })
})

describe('clientIpFromHeaders', () => {
  it('takes the first x-forwarded-for entry', () => {
    const headers = new Headers({
      'x-forwarded-for': '203.0.113.7, 70.41.3.18',
    })
    expect(clientIpFromHeaders(headers)).toBe('203.0.113.7')
  })

  it('skips empty first forwarded entry', () => {
    const headers = new Headers({ 'x-forwarded-for': ', 203.0.113.7' })
    expect(clientIpFromHeaders(headers)).toBe('unknown')
  })

  it('falls back to x-real-ip then unknown', () => {
    expect(clientIpFromHeaders(new Headers())).toBe('unknown')
    expect(clientIpFromHeaders(new Headers({ 'x-real-ip': '198.51.100.9' }))).toBe('198.51.100.9')
  })

  it('works with plain record headers', () => {
    expect(clientIpFromHeaders({ 'x-forwarded-for': '203.0.113.7' })).toBe('203.0.113.7')
    expect(clientIpFromHeaders({ 'x-forwarded-for': null })).toBe('unknown')
  })
})

describe('getConfig', () => {
  it('returns null when env vars are missing', () => {
    expect(getConfig()).toBeNull()
  })

  it('returns config when all vars are set', () => {
    vi.stubEnv('ANALYTICS_TABLE', 't')
    vi.stubEnv('ANALYTICS_AWS_REGION', 'us-east-1')
    vi.stubEnv('ANALYTICS_AWS_ACCESS_KEY_ID', 'k')
    vi.stubEnv('ANALYTICS_AWS_SECRET_ACCESS_KEY', 's')
    vi.stubEnv('ANALYTICS_SALT', 'salt')
    expect(getConfig()).toEqual({
      table: 't',
      region: 'us-east-1',
      accessKeyId: 'k',
      secretAccessKey: 's',
      salt: 'salt',
    })
  })
})

describe('recordPageView', () => {
  it('returns false without configuration (no DynamoDB calls)', async () => {
    await expect(recordPageView('/', '1.2.3.4', 'browser')).resolves.toBe(false)
  })

  it('returns false for bots', async () => {
    vi.stubEnv('ANALYTICS_TABLE', 't')
    vi.stubEnv('ANALYTICS_AWS_REGION', 'us-east-1')
    vi.stubEnv('ANALYTICS_AWS_ACCESS_KEY_ID', 'k')
    vi.stubEnv('ANALYTICS_AWS_SECRET_ACCESS_KEY', 's')
    vi.stubEnv('ANALYTICS_SALT', 'salt')
    await expect(recordPageView('/', '1.2.3.4', 'Googlebot/2.1')).resolves.toBe(false)
  })

  it('returns false for invalid paths', async () => {
    await expect(recordPageView('https://evil.com', '1.2.3.4', 'browser')).resolves.toBe(false)
  })
})

describe('isRateLimited', () => {
  beforeEach(() => {
    __resetRateLimitForTests()
  })

  it('allows requests under the limit', () => {
    for (let i = 0; i < 60; i++) {
      expect(isRateLimited('test-key', 1000 + i)).toBe(false)
    }
  })

  it('blocks the 61st request within a minute', () => {
    for (let i = 0; i < 60; i++) {
      isRateLimited('test-key', 1000 + i)
    }
    expect(isRateLimited('test-key', 2000)).toBe(true)
  })

  it('resets after the window passes', () => {
    for (let i = 0; i < 60; i++) {
      isRateLimited('test-key', 1000 + i)
    }
    expect(isRateLimited('test-key', 2000)).toBe(true)
    // 61 seconds later: window has slid past the burst.
    expect(isRateLimited('test-key', 62_000)).toBe(false)
  })

  it('tracks keys independently', () => {
    for (let i = 0; i < 60; i++) {
      isRateLimited('key-a', 1000 + i)
    }
    expect(isRateLimited('key-a', 2000)).toBe(true)
    expect(isRateLimited('key-b', 2000)).toBe(false)
  })
})

describe('getPageUniqueViews', () => {
  it('returns null when analytics is not configured', async () => {
    // No ANALYTICS_* env vars set in test env.
    await expect(getPageUniqueViews('/version')).resolves.toBeNull()
  })
})

/* ------------------------------------------------------------------ */
/* DynamoDB-backed paths, with a mocked document client.               */
/* ------------------------------------------------------------------ */

import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { getAnalyticsSummary, getPageTotalViews } from './analytics'

vi.mock('@aws-sdk/lib-dynamodb', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@aws-sdk/lib-dynamodb')>()
  return { ...actual, DynamoDBDocumentClient: { from: vi.fn() } }
})

const TEST_ENV = {
  ANALYTICS_TABLE: 'test-table',
  ANALYTICS_AWS_REGION: 'us-east-1',
  ANALYTICS_AWS_ACCESS_KEY_ID: 'test-key',
  ANALYTICS_AWS_SECRET_ACCESS_KEY: 'test-secret',
  ANALYTICS_SALT: 'test-salt',
}

function mockClient(sendImpl: (cmd: unknown) => Promise<unknown>) {
  const send = vi.fn(sendImpl)
  vi.mocked(DynamoDBDocumentClient.from).mockReturnValue({ send } as never)
  return send
}

function setTestEnv() {
  for (const [k, v] of Object.entries(TEST_ENV)) vi.stubEnv(k, v)
}

describe('recordPageView (with DynamoDB)', () => {
  beforeEach(() => {
    setTestEnv()
    __resetClientForTests()
  })

  it('writes total, daily, and uniques records', async () => {
    const send = mockClient(async () => ({}))
    const ok = await recordPageView('/version', '1.2.3.4', 'Mozilla/5.0 Chrome/120', new Date('2026-10-03T12:00:00Z'))
    expect(ok).toBe(true)
    // TOTAL + page DAY + page UNIQUES + SITE UNIQUES records.
    expect(send).toHaveBeenCalledTimes(4)
  })

  it('reuses the cached client across calls', async () => {
    const send = mockClient(async () => ({}))
    await recordPageView('/a', '1.1.1.1', 'Mozilla/5.0', new Date())
    await recordPageView('/b', '1.1.1.1', 'Mozilla/5.0', new Date())
    expect(DynamoDBDocumentClient.from).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledTimes(8)
  })

  it('writes the same visitor hash on repeat visits a year apart', async () => {
    const send = mockClient(async () => ({}))
    const ip = '203.0.113.9'
    const ua = 'Mozilla/5.0 TestBrowser/1.0'
    await recordPageView('/', ip, ua, new Date('2026-10-05T12:00:00Z'))
    await recordPageView('/analytics', ip, ua, new Date('2027-10-05T12:00:00Z'))
    const uniquesWrites = send.mock.calls.filter(
      (call) => (call[0] as { input: { Key: { sk: string } } }).input.Key.sk === 'UNIQUES'
    )
    // Page UNIQUES + SITE UNIQUES for each of the two visits.
    expect(uniquesWrites).toHaveLength(4)
    const hashes = uniquesWrites.map(
      (call) =>
        [
          ...(
            call[0] as {
              input: {
                ExpressionAttributeValues: { ':visitor': Set<string> }
              }
            }
          ).input.ExpressionAttributeValues[':visitor'],
        ][0]
    )
    // All four writes carry the identical hash: the visitor counts once.
    expect(new Set(hashes).size).toBe(1)
  })
})

describe('getPageTotalViews (with DynamoDB)', () => {
  beforeEach(() => {
    setTestEnv()
    __resetClientForTests()
  })

  it('returns the stored view count', async () => {
    mockClient(async () => ({ Item: { views: 42 } }))
    await expect(getPageTotalViews('/version')).resolves.toBe(42)
  })

  it('returns 0 when the page has no record', async () => {
    mockClient(async () => ({}))
    await expect(getPageTotalViews('/version')).resolves.toBe(0)
  })

  it('returns null without configuration', async () => {
    vi.unstubAllEnvs()
    __resetClientForTests()
    await expect(getPageTotalViews('/version')).resolves.toBeNull()
  })
})

describe('getPageUniqueViews (with DynamoDB)', () => {
  beforeEach(() => {
    setTestEnv()
    __resetClientForTests()
  })

  it('returns the size of the persistent visitor set', async () => {
    mockClient(async () => ({ Item: { visitors: ['a', 'b', 'c'] } }))
    await expect(getPageUniqueViews('/version')).resolves.toBe(3)
  })

  it('handles Set visitor collections', async () => {
    mockClient(async () => ({ Item: { visitors: new Set(['d', 'e']) } }))
    await expect(getPageUniqueViews('/version')).resolves.toBe(2)
  })

  it('returns 0 when the page has no uniques record', async () => {
    mockClient(async () => ({}))
    await expect(getPageUniqueViews('/version')).resolves.toBe(0)
  })
})

describe('getAnalyticsSummary (with DynamoDB)', () => {
  beforeEach(() => {
    setTestEnv()
    __resetClientForTests()
  })

  it('returns null without configuration', async () => {
    vi.unstubAllEnvs()
    __resetClientForTests()
    await expect(getAnalyticsSummary()).resolves.toBeNull()
  })

  it('aggregates totals, daily stats, and true uniques', async () => {
    mockClient(async () => ({
      Items: [
        { pk: 'PAGE#/', sk: 'TOTAL', path: '/', views: 100 },
        {
          pk: 'PAGE#/',
          sk: 'UNIQUES',
          path: '/',
          visitors: new Set(['u1', 'u2']),
        },
        {
          pk: 'PAGE#/',
          sk: 'DAY#2026-10-02',
          path: '/',
          day: '2026-10-02',
          views: 4,
        },
        {
          pk: 'PAGE#/',
          sk: 'DAY#2026-10-01',
          path: '/',
          day: '2026-10-01',
          views: 2,
        },
        {
          pk: 'PAGE#/',
          sk: 'DAY#2026-10-03',
          path: '/',
          day: '2026-10-03',
          views: 10,
        },
        {
          pk: 'PAGE#/',
          sk: 'DAY#2026-09-28',
          path: '/',
          day: '2026-09-28',
          views: 1,
        },
        {
          pk: 'PAGE#/',
          sk: 'DAY#2026-09-30',
          path: '/',
          day: '2026-09-30',
          views: 5,
        },
        {
          pk: 'SITE',
          sk: 'UNIQUES',
          visitors: ['u1', 'u2', 'u3'],
        },
        // UNIQUES item without a visitors field: counts as 0.
        {
          pk: 'PAGE#/version',
          sk: 'UNIQUES',
          path: '/version',
        },
        // Legacy day-bound records are ignored by the new read path.
        {
          pk: 'SITE',
          sk: 'DAY#2026-10-03',
          day: '2026-10-03',
          visitors: ['legacy1', 'legacy2'],
        },
      ],
    }))
    const summary = await getAnalyticsSummary(30, new Date('2026-10-03T12:00:00Z'))
    expect(summary).not.toBeNull()
    expect(summary!.totalViews).toBe(100)
    expect(summary!.totalUniques).toBe(3)
    expect(summary!.pages).toHaveLength(2)
    expect(summary!.pages[0].path).toBe('/')
    expect(summary!.pages[0].uniques).toBe(2)
    expect(summary!.pages[1].path).toBe('/version')
    expect(summary!.pages[1].uniques).toBe(0)
    expect(summary!.dailyTotals).toHaveLength(5)
    // Sorted ascending by day.
    expect(summary!.dailyTotals[0].day).toBe('2026-09-28')
    expect(summary!.dailyTotals[4].day).toBe('2026-10-03')
    expect(summary!.fetchedAt).toBeTruthy()
  })

  it('follows scan pagination', async () => {
    let calls = 0
    mockClient(async () => {
      calls += 1
      if (calls === 1) {
        return {
          Items: [{ pk: 'PAGE#/x', sk: 'TOTAL', path: '/x', views: 5 }],
          LastEvaluatedKey: { pk: 'y' },
        }
      }
      return {
        Items: [{ pk: 'PAGE#/y', sk: 'TOTAL', path: '/y', views: 7 }],
      }
    })
    const summary = await getAnalyticsSummary()
    expect(summary!.totalViews).toBe(12)
    expect(summary!.pages).toHaveLength(2)
  })

  it('ignores items outside the day window', async () => {
    mockClient(async () => ({
      Items: [
        { pk: 'PAGE#/', sk: 'TOTAL', path: '/', views: 50 },
        {
          pk: 'PAGE#/',
          sk: 'DAY#2020-01-01',
          path: '/',
          day: '2020-01-01',
          views: 99,
        },
      ],
    }))
    const summary = await getAnalyticsSummary(30, new Date('2026-10-03T12:00:00Z'))
    expect(summary!.totalViews).toBe(50)
    expect(summary!.pages[0].daily).toHaveLength(0)
    expect(summary!.pages[0].uniques).toBe(0)
  })

  it('handles missing fields and empty pages', async () => {
    let calls = 0
    mockClient(async () => {
      calls += 1
      if (calls === 1) return { LastEvaluatedKey: { pk: 'x' } } // no Items
      return {
        Items: [
          // No path field: falls back to pk slice.
          // No views field: falls back to 0.
          { pk: 'PAGE#/version', sk: 'TOTAL' },
          { pk: 'PAGE#/version', sk: 'DAY#2026-10-01', views: 3 },
          // DAY without views: falls back to 0.
          { pk: 'PAGE#/version', sk: 'DAY#2026-09-29' },
          // No sk at all: sk?.startsWith is undefined.
          { pk: 'PAGE#/version' },
          // SITE without DAY sk.
          { pk: 'SITE' },
          // SITE with old DAY sk (outside window).
          { pk: 'SITE', sk: 'DAY#2020-01-01', visitors: ['x'] },
          // Unrecognized pk prefix: skipped.
          { pk: 'OTHER', sk: 'TOTAL' },
        ],
      }
    })
    const summary = await getAnalyticsSummary(30, new Date('2026-10-03T12:00:00Z'))
    expect(summary!.totalViews).toBe(0)
    expect(summary!.pages[0].path).toBe('/version')
    expect(summary!.pages[0].totalViews).toBe(0)
  })
})

describe('compareDays', () => {
  it('orders days ascending', () => {
    expect(compareDays({ day: '2026-10-01' }, { day: '2026-10-02' })).toBe(-1)
    expect(compareDays({ day: '2026-10-02' }, { day: '2026-10-01' })).toBe(1)
    expect(compareDays({ day: '2026-10-01' }, { day: '2026-10-01' })).toBe(1)
  })
})
