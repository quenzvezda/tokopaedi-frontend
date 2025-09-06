import { z } from 'zod'

import http from '@/shared/lib/fetcher'

// IAM Current User response schema
export const CurrentUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().optional(),
  roles: z.array(z.string()).default([]),
  permissions: z.array(z.string()).default([]),
})

export type CurrentUserDto = z.infer<typeof CurrentUserSchema>

export async function getCurrentUserService(): Promise<CurrentUserDto> {
  const res = await http.get<unknown>('/iam/api/v1/users/me')
  return CurrentUserSchema.parse(res.data)
}

