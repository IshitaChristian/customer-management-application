import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react'
import {
    getCurrentUser,
    login as loginRequest,
    logout as logoutRequest,
    type AuthenticatedUser,
} from './authService'
import { AUTHENTICATION_EXPIRED_EVENT } from './authEvents'

interface AuthContextValue {
    user: AuthenticatedUser | null
    isLoading: boolean
    login: (username: string, password: string) => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthenticatedUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let active = true
        getCurrentUser()
            .then((currentUser) => {
                if (active) setUser(currentUser)
            })
            .catch(() => {
                if (active) setUser(null)
            })
            .finally(() => {
                if (active) setIsLoading(false)
            })

        const handleExpiredAuthentication = () => {
            setUser(null)
            setIsLoading(false)
        }
        window.addEventListener(
            AUTHENTICATION_EXPIRED_EVENT,
            handleExpiredAuthentication,
        )

        return () => {
            active = false
            window.removeEventListener(
                AUTHENTICATION_EXPIRED_EVENT,
                handleExpiredAuthentication,
            )
        }
    }, [])

    const login = useCallback(async (username: string, password: string) => {
        await loginRequest(username, password)
        const currentUser = await getCurrentUser()
        setUser(currentUser)
    }, [])

    const logout = useCallback(async () => {
        try {
            await logoutRequest()
        } finally {
            setUser(null)
        }
    }, [])

    const value = useMemo(
        () => ({ user, isLoading, login, logout }),
        [user, isLoading, login, logout],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
