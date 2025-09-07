import { z } from 'zod'

const CurrentUser = z
  .object({
    id: z.string(),
    username: z.string(),
    email: z.string().email().nullish(),
    roles: z.array(z.string()),
    permissions: z.array(
      z.string().describe('permission string in `<service>:<subject>:<action>`'),
    ),
  })
  .passthrough()
const ApiError = z.object({ code: z.string().nullish(), message: z.string() }).passthrough()
const Permission = z
  .object({ id: z.number().int().nullish(), name: z.string(), description: z.string().nullish() })
  .passthrough()
const PermissionRequest = z
  .object({ name: z.string(), description: z.string().nullish() })
  .passthrough()
const Role = z.object({ id: z.number().int().nullish(), name: z.string() }).passthrough()
const RoleRequest = z.object({ name: z.string() }).passthrough()
const AuthzCheckRequest = z.object({ sub: z.string().uuid(), action: z.string() }).passthrough()

export const schemas = {
  CurrentUser,
  ApiError,
  Permission,
  PermissionRequest,
  Role,
  RoleRequest,
  AuthzCheckRequest,
}
