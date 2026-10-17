import { test, expect, type Page } from '@playwright/test'

/**
 * Issue #152: pressing the desktop toolbar's "Show zeros"/"Hide zeros" toggle
 * changed the button's width (the two labels are different widths in Baloo),
 * so the whole centered toolbar reflowed. The button must keep one constant
 * width across toggles.
 */

async function seed(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('hzc-has-seen-welcome-dialog', 'true')
    localStorage.setItem('hzc-has-seen-first-time-toast', 'true')
  })
}

test.describe('zero toggle button width (issue #152)', () => {
  test('toggling Show zeros / Hide zeros keeps the button width constant', async ({ page }) => {
    await seed(page)
    await page.goto('/')
    await page.getByPlaceholder('Type a number').fill('2040')

    const showButton = page.getByRole('button', { name: 'Show zeros' })
    const before = await showButton.boundingBox()
    expect(before).not.toBeNull()

    await showButton.click()

    const hideButton = page.getByRole('button', { name: 'Hide zeros' })
    const after = await hideButton.boundingBox()
    expect(after).not.toBeNull()
    expect(after!.width).toBe(before!.width)

    // Toggling back must be stable too.
    await hideButton.click()
    const back = await page.getByRole('button', { name: 'Show zeros' }).boundingBox()
    expect(back).not.toBeNull()
    expect(back!.width).toBe(before!.width)
  })
})
