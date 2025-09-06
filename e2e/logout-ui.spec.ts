import { test, expect } from '@playwright/test'

test.describe('Logout UI (mocked)', () => {
  test('shows avatar when authenticated, then redirects to /login after Logout', async ({ page }) => {
    // Mock current user and catalog response to stabilize UI
    await page.route('**/iam/api/v1/users/me', (r) =>
      r.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        json: { id: 'e2e', username: 'e2e', roles: ['USER'], permissions: [] },
      }),
    )
    await page.route('**/catalog/api/v1/products**', (r) =>
      r.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        json: { content: [{ id: '1', name: 'Mock Product', price: 10000 }] },
      }),
    )

    // Seed a fake JWT via dev helper
    await page.goto('/login')
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
    const payload = Buffer.from(
      JSON.stringify({ sub: 'e2e', roles: ['USER'], exp: Math.floor(Date.now() / 1000) + 3600 }),
    ).toString('base64url')
    const fakeJwt = `${header}.${payload}.`

    await page.evaluate((token) => {
      // @ts-expect-error dev helper provided by AuthProvider in dev
      window.__setAccessToken?.(token)
    }, fakeJwt)

    await page.waitForFunction(() => (window as unknown as { __hasToken?: boolean }).__hasToken === true)

    // Go to home (catalog)
    await page.evaluate(() => {
      history.pushState({}, '', '/')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    await expect(page).toHaveURL('/')

    // Open user menu by hovering the menu button (avatar inside)
    const menuButton = page.locator('button[aria-haspopup="menu"]')
    await expect(menuButton).toBeVisible()
    await menuButton.hover()

    // Click Logout and expect redirect to /login
    await page.getByRole('menuitem', { name: 'Logout' }).click()

    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  })
})

