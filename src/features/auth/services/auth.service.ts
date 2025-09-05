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
