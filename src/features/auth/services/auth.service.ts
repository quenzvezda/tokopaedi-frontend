import { z } from 'zod'

import http from '@/shared/lib/fetcher'

export const LoginRequestSchema = z.object({
  usernameOrEmail: z.string().min(1, 'Username or Email is required'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginRequestDto = z.infer<typeof LoginRequestSchema>

export const LoginResponseSchema = z.object({
  accessToken: z.string().optional(),
  tokenType: z.string().optional(),
})

export type LoginResponseDto = z.infer<typeof LoginResponseSchema>

export async function loginService(dto: LoginRequestDto) {
  const body = LoginRequestSchema.parse(dto)
  const res = await http.post<LoginResponseDto>('/auth/api/v1/auth/login', body)
  return LoginResponseSchema.parse(res.data)
}

// Register
export const RegisterRequestSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type RegisterRequestDto = z.infer<typeof RegisterRequestSchema>

// Response is not strictly defined yet; accept common fields or empty {}
export const RegisterResponseSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    username: z.string().optional(),
    email: z.string().email().optional(),
    message: z.string().optional(),
  })
  .passthrough()

export type RegisterResponseDto = z.infer<typeof RegisterResponseSchema>

export async function registerService(dto: RegisterRequestDto) {
  const body = RegisterRequestSchema.parse(dto)
  const res = await http.post<unknown>('/auth/api/v1/auth/register', body)
  // Some backends may return 201 with empty body; guard for that
  const data = (res.data ?? {}) as unknown
  return RegisterResponseSchema.parse(data)
}
