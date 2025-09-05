import React from 'react'
import { useAuth } from './AuthContext'
import { Navigate, useLocation } from 'react-router-dom'

export function useHasRole(required: string | string[]): boolean {
  const { roles } = useAuth()
  const need = Array.isArray(required) ? required : [required]
  if (need.length === 0) return true
  const set = new Set(roles.map((r) => r.toUpperCase()))
  return need.some((r) => set.has(String(r).toUpperCase()))
}

export function HasRole({ roles, children }: { roles: string | string[]; children: React.ReactNode }) {
  const ok = useHasRole(roles)
  if (!ok) return null
  return <>{children}</>
}

export function RequireRoles({ roles, children }: { roles: string | string[]; children: JSX.Element }) {
  const ok = useHasRole(roles)
  const location = useLocation()
  if (!ok) {
    return <Navigate to="/403" state={{ from: location }} replace />
  }
  return children
}

