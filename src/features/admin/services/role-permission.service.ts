import http, { toApiError, type ApiError } from '@/shared/lib/fetcher'

import type { Permission } from '../types'
import type { AxiosError } from 'axios'

const baseUrl = '/iam/api/v1'

export const ROLE_PERMISSION_ENDPOINT_FALLBACK_MESSAGE =
  'Endpoint role-permission terbaru belum tersedia di backend. Mohon pastikan layanan IAM sudah diperbarui.'

export type RolePermissionQuery = {
  available?: boolean
}

const consolidatedEndpointFallbackError: ApiError = {
  code: 'IAM_ROLE_PERMISSION_ENDPOINT_NOT_READY',
  message: ROLE_PERMISSION_ENDPOINT_FALLBACK_MESSAGE,
}

async function fetchRolePermissions(
  roleId: number,
  { available = false }: RolePermissionQuery = {},
): Promise<Permission[]> {
  try {
    const res = await http.get<Permission[]>(`${baseUrl}/roles/${roleId}/permissions`, {
      params: { available },
    })
    return res.data
  } catch (err) {
    const axiosError = err as AxiosError
    if (axiosError?.response?.status === 404) {
      throw consolidatedEndpointFallbackError
    }
    throw toApiError(err)
  }
}

export async function listRolePermissions(
  roleId: number,
  query?: RolePermissionQuery,
): Promise<Permission[]> {
  return fetchRolePermissions(roleId, query)
}

export async function listAvailableRolePermissions(roleId: number): Promise<Permission[]> {
  return fetchRolePermissions(roleId, { available: true })
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
