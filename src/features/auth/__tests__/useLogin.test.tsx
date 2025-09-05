import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { AuthProvider } from '../../auth/AuthContext'
import { useLogin } from '../api/hooks'

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient()
  return (
    <AuthProvider>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </AuthProvider>
  )
}

describe('useLogin', () => {
  it('logs in successfully with valid credentials', async () => {
    const { result } = renderHook(() => useLogin(), { wrapper })
    await act(async () => {
      await result.current.mutateAsync({ usernameOrEmail: 'user', password: 'pass' })
    })
    expect(result.current.isSuccess).toBe(true)
  })
})

vi.mock('@/shared/lib/fetcher', () => {
  const httpMock = {
    post: async () => ({ data: { accessToken: 'header.payload.sig' } }),
    interceptors: { request: { use: () => {} }, response: { use: () => {} } },
  }
  return {
    default: httpMock,
    http: httpMock,
    setAccessTokenGetter: () => {},
    setAccessTokenSetter: () => {},
    setOnAuthLogout: () => {},
    triggerRefresh: async () => null,
  }
})
