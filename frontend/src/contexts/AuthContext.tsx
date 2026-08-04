import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthUser, LoginResponse, RoleType } from '@/types/api'
import { tokenStorage } from '@/utils/tokenStorage'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (response: LoginResponse) => void
  logout: () => void
  hasAnyRole: (...roles: RoleType[]) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readStoredUser(): AuthUser | null {
  const token = tokenStorage.getToken()
  const user = tokenStorage.getUser<AuthUser>()
  if (!token || !user || tokenStorage.isExpired(0)) {
    if (tokenStorage.isExpired(0)) {
      tokenStorage.clear()
    }
    return null
  }
  return {
    userId: user.userId,
    fullName: user.fullName,
    email: user.email,
    role: user.role as RoleType,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())

  const login = useCallback((response: LoginResponse) => {
    const expiresAt = Date.now() + response.expiresIn * 1000
    const nextUser: AuthUser = {
      userId: response.userId,
      fullName: response.fullName,
      email: response.email,
      role: response.role,
    }
    tokenStorage.save({
      accessToken: response.accessToken,
      expiresAt,
      user: nextUser,
    })
    setUser(nextUser)
  }, [])

  const logout = useCallback(() => {
    tokenStorage.clear()
    setUser(null)
  }, [])

  const hasAnyRole = useCallback(
    (...roles: RoleType[]) => {
      if (!user) {
        return false
      }
      return roles.includes(user.role)
    },
    [user],
  )

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
      hasAnyRole,
    }),
    [user, login, logout, hasAnyRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
