import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useHasPermission } from './hooks/useHasPermission'
import { useHasRole } from './hooks/useHasRole'

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

export function HasPermission({ perm, children }: { perm: string | string[]; children: React.ReactNode }) {
  const ok = useHasPermission(perm)
  if (!ok) return null
  return <>{children}</>
}

export function RequirePermissions({ perm, children }: { perm: string | string[]; children: JSX.Element }) {
  const ok = useHasPermission(perm)
  const location = useLocation()
  if (!ok) {
    return <Navigate to="/403" state={{ from: location }} replace />
  }
  return children
}
