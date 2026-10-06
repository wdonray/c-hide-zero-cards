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
    await expect(cards.getByText('0', { exact: true })).toBeVisible()
    await expect(cards.getByText('20', { exact: true })).toBeVisible()
    await expect(cards.getByText('3', { exact: true })).toBeVisible()
    await expect(cards.locator(':scope > div')).toHaveCount(4)
  })

  test('drags a card with touch without scrolling the page', async ({ page }) => {
    await page.getByPlaceholder('Type a number here!').fill('1234')

    const cards = page.getByRole('application', { name: 'Draggable place value cards' })
    // The last card sits on top of the fan: its center is never covered by
    // the cascading overlap, so the touch reliably hits it.
    const lastCard = cards.locator(':scope > div').last()
    await expect(lastCard).toBeVisible()

    const box = await lastCard.boundingBox()
    expect(box).not.toBeNull()
    const startX = box!.x + box!.width / 2
    const startY = box!.y + box!.height / 2
    const initialTransform = await lastCard.evaluate((el) => (el as HTMLElement).style.transform)

    await touchDrag(page, startX, startY, startX + 60, startY + 40)

    // The card followed the finger (touch-action: none lets the pointer
    // events through instead of scrolling).
    await expect.poll(() => lastCard.evaluate((el) => (el as HTMLElement).style.transform)).not.toBe(initialTransform)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
  })

  test('hides and shows zero cards', async ({ page }) => {
    await page.getByPlaceholder('Type a number here!').fill('1023')

    const cards = page.getByRole('application', { name: 'Draggable place value cards' })
    await expect(cards.locator(':scope > div')).toHaveCount(4)

    // Hiding blanks the zero card in place (visibility:hidden keeps its
    // position and size); the card is never removed, so the count stays 4.
    await page.getByTitle('Hide zero cards', { exact: true }).click()
    await expect(cards.getByText('0', { exact: true })).toBeHidden()
    await expect(cards.locator(':scope > div')).toHaveCount(4)

    await page.getByTitle('Show zero cards', { exact: true }).click()
    await expect(cards.getByText('0', { exact: true })).toBeVisible()
    await expect(cards.locator(':scope > div')).toHaveCount(4)
  })

  test('rolls a random number and shows its cards', async ({ page }) => {
    const input = page.getByPlaceholder('Type a number here!')
    await page.getByRole('button', { name: 'Roll a random number' }).click()

    await expect(input).not.toHaveValue('')
    const cards = page.getByRole('application', { name: 'Draggable place value cards' })
    await expect(cards.locator(':scope > div').first()).toBeVisible()
  })

  test('sets the random range from the More menu', async ({ page }) => {
    const input = page.getByPlaceholder('Type a number here!')
    const rollButton = page.getByRole('button', { name: 'Roll a random number' })

    // Range settings live in the More sheet on mobile now.
    await page.getByRole('button', { name: 'More actions' }).click()
    const sheet = page.getByRole('dialog', { name: 'More actions' })
    await expect(sheet).toBeVisible()

    await sheet.getByTitle('Set random number range', { exact: true }).click()
    await expect(sheet.getByRole('button', { name: 'Up to 100', exact: true })).toBeVisible()
    await sheet.getByRole('button', { name: 'Up to 100', exact: true }).click()
    // Selecting a range collapses the inline mobile list.
    await expect(sheet.getByRole('button', { name: 'Up to 100', exact: true })).toBeHidden()
    await sheet.getByRole('button', { name: 'Close' }).click()
    await expect(sheet).toBeHidden()

    await rollButton.click()
    // Wait for the dice-roll animation to finish.
    await expect(rollButton).toBeEnabled({ timeout: 5000 })

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
    await expect(page.getByText('Type a number above to see your cards!')).toHaveCount(0)
  })

  test('opens number forms showing all forms as stacked sections', async ({ page }) => {
    await page.getByPlaceholder('Type a number here!').fill('1234')
    await page.getByTitle(/Number Forms/, { exact: false }).click()

    const dialog = page.getByRole('dialog', { name: /Number Forms/ })
    await expect(dialog).toBeVisible()

    // Mobile shows stacked sections, not tabs.
    await expect(dialog.getByRole('tablist')).toHaveCount(0)
    for (const name of ['Word Form', 'Unit Form', 'Expanded Form', 'Standard Form']) {
      await expect(dialog.getByRole('heading', { name })).toBeVisible()
    }

    await expect(dialog.getByText('one thousand two hundred thirty-four')).toBeVisible()
    await expect(dialog.getByText('1,000 + 200 + 30 + 4')).toBeVisible()
    await expect(dialog.getByText('1,234')).toBeVisible()
  })

  test("opens the teacher's guide from the More menu with all sections stacked", async ({ page }) => {
    await page.getByRole('button', { name: 'More actions' }).click()
    const sheet = page.getByRole('dialog', { name: 'More actions' })
    await sheet.getByTitle('Instructional Teachers Guide for Hide Zero Cards', { exact: true }).click()

    const dialog = page.getByRole('dialog', { name: "Hide Zero Cards - Teacher's Guide" })
    await expect(dialog).toBeVisible()

    // Mobile renders every section as a stacked, vertically-scrolling block —
    // no tab row, no doubled headings: each section is a labeled region whose
    // visible heading is the content's own title.
    await expect(dialog.getByRole('tablist')).toHaveCount(0)
    for (const label of ['Quick Start', 'Toolbar Features', 'Activities', 'Assessment']) {
      await expect(dialog.getByRole('heading', { name: label, exact: true })).toHaveCount(0)
      await expect(dialog.getByRole('region', { name: label })).toBeVisible()
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

    // Every card is fully inside the viewport. Poll because mobile browsers
    // can report transient viewport widths during chrome show/hide; the
    // dynamic sizing settles once the viewport stabilizes.
    await expect
      .poll(async () => {
        const boxes = await cards.locator(':scope > div').evaluateAll((els) =>
          els.map((el) => {
            const r = el.getBoundingClientRect()
            return { left: r.left, right: r.right }
          })
        )
        const vw = await page.evaluate(() => window.innerWidth)
        return boxes.every((b) => b.left >= -1 && b.right <= vw + 1)
      })
      .toBe(true)
  })

  test('bottom bar buttons meet the 44px touch target on coarse pointers', async ({ page }) => {
    expect(await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches)).toBe(true)

    // The seven bottom-bar actions: icon + text label, each 60px tall.
    const bar = page.getByRole('navigation', { name: 'Quick actions' })
    const buttons = [
      bar.getByRole('button', { name: 'Roll a random number' }),
      bar.getByRole('button', { name: 'Hide zero cards' }),
      bar.getByRole('button', { name: 'Randomize card position' }),
      bar.getByRole('button', { name: 'Reset cards to original position' }),
      bar.getByRole('button', { name: 'Clear input number and reset cards' }),
      bar.getByRole('button', { name: 'Number Forms' }),
      bar.getByRole('button', { name: 'More actions' }),
    ]
    for (const button of buttons) {
      const box = await button.boundingBox()
      const name = await button.evaluate((el) => el.getAttribute('aria-label'))
      expect(box, `button "${name}" should have a bounding box`).not.toBeNull()
      expect(box!.width, `button "${name}" width`).toBeGreaterThanOrEqual(44)
      expect(box!.height, `button "${name}" height`).toBeGreaterThanOrEqual(44)
    }

    // The More sheet rows (guide, theme) reuse the desktop triggers, and the
    // range row uses the mobile inline control; all carry the coarse-pointer
    // 44px minimum.
    await bar.getByRole('button', { name: 'More actions' }).click()
    const sheet = page.getByRole('dialog', { name: 'More actions' })
    await expect(sheet).toBeVisible()
    // Let the bottom-sheet slide-in animation finish so measurements are steady.
    await (await sheet.elementHandle())?.waitForElementState('stable')
    const sheetButtons = [
      sheet.getByTitle('Set random number range', { exact: true }),
      sheet.getByTitle('Instructional Teachers Guide for Hide Zero Cards', { exact: true }),
      sheet.getByTitle('Toggle light/dark mode', { exact: true }),
    ]
    for (const button of sheetButtons) {
      const box = await button.boundingBox()
      const title = await button.evaluate((el) => el.getAttribute('title'))
      expect(box, `button "${title}" should have a bounding box`).not.toBeNull()
      expect(box!.width, `button "${title}" width`).toBeGreaterThanOrEqual(44)
      expect(box!.height, `button "${title}" height`).toBeGreaterThanOrEqual(44)
    }
  })

  test('bottom action bar replaces the top toolbar: labeled actions, single instance of each control', async ({
    page,
  }) => {
    const bar = page.getByRole('navigation', { name: 'Quick actions' })
    await expect(bar).toBeVisible()

    // Every action carries a visible text label (no hover tooltips on touch).
    for (const label of ['Roll', 'Zero', 'Mix', 'Reset', 'Clear', 'Forms', 'More']) {
      await expect(bar.getByText(label, { exact: true })).toBeVisible()
    }

    // The desktop toolbar is unmounted on mobile, so each control exists once.
    await expect(page.getByRole('button', { name: 'Roll a random number' })).toHaveCount(1)
    await expect(page.getByTitle('Hide zero cards', { exact: true })).toHaveCount(1)
  })

  test('cards are the hero: bigger for fewer digits, vertically centered in the workspace', async ({ page }) => {
    const input = page.getByPlaceholder('Type a number here!')
    const cards = page.getByRole('application', { name: 'Draggable place value cards' })

    await input.fill('123')
    const fewDigitFont = await cards
      .locator(':scope > div')
      .first()
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize))

    await input.fill('1000000000')
    const manyDigitFont = await cards
      .locator(':scope > div')
      .first()
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize))

    // Adaptive sizing: fewer digits means bigger cards, far above the old
    // fixed 18px mobile size.
    expect(fewDigitFont).toBeGreaterThan(manyDigitFont)
    expect(fewDigitFont).toBeGreaterThan(30)

    // The fan sits in the vertical middle of the workspace, not the top.
    await input.fill('1234')
    const workspaceBox = await page.getByRole('main', { name: 'Place value cards workspace' }).boundingBox()
    expect(workspaceBox).not.toBeNull()
    const cardBoxes = await cards.locator(':scope > div').evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect()
        return { top: r.top, bottom: r.bottom }
      })
    )
    const fanCenter = (Math.min(...cardBoxes.map((b) => b.top)) + Math.max(...cardBoxes.map((b) => b.bottom))) / 2
    const workspaceCenter = workspaceBox!.y + workspaceBox!.height / 2
    expect(Math.abs(fanCenter - workspaceCenter)).toBeLessThan(60)
  })

  test('More menu holds secondary actions and links to the version page', async ({ page }) => {
    await page.getByRole('button', { name: 'More actions' }).click()
    const sheet = page.getByRole('dialog', { name: 'More actions' })
    await expect(sheet).toBeVisible()

    await expect(sheet.getByText('Random number range')).toBeVisible()
    await expect(sheet.getByText("Teacher's guide")).toBeVisible()
    await expect(sheet.getByText('Theme', { exact: true })).toBeVisible()
    await expect(sheet.getByText('App version')).toBeVisible()

    // Escape closes the sheet (focus management comes from Radix Dialog).
    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()

    // The version page is one tap away: nobody scrolls to footers on phones.
    // (The version page's own rendering is covered by e2e/a11y.spec.ts.)
    await page.getByRole('button', { name: 'More actions' }).click()
    await sheet.getByTitle('App version and release history').click()
    await expect(page).toHaveURL(/\/version$/)
  })
})
