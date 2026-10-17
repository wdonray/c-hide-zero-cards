import { test, expect } from '@playwright/test'

// Regression test for https://github.com/wdonray/c-hide-zero-cards/issues/156:
// the #154 fix split the presets into a 3-column grid for short labels plus a
// 2-column grid for long labels (longest spanning both columns), producing
// uneven 3-3-2-1 rows with mixed button sizes. The preset grid must be
// uniform: one grid, every button the same size, every row looking the same.
test.describe('random number range popover', () => {
  test('preset buttons form a uniform grid', async ({ page }) => {
    await page.goto('/')
    await page.getByTitle('Set random number range', { exact: true }).click()

    const presets = page.locator('button[title^="Set random number range to"]')
    await expect(presets.first()).toBeVisible()

    const boxes = await presets.evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect()
        return { width: Math.round(r.width), height: Math.round(r.height), top: Math.round(r.top) }
      })
    )
    expect(boxes.length).toBeGreaterThan(0)

    const widths = [...new Set(boxes.map((b) => b.width))]
    expect(widths, `preset buttons have uneven widths: ${widths.join(', ')}`).toHaveLength(1)

    const heights = [...new Set(boxes.map((b) => b.height))]
    expect(heights, `preset buttons have uneven heights: ${heights.join(', ')}`).toHaveLength(1)

    // single column: every preset sits on its own row
    const tops = new Set(boxes.map((b) => b.top))
    expect(tops.size, 'presets are not in a single column').toBe(boxes.length)
  })
})
