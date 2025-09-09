import { test, expect } from './setup'

test.describe('RBAC guard (mocked)', () => {
  test('redirects to /403 when non-admin visits /admin', async ({ page }) => {
    // 1. Login as a non-admin user
    await page.goto('/login')
    await page.getByLabel('Username or Email').fill('user')
    await page.getByLabel('Password').fill('password')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/') // Wait for redirect

    // 2. Now, navigate to the admin page
    await page.goto('/admin')

    // 3. User should be redirected to the Forbidden page
    await expect(page).toHaveURL('/403')
    await expect(page.getByRole('heading', { name: /Forbidden/i })).toBeVisible()
  })
})
