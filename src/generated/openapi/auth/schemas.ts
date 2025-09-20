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
const User = z.object({ id: z.string().uuid(), username: z.string() }).passthrough()
const UserPage = z
  .object({
    content: z.array(User),
    number: z.number().int().describe('Zero-based page index').optional(),
    size: z.number().int().optional(),
    totalElements: z.number().int().optional(),
    totalPages: z.number().int().optional(),
  })
  .passthrough()

export const schemas = {
  RegisterRequest,
  RegisterResponse,
  ApiError,
  LoginRequest,
  AccessTokenResponse,
  User,
  UserPage,
}
