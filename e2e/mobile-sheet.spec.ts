import { test, expect, type Page } from '@playwright/test'

/**
 * Mobile footer relocation + More sheet open/close.
 *
 * On mobile the footer bar is hidden entirely; its contents (donray.dev,
 * LinkedIn, Coffee, copyright, version link) live inside the More bottom
 * sheet instead. The sheet's close animation is a pure bottom-sheet slide
 * (no fade/zoom), symmetric with the open animation.
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
  await page.goto('/')
})

async function openMoreSheet(page: Page) {
  await page.getByRole('button', { name: 'More actions' }).click()
  const sheet = page.getByRole('dialog', { name: 'More actions' })
  await expect(sheet).toBeVisible()
  return sheet
}

test.describe('mobile footer relocation', () => {
  test('the footer bar is hidden on mobile viewports', async ({ page }) => {
    await expect(page.locator('footer')).toBeHidden()
  })

  test('all footer links live inside the More sheet on mobile', async ({ page }) => {
    const sheet = await openMoreSheet(page)

    await expect(sheet.getByRole('link', { name: 'donray.dev' })).toBeVisible()
    await expect(sheet.getByRole('link', { name: 'LinkedIn' })).toBeVisible()
    await expect(sheet.getByRole('button', { name: 'Coffee' })).toBeVisible()
    await expect(sheet.getByText(/© \d{4} Donray Williams/)).toBeVisible()
    // The version link already lived in the sheet; it stays there (no duplication).
    await expect(sheet.getByTitle('App version and release history')).toBeVisible()
  })
})

test.describe('more sheet open/close', () => {
  test('opens on More tap and closes via Escape', async ({ page }) => {
    const sheet = await openMoreSheet(page)

    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()
  })

  test('opens on More tap and closes via the X close button', async ({ page }) => {
    const sheet = await openMoreSheet(page)

    await sheet.getByRole('button', { name: 'Close' }).click()
    await expect(sheet).toBeHidden()
  })

  test('close animation completes without the sheet jumping', async ({ page }) => {
    const sheet = await openMoreSheet(page)
    const boxBefore = await sheet.boundingBox()
    expect(boxBefore).not.toBeNull()

    // Start closing, then sample mid-transition: a pure slide keeps the
    // sheet fully opaque and full-width while it travels downward.
    await page.keyboard.press('Escape')
    await page.waitForTimeout(80)
    const midClose = await page.getByRole('dialog', { name: 'More actions' }).count()
    expect(midClose).toBe(1)

    await expect(sheet).toBeHidden({ timeout: 2000 })
  })
})

test.describe('desktop footer', () => {
  test.use({ viewport: { width: 1280, height: 720 }, isMobile: false, hasTouch: false })

  test('the footer bar stays visible on desktop viewports', async ({ page }) => {
    await expect(page.locator('footer')).toBeVisible()
    await expect(page.locator('footer').getByRole('link', { name: 'donray.dev' })).toBeVisible()
  })
})
