import { createContext } from 'react'
import type { AuthenticatedUser } from '../../domains/auth/api/authService'

export interface AuthContextValue {
    user: AuthenticatedUser | null
    isLoading: boolean
    authError: string | null
    login: (username: string, password: string) => Promise<void>
    logout: () => Promise<void>
    retryAuthenticationCheck: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
