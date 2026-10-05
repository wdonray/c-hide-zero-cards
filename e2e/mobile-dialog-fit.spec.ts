import { test, expect, type Page, type Locator } from '@playwright/test'

/**
 * Number Forms dialog fit on narrow viewports (375x667, touch enabled).
 *
 * Regression coverage for the mobile dialog overflow: the tab row used to
 * clip the 4th tab (Standard Form was unreachable), the title wrapped
 * awkwardly, and the content card was a tall empty box. These tests assert
 * the dialog fits the viewport, every tab is reachable, the Reveal-cards
 * toggle still works, and nothing overflows horizontally.
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
  const dialog = page.getByRole('dialog', { name: 'Number Forms & Representations' })
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

test('all four tabs are reachable and selectable', async ({ page }) => {
  const dialog = await openNumberForms(page)
  for (const name of ['Word Form', 'Unit Form', 'Expanded Form', 'Standard Form']) {
    const tab = dialog.getByRole('tab', { name })
    await tab.scrollIntoViewIfNeeded()
    await tab.click()
    await expect(tab).toHaveAttribute('aria-selected', 'true')
  }
  await expect(dialog.getByRole('tabpanel')).toBeVisible()
})

test('reveal cards toggle still works', async ({ page }) => {
  const dialog = await openNumberForms(page)
  await dialog.getByRole('button', { name: 'Reveal cards' }).click()
  await expect(dialog.getByRole('button', { name: 'Hide cards' })).toBeVisible()
  await dialog.getByRole('button', { name: 'Hide cards' }).click()
  await expect(dialog.getByRole('button', { name: 'Reveal cards' })).toBeVisible()
})

test('no horizontal overflow while the dialog is open', async ({ page }) => {
  await openNumberForms(page)
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  )
  expect(overflow).toBeLessThanOrEqual(1)
})
