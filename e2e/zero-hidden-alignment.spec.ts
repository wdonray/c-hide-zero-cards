import { test, expect, type Page, type Locator } from '@playwright/test'

/**
 * Zero-hidden fan alignment (owner redesign 2026-10-05, supersedes the
 * remove-cards approach; whole-card hiding per owner 2026-10-05,
 * superseding PR #58's blank-number approach): with "Zeros hidden" every
 * card stays in the fan at its measured position; the whole zero card goes
 * visibility:hidden + aria-hidden with no tab stop (a blank colored card
 * would give away which cards are zero). Each card's text is clipped to
 * its own peek, so a hidden card never leaks the text of the cards beneath
 * it. Place-value structure is preserved: hidden 800,502 reads
 * "8",<gap>,<gap>,",","5",<gap>,"2", never "852". Commas stay visible,
 * right edges stay flush, and the fan stays centered.
 */

interface CardDatum {
  text: string
  left: number
  right: number
  cardVisibility: string
  ariaHidden: string | null
  tabIndex: string | null
}

/** Number inputs and the card texts expected with zeros shown. Hiding
 * hides the whole "0" cards in place; the texts below list the shown state. */
const CASES: Array<{ input: string; shownTexts: string[] }> = [
  { input: '101325', shownTexts: ['100,000', '0', '1,000', '300', '20', '5'] },
  { input: '1001', shownTexts: ['1,000', '0', '0', '1'] },
  { input: '120', shownTexts: ['100', '20', '0'] },
  { input: '1000000', shownTexts: ['1,000,000', '0', '0', '0', '0', '0', '0'] },
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

/** Flush right edges and a visibly centered fan. */
function expectFanAligned(wsCenterX: number, data: CardDatum[]) {
  expect(data.length).toBeGreaterThan(0)
  if (data.length > 1) {
    const rights = data.map((c) => c.right)
    expect(Math.max(...rights) - Math.min(...rights)).toBeLessThanOrEqual(2)
  }
  const fanLeft = Math.min(...data.map((c) => c.left))
  const fanRight = Math.max(...data.map((c) => c.right))
  expect(Math.abs((fanLeft + fanRight) / 2 - wsCenterX)).toBeLessThanOrEqual(3)
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
          const shownLefts = data.cards.map((c) => c.left)

          await page.getByTitle('Hide zero cards', { exact: true }).click()

          // No card is removed: the count never changes.
          await expect(cardEls).toHaveCount(input.length)
          data = await cardData(page)

          // Zero cards are fully hidden (the whole card, not just its
          // number: a blank colored card would give away the zero cards).
          // The real "0" text stays in the DOM (needed for measurement) but
          // the card is invisible, removed from the a11y tree, and not
          // focusable: visually it reads as a gap, and text clipping keeps
          // it from leaking the text of the cards beneath. Every other card
          // keeps its text, visibility, and tab stop.
          data.cards.forEach((card, i) => {
            if (shownTexts[i] === '0') {
              expect(card.text).toBe('0')
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

          // Commas stay visible while zeros are hidden.
          const commaCount = await page.getByTestId('fan-comma').count()
          expect(commaCount).toBe(Math.floor((input.length - 1) / 3))
          for (let i = 0; i < commaCount; i++) {
            await expect(page.getByTestId('fan-comma').nth(i)).toBeVisible()
          }

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

      test('800,502 hidden reads "8",<gap>,<gap>,",","5",<gap>,"2", never "852"', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('800502')
        await page.getByTitle('Hide zero cards', { exact: true }).click()

        // Six cards present (not three): the fan cannot collapse to "852".
        // The zero cards keep their "0" text in the DOM (for measurement)
        // but render fully transparent: visually, gaps.
        await expect(cards(page)).toHaveCount(6)
        const data = await cardData(page)
        expect(data.cards.map((c) => c.text)).toEqual(['800,000', '0', '0', '500', '0', '2'])
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

        // The thousands comma is still there, visible, between the "0" and
        // "500" cards.
        const comma = page.getByTestId('fan-comma')
        await expect(comma).toHaveCount(1)
        await expect(comma).toBeVisible()
        await expect(comma).toHaveText(',')
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
    })
  }
})
