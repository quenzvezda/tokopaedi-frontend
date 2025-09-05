import http from '../../lib/http'
import type { LoginRequest, LoginResponse } from './types'

export async function login(body: LoginRequest) {
  const res = await http.post<LoginResponse>('/auth/api/v1/auth/login', body)
  return res.data
}

