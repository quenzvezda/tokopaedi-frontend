import '@testing-library/jest-dom'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll } from 'vitest'

const API_URL = 'http://localhost:8080'

// This is the MSW server for unit tests (Node.js environment)
export const server = setupServer(
  // AUTH
  http.post(`${API_URL}/auth/api/v1/login`, async ({ request }) => {
    const body = (await request.json()) as { usernameOrEmail?: string; password?: string }
    if (body?.usernameOrEmail === 'user' && body?.password === 'password') {
      return HttpResponse.json({ accessToken: 'fake-user-token' })
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }),

  // IAM v2 (paginated)
  http.get(`${API_URL}/iam/api/v2/roles`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '12')
    const all = [
      { id: 1, name: 'ADMIN' },
      { id: 2, name: 'USER' },
    ]
    const start = page * size
    const slice = all.slice(start, start + size)
    return HttpResponse.json({
      content: slice,
      number: page,
      size,
      totalElements: all.length,
      totalPages: Math.max(1, Math.ceil(all.length / size)),
    })
  }),

  // CATALOG
  http.get(`${API_URL}/catalog/api/v1/products`, () => {
    return HttpResponse.json({ content: [] })
  }),

  http.post(`${API_URL}/auth/api/v1/refresh`, () => {
    // For unit tests, a successful refresh can just return a generic token
    return HttpResponse.json({
      tokenType: 'Bearer',
      accessToken: 'refreshed-unit-test-token',
      expiresIn: 3600,
    })
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
