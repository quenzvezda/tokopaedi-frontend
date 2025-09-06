import { useCurrentUser } from '../api/hooks'
import { useAuth } from '../useAuth'

export function useHasRole(required: string | string[]): boolean {
  const { roles: ctxRoles } = useAuth()
  const { data } = useCurrentUser()
  const roles = (data?.roles && data.roles.length > 0 ? data.roles : ctxRoles) || []
  const need = Array.isArray(required) ? required : [required]
  if (need.length === 0) return true
  const set = new Set(roles.map((r) => r.toUpperCase()))
  return need.some((r) => set.has(String(r).toUpperCase()))
}

export default useHasRole
