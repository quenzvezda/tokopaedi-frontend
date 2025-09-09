import { test, expect } from './setup'

test.describe('RBAC guard (mocked)', () => {
  test('redirects to /403 when non-admin visits /admin', async ({ page }) => {
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
