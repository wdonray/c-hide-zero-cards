import { test, expect } from '@playwright/test'

// Regression test for https://github.com/wdonray/c-hide-zero-cards/issues/154:
// long preset labels ("10,000,000", "100,000,000", "1,000,000,000") overflowed
// their buttons in the 3-column grid, clipping digits ("100,000,00") or
// painting outside the button border. A clipped number is a wrong number,
// so every preset label must fit inside its own button.
test.describe('random number range popover', () => {
  test('preset labels never overflow their buttons', async ({ page }) => {
    await page.goto('/')
    await page.getByTitle('Set random number range', { exact: true }).click()

    const presets = page.locator('button[title^="Set random number range to"]')
    await expect(presets.first()).toBeVisible()

    const measurements = await presets.evaluateAll((els) =>
      els.map((el) => ({
        label: el.textContent?.trim() ?? '',
        clientWidth: el.clientWidth,
        scrollWidth: el.scrollWidth,
      }))
    )
    expect(measurements.length).toBeGreaterThan(0)

    for (const { label, clientWidth, scrollWidth } of measurements) {
      expect(
        scrollWidth,
        `preset "${label}" overflows its button (${scrollWidth}px > ${clientWidth}px)`
      ).toBeLessThanOrEqual(clientWidth)
    }
  })
})
