import { test, expect, type Locator, type Page } from '@playwright/test'

/**
 * Adversarial touch-drag coverage for the real-device bug where a drag
 * "starts and stops, does not follow my finger" on iPhones.
 *
 * Root cause (fixed in lib/useDraggable.ts): the old `onPointerLeave`
 * drag-ender fired whenever the physical touch point left the card's bounds
 * — which happens constantly on a real touchscreen because the card lags
 * the finger by one React state update per touchmove. Playwright's CDP
 * touch streams never reproduce it because they dispatch in lockstep.
 *
 * These tests use synthetic PointerEvents (precise pointerId/isPrimary
 * control, which CDP multi-touch cannot express) dispatched on the card
 * element. React 19 receives them through its root listeners exactly like
 * real browser events. Note: React derives `onPointerLeave` from native
 * `pointerout`, so the regression test below dispatches `pointerout` —
 * what a real browser fires when the finger outruns the card.
 */
test.use({
  viewport: { width: 375, height: 667 },
  hasTouch: true,
  isMobile: true,
})

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('hzc-has-seen-welcome-dialog', 'true')
    localStorage.setItem('hzc-has-seen-first-time-toast', 'true')
  })
  await page.goto('/')
})

type PointerType = 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel' | 'pointerout'

async function dispatchPointer(
  card: Locator,
  type: PointerType,
  opts: { pointerId: number; isPrimary: boolean; clientX: number; clientY: number }
) {
  await card.evaluate(
    (el, [type, o]) => {
      el.dispatchEvent(
        new PointerEvent(type, {
          pointerId: o.pointerId,
          isPrimary: o.isPrimary,
          clientX: o.clientX,
          clientY: o.clientY,
          relatedTarget: type === 'pointerout' ? document.body : null,
          bubbles: true,
          cancelable: true,
          pointerType: 'touch',
        })
      )
    },
    [type, opts] as const
  )
}

function parseTranslate(transform: string): { x: number; y: number } {
  const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(transform)
  if (!m) throw new Error(`unparseable transform: ${transform}`)
  return { x: parseFloat(m[1]), y: parseFloat(m[2]) }
}

async function cardPos(card: Locator): Promise<{ x: number; y: number }> {
  const transform = await card.evaluate((el) => (el as HTMLElement).style.transform)
  return parseTranslate(transform)
}

async function cardCenter(page: Page): Promise<{ card: Locator; x: number; y: number }> {
  await page.getByPlaceholder('Type a number here!').fill('1234')
  const cards = page.getByRole('application', { name: 'Draggable place value cards' })
  // The last card sits on top of the fan: its center is never covered by
  // the cascading overlap, so the pointer reliably hits it.
  const card = cards.locator(':scope > div').last()
  await expect(card).toBeVisible()
  const box = await card.boundingBox()
  expect(box).not.toBeNull()
  return { card, x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 }
}

test.describe('mobile touch-drag robustness', () => {
  test('keeps following the finger after a pointerout mid-drag', async ({ page }) => {
    // Regression test for the real-iPhone bug: when the finger outruns the
    // card, the browser fires pointerout on it mid-drag. The old
    // onPointerLeave handler ended the drag there and the card froze;
    // the drag must now survive until pointerup/pointercancel.
    const { card, x: sx, y: sy } = await cardCenter(page)
    const start = await cardPos(card)

    await dispatchPointer(card, 'pointerdown', { pointerId: 5, isPrimary: true, clientX: sx, clientY: sy })
    await dispatchPointer(card, 'pointermove', { pointerId: 5, isPrimary: true, clientX: sx + 60, clientY: sy + 40 })
    let pos = await cardPos(card)
    expect(pos.x).toBeCloseTo(start.x + 60, 1)
    expect(pos.y).toBeCloseTo(start.y + 40, 1)

    // The finger outruns the card: pointerout fires on the card mid-drag.
    await dispatchPointer(card, 'pointerout', { pointerId: 5, isPrimary: true, clientX: sx + 200, clientY: sy + 200 })

    // The drag must continue uninterrupted.
    await dispatchPointer(card, 'pointermove', { pointerId: 5, isPrimary: true, clientX: sx + 120, clientY: sy + 80 })
    pos = await cardPos(card)
    expect(pos.x).toBeCloseTo(start.x + 120, 1)
    expect(pos.y).toBeCloseTo(start.y + 80, 1)

    await dispatchPointer(card, 'pointerup', { pointerId: 5, isPrimary: true, clientX: sx + 120, clientY: sy + 80 })
    pos = await cardPos(card)
    expect(pos.x).toBeCloseTo(start.x + 120, 1)
  })

  test('pointercancel ends the drag cleanly with no stuck state', async ({ page }) => {
    // iOS Safari fires pointercancel when it takes over the gesture. The
    // drag must end (not stick), and a fresh drag must work afterwards.
    const { card, x: sx, y: sy } = await cardCenter(page)
    const start = await cardPos(card)

    await dispatchPointer(card, 'pointerdown', { pointerId: 5, isPrimary: true, clientX: sx, clientY: sy })
    await dispatchPointer(card, 'pointermove', { pointerId: 5, isPrimary: true, clientX: sx + 50, clientY: sy })
    const mid = await cardPos(card)
    expect(mid.x).toBeCloseTo(start.x + 50, 1)

    await dispatchPointer(card, 'pointercancel', { pointerId: 5, isPrimary: true, clientX: sx + 50, clientY: sy })

    // The card stays where the cancel happened; further moves of the dead
    // pointer do nothing.
    let pos = await cardPos(card)
    expect(pos.x).toBeCloseTo(mid.x, 1)
    await dispatchPointer(card, 'pointermove', { pointerId: 5, isPrimary: true, clientX: sx + 200, clientY: sy })
    pos = await cardPos(card)
    expect(pos.x).toBeCloseTo(mid.x, 1)

    // A fresh drag works normally: no stuck isDragging, no throw from the
    // capture release.
    await dispatchPointer(card, 'pointerdown', { pointerId: 6, isPrimary: true, clientX: sx + 200, clientY: sy })
    await dispatchPointer(card, 'pointermove', { pointerId: 6, isPrimary: true, clientX: sx + 260, clientY: sy + 10 })
    pos = await cardPos(card)
    // New grab offset: (sx + 200) - mid.x, so the card lands at mid + (60, 10).
    expect(pos.x).toBeCloseTo(mid.x + 60, 1)
    expect(pos.y).toBeCloseTo(mid.y + 10, 1)
    await dispatchPointer(card, 'pointerup', { pointerId: 6, isPrimary: true, clientX: sx + 260, clientY: sy + 10 })
  })

  test('tracks rapid direction changes without freezing', async ({ page }) => {
    const { card, x: sx, y: sy } = await cardCenter(page)
    const start = await cardPos(card)

    const moves: Array<[number, number]> = [
      [40, 0],
      [-20, 30],
      [60, -10],
      [-30, -30],
      [10, 40],
    ]
    let cx = sx
    let cy = sy
    let ex = 0
    let ey = 0
    await dispatchPointer(card, 'pointerdown', { pointerId: 5, isPrimary: true, clientX: sx, clientY: sy })
    for (const [dx, dy] of moves) {
      cx += dx
      cy += dy
      ex += dx
      ey += dy
      await dispatchPointer(card, 'pointermove', { pointerId: 5, isPrimary: true, clientX: cx, clientY: cy })
      // After every single move the card must have followed (never frozen).
      const pos = await cardPos(card)
      expect(pos.x).toBeCloseTo(start.x + ex, 1)
      expect(pos.y).toBeCloseTo(start.y + ey, 1)
    }
    await dispatchPointer(card, 'pointerup', { pointerId: 5, isPrimary: true, clientX: cx, clientY: cy })
  })

  test('a second finger cannot hijack the drag', async ({ page }) => {
    const { card, x: sx, y: sy } = await cardCenter(page)
    const start = await cardPos(card)

    await dispatchPointer(card, 'pointerdown', { pointerId: 5, isPrimary: true, clientX: sx, clientY: sy })
    await dispatchPointer(card, 'pointermove', { pointerId: 5, isPrimary: true, clientX: sx + 40, clientY: sy })
    let pos = await cardPos(card)
    expect(pos.x).toBeCloseTo(start.x + 40, 1)

    // Second finger lands elsewhere: must not reset the grab offset.
    await dispatchPointer(card, 'pointerdown', { pointerId: 6, isPrimary: false, clientX: 100, clientY: 100 })
    // Second finger moves widely: the card must not follow it.
    await dispatchPointer(card, 'pointermove', { pointerId: 6, isPrimary: false, clientX: 300, clientY: 300 })
    pos = await cardPos(card)
    expect(pos.x).toBeCloseTo(start.x + 40, 1)
    expect(pos.y).toBeCloseTo(start.y, 1)

    // The primary finger still drives the drag.
    await dispatchPointer(card, 'pointermove', { pointerId: 5, isPrimary: true, clientX: sx + 80, clientY: sy })
    pos = await cardPos(card)
    expect(pos.x).toBeCloseTo(start.x + 80, 1)

    // Lifting the second finger does not end the drag.
    await dispatchPointer(card, 'pointerup', { pointerId: 6, isPrimary: false, clientX: 300, clientY: 300 })
    await dispatchPointer(card, 'pointermove', { pointerId: 5, isPrimary: true, clientX: sx + 100, clientY: sy })
    pos = await cardPos(card)
    expect(pos.x).toBeCloseTo(start.x + 100, 1)

    // Lifting the primary finger ends it.
    await dispatchPointer(card, 'pointerup', { pointerId: 5, isPrimary: true, clientX: sx + 100, clientY: sy })
    await dispatchPointer(card, 'pointermove', { pointerId: 5, isPrimary: true, clientX: sx + 200, clientY: sy })
    pos = await cardPos(card)
    expect(pos.x).toBeCloseTo(start.x + 100, 1)
  })
})
