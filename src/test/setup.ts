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

  // IAM
  http.get(`${API_URL}/iam/api/v1/roles`, () => {
    const payload = [
      { id: 1, name: 'ADMIN' },
      { id: 2, name: 'USER' },
    ]
    return HttpResponse.json(payload)
  }),

  // CATALOG
  http.get(`${API_URL}/catalog/api/v1/products`, () => {
    return HttpResponse.json({ content: [] })
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
