import { test, expect } from './setup'

test.describe('Auth guard', () => {
  test('redirects to /login when unauthenticated visiting /admin', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  })

  test('shows catalog when token is set via dev hook', async ({ page }) => {
    await page.route('**/iam/api/v1/users/me', (r) =>
      r.fulfill({ status: 200, headers: { 'content-type': 'application/json' }, json: { id: 'e2e', username: 'e2e', roles: ['USER'], permissions: [] } }),
    )
    await page.route('**/catalog/api/v1/products**', (r) =>
      r.fulfill({ status: 200, headers: { 'content-type': 'application/json' }, json: { content: [{ id: '1', name: 'Mock Product', price: 10000 }] } }),
    )

    await page.goto('/login')
    // Create a fake JWT with exp far in the future
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
    const payload = Buffer.from(
      JSON.stringify({ sub: 'e2e', roles: ['USER'], exp: Math.floor(Date.now() / 1000) + 3600 }),
    ).toString('base64url')
    const fakeJwt = `${header}.${payload}.` // signature ignored by FE

    await page.evaluate((token) => {
      // @ts-expect-error dev helper available only in dev
      window.__setAccessToken?.(token)
    }, fakeJwt)

    // wait until auth context reflects token
    await page.waitForFunction(() => (window as unknown as { __hasToken?: boolean }).__hasToken === true)

    await page.evaluate(() => {
      history.pushState({}, '', '/')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible()
  })
})
