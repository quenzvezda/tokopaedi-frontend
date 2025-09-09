import { test, expect } from './setup'

test.describe('Login UI (mocked)', () => {
  test('logs in via form and lands on the catalog page', async ({ page }) => {
    await page.goto('/login')

    // Use credentials that are mocked in `src/mocks/handlers.ts`
    await page.getByLabel('Username or Email').fill('admin')
    await page.getByLabel('Password').fill('password')
    await page.getByRole('button', { name: 'Sign in' }).click()

    // After login, user should be redirected to the home/catalog page
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible()

    // The header should now show the mocked admin user's name
    await expect(page.getByRole('button', { name: /mock-admin/i })).toBeVisible()
  })
})
