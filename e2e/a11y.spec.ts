import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Automated WCAG 2.2 AA scan of the app, powered by axe-core
 * (the same engine behind Lighthouse accessibility audits).
 * Catches: missing labels, contrast failures, landmark/heading issues,
 * keyboard/focus problems, ARIA misuse, and more.
 *
 * The app is scanned in both light and dark mode, since color
 * contrast is theme-dependent, and both with and without cards
 * on screen, since the cards are the core interactive surface.
 */
test.describe('accessibility', () => {
  for (const viewport of [
    { name: 'desktop', use: {} },
    // The scan also runs at a phone viewport: the responsive rules must not
    // introduce new violations (and must not resurrect the removed mobile
    // warning dialog).
    { name: 'mobile', use: { viewport: { width: 375, height: 667 } } },
  ] as const) {
    test.describe(`viewport: ${viewport.name}`, () => {
      test.use(viewport.use)

      for (const theme of ['light', 'dark'] as const) {
        for (const withCards of [false, true]) {
          test(`home page ${withCards ? 'with cards' : 'empty'} has no WCAG 2.2 AA violations in ${theme} mode`, async ({
            page,
          }) => {
            // Suppress the welcome dialog; scan the main app surface.
            await page.addInitScript(() => {
              localStorage.setItem('hzc-has-seen-welcome-dialog', 'true')
            })
            await page.goto('/')

            if (withCards) {
              await page.getByPlaceholder('Type a number here!').fill('1234')
              await expect(
                page.getByRole('application', { name: 'Draggable place value cards' }).locator(':scope > div')
              ).toHaveCount(4)
            }

            // Let entrance animations settle so contrast is measured on the final state.
            await page.waitForTimeout(1000)

            if (theme === 'dark') {
              await page.getByTitle('Toggle light/dark mode', { exact: true }).click()
              await page.getByRole('menuitem', { name: 'Dark' }).click()
              await expect(page.getByRole('menu')).toBeHidden()
            }

            const results = await new AxeBuilder({ page })
              .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
              .analyze()

            // No filters: the full WCAG 2.2 AA gate applies, including the
            // place-value card palette and the Roll button (both recolored to
            // pass 4.5:1, owner decision 2026-10-05).
            expect(results.violations).toEqual([])
          })
        }
      }

      for (const theme of ['light', 'dark'] as const) {
        test(`version page has no WCAG 2.2 AA violations in ${theme} mode`, async ({ page }) => {
          // Suppress the welcome dialog; scan the version page surface.
          await page.addInitScript(() => {
            localStorage.setItem('hzc-has-seen-welcome-dialog', 'true')
          })
          // Mock the releases API for a deterministic scan of the list UI.
          await page.route(
            (url) => url.href.startsWith('https://api.github.com/repos/wdonray/c-hide-zero-cards/releases'),
            (route) =>
              route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                  {
                    tag_name: 'v0.19.11',
                    html_url: 'https://github.com/wdonray/c-hide-zero-cards/releases/tag/v0.19.11',
                    published_at: '2026-10-03T11:00:00Z',
                    body: '### Tests\n\n  - Some change (abc1234)\n',
                  },
                ]),
              })
          )
          await page.goto('/version')
          await expect(page.getByRole('heading', { name: 'Version' })).toBeVisible()

          if (theme === 'dark') {
            await page.getByTitle('Toggle light/dark mode', { exact: true }).click()
            await page.getByRole('menuitem', { name: 'Dark' }).click()
            await expect(page.getByRole('menu')).toBeHidden()
          }

          const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze()

          // Same unfiltered gate as the home page scan above.
          expect(results.violations).toEqual([])
        })
      }
    })
  }
})

test.describe('keyboard operability', () => {
  test('cards can be moved with arrow keys', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('hzc-has-seen-welcome-dialog', 'true')
    })
    await page.goto('/')
    await page.getByPlaceholder('Type a number here!').fill('1234')

    const cards = page.getByRole('application', { name: 'Draggable place value cards' })
    const firstCard = cards.locator(':scope > div').first()
    await expect(firstCard).toBeVisible()
    await expect(firstCard).toHaveAttribute('aria-label', /place value card\. Use arrow keys to move it\./)

    await firstCard.focus()
    await page.keyboard.press('ArrowRight')

    await expect(firstCard).toHaveJSProperty('style.transform', 'translate(10px, 0px)')
  })
})
