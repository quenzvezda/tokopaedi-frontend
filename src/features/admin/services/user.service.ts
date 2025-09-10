import http, { toApiError } from '@/shared/lib/fetcher'

import type { AdminUser } from '../types'

const usersBaseUrl = '/auth/api/v1/users'
const userRolesBaseUrl = '/iam/api/v1/users'

export async function listUsers(): Promise<AdminUser[]> {
  try {
    const res = await http.get<AdminUser[]>(usersBaseUrl)
    return res.data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function getUserRoles(accountId: string): Promise<string[]> {
  try {
    const res = await http.get<string[]>(`${userRolesBaseUrl}/${accountId}/roles`)
    return res.data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function assignRoleToUser(accountId: string, roleId: number): Promise<void> {
  try {
    await http.post(`/iam/api/v1/assign/user/${accountId}/role/${roleId}`)
  } catch (err) {
    throw toApiError(err)
  }
}

export async function removeRoleFromUser(accountId: string, roleId: number): Promise<void> {
  try {
    await http.delete(`/iam/api/v1/assign/user/${accountId}/role/${roleId}`)
  } catch (err) {
    throw toApiError(err)
  }
}
