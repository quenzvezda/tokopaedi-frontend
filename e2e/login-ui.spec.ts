import { test, expect } from './setup'

test.describe('Login UI (mocked)', () => {
  test('logs in via form and lands on the catalog page', async ({ page }) => {
    await page.goto('/login')

    // Use credentials that are mocked in `src/mocks/handlers.ts`
    await page.getByLabel('Username or Email').fill('admin')
    await page.getByLabel('Password').fill('admin123')
    await page.getByRole('button', { name: 'Sign in' }).click()

    // After login, user should be redirected to the home/catalog page
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible()

    // The header menu should display the admin's full name from the profile mock
    const avatarButton = page.getByRole('button', { name: /Tokopaedi/i })
    await avatarButton.click()
    await expect(page.getByRole('menu')).toContainText('Admin Tokopaedi')
  })
})
