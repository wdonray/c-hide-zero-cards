import { test, expect, type Page } from '@playwright/test'

/**
 * Card fan: full values always, no peeks (owner decision 2026-10-06,
 * superseding the single-digit-peek design). Every place-value card always
 * shows its complete value ("100,000", "80,000", "0,000", "700", "30",
 * "6"); a zero card shows the place value with a leading zero, parallel
 * to its siblings. The fan is a sequential strip of full-width cards.
 * Hiding zeros never removes cards: the whole zero card goes
 * visibility:hidden + aria-hidden (a blank colored card would give away
 * which cards are zero). Place-value positions are preserved: hidden
 * 800,502 reads "800,000",<gap>,<gap>,"500",<gap>,"2", never "852".
 */

async function seed(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('hzc-has-seen-welcome-dialog', 'true')
    localStorage.setItem('hzc-has-seen-first-time-toast', 'true')
  })
  await page.goto('/')
}

interface FanCard {
  text: string
  left: number
  right: number
}

/** All fan cards in DOM order. Uses textContent so hidden cards still
 * report their real text (needed for measurement); visibility is asserted
 * separately. */
async function fanCards(page: Page): Promise<FanCard[]> {
  return page.evaluate(() => {
    const fan = document.querySelector('[role="application"]')!
    return Array.from(fan.children).map((el) => {
      const htmlEl = el as HTMLElement
      const r = htmlEl.getBoundingClientRect()
      return {
        text: (htmlEl.textContent ?? '').trim(),
        left: r.x,
        right: r.x + r.width,
      }
    })
  })
}

function expectFanCentered(cards: FanCard[], viewportWidth: number) {
  const fanLeft = Math.min(...cards.map((i) => i.left))
  const fanRight = Math.max(...cards.map((i) => i.right))
  expect(Math.abs((fanLeft + fanRight) / 2 - viewportWidth / 2)).toBeLessThanOrEqual(3)
}

/** Sequential strip: each card starts where the previous card ends (plus
 * a small gap), never overlapping. */
function expectSequentialStrip(cards: FanCard[]) {
  for (let i = 1; i < cards.length; i++) {
    expect(cards[i].left).toBeGreaterThanOrEqual(cards[i - 1].right - 1)
  }
}

test.describe('card fan full values', () => {
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

      test('800,502 shown reads full values: 800,000 / 00,000 / 0,000 / 500 / 00 / 2', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('800502')
        const cards = await fanCards(page)

        // Six cards, each showing its full place value. Zero cards show
        // the place value with a leading zero, parallel to siblings.
        expect(cards.map((i) => i.text)).toEqual(['800,000', '00,000', '0,000', '500', '00', '2'])

        // Sequential strip, centered.
        expectSequentialStrip(cards)
        expectFanCentered(cards, vp.width)
      })

      test('800,502 hidden hides whole zero cards in position, never "852"', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('800502')
        const shown = await fanCards(page)
        await page.getByTitle('Hide zero cards', { exact: true }).click()
        const hidden = await fanCards(page)

        // All cards still present (never removed); zero cards fully
        // transparent (their full text stays in the DOM for measurement).
        expect(hidden.map((i) => i.text)).toEqual(['800,000', '00,000', '0,000', '500', '00', '2'])

        // The whole zero card is visibility:hidden + aria-hidden with no
        // tab stop (not just its number: a blank colored card would give
        // away the zero cards).
        const cardStates = await page.evaluate(() => {
          const fan = document.querySelector('[role="application"]')!
          return Array.from(fan.children).map((el) => ({
            visibility: getComputedStyle(el as HTMLElement).visibility,
            ariaHidden: (el as HTMLElement).getAttribute('aria-hidden'),
            tabIndex: (el as HTMLElement).getAttribute('tabindex'),
          }))
        })
        expect(cardStates.map((c) => c.visibility)).toEqual([
          'visible',
          'hidden',
          'hidden',
          'visible',
          'hidden',
          'visible',
        ])
        expect(cardStates.map((c) => c.ariaHidden)).toEqual([null, 'true', 'true', null, 'true', null])
        expect(cardStates.map((c) => c.tabIndex)).toEqual(['0', null, null, '0', null, '0'])

        // Every card shows its full text unclipped: the card shrink-wraps
        // its content, so scrollWidth never exceeds the card width.
        const clipState = await page.evaluate(() => {
          const fan = document.querySelector('[role="application"]')!
          return Array.from(fan.children).map((el) => {
            const htmlEl = el as HTMLElement
            const r = htmlEl.getBoundingClientRect()
            return { fits: htmlEl.scrollWidth <= r.width + 1 }
          })
        })
        expect(clipState.every((c) => c.fits)).toBe(true)

        // No layout shift: every card sits exactly where it was.
        expect(hidden.length).toBe(shown.length)
        for (let i = 0; i < shown.length; i++) {
          expect(Math.abs(hidden[i].left - shown[i].left)).toBeLessThanOrEqual(1)
          expect(Math.abs(hidden[i].right - shown[i].right)).toBeLessThanOrEqual(1)
        }
      })

      test('701,323 shown reads full values with a "00,000" zero card', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('701323')
        const cards = await fanCards(page)

        // The zero card displays "00,000": the place value with a leading
        // zero, parallel to "700,000".
        expect(cards.map((i) => i.text)).toEqual(['700,000', '00,000', '1,000', '300', '20', '3'])

        expectSequentialStrip(cards)
        expectFanCentered(cards, vp.width)
      })

      test('toggling zero visibility never shifts the fan', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('940934')
        const shown = await fanCards(page)

        await page.getByTitle('Hide zero cards', { exact: true }).click()
        const hidden = await fanCards(page)
        expect(hidden.length).toBe(shown.length)
        for (let i = 0; i < shown.length; i++) {
          expect(Math.abs(hidden[i].left - shown[i].left)).toBeLessThanOrEqual(1)
        }

        // Toggling back restores the texts at the same positions.
        await page.getByTitle('Show zero cards', { exact: true }).click()
        const restored = await fanCards(page)
        expect(restored.map((i) => i.text)).toEqual(shown.map((i) => i.text))
        for (let i = 0; i < shown.length; i++) {
          expect(Math.abs(restored[i].left - shown[i].left)).toBeLessThanOrEqual(1)
        }
      })

      test('1,234,567 shows seven full-value cards, no separate commas', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('1234567')
        const cards = await fanCards(page)
        // Commas live inside the card text now; there are no separate
        // comma elements.
        expect(cards.map((i) => i.text)).toEqual(['1,000,000', '200,000', '30,000', '4,000', '500', '60', '7'])
        await expect(page.getByTestId('fan-comma')).toHaveCount(0)
        expectSequentialStrip(cards)
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

      test('a displaced card keeps its full place-value text', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('763285')
        const first = page
          .getByRole('application', { name: 'Draggable place value cards' })
          .locator(':scope > div')
          .first()
        // Keyboard-displace the card: with full values always, the text is
        // identical at fan home and displaced.
        await expect(first).toHaveText('700,000')
        await first.focus()
        await page.keyboard.press('ArrowRight')
        await page.keyboard.press('ArrowRight')
        await expect(first).toHaveText('700,000')
      })

      // Fully dynamic sizing: on mobile the strip shrinks to the 24px floor
      // and then scrolls horizontally instead of overflowing the page.
      test('mobile strip scrolls instead of overflowing the page', async ({ page }) => {
        test.skip(!vp.mobile, 'dynamic sizing applies below the mobile breakpoint')
        await page.getByPlaceholder('Type a number here!').fill('1000000000')
        const fan = page.getByRole('application', { name: 'Draggable place value cards' })
        const state = await fan.evaluate((el: HTMLElement) => ({
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
          pageScrollsX: document.documentElement.scrollWidth > window.innerWidth + 1,
        }))
        // The strip is wider than the viewport and scrolls internally;
        // the page itself never scrolls sideways.
        expect(state.scrollWidth).toBeGreaterThan(state.clientWidth)
        expect(state.pageScrollsX).toBe(false)
      })
    })
  }
})
