import http, { toApiError } from '@/shared/lib/fetcher'

import type { Permission } from '../types'

const baseUrl = '/iam/api/v1'

export async function listRolePermissions(roleId: number): Promise<Permission[]> {
  try {
    const res = await http.get<Permission[]>(`${baseUrl}/roles/${roleId}/permissions`)
    return res.data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function listAvailableRolePermissions(roleId: number): Promise<Permission[]> {
  try {
    const res = await http.get<Permission[]>(`${baseUrl}/roles/${roleId}/permissions/available`)
    return res.data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function assignPermissionToRole(roleId: number, permissionId: number): Promise<void> {
  try {
    await http.post(`${baseUrl}/assign/role/${roleId}/permission/${permissionId}`)
  } catch (err) {
    throw toApiError(err)
  }
}

export async function removePermissionFromRole(roleId: number, permissionId: number): Promise<void> {
  try {
    await http.delete(`${baseUrl}/assign/role/${roleId}/permission/${permissionId}`)
  } catch (err) {
    throw toApiError(err)
  }
}
