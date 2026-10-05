import { readFileSync } from 'fs'
import { join } from 'path'
import { test, expect } from '@playwright/test'

const { version } = JSON.parse(readFileSync(join(import.meta.dirname, '..', 'package.json'), 'utf8')) as {
  version: string
}

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

test.describe('/version page', () => {
  test.beforeEach(async ({ page }) => {
    // Suppress the welcome dialog; it lives in the root layout.
    await page.addInitScript(() => {
      localStorage.setItem('hzc-has-seen-welcome-dialog', 'true')
    })
  })

  test('shows the heading, live indicator, and current build', async ({ page }) => {
    await page.route(
      (url) => url.href.startsWith(RELEASES_URL),
      (route) => route.fulfill(mockReleases([`v${version}`]))
    )
    await page.goto('/version')

    await expect(page.getByRole('heading', { name: 'Version' })).toBeVisible()
    await expect(page.getByText('This build', { exact: true }).first()).toBeVisible()
    await expect(page.getByText(`v${version}`, { exact: true }).first()).toBeVisible()
    await expect(page.getByText(/Live · updated/)).toBeVisible()
  })

  test('lists recent releases with the newest marked Latest', async ({ page }) => {
    await page.route(
      (url) => url.href.startsWith(RELEASES_URL),
      (route) => route.fulfill(mockReleases(['v0.19.11', 'v0.19.10']))
    )
    await page.goto('/version')

    const releases = page.getByRole('list', { name: 'Releases' })
    await expect(releases.getByText('v0.19.11', { exact: true })).toBeVisible()
    await expect(releases.getByText('Latest')).toBeVisible()
    await expect(releases.getByText('v0.19.10', { exact: true })).toBeVisible()
    await expect(releases.getByText('Some change').first()).toBeVisible()
  })

  test('marks the running build in the release list', async ({ page }) => {
    await page.route(
      (url) => url.href.startsWith(RELEASES_URL),
      (route) => route.fulfill(mockReleases([`v${version}`, 'v0.19.9']))
    )
    await page.goto('/version')

    // Header label plus the badge on the matching release card.
    await expect(page.getByText('This build', { exact: true })).toHaveCount(2)
  })

  test('shows offline in the live indicator when GitHub is unreachable', async ({ page }) => {
    await page.route(
      (url) => url.href.startsWith(RELEASES_URL),
      (route) => route.abort()
    )
    await page.goto('/version')

    await expect(page.getByText('Offline · showing last known releases')).toBeVisible()
  })

  test('is reachable from the footer version link', async ({ page }) => {
    await page.route(
      (url) => url.href.startsWith(RELEASES_URL),
      (route) => route.fulfill(mockReleases([]))
    )
    await page.goto('/')
    await page.getByRole('link', { name: `v${version}` }).click()
    await expect(page).toHaveURL('/version')
    await expect(page.getByRole('heading', { name: 'Version' })).toBeVisible()
  })
})
