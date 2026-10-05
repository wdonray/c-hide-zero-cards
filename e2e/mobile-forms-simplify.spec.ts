import { test, expect, type Page, type Locator } from '@playwright/test'

/**
 * Number Forms dialog mobile simplification (owner directive 2026-10-05):
 * on mobile (<768px) the dialog header drops the Reveal-cards toggle, the
 * Layers icon, and the subheader text, and the title gets breathing room.
 * The stacked form sections are unchanged. Desktop keeps everything.
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
  const dialog = page.getByRole('dialog', { name: 'Number Forms & Representations' })
  await expect(dialog).toBeVisible()
  return dialog
}

test.describe('mobile header simplification', () => {
  test.use({
    viewport: { width: 375, height: 667 },
    hasTouch: true,
    isMobile: true,
  })

  test.beforeEach(async ({ page }) => {
    await seedAndGoto(page)
  })

  test('reveal cards toggle is hidden', async ({ page }) => {
    const dialog = await openNumberForms(page)
    await expect(dialog.getByRole('button', { name: /eveal cards/ })).toHaveCount(0)
  })

  test('header icon is hidden', async ({ page }) => {
    const dialog = await openNumberForms(page)
    const title = dialog.getByRole('heading', { name: 'Number Forms & Representations' })
    // Still in the DOM (desktop keeps it), but not rendered on mobile.
    await expect(title.locator('svg')).toBeHidden()
  })

  test('subheader text is hidden', async ({ page }) => {
    const dialog = await openNumberForms(page)
    await expect(dialog.getByText('Explore different ways to write and understand your number!')).toBeHidden()
  })

  test('title is visible, clear of the close button, and padded from the edge', async ({ page }) => {
    const dialog = await openNumberForms(page)
    const title = dialog.getByRole('heading', { name: 'Number Forms & Representations' })
    await expect(title).toBeVisible()

    // Measure the text span, not the heading box: the heading reserves
    // padding-right for the X button, which is not the text touching it.
    const textBox = await title.locator('span').boundingBox()
    const closeBox = await dialog.getByRole('button', { name: 'Close' }).boundingBox()
    const dialogBox = await dialog.boundingBox()
    expect(textBox).not.toBeNull()
    expect(closeBox).not.toBeNull()
    expect(dialogBox).not.toBeNull()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const t = textBox!,
      c = closeBox!,
      d = dialogBox!
    // No overlap between the title text and the X button.
    const overlaps = t.x < c.x + c.width && t.x + t.width > c.x && t.y < c.y + c.height && t.y + t.height > c.y
    expect(overlaps).toBe(false)
    // Breathing room: title text keeps clear of the dialog's left edge and the X.
    expect(t.x - d.x).toBeGreaterThanOrEqual(16)
    expect(c.x - (t.x + t.width)).toBeGreaterThanOrEqual(8)
  })

  test('stacked form sections are unchanged', async ({ page }) => {
    const dialog = await openNumberForms(page)
    const headings = dialog.getByRole('heading', { level: 3 })
    await expect(headings).toHaveText(['Word Form', 'Unit Form', 'Expanded Form', 'Standard Form'])
    await expect(dialog.getByText('one thousand two hundred thirty-four')).toBeVisible()
  })
})

test.describe('desktop header unchanged', () => {
  test.use({
    viewport: { width: 1280, height: 800 },
  })

  test.beforeEach(async ({ page }) => {
    await seedAndGoto(page)
  })

  test('reveal toggle, icon, and subheader all still present', async ({ page }) => {
    const dialog = await openNumberForms(page)
    await expect(dialog.getByRole('button', { name: 'Reveal cards' })).toBeVisible()

    const title = dialog.getByRole('heading', { name: 'Number Forms & Representations' })
    await expect(title.locator('svg')).toHaveCount(1)

    await expect(dialog.getByText('Explore different ways to write and understand your number!')).toBeVisible()
  })

  test('reveal toggle still works on desktop', async ({ page }) => {
    const dialog = await openNumberForms(page)
    await dialog.getByRole('button', { name: 'Reveal cards' }).click()
    await expect(dialog.getByRole('button', { name: 'Hide cards' })).toBeVisible()
    await dialog.getByRole('button', { name: 'Hide cards' }).click()
    await expect(dialog.getByRole('button', { name: 'Reveal cards' })).toBeVisible()
  })
})
