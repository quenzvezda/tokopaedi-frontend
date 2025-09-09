import http, { toApiError } from '@/shared/lib/fetcher'

import { Permission, PermissionRequest } from '../types'

const permissionsBaseUrl = '/iam/api/v1/permissions'

export async function listPermissions(): Promise<Permission[]> {
  try {
    const res = await http.get<Permission[]>(permissionsBaseUrl)
    return res.data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function createPermission(data: PermissionRequest): Promise<Permission> {
  try {
    const res = await http.post<Permission>(permissionsBaseUrl, data)
    return res.data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function updatePermission(id: number, data: PermissionRequest): Promise<Permission> {
  try {
    const res = await http.put<Permission>(`${permissionsBaseUrl}/${id}`, data)
    return res.data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function deletePermission(id: number): Promise<void> {
  try {
    await http.delete(`${permissionsBaseUrl}/${id}`)
  } catch (err) {
    throw toApiError(err)
  }
}
