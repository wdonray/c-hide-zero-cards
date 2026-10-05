import { test, expect } from '@playwright/test'

/**
 * Security headers: every response must carry the hardening headers
 * configured in next.config.ts (HSTS, CSP, frame denial, etc.).
 */
test.describe('security headers', () => {
  const expected = [
    'strict-transport-security',
    'x-content-type-options',
    'x-frame-options',
    'referrer-policy',
    'permissions-policy',
    'content-security-policy',
  ]

  test('/ serves security headers', async ({ page }) => {
    const response = await page.goto('/')
    expect(response).not.toBeNull()
    const headers = response!.headers()
    for (const name of expected) {
      expect(headers[name], `${name} on /`).toBeTruthy()
    }
    expect(headers['x-frame-options']).toBe('DENY')
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'")
    expect(headers['content-security-policy']).toContain("connect-src 'self'")
  })
})
