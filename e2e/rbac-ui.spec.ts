import { test, expect } from './setup'

test.describe('RBAC UI (mocked)', () => {
  test('non-admin user logs in and gets 403 at /admin', async ({ page }) => {
    // Mock the API endpoint to ensure the user is not an admin
    await page.route('**/auth/api/v1/login', (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: { accessToken: 'fake-user-token' },
      })
    })

    await page.route('**/auth/api/v1/refresh', (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: { accessToken: 'refreshed-fake-user-token' },
      })
    })

    await page.route('**/iam/api/v1/users/me', (route) => {
      const token = route.request().headers().authorization
      const isUser = token?.includes('fake-user-token')
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          id: isUser ? 'mock-user-id' : 'mock-admin-id',
          username: isUser ? 'mock-user' : 'mock-admin',
          email: isUser ? 'mock-user@example.com' : 'mock-admin@example.com',
          roles: isUser ? ['USER'] : ['ADMIN', 'USER'],
          permissions: [],
        },
      })
    })

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
