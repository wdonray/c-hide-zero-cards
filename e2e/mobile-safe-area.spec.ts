import { test, expect } from '@playwright/test'

/**
 * iOS safe-area support for the mobile chrome.
 *
 * Playwright cannot emulate a real notch / Dynamic Island / home indicator,
 * so env(safe-area-inset-*) resolves to 0px here. These tests verify the
 * mechanism instead of the device behavior:
 *  1. The viewport meta carries viewport-fit=cover (without it, the env()
 *     values stay 0 even on a real iPhone).
 *  2. The safe-area rules are authored on the right elements (class check)
 *     AND actually generated into the shipped CSS (computed-style check —
 *     a missing rule would compute to 0px, not the 6px fallback).
 *  3. The fallbacks resolve correctly with no notch: bar keeps its 6px base
 *     padding, header keeps exactly 56px height — i.e. desktop rendering is
 *     pixel-identical.
 *  4. Nothing overflows horizontally at 375px.
 */
test.use({
  viewport: { width: 375, height: 667 },
  hasTouch: true,
  isMobile: true,
})

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('hzc-has-seen-welcome-dialog', 'true')
    localStorage.setItem('hzc-has-seen-first-time-toast', 'true')
  })
  await page.goto('/')
})

test.describe('mobile safe-area support', () => {
  test('viewport meta enables edge-to-edge rendering', async ({ page }) => {
    const content = await page.getAttribute('meta[name="viewport"]', 'content')
    expect(content).toContain('viewport-fit=cover')
    expect(content).toContain('width=device-width')
  })

  test('bottom action bar pads clear of the home indicator', async ({ page }) => {
    const barInner = page.locator('nav[aria-label="Quick actions"] > div')
    await expect(barInner).toBeVisible()

    // The safe-area rule is authored on the bar…
    await expect(barInner).toHaveClass(/safe-area-inset-bottom/)
    // …and generated into the CSS: with no notch, max(0px, 0.375rem)
    // resolves to the 6px base padding (a missing rule would compute 0px).
    expect(await barInner.evaluate((el) => getComputedStyle(el).paddingBottom)).toBe('6px')
    // Top padding is untouched.
    expect(await barInner.evaluate((el) => getComputedStyle(el).paddingTop)).toBe('6px')
  })

  test('sticky header clears the notch without changing desktop height', async ({ page }) => {
    const header = page.locator('header.sticky').first()
    await expect(header).toBeVisible()

    // The safe-area rule is authored on the header…
    await expect(header).toHaveClass(/safe-area-inset-top/)
    // …and with no notch the fallbacks hold: 0px top padding and exactly
    // the pre-change 56px (h-14) height, so desktop rendering is identical.
    expect(await header.evaluate((el) => getComputedStyle(el).paddingTop)).toBe('0px')
    expect(await header.evaluate((el) => getComputedStyle(el).height)).toBe('56px')
  })

  test('no horizontal overflow at 375px with safe-area rules applied', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(scrollWidth).toBeLessThanOrEqual(375)
  })
})
