import { test, expect } from '@playwright/test'

test.describe('Admin Panel', () => {
  test('allows admin user to see link and access the admin panel', async ({ page }) => {
    // 1. Mock API endpoints
    await page.route('**/iam/api/v1/users/me', (r) =>
      r.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        json: { id: 'admin-e2e', username: 'admin-e2e', roles: ['ADMIN'], permissions: [] },
      }),
    )
    await page.route('**/iam/api/v1/roles', (r) =>
      r.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        json: [
          { id: 1, name: 'ADMIN' },
          { id: 2, name: 'USER' },
        ],
      }),
    )
    await page.route('**/catalog/api/v1/products**', (r) =>
      r.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        json: { content: [], page: 0, size: 12, totalPages: 1, totalElements: 0 },
      }),
    )

    // 2. Go to a page and log in
    await page.goto('/')

    // Fake JWT for an ADMIN user
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
    const payload = Buffer.from(
      JSON.stringify({ sub: 'admin-e2e', roles: ['ADMIN'], exp: Math.floor(Date.now() / 1000) + 3600 }),
    ).toString('base64url')
    const fakeJwt = `${header}.${payload}.`

    await page.evaluate((token) => {
      // @ts-expect-error dev helper
      window.__setAccessToken?.(token)
    }, fakeJwt)

    // Wait for auth state to update
    await page.waitForFunction(() => (window as unknown as { __hasToken?: boolean }).__hasToken === true)

    // The header should update automatically without a reload
    // as the underlying user query is refreshed.

    // 3. Find and click the "Admin Panel" link
    await page.getByRole('button', { name: /admin-e2e/i }).click()
    // Wait for the menu to be visible before trying to click an item in it
    await expect(page.getByRole('menu')).toBeVisible()
    await page.getByRole('menuitem', { name: /Admin Panel/i }).click()

    // 4. Assert navigation and content
    await expect(page).toHaveURL('/admin')
    await expect(page.getByRole('heading', { name: /Admin Panel/i })).toBeVisible()

    // 5. Assert the roles table is visible
    await expect(page.getByRole('heading', { name: 'Roles' })).toBeVisible()
    await expect(page.getByRole('table')).toBeVisible()
    await expect(page.getByRole('cell', { name: 'ADMIN' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'USER' })).toBeVisible()

    // 6. Assert search bar is NOT visible
    await expect(page.getByPlaceholder(/Search products/i)).not.toBeVisible();
  })
})
