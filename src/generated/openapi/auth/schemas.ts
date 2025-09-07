import { z } from 'zod'

const RegisterRequest = z
  .object({ username: z.string(), email: z.string().email(), password: z.string() })
  .passthrough()
const RegisterResponse = z.object({ message: z.string() }).passthrough()
const ApiError = z
  .object({
    code: z.string().nullish(),
    message: z.string(),
    upstream: z.object({}).partial().passthrough().nullish(),
  })
  .passthrough()
const LoginRequest = z.object({ usernameOrEmail: z.string(), password: z.string() }).passthrough()
const AccessTokenResponse = z
  .object({ tokenType: z.string(), accessToken: z.string(), expiresIn: z.number().int() })
  .passthrough()

export const schemas = {
  RegisterRequest,
  RegisterResponse,
  ApiError,
  LoginRequest,
  AccessTokenResponse,
}
