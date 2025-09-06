import { useCurrentUser } from '../api/hooks'

export function useHasPermission(required: string | string[]): boolean {
  const { data } = useCurrentUser()
  const perms = data?.permissions || []
  const need = Array.isArray(required) ? required : [required]
  if (need.length === 0) return true
  const set = new Set(perms.map((p) => String(p).toLowerCase()))
  return need.some((p) => set.has(String(p).toLowerCase()))
}

export default useHasPermission

