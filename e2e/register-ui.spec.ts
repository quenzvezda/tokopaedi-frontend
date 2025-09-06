import { test, expect } from '@playwright/test'

test.describe('Registration UI (mocked)', () => {
  test('registers user and redirects to /login with success toast', async ({ page }) => {
    await page.route('**/auth/api/v1/auth/register', (route) =>
      route.fulfill({
        status: 201,
        headers: { 'content-type': 'application/json' },
        json: { id: 'reg-1', username: 'playwright', email: 'playwright@example.com' },
      }),
    )

    await page.goto('/register')

    await page.getByLabel('Username').fill('playwright')
    await page.getByLabel('Email').fill('playwright@example.com')
    await page.getByLabel('Password').fill('Password123!')

    await page.getByRole('button', { name: 'Register' }).click()

    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
    await expect(page.getByText('Registered successfully')).toBeVisible()
  })
})

