import { test, expect } from '@playwright/test'

const USER = process.env.E2E_USER || 'admin'
const PASS = process.env.E2E_PASS || 'admin123'

test.describe('Login UI (real backend)', () => {
  test('logs in via form and lands on welcome', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('Username or Email').click()
    await page.getByLabel('Username or Email').fill(USER)
    await page.getByLabel('Password').click()
    await page.getByLabel('Password').fill(PASS)
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL('/')
    // Home now shows the Catalog list
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible()
  })
})
