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

    test('hide-zeros toggle is disabled while cards are mixed (issue #141)', async ({ page }) => {
      await seed(page)
      await page.goto('/')
      await page.getByPlaceholder('Type a number').fill('800502')

      // At fan home the toggle works and is enabled.
      await page.getByRole('button', { name: 'Show zeros' }).click()
      await expect(page.getByRole('button', { name: 'Hide zeros' })).toBeEnabled()

      // Mixed: displacing reveals zeros, so the toggle would be a visual
      // no-op. It is disabled with an explanatory title instead.
      await page.getByRole('button', { name: 'Mix' }).click()
      const scatteredToggle = page.getByTitle('Return cards to the fan to hide zeros')
      await expect(scatteredToggle).toBeDisabled()

      // Reset returns the cards home and the hide-zeros preference
      // auto-restores: the toggle is enabled again, zeros still hidden.
      await page.getByRole('button', { name: 'Reset' }).click()
      await expect(page.getByRole('button', { name: 'Hide zeros' })).toBeEnabled()
    })

    test('show-zeros reveal never flashes cards fully visible first (issue #148)', async ({ page }) => {
      await seed(page)
      await page.goto('/')
      await page.getByPlaceholder('Type a number').fill('800502')

      // Hide zeros first: the zero cards go visibility:hidden.
      await page.getByRole('button', { name: 'Show zeros' }).click()
      const zeroCard = page.locator('[aria-label="00,000 place value card. Use arrow keys to move it."]')
      await expect(zeroCard).toBeHidden()

      // Show zeros again and watch the first frames: the card must never
      // paint fully visible before the reveal animation class is applied.
      // (The old code applied the class in a post-paint effect, so the card
      // flashed visible, then snapped to opacity 0 when the animation
      // started: the double blink.)
      const flashedBeforeAnimation = await page.evaluate(async () => {
        const card = [...document.querySelectorAll('[aria-label*="place value card"]')].find(
          (c) => c.textContent === '00,000'
        ) as HTMLElement | undefined
        if (!card) return 'no-card'
        const btn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('Hide zeros')) as
          HTMLElement | undefined
        if (!btn) return 'no-button'
        let flashed = false
        let animationStarted = false
        btn.click()
        await new Promise<void>((resolve) => {
          const t0 = performance.now()
          function frame() {
            if (card!.className.includes('hzc-zero-show')) animationStarted = true
            if (!animationStarted) {
              const cs = getComputedStyle(card!)
              if (cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.99) flashed = true
            }
            if (performance.now() - t0 < 600) requestAnimationFrame(frame)
            else resolve()
          }
          requestAnimationFrame(frame)
        })
        return flashed ? 'flashed' : 'clean'
      })
      expect(flashedBeforeAnimation).toBe('clean')

      // Mid-stagger the later cards hold the from-keyframe (invisible),
      // not the fully-visible base style. Hide and re-show, then check the
      // tens zero card (index 4, 120ms stagger delay) 60ms into the reveal.
      await page.getByRole('button', { name: 'Show zeros' }).click()
      await expect(zeroCard).toBeHidden()
      await page.getByRole('button', { name: 'Hide zeros' }).click()
      await page.waitForTimeout(60)
      const midStagger = await page.evaluate(() => {
        const card = [...document.querySelectorAll('[aria-label*="place value card"]')].find(
          (c) => c.textContent === '00'
        ) as HTMLElement | undefined
        if (!card) return null
        const cs = getComputedStyle(card)
        return {
          hasClass: card.className.includes('hzc-zero-show'),
          opacity: parseFloat(cs.opacity),
        }
      })
      expect(midStagger).not.toBeNull()
      expect(midStagger!.hasClass).toBe(true)
      expect(midStagger!.opacity).toBe(0)

      // The reveal completes: all zero cards end fully visible.
      await expect(zeroCard).toBeVisible()
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
