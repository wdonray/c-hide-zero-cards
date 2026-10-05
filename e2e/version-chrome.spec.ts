import { test, expect } from '@playwright/test'

/**
 * /version page chrome (owner directive 2026-10-05): the page is
 * informational, so neither the desktop Toolbar nor the mobile action bar
 * renders there (PR #47 handled mobile; this covers desktop). The app header
 * (with the home link), the footer, and the page's own scroll behavior stay.
 * Desktop top spacing above the "Version" heading is tight (md:pt-8).
 */

const RELEASES_URL = 'https://api.github.com/repos/wdonray/c-hide-zero-cards/releases'

test.describe('desktop /version chrome', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('hzc-has-seen-welcome-dialog', 'true')
    })
    await page.route(
      (url) => url.href.startsWith(RELEASES_URL),
      (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        })
    )
  })

  test('no toolbar, but header, footer, and heading are present', async ({ page }) => {
    await page.goto('/version')
    await expect(page.getByRole('heading', { name: 'Version' })).toBeVisible()

    // Desktop toolbar actions (Roll/Mix/Zero/...) must not render.
    await expect(page.getByTitle('Randomize card position', { exact: true })).toHaveCount(0)
    await expect(page.getByTitle('Roll a random number', { exact: false })).toHaveCount(0)

    // App header with the home link and the footer stay.
    await expect(page.getByRole('link', { name: 'Hide Zero Cards home' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'donray.dev' })).toBeVisible()
  })

  test('top spacing above the heading is modest', async ({ page }) => {
    await page.goto('/version')
    const heading = page.getByRole('heading', { name: 'Version' })
    await expect(heading).toBeVisible()

    const gap = await page.evaluate(() => {
      const header = document.querySelector('header')
      // The app header itself contains an h1 wordmark; the page heading is
      // the h1 inside main.
      const h1 = document.querySelector('main h1')
      if (!header || !h1) return -1
      return h1.getBoundingClientRect().top - header.getBoundingClientRect().bottom
    })
    // Was ~177px with md:pt-24 plus the toolbar; now ~64px.
    expect(gap).toBeGreaterThan(0)
    expect(gap).toBeLessThan(100)
  })

  test('toolbar still renders on the home page', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTitle('Randomize card position', { exact: true })).toBeVisible()
  })
})

test.describe('mobile /version chrome (PR #47 regression guard)', () => {
  test.use({
    viewport: { width: 375, height: 667 },
    hasTouch: true,
    isMobile: true,
  })

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('hzc-has-seen-welcome-dialog', 'true')
      localStorage.setItem('hzc-has-seen-first-time-toast', 'true')
    })
    await page.route(
      (url) => url.href.startsWith(RELEASES_URL),
      (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        })
    )
  })

  test('no action bar on /version, present on home', async ({ page }) => {
    await page.goto('/version')
    await expect(page.getByRole('heading', { name: 'Version' })).toBeVisible()
    // Bar buttons are aria-labelled by their title ("Randomize card position").
    await expect(page.getByRole('button', { name: 'Randomize card position' })).toHaveCount(0)

    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Randomize card position' })).toBeVisible()
  })
})
