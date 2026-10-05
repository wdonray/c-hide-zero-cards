import { test, expect } from '@playwright/test'

/**
 * The mobile bottom action bar (Roll, Zero, Mix, Reset, Clear, Forms, More)
 * is for the card workspace. The /version route is informational, so the
 * bar is unmounted there (owner directive 2026-10-05).
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

test.describe('/version page chrome (mobile)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('hzc-has-seen-welcome-dialog', 'true')
      localStorage.setItem('hzc-has-seen-first-time-toast', 'true')
    })
    await page.route(
      (url) => url.href.startsWith(RELEASES_URL),
      (route) => route.fulfill(mockReleases(['v0.19.25', 'v0.19.24', 'v0.19.23', 'v0.19.22', 'v0.19.21']))
    )
  })

  test('action bar is not rendered on the /version route', async ({ page }) => {
    await page.goto('/version')
    await expect(page.getByRole('heading', { name: 'Version' })).toBeVisible()

    await expect(page.getByRole('navigation', { name: 'Quick actions' })).toHaveCount(0)
  })

  test('action bar is still rendered on the home route', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('navigation', { name: 'Quick actions' })).toBeVisible()
  })

  test('the version page still scrolls vertically', async ({ page }) => {
    await page.goto('/version')
    const releases = page.getByRole('list', { name: 'Releases' })
    await expect(releases.getByText('v0.19.25', { exact: true })).toBeVisible()

    const canScroll = await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight)
    expect(canScroll).toBe(true)

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    const scrolled = await page.evaluate(() => window.scrollY)
    expect(scrolled).toBeGreaterThan(0)
    await expect(releases.getByText('v0.19.21', { exact: true })).toBeVisible()
  })
})
