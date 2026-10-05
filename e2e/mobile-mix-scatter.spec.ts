import { test, expect, type Page, type Locator } from '@playwright/test'

/**
 * Mix scatters cards within the measured workspace rect (the flex-1 area
 * between the app header and the footer / mobile action bar), on any screen
 * size. Owner directive 2026-10-05: the old fixed offsets (±80px mobile,
 * ±400/±175 desktop) clustered cards in the middle of the screen instead of
 * using the available space.
 *
 * Clarification: mixed cards must never end up under the header, the bottom
 * action bar, or the footer — every card stays fully inside the workspace.
 */

interface Box {
  x: number
  y: number
  width: number
  height: number
}

async function seed(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('hzc-has-seen-welcome-dialog', 'true')
    localStorage.setItem('hzc-has-seen-first-time-toast', 'true')
  })
}

function cards(page: Page): Locator {
  return page.locator('div[role="application"] > div[tabindex="0"]')
}

async function cardBoxes(page: Page, count: number): Promise<Box[]> {
  const list = cards(page)
  await expect(list).toHaveCount(count)
  const boxes: Box[] = []
  for (let i = 0; i < count; i++) {
    const box = await list.nth(i).boundingBox()
    expect(box).not.toBeNull()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    boxes.push(box!)
  }
  return boxes
}

async function mix(page: Page) {
  await page.getByPlaceholder('Type a number here!').fill('691193')
  await expect(cards(page)).toHaveCount(6)
  await page.getByTitle('Randomize card position').click()
}

/** Every card fully inside the container (1px tolerance for subpixels). */
function expectInside(box: Box, container: Box, label: string) {
  expect(box.x, `${label} left`).toBeGreaterThanOrEqual(container.x - 1)
  expect(box.y, `${label} top`).toBeGreaterThanOrEqual(container.y - 1)
  expect(box.x + box.width, `${label} right`).toBeLessThanOrEqual(container.x + container.width + 1)
  expect(box.y + box.height, `${label} bottom`).toBeLessThanOrEqual(container.y + container.height + 1)
}

function intersects(a: Box, b: Box): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
}

/** Visible chrome rects a mixed card must never overlap. */
async function chromeBoxes(page: Page): Promise<{ label: string; box: Box }[]> {
  const out: { label: string; box: Box }[] = []
  const candidates: { label: string; locator: Locator }[] = [
    { label: 'header', locator: page.getByRole('banner') },
    { label: 'action bar', locator: page.getByLabel('Quick actions') },
    { label: 'footer', locator: page.getByRole('contentinfo') },
  ]
  for (const { label, locator } of candidates) {
    // boundingBox() throws on display:none elements, so gate on visibility.
    if (await locator.isVisible().catch(() => false)) {
      const box = await locator.boundingBox()
      if (box) out.push({ label, box })
    }
  }
  return out
}

test.describe('mobile mix scatter (375px)', () => {
  test.use({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true })

  test.beforeEach(async ({ page }) => {
    await seed(page)
    await page.goto('/')
  })

  test('spreads mixed cards across the whole workspace', async ({ page }) => {
    await mix(page)
    const boxes = await cardBoxes(page, 6)
    const workspace = await page.getByLabel('Place value cards workspace').boundingBox()
    expect(workspace).not.toBeNull()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const ws = workspace!

    for (const [i, box] of boxes.entries()) {
      expectInside(box, ws, `card ${i}`)
    }

    // Well beyond the old ±80px cluster (which spanned ~155px tall): the
    // cards use the full height of the workspace...
    const top = Math.min(...boxes.map((b) => b.y))
    const bottom = Math.max(...boxes.map((b) => b.y + b.height))
    expect(bottom - top).toBeGreaterThan(250)
    // ...with cards in the top and bottom thirds, not one middle clump.
    const centers = boxes.map((b) => b.y + b.height / 2)
    expect(Math.min(...centers)).toBeLessThan(ws.y + ws.height / 3)
    expect(Math.max(...centers)).toBeGreaterThan(ws.y + (ws.height * 2) / 3)
  })

  test('no mixed card overlaps the header, action bar, or footer', async ({ page }) => {
    await mix(page)
    const boxes = await cardBoxes(page, 6)
    const chrome = await chromeBoxes(page)
    expect(chrome.length).toBeGreaterThan(0)
    for (const { label, box: chromeBox } of chrome) {
      for (const [i, box] of boxes.entries()) {
        expect(intersects(box, chromeBox), `card ${i} overlaps the ${label}`).toBe(false)
      }
    }
  })
})

test.describe('desktop mix scatter (1280px)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ page }) => {
    await seed(page)
    await page.goto('/')
  })

  test('mixed cards stay fully inside the workspace', async ({ page }) => {
    await mix(page)
    const boxes = await cardBoxes(page, 6)
    const workspace = await page.getByLabel('Place value cards workspace').boundingBox()
    expect(workspace).not.toBeNull()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const ws = workspace!
    for (const [i, box] of boxes.entries()) {
      expectInside(box, ws, `card ${i}`)
    }
  })

  test('no mixed card overlaps the header or footer', async ({ page }) => {
    await mix(page)
    const boxes = await cardBoxes(page, 6)
    const chrome = await chromeBoxes(page)
    expect(chrome.length).toBeGreaterThan(0)
    for (const { label, box: chromeBox } of chrome) {
      for (const [i, box] of boxes.entries()) {
        expect(intersects(box, chromeBox), `card ${i} overlaps the ${label}`).toBe(false)
      }
    }
  })
})
