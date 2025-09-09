import { http, HttpResponse } from 'msw'
import { z } from 'zod'

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

  http.get(`${API_URL}/iam/api/v1/roles`, () => {
    const payload = [
      { id: 1, name: 'ADMIN' },
      { id: 2, name: 'USER' },
      { id: 3, name: 'GUEST' },
    ]
    const parsed = z.array(IamSchemas.Role).safeParse(payload)
    return HttpResponse.json(parsed.data)
  }),

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
