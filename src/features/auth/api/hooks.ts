import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { decodeJwtPayload } from '@/lib/jwt'

import { loginService, type LoginRequestDto } from '../services/auth.service'
import { useAuth } from '../useAuth'

export function useLogin() {
  const { setAccessToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: LoginRequestDto) => loginService(input),
    onSuccess: (data) => {
      const token = data.accessToken
      if (token) setAccessToken(token)
      qc.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })
}

export type CurrentUser = {
  sub?: string
  roles: string[]
}

// Minimal user from JWT payload to satisfy guard and UI needs
export function useCurrentUser() {
  const { accessToken } = useAuth()
  return useQuery<CurrentUser>({
    queryKey: ['currentUser'],
    enabled: !!accessToken,
    queryFn: async () => {
      if (!accessToken) return { roles: [] }
      const payload = decodeJwtPayload<Record<string, unknown>>(accessToken)
      const rolesRaw = (payload?.roles || payload?.authorities || payload?.scope) as
        | string[]
        | string
        | undefined
      const roles = Array.isArray(rolesRaw)
        ? rolesRaw.map(String)
        : typeof rolesRaw === 'string'
          ? rolesRaw.split(/\s+/g)
          : []
      return { sub: (payload?.sub as string | undefined) ?? undefined, roles }
    },
    staleTime: 0,
  })
}

export function useLogout() {
  const { logoutLocal } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      try {
        // Try backend logout if available; ignore failures
        await (await import('@/shared/lib/fetcher')).default.post('/auth/api/v1/auth/logout')
      } catch {
        void 0
      }
      return true as const
    },
    onSettled: () => {
      logoutLocal()
      qc.removeQueries()
    },
  })
}
