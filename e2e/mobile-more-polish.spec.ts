import { test, expect, type Page } from '@playwright/test'

/**
 * Mobile More-sheet polish:
 *  1. The X close button has clear spacing above the range button under it.
 *  2. "Random number range" expands inline as a vertical list of large
 *     touch targets (no cramped overlapping popover on mobile).
 *  3. The App version row is an obvious link to /version.
 */
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
  // The /version page fetches GitHub; mock it so navigation assertions resolve fast.
  await page.route(
    (url) => url.href.startsWith('https://api.github.com/repos/wdonray/c-hide-zero-cards/releases'),
    (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  )
  await page.goto('/')
})

async function openMoreSheet(page: Page) {
  await page.getByRole('button', { name: 'More actions' }).click()
  const sheet = page.getByRole('dialog', { name: 'More actions' })
  await expect(sheet).toBeVisible()
  // Let the bottom-sheet slide-in animation finish so measurements are steady.
  await (await sheet.elementHandle())?.waitForElementState('stable')
  return sheet
}

test.describe('more sheet polish', () => {
  test('the X close button has clear spacing above the range button', async ({ page }) => {
    const sheet = await openMoreSheet(page)

    const closeBox = await sheet.getByRole('button', { name: 'Close' }).boundingBox()
    const toggleBox = await sheet.getByTitle('Set random number range', { exact: true }).boundingBox()
    expect(closeBox, 'close button should have a bounding box').not.toBeNull()
    expect(toggleBox, 'range toggle should have a bounding box').not.toBeNull()

    const gap = toggleBox!.y - (closeBox!.y + closeBox!.height)
    expect(gap, 'vertical gap between X and the range button').toBeGreaterThanOrEqual(16)
  })

  test('range options expand inline as large, non-overlapping rows (no popover)', async ({ page }) => {
    const sheet = await openMoreSheet(page)

    await sheet.getByTitle('Set random number range', { exact: true }).click()

    // No overlapping popover is opened on mobile.
    await expect(page.locator('[data-slot="popover-content"]')).toHaveCount(0)

    const options = sheet.getByRole('button', { name: /^Up to / })
    await expect(options).toHaveCount(8)

    const boxes: Array<{ x: number; y: number; width: number; height: number }> = []
    for (const option of await options.all()) {
      const box = await option.boundingBox()
      expect(box, 'option should have a bounding box').not.toBeNull()
      expect(box!.height, 'option touch target height').toBeGreaterThanOrEqual(44)
      boxes.push(box!)
    }

    // No two option rows overlap.
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i]
        const b = boxes[j]
        const overlaps = a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
        expect(overlaps, `options ${i} and ${j} should not overlap`).toBe(false)
      }
    }
  })

  test('selecting a range collapses the list and marks the selection', async ({ page }) => {
    const sheet = await openMoreSheet(page)

    await sheet.getByTitle('Set random number range', { exact: true }).click()
    await sheet.getByRole('button', { name: 'Up to 100', exact: true }).click()

    // Selecting collapses the inline list.
    await expect(sheet.getByRole('button', { name: 'Up to 100', exact: true })).toBeHidden()

    // Re-expanding shows the choice marked selected.
    await sheet.getByTitle('Set random number range', { exact: true }).click()
    await expect(sheet.getByRole('button', { name: 'Up to 100', exact: true })).toHaveAttribute('aria-pressed', 'true')
  })

  test('the App version row is an obvious link to /version', async ({ page }) => {
    const sheet = await openMoreSheet(page)

    const versionLink = sheet.getByTitle('App version and release history')
    await expect(versionLink).toBeVisible()
    // Chevron affordance: the link reads as tappable.
    await expect(versionLink.locator('svg')).toBeVisible()

    await versionLink.click()
    await expect(page).toHaveURL('/version')
    await expect(page.getByRole('heading', { name: 'Version' })).toBeVisible()
  })
})
