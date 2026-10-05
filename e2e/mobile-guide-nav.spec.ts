import { test, expect, type Page, type Locator } from '@playwright/test'

/**
 * Teacher's Guide dialog navigation redesign (owner directive 2026-10-05):
 * on mobile (<768px) the horizontally-scrolling tab row is replaced by a
 * single vertically-scrolling view with all four guide sections as stacked
 * labeled sections. Desktop keeps the tabbed layout. Same pattern as the
 * Number Forms dialog redesign (PR #39).
 */

async function seedAndGoto(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('hzc-has-seen-welcome-dialog', 'true')
    localStorage.setItem('hzc-has-seen-first-time-toast', 'true')
  })
  await page.goto('/')
}

const SECTION_LABELS = ['Quick Start', 'Toolbar Features', 'Activities', 'Assessment'] as const

test.describe('mobile stacked sections', () => {
  test.use({
    viewport: { width: 375, height: 667 },
    hasTouch: true,
    isMobile: true,
  })

  test.beforeEach(async ({ page }) => {
    await seedAndGoto(page)
  })

  async function openGuide(page: Page): Promise<Locator> {
    await page.getByRole('button', { name: 'More actions' }).click()
    const sheet = page.getByRole('dialog', { name: 'More actions' })
    await sheet.getByTitle('Instructional Teachers Guide for Hide Zero Cards', { exact: true }).click()
    const dialog = page.getByRole('dialog', { name: "Hide Zero Cards - Teacher's Guide" })
    await expect(dialog).toBeVisible()
    return dialog
  }

  test('renders no tab row and no doubled headings; sections labeled in order', async ({ page }) => {
    const dialog = await openGuide(page)
    await expect(dialog.getByRole('tablist')).toHaveCount(0)
    await expect(dialog.getByRole('tab')).toHaveCount(0)

    // No redundant outer headings: each section component renders its own
    // descriptive h3, and the section stays labeled in the a11y tree.
    for (const label of SECTION_LABELS) {
      await expect(dialog.getByRole('heading', { name: label, exact: true })).toHaveCount(0)
      await expect(dialog.getByRole('region', { name: label })).toBeVisible()
    }

    const contentHeadings = [
      'Quick Start (2 minutes)',
      'Toolbar Features Guide',
      'Interactive Learning Activities',
      'Assessment & Learning Checks',
    ]
    for (const name of contentHeadings) {
      await expect(dialog.getByRole('heading', { name })).toBeVisible()
    }

    const order = await dialog
      .getByRole('heading', { level: 3 })
      .evaluateAll((els) => els.map((el) => el.textContent?.trim() ?? ''))
    const indices = contentHeadings.map((name) => order.indexOf(name))
    expect(indices.every((i) => i >= 0)).toBe(true)
    expect([...indices].sort((a, b) => a - b)).toEqual(indices)
  })

  test('each section renders its guide content', async ({ page }) => {
    const dialog = await openGuide(page)
    await expect(dialog.getByRole('heading', { name: 'Quick Start (2 minutes)' })).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Toolbar Features Guide' })).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Interactive Learning Activities' })).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Assessment & Learning Checks' })).toBeVisible()
  })

  test('sections are reachable by vertical scroll with no horizontal overflow', async ({ page }) => {
    const dialog = await openGuide(page)
    const lastSection = dialog.getByRole('region', { name: 'Assessment' })
    await lastSection.scrollIntoViewIfNeeded()
    await expect(dialog.getByRole('heading', { name: 'Assessment & Learning Checks' })).toBeVisible()

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    )
    expect(overflow).toBeLessThanOrEqual(1)
  })

  test('footer close action still works with the stacked layout', async ({ page }) => {
    const dialog = await openGuide(page)
    await dialog.getByRole('button', { name: "Let's Start Teaching!" }).click()
    await expect(dialog).toBeHidden()
  })
})

test.describe('desktop tabs unchanged', () => {
  test.use({
    viewport: { width: 1280, height: 800 },
  })

  test.beforeEach(async ({ page }) => {
    await seedAndGoto(page)
  })

  test('tab row still works on desktop', async ({ page }) => {
    await page.getByRole('button', { name: 'How to Use' }).click()
    const dialog = page.getByRole('dialog', { name: "Hide Zero Cards - Teacher's Guide" })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('tablist')).toHaveCount(1)
    // No stacked section headings on desktop.
    await expect(dialog.getByRole('heading', { name: 'Quick Start', exact: true })).toHaveCount(0)

    await expect(dialog.getByRole('heading', { name: 'Quick Start (2 minutes)' })).toBeVisible()
    await dialog.getByRole('tab', { name: 'Toolbar Features' }).click()
    await expect(dialog.getByRole('heading', { name: 'Toolbar Features Guide' })).toBeVisible()
    await dialog.getByRole('tab', { name: 'Assessment' }).click()
    await expect(dialog.getByRole('heading', { name: 'Assessment & Learning Checks' })).toBeVisible()
  })
})
