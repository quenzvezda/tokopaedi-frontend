import { schemas as AuthSchemas } from '@/generated/openapi/auth/schemas'
import type { components as AuthComponents } from '@/generated/openapi/auth/types'
import http, { toApiError } from '@/shared/lib/fetcher'

const usersBaseUrl = '/auth/api/v1/users'
const userRolesBaseUrl = '/iam/api/v1/users'

export type UserPageDto = AuthComponents['schemas']['UserPage']
export type UserListParams = { page: number; size: number; q?: string; sort?: string[] }

function buildUserSearchParams(params: UserListParams): URLSearchParams {
  const usp = new URLSearchParams()
  usp.set('page', String(params.page))
  usp.set('size', String(params.size))
  const trimmedQ = params.q?.trim()
  if (trimmedQ && trimmedQ.length >= 2) usp.set('q', trimmedQ)
  if (params.sort && params.sort.length > 0) {
    for (const value of params.sort) usp.append('sort', value)
  } else {
    usp.append('sort', 'username,asc')
  }
  return usp
}

export async function listUsers(params: UserListParams): Promise<UserPageDto> {
  const usp = buildUserSearchParams(params)
  try {
    const res = await http.get<unknown>(usersBaseUrl, { params: usp })
    const parsed = AuthSchemas.UserPage.safeParse(res.data)
    if (!parsed.success) throw new Error(`Invalid UserPage schema: ${parsed.error.message}`)
    return parsed.data as UserPageDto
  } catch (err) {
    throw toApiError(err)
  }
}

export async function getUserRoles(accountId: string): Promise<string[]> {
  try {
    const res = await http.get<string[]>(`${userRolesBaseUrl}/${accountId}/roles`)
    return res.data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function assignRoleToUser(accountId: string, roleId: number): Promise<void> {
  try {
    await http.post(`/iam/api/v1/assign/user/${accountId}/role/${roleId}`)
  } catch (err) {
    throw toApiError(err)
  }
}

export async function removeRoleFromUser(accountId: string, roleId: number): Promise<void> {
  try {
    await http.delete(`/iam/api/v1/assign/user/${accountId}/role/${roleId}`)
  } catch (err) {
    throw toApiError(err)
  }
}
