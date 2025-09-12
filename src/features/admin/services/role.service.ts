import { schemas as IamSchemas } from '@/generated/openapi/iam/schemas'
import type { components } from '@/generated/openapi/iam/types'
import http, { toApiError } from '@/shared/lib/fetcher'

import type { Role, RoleRequest } from '../types'

const rolesBaseUrlV1 = '/iam/api/v1/roles'
const rolesBaseUrlV2 = '/iam/api/v2/roles'

export type RolePageDto = components['schemas']['RolePage']

export type RoleListParams = { page: number; size: number; q?: string; sort?: string[] }

function buildSearchParams(params: RoleListParams): URLSearchParams {
  const usp = new URLSearchParams()
  usp.set('page', String(params.page))
  usp.set('size', String(params.size))
  if (params.q && params.q.trim().length >= 2) usp.set('q', params.q.trim())
  if (params.sort && params.sort.length > 0) {
    for (const s of params.sort) usp.append('sort', s)
  }
  return usp
}

export async function listRoles(params: RoleListParams): Promise<RolePageDto> {
  const usp = buildSearchParams(params)
  try {
    const res = await http.get<unknown>(`${rolesBaseUrlV2}`, { params: usp })
    const parsed = IamSchemas.RolePage.safeParse(res.data)
    if (!parsed.success) throw toApiError(new Error('Invalid RolePage schema'))
    return parsed.data as RolePageDto
  } catch (err) {
    throw toApiError(err)
  }
}

export async function getRole(id: number): Promise<Role> {
  try {
    const res = await http.get<Role>(`${rolesBaseUrlV1}/${id}`)
    return res.data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function createRole(data: RoleRequest): Promise<Role> {
  try {
    const res = await http.post<Role>(rolesBaseUrlV1, data)
    return res.data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function updateRole(id: number, data: RoleRequest): Promise<Role> {
  try {
    const res = await http.put<Role>(`${rolesBaseUrlV1}/${id}`, data)
    return res.data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function deleteRole(id: number): Promise<void> {
  try {
    await http.delete(`${rolesBaseUrlV1}/${id}`)
  } catch (err) {
    throw toApiError(err)
  }
}
