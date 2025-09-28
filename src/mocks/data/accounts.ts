import type { components as IamComponents } from '@/generated/openapi/iam/types'
import type { components as ProfileComponents } from '@/generated/openapi/profile/types'

export type MockAccountKey = 'ADMIN' | 'SELLER' | 'CUSTOMER'

export type CurrentUser = IamComponents['schemas']['CurrentUser']
export type UserProfile = ProfileComponents['schemas']['UserProfileResponse']
export type UserProfileUpdate = ProfileComponents['schemas']['UserProfileUpdateRequest']
export type StoreProfile = ProfileComponents['schemas']['StoreProfileResponse']
export type StoreCreateInput = ProfileComponents['schemas']['StoreCreateRequest']
export type StoreUpdateInput = ProfileComponents['schemas']['StoreUpdateRequest']

interface AccountCredentials {
  id: string
  username: string
  email: string
  password: string
  roles: string[]
  permissions: string[]
}

interface AccountState {
  key: MockAccountKey
  account: AccountCredentials
  profile: UserProfile
  stores: StoreProfile[]
}

const ALLOWED_KEYS = ['ADMIN', 'SELLER', 'CUSTOMER'] as const satisfies readonly MockAccountKey[]

const BASE_TIMESTAMP = '2024-01-01T08:00:00.000Z'
const SELLER_STORE_ID = '6e8f3c1d-2b4a-4c8d-9e7f-1234abcd5678'

function cloneState(state: AccountState): AccountState {
  return {
    key: state.key,
    account: {
      ...state.account,
      roles: [...state.account.roles],
      permissions: [...state.account.permissions],
    },
    profile: { ...state.profile },
    stores: state.stores.map((store) => ({ ...store })),
  }
}

const initialAccounts: Record<MockAccountKey, AccountState> = {
  ADMIN: {
    key: 'ADMIN',
    account: {
      id: '0f9db8e3-5a4d-4b2f-9c1d-1234567890ab',
      username: 'admin',
      email: 'admin@tokopaedi.test',
      password: 'admin123',
      roles: ['ADMIN'],
      permissions: ['catalog:product:write', 'catalog:product:read', 'profile:profile:read'],
    },
    profile: {
      userId: '0f9db8e3-5a4d-4b2f-9c1d-1234567890ab',
      fullName: 'Admin Tokopaedi',
      bio: 'System administrator',
      phone: '+62111111111',
      avatarObjectKey: null,
      createdAt: BASE_TIMESTAMP,
      updatedAt: BASE_TIMESTAMP,
    },
    stores: [],
  },
  SELLER: {
    key: 'SELLER',
    account: {
      id: '1a2b3c4d-5e6f-4a70-8b9c-d0e1f2a3b4c5',
      username: 'seller',
      email: 'seller@tokopaedi.test',
      password: 'seller123',
      roles: ['SELLER', 'CUSTOMER'],
      permissions: ['catalog:product:read', 'profile:profile:read'],
    },
    profile: {
      userId: '1a2b3c4d-5e6f-4a70-8b9c-d0e1f2a3b4c5',
      fullName: 'Seller Tokopaedi',
      bio: 'Trusted marketplace seller',
      phone: '+62222222222',
      avatarObjectKey: null,
      createdAt: BASE_TIMESTAMP,
      updatedAt: BASE_TIMESTAMP,
    },
    stores: [
      {
        id: SELLER_STORE_ID,
        ownerId: '1a2b3c4d-5e6f-4a70-8b9c-d0e1f2a3b4c5',
        name: 'Seller Central Store',
        slug: 'seller-central-store',
        description: 'Primary storefront for the default seller account.',
        active: true,
        createdAt: BASE_TIMESTAMP,
        updatedAt: BASE_TIMESTAMP,
      },
    ],
  },
  CUSTOMER: {
    key: 'CUSTOMER',
    account: {
      id: '2b3c4d5e-6f70-4b81-92a3-b4c5d6e7f809',
      username: 'customer',
      email: 'customer@tokopaedi.test',
      password: 'customer123',
      roles: ['CUSTOMER'],
      permissions: ['profile:profile:read'],
    },
    profile: {
      userId: '2b3c4d5e-6f70-4b81-92a3-b4c5d6e7f809',
      fullName: 'Customer Tokopaedi',
      bio: 'Loyal customer',
      phone: '+62333333333',
      avatarObjectKey: null,
      createdAt: BASE_TIMESTAMP,
      updatedAt: BASE_TIMESTAMP,
    },
    stores: [],
  },
}

const accountStore = new Map<MockAccountKey, AccountState>(
  Object.entries(initialAccounts).map(([key, value]) => [key as MockAccountKey, cloneState(value)]),
)

export function resolveAccountKey(value: string | undefined): MockAccountKey {
  if (!value) return 'CUSTOMER'
  const upper = value.toUpperCase() as MockAccountKey
  return (ALLOWED_KEYS as readonly string[]).includes(upper) ? upper : 'CUSTOMER'
}

export function getAccountByKey(key: MockAccountKey): AccountState {
  const account = accountStore.get(key)
  if (!account) {
    throw new Error(`Unknown mock account key: ${key}`)
  }
  return account
}

export function getAccountById(id: string): AccountState | null {
  for (const account of accountStore.values()) {
    if (account.account.id === id) return account
  }
  return null
}

export function findAccountByCredential(
  identifier: string,
  password: string,
): AccountState | null {
  const normalized = identifier.trim().toLowerCase()
  for (const account of accountStore.values()) {
    const { username, email, password: pwd } = account.account
    if (pwd !== password) continue
    if (username.toLowerCase() === normalized || email.toLowerCase() === normalized) {
      return account
    }
  }
  return null
}

export function toCurrentUserPayload(account: AccountState): CurrentUser {
  return {
    id: account.account.id,
    username: account.account.username,
    email: account.account.email,
    roles: [...account.account.roles],
    permissions: [...account.account.permissions],
  }
}

export function getProfile(key: MockAccountKey): UserProfile {
  const account = getAccountByKey(key)
  return { ...account.profile }
}

export function updateProfile(key: MockAccountKey, input: UserProfileUpdate): UserProfile {
  const account = getAccountByKey(key)
  if (typeof input.fullName === 'string') {
    account.profile.fullName = input.fullName
  }
  if (input.bio !== undefined) {
    account.profile.bio = input.bio ?? null
  }
  if (input.phone !== undefined) {
    account.profile.phone = input.phone ?? null
  }
  if (input.avatarObjectKey !== undefined) {
    account.profile.avatarObjectKey = input.avatarObjectKey ?? null
  }
  account.profile.updatedAt = new Date().toISOString()
  return { ...account.profile }
}

export function listStores(key: MockAccountKey): StoreProfile[] {
  const account = getAccountByKey(key)
  return account.stores.map((store) => ({ ...store }))
}

export function createStore(key: MockAccountKey, input: StoreCreateInput): StoreProfile {
  const account = getAccountByKey(key)
  const now = new Date().toISOString()
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : cryptoIdFallback()
  const store: StoreProfile = {
    id,
    ownerId: account.account.id,
    name: input.name,
    slug: input.slug,
    description: input.description ?? null,
    active: true,
    createdAt: now,
    updatedAt: now,
  }
  account.stores.push(store)
  return { ...store }
}

export function updateStore(
  key: MockAccountKey,
  storeId: string,
  input: StoreUpdateInput,
): StoreProfile | null {
  const account = getAccountByKey(key)
  const store = account.stores.find((s) => s.id === storeId)
  if (!store) return null
  if (typeof input.name === 'string') {
    store.name = input.name
  }
  if (typeof input.slug === 'string') {
    store.slug = input.slug
  }
  if (input.description !== undefined) {
    store.description = input.description ?? null
  }
  if (typeof input.active === 'boolean') {
    store.active = input.active
  }
  store.updatedAt = new Date().toISOString()
  return { ...store }
}

function cryptoIdFallback(): string {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`
}
