import { expect, test } from './setup'

test.describe('Admin Panel (mocked)', () => {
  test('allows admin user to see link and access the admin panel', async ({ page }) => {
    // 1. Login as an admin user
    await page.goto('/login')
    await page.getByLabel('Username or Email').fill('admin')
    await page.getByLabel('Password').fill('password')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/') // Wait for redirect

    // 2. Find and click the "Admin Panel" link in the user menu
    await page.getByRole('button', { name: /mock-admin/i }).click()
    await page.getByRole('menuitem', { name: /Admin Panel/i }).click()

    // 3. Assert navigation and content on the admin page
    await expect(page).toHaveURL('/admin')
    await expect(page.getByRole('heading', { name: /Admin Panel/i })).toBeVisible()

    // 4. Assert the roles table is visible and contains expected data from MSW
    await expect(page.getByRole('table')).toBeVisible()
    await expect(page.getByRole('cell', { name: 'ADMIN' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'USER' })).toBeVisible()

    // 5. Assert search bar is NOT visible
    await expect(page.getByPlaceholder(/Search products/i)).not.toBeVisible()
  })
})
