import { test, expect, type Page } from '@playwright/test'

/**
 * Card layout follow-up (owner reports 2026-10-05):
 *
 * 1. Typing "940,934" and hiding zeros left the back (higher place-value)
 *    cards too long: their peeks were far wider than one fan offset (a "40"
 *    double peek) and the visible fan sat left of center. The fan now
 *    anchors on evenly spaced left edges with a flush right edge, so every
 *    peek is exactly one offset and the visible fan is centered.
 * 2. When numbers spawn (typing or Roll), the fan must be centered in the
 *    page from the first frame.
 */

async function seed(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('hzc-has-seen-welcome-dialog', 'true')
    localStorage.setItem('hzc-has-seen-first-time-toast', 'true')
  })
  await page.goto('/')
}

function cardBoxes(page: Page) {
  return page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('[role="application"] [tabindex="0"]')) as HTMLElement[]
    return els.map((el) => {
      const r = el.getBoundingClientRect()
      return { text: el.innerText, left: r.x, right: r.x + r.width }
    })
  })
}

test.describe('card layout follow-up', () => {
  for (const vp of [
    { name: 'mobile', width: 375, height: 667, mobile: true },
    { name: 'desktop', width: 1280, height: 800, mobile: false },
  ]) {
    test.describe(vp.name, () => {
      test.use({
        viewport: { width: vp.width, height: vp.height },
        hasTouch: vp.mobile,
        isMobile: vp.mobile,
      })

      test.beforeEach(async ({ page }) => {
        await seed(page)
      })

      test('940,934 with zeros hidden: even peeks, flush right edge, centered fan', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('940934')
        await page.getByTitle('Hide zero cards', { exact: true }).click()
        const cards = await cardBoxes(page)

        // The zero card is gone; the rest compact as if it never existed.
        expect(cards.map((c) => c.text)).toEqual(['900,000', '40,000', '900', '30', '4'])

        // Every peek is exactly one fan offset: no "40" double peek from the
        // wide back cards.
        const lefts = cards.map((c) => c.left)
        const peeks = lefts.slice(1).map((l, i) => l - lefts[i])
        expect(Math.max(...peeks) - Math.min(...peeks)).toBeLessThanOrEqual(2)

        // Right edges flush: no trailing-zero slivers from the back cards.
        const rights = cards.map((c) => c.right)
        expect(Math.max(...rights) - Math.min(...rights)).toBeLessThanOrEqual(2)

        // The visible fan is centered in the page.
        const fanCenter = (Math.min(...lefts) + Math.max(...rights)) / 2
        expect(Math.abs(fanCenter - vp.width / 2)).toBeLessThanOrEqual(3)
      })

      test('spawned fan is centered from the first frame', async ({ page }) => {
        await page.evaluate(() => {
          ;(window as any).__frames = []
          const rec = () => {
            const fan = document.querySelector('[role="application"]')
            if (fan) {
              const r = fan.getBoundingClientRect()
              ;(window as any).__frames.push(r.x + r.width / 2)
            }
            if ((window as any).__frames.length < 10) requestAnimationFrame(rec)
          }
          requestAnimationFrame(rec)
        })
        await page.getByPlaceholder('Type a number here!').fill('940934')
        await page.waitForFunction(() => (window as any).__frames.length >= 3)
        const centers: number[] = await page.evaluate(() => (window as any).__frames)
        expect(centers.length).toBeGreaterThan(0)
        for (const cx of centers) {
          expect(Math.abs(cx - vp.width / 2)).toBeLessThanOrEqual(3)
        }
      })
    })
  }
})
