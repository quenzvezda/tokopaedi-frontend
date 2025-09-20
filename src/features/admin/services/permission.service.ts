import { schemas as IamSchemas } from '@/generated/openapi/iam/schemas'
import type { components } from '@/generated/openapi/iam/types'
import http, { toApiError } from '@/shared/lib/fetcher'

import type { Permission, PermissionRequest } from '../types'

const permissionsBaseUrlV1 = '/iam/api/v1/permissions'
const permissionsBaseUrlV2 = '/iam/api/v2/permissions'

export type PermissionPageDto = components['schemas']['PermissionPage']
type PermissionDto = components['schemas']['Permission']
type PermissionBulkRequestDto = components['schemas']['PermissionBulkRequest']
type PermissionBulkResponseDto = components['schemas']['PermissionBulkResponse']

export type PermissionListParams = { page: number; size: number; q?: string; sort?: string[] }

function buildSearchParams(params: PermissionListParams): URLSearchParams {
  const usp = new URLSearchParams()
  usp.set('page', String(params.page))
  usp.set('size', String(params.size))
  if (params.q && params.q.trim().length >= 2) usp.set('q', params.q.trim())
  if (params.sort && params.sort.length > 0) {
    for (const s of params.sort) usp.append('sort', s)
  } else {
    // Default server-side sort to keep results predictable without polluting the URL
    usp.append('sort', 'name,asc')
  }
  return usp
}

function toPermission(dto: PermissionDto): Permission {
  if (dto.id == null) throw new Error('Permission response missing identifier')
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? undefined,
  }
}

function toPermissionRequestDto(request: PermissionRequest): components['schemas']['PermissionRequest'] {
  return {
    name: request.name,
    description: request.description ?? null,
  }
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

export async function createPermissionsBulk(requests: PermissionRequest[]): Promise<Permission[]> {
  if (requests.length === 0) return []

  const payload: PermissionBulkRequestDto = {
    permissions: requests.map(toPermissionRequestDto),
  }

  const parsedPayload = IamSchemas.PermissionBulkRequest.safeParse(payload)
  if (!parsedPayload.success) {
    throw toApiError(new Error('Invalid permission bulk request payload'))
  }

  try {
    const res = await http.post<PermissionBulkResponseDto>(permissionsBaseUrlV2, parsedPayload.data)
    const parsedResponse = IamSchemas.PermissionBulkResponse.safeParse(res.data)
    if (!parsedResponse.success) throw new Error('Invalid PermissionBulkResponse schema')
    return parsedResponse.data.created.map(toPermission)
  } catch (err) {
    throw toApiError(err)
  }
}

export async function createPermission(request: PermissionRequest): Promise<Permission> {
  const [created] = await createPermissionsBulk([request])
  return created
}

export async function updatePermission(id: number, data: PermissionRequest): Promise<Permission> {
  try {
    const res = await http.put<PermissionDto>(`${permissionsBaseUrlV1}/${id}`, toPermissionRequestDto(data))
    return toPermission(res.data)
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
