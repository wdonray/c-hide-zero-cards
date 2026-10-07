import { test, expect } from '@playwright/test'

/**
 * Regression test for the fan measurement timing bug (2026-10-07).
 *
 * Owner report: for 8,726 on load, the fan renders CRAMPED (cards overlap too
 * much). After a slight drag, cards snap to correct spacing.
 *
 * Root cause: the peek-width Range measurement can run before webfonts finish
 * loading (or before layout updates with the new font), producing too-narrow
 * widths. The `document.fonts.ready` re-measurement fired, but the layout
 * effect re-ran before the browser applied the new font to layout, measuring
 * stale fallback metrics again.
 *
 * Fix: wrap the fonts.ready bump in requestAnimationFrame so re-measurement
 * runs after layout updates with the new font.
 *
 * Test: delay webfont loading, fill the number immediately (like auto-roll),
 * then verify the fan positions match the correct (font-loaded) layout WITHOUT
 * any drag. Uses two browser contexts: one with fast fonts (baseline), one
 * with delayed fonts (test). If self-correction fails, positions stay cramped.
 */
test.describe('fan measurement on load', () => {
  const getFanX = (page: import('@playwright/test').Page) =>
    page.evaluate(() => {
      const fan = document.querySelector('[role="application"][aria-label="Draggable place value cards"]')
      if (!fan) return []
      return [...fan.children].map((el) => {
        const m = (el as HTMLElement).style.transform.match(/translate\(([-\d.]+)px/)
        return m ? parseFloat(m[1]) : NaN
      })
    })

  test('fan positions are correct on load without drag, even with slow fonts', async ({ browser }) => {
    // Baseline: fonts available immediately.
    const ctx1 = await browser.newContext({ viewport: { width: 375, height: 812 } })
    const page1 = await ctx1.newPage()
    await page1.addInitScript(() => {
      localStorage.setItem('hzc-has-seen-welcome-dialog', 'true')
      localStorage.setItem('hzc-has-seen-first-time-toast', 'true')
    })
    await page1.goto('/')
    await page1.evaluate(() => document.fonts.ready)
    await page1.waitForTimeout(1000)
    await page1.getByPlaceholder('Type a number here!').fill('8726')
    await page1.waitForTimeout(1500)
    const baseline = await getFanX(page1)
    expect(baseline.length).toBe(4)
    await ctx1.close()

    // Test: delay fonts by 3s, fill immediately (like auto-roll on mount).
    const ctx2 = await browser.newContext({ viewport: { width: 375, height: 812 } })
    const page2 = await ctx2.newPage()
    await page2.addInitScript(() => {
      localStorage.setItem('hzc-has-seen-welcome-dialog', 'true')
      localStorage.setItem('hzc-has-seen-first-time-toast', 'true')
    })
    await page2.route('**/*.woff2', async (route) => {
      await new Promise((r) => setTimeout(r, 3000))
      await route.continue()
    })
    await page2.goto('/')
    // Fill before fonts load (auto-roll behavior).
    await page2.waitForTimeout(500)
    await page2.getByPlaceholder('Type a number here!').fill('8726')
    // Wait for fonts + re-measurement to settle. NO drag.
    await page2.evaluate(() => document.fonts.ready)
    await page2.waitForTimeout(2500)
    const actual = await getFanX(page2)

    // Positions must match the baseline (correct) layout.
    // On buggy code, they remain at fallback-font (cramped) values.
    for (let i = 0; i < 4; i++) {
      expect(
        Math.abs(actual[i] - baseline[i]),
        `Card ${i}: fanX ${actual[i]} != baseline ${baseline[i]}. ` +
          `Fan did not self-correct after fonts loaded without drag.`
      ).toBeLessThan(2)
    }
    await ctx2.close()
  })
})
