import { test, expect, type Page, type Locator } from '@playwright/test'

/**
 * Number Forms dialog navigation redesign (owner directive 2026-10-05):
 * on mobile (<768px) the horizontally-scrolling tab row is replaced by a
 * single vertically-scrolling view with all four forms as stacked labeled
 * sections. Desktop keeps the tabbed layout.
 */

async function seedAndGoto(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('hzc-has-seen-welcome-dialog', 'true')
    localStorage.setItem('hzc-has-seen-first-time-toast', 'true')
  })
  await page.goto('/')
}

async function openNumberForms(page: Page): Promise<Locator> {
  await page.getByPlaceholder('Type a number here!').fill('1234')
  await page.getByTitle(/Number Forms/, { exact: false }).click()
  const dialog = page.getByRole('dialog', { name: /Number Forms/ })
  await expect(dialog).toBeVisible()
  return dialog
}

test.describe('mobile stacked sections', () => {
  test.use({
    viewport: { width: 375, height: 667 },
    hasTouch: true,
    isMobile: true,
  })

  test.beforeEach(async ({ page }) => {
    await seedAndGoto(page)
  })

  test('renders no tab row; all four forms as headed sections', async ({ page }) => {
    const dialog = await openNumberForms(page)
    await expect(dialog.getByRole('tablist')).toHaveCount(0)
    await expect(dialog.getByRole('tab')).toHaveCount(0)

    const headings = dialog.getByRole('heading', { level: 3 })
    await expect(headings).toHaveText(['Word Form', 'Unit Form', 'Expanded Form', 'Standard Form'])
  })

  test('each section renders its form content', async ({ page }) => {
    const dialog = await openNumberForms(page)
    await expect(dialog.getByText('one thousand two hundred thirty-four')).toBeVisible()
    await expect(dialog.getByText('1,000 + 200 + 30 + 4')).toBeVisible()
    await expect(dialog.getByText('1,234')).toBeVisible()
  })

  test('sections are reachable by vertical scroll with no horizontal overflow', async ({ page }) => {
    const dialog = await openNumberForms(page)
    const lastHeading = dialog.getByRole('heading', { name: 'Standard Form' })
    await lastHeading.scrollIntoViewIfNeeded()
    await expect(lastHeading).toBeVisible()

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    )
    expect(overflow).toBeLessThanOrEqual(1)
  })

  test('reveal cards toggle is not offered on mobile', async ({ page }) => {
    const dialog = await openNumberForms(page)
    // Owner directive 2026-10-05: the toggle is not offered on mobile.
    await expect(dialog.getByRole('button', { name: /eveal cards/ })).toHaveCount(0)
    // Sections remain intact without the toggle.
    await expect(dialog.getByRole('heading', { name: 'Word Form' })).toBeVisible()
  })
})

test.describe('desktop tabs unchanged', () => {
  test.use({
    viewport: { width: 1280, height: 800 },
  })

  test.beforeEach(async ({ page }) => {
    await seedAndGoto(page)
  })

  test('tab row still works on desktop', async ({ page }) => {
    const dialog = await openNumberForms(page)
    await expect(dialog.getByRole('tablist')).toHaveCount(1)
    // No stacked section headings on desktop.
    await expect(dialog.getByRole('heading', { name: 'Word Form' })).toHaveCount(0)

    await expect(dialog.getByText('one thousand two hundred thirty-four')).toBeVisible()
    await dialog.getByRole('tab', { name: 'Expanded Form' }).click()
    await expect(dialog.getByText('1,000 + 200 + 30 + 4')).toBeVisible()
    await dialog.getByRole('tab', { name: 'Standard Form' }).click()
    await expect(dialog.getByText('1,234')).toBeVisible()
  })
})
