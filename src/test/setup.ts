import '@testing-library/jest-dom'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { schemas as IamSchemas } from '@/generated/openapi/iam/schemas'

try {
  const originalFocus = window.HTMLElement.prototype.focus
  type FocusImpl = (this: HTMLElement, ...args: unknown[]) => unknown
  let currentFocusImpl: FocusImpl | null =
    typeof originalFocus === 'function' ? (originalFocus as FocusImpl) : null

  Object.defineProperty(window.HTMLElement.prototype, 'focus', {
    configurable: true,
    enumerable: false,
    get() {
      const impl = currentFocusImpl
      if (typeof impl === 'function') {
        return function patchedFocus(this: HTMLElement, ...args: unknown[]) {
          return (impl as FocusImpl).apply(this, args as [])
        }
      }
      return () => {}
    },
    set(value) {
      currentFocusImpl =
        typeof value === 'function'
          ? (value as FocusImpl)
          : typeof originalFocus === 'function'
            ? (originalFocus as FocusImpl)
            : null
    },
  })
} catch {
  // ignore if jsdom already patched focus
}

const API_URL = 'http://localhost:8080'

type RolePermissionFixture = {
  role: { id: number; name: string }
  assigned: Array<{ id: number; name: string }>
  available: Array<{ id: number; name: string }>
}

const rolePermissionFixtures: Record<string, RolePermissionFixture> = {
  '1': {
    role: { id: 1, name: 'ADMIN' },
    assigned: [
      { id: 10, name: 'user.read' },
      { id: 11, name: 'user.write' },
    ],
    available: [
      { id: 20, name: 'order.read' },
      { id: 21, name: 'order.write' },
    ],
  },
}

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


  http.get(`${API_URL}/auth/api/v1/users`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '12')
    const q = (url.searchParams.get('q') || '').trim().toLowerCase()
    const sortParams = url.searchParams.getAll('sort')
    const fixtures = [
      { id: '11111111-1111-4111-8111-111111111111', username: 'admin' },
      { id: '22222222-2222-4222-8222-222222222222', username: 'alice' },
      { id: '33333333-3333-4333-8333-333333333333', username: 'bob' },
      { id: '44444444-4444-4444-8444-444444444444', username: 'charlie' },
    ]
    let data = [...fixtures]
    if (q.length >= 2) {
      const tokens = q.split(/\s+/)
      data = data.filter((user) => tokens.every((token) => user.username.toLowerCase().includes(token)))
    }
    if (sortParams.length > 0) {
      const [field, dir] = (sortParams[0] || '').split(',') as [keyof typeof data[number] | undefined, string]
      if (field) {
        const direction = dir?.toLowerCase() === 'desc' ? 'desc' : 'asc'
        data = [...data].sort((a, b) => {
          const av = a[field] as string
          const bv = b[field] as string
          const compare = av.localeCompare(bv, undefined, { numeric: true, sensitivity: 'base' })
          return direction === 'desc' ? compare * -1 : compare
        })
      }
    } else {
      data = [...data].sort((a, b) => a.username.localeCompare(b.username))
    }
    const safeSize = size > 0 ? size : 12
    const start = page * safeSize
    const slice = data.slice(start, start + safeSize)
    return HttpResponse.json({
      content: slice,
      number: page,
      size: safeSize,
      totalElements: data.length,
      totalPages: Math.max(1, Math.ceil(data.length / safeSize)),
    })
  }),

  // IAM v2 (paginated)
  http.get(`${API_URL}/iam/api/v2/roles`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '12')
    const q = (url.searchParams.get('q') || '').trim().toLowerCase()
    const sortParams = url.searchParams.getAll('sort')
    let data = [
      { id: 1, name: 'ADMIN' },
      { id: 2, name: 'USER' },
      { id: 3, name: 'AUDITOR' },
    ]
    if (q.length >= 2) {
      const tokens = q.split(/\s+/)
      data = data.filter((r) => tokens.every((t) => r.name.toLowerCase().includes(t)))
    }
    if (sortParams.length > 0) {
      const [field, dir] = (sortParams[0] || '').split(',') as [keyof typeof data[number] | undefined, string]
      if (field) {
        data = [...data].sort((a, b) => {
          const av = a[field] as unknown as string | number
          const bv = b[field] as unknown as string | number
          if (typeof av === 'string' && typeof bv === 'string') {
            return (av.localeCompare(bv)) * (dir === 'desc' ? -1 : 1)
          }
          return ((av as number) - (bv as number)) * (dir === 'desc' ? -1 : 1)
        })
      }
    }
    const start = page * size
    const slice = data.slice(start, start + size)
    return HttpResponse.json({
      content: slice,
      number: page,
      size,
      totalElements: data.length,
      totalPages: Math.max(1, Math.ceil(data.length / size)),
    })
  }),

  http.get(`${API_URL}/iam/api/v2/permissions`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '12')
    const q = (url.searchParams.get('q') || '').trim().toLowerCase()
    const sortParams = url.searchParams.getAll('sort')
    let data = [
      { id: 10, name: 'user.read', description: 'Read user data' },
      { id: 11, name: 'user.write', description: 'Write user data' },
      { id: 20, name: 'order.read', description: 'Read order data' },
      { id: 21, name: 'order.write', description: 'Write order data' },
    ]
    if (q.length >= 2) {
      const tokens = q.split(/\s+/)
      data = data.filter((p) =>
        tokens.every(
          (t) => p.name.toLowerCase().includes(t) || (p.description || '').toLowerCase().includes(t),
        ),
      )
    }
    if (sortParams.length > 0) {
      const [field, dir] = (sortParams[0] || '').split(',') as [keyof typeof data[number] | undefined, string]
      if (field) {
        data = [...data].sort((a, b) => {
          const av = a[field] as unknown as string | number | undefined
          const bv = b[field] as unknown as string | number | undefined
          if (av == null && bv == null) return 0
          if (av == null) return 1
          if (bv == null) return -1
          if (typeof av === 'string' && typeof bv === 'string') {
            return (av.localeCompare(bv)) * (dir === 'desc' ? -1 : 1)
          }
          return ((av as number) - (bv as number)) * (dir === 'desc' ? -1 : 1)
        })
      }
    }
    const start = page * size
    const slice = data.slice(start, start + size)
    return HttpResponse.json({
      content: slice,
      number: page,
      size,
      totalElements: data.length,
      totalPages: Math.max(1, Math.ceil(data.length / size)),
    })
  }),

  http.get(`${API_URL}/iam/api/v1/roles/:roleId`, ({ params }) => {
    const { roleId } = params as { roleId?: string }
    const fixture = rolePermissionFixtures[roleId ?? '']
    if (fixture) {
      return HttpResponse.json(fixture.role)
    }
    return HttpResponse.json({ message: 'Role not found' }, { status: 404 })
  }),

  http.get(`${API_URL}/iam/api/v1/roles/:roleId/permissions`, ({ params, request }) => {
    const { roleId } = params as { roleId?: string }
    const fixture = rolePermissionFixtures[roleId ?? '']
    const url = new URL(request.url)
    const available = (url.searchParams.get('available') || 'false').toLowerCase() === 'true'
    if (!fixture) {
      return HttpResponse.json([])
    }
    return HttpResponse.json(available ? fixture.available : fixture.assigned)
  }),

  http.post(`${API_URL}/iam/api/v2/permissions`, async ({ request }) => {
    const body = await request.json()
    const parsed = IamSchemas.PermissionBulkRequest.safeParse(body)
    if (!parsed.success) {
      return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 })
    }
    const created = parsed.data.permissions.map((permission, index) => ({
      id: 1000 + index,
      name: permission.name,
      description: permission.description ?? null,
    }))
    return HttpResponse.json({ created })
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
