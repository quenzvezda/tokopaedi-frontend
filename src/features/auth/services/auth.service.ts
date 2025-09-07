import { z } from 'zod'

import { schemas as AuthSchemas } from '@/generated/openapi/auth/schemas'
import type { components as AuthComponents } from '@/generated/openapi/auth/types'
import http from '@/shared/lib/fetcher'


export type LoginRequestDto = AuthComponents['schemas']['LoginRequest']
// Frontend form validation (stricter than contract): disallow empty strings
export const LoginRequestSchema = z.object({
  usernameOrEmail: z.string().min(1, 'Username or Email is required'),
  password: z.string().min(1, 'Password is required'),
})
export type LoginResponseDto = AuthComponents['schemas']['AccessTokenResponse']

// Use path directly from OpenAPI contract - no need for separate base path
export async function loginService(dto: LoginRequestDto) {
  const body = LoginRequestSchema.parse(dto)
  const res = await http.post<unknown>('/auth/api/v1/login', body)
  return AuthSchemas.AccessTokenResponse.parse(res.data)
}

// Register
export type RegisterRequestDto = AuthComponents['schemas']['RegisterRequest']
export type RegisterResponseDto = AuthComponents['schemas']['RegisterResponse']

export async function registerService(dto: RegisterRequestDto) {
  const body = AuthSchemas.RegisterRequest.parse(dto)
  const res = await http.post<unknown>('/auth/api/v1/register', body)
  return AuthSchemas.RegisterResponse.parse(res.data)
}
