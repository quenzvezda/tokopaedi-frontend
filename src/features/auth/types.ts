export type LoginRequest = {
  usernameOrEmail: string
  password: string
}

export type LoginResponse = {
  accessToken?: string
  refreshToken?: string
  tokenType?: string
  [key: string]: unknown
}

