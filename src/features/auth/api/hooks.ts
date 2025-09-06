import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import {
  loginService,
  type LoginRequestDto,
  registerService,
  type RegisterRequestDto,
} from '../services/auth.service'
import { getCurrentUserService, type CurrentUserDto } from '../services/user.service'
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

export type CurrentUser = Pick<CurrentUserDto, 'id' | 'username' | 'email' | 'roles' | 'permissions'>

export function useCurrentUser() {
  const { accessToken } = useAuth()
  return useQuery<CurrentUser>({
    queryKey: ['currentUser'],
    enabled: !!accessToken,
    queryFn: async () => {
      const data = await getCurrentUserService()
      return {
        id: data.id,
        username: data.username,
        email: data.email,
        roles: data.roles || [],
        permissions: data.permissions || [],
      }
    },
    // cache for the session; invalidated on login/logout
    staleTime: 5 * 60 * 1000,
  })
}

export function useLogout() {
  const { logoutLocal } = useAuth()
  const qc = useQueryClient()
  const navigate = useNavigate()
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
      navigate('/login', { replace: true })
    },
  })
}

export function useRegister() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: RegisterRequestDto) => registerService(input),
    onSuccess: () => {
      // No token expected from register; just ensure user cache is clean
      qc.removeQueries({ queryKey: ['currentUser'] })
    },
  })
}
