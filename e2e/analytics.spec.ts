import { test, expect } from '@playwright/test'

test.describe('/analytics page', () => {
  test.beforeEach(async ({ page }) => {
    // Suppress the welcome dialog; scan the analytics page surface.
    await page.addInitScript(() => {
      localStorage.setItem('hzc-has-seen-welcome-dialog', 'true')
    })
  })

  test('renders the analytics heading', async ({ page }) => {
    await page.goto('/analytics')

    await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible()
  })

  test('shows the not-configured state gracefully without credentials', async ({ page }) => {
    await page.goto('/analytics')

    // CI has no ANALYTICS_* env vars, so the page shows the empty state.
    await expect(page.getByText("Analytics isn't configured on this build yet.")).toBeVisible()
  })

  test('footer links to the analytics page', async ({ page }) => {
    await page.goto('/')

    const link = page.getByRole('link', { name: 'Analytics' })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', '/analytics')
  })

  test('page scroll is not locked (html has no overflow-hidden)', async ({ page }) => {
    await page.goto('/analytics')

    // The root layout locks document scrolling for the card workspace;
    // content pages opt out via EnablePageScroll.
    const overflowHidden = await page.evaluate(() => document.documentElement.classList.contains('overflow-hidden'))
    expect(overflowHidden).toBe(false)
  })
})

test.describe('/api/track', () => {
  test('accepts a valid hit', async ({ request }) => {
    const res = await request.post('/api/track', {
      data: { path: '/version' },
    })
    expect(res.status()).toBe(200)
    await expect(res.json()).resolves.toEqual({ ok: true })
  })

  test('rejects a bad path', async ({ request }) => {
    const res = await request.post('/api/track', {
      data: { path: 'https://evil.com' },
    })
    expect(res.status()).toBe(400)
  })

  test('rejects a missing path', async ({ request }) => {
    const res = await request.post('/api/track', {
      data: {},
    })
    expect(res.status()).toBe(400)
  })

  test('accepts a bot hit without recording (still 200)', async ({ request }) => {
    const res = await request.post('/api/track', {
      data: { path: '/' },
      headers: { 'user-agent': 'Googlebot/2.1' },
    })
    expect(res.status()).toBe(200)
  })
})
