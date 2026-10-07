import { test, expect, type Page } from '@playwright/test'

/**
 * No-overlap-slivers: in the overlapping fan, each card's text beyond its
 * peek must be fully covered by the next card. A "sliver" is any visible
 * fragment of covered text (e.g., a bit of "0" from "5,000" showing between
 * the "5," peek and the next card's left edge).
 *
 * Detection: for each adjacent card pair (i, i+1) at fan home, sample points
 * just left of card i+1's left edge at vertical center. Use
 * document.caretRangeFromPoint to find which character is hit. If a character
 * at index >= peekCharCount of card i is hit (i.e., beyond the peek), and
 * that point is not covered by card i+1, a sliver is visible -> fail.
 */

async function seed(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('hzc-has-seen-welcome-dialog', 'true')
    localStorage.setItem('hzc-has-seen-first-time-toast', 'true')
  })
  await page.goto('http://localhost:3000/')
}

function cardLocator(page: Page) {
  return page.getByRole('application', { name: 'Draggable place value cards' }).locator(':scope > div')
}

/** Peek char count: 2 for group-final cards ("5,"), else 1. Mirrors peekCharCount. */
function peekCharsForPlaceValue(placeValue: number): number {
  // Thousands group-final: 1000, 1000000, 1000000000, ...
  let pv = placeValue
  while (pv >= 1000) {
    if (pv === 1000) return 2
    pv = pv / 1000
  }
  return 1
}

const CASES = ['5181', '2609', '180736', '1000000000']

for (const input of CASES) {
  test(`no slivers for ${input} at 375px`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await seed(page)
    await page.getByPlaceholder('Type a number here!').fill(input)
    // Wait for layout to settle (measure + font correction).
    await page.waitForTimeout(1500)

    const slivers = await page.evaluate(
      ({ peekFn }: { peekFn: string }) => {
        const peekChars = new Function(`return ${peekFn}`)() as (pv: number) => number
        const fan = document.querySelector('[role="application"][aria-label="Draggable place value cards"]')
        if (!fan) return [{ error: 'fan not found' }]
        const cardEls = Array.from(fan.children) as HTMLElement[]
        // Filter to actual cards (skip comma items if any).
        const cards = cardEls.filter((el) => el.getAttribute('tabindex') !== null || el.textContent?.trim())
        const found: Array<{ cardIndex: number; x: number; charIndex: number; char: string }> = []

        for (let i = 0; i < cards.length - 1; i++) {
          const cardI = cards[i]
          const cardNext = cards[i + 1]
          // Skip if either is displaced (not at fan home) or hidden.
          const rI = cardI.getBoundingClientRect()
          const rNext = cardNext.getBoundingClientRect()
          if (rI.width === 0 || rNext.width === 0) continue

          // Determine placeValue from the card's aria-label or data.
          // Fallback: use text length heuristics. Instead, read from the
          // card's text and compute peek chars via the passed function.
          // We need placeValue; get it from a data attribute if present,
          // else infer from text.
          const text = (cardI.textContent ?? '').trim()
          // Infer placeValue from digit count of the unformatted value.
          const digits = text.replace(/[^0-9]/g, '').length
          // placeValue = 10^(digits-1), but for "0,000" style it's still positional.
          // Simpler: peek is 2 chars if text matches /^\d,/ (digit + comma).
          const peekCount = /^\d,/.test(text) ? 2 : 1

          const y = rI.top + rI.height / 2
          // Sample just left of the covering card's left edge.
          for (let x = rNext.left - 12; x < rNext.left; x += 2) {
            if (x < rI.left) continue
            const range = (document as any).caretRangeFromPoint?.(x, y) as Range | null
            if (!range) continue
            const container = range.startContainer
            // Check if the hit is inside card i's text.
            let node: Node | null = container
            let insideCardI = false
            while (node) {
              if (node === cardI) {
                insideCardI = true
                break
              }
              if (node === cardNext || node === fan) break
              node = node.parentNode
            }
            if (!insideCardI) continue
            // If we hit card i's text at or beyond the peek char count, it's a sliver.
            // (Offset 0..peekCount-1 is the peek itself, which is supposed to show.)
            if (range.startOffset >= peekCount) {
              // Confirm it's actually visible (not covered by cardNext).
              const elAtPoint = document.elementFromPoint(x, y)
              let elNode: Node | null = elAtPoint
              let hitCardNext = false
              while (elNode) {
                if (elNode === cardNext) {
                  hitCardNext = true
                  break
                }
                elNode = elNode.parentNode
              }
              if (!hitCardNext) {
                found.push({
                  cardIndex: i,
                  x: Math.round(x),
                  charIndex: range.startOffset,
                  char: text[range.startOffset] ?? '?',
                })
              }
            }
          }
        }
        return found
      },
      { peekFn: peekCharsForPlaceValue.toString() }
    )

    expect(slivers).toEqual([])
  })

  test(`no slivers for ${input} at 1280px`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await seed(page)
    await page.getByPlaceholder('Type a number here!').fill(input)
    await page.waitForTimeout(1500)

    const slivers = await page.evaluate(() => {
      const fan = document.querySelector('[role="application"][aria-label="Draggable place value cards"]')
      if (!fan) return [{ error: 'fan not found' }]
      const cardEls = Array.from(fan.children) as HTMLElement[]
      const cards = cardEls.filter((el) => el.getAttribute('tabindex') !== null || el.textContent?.trim())
      const found: Array<{ cardIndex: number; x: number; charIndex: number; char: string }> = []

      for (let i = 0; i < cards.length - 1; i++) {
        const cardI = cards[i]
        const cardNext = cards[i + 1]
        const rI = cardI.getBoundingClientRect()
        const rNext = cardNext.getBoundingClientRect()
        if (rI.width === 0 || rNext.width === 0) continue

        const text = (cardI.textContent ?? '').trim()
        const peekCount = /^\d,/.test(text) ? 2 : 1
        const y = rI.top + rI.height / 2

        for (let x = rNext.left - 12; x < rNext.left; x += 2) {
          if (x < rI.left) continue
          const range = (document as any).caretRangeFromPoint?.(x, y) as Range | null
          if (!range) continue
          let node: Node | null = range.startContainer
          let insideCardI = false
          while (node) {
            if (node === cardI) {
              insideCardI = true
              break
            }
            if (node === cardNext || node === fan) break
            node = node.parentNode
          }
          if (!insideCardI) continue
          if (range.startOffset >= peekCount) {
            const elAtPoint = document.elementFromPoint(x, y)
            let elNode: Node | null = elAtPoint
            let hitCardNext = false
            while (elNode) {
              if (elNode === cardNext) {
                hitCardNext = true
                break
              }
              elNode = elNode.parentNode
            }
            if (!hitCardNext) {
              found.push({
                cardIndex: i,
                x: Math.round(x),
                charIndex: range.startOffset,
                char: text[range.startOffset] ?? '?',
              })
            }
          }
        }
      }
      return found
    })

    expect(slivers).toEqual([])
  })
}
