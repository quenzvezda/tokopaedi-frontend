import { z } from 'zod'

import { schemas as IamSchemas } from '@/generated/openapi/iam/schemas'
import type { components } from '@/generated/openapi/iam/types'
import http from '@/shared/lib/fetcher'

export type CurrentUserDto = components['schemas']['CurrentUser']

// Use path directly from OpenAPI contract - no need for separate base path
export async function getCurrentUserService(): Promise<CurrentUserDto> {
  const res = await http.get<unknown>('/iam/api/v1/users/me')
  // Relax schema to allow missing arrays in early/mocked responses and default them
  const CurrentUserRelaxed = IamSchemas.CurrentUser.extend({
    roles: z.array(z.string()).default([]),
    permissions: z.array(z.string()).default([]),
  }).partial({ roles: true, permissions: true })
  const parsed = CurrentUserRelaxed.parse(res.data)
  const normalized: CurrentUserDto = {
    id: parsed.id,
    username: parsed.username,
    email: parsed.email ?? undefined,
    roles: parsed.roles ?? [],
    permissions: parsed.permissions ?? [],
  }
  return normalized
}
