import { Navigate, useLocation } from 'react-router-dom'
import tokenStorage from '../storage'

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const location = useLocation()
  if (!tokenStorage.access) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

