import { schemas as IamSchemas } from '@/generated/openapi/iam/schemas'
import type { components } from '@/generated/openapi/iam/types'
import http, { toApiError } from '@/shared/lib/fetcher'

import type { Permission, PermissionRequest } from '../types'

const permissionsBaseUrlV1 = '/iam/api/v1/permissions'
const permissionsBaseUrlV2 = '/iam/api/v2/permissions'

export type PermissionPageDto = components['schemas']['PermissionPage']

export type PermissionListParams = { page: number; size: number; q?: string; sort?: string[] }

function buildSearchParams(params: PermissionListParams): URLSearchParams {
  const usp = new URLSearchParams()
  usp.set('page', String(params.page))
  usp.set('size', String(params.size))
  if (params.q && params.q.trim().length >= 2) usp.set('q', params.q.trim())
  if (params.sort && params.sort.length > 0) {
    for (const s of params.sort) usp.append('sort', s)
  }
  return usp
}

export async function listPermissions(params: PermissionListParams): Promise<PermissionPageDto> {
  const usp = buildSearchParams(params)
  try {
    const res = await http.get<unknown>(`${permissionsBaseUrlV2}`, { params: usp })
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
