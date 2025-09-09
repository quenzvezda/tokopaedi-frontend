import { test, expect } from './setup'

test.describe('RBAC guard (mocked)', () => {
  test('redirects to /403 when non-admin visits /admin', async ({ page }) => {
    // Go to a page where we can inject the token
    await page.goto('/')

    // Use the dev hook to set a token for a non-admin user.
    // The MSW handler for /users/me will return the MOCK_USER_DEFAULT profile.
    await page.evaluate((token) => {
      // @ts-expect-error dev helper
      window.__setAccessToken?.(token)
    }, 'fake-user-token')

    // Wait for auth state to be confirmed
    await page.waitForFunction(() => (window as any).__hasToken === true)

    // Now, navigate to the admin page
    await page.goto('/admin')

    // User should be redirected to the Forbidden page
    await expect(page).toHaveURL('/403')
    await expect(page.getByRole('heading', { name: /Forbidden/i })).toBeVisible()
  })
})
