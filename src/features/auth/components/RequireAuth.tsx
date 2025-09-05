import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../useAuth'

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const location = useLocation()
  const { accessToken, initializing } = useAuth()
  if (initializing) return null
  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}
