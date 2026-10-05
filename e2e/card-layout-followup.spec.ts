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

      test('every peek shows its leading digit and the top card is natural width', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('763285')
        const probes = await page.evaluate(() => {
          const els = Array.from(document.querySelectorAll('[role="application"] [tabindex="0"]')) as HTMLElement[]
          return els.map((el) => {
            const r = el.getBoundingClientRect()
            const inner = el.firstElementChild as HTMLElement
            const ir = inner.getBoundingClientRect()
            const style = getComputedStyle(el)
            const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
            return {
              text: el.innerText,
              cardWidth: r.width,
              // How far the text's left edge sits past the card's left
              // padding: ~0 when left-aligned, large when centered in a
              // widened card (the buried-digit regression).
              textPastPad: ir.x - r.x - parseFloat(style.paddingLeft),
              natural: inner.scrollWidth + padX,
            }
          })
        })
        expect(probes.map((p) => p.text)).toEqual(['700,000', '60,000', '3,000', '200', '80', '5'])
        // Every leading digit sits at the left padding: no blank slivers,
        // no digits buried under the next card.
        for (const p of probes) {
          expect(Math.abs(p.textPastPad)).toBeLessThanOrEqual(2)
        }
        // The top card keeps its natural width: no giant block with a
        // lonely centered digit.
        const top = probes[probes.length - 1]
        expect(Math.abs(top.cardWidth - top.natural)).toBeLessThanOrEqual(2)
      })

      test('every peek fits its leading digit with room to spare', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('172695')
        // For each card but the last: the leading digit's glyph right edge
        // must sit at or left of the covering card's left edge (the peek
        // fits padLeft + one full digit advance). The last card is on top,
        // so it is fully visible by construction.
        const clips = await page.evaluate(() => {
          const els = Array.from(document.querySelectorAll('[role="application"] [tabindex="0"]')) as HTMLElement[]
          const cards = els.map((el) => {
            const r = el.getBoundingClientRect()
            const inner = el.firstElementChild as HTMLElement
            const textNode = inner.firstChild as Text
            const range = document.createRange()
            range.setStart(textNode, 0)
            range.setEnd(textNode, 1)
            const cr = range.getBoundingClientRect()
            const style = getComputedStyle(el)
            const letterSpacing = parseFloat(style.letterSpacing) || 0
            // Exclude trailing letter-spacing: the digit's ink ends where
            // its advance box ends minus the spacing after it.
            return { left: r.x, glyphRight: cr.x + cr.width - letterSpacing }
          })
          return cards.slice(0, -1).map((c, i) => c.glyphRight - cards[i + 1].left)
        })
        expect(clips.length).toBeGreaterThan(0)
        for (const clip of clips) {
          expect(clip).toBeLessThanOrEqual(1)
        }
      })

      test('a displaced card shows its full place-value text unclipped', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('763285')
        const first = page
          .getByRole('application', { name: 'Draggable place value cards' })
          .locator(':scope > div')
          .first()
        // Outer width minus natural text width: negative at fan home (the
        // wide back card is clipped to its assigned width), ~0 displaced.
        const widthDiff = () =>
          first.evaluate((el: HTMLElement) => {
            const r = el.getBoundingClientRect()
            const inner = el.firstElementChild as HTMLElement
            const style = getComputedStyle(el)
            return r.width - (inner.scrollWidth + parseFloat(style.paddingLeft) + parseFloat(style.paddingRight))
          })
        expect(await widthDiff()).toBeLessThan(0)
        // Keyboard-displace the card: the full text must show, unclipped.
        await first.focus()
        await page.keyboard.press('ArrowRight')
        await page.keyboard.press('ArrowRight')
        expect(Math.abs(await widthDiff())).toBeLessThanOrEqual(2)
      })
    })
  }
})
