import http, { toApiError } from '@/shared/lib/fetcher'

import { schemas as IamSchemas } from '@/generated/openapi/iam/schemas'
import type { components } from '@/generated/openapi/iam/types'
import type { Permission, PermissionRequest } from '../types'

const permissionsBaseUrlV1 = '/iam/api/v1/permissions'
const permissionsBaseUrlV2 = '/iam/api/v2/permissions'

export type PermissionPageDto = components['schemas']['PermissionPage']

export async function listPermissions(params: {
  page: number
  size: number
}): Promise<PermissionPageDto> {
  const { page, size } = params
  try {
    const res = await http.get<unknown>(`${permissionsBaseUrlV2}`, { params: { page, size } })
    const parsed = IamSchemas.PermissionPage.safeParse(res.data)
    if (!parsed.success) throw toApiError(new Error('Invalid PermissionPage schema'))
    return parsed.data as PermissionPageDto
  } catch (err) {
    throw toApiError(err)
  }
}

export async function createPermission(data: PermissionRequest): Promise<Permission> {
  try {
    const res = await http.post<Permission>(permissionsBaseUrlV1, data)
    return res.data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function updatePermission(id: number, data: PermissionRequest): Promise<Permission> {
  try {
    const res = await http.put<Permission>(`${permissionsBaseUrlV1}/${id}`, data)
    return res.data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function deletePermission(id: number): Promise<void> {
  try {
    await http.delete(`${permissionsBaseUrlV1}/${id}`)
  } catch (err) {
    throw toApiError(err)
  }
}
