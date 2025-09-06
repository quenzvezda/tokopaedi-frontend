import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { AuthContext, type AuthContextValue } from '../../auth/context'
import { useLogout } from '../api/hooks'

// Mock axios fetcher to avoid real network
vi.mock('@/shared/lib/fetcher', () => {
  const post = vi.fn()
  const mock = {
    get: vi.fn(),
    post,
    interceptors: { request: { use: () => {} }, response: { use: () => {} } },
  }
  return { default: mock, http: mock, _post: post }
})

// Spy navigate
const navigateSpy = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigateSpy }
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
    <AuthContext.Provider value={value}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </AuthContext.Provider>
  )
  return { Wrapper, client, ctx: value }
}

describe('useLogout redirect', () => {
  beforeEach(async () => {
    navigateSpy.mockReset()
    const mod = (await import('@/shared/lib/fetcher')) as unknown as {
      _post: ReturnType<typeof vi.fn>
    }
    mod._post.mockReset()
    mod._post.mockResolvedValueOnce({ data: {} })
  })

  it('calls logoutLocal and navigates to /login', async () => {
    const { Wrapper, ctx } = createWrapper({ logoutLocal: vi.fn() })
    const { result } = renderHook(() => useLogout(), { wrapper: Wrapper })

    await act(async () => {
      await result.current.mutateAsync()
    })

    expect(ctx.logoutLocal).toHaveBeenCalledTimes(1)
    expect(navigateSpy).toHaveBeenCalledWith('/login', { replace: true })
  })
})

