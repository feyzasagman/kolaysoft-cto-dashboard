const TOKEN_KEY = 'cto_access_token'
const USER_KEY = 'cto_auth_user'
const EXPIRES_AT_KEY = 'cto_token_expires_at'

export interface StoredAuthSession {
  accessToken: string
  expiresAt: number
  user: {
    userId: number
    fullName: string
    email: string
    role: string
  }
}

export const tokenStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  getUser<T = StoredAuthSession['user']>(): T | null {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) {
      return null
    }
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  },

  getExpiresAt(): number | null {
    const raw = localStorage.getItem(EXPIRES_AT_KEY)
    if (!raw) {
      return null
    }
    const value = Number(raw)
    return Number.isFinite(value) ? value : null
  },

  save(session: StoredAuthSession): void {
    localStorage.setItem(TOKEN_KEY, session.accessToken)
    localStorage.setItem(USER_KEY, JSON.stringify(session.user))
    localStorage.setItem(EXPIRES_AT_KEY, String(session.expiresAt))
  },

  clear(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(EXPIRES_AT_KEY)
  },

  isExpired(skewMs = 30_000): boolean {
    const expiresAt = this.getExpiresAt()
    if (!expiresAt) {
      return !this.getToken()
    }
    return Date.now() >= expiresAt - skewMs
  },
}
