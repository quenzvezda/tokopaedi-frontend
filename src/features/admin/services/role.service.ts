import http, { toApiError } from '@/shared/lib/fetcher'

import { schemas as IamSchemas } from '@/generated/openapi/iam/schemas'
import type { components } from '@/generated/openapi/iam/types'
import type { Role, RoleRequest } from '../types'

const rolesBaseUrlV1 = '/iam/api/v1/roles'
const rolesBaseUrlV2 = '/iam/api/v2/roles'

export type RolePageDto = components['schemas']['RolePage']

export async function listRoles(params: { page: number; size: number }): Promise<RolePageDto> {
  const { page, size } = params
  try {
    const res = await http.get<unknown>(`${rolesBaseUrlV2}`, { params: { page, size } })
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
