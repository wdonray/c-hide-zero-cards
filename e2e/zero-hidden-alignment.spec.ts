import { test, expect, type Page, type Locator } from '@playwright/test'

/**
 * Zero-hidden fan alignment (full-values redesign 2026-10-06): every card
 * always shows its complete place value ("100,000", "80,000", "0,000",
 * "700", "30", "6"); a zero card shows the place value with a leading
 * zero. With "Zeros hidden" every card stays in the strip at its measured
 * position; the whole zero card goes visibility:hidden + aria-hidden with
 * no tab stop (a blank colored card would give away which cards are zero).
 * Place-value structure is preserved: hidden 800,502 reads
 * "800,000",<gap>,<gap>,"500",<gap>,"2", never "852".
 */

interface CardDatum {
  text: string
  left: number
  right: number
  cardVisibility: string
  ariaHidden: string | null
  tabIndex: string | null
}

/** A card text is a zero card when it is all zeros (commas allowed). */
function isZeroText(text: string): boolean {
  return /^0[0,]*$/.test(text)
}

/** Number inputs and the card texts expected with zeros shown. Hiding
 * hides the whole zero cards in place; the texts below list the shown state. */
const CASES: Array<{ input: string; shownTexts: string[] }> = [
  { input: '101325', shownTexts: ['100,000', '0,000', '1,000', '300', '20', '5'] },
  { input: '1001', shownTexts: ['1,000', '000', '00', '1'] },
  { input: '120', shownTexts: ['100', '20', '0'] },
  { input: '1000000', shownTexts: ['1,000,000', '000,000', '00,000', '0,000', '000', '00', '0'] },
  // No-zero control: hiding zeros must not change this fan at all.
  { input: '12345', shownTexts: ['10,000', '2,000', '300', '40', '5'] },
]

async function seed(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('hzc-has-seen-welcome-dialog', 'true')
    localStorage.setItem('hzc-has-seen-first-time-toast', 'true')
  })
  await page.goto('/')
}

function cards(page: Page): Locator {
  return page.getByRole('application', { name: 'Draggable place value cards' }).locator(':scope > div')
}

async function cardData(page: Page): Promise<{ wsCenterX: number; cards: CardDatum[] }> {
  return page.evaluate(() => {
    const ws = document.querySelector('main[aria-label="Place value cards workspace"]')!.getBoundingClientRect()
    // All cards (direct div children), including hidden ones: hidden cards
    // lose their tabindex, so they can no longer be found that way.
    // textContent (not innerText): the real text stays in the DOM for
    // measurement even when the card is visibility:hidden.
    const els = Array.from(document.querySelectorAll('[role="application"] > div')) as HTMLElement[]
    return {
      wsCenterX: ws.x + ws.width / 2,
      cards: els.map((el) => {
        const r = el.getBoundingClientRect()
        return {
          text: (el.textContent ?? '').trim(),
          left: r.x,
          right: r.x + r.width,
          cardVisibility: getComputedStyle(el).visibility,
          ariaHidden: el.getAttribute('aria-hidden'),
          tabIndex: el.getAttribute('tabindex'),
        }
      }),
    }
  })
}

/** The strip is a visibly centered sequential row of full-value cards. */
function expectFanAligned(wsCenterX: number, data: CardDatum[]) {
  expect(data.length).toBeGreaterThan(0)
  const fanLeft = Math.min(...data.map((c) => c.left))
  const fanRight = Math.max(...data.map((c) => c.right))
  expect(Math.abs((fanLeft + fanRight) / 2 - wsCenterX)).toBeLessThanOrEqual(3)
}

/** Cards sit left-to-right in DOM order with a small gap, never overlapping. */
function expectSequentialStrip(data: CardDatum[]) {
  for (let i = 1; i < data.length; i++) {
    expect(data[i].left).toBeGreaterThanOrEqual(data[i - 1].right - 1)
  }
}

test.describe('zero-hidden fan alignment', () => {
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

      for (const { input, shownTexts } of CASES) {
        test(`${input}: zeros hidden in place, fan stays aligned`, async ({ page }) => {
          await page.getByPlaceholder('Type a number here!').fill(input)
          const cardEls = cards(page)
          await expect(cardEls).toHaveCount(input.length)

          // Zeros shown: every card visible with its full text, focusable,
          // and announced.
          let data = await cardData(page)
          expect(data.cards.map((c) => c.text)).toEqual(shownTexts)
          expect(data.cards.every((c) => c.cardVisibility === 'visible')).toBe(true)
          expect(data.cards.every((c) => c.tabIndex === '0')).toBe(true)
          expect(data.cards.every((c) => c.ariaHidden === null)).toBe(true)
          expectFanAligned(data.wsCenterX, data.cards)
          expectSequentialStrip(data.cards)
          const shownLefts = data.cards.map((c) => c.left)

          await page.getByTitle('Hide zero cards', { exact: true }).click()

          // No card is removed: the count never changes.
          await expect(cardEls).toHaveCount(input.length)
          data = await cardData(page)

          // Zero cards are fully hidden (the whole card, not just its
          // number: a blank colored card would give away the zero cards).
          // The real text stays in the DOM (needed for measurement) but
          // the card is invisible, removed from the a11y tree, and not
          // focusable: visually it reads as a gap. Every other card keeps
          // its text, visibility, and tab stop.
          data.cards.forEach((card, i) => {
            if (isZeroText(shownTexts[i])) {
              expect(card.text).toBe(shownTexts[i])
              expect(card.cardVisibility).toBe('hidden')
              expect(card.ariaHidden).toBe('true')
              expect(card.tabIndex).toBeNull()
            } else {
              expect(card.text).toBe(shownTexts[i])
              expect(card.cardVisibility).toBe('visible')
              expect(card.ariaHidden).toBeNull()
              expect(card.tabIndex).toBe('0')
            }
          })

          // Positions are untouched by the toggle.
          data.cards.forEach((card, i) => {
            expect(Math.abs(card.left - shownLefts[i])).toBeLessThanOrEqual(1)
          })
          expectFanAligned(data.wsCenterX, data.cards)

          // Toggling back restores every text at the same positions.
          await page.getByTitle('Show zero cards', { exact: true }).click()
          await expect(cardEls).toHaveCount(input.length)
          data = await cardData(page)
          expect(data.cards.map((c) => c.text)).toEqual(shownTexts)
          data.cards.forEach((card, i) => {
            expect(Math.abs(card.left - shownLefts[i])).toBeLessThanOrEqual(1)
          })
          expectFanAligned(data.wsCenterX, data.cards)
        })
      }

      test('800,502 hidden reads "800,000",<gap>,<gap>,"500",<gap>,"2", never "852"', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('800502')
        await page.getByTitle('Hide zero cards', { exact: true }).click()

        // Six cards present (not three): the fan cannot collapse to "852".
        // The zero cards keep their full "00,000"/"0,000"/"00" text in the
        // DOM (for measurement) but render fully transparent: visually,
        // gaps.
        await expect(cards(page)).toHaveCount(6)
        const data = await cardData(page)
        expect(data.cards.map((c) => c.text)).toEqual(['800,000', '00,000', '0,000', '500', '00', '2'])
        expect(data.cards.map((c) => c.cardVisibility)).toEqual([
          'visible',
          'hidden',
          'hidden',
          'visible',
          'hidden',
          'visible',
        ])
        // Whole cards hidden (aria-hidden, no tab stop), not just blanked
        // numbers: nothing gives away which cards are zero.
        expect(data.cards.map((c) => c.ariaHidden)).toEqual([null, 'true', 'true', null, 'true', null])
        expect(data.cards.map((c) => c.tabIndex)).toEqual(['0', null, null, '0', null, '0'])
        expectFanAligned(data.wsCenterX, data.cards)
        expectSequentialStrip(data.cards)
      })

      test('hidden zero cards are skipped in tab order', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('800502')
        await page.getByTitle('Hide zero cards', { exact: true }).click()
        await expect(cards(page)).toHaveCount(6)

        // Tab through the page: focus must never land on a hidden card.
        await page.getByPlaceholder('Type a number here!').focus()
        const focusedHidden: string[] = []
        for (let i = 0; i < 40; i++) {
          await page.keyboard.press('Tab')
          const marker = await page.evaluate(() => {
            const ae = document.activeElement as HTMLElement | null
            if (!ae) return null
            // A hidden card carries aria-hidden="true" and no tabindex.
            return ae.getAttribute('aria-hidden') === 'true' ? (ae.textContent ?? '') : null
          })
          if (marker !== null) focusedHidden.push(marker)
        }
        expect(focusedHidden).toEqual([])
      })

      test('typing 0 is rejected (input keeps its value)', async ({ page }) => {
        // Auto-roll on load gives the input a value; typing 0 is invalid and
        // must not change it or break the fan.
        const input = page.getByPlaceholder('Type a number here!')
        const before = await input.inputValue()
        expect(before).not.toBe('')
        await input.fill('0')
        // The invalid 0 is rejected: the input keeps its previous value.
        await expect(input).not.toHaveValue('0')
        await expect(input).toHaveValue(before)
      })

      test('Mix reveals hidden zero cards (displaced cards are never hidden)', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('85055')
        // Hide zeros: the hundreds zero card goes invisible in the fan.
        await page.getByTitle('Hide zero cards', { exact: true }).click()
        const zeroCard = cards(page).filter({ hasText: /^0+$/ })
        await expect(zeroCard).toHaveCount(1)
        await expect(zeroCard).toBeHidden()

        // Mix scatters all cards: the displaced zero card must become visible
        // immediately, showing its full "000" text.
        await page.getByTitle('Randomize card position', { exact: true }).click()
        await expect(zeroCard).toBeVisible()
        await expect(zeroCard).toHaveText('000')
      })
    })
  }
})
