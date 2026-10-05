import { test, expect, type Page } from '@playwright/test'

/**
 * Card fan with wide significant-prefix peeks (owner feedback 2026-10-05,
 * supersedes the single-digit-peek direction):
 *
 * Hiding zeros on 800,502 collapsed the fan to "852" (single-digit peeks),
 * which reads as the wrong number and destroys place-value meaning — and
 * the thousands comma never appeared. Each card's peek now fits its
 * significant prefix ("800,000" -> "800,", "500" -> "500"), so the fan
 * reads "800," / "500" / "2" with the comma visible.
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

/**
 * For each card except the last: the significant prefix (up to and
 * including the first comma, else the full text) must match the expected
 * text, and the prefix must be fully visible — its rendered right edge sits
 * at or left of the covering card's left edge. The last card has no peek
 * (it shows its full natural width), so expectedPeeks has one entry per
 * card except the last.
 */
async function expectSignificantPrefixes(page: Page, expectedPeeks: string[]) {
  const result = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('[role="application"] [tabindex="0"]')) as HTMLElement[]
    return els.slice(0, -1).map((el, i) => {
      const fullText = el.innerText
      const commaIndex = fullText.indexOf(',')
      const peekText = commaIndex === -1 ? fullText : fullText.slice(0, commaIndex + 1)
      // Rendered rect of the significant prefix within the visible text.
      const inner = el.firstElementChild as HTMLElement
      const textNode = inner.firstChild as Text
      const range = document.createRange()
      range.setStart(textNode, 0)
      range.setEnd(textNode, Math.min(peekText.length, textNode.length))
      const pr = range.getBoundingClientRect()
      const style = getComputedStyle(el)
      const letterSpacing = parseFloat(style.letterSpacing) || 0
      const nextLeft = els[i + 1].getBoundingClientRect().x
      return {
        peekText,
        // Exclude trailing letter-spacing: the prefix ink ends where its
        // advance box ends minus the spacing after it.
        prefixRight: pr.x + pr.width - letterSpacing,
        nextLeft,
      }
    })
  })
  expect(result.map((r) => r.peekText)).toEqual(expectedPeeks)
  for (const r of result) {
    // The significant prefix is fully visible, not clipped by the next card.
    expect(r.prefixRight).toBeLessThanOrEqual(r.nextLeft + 1)
  }
}

test.describe('card fan wide peeks', () => {
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

      test('800,502 hidden reads "800," / "500" / "2", never "852"', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('800502')
        await page.getByTitle('Hide zero cards', { exact: true }).click()
        const cards = await cardBoxes(page)

        // The zero cards are gone; the rest keep their place values.
        expect(cards.map((c) => c.text)).toEqual(['800,000', '500', '2'])

        // Each peek shows its significant prefix, comma included — the fan
        // reads "800," / "500" / "2", not "852".
        await expectSignificantPrefixes(page, ['800,', '500'])

        // Right edges flush: no trailing-zero slivers from the back cards.
        const rights = cards.map((c) => c.right)
        expect(Math.max(...rights) - Math.min(...rights)).toBeLessThanOrEqual(2)

        // The visible fan is centered in the page.
        const lefts = cards.map((c) => c.left)
        const fanCenter = (Math.min(...lefts) + Math.max(...rights)) / 2
        expect(Math.abs(fanCenter - vp.width / 2)).toBeLessThanOrEqual(3)
      })

      test('800,502 shown keeps the thousands comma visible in the "800," peek', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('800502')
        const cards = await cardBoxes(page)
        expect(cards.map((c) => c.text)).toEqual(['800,000', '00,000', '0,000', '500', '00', '2'])
        // Significant prefixes: commas stay visible ("800,", "00,", "0,").
        await expectSignificantPrefixes(page, ['800,', '00,', '0,', '500', '00'])
      })

      test('940,934 hidden shows readable place values', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('940934')
        await page.getByTitle('Hide zero cards', { exact: true }).click()
        const cards = await cardBoxes(page)
        expect(cards.map((c) => c.text)).toEqual(['900,000', '40,000', '900', '30', '4'])
        // No "40" double peek confusion: each card's significant prefix is
        // fully readable ("900,", "40,", "900", "30").
        await expectSignificantPrefixes(page, ['900,', '40,', '900', '30'])
      })

      test('172,695 shows readable place values', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('172695')
        const cards = await cardBoxes(page)
        expect(cards.map((c) => c.text)).toEqual(['100,000', '70,000', '2,000', '600', '90', '5'])
        await expectSignificantPrefixes(page, ['100,', '70,', '2,', '600', '90'])
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

      test('a displaced card shows its full place-value text unclipped', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('763285')
        const first = page
          .getByRole('application', { name: 'Draggable place value cards' })
          .locator(':scope > div')
          .first()
        // Keyboard-displace the card: it must shrink-wrap its full text
        // (no assigned fan width, no overflow clipping) so "700,000" reads
        // in full.
        await first.focus()
        await page.keyboard.press('ArrowRight')
        await page.keyboard.press('ArrowRight')
        const diff = await first.evaluate((el: HTMLElement) => {
          const r = el.getBoundingClientRect()
          const inner = el.firstElementChild as HTMLElement
          const style = getComputedStyle(el)
          const ir = inner.getBoundingClientRect()
          return {
            widthDiff: r.width - (inner.scrollWidth + parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)),
            textClipped: ir.right > r.right + 1,
          }
        })
        expect(Math.abs(diff.widthDiff)).toBeLessThanOrEqual(2)
        expect(diff.textClipped).toBe(false)
      })
    })
  }
})
