import { test, expect } from '@playwright/test'

test.describe('first visit', () => {
  test('shows the welcome dialog and dismisses it', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Welcome to Hide Zero Cards!' })).toBeVisible()
    await page.getByRole('button', { name: "Let's Get Started!" }).click()
    await expect(page.getByRole('heading', { name: 'Welcome to Hide Zero Cards!' })).toBeHidden()
  })

  test('shows the first-time toast after the first number', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: "Let's Get Started!" }).click()

    await page.getByPlaceholder('Type a number here!').fill('42')

    await expect(page.getByText('Great job! You made your first number!')).toBeVisible()
  })
})

test.describe('number input and cards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: "Let's Get Started!" }).click()
  })

  test('renders one card per digit with place values', async ({ page }) => {
    const input = page.getByPlaceholder('Type a number here!')
    await input.fill('1023')

    const cards = page.getByRole('application', { name: 'Draggable place value cards' })
    await expect(cards.getByText('1,000', { exact: true })).toBeVisible()
    await expect(cards.getByText('000', { exact: true })).toBeVisible()
    await expect(cards.getByText('20', { exact: true })).toBeVisible()
    await expect(cards.getByText('3', { exact: true })).toBeVisible()
    await expect(cards.locator(':scope > div')).toHaveCount(4)
  })

  test('shows the empty state before any number is entered', async ({ page }) => {
    await expect(page.getByText('Type a number above to see your cards!')).toBeVisible()
  })

  test('hides and shows zero cards', async ({ page }) => {
    const input = page.getByPlaceholder('Type a number here!')
    await input.fill('1023')

    const cards = page.getByRole('application', { name: 'Draggable place value cards' })
    await expect(cards.locator(':scope > div')).toHaveCount(4)

    await page.getByTitle('Hide zero cards', { exact: true }).click()
    await expect(cards.getByText('000', { exact: true })).toBeHidden()
    await expect(cards.locator(':scope > div')).toHaveCount(3)

    await page.getByTitle('Show zero cards', { exact: true }).click()
    await expect(cards.getByText('000', { exact: true })).toBeVisible()
    await expect(cards.locator(':scope > div')).toHaveCount(4)
  })
})

test.describe('toolbar actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: "Let's Get Started!" }).click()
    await page.getByPlaceholder('Type a number here!').fill('1234')
  })

  test('mixes and resets card positions', async ({ page }) => {
    const cards = page.getByRole('application', { name: 'Draggable place value cards' })
    const cardDivs = cards.locator(':scope > div')
    await expect(cardDivs).toHaveCount(4)
    const initialTransforms = await cardDivs.evaluateAll((els) => els.map((el) => (el as HTMLElement).style.transform))

    const resetButton = page.getByTitle('Reset cards to original position', { exact: true })
    await expect(resetButton).toBeDisabled()

    await page.getByTitle('Randomize card position', { exact: true }).click()
    await expect(resetButton).toBeEnabled()

    const mixedTransforms = await cardDivs.evaluateAll((els) => els.map((el) => (el as HTMLElement).style.transform))
    expect(mixedTransforms.some((t, i) => t !== initialTransforms[i])).toBe(true)

    await resetButton.click()
    const resetTransforms = await cardDivs.evaluateAll((els) => els.map((el) => (el as HTMLElement).style.transform))
    expect(resetTransforms).toEqual(initialTransforms)
    await expect(resetButton).toBeDisabled()
  })

  test('clears the input and the cards', async ({ page }) => {
    await page.getByTitle('Clear input number and reset cards', { exact: true }).click()

    await expect(page.getByPlaceholder('Type a number here!')).toHaveValue('')
    await expect(page.getByText('Type a number above to see your cards!')).toBeVisible()
  })
})

test.describe('roll and random range', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: "Let's Get Started!" }).click()
  })

  test('rolls a random number and shows its cards', async ({ page }) => {
    const input = page.getByPlaceholder('Type a number here!')
    await page.getByRole('button', { name: 'Roll' }).click()

    await expect(input).not.toHaveValue('')
    const cards = page.getByRole('application', { name: 'Draggable place value cards' })
    await expect(cards.locator(':scope > div').first()).toBeVisible()
  })

  test('limits rolls to the selected range', async ({ page }) => {
    const input = page.getByPlaceholder('Type a number here!')

    await page.getByTitle('Set random number range', { exact: true }).click()
    await page.getByRole('button', { name: '100', exact: true }).click()
    await page.keyboard.press('Escape')

    await page.getByRole('button', { name: 'Roll' }).click()
    await expect(input).not.toHaveValue('')

    const value = Number((await input.inputValue()).replace(/[^\d]/g, ''))
    expect(value).toBeGreaterThanOrEqual(1)
    expect(value).toBeLessThanOrEqual(100)
  })

  test('zero focus rolls keep producing numbers containing a zero', async ({ page }) => {
    const input = page.getByPlaceholder('Type a number here!')

    await page.getByTitle('Set random number range', { exact: true }).click()
    await page.getByLabel('Zero focus').click()
    await page.keyboard.press('Escape')

    await page.getByRole('button', { name: 'Roll' }).click()
    await expect(input).not.toHaveValue('')

    expect(await input.inputValue()).toContain('0')
  })
})

test.describe('number forms dialog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: "Let's Get Started!" }).click()
    await page.getByPlaceholder('Type a number here!').fill('1234')
    await page.getByRole('button', { name: 'Number Forms' }).click()
  })

  test('shows all four representations', async ({ page }) => {
    const dialog = page.getByRole('dialog', { name: 'Number Forms & Representations' })
    await expect(dialog).toBeVisible()

    // Word form is the default tab.
    await expect(dialog.getByText('one thousand two hundred thirty-four')).toBeVisible()

    await dialog.getByRole('tab', { name: 'Expanded Form' }).click()
    await expect(dialog.getByText('1,000 + 200 + 30 + 4')).toBeVisible()

    await dialog.getByRole('tab', { name: 'Unit Form' }).click()
    await expect(dialog.getByText('1 thousand , 2 hundreds , 3 tens , 4 ones')).toBeVisible()

    await dialog.getByRole('tab', { name: 'Standard Form' }).click()
    await expect(dialog.getByText('1,234')).toBeVisible()
  })

  test('reveal cards shifts the dialog aside', async ({ page }) => {
    const dialog = page.getByRole('dialog', { name: 'Number Forms & Representations' })

    await dialog.getByRole('button', { name: 'Reveal cards' }).click()
    await expect(dialog.getByRole('button', { name: 'Hide cards' })).toBeVisible()

    await dialog.getByRole('button', { name: 'Hide cards' }).click()
    await expect(dialog.getByRole('button', { name: 'Reveal cards' })).toBeVisible()
  })
})

test.describe("teacher's guide", () => {
  test('opens the guide and switches tabs', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: "Let's Get Started!" }).click()

    await page.getByRole('button', { name: 'How to Use' }).click()
    const dialog = page.getByRole('dialog', { name: "Hide Zero Cards - Teacher's Guide" })
    await expect(dialog).toBeVisible()

    for (const tab of ['Quick Start', 'Toolbar Features', 'Activities', 'Assessment']) {
      await dialog.getByRole('tab', { name: tab }).click()
      await expect(dialog.getByRole('tab', { name: tab })).toHaveAttribute('aria-selected', 'true')
    }
  })
})

test.describe('theme toggle', () => {
  test('switches between light and dark mode', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: "Let's Get Started!" }).click()

    const html = page.locator('html')
    await page.getByTitle('Toggle light/dark mode', { exact: true }).click()
    await page.getByRole('menuitem', { name: 'Dark' }).click()
    await expect(html).toHaveClass(/dark/)
    // Wait for the menu's close animation before reopening it.
    await expect(page.getByRole('menu')).toBeHidden()

    await page.getByTitle('Toggle light/dark mode', { exact: true }).click()
    await page.getByRole('menuitem', { name: 'Light' }).click()
    await expect(html).toHaveClass(/light/)
  })
})
