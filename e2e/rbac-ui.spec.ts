import { test, expect } from './setup'

test.describe('RBAC UI (mocked)', () => {
  test('non-admin user logs in and gets 403 at /admin', async ({ page }) => {
    await page.goto('/login')

    // Log in as the seeded customer account (no ADMIN role)
    await page.getByLabel('Username or Email').fill('customer')
    await page.getByLabel('Password').fill('customer123')
    await page.getByRole('button', { name: 'Sign in' }).click()

    // Ensure login succeeded and redirected to home
    await expect(page).toHaveURL('/')

    // Attempt to navigate to /admin via client-side navigation
    await page.evaluate(() => {
      window.history.pushState({}, '', '/admin')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    // Expect to be redirected to the Forbidden page
    await expect(page).toHaveURL('/403')
    await expect(page.getByRole('heading', { name: /Forbidden/i })).toBeVisible()
  })
})
