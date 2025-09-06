import { Navigate, useLocation } from 'react-router-dom'

import { useCurrentUser } from '../api/hooks'
import { useAuth } from '../useAuth'

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const location = useLocation()
  const { accessToken, initializing } = useAuth()
  // Trigger current user fetch when authenticated; decision still based on token presence
  useCurrentUser()
  if (initializing) return null
  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}
