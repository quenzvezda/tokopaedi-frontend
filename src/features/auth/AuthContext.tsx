import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { decodeJwtExp, decodeJwtPayload, extractRoles } from '@/lib/jwt'
import {
  setAccessTokenGetter,
  setAccessTokenSetter,
  setOnAuthLogout,
  triggerRefresh,
} from '@/shared/lib/fetcher'

import { AuthContext, type AuthContextValue } from './context'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessTokenState] = useState<string | null>(null)
  const [exp, setExp] = useState<number | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [roles, setRoles] = useState<string[]>([])
  const refreshTimer = useRef<number | null>(null)
  const bcRef = useRef<BroadcastChannel | null>(null)

  const clearTimer = () => {
    if (refreshTimer.current) {
      window.clearTimeout(refreshTimer.current)
      refreshTimer.current = null
    }
  }

  const scheduleRefresh = useCallback(
    (token: string | null) => {
      clearTimer()
      if (!token) return
      const nextExp = decodeJwtExp(token)
      setExp(nextExp)
      if (!nextExp) return
      const nowSec = Math.floor(Date.now() / 1000)
      const leadSeconds = 90 // refresh ~90s before exp
      const delayMs = Math.max((nextExp - nowSec - leadSeconds) * 1000, 5000)
      refreshTimer.current = window.setTimeout(() => {
        refresh()
      }, delayMs)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const broadcastToken = useCallback((token: string | null) => {
    if (!bcRef.current) return
    bcRef.current.postMessage({ type: 'tokenUpdated', token })
  }, [])

  const broadcastLogout = useCallback(() => {
    if (!bcRef.current) return
    bcRef.current.postMessage({ type: 'logout' })
  }, [])

  const setAccessToken = useCallback(
    (token: string | null) => {
      setAccessTokenState(token)
      const payload = token ? decodeJwtPayload<Record<string, unknown>>(token) : null
      setRoles(extractRoles(payload))
      scheduleRefresh(token)
      broadcastToken(token)
    },
    [broadcastToken, scheduleRefresh],
  )

  const refresh = useCallback(async () => {
    try {
      const t = await triggerRefresh()
      if (t) setAccessToken(t)
      return t
    } catch {
      // handled by http on failure
      return null
    }
  }, [setAccessToken])

  const logoutLocal = useCallback(() => {
    setAccessToken(null)
    setExp(null)
    broadcastLogout()
  }, [broadcastLogout, setAccessToken])

  // Hook http helpers into context
  useEffect(() => {
    setAccessTokenGetter(() => accessToken)
    setAccessTokenSetter((t) => setAccessToken(t))
    setOnAuthLogout(() => logoutLocal())
  }, [accessToken, logoutLocal, setAccessToken])

  // Setup BroadcastChannel listeners and initial refresh from cookie
  useEffect(() => {
    const bc = new BroadcastChannel('auth')
    bcRef.current = bc
    bc.onmessage = (ev) => {
      const data = ev.data as { type?: string; token?: string }
      if (data?.type === 'tokenUpdated') {
        const t = data.token ?? null
        setAccessTokenState(t)
        const payload = t ? decodeJwtPayload<Record<string, unknown>>(t) : null
        setRoles(extractRoles(payload))
        scheduleRefresh(t)
      } else if (data?.type === 'logout') {
        setAccessTokenState(null)
        setExp(null)
        setRoles([])
      }
    }

    // On mount, try to refresh using cookie to bootstrap access token
    ;(async () => {
      try {
        await refresh()
      } finally {
        setInitializing(false)
      }
    })()

    return () => {
      clearTimer()
      bc.close()
      bcRef.current = null
    }
  }, [refresh, scheduleRefresh])

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      exp,
      initializing,
      setAccessToken,
      refresh,
      logoutLocal,
      roles,
      isAuthenticated: !!accessToken,
    }),
    [accessToken, exp, initializing, refresh, setAccessToken, logoutLocal, roles],
  )

  if (import.meta.env.DEV) {
    ;(window as unknown as Record<string, unknown>).__setAccessToken = setAccessToken
    ;(window as unknown as Record<string, unknown>).__hasToken = !!accessToken
    ;(window as unknown as Record<string, unknown>).__authInitializing = initializing
    ;(window as unknown as Record<string, unknown>).__roles = roles
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// useAuth moved to separate file to satisfy react-refresh rule
