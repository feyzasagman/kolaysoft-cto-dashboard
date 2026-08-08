import { createContext } from 'react'
import type { AuthUser, LoginResponse, RoleType } from '@/types/api'

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (response: LoginResponse) => void
  logout: () => void
  hasAnyRole: (...roles: RoleType[]) => boolean
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
