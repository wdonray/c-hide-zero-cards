import { test, expect, type Page } from '@playwright/test'

/**
 * Card fan: single-digit peeks + separate comma elements + hidden (not
 * removed) zero cards (owner reference 2026-10-05, supersedes PR #57's
 * wide-peek design; whole-card hiding per owner 2026-10-05, superseding
 * PR #58's blank-number approach):
 *
 * - Each card's peek fits exactly one digit (the leading digit), measured
 *   empirically in place with a Range so it is never clipped.
 * - Thousands separators are separate, non-interactive comma elements at
 *   every 3 digits from the right, participating in fan layout like cards.
 * - Hiding zeros never removes cards: the whole zero card goes
 *   visibility:hidden + aria-hidden (a blank colored card would give away
 *   which cards are zero). Each card's text is clipped to its own peek, so
 *   a hidden card never leaks the text of the cards beneath it.
 *   Place-value positions are preserved: hidden 800,502 reads
 *   "8",<gap>,<gap>,",","5",<gap>,"2", never "852".
 * - A zero card's value is 0 and it displays "0" (no fake zero numbers):
 *   701,323 reads "7","0","1",",","3","2","3", never "700,00,1,...".
 */

async function seed(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('hzc-has-seen-welcome-dialog', 'true')
    localStorage.setItem('hzc-has-seen-first-time-toast', 'true')
  })
  await page.goto('/')
}

interface FanItem {
  kind: 'card' | 'comma'
  text: string
  left: number
  right: number
}

/** All fan children in DOM order: cards and comma elements. Uses
 * textContent so hidden cards still report their real text (needed for
 * measurement); visibility is asserted separately. */
async function fanItems(page: Page): Promise<FanItem[]> {
  return page.evaluate(() => {
    const fan = document.querySelector('[role="application"]')!
    return Array.from(fan.children).map((el) => {
      const htmlEl = el as HTMLElement
      const r = htmlEl.getBoundingClientRect()
      return {
        kind: (el.getAttribute('data-testid') === 'fan-comma' ? 'comma' : 'card') as 'card' | 'comma',
        text: (htmlEl.textContent ?? '').trim(),
        left: r.x,
        right: r.x + r.width,
      }
    })
  })
}

/**
 * Every card except the last shows exactly its leading digit: the first
 * character's ink (Range width minus trailing letter-spacing) ends at or
 * before the next fan item's left edge, so the digit is never clipped by
 * the covering item.
 */
async function expectSingleDigitPeeks(page: Page) {
  const result = await page.evaluate(() => {
    const fan = document.querySelector('[role="application"]')!
    const items = Array.from(fan.children) as HTMLElement[]
    const cardIndices: number[] = []
    items.forEach((el, i) => {
      if (el.getAttribute('data-testid') !== 'fan-comma') cardIndices.push(i)
    })
    // All cards except the last one (the last card shows its full width).
    return cardIndices.slice(0, -1).map((itemIdx) => {
      const el = items[itemIdx]
      const inner = el.firstElementChild as HTMLElement
      const textNode = inner.firstChild as Text
      const range = document.createRange()
      range.setStart(textNode, 0)
      range.setEnd(textNode, 1)
      const r = range.getBoundingClientRect()
      const letterSpacing = parseFloat(getComputedStyle(el).letterSpacing) || 0
      return {
        inkRight: r.x + r.width - letterSpacing,
        nextLeft: items[itemIdx + 1].getBoundingClientRect().x,
      }
    })
  })
  expect(result.length).toBeGreaterThan(0)
  for (const r of result) {
    expect(r.inkRight).toBeLessThanOrEqual(r.nextLeft + 1)
  }
}

function expectFanCentered(items: FanItem[], viewportWidth: number) {
  const fanLeft = Math.min(...items.map((i) => i.left))
  const fanRight = Math.max(...items.map((i) => i.right))
  expect(Math.abs((fanLeft + fanRight) / 2 - viewportWidth / 2)).toBeLessThanOrEqual(3)
}

test.describe('card fan single-digit peeks and commas', () => {
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

      test('800,502 shown reads 8,0,0,comma,5,0,2', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('800502')
        const items = await fanItems(page)

        // Six cards plus one comma at the thousands boundary.
        expect(items.map((i) => i.kind)).toEqual(['card', 'card', 'card', 'comma', 'card', 'card', 'card'])
        expect(items.map((i) => i.text)).toEqual(['800,000', '0', '0', ',', '500', '0', '2'])

        // The comma sits between the third and fourth cards.
        const comma = items[3]
        expect(comma.left).toBeGreaterThanOrEqual(items[2].left)
        expect(comma.right).toBeLessThanOrEqual(items[4].right)
        await expect(page.getByTestId('fan-comma')).toBeVisible()

        // Single-digit peeks: each leading digit fully visible.
        await expectSingleDigitPeeks(page)

        expectFanCentered(items, vp.width)
      })

      test('800,502 hidden hides whole zero cards in position, never "852"', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('800502')
        const shown = await fanItems(page)
        await page.getByTitle('Hide zero cards', { exact: true }).click()
        const hidden = await fanItems(page)

        // All cards still present (never removed); zero cards fully
        // transparent (their "0" text stays in the DOM for measurement).
        expect(hidden.map((i) => i.kind)).toEqual(['card', 'card', 'card', 'comma', 'card', 'card', 'card'])
        expect(hidden.map((i) => i.text)).toEqual(['800,000', '0', '0', ',', '500', '0', '2'])

        // The whole zero card is visibility:hidden + aria-hidden with no
        // tab stop (not just its number: a blank colored card would give
        // away the zero cards). Each card's text is clipped to its own
        // peek, so a hidden card never leaks the text of the cards beneath
        // it. Layout and measurement stay intact, and the comma stays
        // visible.
        const cardStates = await page.evaluate(() => {
          const fan = document.querySelector('[role="application"]')!
          return Array.from(fan.children)
            .filter((el) => el.getAttribute('data-testid') !== 'fan-comma')
            .map((el) => ({
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
        await expect(page.getByTestId('fan-comma')).toBeVisible()

        // Text clipping: the first card's text ("800,000") is clipped to
        // its own peek width, so the hidden cards cannot leak it. The
        // inner text wrapper is narrower than the full text.
        const clipState = await page.evaluate(() => {
          const fan = document.querySelector('[role="application"]')!
          const firstCard = Array.from(fan.children).find(
            (el) => el.getAttribute('data-testid') !== 'fan-comma'
          ) as HTMLElement
          const inner = firstCard.firstElementChild as HTMLElement
          return {
            overflow: getComputedStyle(inner).overflow,
            clientWidth: inner.clientWidth,
            scrollWidth: inner.scrollWidth,
          }
        })
        expect(clipState.overflow).toBe('hidden')
        expect(clipState.scrollWidth).toBeGreaterThan(clipState.clientWidth)

        // No layout shift: every item sits exactly where it was.
        expect(hidden.length).toBe(shown.length)
        for (let i = 0; i < shown.length; i++) {
          expect(Math.abs(hidden[i].left - shown[i].left)).toBeLessThanOrEqual(1)
          expect(Math.abs(hidden[i].right - shown[i].right)).toBeLessThanOrEqual(1)
        }
      })

      test('701,323 shown reads 7,0,1,comma,3,2,3 ("0", not "00,")', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('701323')
        const items = await fanItems(page)

        // The zero card displays "0": no fake zero numbers, no "00," peek.
        expect(items.map((i) => i.kind)).toEqual(['card', 'card', 'card', 'comma', 'card', 'card', 'card'])
        expect(items.map((i) => i.text)).toEqual(['700,000', '0', '1,000', ',', '300', '20', '3'])

        await expectSingleDigitPeeks(page)
        expectFanCentered(items, vp.width)
      })

      test('toggling zero visibility never shifts the fan', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('940934')
        const shown = await fanItems(page)

        await page.getByTitle('Hide zero cards', { exact: true }).click()
        const hidden = await fanItems(page)
        expect(hidden.length).toBe(shown.length)
        for (let i = 0; i < shown.length; i++) {
          expect(hidden[i].kind).toBe(shown[i].kind)
          expect(Math.abs(hidden[i].left - shown[i].left)).toBeLessThanOrEqual(1)
        }

        // Toggling back restores the texts at the same positions.
        await page.getByTitle('Show zero cards', { exact: true }).click()
        const restored = await fanItems(page)
        expect(restored.map((i) => i.text)).toEqual(shown.map((i) => i.text))
        for (let i = 0; i < shown.length; i++) {
          expect(Math.abs(restored[i].left - shown[i].left)).toBeLessThanOrEqual(1)
        }
      })

      test('1,234,567 gets commas at both thousands boundaries', async ({ page }) => {
        await page.getByPlaceholder('Type a number here!').fill('1234567')
        const items = await fanItems(page)
        expect(items.map((i) => i.kind)).toEqual([
          'card',
          'comma',
          'card',
          'card',
          'card',
          'comma',
          'card',
          'card',
          'card',
        ])
        expect(items.map((i) => i.text)).toEqual([
          '1,000,000',
          ',',
          '200,000',
          '30,000',
          '4,000',
          ',',
          '500',
          '60',
          '7',
        ])
        await expect(page.getByTestId('fan-comma')).toHaveCount(2)
        await expectSingleDigitPeeks(page)
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
