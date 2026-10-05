import { test, expect, type Page, type Locator } from '@playwright/test'

/**
 * Zero-hidden fan alignment (teacher report 2026-10-05, follow-up): with
 * "Zeros hidden" the fan must recompute as if zero cards do not exist — no
 * zero card visible, every card's left edge evenly spaced (one xOffset peek
 * each, so no "40" double peeks from the wide back cards), right edges
 * flush (no trailing-zero slivers), and the visible fan centered in the
 * workspace. Backs the measured fan wrapper: cards anchor on evenly spaced
 * left edges and each card is widened so the right edge is flush.
 */

interface CardDatum {
  text: string
  left: number
  right: number
}

/** Number inputs and the exact card texts expected with zeros hidden. */
const CASES: Array<{ input: string; hiddenTexts: string[] }> = [
  { input: '101325', hiddenTexts: ['100,000', '1,000', '300', '20', '5'] },
  { input: '1001', hiddenTexts: ['1,000', '1'] },
  { input: '120', hiddenTexts: ['100', '20'] },
  { input: '1000000', hiddenTexts: ['1,000,000'] },
  // No-zero control: hiding zeros must not change this fan.
  { input: '12345', hiddenTexts: ['10,000', '2,000', '300', '40', '5'] },
]

const ZERO_TEXT = /^0[0,]*$/

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
        return { text: el.innerText, left: r.x, right: r.x + r.width }
      }),
    }
  })
}

/**
 * Even left-edge spacing (one peek per card), flush right edges, and a
 * visibly centered fan.
 */
function expectFanAligned(wsCenterX: number, data: CardDatum[]) {
  expect(data.length).toBeGreaterThan(0)
  if (data.length > 1) {
    const lefts = data.map((c) => c.left)
    const deltas = lefts.slice(1).map((l, i) => l - lefts[i])
    expect(Math.max(...deltas) - Math.min(...deltas)).toBeLessThanOrEqual(2)
    const rights = data.map((c) => c.right)
    expect(Math.max(...rights) - Math.min(...rights)).toBeLessThanOrEqual(2)
  }
  const fanLeft = Math.min(...data.map((c) => c.left))
  const fanRight = Math.max(...data.map((c) => c.right))
  expect(Math.abs((fanLeft + fanRight) / 2 - wsCenterX)).toBeLessThanOrEqual(3)
}

async function expectZeroCardsHidden(page: Page, hiddenTexts: string[]) {
  const { wsCenterX, cards } = await cardData(page)
  expect(cards.map((c) => c.text)).toEqual(hiddenTexts)
  expect(cards.every((c) => !ZERO_TEXT.test(c.text))).toBe(true)
  expectFanAligned(wsCenterX, cards)
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

      for (const { input, hiddenTexts } of CASES) {
        test(`${input}: fan aligned with zeros shown and hidden`, async ({ page }) => {
          await page.getByPlaceholder('Type a number here!').fill(input)
          const cardEls = cards(page)
          await expect(cardEls).toHaveCount(input.length)

          // Zeros shown: the fan is aligned too (the anchor fix covers both).
          let data = await cardData(page)
          expectFanAligned(data.wsCenterX, data.cards)

          await page.getByTitle('Hide zero cards', { exact: true }).click()
          await expect(cardEls).toHaveCount(hiddenTexts.length)
          await expectZeroCardsHidden(page, hiddenTexts)

          // Toggling back restores the full fan, still aligned.
          await page.getByTitle('Show zero cards', { exact: true }).click()
          await expect(cardEls).toHaveCount(input.length)
          data = await cardData(page)
          expectFanAligned(data.wsCenterX, data.cards)
        })
      }

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
