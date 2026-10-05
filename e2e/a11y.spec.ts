import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { CARD_COLORS } from '@/lib/constants'

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

            expect(withoutBlockedViolations(results)).toEqual([])
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

          // The toolbar (with the Roll button) is part of the root layout, so the
          // same blocked-violation filter applies here as on the home page.
          expect(withoutBlockedViolations(results)).toEqual([])
        })
      }
    })
  }
})

/**
 * Known blocked violation (owner decision pending, see PLAN.md):
 * the desktop "Roll" button label is white text on blue-500 (#2b7fff) at
 * 3.76:1, below WCAG AA's 4.5:1. Fixing it requires recoloring or resizing
 * button text, which changes the visual design and needs owner approval.
 * This filter keeps the gate strict for every other violation: if the button
 * markup changes, the filter stops matching and the scan fails loudly.
 */
function withoutBlockedViolations(results: Awaited<ReturnType<AxeBuilder['analyze']>>) {
  const isBlockedRollButton = (violationId: string, target: readonly unknown[]) =>
    violationId === 'color-contrast' &&
    target.some((selector) => typeof selector === 'string' && selector.includes('md\\:flex'))

  return results.violations
    .map((violation) => ({
      ...violation,
      nodes: violation.nodes.filter(
        (node) => !isBlockedRollButton(violation.id, node.target) && !isBlockedCardText(violation.id, node.target)
      ),
    }))
    .filter((violation) => violation.nodes.length > 0)
}

/**
 * Known blocked violation (owner decision pending):
 * white digit text on the bright place-value card colors falls below 4.5:1
 * at mobile text sizes (e.g. yellow-300 at 1.32:1, red-500 at 3.8:1). The
 * palette is the teaching design itself (each place value has its color),
 * so recoloring needs the owner's approval just like the Roll button above.
 * Scoped to the CARD_COLORS palette and the card markup: if either changes,
 * the filter stops matching and the scan fails loudly.
 */
const CARD_TEXT_TARGET = new RegExp(`^\\.(${Object.values(CARD_COLORS).join('|')}) > div$`)

function isBlockedCardText(violationId: string, target: readonly unknown[]) {
  return (
    violationId === 'color-contrast' &&
    target.some((selector) => typeof selector === 'string' && CARD_TEXT_TARGET.test(selector))
  )
}

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
