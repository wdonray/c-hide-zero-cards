import { test, expect, type Page, type Locator } from '@playwright/test'

/**
 * Zero-hidden fan alignment (teacher report 2026-10-05, follow-up): with
 * "Zeros hidden" the fan must recompute as if zero cards do not exist — no
 * zero card visible, every card's significant prefix fully readable
 * ("800," / "500" / "2", never "852"), right edges flush (no
 * trailing-zero slivers), and the visible fan centered in the workspace.
 * Backs the measured fan: cards anchor on cumulative peek widths and each
 * card is sized so the right edge is flush.
 */

interface CardDatum {
  text: string
  left: number
  right: number
}

/** Number inputs, the exact card texts expected with zeros hidden, and the
 * significant prefix each peek must show (one entry per card except the
 * last, which shows its full text). */
const CASES: Array<{ input: string; hiddenTexts: string[]; hiddenPeeks: string[] }> = [
  { input: '101325', hiddenTexts: ['100,000', '1,000', '300', '20', '5'], hiddenPeeks: ['100,', '1,', '300', '20'] },
  { input: '1001', hiddenTexts: ['1,000', '1'], hiddenPeeks: ['1,'] },
  { input: '120', hiddenTexts: ['100', '20'], hiddenPeeks: ['100'] },
  { input: '1000000', hiddenTexts: ['1,000,000'], hiddenPeeks: [] },
  // No-zero control: hiding zeros must not change this fan.
  { input: '12345', hiddenTexts: ['10,000', '2,000', '300', '40', '5'], hiddenPeeks: ['10,', '2,', '300', '40'] },
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
 * Each card's significant prefix (up to and including the first comma, else
 * the full text) is fully visible: its rendered right edge sits at or left
 * of the covering card's left edge. expectedPeeks has one entry per card
 * except the last (the last card shows its full natural width, no peek).
 */
async function expectPrefixesVisible(page: Page, expectedPeeks: string[]) {
  const result = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('[role="application"] [tabindex="0"]')) as HTMLElement[]
    return els.slice(0, -1).map((el, i) => {
      const fullText = el.innerText
      const commaIndex = fullText.indexOf(',')
      const peekText = commaIndex === -1 ? fullText : fullText.slice(0, commaIndex + 1)
      const inner = el.firstElementChild as HTMLElement
      const textNode = inner.firstChild as Text
      const range = document.createRange()
      range.setStart(textNode, 0)
      range.setEnd(textNode, Math.min(peekText.length, textNode.length))
      const pr = range.getBoundingClientRect()
      const style = getComputedStyle(el)
      const letterSpacing = parseFloat(style.letterSpacing) || 0
      return {
        peekText,
        prefixRight: pr.x + pr.width - letterSpacing,
        nextLeft: els[i + 1].getBoundingClientRect().x,
      }
    })
  })
  expect(result.map((r) => r.peekText)).toEqual(expectedPeeks)
  for (const r of result) {
    expect(r.prefixRight).toBeLessThanOrEqual(r.nextLeft + 1)
  }
}

/**
 * Flush right edges and a visibly centered fan. Peeks vary per card (each
 * fits its significant prefix), so left edges are cumulative, not even.
 */
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

async function expectZeroCardsHidden(page: Page, hiddenTexts: string[], hiddenPeeks: string[]) {
  const { wsCenterX, cards } = await cardData(page)
  expect(cards.map((c) => c.text)).toEqual(hiddenTexts)
  expect(cards.every((c) => !ZERO_TEXT.test(c.text))).toBe(true)
  expectFanAligned(wsCenterX, cards)
  await expectPrefixesVisible(page, hiddenPeeks)
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

      for (const { input, hiddenTexts, hiddenPeeks } of CASES) {
        test(`${input}: fan aligned with zeros shown and hidden`, async ({ page }) => {
          await page.getByPlaceholder('Type a number here!').fill(input)
          const cardEls = cards(page)
          await expect(cardEls).toHaveCount(input.length)

          // Zeros shown: the fan is aligned too.
          let data = await cardData(page)
          expectFanAligned(data.wsCenterX, data.cards)

          await page.getByTitle('Hide zero cards', { exact: true }).click()
          await expect(cardEls).toHaveCount(hiddenTexts.length)
          await expectZeroCardsHidden(page, hiddenTexts, hiddenPeeks)

          // Toggling back restores the full fan, still aligned.
          await page.getByTitle('Show zero cards', { exact: true }).click()
          await expect(cardEls).toHaveCount(input.length)
          data = await cardData(page)
          expectFanAligned(data.wsCenterX, data.cards)
        })
      }

      test('800,502 hidden reads "800," / "500" / "2", never "852"', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('800502')
        await page.getByTitle('Hide zero cards', { exact: true }).click()
        await expect(cards(page)).toHaveCount(3)
        await expectZeroCardsHidden(page, ['800,000', '500', '2'], ['800,', '500'])
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
