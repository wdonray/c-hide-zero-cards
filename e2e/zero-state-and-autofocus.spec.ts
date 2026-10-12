import { test, expect, type Page } from '@playwright/test'

/**
 * Owner directives:
 * - 2026-10-05 (superseded 2026-10-12 for desktop): The Zero toggle state was
 *   glanceable via a tiny status text ("Zeros shown" / "Zeros hidden").
 *   Donray removed the floating desktop text on 2026-10-12; the toggle button
 *   label ("Show zeros"/"Hide zeros") is now the visible indicator. A sr-only
 *   status remains for screen readers.
 * - 2026-10-05: Opening a dialog/sheet moves focus inside it but NOT onto the close
 *   button, so no focus ring flashes on the X. Focus management itself is
 *   preserved (WCAG 2.4.3).
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
      await page.getByPlaceholder('Type a number').fill('1203')

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

    test('status text is removed from desktop (owner directive 2026-10-12)', async ({ page }) => {
      await seed(page)
      await page.goto('/')
      await page.getByPlaceholder('Type a number').fill('1203')

      // The floating "Zeros shown"/"Zeros hidden" text was removed from desktop
      // per owner directive 2026-10-12. The toggle button itself still reflects
      // the state via its label.
      // No visible status element should exist on desktop.
      await expect(page.locator('[role="status"]:not(.sr-only)')).toHaveCount(0)

      // Desktop toolbar button toggles between "Show zeros" and "Hide zeros".
      const zeroButton = page.getByRole('button', { name: 'Show zeros' })
      await zeroButton.click()
      await expect(page.getByRole('button', { name: 'Hide zeros' })).toBeVisible()
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
      await page.getByPlaceholder('Type a number').fill('1203')
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
  })

  test.describe('desktop', () => {
    test.use({ viewport: { width: 1280, height: 800 } })

    test('Number Forms dialog focuses the dialog, not the close button', async ({ page }) => {
      await seed(page)
      await page.goto('/')
      await page.getByPlaceholder('Type a number').fill('1203')
      await page.getByTitle(/Number Forms/, { exact: false }).click()
      await expectFocusOnDialogContent(page, /Number Forms/)
    })

    test("Teacher's Guide dialog focuses the dialog, not the close button", async ({ page }) => {
      await seed(page)
      await page.goto('/')
      await page.getByTitle('Instructional Teachers Guide for Hide Zero Cards').click()
      await expectFocusOnDialogContent(page, "Hide Zero Cards - Teacher's Guide")
    })
  })
})
