'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import type { AuthUser, UserRole } from '@/lib/types'
import { api, clearAuth, getStoredToken, getStoredUser } from '@/lib/api'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  logout: () => void
  register: (name: string, email: string, password: string, role: UserRole) => Promise<AuthUser>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const token = getStoredToken()
    if (!token) return
    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      try {
        const me = await api.me()
        if (!cancelled) setUser(me)
      } catch {
        clearAuth()
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const u = await api.login(email, password)
      setUser(u)
      return u
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    clearAuth()
  }, [])

  const register = useCallback(async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true)
    try {
      const u = await api.register(name, email, password, role)
      setUser(u)
      return u
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
