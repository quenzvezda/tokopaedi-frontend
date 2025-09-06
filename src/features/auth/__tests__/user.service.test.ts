import { describe, it, expect, vi, beforeEach } from 'vitest'

import { getCurrentUserService } from '../../auth/services/user.service'

vi.mock('@/shared/lib/fetcher', () => {
  const get = vi.fn()
  const mock = {
    get,
    interceptors: { request: { use: () => {} }, response: { use: () => {} } },
  }
  return { default: mock, http: mock, _get: get }
})

describe('getCurrentUserService', () => {
beforeEach(async () => {
    // reset mock calls/implementations between tests
    const mod = (await import('@/shared/lib/fetcher')) as unknown as { _get: ReturnType<typeof vi.fn> }
    mod._get.mockReset()
  })

  it('calls /iam/api/v1/users/me and returns parsed data', async () => {
    const data = {
      id: '11111111-2222-3333-4444-555555555555',
      username: 'alice',
      email: 'alice@example.com',
      roles: ['USER', 'ADMIN'],
      permissions: ['catalog:product:read'],
    }
    const mod = (await import('@/shared/lib/fetcher')) as unknown as { _get: ReturnType<typeof vi.fn> }
    mod._get.mockResolvedValueOnce({ data })

    const result = await getCurrentUserService()
    expect(mod._get).toHaveBeenCalledWith('/iam/api/v1/users/me')
    expect(result).toEqual(data)
  })

  it('defaults missing roles/permissions to empty arrays and omits email', async () => {
    const data = { id: 'id-1', username: 'bob' }
    const mod = (await import('@/shared/lib/fetcher')) as unknown as { _get: ReturnType<typeof vi.fn> }
    mod._get.mockResolvedValueOnce({ data })

    const result = await getCurrentUserService()
    expect(result.id).toBe('id-1')
    expect(result.username).toBe('bob')
    expect(result.email).toBeUndefined()
    expect(result.roles).toEqual([])
    expect(result.permissions).toEqual([])
  })

  it('throws when response violates schema', async () => {
    const bad = { id: 123, username: 'charlie', roles: 'ADMIN' }
    const mod = (await import('@/shared/lib/fetcher')) as unknown as { _get: ReturnType<typeof vi.fn> }
    mod._get.mockResolvedValueOnce({ data: bad })

    await expect(getCurrentUserService()).rejects.toBeInstanceOf(Error)
  })
})
