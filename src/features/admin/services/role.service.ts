import http, { toApiError } from '@/shared/lib/fetcher'

import type { Role, RoleRequest } from '../types'

const rolesBaseUrl = '/iam/api/v1/roles'

export async function listRoles(): Promise<Role[]> {
  try {
    const res = await http.get<Role[]>(rolesBaseUrl)
    return res.data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function createRole(data: RoleRequest): Promise<Role> {
  try {
    const res = await http.post<Role>(rolesBaseUrl, data)
    return res.data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function updateRole(id: number, data: RoleRequest): Promise<Role> {
  try {
    const res = await http.put<Role>(`${rolesBaseUrl}/${id}`, data)
    return res.data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function deleteRole(id: number): Promise<void> {
  try {
    await http.delete(`${rolesBaseUrl}/${id}`)
  } catch (err) {
    throw toApiError(err)
  }
}
