import { test, expect, type Page, type Locator } from '@playwright/test'

/**
 * Dialog/sheet close (X) button rendering (owner directive 2026-10-05):
 * the X glyph must be centered in its button and the focus ring must match
 * the button's circular shape on every dialog, mobile and desktop.
 * Covers the shared DialogContent close button (Number Forms, Teacher's
 * Guide, Welcome) and the More sheet's custom close button.
 */

const CENTER_TOLERANCE_PX = 3

async function expectXCentered(dialog: Locator) {
  const close = dialog.getByRole('button', { name: 'Close' })
  await expect(close).toBeVisible()

  const buttonBox = await close.boundingBox()
  const iconBox = await close.locator('svg').boundingBox()
  expect(buttonBox).not.toBeNull()
  expect(iconBox).not.toBeNull()
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const b = buttonBox!
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const i = iconBox!
  const dx = Math.abs(b.x + b.width / 2 - (i.x + i.width / 2))
  const dy = Math.abs(b.y + b.height / 2 - (i.y + i.height / 2))
  expect(dx).toBeLessThanOrEqual(CENTER_TOLERANCE_PX)
  expect(dy).toBeLessThanOrEqual(CENTER_TOLERANCE_PX)
}

async function expectClosesDialog(page: Page, dialog: Locator) {
  await dialog.getByRole('button', { name: 'Close' }).click()
  await expect(dialog).not.toBeVisible()
}

async function seedAll(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('hzc-has-seen-welcome-dialog', 'true')
    localStorage.setItem('hzc-has-seen-first-time-toast', 'true')
  })
}

async function gotoReady(page: Page, url: string) {
  await page.goto(url)
  // Freeze open/close animations so bounding-box measurements are not taken
  // mid-animation (the dialog zooms in on open; two measurements on either
  // side of an animation frame would disagree by a few px).
  await page.addStyleTag({
    content: '*{animation-duration:0.01ms!important;transition-duration:0.01ms!important}',
  })
}

async function seedToastOnly(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('hzc-has-seen-first-time-toast', 'true')
  })
}

async function openMoreSheet(page: Page): Promise<Locator> {
  await page.getByRole('button', { name: 'More actions' }).click()
  const sheet = page.getByRole('dialog', { name: 'More actions' })
  await expect(sheet).toBeVisible()
  return sheet
}

async function openNumberForms(page: Page): Promise<Locator> {
  await page.getByPlaceholder('Type a number here!').fill('1234')
  await page.getByTitle(/Number Forms/, { exact: false }).click()
  const dialog = page.getByRole('dialog', { name: /Number Forms/ })
  await expect(dialog).toBeVisible()
  return dialog
}

test.describe('close buttons on mobile', () => {
  test.use({
    viewport: { width: 375, height: 667 },
    hasTouch: true,
    isMobile: true,
  })

  test.beforeEach(async ({ page }) => {
    await seedAll(page)
    await gotoReady(page, '/')
  })

  test('More sheet: X is centered and closes the sheet', async ({ page }) => {
    const sheet = await openMoreSheet(page)
    await expectXCentered(sheet)
    await expectClosesDialog(page, sheet)
  })

  test('Number Forms dialog: X is centered and closes the dialog', async ({ page }) => {
    const dialog = await openNumberForms(page)
    await expectXCentered(dialog)
    await expectClosesDialog(page, dialog)
  })

  test("Teacher's Guide dialog: X is centered and closes the dialog", async ({ page }) => {
    const sheet = await openMoreSheet(page)
    await sheet.getByTitle('Instructional Teachers Guide for Hide Zero Cards').click()
    const dialog = page.getByRole('dialog', { name: "Hide Zero Cards - Teacher's Guide" })
    await expect(dialog).toBeVisible()
    await expectXCentered(dialog)
    await expectClosesDialog(page, dialog)
  })
})

test.describe('close buttons on desktop', () => {
  test.use({
    viewport: { width: 1280, height: 800 },
  })

  test.beforeEach(async ({ page }) => {
    await seedAll(page)
    await gotoReady(page, '/')
  })

  test('Number Forms dialog: X is centered and closes the dialog', async ({ page }) => {
    const dialog = await openNumberForms(page)
    await expectXCentered(dialog)
    await expectClosesDialog(page, dialog)
  })

  test("Teacher's Guide dialog: X is centered and closes the dialog", async ({ page }) => {
    await page.getByRole('button', { name: 'How to Use' }).click()
    const dialog = page.getByRole('dialog', { name: "Hide Zero Cards - Teacher's Guide" })
    await expect(dialog).toBeVisible()
    await expectXCentered(dialog)
    await expectClosesDialog(page, dialog)
  })
})

test.describe('welcome dialog close button on mobile', () => {
  test.use({
    viewport: { width: 375, height: 667 },
    hasTouch: true,
    isMobile: true,
  })

  test.beforeEach(async ({ page }) => {
    // Leave hzc-has-seen-welcome-dialog unset so the dialog appears.
    await seedToastOnly(page)
    await gotoReady(page, '/')
  })

  test('X is centered and closes the dialog', async ({ page }) => {
    const dialog = page.getByRole('dialog', { name: 'Welcome to Hide Zero Cards!' })
    await expect(dialog).toBeVisible()
    await expectXCentered(dialog)
    await expectClosesDialog(page, dialog)
  })
})

test.describe('welcome dialog close button on desktop', () => {
  test.use({
    viewport: { width: 1280, height: 800 },
  })

  test.beforeEach(async ({ page }) => {
    await seedToastOnly(page)
    await gotoReady(page, '/')
  })

  test('X is centered and closes the dialog', async ({ page }) => {
    const dialog = page.getByRole('dialog', { name: 'Welcome to Hide Zero Cards!' })
    await expect(dialog).toBeVisible()
    await expectXCentered(dialog)
    await expectClosesDialog(page, dialog)
  })
})
