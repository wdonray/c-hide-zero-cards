import { test, expect, type Page } from '@playwright/test'

/**
 * Two owner directives (2026-10-05):
 * 1. The Zero toggle state is glanceable: a tiny status text ("Zeros shown"
 *    / "Zeros hidden") sits above the mobile action bar and, on desktop,
 *    above the number input at the top of the main content (below the
 *    toolbar's bottom border), updating instantly with the toggle.
 * 2. Opening a dialog/sheet moves focus inside it but NOT onto the close
 *    button, so no focus ring flashes on the X. Focus management itself is
 *    preserved (WCAG 2.4.3).
 */

async function seed(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('hzc-has-seen-welcome-dialog', 'true')
    localStorage.setItem('hzc-has-seen-first-time-toast', 'true')
  })
}

/** Focus landed on the dialog content itself, not the close button. */
async function expectFocusOnDialogContent(page: Page, name: string | RegExp) {
  const dialog = page.getByRole('dialog', { name })
  await expect(dialog).toBeVisible()
  const focus = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    return {
      slot: el?.getAttribute('data-slot'),
      closeFocused: el?.getAttribute('data-slot') === 'dialog-close',
    }
  })
  expect(focus.slot).toBe('dialog-content')
  expect(focus.closeFocused).toBe(false)
}

test.describe('zero toggle status text', () => {
  test.describe('mobile', () => {
    test.use({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true })

    test('status text above the action bar reflects the toggle instantly', async ({ page }) => {
      await seed(page)
      await page.goto('/')
      await page.getByPlaceholder('Type a number here!').fill('1203')

      const status = page.getByRole('status')
      // Exactly one instance: the mobile bar owns it, the main content does not render it.
      await expect(status).toHaveCount(1)
      await expect(status).toHaveText('Zeros shown')

      await page.getByRole('button', { name: 'Hide zero cards' }).click()
      await expect(status).toHaveText('Zeros hidden')

      await page.getByRole('button', { name: 'Show zero cards' }).click()
      await expect(status).toHaveText('Zeros shown')

      // Sits above the bottom action bar.
      const statusBox = await status.boundingBox()
      const navBox = await page.getByRole('navigation', { name: 'Quick actions' }).boundingBox()
      expect(statusBox).not.toBeNull()
      expect(navBox).not.toBeNull()
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(statusBox!.y + statusBox!.height).toBeLessThanOrEqual(navBox!.y + 1)
    })
  })

  test.describe('desktop', () => {
    test.use({ viewport: { width: 1280, height: 800 } })

    test('status text above the number input reflects the toggle instantly', async ({ page }) => {
      await seed(page)
      await page.goto('/')
      await page.getByPlaceholder('Type a number here!').fill('1203')

      const status = page.getByRole('status')
      // Exactly one instance: the main content owns it, the toolbar no longer does.
      await expect(status).toHaveCount(1)
      await expect(status).toHaveText('Zeros shown')

      // Desktop toolbar button is named by its visible "Zero" label.
      const zeroButton = page.getByRole('button', { name: 'Zero', exact: true })
      await zeroButton.click()
      await expect(status).toHaveText('Zeros hidden')

      // Sits below the toolbar's bottom border and above the number input.
      const statusBox = await status.boundingBox()
      const toolbarBox = await page.locator('div.sticky.z-40').boundingBox()
      const inputBox = await page.getByPlaceholder('Type a number here!').boundingBox()
      expect(statusBox).not.toBeNull()
      expect(toolbarBox).not.toBeNull()
      expect(inputBox).not.toBeNull()
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(statusBox!.y).toBeGreaterThanOrEqual(toolbarBox!.y + toolbarBox!.height - 1)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(statusBox!.y + statusBox!.height).toBeLessThanOrEqual(inputBox!.y + 1)
    })
  })
})

test.describe('dialog open autofocus', () => {
  test.describe('mobile', () => {
    test.use({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true })

    test('More sheet focuses the sheet, not the close button', async ({ page }) => {
      await seed(page)
      await page.goto('/')
      await page.getByRole('button', { name: 'More actions' }).click()
      await expectFocusOnDialogContent(page, 'More actions')
    })

    test('Number Forms dialog focuses the dialog, not the close button', async ({ page }) => {
      await seed(page)
      await page.goto('/')
      await page.getByPlaceholder('Type a number here!').fill('1203')
      await page.getByTitle(/Number Forms/, { exact: false }).click()
      await expectFocusOnDialogContent(page, /Number Forms/)
    })

    test("Teacher's Guide dialog focuses the dialog, not the close button", async ({ page }) => {
      await seed(page)
      await page.goto('/')
      await page.getByRole('button', { name: 'More actions' }).click()
      await page.getByTitle('Instructional Teachers Guide for Hide Zero Cards').click()
      await expectFocusOnDialogContent(page, "Hide Zero Cards - Teacher's Guide")
    })

    test('Welcome dialog focuses the dialog, not the close button', async ({ page }) => {
      // No welcome-dialog seed: it shows on first visit.
      await page.addInitScript(() => {
        localStorage.setItem('hzc-has-seen-first-time-toast', 'true')
      })
      await page.goto('/')
      await expectFocusOnDialogContent(page, /Welcome to Hide Zero Cards/)
    })
  })

  test.describe('desktop', () => {
    test.use({ viewport: { width: 1280, height: 800 } })

    test('Number Forms dialog focuses the dialog, not the close button', async ({ page }) => {
      await seed(page)
      await page.goto('/')
      await page.getByPlaceholder('Type a number here!').fill('1203')
      await page.getByTitle(/Number Forms/, { exact: false }).click()
      await expectFocusOnDialogContent(page, /Number Forms/)
    })

    test("Teacher's Guide dialog focuses the dialog, not the close button", async ({ page }) => {
      await seed(page)
      await page.goto('/')
      await page.getByTitle('Instructional Teachers Guide for Hide Zero Cards').click()
      await expectFocusOnDialogContent(page, "Hide Zero Cards - Teacher's Guide")
    })

    test('Welcome dialog focuses the dialog, not the close button', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('hzc-has-seen-first-time-toast', 'true')
      })
      await page.goto('/')
      await expectFocusOnDialogContent(page, /Welcome to Hide Zero Cards/)
    })
  })
})
