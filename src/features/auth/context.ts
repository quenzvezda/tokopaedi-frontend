import { createContext } from 'react'

export type AuthState = {
  accessToken: string | null
  exp: number | null
  initializing: boolean
  roles: string[]
}

export type AuthContextValue = AuthState & {
  setAccessToken: (token: string | null) => void
  refresh: () => Promise<string | null>
  logoutLocal: () => void
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

