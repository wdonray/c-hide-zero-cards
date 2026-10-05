import { test, expect } from '@playwright/test'

/**
 * The root layout locks document scrolling (overflow-hidden on <html>) so the
 * card workspace never rubber-bands while dragging. The /version page opts out
 * of that lock because its release list is taller than a phone viewport.
 * Regression coverage for the report "I can't scroll vertically on the
 * versions page" — and a guard that the home page keeps its exact lock.
 */
test.use({
  viewport: { width: 375, height: 667 },
  hasTouch: true,
  isMobile: true,
})

const RELEASES_URL = 'https://api.github.com/repos/wdonray/c-hide-zero-cards/releases'

function mockReleases(tags: string[]) {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(
      tags.map((tag) => ({
        tag_name: tag,
        html_url: `https://github.com/wdonray/c-hide-zero-cards/releases/tag/${tag}`,
        published_at: '2026-10-03T11:00:00Z',
        body: `### Tests\n\n  - Some change (abc1234)\n`,
      }))
    ),
  }
}

test.describe('/version page scrolling (mobile)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('hzc-has-seen-welcome-dialog', 'true')
      localStorage.setItem('hzc-has-seen-first-time-toast', 'true')
    })
    await page.route(
      (url) => url.href.startsWith(RELEASES_URL),
      (route) => route.fulfill(mockReleases(['v0.19.20', 'v0.19.19', 'v0.19.18', 'v0.19.17', 'v0.19.16']))
    )
  })

  test('opts out of the document scroll lock', async ({ page }) => {
    await page.goto('/version')
    await expect(page.getByRole('heading', { name: 'Version' })).toBeVisible()

    const hasLock = await page.evaluate(() => document.documentElement.classList.contains('overflow-hidden'))
    expect(hasLock).toBe(false)
  })

  test('scrolls vertically to reach the oldest release', async ({ page }) => {
    await page.goto('/version')
    const releases = page.getByRole('list', { name: 'Releases' })
    await expect(releases.getByText('v0.19.20', { exact: true })).toBeVisible()

    const canScroll = await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight)
    expect(canScroll).toBe(true)

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    const scrolled = await page.evaluate(() => window.scrollY)
    expect(scrolled).toBeGreaterThan(0)

    // The oldest release is only reachable after scrolling.
    await expect(releases.getByText('v0.19.16', { exact: true })).toBeVisible()
  })

  test('no horizontal overflow at 375px', async ({ page }) => {
    await page.goto('/version')
    await expect(page.getByRole('heading', { name: 'Version' })).toBeVisible()

    const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
    expect(overflows).toBe(false)
  })

  test('home page keeps the document scroll lock', async ({ page }) => {
    await page.goto('/')

    const hasLock = await page.evaluate(() => document.documentElement.classList.contains('overflow-hidden'))
    expect(hasLock).toBe(true)
  })

  test('header wordmark links back to the home page', async ({ page }) => {
    await page.goto('/version')
    await expect(page.getByRole('heading', { name: 'Version' })).toBeVisible()

    await page.getByRole('link', { name: 'Hide Zero Cards home' }).click()
    await expect(page).toHaveURL('/')
  })
})
