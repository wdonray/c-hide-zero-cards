import { test, expect, type Page } from '@playwright/test'

/**
 * Mobile-viewport coverage (375x667, touch enabled): the same core flows as
 * the desktop suite, exercised the way a phone user experiences them.
 *
 * The "App Not Optimized for Mobile" dialog was removed as part of the
 * responsive work, so these tests assert the app itself is fully usable at
 * this viewport instead of asserting the warning appears.
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

/** Real touch drag via CDP: generates touch pointer events, not mouse events. */
async function touchDrag(page: Page, fromX: number, fromY: number, toX: number, toY: number) {
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: fromX, y: fromY, id: 1 }],
  })
  const steps = 8
  for (let i = 1; i <= steps; i++) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: fromX + ((toX - fromX) * i) / steps, y: fromY + ((toY - fromY) * i) / steps, id: 1 }],
    })
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}

test.describe('mobile core flows', () => {
  test('enters a number via the mobile-friendly input and generates cards', async ({ page }) => {
    const input = page.getByPlaceholder('Type a number here!')

    // Mobile keyboard hints: numeric keypad with a Done key. The 1..1B
    // range and comma formatting behavior are unchanged.
    await expect(input).toHaveAttribute('inputmode', 'numeric')
    await expect(input).toHaveAttribute('pattern', '[0-9]*')
    await expect(input).toHaveAttribute('enterkeyhint', 'done')

    await input.fill('1023')
    await expect(input).toHaveValue('1,023')

    const cards = page.getByRole('application', { name: 'Draggable place value cards' })
    await expect(cards.getByText('1,000', { exact: true })).toBeVisible()
    await expect(cards.getByText('000', { exact: true })).toBeVisible()
    await expect(cards.getByText('20', { exact: true })).toBeVisible()
    await expect(cards.getByText('3', { exact: true })).toBeVisible()
    await expect(cards.locator(':scope > div')).toHaveCount(4)
  })

  test('drags a card with touch without scrolling the page', async ({ page }) => {
    await page.getByPlaceholder('Type a number here!').fill('1234')

    const cards = page.getByRole('application', { name: 'Draggable place value cards' })
    const firstCard = cards.locator(':scope > div').first()
    await expect(firstCard).toBeVisible()

    const box = await firstCard.boundingBox()
    expect(box).not.toBeNull()
    const startX = box!.x + box!.width / 2
    const startY = box!.y + box!.height / 2
    const initialTransform = await firstCard.evaluate((el) => (el as HTMLElement).style.transform)

    await touchDrag(page, startX, startY, startX + 60, startY + 40)

    // The card followed the finger (touch-action: none lets the pointer
    // events through instead of scrolling).
    await expect.poll(() => firstCard.evaluate((el) => (el as HTMLElement).style.transform)).not.toBe(initialTransform)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
  })

  test('hides and shows zero cards', async ({ page }) => {
    await page.getByPlaceholder('Type a number here!').fill('1023')

    const cards = page.getByRole('application', { name: 'Draggable place value cards' })
    await expect(cards.locator(':scope > div')).toHaveCount(4)

    await page.getByTitle('Hide zero cards', { exact: true }).click()
    await expect(cards.getByText('000', { exact: true })).toBeHidden()
    await expect(cards.locator(':scope > div')).toHaveCount(3)

    await page.getByTitle('Show zero cards', { exact: true }).click()
    await expect(cards.getByText('000', { exact: true })).toBeVisible()
    await expect(cards.locator(':scope > div')).toHaveCount(4)
  })

  test('rolls a random number and shows its cards', async ({ page }) => {
    const input = page.getByPlaceholder('Type a number here!')
    await page.getByRole('button', { name: 'Roll a random number' }).click()

    await expect(input).not.toHaveValue('')
    const cards = page.getByRole('application', { name: 'Draggable place value cards' })
    await expect(cards.locator(':scope > div').first()).toBeVisible()
  })

  test('sets the random range from the mobile range popover', async ({ page }) => {
    const input = page.getByPlaceholder('Type a number here!')

    // The range control used to be desktop-only; it is reachable on mobile now.
    await page.getByTitle('Set random number range', { exact: true }).click()
    await expect(page.getByText('Random Number Range')).toBeVisible()
    await page.getByRole('button', { name: '100', exact: true }).click()
    await page.keyboard.press('Escape')

    await page.getByRole('button', { name: 'Roll a random number' }).click()
    await expect(input).not.toHaveValue('')

    const value = Number((await input.inputValue()).replace(/[^\d]/g, ''))
    expect(value).toBeGreaterThanOrEqual(1)
    expect(value).toBeLessThanOrEqual(100)
  })

  test('mixes and resets card positions', async ({ page }) => {
    await page.getByPlaceholder('Type a number here!').fill('1234')

    const cards = page.getByRole('application', { name: 'Draggable place value cards' })
    const cardDivs = cards.locator(':scope > div')
    await expect(cardDivs).toHaveCount(4)
    const initialTransforms = await cardDivs.evaluateAll((els) => els.map((el) => (el as HTMLElement).style.transform))

    const resetButton = page.getByTitle('Reset cards to original position', { exact: true })
    await expect(resetButton).toBeDisabled()

    await page.getByTitle('Randomize card position', { exact: true }).click()
    await expect(resetButton).toBeEnabled()

    await expect
      .poll(async () => {
        const t = await cardDivs.evaluateAll((els) => els.map((el) => (el as HTMLElement).style.transform))
        return t.some((x, i) => x !== initialTransforms[i])
      })
      .toBe(true)

    await resetButton.click()
    await expect
      .poll(async () => {
        const t = await cardDivs.evaluateAll((els) => els.map((el) => (el as HTMLElement).style.transform))
        return t.every((x, i) => x === initialTransforms[i])
      })
      .toBe(true)
    await expect(resetButton).toBeDisabled()
  })

  test('clears the input and the cards', async ({ page }) => {
    await page.getByPlaceholder('Type a number here!').fill('1234')
    await page.getByTitle('Clear input number and reset cards', { exact: true }).click()

    await expect(page.getByPlaceholder('Type a number here!')).toHaveValue('')
    await expect(page.getByText('Type a number above to see your cards!')).toBeVisible()
  })

  test('opens number forms and switches tabs', async ({ page }) => {
    await page.getByPlaceholder('Type a number here!').fill('1234')
    await page.getByTitle(/Number Forms/, { exact: false }).click()

    const dialog = page.getByRole('dialog', { name: 'Number Forms & Representations' })
    await expect(dialog).toBeVisible()

    await expect(dialog.getByText('one thousand two hundred thirty-four')).toBeVisible()

    await dialog.getByRole('tab', { name: 'Expanded Form' }).click()
    await expect(dialog.getByText('1,000 + 200 + 30 + 4')).toBeVisible()

    await dialog.getByRole('tab', { name: 'Standard Form' }).click()
    await expect(dialog.getByText('1,234')).toBeVisible()
  })

  test("opens the teacher's guide and switches tabs", async ({ page }) => {
    await page.getByTitle('Instructional Teachers Guide for Hide Zero Cards', { exact: true }).click()

    const dialog = page.getByRole('dialog', { name: "Hide Zero Cards - Teacher's Guide" })
    await expect(dialog).toBeVisible()

    for (const tab of ['Quick Start', 'Toolbar Features', 'Activities', 'Assessment']) {
      await dialog.getByRole('tab', { name: tab }).click()
      await expect(dialog.getByRole('tab', { name: tab })).toHaveAttribute('aria-selected', 'true')
    }
  })
})

test.describe('mobile layout', () => {
  test('shows no mobile warning dialog; the app is directly usable', async ({ page }) => {
    await expect(page.getByRole('alertdialog')).toHaveCount(0)
    await expect(page.getByPlaceholder('Type a number here!')).toBeEnabled()
  })

  test('has no horizontal overflow with the widest supported number', async ({ page }) => {
    await page.getByPlaceholder('Type a number here!').fill('1000000000')
    const cards = page.getByRole('application', { name: 'Draggable place value cards' })
    await expect(cards.locator(':scope > div')).toHaveCount(10)

    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }))
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.innerWidth)

    // Every card is fully inside the viewport.
    const boxes = await cards.locator(':scope > div').evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect()
        return { left: r.left, right: r.right }
      })
    )
    for (const b of boxes) {
      expect(b.left).toBeGreaterThanOrEqual(0)
      expect(b.right).toBeLessThanOrEqual(overflow.innerWidth)
    }
  })

  test('toolbar buttons meet the 44px touch target on coarse pointers', async ({ page }) => {
    expect(await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches)).toBe(true)

    const buttons = [
      page.getByRole('button', { name: 'Roll a random number' }),
      page.getByTitle('Set random number range', { exact: true }),
      page.getByTitle('Clear input number and reset cards', { exact: true }),
      page.getByTitle('Instructional Teachers Guide for Hide Zero Cards', { exact: true }),
      page.getByTitle('Toggle light/dark mode', { exact: true }),
    ]
    for (const button of buttons) {
      const box = await button.boundingBox()
      const title = await button.evaluate((el) => el.getAttribute('title'))
      expect(box, `button "${title}" should have a bounding box`).not.toBeNull()
      expect(box!.width, `button "${title}" width`).toBeGreaterThanOrEqual(44)
      expect(box!.height, `button "${title}" height`).toBeGreaterThanOrEqual(44)
    }
  })
})
