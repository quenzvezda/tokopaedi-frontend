import { z } from 'zod'

type PermissionPage = {
  content: Array<Permission>
  number?: number | undefined
  size?: number | undefined
  totalElements?: number | undefined
  totalPages?: number | undefined
}
type Permission = {
  id?: (number | null) | undefined
  name: string
  description?: (string | null) | undefined
}
type RolePage = {
  content: Array<Role>
  number?: number | undefined
  size?: number | undefined
  totalElements?: number | undefined
  totalPages?: number | undefined
}
type Role = {
  id?: (number | null) | undefined
  name: string
}

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
const Permission: z.ZodType<Permission> = z
  .object({ id: z.number().int().nullish(), name: z.string(), description: z.string().nullish() })
  .passthrough()
const PermissionRequest = z
  .object({ name: z.string(), description: z.string().nullish() })
  .passthrough()
const Role: z.ZodType<Role> = z
  .object({ id: z.number().int().nullish(), name: z.string() })
  .passthrough()
const RoleRequest = z.object({ name: z.string() }).passthrough()
const PermissionPage: z.ZodType<PermissionPage> = z
  .object({
    content: z.array(Permission),
    number: z.number().int().describe('Zero-based page index').optional(),
    size: z.number().int().optional(),
    totalElements: z.number().int().optional(),
    totalPages: z.number().int().optional(),
  })
  .passthrough()
const RolePage: z.ZodType<RolePage> = z
  .object({
    content: z.array(Role),
    number: z.number().int().describe('Zero-based page index').optional(),
    size: z.number().int().optional(),
    totalElements: z.number().int().optional(),
    totalPages: z.number().int().optional(),
  })
  .passthrough()
const AuthzCheckRequest = z.object({ sub: z.string().uuid(), action: z.string() }).passthrough()

export const schemas = {
  CurrentUser,
  ApiError,
  Permission,
  PermissionRequest,
  Role,
  RoleRequest,
  PermissionPage,
  RolePage,
  AuthzCheckRequest,
}

