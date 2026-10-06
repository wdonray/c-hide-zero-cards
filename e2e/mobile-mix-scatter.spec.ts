import { test, expect, type Page, type Locator } from '@playwright/test'

/**
 * Mix scatters cards across the full visible strip between the sticky
 * header (app header + toolbar + number input) and the footer (desktop) /
 * bottom action bar (mobile), full viewport width. Owner directive
 * 2026-10-05: the old dashed workspace box is gone, and Mix must use the
 * entire screen area, never hiding cards under the header, input, footer,
 * or action bar.
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

/**
 * The expected scatter region, measured from the same sticky chrome the
 * app measures: lowest visible bottom of header/toolbar/input to highest
 * visible top of footer/action bar, full viewport width.
 */
async function scatterRegion(page: Page): Promise<Box> {
  return page.evaluate(() => {
    const rectOf = (id: string): Box | null => {
      const el = document.getElementById(id)
      if (!el) return null
      const r = el.getBoundingClientRect()
      return r.width > 0 && r.height > 0 ? { x: r.x, y: r.y, width: r.width, height: r.height } : null
    }
    const tops = [rectOf('app-header'), rectOf('app-toolbar'), rectOf('number-input')].filter(
      (r): r is Box => r !== null
    )
    const bottoms = [rectOf('app-footer'), rectOf('mobile-action-bar')].filter((r): r is Box => r !== null)
    const y = Math.max(...tops.map((r) => r.y + r.height))
    const bottom = Math.min(...bottoms.map((r) => r.y))
    return { x: 0, y, width: window.innerWidth, height: bottom - y }
  })
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
    { label: 'number input', locator: page.getByPlaceholder('Type a number here!') },
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

  test('spreads mixed cards across the full header-to-action-bar strip', async ({ page }) => {
    await mix(page)
    const boxes = await cardBoxes(page, 6)
    const region = await scatterRegion(page)
    expect(region.height).toBeGreaterThan(300)

    for (const [i, box] of boxes.entries()) {
      expectInside(box, region, `card ${i}`)
    }

    // Well beyond the old dashed box: the cards use the full height of the
    // strip, spread out rather than one middle clump. (The exact min/max
    // positions depend on the Mix PRNG seed; the range assertion below is
    // the stable spread check.)
    const centers = boxes.map((b) => b.y + b.height / 2)
    expect(Math.max(...centers) - Math.min(...centers)).toBeGreaterThan(region.height * 0.4)
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

  test('the card area has no dashed border', async ({ page }) => {
    await page.getByPlaceholder('Type a number here!').fill('691193')
    await expect(cards(page)).toHaveCount(6)
    const borderStyle = await page
      .getByLabel('Place value cards workspace')
      .evaluate((el) => getComputedStyle(el).borderTopStyle)
    expect(borderStyle).not.toBe('dashed')
  })
})

test.describe('desktop mix scatter (1280px)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ page }) => {
    await seed(page)
    await page.goto('/')
  })

  test('mixed cards stay fully inside the header-to-footer strip', async ({ page }) => {
    await mix(page)
    const boxes = await cardBoxes(page, 6)
    const region = await scatterRegion(page)
    expect(region.height).toBeGreaterThan(300)
    expect(region.width).toBe(1280)
    for (const [i, box] of boxes.entries()) {
      expectInside(box, region, `card ${i}`)
    }

    // The strip is much taller than the removed dashed box: cards spread
    // across it instead of clustering.
    const centers = boxes.map((b) => b.y + b.height / 2)
    expect(Math.max(...centers) - Math.min(...centers)).toBeGreaterThan(region.height * 0.4)
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

  test('the card area has no dashed border', async ({ page }) => {
    await page.getByPlaceholder('Type a number here!').fill('691193')
    await expect(cards(page)).toHaveCount(6)
    const borderStyle = await page
      .getByLabel('Place value cards workspace')
      .evaluate((el) => getComputedStyle(el).borderTopStyle)
    expect(borderStyle).not.toBe('dashed')
  })
})
