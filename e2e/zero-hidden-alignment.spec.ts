import { test, expect, type Page, type Locator } from '@playwright/test'

/**
 * Zero-hidden fan alignment (owner redesign 2026-10-05, supersedes the
 * remove-cards approach): with "Zeros hidden" every card stays in the fan
 * at its measured position; zero cards render with their text blanked
 * (visibility:hidden), never removed. Place-value structure is preserved:
 * hidden 800,502 reads "8","","",",","5","","2", never "852". Commas stay
 * visible, right edges stay flush, and the fan stays centered.
 */

interface CardDatum {
  text: string
  left: number
  right: number
  textVisibility: string
}

/** Number inputs and the card texts expected with zeros shown. Hiding
 * blanks the "0" cards in place; the texts below list the shown state. */
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
    const els = Array.from(document.querySelectorAll('[role="application"] [tabindex="0"]')) as HTMLElement[]
    return {
      wsCenterX: ws.x + ws.width / 2,
      cards: els.map((el) => {
        const r = el.getBoundingClientRect()
        return {
          text: el.innerText,
          left: r.x,
          right: r.x + r.width,
          textVisibility: getComputedStyle(el.firstElementChild as HTMLElement).visibility,
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
        test(`${input}: zeros blank in place, fan stays aligned`, async ({ page }) => {
          await page.getByPlaceholder('Type a number here!').fill(input)
          const cardEls = cards(page)
          await expect(cardEls).toHaveCount(input.length)

          // Zeros shown: every card visible with its full text.
          let data = await cardData(page)
          expect(data.cards.map((c) => c.text)).toEqual(shownTexts)
          expect(data.cards.every((c) => c.textVisibility === 'visible')).toBe(true)
          expectFanAligned(data.wsCenterX, data.cards)
          const shownLefts = data.cards.map((c) => c.left)

          await page.getByTitle('Hide zero cards', { exact: true }).click()

          // No card is removed: the count never changes.
          await expect(cardEls).toHaveCount(input.length)
          data = await cardData(page)

          // Zero cards are blank (empty text, visibility:hidden); every
          // other card keeps its text and visibility.
          data.cards.forEach((card, i) => {
            if (shownTexts[i] === '0') {
              expect(card.text).toBe('')
              expect(card.textVisibility).toBe('hidden')
            } else {
              expect(card.text).toBe(shownTexts[i])
              expect(card.textVisibility).toBe('visible')
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

      test('800,502 hidden reads "8","","",",","5","","2", never "852"', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('800502')
        await page.getByTitle('Hide zero cards', { exact: true }).click()

        // Six cards present (not three): the fan cannot collapse to "852".
        await expect(cards(page)).toHaveCount(6)
        const data = await cardData(page)
        expect(data.cards.map((c) => c.text)).toEqual(['800,000', '', '', '500', '', '2'])
        expect(data.cards.map((c) => c.textVisibility)).toEqual([
          'visible',
          'hidden',
          'hidden',
          'visible',
          'hidden',
          'visible',
        ])
        expectFanAligned(data.wsCenterX, data.cards)

        // The thousands comma is still there, visible, between the "0" and
        // "500" cards.
        const comma = page.getByTestId('fan-comma')
        await expect(comma).toHaveCount(1)
        await expect(comma).toBeVisible()
        await expect(comma).toHaveText(',')
      })

      test('typing 0 keeps the empty state (input rejects 0)', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('0')
        await expect(page.getByPlaceholder('Type a number here!')).toHaveValue('')
        await expect(cards(page)).toHaveCount(0)
        await expect(page.getByText('Type a number above to see your cards!')).toBeVisible()

        // With no cards the zero toggle is disabled: toggling is impossible,
        // so the fan cannot break.
        await expect(page.getByTitle('Hide zero cards', { exact: true })).toBeDisabled()
      })
    })
  }
})
