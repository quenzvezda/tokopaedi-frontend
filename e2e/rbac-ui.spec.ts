import { test, expect } from '@playwright/test'

const USER = process.env.E2E_NONADMIN_USER || 'ramag123'
const PASS = process.env.E2E_NONADMIN_PASS || 'n0c0d3123'

test.describe('RBAC UI (real backend)', () => {
  test('non-admin user logs in and gets 403 at /admin', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('Username or Email').click()
    await page.getByLabel('Username or Email').fill(USER)
    await page.getByLabel('Password').click()
    await page.getByLabel('Password').fill(PASS)
    await page.getByRole('button', { name: 'Sign in' }).click()

    // Ensure login succeeded; home now shows Catalog list
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible()

    // Client-side navigate to /admin to keep in-memory token
    await page.evaluate(() => {
      history.pushState({}, '', '/admin')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    await expect(page).toHaveURL('/403')
    await expect(page.getByRole('heading', { name: /403 - Forbidden/i })).toBeVisible()
  })
})
