import { test, expect } from '@playwright/test'

test.describe('RBAC guard', () => {
  test('redirects to /403 when non-admin visits /admin', async ({ page }) => {
    await page.goto('/login')

    // Fake JWT: roles = ['USER'] (no ADMIN), exp 1h ahead
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
    const payload = Buffer.from(
      JSON.stringify({ sub: 'e2e', roles: ['USER'], exp: Math.floor(Date.now() / 1000) + 3600 }),
    ).toString('base64url')
    const fakeJwt = `${header}.${payload}.`

    await page.evaluate((token) => {
      // @ts-expect-error dev helper from AuthProvider in dev
      window.__setAccessToken?.(token)
    }, fakeJwt)

    // Wait until token registered in context
    await page.waitForFunction(() => (window as unknown as { __hasToken?: boolean }).__hasToken === true)

    // Client-side navigate to /admin (avoid full reload)
    await page.evaluate(() => {
      history.pushState({}, '', '/admin')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    await expect(page).toHaveURL('/403')
    await expect(page.getByRole('heading', { name: /403 - Forbidden/i })).toBeVisible()
  })
})
