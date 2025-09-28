import type { MockAccountKey } from '../data/accounts'

const nodeBuffer = (globalThis as { Buffer?: { from(input: string, encoding: string): { toString(encoding: string): string } } }).Buffer

function base64UrlEncode(value: string): string {
  if (typeof btoa === 'function') {
    return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '')
  }
  if (nodeBuffer) {
    return nodeBuffer.from(value, 'utf-8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '')
  }
  throw new Error('No base64 encoder available in this environment')
}

function base64UrlDecode(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  if (typeof atob === 'function') {
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    return atob(padded)
  }
  if (nodeBuffer) {
    return nodeBuffer.from(normalized, 'base64').toString('utf-8')
  }
  throw new Error('No base64 decoder available in this environment')
}

export type MockJwtPayload = {
  sub: string
  username: string
  email: string
  roles: string[]
  permissions: string[]
  exp: number
  iat: number
  mockAccountKey: MockAccountKey
}

export function createMockJwt(payload: MockJwtPayload): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  return `${encodedHeader}.${encodedPayload}.mock-signature`
}

export function decodeMockJwt(token: string): Partial<MockJwtPayload> | null {
  const parts = token.split('.')
  if (parts.length < 2) return null
  try {
    const decoded = base64UrlDecode(parts[1] ?? '')
    return JSON.parse(decoded) as Partial<MockJwtPayload>
  } catch {
    return null
  }
}
