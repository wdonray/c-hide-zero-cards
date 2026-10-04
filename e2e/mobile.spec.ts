import { test, expect } from '@playwright/test'

test.use({ viewport: { width: 375, height: 667 } })

test.describe('mobile warning', () => {
  test('shows the not-optimized dialog on narrow screens', async ({ page }) => {
    // Suppress the welcome dialog so the mobile alert is the only modal open.
    // (With both open, Radix hides each from the accessibility tree.)
    await page.addInitScript(() => {
      localStorage.setItem('hzc-has-seen-welcome-dialog', 'true')
    })
    await page.goto('/')

    const alert = page.getByRole('alertdialog')
    await expect(alert.getByText('App Not Optimized for Mobile')).toBeVisible()

    await alert.getByRole('button', { name: 'Got it' }).click()
    await expect(alert).toBeHidden()
  })
})
