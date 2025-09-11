import { http, HttpResponse } from 'msw'
// import { z } from 'zod'

import { schemas as AuthSchemas } from '@/generated/openapi/auth/schemas'
import { schemas as CatalogSchemas } from '@/generated/openapi/catalog/schemas'
import { schemas as IamSchemas } from '@/generated/openapi/iam/schemas'

const API_URL = 'http://localhost:8080'

const MOCK_USER_DEFAULT = {
  id: 'mock-user-id',
  username: 'mock-user',
  email: 'mock-user@example.com',
  roles: ['USER'],
  permissions: [],
}

const MOCK_USER_ADMIN = {
  ...MOCK_USER_DEFAULT,
  id: 'mock-admin-id',
  username: 'mock-admin',
  roles: ['USER', 'ADMIN'],
}

export const handlers = [
  // ===== AUTH =====
  http.post(`${API_URL}/auth/api/v1/login`, async ({ request }) => {
    const body = await request.json()
    const parsed = AuthSchemas.LoginRequest.safeParse(body)
    if (!parsed.success) {
      return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 })
    }

    const { usernameOrEmail, password } = parsed.data
    // Mock successful login for admin
    if (usernameOrEmail === 'admin' && password === 'password') {
      return HttpResponse.json({
        tokenType: 'Bearer',
        accessToken: 'fake-admin-token',
        expiresIn: 3600,
      })
    }
    // Mock successful login for regular user
    if (usernameOrEmail === 'user' && password === 'password') {
      return HttpResponse.json({
        tokenType: 'Bearer',
        accessToken: 'fake-user-token',
        expiresIn: 3600,
      })
    }
    // Mock failed login
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }),

  http.post(`${API_URL}/auth/api/v1/refresh`, () => {
    // This handler is crucial for the initial load in AuthProvider
    return HttpResponse.json({
      tokenType: 'Bearer',
      accessToken: 'refreshed-e2e-token',
      expiresIn: 3600,
    })
  }),

  http.post(`${API_URL}/auth/api/v1/register`, async () => {
    // Return a response that matches the RegisterResponse schema
    return HttpResponse.json({ message: 'User registered successfully' }, { status: 201 })
  }),

  http.get(`${API_URL}/auth/api/v1/users`, () =>
    HttpResponse.json([
      { id: 'u1', username: 'user1' },
      { id: 'u2', username: 'user2' },
    ]),
  ),

  // ===== IAM =====
  http.get(`${API_URL}/iam/api/v1/users/me`, ({ request }) => {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (token === 'fake-admin-token') {
      const parsed = IamSchemas.CurrentUser.safeParse(MOCK_USER_ADMIN)
      return HttpResponse.json(parsed.data)
    }
    if (token === 'fake-user-token') {
      const parsed = IamSchemas.CurrentUser.safeParse(MOCK_USER_DEFAULT)
      return HttpResponse.json(parsed.data)
    }
    return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }),

  // v2 paginated roles
  http.get(`${API_URL}/iam/api/v2/roles`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '12')
    const all = [
      { id: 1, name: 'ADMIN' },
      { id: 2, name: 'USER' },
      { id: 3, name: 'GUEST' },
      { id: 4, name: 'EDITOR' },
      { id: 5, name: 'VIEWER' },
    ]
    const start = page * size
    const slice = all.slice(start, start + size)
    const payload = {
      content: slice,
      number: page,
      size,
      totalElements: all.length,
      totalPages: Math.max(1, Math.ceil(all.length / size)),
    }
    const parsed = IamSchemas.RolePage.safeParse(payload)
    if (!parsed.success) {
      return HttpResponse.json({ message: 'Mock validation failed' }, { status: 500 })
    }
    return HttpResponse.json(parsed.data)
  }),

  // v2 paginated permissions
  http.get(`${API_URL}/iam/api/v2/permissions`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '12')
    const all = Array.from({ length: 40 }).map((_, i) => ({
      id: i + 1,
      name: `PERM_${i + 1}`,
      description: `Permission ${i + 1}`,
    }))
    const start = page * size
    const slice = all.slice(start, start + size)
    const payload = {
      content: slice,
      number: page,
      size,
      totalElements: all.length,
      totalPages: Math.max(1, Math.ceil(all.length / size)),
    }
    const parsed = IamSchemas.PermissionPage.safeParse(payload)
    if (!parsed.success) {
      return HttpResponse.json({ message: 'Mock validation failed' }, { status: 500 })
    }
    return HttpResponse.json(parsed.data)
  }),

  http.get(`${API_URL}/iam/api/v1/users/:accountId/roles`, ({ params }) => {
    const { accountId } = params
    const map: Record<string, string[]> = {
      u1: ['USER'],
      u2: ['USER'],
    }
    return HttpResponse.json(map[accountId as string] ?? [])
  }),
  http.post(
    `${API_URL}/iam/api/v1/assign/user/:accountId/role/:roleId`,
    () => HttpResponse.json({}),
  ),
  http.delete(
    `${API_URL}/iam/api/v1/assign/user/:accountId/role/:roleId`,
    () => HttpResponse.json({}),
  ),

  // ===== CATALOG =====
  http.get(`${API_URL}/catalog/api/v1/products`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '12')
    const content = Array.from({ length: size }).map((_, i) => ({
      id: `p-${page}-${i}`,
      name: `Mock Product ${page * size + i + 1}`,
      price: (page * size + i + 1) * 1000,
    }))
    const payload = {
      content,
      number: page,
      size,
      totalElements: 50,
      totalPages: Math.ceil(50 / size),
    }
    const parsed = CatalogSchemas.ProductPage.safeParse(payload)
    if (!parsed.success) {
      console.error('MSW Catalog Mock Validation Error:', parsed.error)
      return HttpResponse.json({ message: 'Mock validation failed' }, { status: 500 })
    }
    return HttpResponse.json(parsed.data)
  }),
]
