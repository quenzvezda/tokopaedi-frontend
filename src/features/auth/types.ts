export type LoginRequest = {
  usernameOrEmail: string
  password: string
}

export type LoginResponse = {
  accessToken?: string
  tokenType?: string
  [key: string]: unknown
}
