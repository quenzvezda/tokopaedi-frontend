import '@testing-library/jest-dom'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { schemas as CatalogSchemas } from '@/generated/openapi/catalog/schemas'

// Minimal MSW server for unit tests
export const server = setupServer(
  http.options('/api/auth/v1/login', async ({ request }) => {
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
  http.post('/api/auth/v1/login', async ({ request }) => {
    const body = (await request.json()) as { usernameOrEmail?: string; password?: string }
    if (body?.usernameOrEmail === 'user' && body?.password === 'pass') {
      return HttpResponse.json({
        tokenType: 'Bearer',
        accessToken: 'header.payload.signature',
        expiresIn: 900,
      })
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }),
  // Catalog list mock derived from OpenAPI schemas
  http.get('/api/catalog/v1/products', async ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '12')
    const content = Array.from({ length: size }).map((_, i) => ({
      id: `p-${page}-${i}`,
      name: `Product ${page * size + i + 1}`,
      description: null,
      price: (page * size + i + 1) * 1000,
      brandName: null,
      categoryName: null,
    }))
    const payload = {
      content,
      number: page,
      size,
      totalElements: 100,
      totalPages: Math.ceil(100 / size),
    }
    // Validate against contract
    const parsed = CatalogSchemas.ProductPage.safeParse(payload)
    if (!parsed.success) {
      return HttpResponse.json({ message: 'Mock validation failed' }, { status: 500 })
    }
    return HttpResponse.json(parsed.data)
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
