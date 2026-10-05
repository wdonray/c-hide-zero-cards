import { test, expect, type Page, type Locator } from '@playwright/test'

/**
 * Number Forms dialog fit on narrow viewports (375x667, touch enabled).
 *
 * Regression coverage for the mobile dialog overflow: the tab row used to
 * clip the 4th tab (Standard Form was unreachable), the title wrapped
 * awkwardly, and the content card was a tall empty box. The dialog now shows
 * all four forms as stacked, vertically-scrolling sections with headings
 * instead of a tab row. These tests assert the dialog fits the viewport,
 * every form section is present, the Reveal-cards toggle is hidden on mobile,
 * and nothing overflows horizontally.
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

async function openNumberForms(page: Page): Promise<Locator> {
  await page.getByPlaceholder('Type a number here!').fill('1234')
  await page.getByTitle(/Number Forms/, { exact: false }).click()
  const dialog = page.getByRole('dialog', { name: /Number Forms/ })
  await expect(dialog).toBeVisible()
  return dialog
}

test('dialog fits within the viewport', async ({ page }) => {
  const dialog = await openNumberForms(page)
  const box = await dialog.boundingBox()
  expect(box).not.toBeNull()
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const b = box!
  expect(b.x).toBeGreaterThanOrEqual(0)
  expect(b.y).toBeGreaterThanOrEqual(0)
  expect(b.x + b.width).toBeLessThanOrEqual(375)
  expect(b.y + b.height).toBeLessThanOrEqual(667)
})

test('all four forms are shown as stacked sections (no tab row)', async ({ page }) => {
  const dialog = await openNumberForms(page)
  await expect(dialog.getByRole('tablist')).toHaveCount(0)
  for (const name of ['Word Form', 'Unit Form', 'Expanded Form', 'Standard Form']) {
    const heading = dialog.getByRole('heading', { name })
    await heading.scrollIntoViewIfNeeded()
    await expect(heading).toBeVisible()
  }
  // Spot-check that each section renders its form content.
  await expect(dialog.getByText('one thousand two hundred thirty-four')).toBeVisible()
  await expect(dialog.getByText('1,000 + 200 + 30 + 4')).toBeVisible()
})

test('reveal cards toggle is hidden on mobile', async ({ page }) => {
  const dialog = await openNumberForms(page)
  // Owner directive 2026-10-05: the toggle is not offered on mobile.
  await expect(dialog.getByRole('button', { name: /eveal cards/ })).toHaveCount(0)
})

test('no horizontal overflow while the dialog is open', async ({ page }) => {
  await openNumberForms(page)
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  )
  expect(overflow).toBeLessThanOrEqual(1)
})
