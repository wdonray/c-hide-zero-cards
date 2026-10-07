import { test, expect, type Page } from '@playwright/test'

/**
 * Card fan: narrow overlapping peek tiles (owner decision 2026-10-07,
 * superseding the 2026-10-06 full-values strip). Every place-value card
 * renders its FULL text ("100,000", "80,000", "0,000", "700", "30", "6")
 * at its natural width; cards overlap left-to-right (z-index rises) so
 * only each card's peek shows and the fan reads as the number itself
 * ("3,743"). Pulling a tile out (drag, Mix, keyboard) uncovers the full
 * value that was always rendered underneath. A zero card shows the place
 * value with a leading zero, parallel to its siblings. Hiding zeros never
 * removes cards: the whole zero card goes visibility:hidden + aria-hidden
 * (a blank colored card would give away which cards are zero). Place-value
 * positions are preserved: hidden 800,502 reads
 * "800,000",<gap>,<gap>,"500",<gap>,"2", never "852".
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

/** All fan cards in DOM order, plus the strip container's box. Uses
 * textContent so hidden cards still report their real text (needed for
 * measurement); visibility is asserted separately. Centering is asserted
 * on the container: when the strip scrolls, cards legitimately extend
 * past the viewport. */
async function fanCards(page: Page): Promise<{ cards: FanCard[]; fanBox: { x: number; width: number } }> {
  return page.evaluate(() => {
    const fan = document.querySelector('[role="application"]') as HTMLElement
    const fr = fan.getBoundingClientRect()
    return {
      fanBox: { x: fr.x, width: fr.width },
      cards: Array.from(fan.children).map((el) => {
        const htmlEl = el as HTMLElement
        const r = htmlEl.getBoundingClientRect()
        return {
          text: (htmlEl.textContent ?? '').trim(),
          left: r.x,
          right: r.x + r.width,
        }
      }),
    }
  })
}

function expectFanCentered(fanBox: { x: number; width: number }, viewportWidth: number) {
  expect(Math.abs(fanBox.x + fanBox.width / 2 - viewportWidth / 2)).toBeLessThanOrEqual(3)
}

/** Overlapping fan: each card starts inside the previous card's box (the
 * next card covers everything past the peek) and strictly after the
 * previous card's left edge. */
function expectOverlappingFan(cards: FanCard[]) {
  for (let i = 1; i < cards.length; i++) {
    expect(cards[i].left).toBeGreaterThan(cards[i - 1].left)
    expect(cards[i].left).toBeLessThan(cards[i - 1].right - 1)
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

      test('3,743 reads as overlapping peek tiles: 3, / 7 / 4 / 3', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('3743')
        const { cards, fanBox } = await fanCards(page)

        // Four cards, each rendering its full place value in the DOM.
        expect(cards.map((i) => i.text)).toEqual(['3,000', '700', '40', '3'])

        // True overlap: each card starts inside the previous card's box,
        // so only the peek shows and the fan reads "3,743".
        expectOverlappingFan(cards)
        expectFanCentered(fanBox, vp.width)

        // The visible peek of the thousands tile is "3,": the next card
        // starts one peek-width in.
        const exposed = cards[1].left - cards[0].left
        expect(exposed).toBeGreaterThan(0)
        expect(exposed).toBeLessThan(cards[0].right - cards[0].left)
      })

      test('800,502 overlaps: 800,000 / 00,000 / 0,000 / 500 / 00 / 2', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('800502')
        const { cards, fanBox } = await fanCards(page)

        // Six cards, each rendering its full place value in the DOM. Zero
        // cards show the place value with a leading zero, parallel to
        // siblings.
        expect(cards.map((i) => i.text)).toEqual(['800,000', '00,000', '0,000', '500', '00', '2'])

        // Overlapping fan, centered.
        expectOverlappingFan(cards)
        expectFanCentered(fanBox, vp.width)
      })

      test('800,502 hidden hides whole zero cards in position, never "852"', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('800502')
        const { cards: shown } = await fanCards(page)
        await page.getByTitle('Hide zero cards', { exact: true }).click()
        const { cards: hidden } = await fanCards(page)

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

        // Every card renders its full text unclipped in the DOM (the peek
        // is real overlap, not CSS clipping): scrollWidth never exceeds
        // the card width.
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

      test('701,323 overlaps with a "00,000" zero card', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('701323')
        const { cards, fanBox } = await fanCards(page)

        // The zero card displays "00,000": the place value with a leading
        // zero, parallel to "700,000".
        expect(cards.map((i) => i.text)).toEqual(['700,000', '00,000', '1,000', '300', '20', '3'])

        expectOverlappingFan(cards)
        expectFanCentered(fanBox, vp.width)
      })

      test('toggling zero visibility never shifts the fan', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('940934')
        const { cards: shown } = await fanCards(page)

        await page.getByTitle('Hide zero cards', { exact: true }).click()
        const { cards: hidden } = await fanCards(page)
        expect(hidden.length).toBe(shown.length)
        for (let i = 0; i < shown.length; i++) {
          expect(Math.abs(hidden[i].left - shown[i].left)).toBeLessThanOrEqual(1)
        }

        // Toggling back restores the texts at the same positions.
        await page.getByTitle('Show zero cards', { exact: true }).click()
        const { cards: restored } = await fanCards(page)
        expect(restored.map((i) => i.text)).toEqual(shown.map((i) => i.text))
        for (let i = 0; i < shown.length; i++) {
          expect(Math.abs(restored[i].left - shown[i].left)).toBeLessThanOrEqual(1)
        }
      })

      test('1,234,567 shows seven overlapping cards, no separate commas', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('1234567')
        const { cards } = await fanCards(page)
        // Commas live inside the card text now; there are no separate
        // comma elements.
        expect(cards.map((i) => i.text)).toEqual(['1,000,000', '200,000', '30,000', '4,000', '500', '60', '7'])
        await expect(page.getByTestId('fan-comma')).toHaveCount(0)
        expectOverlappingFan(cards)
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
        // The full text is always in the DOM; displacing only uncovers it.
        await expect(first).toHaveText('700,000')
        await first.focus()
        await page.keyboard.press('ArrowRight')
        await page.keyboard.press('ArrowRight')
        await expect(first).toHaveText('700,000')
      })

      test('pulling the thousands tile uncovers "3,000"', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('3743')
        const tiles = page.getByRole('application', { name: 'Draggable place value cards' }).locator(':scope > div')
        const thousands = tiles.nth(0)
        await expect(thousands).toHaveText('3,000')

        // Drag the thousands tile down out of the fan.
        const box = await thousands.boundingBox()
        await page.mouse.move(box!.x + 15, box!.y + box!.height / 2)
        await page.mouse.down()
        await page.mouse.move(box!.x + 15, box!.y + 250, { steps: 10 })
        await page.mouse.up()

        // The tile is displaced and fully uncovered: its full box is
        // visible and no other card overlaps it.
        const state = await page.evaluate(() => {
          const fan = document.querySelector('[role="application"]')!
          const rects = Array.from(fan.children).map((el) => (el as HTMLElement).getBoundingClientRect())
          const r0 = rects[0]
          const overlaps = rects
            .slice(1)
            .some(
              (r) => r0.x < r.x + r.width && r.x < r0.x + r0.width && r0.y < r.y + r.height && r.y < r0.y + r0.height
            )
          return { text: (fan.children[0] as HTMLElement).textContent, overlaps }
        })
        expect(state.text).toBe('3,000')
        expect(state.overlaps).toBe(false)
      })

      test('dragging the covering card away uncovers the full text beneath', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('3743')
        const tiles = page.getByRole('application', { name: 'Draggable place value cards' }).locator(':scope > div')

        // Drag the "700" tile (index 1) away: the "3,000" tile beneath was
        // really rendered at full width (true overlap), so it is uncovered
        // intact.
        const cover = tiles.nth(1)
        const box = await cover.boundingBox()
        await page.mouse.move(box!.x + 15, box!.y + box!.height / 2)
        await page.mouse.down()
        await page.mouse.move(box!.x + 15, box!.y + 300, { steps: 10 })
        await page.mouse.up()

        const uncovered = await page.evaluate(() => {
          const fan = document.querySelector('[role="application"]')!
          const el = fan.children[0] as HTMLElement
          const r = el.getBoundingClientRect()
          return {
            text: el.textContent,
            // The tile's box is its full natural width (not shrunk to the
            // peek): the zeros were really behind the cover.
            boxWidth: r.width,
            textWidth: el.scrollWidth,
          }
        })
        expect(uncovered.text).toBe('3,000')
        expect(uncovered.boxWidth).toBeGreaterThanOrEqual(uncovered.textWidth - 1)
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
