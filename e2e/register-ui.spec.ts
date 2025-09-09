import { test, expect } from './setup'

test.describe('Registration UI (mocked)', () => {
  test('registers user and redirects to /login with success toast', async ({ page }) => {
    await page.goto('/register')

    await page.getByLabel('Username').fill('new-user')
    await page.getByLabel('Email').fill('new-user@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: 'Register' }).click()

    // Expect to be redirected to /login
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()

    // Expect a success toast to be visible
    await expect(page.getByText('Registered successfully')).toBeVisible()
  })
})

