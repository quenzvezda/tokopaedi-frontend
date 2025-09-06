import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, act, waitFor } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import { AuthContext, type AuthContextValue } from '../../auth/context'
import { useCurrentUser, useLogin, useLogout } from '../api/hooks'

vi.mock('@/shared/lib/fetcher', () => {
  const get = vi.fn()
  const post = vi.fn()
  const mock = {
    get,
    post,
    interceptors: { request: { use: () => {} }, response: { use: () => {} } },
  }
  return { default: mock, http: mock, _get: get, _post: post }
})

function createWrapper(ctxValue?: Partial<AuthContextValue>) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const defaultCtx: AuthContextValue = {
    accessToken: 'token',
    exp: null,
    initializing: false,
    roles: [],
    isAuthenticated: true,
    setAccessToken: vi.fn(),
    refresh: vi.fn(async () => null),
    logoutLocal: vi.fn(),
  }
  const value = { ...defaultCtx, ...(ctxValue || {}) }
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
      <AuthContext.Provider value={value}>
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      </AuthContext.Provider>
    </MemoryRouter>
  )
  return { Wrapper, client }
}

describe('useCurrentUser', () => {
  beforeEach(async () => {
    const mod = (await import('@/shared/lib/fetcher')) as unknown as {
      _get: ReturnType<typeof vi.fn>
      _post: ReturnType<typeof vi.fn>
    }
    mod._get.mockReset()
    mod._post.mockReset()
  })

  it('fetches current user when authenticated', async () => {
    const data = {
      id: 'u-1',
      username: 'alice',
      roles: ['USER'],
      permissions: ['SCOPE_product:read'],
    }
    const mod = (await import('@/shared/lib/fetcher')) as unknown as {
      _get: ReturnType<typeof vi.fn>
    }
    mod._get.mockResolvedValueOnce({ data })

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useCurrentUser(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ ...data, email: undefined })
  })

  it('invalidates and refetches on login()', async () => {
    const first = { id: 'u-1', username: 'alice', roles: ['USER'], permissions: [] as string[] }
    const second = { id: 'u-1', username: 'alice', roles: ['ADMIN'], permissions: ['SCOPE_admin'] }

    const mod = (await import('@/shared/lib/fetcher')) as unknown as {
      _get: ReturnType<typeof vi.fn>
      _post: ReturnType<typeof vi.fn>
    }
    mod._get.mockResolvedValueOnce({ data: first })

    const { Wrapper } = createWrapper()
    const { result, rerender } = renderHook(
      () => ({ user: useCurrentUser(), login: useLogin() }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(result.current.user.isSuccess).toBe(true))
    expect(result.current.user.data?.roles).toEqual(['USER'])

    // Next GET should return updated roles
    mod._get.mockResolvedValueOnce({ data: second })
    mod._post.mockResolvedValueOnce({ data: { accessToken: 'new' } })

    await act(async () => {
      await result.current.login.mutateAsync({ usernameOrEmail: 'x', password: 'y' })
    })

    // Force hook evaluation
    rerender()
    await waitFor(() => expect(result.current.user.data?.roles).toEqual(['ADMIN']))
  })

  it('clears cached user on logout()', async () => {
    const first = { id: 'u-1', username: 'alice', roles: ['USER'], permissions: [] as string[] }

    const mod = (await import('@/shared/lib/fetcher')) as unknown as {
      _get: ReturnType<typeof vi.fn>
      _post: ReturnType<typeof vi.fn>
    }
    mod._get.mockResolvedValueOnce({ data: first })
    mod._post.mockResolvedValueOnce({ data: {} })

    const { Wrapper, client } = createWrapper({ logoutLocal: vi.fn() })
    const { result } = renderHook(
      () => ({ user: useCurrentUser(), logout: useLogout() }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(result.current.user.isSuccess).toBe(true))
    expect(client.getQueryData(['currentUser'])).toBeTruthy()

    await act(async () => {
      await result.current.logout.mutateAsync()
    })

    expect(client.getQueryData(['currentUser'])).toBeUndefined()
  })
})
