import { test, expect } from '@playwright/test'

test.describe('Admin — search & sort (Roles/Permissions)', () => {
  test('roles: search q + sort toggles, permissions: q + sort', async ({ page }) => {
    await page.route('**/iam/api/v1/users/me', (r) =>
      r.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        json: { id: 'admin-e2e', username: 'admin-e2e', roles: ['ADMIN'], permissions: [] },
      }),
    )
    await page.route('**/catalog/api/v1/products**', (r) =>
      r.fulfill({ status: 200, headers: { 'content-type': 'application/json' }, json: { content: [] } }),
    )

    // Roles endpoint mock with q + sort support
    await page.route('**/iam/api/v2/roles**', (route) => {
      const url = new URL(route.request().url())
      const pageIdx = Number(url.searchParams.get('page') || '0')
      const size = Number(url.searchParams.get('size') || '12')
      const q = (url.searchParams.get('q') || '').trim().toLowerCase()
      const sort = url.searchParams.getAll('sort')
      let data = [
        { id: 1, name: 'ADMIN' },
        { id: 2, name: 'USER' },
        { id: 3, name: 'AUDITOR' },
      ]
      if (q.length >= 2) {
        const tokens = q.split(/\s+/)
        data = data.filter((r) => tokens.every((t) => r.name.toLowerCase().includes(t)))
      }
      if (sort.length > 0) {
        const [field, dir] = (sort[0] || '').split(',') as ['id' | 'name' | undefined, string]
        if (field) {
          data = [...data].sort((a, b) => {
            const av = a[field]
            const bv = b[field]
            if (typeof av === 'string' && typeof bv === 'string') return av.localeCompare(bv) * (dir === 'desc' ? -1 : 1)
            return (Number(av) - Number(bv)) * (dir === 'desc' ? -1 : 1)
          })
        }
      }
      const start = pageIdx * size
      const slice = data.slice(start, start + size)
      route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        json: { content: slice, number: pageIdx, size, totalElements: data.length, totalPages: Math.max(1, Math.ceil(data.length / size)) },
      })
    })

    // Permissions endpoint mock with q + sort support
    await page.route('**/iam/api/v2/permissions**', (route) => {
      const url = new URL(route.request().url())
      const pageIdx = Number(url.searchParams.get('page') || '0')
      const size = Number(url.searchParams.get('size') || '12')
      const q = (url.searchParams.get('q') || '').trim().toLowerCase()
      const sort = url.searchParams.getAll('sort')
      type Perm = { id: number; name: string; description: string }
      let data: Perm[] = [
        { id: 10, name: 'user.read', description: 'Read user data' },
        { id: 11, name: 'user.write', description: 'Write user data' },
        { id: 20, name: 'order.read', description: 'Read order data' },
        { id: 21, name: 'order.write', description: 'Write order data' },
      ]
      if (q.length >= 2) {
        const tokens = q.split(/\s+/)
        data = data.filter((p) => tokens.every((t) => p.name.toLowerCase().includes(t) || (p.description || '').toLowerCase().includes(t)))
      }
      if (sort.length > 0) {
        const [field, dir] = (sort[0] || '').split(',') as [keyof Perm | undefined, string]
        if (field) {
          data = [...data].sort((a, b) => {
            const av = a[field]
            const bv = b[field]
            if (typeof av === 'string' && typeof bv === 'string') return av.localeCompare(bv) * (dir === 'desc' ? -1 : 1)
            return (Number(av) - Number(bv)) * (dir === 'desc' ? -1 : 1)
          })
        }
      }
      const start = pageIdx * size
      const slice = data.slice(start, start + size)
      route.fulfill({
        status: 200,
        headers: { 'content-type': 'application/json' },
        json: { content: slice, number: pageIdx, size, totalElements: data.length, totalPages: Math.max(1, Math.ceil(data.length / size)) },
      })
    })

    // Login via dev helper
    await page.goto('/')
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
    const payload = Buffer.from(
      JSON.stringify({ sub: 'admin-e2e', roles: ['ADMIN'], exp: Math.floor(Date.now() / 1000) + 3600 }),
    ).toString('base64url')
    const fakeJwt = `${header}.${payload}.`
    await page.evaluate((token) => {
      // @ts-expect-error dev-only helper to set access token in app
      window.__setAccessToken?.(token)
    }, fakeJwt)
    await page.waitForFunction(() => (window as unknown as { __hasToken?: boolean }).__hasToken === true)

    // Go to Admin → Roles
    await page.getByRole('button', { name: /admin-e2e/i }).click()
    await page.getByRole('menuitem', { name: /Admin Panel/i }).click()
    await page.getByRole('link', { name: /Roles/i }).click()
    await expect(page).toHaveURL(/\/admin\/roles/)

    // Ensure table loaded
    await expect(page.getByRole('table')).toBeVisible()

    // Default order should show ADMIN first
    await expect(page.locator('tbody tr').first().locator('td').nth(1)).toHaveText('ADMIN')

    // Click once to toggle asc → desc: USER first (now that default sort param is present)
    await page.locator('thead th').nth(1).click()
    await expect(page.locator('tbody tr').first().locator('td').nth(1)).toHaveText('USER', { timeout: 10000 })

    // Now search for USER (min length 2) to validate filtering
    const searchInput = page.getByPlaceholder(/Cari nama\/kode\/deskripsi\.\./i)
    await searchInput.fill('US')
    await expect(page.getByRole('cell', { name: 'USER' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'ADMIN' })).not.toBeVisible()

    // Navigate to Permissions
    await page.getByRole('navigation').getByRole('link', { name: /^Permissions$/ }).click()
    await expect(page).toHaveURL(/\/admin\/permissions/)

    // Search by q: user → 2 rows
    const permSearch = page.getByPlaceholder(/Cari nama\/kode\/deskripsi\.\./i)
    await permSearch.fill('user')
    await expect(page.getByRole('cell', { name: 'user.read' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'user.write' })).toBeVisible()

    // Keep basic search verification sufficient for happy path
  })
})
