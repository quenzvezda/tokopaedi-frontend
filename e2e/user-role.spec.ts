import { test, expect } from '@playwright/test'

test('admin assigns role to user', async ({ page }) => {
  const userRoles: string[] = ['USER']
  const userId = '11111111-1111-4111-8111-111111111111'

  await page.route('**/auth/api/v1/refresh', (r) =>
    r.fulfill({
      status: 200,
      headers: { 'content-type': 'application/json' },
      json: { tokenType: 'Bearer', accessToken: 'refreshed-token', expiresIn: 3600 },
    }),
  )
  await page.route('**/iam/api/v1/users/me', (r) =>
    r.fulfill({
      status: 200,
      headers: { 'content-type': 'application/json' },
      json: { id: 'admin-e2e', username: 'admin-e2e', roles: ['ADMIN'], permissions: [] },
    }),
  )
  await page.route('**/auth/api/v1/users**', (r) =>
    r.fulfill({
      status: 200,
      headers: { 'content-type': 'application/json' },
      json: {
        content: [{ id: userId, username: 'user1' }],
        number: 0,
        size: 12,
        totalElements: 1,
        totalPages: 1,
      },
    }),
  )
  await page.route('**/catalog/api/v1/products**', (r) =>
    r.fulfill({
      status: 200,
      headers: { 'content-type': 'application/json' },
      json: { content: [], page: 0, size: 12, totalPages: 1, totalElements: 0 },
    }),
  )
  await page.route('**/iam/api/v2/roles**', (r) =>
    r.fulfill({
      status: 200,
      headers: { 'content-type': 'application/json' },
      json: {
        content: [
          { id: 1, name: 'ADMIN' },
          { id: 2, name: 'USER' },
        ],
        number: 0,
        size: 12,
        totalPages: 1,
        totalElements: 2,
      },
    }),
  )
  await page.route('**/iam/api/v1/roles', (r) =>
    r.fulfill({
      status: 200,
      headers: { 'content-type': 'application/json' },
      json: [
        { id: 1, name: 'ADMIN' },
        { id: 2, name: 'USER' },
      ],
    }),
  )
  await page.route(`**/iam/api/v1/users/${userId}/roles`, (r) =>
    r.fulfill({
      status: 200,
      headers: { 'content-type': 'application/json' },
      json: userRoles,
    }),
  )
  await page.route(`**/iam/api/v1/assign/user/${userId}/role/1`, (r) => {
    userRoles.push('ADMIN')
    r.fulfill({ status: 200, headers: { 'content-type': 'application/json' }, json: {} })
  })

  await page.goto('/')

  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(
    JSON.stringify({
      sub: 'admin-e2e',
      roles: ['ADMIN'],
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  ).toString('base64url')
  const fakeJwt = `${header}.${payload}.`

  await page.evaluate((token) => {
    // @ts-expect-error dev helper
    window.__setAccessToken?.(token)
  }, fakeJwt)

  await page.waitForFunction(
    () => (window as unknown as { __hasToken?: boolean }).__hasToken === true,
  )

  await page.getByRole('button', { name: /admin-e2e/i }).click()
  await expect(page.getByRole('menu')).toBeVisible()
  await page.getByRole('menuitem', { name: /Admin Panel/i }).click({ noWaitAfter: true })

  await expect(page).toHaveURL('/admin')
  await page.getByRole('link', { name: /Users/i }).click()
  await expect(page).toHaveURL('/admin/users')
  await expect(page.getByRole('cell', { name: 'user1' })).toBeVisible()
  await page
    .getByRole('row', { name: /user1/i })
    .getByRole('link', { name: /Roles/i })
    .click()

  await expect(page).toHaveURL(`/admin/user/${userId}/roles`)
  await page.getByRole('button', { name: /Assign Role/i }).click()
  const modal = page.getByRole('dialog', { name: /Assign Roles/i })
  await expect(modal).toBeVisible()
  await modal.getByText('ADMIN').click()
  await modal.getByRole('button', { name: /^Assign$/ }).click()
  await expect(page.getByRole('cell', { name: 'ADMIN' })).toBeVisible()
})
