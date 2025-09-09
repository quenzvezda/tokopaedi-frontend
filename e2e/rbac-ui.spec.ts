import { test, expect } from './setup'

test.describe('RBAC UI (mocked)', () => {
  test('non-admin user logs in and gets 403 at /admin', async ({ page }) => {
    await page.goto('/login')

    // Log in as a regular user (not admin)
    await page.getByLabel('Username or Email').fill('user')
    await page.getByLabel('Password').fill('password')
    await page.getByRole('button', { name: 'Sign in' }).click()

    // Ensure login succeeded and redirected to home
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('button', { name: /mock-user/i })).toBeVisible()

    // Attempt to navigate to /admin
    await page.goto('/admin')

    // Expect to be redirected to the Forbidden page
    await expect(page).toHaveURL('/403')
    await expect(page.getByRole('heading', { name: /Forbidden/i })).toBeVisible()
  })
})
