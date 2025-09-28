import { http, HttpResponse } from 'msw'

import { schemas as AuthSchemas } from '@/generated/openapi/auth/schemas'
import { schemas as CatalogSchemas } from '@/generated/openapi/catalog/schemas'
import { schemas as IamSchemas } from '@/generated/openapi/iam/schemas'
import { schemas as ProfileSchemas } from '@/generated/openapi/profile/schemas'

import {
  type MockAccountKey,
  createStore as createMockStore,
  findAccountByCredential,
  getAccountById,
  getAccountByKey,
  getProfile as getMockProfile,
  listStores as listMockStores,
  resolveAccountKey,
  toCurrentUserPayload,
  updateProfile as updateMockProfile,
  updateStore as updateMockStore,
} from './data/accounts'
import { createMockJwt, decodeMockJwt } from './lib/jwt'

const API_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const DEFAULT_ACCOUNT_KEY = resolveAccountKey(import.meta.env.VITE_MSW_ACCOUNT)
let activeAccountKey: MockAccountKey = DEFAULT_ACCOUNT_KEY

const tokenRegistry = new Map<string, MockAccountKey>()

function issueTokens(key: MockAccountKey) {
  const account = getAccountByKey(key)
  const issuedAt = Math.floor(Date.now() / 1000)
  const payload = {
    sub: account.account.id,
    username: account.account.username,
    email: account.account.email,
    roles: account.account.roles,
    permissions: account.account.permissions,
    exp: issuedAt + 60 * 60,
    iat: issuedAt,
    mockAccountKey: key,
  }
  const accessToken = createMockJwt(payload)
  tokenRegistry.set(accessToken, key)
  return {
    tokenType: 'Bearer',
    accessToken,
    expiresIn: 3600,
  }
}

function getAccountKeyFromToken(token: string | null): MockAccountKey | null {
  if (!token) return null
  const cached = tokenRegistry.get(token)
  if (cached) return cached
  const payload = decodeMockJwt(token)
  if (!payload) return null
  if (typeof payload.mockAccountKey === 'string') {
    const key = resolveAccountKey(payload.mockAccountKey)
    tokenRegistry.set(token, key)
    return key
  }
  if (typeof payload.sub === 'string') {
    const account = getAccountById(payload.sub)
    if (account) {
      tokenRegistry.set(token, account.key)
      return account.key
    }
  }
  return null
}

function getAccountFromAuth(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '') ?? null
  const key = getAccountKeyFromToken(token)
  if (!key) return null
  return { key, account: getAccountByKey(key) }
}

function createPresignedUrl(method: 'GET' | 'PUT', objectKey: string | null) {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
  return {
    url: objectKey
      ? `https://cdn.tokopaedi.test/${objectKey}`
      : 'https://cdn.tokopaedi.test/mock-upload',
    method,
    expiresAt,
    headers: method === 'PUT' ? { 'x-msw-upload': 'true' } : undefined,
    objectKey,
  }
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
    const account = findAccountByCredential(usernameOrEmail, password)
    if (!account) {
      return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    activeAccountKey = account.key
    return HttpResponse.json(issueTokens(activeAccountKey))
  }),

  http.post(`${API_URL}/auth/api/v1/refresh`, () => {
    return HttpResponse.json(issueTokens(activeAccountKey))
  }),

  http.post(`${API_URL}/auth/api/v1/logout`, () => {
    activeAccountKey = DEFAULT_ACCOUNT_KEY
    return HttpResponse.json({}, { status: 204 })
  }),

  http.post(`${API_URL}/auth/api/v1/register`, async () => {
    return HttpResponse.json({ message: 'User registered successfully' }, { status: 201 })
  }),

  http.get(`${API_URL}/auth/api/v1/users`, () =>
    HttpResponse.json([
      { id: '0f9db8e3-5a4d-4b2f-9c1d-1234567890ab', username: 'admin' },
      { id: '1a2b3c4d-5e6f-4a70-8b9c-d0e1f2a3b4c5', username: 'seller' },
      { id: '2b3c4d5e-6f70-4b81-92a3-b4c5d6e7f809', username: 'customer' },
    ]),
  ),

  // ===== IAM =====
  http.get(`${API_URL}/iam/api/v1/users/me`, ({ request }) => {
    const auth = getAccountFromAuth(request)
    if (!auth) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const payload = toCurrentUserPayload(auth.account)
    const parsed = IamSchemas.CurrentUser.safeParse(payload)
    if (!parsed.success) {
      return HttpResponse.json({ message: 'Mock validation failed' }, { status: 500 })
    }
    return HttpResponse.json(parsed.data)
  }),

  http.get(`${API_URL}/iam/api/v2/roles`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '12')
    const all = [
      { id: 1, name: 'ADMIN' },
      { id: 2, name: 'SELLER' },
      { id: 3, name: 'CUSTOMER' },
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

  http.get(`${API_URL}/iam/api/v2/permissions`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '12')
    const all = [
      { id: 1, name: 'catalog:product:write', description: 'Manage catalog products' },
      { id: 2, name: 'catalog:product:read', description: 'Read catalog products' },
      { id: 3, name: 'profile:profile:read', description: 'Read customer profiles' },
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
    const parsed = IamSchemas.PermissionPage.safeParse(payload)
    if (!parsed.success) {
      return HttpResponse.json({ message: 'Mock validation failed' }, { status: 500 })
    }
    return HttpResponse.json(parsed.data)
  }),

  http.post(`${API_URL}/iam/api/v2/permissions`, async ({ request }) => {
    const body = await request.json()
    const parsed = IamSchemas.PermissionBulkRequest.safeParse(body)
    if (!parsed.success) {
      return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 })
    }
    const created = parsed.data.permissions.map((permission, index) => ({
      id: 2000 + index,
      name: permission.name,
      description: permission.description ?? null,
    }))
    const payload = { created }
    const parsedResponse = IamSchemas.PermissionBulkResponse.safeParse(payload)
    if (!parsedResponse.success) {
      return HttpResponse.json({ message: 'Mock validation failed' }, { status: 500 })
    }
    return HttpResponse.json(parsedResponse.data)
  }),

  // ===== PROFILE =====
  http.get(`${API_URL}/profile/api/v1/profiles/me`, ({ request }) => {
    const auth = getAccountFromAuth(request)
    if (!auth) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const profile = getMockProfile(auth.key)
    const parsed = ProfileSchemas.UserProfileResponse.safeParse(profile)
    if (!parsed.success) {
      return HttpResponse.json({ message: 'Mock validation failed' }, { status: 500 })
    }
    return HttpResponse.json(parsed.data)
  }),

  http.put(`${API_URL}/profile/api/v1/profiles/me`, async ({ request }) => {
    const auth = getAccountFromAuth(request)
    if (!auth) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const parsed = ProfileSchemas.UserProfileUpdateRequest.safeParse(body)
    if (!parsed.success) {
      return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 })
    }
    const profile = updateMockProfile(auth.key, parsed.data)
    const validated = ProfileSchemas.UserProfileResponse.safeParse(profile)
    if (!validated.success) {
      return HttpResponse.json({ message: 'Mock validation failed' }, { status: 500 })
    }
    return HttpResponse.json(validated.data)
  }),

  http.post(`${API_URL}/profile/api/v1/profiles/me/avatar-upload-url`, async ({ request }) => {
    const auth = getAccountFromAuth(request)
    if (!auth) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json().catch(() => ({}))
    const parsed = ProfileSchemas.AvatarUploadRequest.safeParse(body)
    if (!parsed.success) {
      return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 })
    }
    const fileName = parsed.data.fileName ?? 'avatar.png'
    const objectKey = `avatars/${auth.account.account.id}/${Date.now()}-${fileName}`
    const payload = createPresignedUrl('PUT', objectKey)
    const validated = ProfileSchemas.PresignedUrlResponse.safeParse(payload)
    if (!validated.success) {
      return HttpResponse.json({ message: 'Mock validation failed' }, { status: 500 })
    }
    return HttpResponse.json(validated.data)
  }),

  http.get(`${API_URL}/profile/api/v1/profiles/me/avatar-view-url`, ({ request }) => {
    const auth = getAccountFromAuth(request)
    if (!auth) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const profile = getMockProfile(auth.key)
    if (!profile.avatarObjectKey) {
      return HttpResponse.json({ message: 'Avatar not found' }, { status: 404 })
    }
    const payload = createPresignedUrl('GET', profile.avatarObjectKey)
    const validated = ProfileSchemas.PresignedUrlResponse.safeParse(payload)
    if (!validated.success) {
      return HttpResponse.json({ message: 'Mock validation failed' }, { status: 500 })
    }
    return HttpResponse.json(validated.data)
  }),

  http.get(`${API_URL}/profile/api/v1/profiles/me/stores`, ({ request }) => {
    const auth = getAccountFromAuth(request)
    if (!auth) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const stores = listMockStores(auth.key)
    const validated = ProfileSchemas.StoreProfileResponse.array().safeParse(stores)
    if (!validated.success) {
      return HttpResponse.json({ message: 'Mock validation failed' }, { status: 500 })
    }
    return HttpResponse.json(validated.data)
  }),

  http.post(`${API_URL}/profile/api/v1/profiles/me/stores`, async ({ request }) => {
    const auth = getAccountFromAuth(request)
    if (!auth) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const parsed = ProfileSchemas.StoreCreateRequest.safeParse(body)
    if (!parsed.success) {
      return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 })
    }
    const store = createMockStore(auth.key, parsed.data)
    const validated = ProfileSchemas.StoreProfileResponse.safeParse(store)
    if (!validated.success) {
      return HttpResponse.json({ message: 'Mock validation failed' }, { status: 500 })
    }
    return HttpResponse.json(validated.data, { status: 201 })
  }),

  http.patch(`${API_URL}/profile/api/v1/profiles/me/stores/:storeId`, async ({ request, params }) => {
    const auth = getAccountFromAuth(request)
    if (!auth) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const parsed = ProfileSchemas.StoreUpdateRequest.safeParse(body)
    if (!parsed.success) {
      return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 })
    }
    const storeId = params.storeId as string
    const store = updateMockStore(auth.key, storeId, parsed.data)
    if (!store) {
      return HttpResponse.json({ message: 'Store not found' }, { status: 404 })
    }
    const validated = ProfileSchemas.StoreProfileResponse.safeParse(store)
    if (!validated.success) {
      return HttpResponse.json({ message: 'Mock validation failed' }, { status: 500 })
    }
    return HttpResponse.json(validated.data)
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
      return HttpResponse.json({ message: 'Mock validation failed' }, { status: 500 })
    }
    return HttpResponse.json(parsed.data)
  }),
]
