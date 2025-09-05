import '@testing-library/jest-dom'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll } from 'vitest'

// Minimal MSW server for unit tests
export const server = setupServer(
  http.options('/auth/api/v1/auth/login', async ({ request }) => {
    return new HttpResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': (request.headers.get('Origin') as string) || '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
      },
    })
  }),
  http.post('/auth/api/v1/auth/login', async ({ request }) => {
    const body = (await request.json()) as { usernameOrEmail?: string; password?: string }
    if (body?.usernameOrEmail === 'user' && body?.password === 'pass') {
      return HttpResponse.json({ accessToken: 'header.payload.signature' })
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
